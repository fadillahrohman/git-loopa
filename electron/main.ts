import { app, BrowserWindow, ipcMain } from "electron";
import { join } from "path";
import { registerGitHandlers } from "./ipc/gitHandler";
import { registerDialogHandlers } from "./ipc/dialogHandler";

let mainWindow: BrowserWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 520,
    height: 600,
    icon: join(__dirname, "../src/assets/logo/loopa.png"),
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(join(__dirname, "../dist/index.html"));
  }

  ipcMain.on("focus-window", () => {
    mainWindow.focus();
  });
}

app.whenReady().then(() => {
  registerGitHandlers();
  registerDialogHandlers();
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});