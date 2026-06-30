import { useState, useCallback } from "react";
import { gitService } from "../../../services/gitService";
import type { GitFile } from "../../../shared/ipcTypes";

export function useGitStatus() {
  const [files, setFiles] = useState<GitFile[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async (repoPath: string) => {
    if (!repoPath) return;
    setLoading(true);
    const result = await gitService.getStatus({ repoPath });
    setFiles(result);
    setLoading(false);
  }, []);

  const stage = async (repoPath: string, filePaths: string[]) => {
    await gitService.stage({ repoPath, files: filePaths });
    await refresh(repoPath);
  };

  const unstage = async (repoPath: string, filePaths: string[]) => {
    await gitService.unstage({ repoPath, files: filePaths });
    await refresh(repoPath);
  };

  const unstageAll = async (repoPath: string) => {
    await gitService.unstageAll({ repoPath });
    await refresh(repoPath);
  };

  const stageAll = async (repoPath: string) => {
    await gitService.stage({ repoPath, files: [] });
    await refresh(repoPath);
  };

  return { files, loading, refresh, stage, unstage, stageAll, unstageAll };
}
