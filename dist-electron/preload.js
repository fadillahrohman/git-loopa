"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  commitWithDate: (payload) => electron.ipcRenderer.invoke("git:commit", payload),
  push: (payload) => electron.ipcRenderer.invoke("git:push", payload),
  getStatus: (payload) => electron.ipcRenderer.invoke("git:status", payload),
  stage: (payload) => electron.ipcRenderer.invoke("git:stage", payload),
  unstage: (payload) => electron.ipcRenderer.invoke("git:unstage", payload),
  unstageAll: (payload) => electron.ipcRenderer.invoke("git:unstageAll", payload),
  getBranch: (payload) => electron.ipcRenderer.invoke("git:branch", payload),
  selectFolder: () => electron.ipcRenderer.invoke("dialog:selectFolder"),
  focusWindow: () => electron.ipcRenderer.send("focus-window"),
  confirm: (message) => electron.ipcRenderer.invoke("dialog:confirm", message)
});
