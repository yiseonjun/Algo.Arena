import { Router, type IRouter } from "express";
import {
  CreateBattleBody,
  CreateBattleResponse,
  GetBattleParams,
  GetBattleResponse,
  GetChallengeParams,
  GetChallengeResponse,
  JoinBattleBody,
  JoinBattleParams,
  JoinBattleResponse,
  ListChallengesResponse,
  SubmitCodeBody,
  SubmitCodeParams,
  SubmitCodeResponse,
} from "@workspace/api-zod";
import {
  applySubmission,
  claimSubmission,
  createBattle,
  getBattle,
  getBattleSession,
  getPlayer,
  joinBattle,
  releaseSubmission,
} from "../lib/battle-store";
import { broadcastBattleEvent } from "../lib/battle-ws";
import { judgePython } from "../lib/judge";
import { findChallenge, listChallenges } from "../lib/problems";

const router: IRouter = Router();

router.get("/challenges", (_req, res): void => {
  res.json(ListChallengesResponse.parse(listChallenges()));
});

router.get("/challenges/:challengeId", (req, res): void => {
  const params = GetChallengeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const challenge = findChallenge(params.data.challengeId);
  if (!challenge) {
    res.status(404).json({ error: "Challenge not found." });
    return;
  }
  res.json(GetChallengeResponse.parse(challenge));
});

router.post("/battles", (req, res): void => {
  const parsed = CreateBattleBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  if (!parsed.data.playerName.trim()) {
    res.status(400).json({
      error: "Player name cannot be blank.",
    });
    return;
  }
  const session = createBattle(parsed.data.challengeId, parsed.data.playerName);
  if (!session) {
    res.status(404).json({ error: "Challenge not found." });
    return;
  }
  res.status(201).json(CreateBattleResponse.parse(session));
});

router.post("/battles/:roomId/join", (req, res): void => {
  const params = JoinBattleParams.safeParse(req.params);
  const parsed = JoinBattleBody.safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  if (!parsed.data.playerName.trim()) {
    res.status(400).json({
      error: "Player name cannot be blank.",
    });
    return;
  }
  const session = joinBattle(params.data.roomId, parsed.data.playerName);
  if (!session) {
    res.status(409).json({ error: "This room is full or no longer joinable." });
    return;
  }
  broadcastBattleEvent(params.data.roomId, {
    type: "PLAYER_JOIN",
    playerId: session.playerId,
    battle: session.battle,
  });
  res.json(JoinBattleResponse.parse(session));
});

router.get("/battles/:roomId/players/:playerId", (req, res): void => {
  const params = GetBattleParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const session = getBattleSession(params.data.roomId, params.data.playerId);
  if (!session) {
    res.status(404).json({ error: "Battle or player not found." });
    return;
  }
  res.json(GetBattleResponse.parse(session));
});

router.post("/battles/:roomId/submissions", async (req, res): Promise<void> => {
  const params = SubmitCodeParams.safeParse(req.params);
  const parsed = SubmitCodeBody.safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { roomId } = params.data;
  const { playerId, code, mode } = parsed.data;
  const battle = getBattle(roomId);
  if (!battle) {
    res.status(404).json({ error: "Battle not found." });
    return;
  }
  if (!getPlayer(roomId, playerId)) {
    res.status(404).json({ error: "Player not found in this battle." });
    return;
  }
  if (battle.status !== "ACTIVE") {
    res.status(409).json({ error: "The battle is not active." });
    return;
  }
  if (!claimSubmission(roomId, playerId)) {
    res.status(409).json({ error: "A submission is already being judged." });
    return;
  }

  try {
    const challenge = findChallenge(battle.challengeId);
    if (!challenge) {
      res.status(404).json({ error: "Challenge not found." });
      return;
    }

    broadcastBattleEvent(roomId, {
      type: "CODE_SUBMITTED",
      playerId,
      mode,
    });

    const judged = await judgePython(challenge, code, mode === "SUBMIT");
    const applied = applySubmission({
      roomId,
      playerId,
      verdict: judged.verdict,
      mode,
    });
    if (!applied) {
      res.status(409).json({ error: "The battle ended while the code was being judged." });
      return;
    }

    const result = SubmitCodeResponse.parse({
      ...judged,
      damageDealt: applied.damageDealt,
      pointsAwarded: applied.pointsAwarded,
      battle: applied.battle,
    });
    broadcastBattleEvent(roomId, {
      type: "SUBMISSION_RESULT",
      playerId,
      mode,
      result,
      battle: applied.battle,
    });
    if (applied.damageDealt > 0) {
      broadcastBattleEvent(roomId, {
        type: "ATTACK_EVENT",
        attackerId: playerId,
        defenderId: applied.battle.players.find((player) => player.id !== playerId)?.id,
        damageDealt: applied.damageDealt,
        pointsAwarded: applied.pointsAwarded,
        battle: applied.battle,
      });
    }
    if (applied.gameOver) {
      broadcastBattleEvent(roomId, {
        type: "GAME_OVER",
        battle: applied.battle,
      });
    }
    res.json(result);
  } finally {
    releaseSubmission(roomId, playerId);
  }
});

export default router;
