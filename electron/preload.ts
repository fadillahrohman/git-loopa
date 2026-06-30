import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  commitWithDate: (payload: unknown) => ipcRenderer.invoke('git:commit', payload),
  push:           (payload: unknown) => ipcRenderer.invoke('git:push', payload),
  getStatus:      (payload: unknown) => ipcRenderer.invoke('git:status', payload),
  stage:          (payload: unknown) => ipcRenderer.invoke('git:stage', payload),
  unstage:        (payload: unknown) => ipcRenderer.invoke('git:unstage', payload),
  unstageAll:     (payload: unknown) => ipcRenderer.invoke('git:unstageAll', payload),
  getBranch:      (payload: unknown) => ipcRenderer.invoke('git:branch', payload),
  selectFolder:   ()                 => ipcRenderer.invoke('dialog:selectFolder'),
  focusWindow:    ()                 => ipcRenderer.send("focus-window"),
  confirm: (message: string) => ipcRenderer.invoke("dialog:confirm", message),
});