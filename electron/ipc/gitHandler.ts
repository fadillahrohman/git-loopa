import { ipcMain } from "electron";
import { spawnSync } from "child_process";
import {
  IPC_CHANNELS,
  CommitPayload,
  CommitResult,
  PushPayload,
  StatusPayload,
  StagePayload,
  UnstagePayload,
  GitFile,
} from "../../src/shared/ipcTypes";

function normalizePath(p: string): string {
  return p.replace(/\\/g, "/").replace(/^"|"$/g, "").trim();
}

function execGit(args: string[], cwd: string, env?: NodeJS.ProcessEnv): string {
  const result = spawnSync("git", args, {
    cwd,
    env: env ?? process.env,
    stdio: "pipe",
    encoding: "utf-8",
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(
      result.stderr || result.stdout || `Git command failed with code ${result.status}`
    );
  }

  // stdout for other commands, stderr for push
  return ((result.stdout || "") + (result.stderr || "")).replace(/\r?\n$/, "");
}

export function registerGitHandlers() {
  // Commit
  ipcMain.handle(
    IPC_CHANNELS.GIT_COMMIT,
    async (_, payload: CommitPayload): Promise<CommitResult> => {
      try {
        const env = {
          ...process.env,
          GIT_AUTHOR_DATE: payload.date,
          GIT_COMMITTER_DATE: payload.date,
        };
        const output = execGit(
          ["commit", "-m", payload.message],
          payload.repoPath,
          env,
        );
        return { success: true, output };
      } catch (err) {
        return {
          success: false,
          error: String(err instanceof Error ? err.message : err),
        };
      }
    },
  );

  // Push
  ipcMain.handle(
    IPC_CHANNELS.GIT_PUSH,
    async (_, payload: PushPayload): Promise<CommitResult> => {
      try {
        const result = spawnSync("git", ["push"], {
          cwd: payload.repoPath,
          env: process.env,
          stdio: "pipe",
          encoding: "utf-8",
        });

        if (result.error) throw result.error;
        if (result.status !== 0) {
          throw new Error(result.stderr || result.stdout || "Push failed");
        }

        const output = (
          result.stdout ||
          result.stderr ||
          "Push successful."
        ).trim();
        return { success: true, output };
      } catch (err) {
        return {
          success: false,
          error: String(err instanceof Error ? err.message : err),
        };
      }
    },
  );

  // Status
  ipcMain.handle(
    IPC_CHANNELS.GIT_STATUS,
    async (_, payload: StatusPayload): Promise<GitFile[]> => {
      try {
        const raw = execGit(["status", "--porcelain=v1"], payload.repoPath);
        if (!raw) return [];

        const lines = raw.split("\n").filter((line) => {
          if (line.length < 3) return false;

          const first = line[0];
          const second = line[1];

          // Valid status codes: space, M, A, D, R, C, U, ?
          const validCodes = [" ", "M", "A", "D", "R", "C", "U", "?"];

          // Both XY must be valid status codes
          return validCodes.includes(first) && validCodes.includes(second);
        });

        return lines
          .map((line): GitFile | null => {
            const x = line[0];
            const y = line[1];

            let rawPath = line.slice(2).trim().replace(/^"|"$/g, "");

            if (rawPath.includes(" -> ")) {
              const parts = rawPath.split(" -> ");
              rawPath = parts[parts.length - 1].trim().replace(/^"|"$/g, "");
            }

            if (!rawPath) return null;

            // X != " " means something is staged
            const staged = x !== " " && x !== "?";

            // Use X for staged, Y for unstaged
            const status = staged ? x : y !== " " ? y : "?";

            return {
              path: normalizePath(rawPath),
              status: status as GitFile["status"],
              staged,
            };
          })
          .filter((item): item is GitFile => item !== null);
      } catch (err) {
        console.error("DEBUG: git status error:", err);
        return [];
      }
    },
  );

  // Stage
  ipcMain.handle(
    IPC_CHANNELS.GIT_STAGE,
    async (_, payload: StagePayload): Promise<CommitResult> => {
      try {
        const args = ["add"];
        if (payload.files.length > 0) {
          args.push(...payload.files.map((f) => normalizePath(f)));
        } else {
          args.push(".");
        }
        execGit(args, payload.repoPath);
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: String(err instanceof Error ? err.message : err),
        };
      }
    },
  );

  // Unstage
  ipcMain.handle(
    IPC_CHANNELS.GIT_UNSTAGE,
    async (_, payload: UnstagePayload): Promise<CommitResult> => {
      try {
        if (!payload.files || payload.files.length === 0) {
          return { success: true };
        }

        const files = payload.files.map((f) => normalizePath(f));

        try {
          execGit(["restore", "--staged", ...files], payload.repoPath);
        } catch {
          // Fallback for older git versions
          execGit(["reset", "HEAD", "--", ...files], payload.repoPath);
        }

        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: String(err instanceof Error ? err.message : err),
        };
      }
    },
  );

  // Unstage All
  ipcMain.handle(
    IPC_CHANNELS.GIT_UNSTAGE_ALL,
    async (_, payload: StatusPayload): Promise<CommitResult> => {
      try {
        try {
          execGit(["restore", "--staged", "."], payload.repoPath);
        } catch {
          execGit(["reset", "HEAD", "."], payload.repoPath);
        }
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: String(err instanceof Error ? err.message : err),
        };
      }
    },
  );

  // Branch
  ipcMain.handle(
    IPC_CHANNELS.GIT_BRANCH,
    async (_, payload: StatusPayload): Promise<string> => {
      try {
        return execGit(["branch", "--show-current"], payload.repoPath);
      } catch {
        return "unknown";
      }
    },
  );
}
