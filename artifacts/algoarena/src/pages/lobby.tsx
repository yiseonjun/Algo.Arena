import { useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowDownRight, ArrowRight, Code2, Crosshair, LoaderCircle, Radio, Swords, Users } from 'lucide-react';
import { getHealthCheckQueryKey, useCreateBattle, useHealthCheck, useJoinBattle, useListChallenges } from '@workspace/api-client-react';
import type { Challenge } from '@workspace/api-client-react';

const difficultyStyle: Record<string, string> = {
  BRONZE: 'text-[#f2a56f] border-[#f2a56f]/25 bg-[#f2a56f]/[.08]',
  SILVER: 'text-[#bdc8dd] border-[#bdc8dd]/25 bg-[#bdc8dd]/[.08]',
  GOLD: 'text-[#f2cb69] border-[#f2cb69]/25 bg-[#f2cb69]/[.08]',
};

export default function Lobby() {
  const [, setLocation] = useLocation();
  const [selectedId, setSelectedId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [formError, setFormError] = useState('');
  const { data: challenges, isLoading, isError, refetch } = useListChallenges();
  const health = useHealthCheck({ query: { queryKey: getHealthCheckQueryKey(), refetchInterval: 30000 } });
  const createBattle = useCreateBattle();
  const joinBattle = useJoinBattle();
  const selected = challenges?.find((challenge) => challenge.id === selectedId) ?? challenges?.[0];

  const enterMatch = (session: { playerId: string; battle: { roomId: string } }) => {
    sessionStorage.setItem('algoarena-player-id', session.playerId);
    setLocation(`/battle/${encodeURIComponent(session.battle.roomId)}`);
  };

  const createRoom = () => {
    const name = playerName.trim();
    if (!name) return setFormError('Add a player name to enter the arena.');
    if (!selected) return setFormError('Choose a challenge before creating a room.');
    setFormError('');
    createBattle.mutate({ data: { challengeId: selected.id, playerName: name } }, {
      onSuccess: enterMatch,
      onError: (error) => setFormError(error instanceof Error ? error.message : 'Room creation failed. Try again.'),
    });
  };

  const joinRoom = () => {
    const name = playerName.trim();
    const code = roomCode.trim();
    if (!name || !code) return setFormError('Enter your name and the room code.');
    setFormError('');
    joinBattle.mutate({ roomId: code, data: { playerName: name } }, {
      onSuccess: enterMatch,
      onError: (error) => setFormError(error instanceof Error ? error.message : 'Could not join that room. Check the code.'),
    });
  };

  const busy = createBattle.isPending || joinBattle.isPending;

  return (
    <main className="noise arena-grid min-h-[100dvh] overflow-hidden">
      <div className="relative mx-auto max-w-[1440px] px-5 pb-20 pt-6 md:px-10">
        <header className="entrance flex items-center justify-between border-b border-white/[.08] pb-5">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl border border-blue-400/30 bg-blue-500/10 text-blue-300"><Crosshair size={19} /></div>
            <div>
              <div className="text-[15px] font-bold tracking-[.13em] text-slate-100">ALGO<span className="text-blue-400">ARENA</span></div>
              <div className="mono mt-0.5 text-[9px] tracking-[.21em] text-slate-500">REAL-TIME CODE COMBAT</div>
            </div>
          </div>
          <div className="mono flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-400" data-testid="status-api">
            <span className={`h-1.5 w-1.5 rounded-full ${health.data?.status ? 'bg-emerald-400' : health.isError ? 'bg-red-400' : 'bg-amber-400 pulse-dot'}`} />
            {health.isLoading ? 'Connecting' : health.isError ? 'Service unavailable' : 'Arena online'}
          </div>
        </header>

        <section className="entrance relative grid gap-12 pb-12 pt-12 md:grid-cols-[1.05fr_.95fr] md:items-end md:pb-16 md:pt-[74px]">
          <div className="pointer-events-none absolute right-0 top-8 hidden h-[340px] w-[440px] opacity-80 md:block" aria-hidden="true">
            <div className="absolute right-10 top-8 h-60 w-60 rounded-full border border-blue-400/15" />
            <div className="absolute right-[74px] top-[72px] h-44 w-44 rounded-full border border-purple-400/20" />
            <div className="absolute right-[118px] top-[116px] h-24 w-24 rounded-full bg-blue-500/[.07] ring-1 ring-blue-300/30" />
            <div className="absolute right-[154px] top-[152px] h-4 w-4 rounded-full bg-blue-400 shadow-[0_0_24px_5px_rgba(59,130,246,.35)]" />
            <div className="absolute right-[7px] top-[165px] h-px w-[350px] rotate-[-31deg] bg-gradient-to-r from-transparent via-blue-400/35 to-transparent" />
            <div className="absolute right-0 top-[265px] mono text-[9px] tracking-[.2em] text-slate-600">LIVE MATCH GRID / 01</div>
          </div>
          <div className="relative max-w-[680px]">
            <div className="mono mb-5 flex items-center gap-2 text-[10px] uppercase tracking-[.22em] text-blue-300"><span className="h-px w-7 bg-blue-400" />Challenge the clock. Challenge each other.</div>
            <h1 className="text-[clamp(3.6rem,9vw,7.7rem)] font-bold leading-[.84] tracking-[-.085em] text-slate-100">Think fast.<br /><span className="text-blue-400">Strike</span> first.</h1>
            <p className="mt-7 max-w-[420px] text-sm leading-6 text-slate-400">Two minds. One Python problem. Every clean solve hits harder. Step into a live algorithm duel.</p>
            <div className="mono mt-8 flex items-center gap-5 text-[10px] uppercase tracking-[.1em] text-slate-500">
              <span className="flex items-center gap-2"><Swords size={13} className="text-purple-400" /> 1v1 duels</span>
              <span className="flex items-center gap-2"><Radio size={13} className="text-blue-400" /> Live attacks</span>
              <span className="flex items-center gap-2"><Code2 size={13} className="text-emerald-400" /> Python</span>
            </div>
          </div>

          <div className="relative rounded-2xl border border-white/[.09] bg-[#111622]/90 p-5 shadow-2xl shadow-black/20 backdrop-blur md:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div><div className="mono text-[9px] uppercase tracking-[.2em] text-blue-300">Your contender profile</div><h2 className="mt-1 text-xl font-semibold text-slate-100">Enter the arena</h2></div>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-purple-500/10 text-purple-300"><Users size={18} /></div>
            </div>
            <label className="mono mb-2 block text-[10px] uppercase tracking-[.13em] text-slate-500" htmlFor="player-name">Player name</label>
            <input id="player-name" data-testid="input-player-name" value={playerName} maxLength={24} onChange={(event) => setPlayerName(event.target.value)} placeholder="How should rivals know you?" className="h-11 w-full rounded-lg border border-white/10 bg-[#0b0e17] px-3 text-sm text-slate-100 outline-none transition focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/10 placeholder:text-slate-600" />
            <div className="my-5 h-px bg-white/[.07]" />
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <div>
                <label className="mono mb-2 block text-[10px] uppercase tracking-[.13em] text-slate-500" htmlFor="room-code">Join by room code</label>
                <input id="room-code" data-testid="input-room-code" value={roomCode} onChange={(event) => setRoomCode(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && joinRoom()} placeholder="ROOM CODE" className="mono h-11 w-full rounded-lg border border-white/10 bg-[#0b0e17] px-3 text-xs uppercase tracking-[.16em] text-slate-100 outline-none transition focus:border-purple-400/60 focus:ring-2 focus:ring-purple-500/10 placeholder:text-slate-600" />
              </div>
              <button data-testid="button-join-room" onClick={joinRoom} disabled={busy} className="mt-auto flex h-11 items-center justify-center gap-2 rounded-lg border border-purple-400/35 bg-purple-500/[.11] px-4 text-xs font-semibold text-purple-200 transition hover:bg-purple-500/20 disabled:cursor-wait disabled:opacity-50">{joinBattle.isPending ? <LoaderCircle size={14} className="animate-spin" /> : <ArrowRight size={14} />} Join room</button>
            </div>
            {formError && <p data-testid="text-form-error" className="mt-3 text-xs text-red-300">{formError}</p>}
          </div>
        </section>

        <section className="entrance-delay border-t border-white/[.08] pt-7">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div><div className="mono flex items-center gap-2 text-[9px] uppercase tracking-[.21em] text-purple-300"><span className="h-px w-5 bg-purple-400" />Battle queue</div><h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-100">Pick your problem</h2><p className="mt-1 text-xs text-slate-500">Choose a challenge to create a room. Your rival gets the same problem.</p></div>
            {selected && <div className="mono rounded-md border border-white/[.08] bg-white/[.025] px-3 py-2 text-[10px] text-slate-400">SELECTED <span className="ml-2 text-slate-200">{selected.points} PTS</span></div>}
          </div>
          {isLoading ? <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{[0,1,2].map((item) => <div key={item} className="h-[154px] animate-pulse rounded-xl border border-white/[.06] bg-white/[.025]" />)}</div> :
          isError ? <div className="flex flex-col items-start gap-3 rounded-xl border border-red-400/20 bg-red-500/[.04] p-6"><p className="text-sm text-slate-300">Challenges could not load from the arena.</p><button data-testid="button-retry-challenges" onClick={() => refetch()} className="rounded-lg border border-red-300/20 px-3 py-2 text-xs text-red-200 hover:bg-red-400/10">Retry challenge feed</button></div> :
          !challenges?.length ? <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-500">No challenges are in the queue yet.</div> :
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{challenges.map((challenge) => <ChallengeCard key={challenge.id} challenge={challenge} selected={challenge.id === (selected?.id ?? selectedId)} onSelect={() => setSelectedId(challenge.id)} />)}</div>}
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button data-testid="button-create-room" onClick={createRoom} disabled={busy || !selected} className="flex h-12 items-center justify-center gap-3 rounded-lg bg-blue-500 px-6 text-sm font-bold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-45">
              {createBattle.isPending ? <LoaderCircle size={16} className="animate-spin" /> : <Swords size={16} />}
              {createBattle.isPending ? 'Opening arena…' : 'Create battle room'} <ArrowDownRight size={15} className="opacity-70" />
            </button>
            <span className="mono text-[9px] uppercase tracking-[.12em] text-slate-600">Room code generated when the battle opens</span>
          </div>
        </section>
        <footer className="mono mt-12 flex items-center justify-between border-t border-white/[.07] pt-4 text-[9px] uppercase tracking-[.15em] text-slate-600"><span>ALGOARENA / DUEL PROTOCOL 01</span><span>Think under pressure</span></footer>
      </div>
    </main>
  );
}

function ChallengeCard({ challenge, selected, onSelect }: { challenge: Challenge; selected: boolean; onSelect: () => void }) {
  return <button data-testid={`card-challenge-${challenge.id}`} onClick={onSelect} className={`group relative min-h-[150px] rounded-xl border p-4 text-left transition duration-200 ${selected ? 'border-blue-400/45 bg-blue-500/[.075] shadow-[inset_0_0_0_1px_rgba(59,130,246,.08)]' : 'border-white/[.08] bg-[#101520]/80 hover:border-white/20 hover:bg-[#141a28]'}`}>
    <div className="flex items-center justify-between"><span className={`mono rounded border px-2 py-1 text-[9px] tracking-[.12em] ${difficultyStyle[challenge.difficulty] ?? 'text-slate-300 border-white/10'}`}>{challenge.difficulty}</span><span className="mono text-[10px] text-slate-500">{challenge.points} PTS</span></div>
    <h3 className="mt-4 text-base font-semibold text-slate-100">{challenge.title}</h3>
    <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{challenge.summary}</p>
    <div className="mt-3 flex items-center justify-between"><span className="mono text-[9px] uppercase tracking-[.12em] text-slate-600">Python / duel format</span><span className={`h-2 w-2 rounded-full ${selected ? 'bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,.8)]' : 'bg-slate-700'}`} /></div>
  </button>;
}
