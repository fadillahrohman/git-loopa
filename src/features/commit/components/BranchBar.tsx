import { FaCodeBranch } from "react-icons/fa6";

interface BranchBarProps {
  branch: string;
  repoPath: string;
}

export function BranchBar({ branch, repoPath }: BranchBarProps) {
  if (!repoPath) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-white/8 rounded-lg text-xs">
      <FaCodeBranch className="text-indigo-400 flex-shrink-0" size={14} />
      <span className="text-zinc-300 font-mono truncate">{branch || "..."}</span>
    
    </div>
  );
}