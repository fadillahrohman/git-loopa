export interface CommitPayload {
  repoPath: string;
  message: string;
  date: string;
}

export interface PushPayload {
  repoPath: string;
}

export interface StatusPayload {
  repoPath: string;
}

export interface StagePayload {
  repoPath: string;
  files: string[]; 
}

export interface UnstagePayload {
  repoPath: string;
  files: string[];
}

export interface GitFile {
  path: string;
  status: 'M' | 'A' | 'D' | 'R' | '?' | 'MM';
  staged: boolean;
}

export interface CommitResult {
  success: boolean;
  output?: string;
  error?: string;
}

export const IPC_CHANNELS = {
  GIT_COMMIT:       'git:commit',
  GIT_PUSH:         'git:push',
  GIT_STATUS:       'git:status',
  GIT_STAGE:        'git:stage',
  GIT_UNSTAGE:      'git:unstage',
  GIT_UNSTAGE_ALL:  'git:unstageAll',
  GIT_BRANCH:       'git:branch',
  SELECT_FOLDER:    'dialog:selectFolder',
} as const;