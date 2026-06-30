"use strict";
const electron = require("electron");
const path = require("path");
const child_process = require("child_process");
const IPC_CHANNELS = {
  GIT_COMMIT: "git:commit",
  GIT_PUSH: "git:push",
  GIT_STATUS: "git:status",
  GIT_STAGE: "git:stage",
  GIT_UNSTAGE: "git:unstage",
  GIT_UNSTAGE_ALL: "git:unstageAll",
  GIT_BRANCH: "git:branch",
  SELECT_FOLDER: "dialog:selectFolder"
};
function normalizePath(p) {
  return p.replace(/\\/g, "/").replace(/^"|"$/g, "").trim();
}
function execGit(args, cwd, env) {
  const result = child_process.spawnSync("git", args, {
    cwd,
    env: env ?? process.env,
    stdio: "pipe",
    encoding: "utf-8"
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(
      result.stderr || result.stdout || `Git command failed with code ${result.status}`
    );
  }
  return ((result.stdout || "") + (result.stderr || "")).replace(/\r?\n$/, "");
}
function registerGitHandlers() {
  electron.ipcMain.handle(
    IPC_CHANNELS.GIT_COMMIT,
    async (_, payload) => {
      try {
        const env = {
          ...process.env,
          GIT_AUTHOR_DATE: payload.date,
          GIT_COMMITTER_DATE: payload.date
        };
        const output = execGit(
          ["commit", "-m", payload.message],
          payload.repoPath,
          env
        );
        return { success: true, output };
      } catch (err) {
        return {
          success: false,
          error: String(err instanceof Error ? err.message : err)
        };
      }
    }
  );
  electron.ipcMain.handle(
    IPC_CHANNELS.GIT_PUSH,
    async (_, payload) => {
      try {
        const result = child_process.spawnSync("git", ["push"], {
          cwd: payload.repoPath,
          env: process.env,
          stdio: "pipe",
          encoding: "utf-8"
        });
        if (result.error) throw result.error;
        if (result.status !== 0) {
          throw new Error(result.stderr || result.stdout || "Push failed");
        }
        const output = (result.stdout || result.stderr || "Push successful.").trim();
        return { success: true, output };
      } catch (err) {
        return {
          success: false,
          error: String(err instanceof Error ? err.message : err)
        };
      }
    }
  );
  electron.ipcMain.handle(
    IPC_CHANNELS.GIT_STATUS,
    async (_, payload) => {
      try {
        const raw = execGit(["status", "--porcelain=v1"], payload.repoPath);
        if (!raw) return [];
        const lines = raw.split("\n").filter((line) => {
          if (line.length < 3) return false;
          const first = line[0];
          const second = line[1];
          const validCodes = [" ", "M", "A", "D", "R", "C", "U", "?"];
          return validCodes.includes(first) && validCodes.includes(second);
        });
        return lines.map((line) => {
          const x = line[0];
          const y = line[1];
          let rawPath = line.slice(2).trim().replace(/^"|"$/g, "");
          if (rawPath.includes(" -> ")) {
            const parts = rawPath.split(" -> ");
            rawPath = parts[parts.length - 1].trim().replace(/^"|"$/g, "");
          }
          if (!rawPath) return null;
          const staged = x !== " " && x !== "?";
          const status = staged ? x : y !== " " ? y : "?";
          return {
            path: normalizePath(rawPath),
            status,
            staged
          };
        }).filter((item) => item !== null);
      } catch (err) {
        console.error("DEBUG: git status error:", err);
        return [];
      }
    }
  );
  electron.ipcMain.handle(
    IPC_CHANNELS.GIT_STAGE,
    async (_, payload) => {
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
          error: String(err instanceof Error ? err.message : err)
        };
      }
    }
  );
  electron.ipcMain.handle(
    IPC_CHANNELS.GIT_UNSTAGE,
    async (_, payload) => {
      try {
        if (!payload.files || payload.files.length === 0) {
          return { success: true };
        }
        const files = payload.files.map((f) => normalizePath(f));
        try {
          execGit(["restore", "--staged", ...files], payload.repoPath);
        } catch {
          execGit(["reset", "HEAD", "--", ...files], payload.repoPath);
        }
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: String(err instanceof Error ? err.message : err)
        };
      }
    }
  );
  electron.ipcMain.handle(
    IPC_CHANNELS.GIT_UNSTAGE_ALL,
    async (_, payload) => {
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
          error: String(err instanceof Error ? err.message : err)
        };
      }
    }
  );
  electron.ipcMain.handle(
    IPC_CHANNELS.GIT_BRANCH,
    async (_, payload) => {
      try {
        return execGit(["branch", "--show-current"], payload.repoPath);
      } catch {
        return "unknown";
      }
    }
  );
}
function registerDialogHandlers() {
  electron.ipcMain.handle(IPC_CHANNELS.SELECT_FOLDER, async () => {
    const result = await electron.dialog.showOpenDialog({
      properties: ["openDirectory"]
    });
    return result.canceled ? null : result.filePaths[0];
  });
  electron.ipcMain.handle("dialog:confirm", async (event, message) => {
    const win = electron.BrowserWindow.fromWebContents(event.sender);
    const { response } = await electron.dialog.showMessageBox(win, {
      type: "question",
      buttons: ["Cancel", "Yes"],
      defaultId: 1,
      cancelId: 0,
      message
    });
    return response === 1;
  });
}
let mainWindow;
function createWindow() {
  mainWindow = new electron.BrowserWindow({
    width: 520,
    height: 600,
    icon: path.join(__dirname, "../src/assets/logo/loopa.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }
  electron.ipcMain.on("focus-window", () => {
    mainWindow.focus();
  });
}
electron.app.whenReady().then(() => {
  registerGitHandlers();
  registerDialogHandlers();
  createWindow();
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") electron.app.quit();
});
