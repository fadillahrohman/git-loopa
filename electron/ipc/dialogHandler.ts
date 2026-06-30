import { ipcMain, dialog, BrowserWindow } from "electron";
import { IPC_CHANNELS } from "../../src/shared/ipcTypes";

export function registerDialogHandlers() {
  ipcMain.handle(IPC_CHANNELS.SELECT_FOLDER, async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory"],
    });
    return result.canceled ? null : result.filePaths[0];
  });

  ipcMain.handle("dialog:confirm", async (event, message: string) => {
  const win = BrowserWindow.fromWebContents(event.sender)!;
  const { response } = await dialog.showMessageBox(win, {
    type: "question",
    buttons: ["Cancel", "Yes"],
    defaultId: 1,
    cancelId: 0,
    message,
  });
  return response === 1; // true = Yes
});
}
