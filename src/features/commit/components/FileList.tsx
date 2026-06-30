import { useState, useMemo } from "react";
import type { GitFile } from "../../../shared/ipcTypes";

interface FileListProps {
  files: GitFile[];
  loading: boolean;
  repoPath: string;
  onStage: (files: string[]) => void;
  onUnstage: (files: string[]) => void;
  onStageAll: () => void;
  onUnstageAll: () => void;
}

const STATUS_LABEL: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  M: { label: "M", bg: "bg-amber-100", text: "text-amber-700" },
  A: { label: "A", bg: "bg-emerald-100", text: "text-emerald-700" },
  D: { label: "D", bg: "bg-red-100", text: "text-red-700" },
  R: { label: "R", bg: "bg-blue-100", text: "text-blue-700" },
  "?": { label: "U", bg: "bg-zinc-100", text: "text-zinc-500" },
  MM: { label: "M", bg: "bg-amber-100", text: "text-amber-700" },
};

type Tab = "all" | "staged" | "unstaged";

export function FileList({
  files,
  loading,
  repoPath,
  onStage,
  onUnstage,
  onStageAll,
  onUnstageAll,
}: FileListProps) {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<Tab>("all");

  // Log received files for debugging
  // if (files.length > 0) {
  //   console.log(
  //     `[FileList] Received ${files.length} files:`,
  //     files.map((f) => ({ path: f.path, staged: f.staged, status: f.status })),
  //   );
  // }

  const filtered = useMemo(() => {
    let list = files;

    // filter by tab
    if (tab === "staged") list = list.filter((f) => f.staged);
    if (tab === "unstaged") list = list.filter((f) => !f.staged);

    // filter by search
    if (!search.trim()) return list;
    const q = search.toLowerCase().trim();
    return list.filter((f) => {
      const fullPath = f.path.toLowerCase();
      const filename = f.path.split("/").pop()?.toLowerCase() ?? "";
      const segments = f.path.toLowerCase().split("/");
      return (
        fullPath.includes(q) ||
        filename.includes(q) ||
        segments.some((s) => s.includes(q))
      );
    });
  }, [files, search, tab]);

  const stagedFiles = filtered.filter((f) => f.staged);
  const unstagedFiles = filtered.filter((f) => !f.staged);
  const allStaged = files.length > 0 && files.every((f) => f.staged);
  const someStaged = files.some((f) => f.staged) && !allStaged;

  if (!repoPath) return null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Search */}
      <div className="px-4 py-2 border-b border-zinc-100 shrink-0">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files..."
            className="w-full h-8 pl-9 pr-3 text-xs rounded-lg border border-zinc-200 bg-white text-zinc-700 placeholder:text-zinc-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-4 pt-2 pb-1 shrink-0">
        {(["all", "staged", "unstaged"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1 text-xs rounded-md font-medium transition-colors capitalize ${
              tab === t
                ? "bg-zinc-900 text-white"
                : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Stage all row */}
      <div
        onClick={() => (allStaged ? onUnstageAll() : onStageAll())}
        className="flex items-center gap-2.5 px-4 py-2 border-b border-zinc-100 cursor-pointer hover:bg-zinc-50 transition-colors shrink-0"
      >
        <div
          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
            allStaged
              ? "bg-blue-600 border-blue-600"
              : someStaged
                ? "bg-blue-100 border-blue-400"
                : "bg-white border-zinc-300"
          }`}
        >
          {allStaged && (
            <svg
              className="w-2.5 h-2.5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
          {!allStaged && someStaged && (
            <div className="w-2 h-0.5 bg-blue-600 rounded-full" />
          )}
        </div>
        <span className="text-[11px] text-zinc-500">Stage all</span>
        <div className="ml-auto flex gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStageAll();
            }}
            disabled={allStaged || files.length === 0}
            className="text-[10px] px-2 py-0.5 rounded border border-zinc-200 text-zinc-500 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            All
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUnstageAll();
            }}
            disabled={!files.some((f) => f.staged)}
            className="text-[10px] px-2 py-0.5 rounded border border-zinc-200 text-zinc-500 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            None
          </button>
        </div>
      </div>

      {/* File list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-20">
            <svg
              className="w-4 h-4 animate-spin text-zinc-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          </div>
        ) : files.length === 0 ? (
          <div className="flex items-center justify-center h-20">
            <p className="text-xs text-zinc-400">No changes</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-20">
            <p className="text-xs text-zinc-400">File not found</p>
          </div>
        ) : (
          <>
            {/* Staged section */}
            {stagedFiles.length > 0 && (
              <>
                <div className="px-4 py-1.5 text-[10px] font-semibold text-zinc-400 uppercase tracking-widest bg-zinc-50 border-b border-zinc-100">
                  Staged ({stagedFiles.length})
                </div>
                {stagedFiles.map((file) => (
                  <FileRow
                    key={file.path}
                    file={file}
                    onToggle={() => {
                      console.log(
                        `[FileList] Unstage clicked for: "${file.path}"`,
                      );
                      onUnstage([file.path]);
                    }}
                  />
                ))}
              </>
            )}

            {/* Unstaged section */}
            {unstagedFiles.length > 0 && (
              <>
                <div className="px-4 py-1.5 text-[10px] font-semibold text-zinc-400 uppercase tracking-widest bg-zinc-50 border-b border-zinc-100">
                  Changes ({unstagedFiles.length})
                </div>
                {unstagedFiles.map((file) => (
                  <FileRow
                    key={file.path}
                    file={file}
                    onToggle={() => {
                      console.log(
                        `[FileList] Stage clicked for: "${file.path}"`,
                      );
                      onStage([file.path]);
                    }}
                  />
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function FileRow({ file, onToggle }: { file: GitFile; onToggle: () => void }) {
  const st = STATUS_LABEL[file.status] ?? {
    label: "?",
    bg: "bg-zinc-100",
    text: "text-zinc-500",
  };
  const filename = file.path.split(/[/\\]/).pop() ?? file.path;
  const dir =
    file.path.includes("/") || file.path.includes("\\")
      ? file.path.substring(
          0,
          file.path.lastIndexOf(file.path.includes("/") ? "/" : "\\"),
        )
      : "";

  return (
    <div
      onClick={onToggle}
      className="flex items-center gap-2.5 px-4 py-2 hover:bg-zinc-50 cursor-pointer group transition-colors border-b border-zinc-50"
    >
      {/* Checkbox */}
      <div
        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
          file.staged
            ? "bg-blue-600 border-blue-600"
            : "border-zinc-300 group-hover:border-zinc-400"
        }`}
      >
        {file.staged && (
          <svg
            className="w-2.5 h-2.5 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>

      {/* Status badge */}
      <span
        className={`w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center shrink-0 ${st.bg} ${st.text}`}
      >
        {st.label}
      </span>

      {/* File info */}
      <div className="flex-1 min-w-0">
        <span className="text-xs text-zinc-700 truncate block font-mono">
          {filename}
        </span>
        {dir && (
          <span className="text-[10px] text-zinc-400 truncate block">
            {dir}
          </span>
        )}
      </div>
    </div>
  );
}
