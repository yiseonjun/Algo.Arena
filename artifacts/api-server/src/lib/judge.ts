import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import type { Challenge, SubmissionResult } from "@workspace/api-zod";
import { getTestCases } from "./problems";
import { logger } from "./logger";

const RUN_TIMEOUT_MS = 2_500;
const MAX_STDOUT_CHARS = 16_000;
const RUNNER_PATH = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "judge_runner.py",
);

interface RunnerResponse {
  verdict: SubmissionResult["verdict"];
  passed: number;
  total: number;
  output: string | null;
  message: string;
}

export async function judgePython(
  challenge: Challenge,
  code: string,
  includeHidden: boolean,
): Promise<
  Pick<
    SubmissionResult,
    "verdict" | "passed" | "total" | "runtimeMs" | "message" | "output"
  >
> {
  const cases = getTestCases(challenge.id, includeHidden);
  if (!cases.length) {
    return {
      verdict: "CE",
      passed: 0,
      total: 0,
      runtimeMs: 0,
      message: "This challenge has no test suite configured.",
      output: null,
    };
  }

  const workspace = await mkdtemp(path.join(tmpdir(), "algoarena-"));
  const startedAt = performance.now();
  try {
    const response = await runIsolated({
      workspace,
      payload: {
        code,
        functionName: challenge.functionName,
        cases,
      },
    });
    return {
      ...response,
      runtimeMs: Math.max(1, Math.round(performance.now() - startedAt)),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "The judge could not start.";
    const verdict: SubmissionResult["verdict"] = message.includes("timed out")
      ? "TLE"
      : message.includes("memory limit")
        ? "MLE"
        : "RE";
    logger.warn(
      { error: message, challengeId: challenge.id },
      "Python judge execution failed",
    );
    return {
      verdict,
      passed: 0,
      total: cases.length,
      runtimeMs: Math.max(1, Math.round(performance.now() - startedAt)),
      message:
        verdict === "TLE"
          ? "Time limit exceeded. Check for loops that never finish."
          : verdict === "MLE"
            ? "Memory limit exceeded."
            : "The Python runner could not execute this solution.",
      output: null,
    };
  } finally {
    await rm(workspace, { recursive: true, force: true });
  }
}

interface RunInput {
  workspace: string;
  payload: {
    code: string;
    functionName: string;
    cases: ReturnType<typeof getTestCases>;
  };
}

function runIsolated({ workspace, payload }: RunInput): Promise<RunnerResponse> {
  return new Promise((resolve, reject) => {
    const python = spawn("python3", ["-I", "-S", RUNNER_PATH], {
      cwd: workspace,
      env: {
        PATH: process.env.PATH ?? "/usr/bin:/bin",
        HOME: workspace,
        TMPDIR: workspace,
        PYTHONHASHSEED: "0",
      },
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    let settled = false;

    const settle = (action: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      action();
    };

    const timer = setTimeout(() => {
      python.kill("SIGKILL");
      settle(() => reject(new Error("Python execution timed out.")));
    }, RUN_TIMEOUT_MS);

    python.stdout.setEncoding("utf8");
    python.stderr.setEncoding("utf8");
    python.stdout.on("data", (chunk: string) => {
      stdout += chunk;
      if (stdout.length > MAX_STDOUT_CHARS) {
        python.kill("SIGKILL");
        settle(() => reject(new Error("Judge output exceeded the memory limit.")));
      }
    });
    python.stderr.on("data", (chunk: string) => {
      stderr = (stderr + chunk).slice(-4_000);
    });
    python.on("error", (error) => settle(() => reject(error)));
    python.on("close", (exitCode, signal) => {
      if (settled) return;
      if (signal === "SIGKILL" || signal === "SIGXCPU") {
        settle(() => reject(new Error("Python execution timed out.")));
        return;
      }
      if (exitCode !== 0) {
        settle(() => reject(new Error(stderr || `Python exited with code ${exitCode}.`)));
        return;
      }
      try {
        const result = JSON.parse(stdout) as RunnerResponse;
        settle(() => resolve(result));
      } catch {
        settle(() => reject(new Error("The judge returned an invalid response.")));
      }
    });

    python.stdin.end(JSON.stringify(payload));
  });
}
