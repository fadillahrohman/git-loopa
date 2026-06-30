import { useState } from "react";
import { gitService } from "../../../services/gitService";
import type { CommitResult } from "../../../shared/ipcTypes";

export function useCommit() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CommitResult | null>(null);

  const commit = async (repoPath: string, message: string, date: string) => {
    setLoading(true);
    setResult(null);
    const res = await gitService.commit({ repoPath, message, date });
    setResult(res);
    setLoading(false);
    return res;
  };

  const selectFolder = () => gitService.selectFolder();

  const reset = () => setResult(null);

  return { commit, selectFolder, loading, result, reset };
}
