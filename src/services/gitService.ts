import type {
  CommitPayload, PushPayload, StatusPayload, StagePayload, UnstagePayload,
} from '../shared/ipcTypes';

export const gitService = {
  commit:    (p: CommitPayload)   => window.electronAPI.commitWithDate(p),
  push:      (p: PushPayload)     => window.electronAPI.push(p),
  getStatus: (p: StatusPayload)   => window.electronAPI.getStatus(p),
  stage:     (p: StagePayload)    => window.electronAPI.stage(p),
  unstage:   (p: UnstagePayload)  => window.electronAPI.unstage(p),
  unstageAll: (p: StatusPayload)  => window.electronAPI.unstageAll(p),
  getBranch: (p: StatusPayload)   => window.electronAPI.getBranch(p),
  selectFolder: ()                => window.electronAPI.selectFolder(),
};