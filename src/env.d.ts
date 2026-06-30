import type { CommitPayload, CommitResult, GitFile, PushPayload, StatusPayload, StagePayload, UnstagePayload } from './shared/ipcTypes';

declare global {
  interface Window {
    electronAPI: {
      commitWithDate: (payload: CommitPayload)    => Promise<CommitResult>;
      push:           (payload: PushPayload)      => Promise<CommitResult>;
      getStatus:      (payload: StatusPayload)    => Promise<GitFile[]>;
      stage:          (payload: StagePayload)     => Promise<CommitResult>;
      unstage:        (payload: UnstagePayload)   => Promise<CommitResult>;
      unstageAll:     (payload: StatusPayload)    => Promise<CommitResult>;
      getBranch:      (payload: StatusPayload)    => Promise<string>;
      selectFolder:   ()                          => Promise<string | null>;
      focusWindow:    ()                          => void;
      confirm:        (message: string)           => Promise<boolean>;
    };
    ipcRenderer: {
      on: (channel: string, callback: (data: unknown) => void) => void;
      send: (channel: string, data: unknown) => void;
    };
  }
}

export {};