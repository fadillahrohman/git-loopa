import { useState } from 'react';
import { gitService } from '../../../services/gitService';
import type { CommitResult } from '../../../shared/ipcTypes';

export function usePush() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CommitResult | null>(null);

  const push = async (repoPath: string) => {
    setLoading(true);
    setResult(null);
    const res = await gitService.push({ repoPath });
    setResult(res);
    setLoading(false);
  };

  const reset = () => setResult(null);

  return { push, loading, result, reset };
}