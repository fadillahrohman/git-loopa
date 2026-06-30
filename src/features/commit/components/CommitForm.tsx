import { useState } from "react";
import { useCommit } from "../hooks/useCommit";
import { useGitStatus } from "../hooks/useGitStatus";
import { useBranch } from "../hooks/useBranch";
import { usePush } from "../hooks/usePush";
import { FileList } from "./FileList";
import { BranchBar } from "./BranchBar";
import {
  toLocalISOWithOffset,
  nowLocalDatetime,
} from "../../../shared/utils/dateFormatter";
import { gitService } from "../../../services/gitService";

import logoImage from "../../../assets/logo/loopa.png";
import {
  FaGithub,
  FaCodeCommit,
  FaPushed,
  FaFolderOpen,
  FaArrowRotateRight,
  FaCheck,
  FaCircleExclamation,
} from "react-icons/fa6";
import { HiMiniChevronDown } from "react-icons/hi2";
import { CiTimer } from "react-icons/ci";
import { RiGitRepositoryCommitsFill } from "react-icons/ri";
import { Spinner } from "../../../shared/components/ui/Spinner";``

export function CommitForm() {
  const [repoPath, setRepoPath] = useState("");
  const [message, setMessage] = useState("");
  const [date, setDate] = useState(nowLocalDatetime());

  const [activePreset, setActivePreset] = useState<string | number | null>(
    "now",
  );

  const {
    commit,
    loading: committing,
    result: commitResult,
    reset: resetCommit,
  } = useCommit();
  const {
    files,
    loading: statusLoading,
    refresh,
    stage,
    unstage,
    stageAll,
    unstageAll,
  } = useGitStatus();
  const { branch, refresh: refreshBranch } = useBranch();
  const {
    push,
    loading: pushing,
    result: pushResult,
    reset: resetPush,
  } = usePush();

  const refreshAll = (path: string) => {
    refresh(path);
    refreshBranch(path);
    resetCommit();
    resetPush();
    setMessage("");
  };

  const handleSelectFolder = async () => {
    const folder = await gitService.selectFolder();
    if (folder) {
      setRepoPath(folder);
      resetCommit();
      resetPush();
      await refresh(folder);
      await refreshBranch(folder);
    }
  };

  const handleCommit = async () => {
    if (!repoPath || !message.trim() || !date) return;
    const ok = await window.electronAPI.confirm(
      "Are you sure you want to commit these changes?",
    );
    if (!ok) return;

    const isoDate = toLocalISOWithOffset(date);
    const result = await commit(repoPath, message.trim(), isoDate);
    if (result?.success) setMessage("");
    await refresh(repoPath);
  };

  const handlePush = async () => {
    const ok = await window.electronAPI.confirm(
      "Are you sure you want to push to the remote repository?",
    );
    if (!ok) return;
    await push(repoPath);
  };

  const handleCommitAndPush = async () => {
    if (!repoPath || !message.trim() || !date) return;
    const ok = await window.electronAPI.confirm(
      "Are you sure you want to commit and push right away?",
    );
    if (!ok) return;

    const isoDate = toLocalISOWithOffset(date);
    const commitRes = await commit(repoPath, message.trim(), isoDate);
    if (!commitRes?.success) return;
    setMessage("");
    await push(repoPath);
    await refresh(repoPath);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleCommit();
  };

  const isValid =
    repoPath && message.trim() && date && files.some((f) => f.staged);

  const activeResult = pushResult ?? commitResult;

  const repoName = repoPath
    ? repoPath.replace(/\\/g, "/").split("/").pop()
    : null;

  const [datePart, timePart] = date ? date.split("T") : ["", ""];

  // Get today's date in YYYY-MM-DD format to limit calendar input
  const today = new Date();
  const maxDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden select-none">
      {/* Titlebar */}
      <header className="flex items-center justify-between h-20 px-4 border-b border-zinc-200 bg-white shrink-0">
        <div className="flex items-center gap-2.5">
          <img
            src={logoImage}
            alt="Git Loopa Logo"
            className="w-16 h-16 drop-shadow-sm"
          />
          <span className="text-[16px] font-extrabold italic text-zinc-900">
            Commit with Timestamp
          </span>
        </div>

        {/* Folder */}
        <button
          onClick={handleSelectFolder}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 text-sm font-medium transition-colors"
        >
          <RiGitRepositoryCommitsFill className="text-zinc-400" size={16} />
          <span className="max-w-36 truncate">
            {repoName ?? "Select repository"}
          </span>
          <HiMiniChevronDown className="text-zinc-400" size={16} />
        </button>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-48 shrink-0 flex flex-col border-r border-zinc-200 bg-white">
          <div className="flex-1 overflow-y-auto pb-4">
            <div className="px-3 pt-4">
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2 px-1">
                Branches
              </p>
              {repoPath && branch ? (
                <BranchBar
                  branch={branch}
                  repoPath={repoPath}
                />
              ) : (
                <p className="text-[12px] text-zinc-400 px-1">
                  {repoPath ? "Loading..." : "Open a Repository"}
                </p>
              )}
            </div>

            <hr className="border-zinc-100 mx-3 my-3" />

            <div className="px-3">
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2 px-1">
                Presets
              </p>
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => {
                    setDate(nowLocalDatetime());
                    setActivePreset("now");
                  }}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-[12px] font-medium w-full text-left transition-colors mb-1 ${
                    activePreset === "now"
                      ? "text-gray-600 bg-gray-100 hover:bg-gray-200 border"
                      : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700 border border-transparent"
                  }`}
                >
                  <CiTimer size={16} />
                  Today (Now)
                </button>

                {[
                  { label: "Yesterday 20:00", days: -1, h: 20, m: 0 },
                  { label: "2 days ago 15:30", days: -2, h: 15, m: 30 },
                  { label: "3 days ago 09:00", days: -3, h: 9, m: 0 },
                ].map((p, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + p.days);
                      const pad = (n: number) => String(n).padStart(2, "0");
                      setDate(
                        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(p.h)}:${pad(p.m)}`,
                      );
                      setActivePreset(i);
                    }}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-[12px] w-full text-left transition-colors ${
                      activePreset === i
                        ? "text-gray-600 bg-gray-100 hover:bg-gray-200 border font-medium"
                        : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700 border border-transparent"
                    }`}
                  >
                    <CiTimer size={16} />
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Author & GitHub */}
          <div className="p-3 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between shrink-0">
            <div className="flex flex-col overflow-hidden pr-2">
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-0.5">
                Author
              </span>
            </div>

            {/* Button GitHub  */}
            <a
              href="https://github.com/fadillahrohman"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-900 transition-colors shrink-0"
              title="Visit GitHub Profile"
            >
              <FaGithub size={30} />
            </a>
          </div>
        </aside>

        {/* Main */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Changes header */}
          <div className="px-4 pt-3 pb-3 border-b border-zinc-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-zinc-800">
                Changes
              </span>
              {repoPath && (
                <>
                  <span className="text-[11px] text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full">
                    {files.length} files
                  </span>
                  {files.some((f) => f.staged) && (
                    <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      {files.filter((f) => f.staged).length} staged
                    </span>
                  )}
                </>
              )}
            </div>
            {repoPath && (
              <button
                onClick={() => refreshAll(repoPath)}
                className="text-zinc-400 hover:text-zinc-600 transition-colors"
                title="Refresh"
              >
                <FaArrowRotateRight size={16} />
              </button>
            )}
          </div>

          {/* File list */}
          <div className="flex-1 overflow-hidden">
            {!repoPath ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center p-8">
                <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center">
                  <FaFolderOpen size={24} className="text-zinc-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-700 mb-1">
                    Open a Git Repository
                  </p>
                  <p className="text-[12px] text-zinc-400 leading-relaxed">
                    Select a repository folder to start making commits with
                    custom dates
                  </p>
                </div>
                <button
                  onClick={handleSelectFolder}
                  className="px-4 py-2 rounded-full bg-zinc-900 text-white text-sm font-medium transition-colors mt-2"
                >
                  Browse folder
                </button>
              </div>
            ) : (
              <FileList
                files={files}
                loading={statusLoading}
                repoPath={repoPath}
                onStage={(fs) => stage(repoPath, fs)}
                onUnstage={(fs) => unstage(repoPath, fs)}
                onStageAll={() => stageAll(repoPath)}
                onUnstageAll={() => unstageAll(repoPath)}
              />
            )}
          </div>

          {/* Result banner */}
          {activeResult && (
            <div
              className={`mx-4 mb-2 rounded-lg px-3 py-2 flex items-start gap-2 text-sm shrink-0 ${
                activeResult.success
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                  : "bg-red-50 border border-red-200 text-red-700"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {activeResult.success ? (
                  <FaCheck size={14} />
                ) : (
                  <FaCircleExclamation size={14} />
                )}
              </div>
              <span className="font-mono text-[12px] leading-relaxed break-all">
                {activeResult.output || activeResult.error}
              </span>
            </div>
          )}

          {/* Commit Panel */}
          <div className="border-t border-zinc-200 bg-zinc-50 px-4 py-3 flex flex-col gap-2.5 shrink-0">
            {/* Date + Time */}
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={datePart}
                max={maxDate}
                onChange={(e) => {
                  setDate(`${e.target.value}T${timePart || "00:00"}`);
                  setActivePreset(null);
                }}
                className="flex-1 h-8 px-2.5 text-sm rounded-lg border border-zinc-200 bg-white text-zinc-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all [color-scheme:light]"
              />
              <input
                type="time"
                value={timePart}
                onChange={(e) => {
                  setDate(
                    `${datePart || new Date().toISOString().slice(0, 10)}T${e.target.value}`,
                  );
                  setActivePreset(null);
                }}
                className="w-24 h-8 px-2.5 text-sm rounded-lg border border-zinc-200 bg-white text-zinc-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all [color-scheme:light]"
              />
              {/* Set to Now */}
              <button
                onClick={() => {
                  setDate(nowLocalDatetime());
                  setActivePreset("now");
                }}
                title="Set to current time"
                className="h-8 px-3 text-xs font-semibold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 rounded-lg transition-colors shrink-0"
              >
                Now
              </button>
            </div>

            {/* Commit message */}
            <textarea
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              rows={3}
              placeholder="Commit Message"
              className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 bg-white text-zinc-700 placeholder:text-zinc-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none transition-all leading-relaxed"
            />

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleCommit}
                disabled={!isValid || committing}
                className="flex-1 flex items-center justify-center gap-2 h-9 text-sm font-medium rounded-lg border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {committing ? <Spinner /> : <FaCodeCommit size={16} />}
                Commit
              </button>

              <button
                onClick={handlePush}
                disabled={!repoPath || pushing}
                className="flex-1 flex items-center justify-center gap-2 h-9 text-sm font-medium rounded-lg border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {pushing ? <Spinner /> : <FaGithub size={16} />}
                Push
              </button>

              <button
                onClick={handleCommitAndPush}
                disabled={!isValid || committing || pushing}
                className="flex-[1.5] flex items-center justify-center gap-2 h-9 text-sm font-medium rounded-lg bg-zinc-900 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {committing || pushing ? (
                  <Spinner white />
                ) : (
                  <FaPushed size={16} />
                )}
                Commit & Push
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
