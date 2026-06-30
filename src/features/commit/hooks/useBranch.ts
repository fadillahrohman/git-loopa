import { useState, useCallback } from 'react';
import { gitService } from '../../../services/gitService';

export function useBranch() {
  const [branch, setBranch] = useState<string>('');

  const refresh = useCallback(async (repoPath: string) => {
    if (!repoPath) return;
    const b = await gitService.getBranch({ repoPath });
    setBranch(b);
  }, []);

  return { branch, refresh };
}