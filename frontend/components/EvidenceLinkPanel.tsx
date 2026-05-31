"use client";

import { useState, useCallback, useRef } from "react";
import { BookOpen, Search, Loader2, AlertTriangle, CheckSquare, FileText } from "lucide-react";
import {
  searchEvidenceForTask,
  createEvidenceNote,
  type EvidenceSearchItem,
  type EvidenceSearchResponse,
  type EvidenceNoteResponse,
} from "@/lib/evidenceApi";
import type { ResearchTaskItem } from "@/lib/researchApi";

type PanelState =
  | "idle"
  | "loading"
  | "error"
  | "not_configured"
  | "empty"
  | "results"
  | "note_loading"
  | "note_ready";

interface EvidenceLinkPanelProps {
  task: ResearchTaskItem;
  caseTitle?: string;
}

const MAX_SELECT = 3;

export default function EvidenceLinkPanel({ task, caseTitle }: EvidenceLinkPanelProps) {
  const [panelState, setPanelState] = useState<PanelState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<EvidenceSearchResponse | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [noteResult, setNoteResult] = useState<EvidenceNoteResponse | null>(null);
  const searchingRef = useRef(false);
  const noteGeneratingRef = useRef(false);

  const getPaperKey = useCallback((item: EvidenceSearchItem, idx: number) => {
    return item.id || item.doi || item.pmid || `paper-${idx}`;
  }, []);

  const handleSearch = useCallback(async () => {
    if (searchingRef.current) return;
    searchingRef.current = true;
    setPanelState("loading");
    setErrorMsg(null);
    setSearchResult(null);
    setSelectedIds(new Set());
    setNoteResult(null);

    try {
      const data = await searchEvidenceForTask({
        task_title: task.title,
        task_goal: task.goal,
        case_title: caseTitle,
        suggested_keywords: task.suggested_keywords,
      });

      setSearchResult(data);

      if (data.source === "not_configured") {
        setPanelState("not_configured");
      } else if (!data.results || data.results.length === 0) {
        setPanelState("empty");
      } else {
        setPanelState("results");
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "文献检索失败");
      setPanelState("error");
    } finally {
      searchingRef.current = false;
    }
  }, [task, caseTitle]);

  const toggleSelect = useCallback((key: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        if (next.size >= MAX_SELECT) return prev;
        next.add(key);
      }
      return next;
    });
  }, []);

  const handleGenerateNote = useCallback(async () => {
    if (noteGeneratingRef.current || !searchResult) return;
    const selected = searchResult.results.filter((item, idx) =>
      selectedIds.has(getPaperKey(item, idx))
    );
    if (selected.length === 0) return;

    noteGeneratingRef.current = true;
    setPanelState("note_loading");
    setErrorMsg(null);

    try {
      const data = await createEvidenceNote({
        task_title: task.title,
        task_goal: task.goal,
        selected_papers: selected,
        case_title: caseTitle,
      });
      setNoteResult(data);
      setPanelState("note_ready");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "evidence note 生成失败");
      setPanelState("error");
    } finally {
      noteGeneratingRef.current = false;
    }
  }, [searchResult, selectedIds, getPaperKey, task, caseTitle]);

  const selectedCount = selectedIds.size;

  const renderIdle = () => (
    <div>
      <p className="text-[11px] text-brand-muted mb-2">根据当前任务关键词检索参考文献，帮助学生建立研究依据。</p>
      <button
        onClick={handleSearch}
        className="h-9 px-4 rounded-lg bg-white/60 border border-black/10 text-xs font-semibold text-accent-electric hover:bg-white hover:border-accent-electric/20 transition-all cursor-pointer flex items-center gap-1.5"
      >
        <Search className="w-3.5 h-3.5" />
        查找相关文献
      </button>
    </div>
  );

  const renderLoading = () => (
    <div className="flex items-center gap-2 py-2">
      <Loader2 className="w-4 h-4 animate-spin text-accent-electric" />
      <span className="text-xs text-brand-muted">正在检索文献...</span>
    </div>
  );

  const renderError = () => (
    <div className="rounded-lg bg-red-50/40 border border-red-100/50 p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
        <p className="text-xs font-semibold text-red-700">文献检索失败</p>
      </div>
      <p className="text-[11px] text-red-600">{errorMsg}</p>
      <button
        onClick={handleSearch}
        className="mt-2 text-[11px] text-accent-electric hover:underline cursor-pointer"
      >
        重新检索
      </button>
    </div>
  );

  const renderNotConfigured = () => (
    <div className="rounded-lg bg-amber-50/40 border border-amber-100/50 p-3">
      <p className="text-[11px] text-brand-muted leading-relaxed">
        暂未检索到相关文献，请调整关键词后重试。
      </p>
      <button
        onClick={handleSearch}
        className="mt-2 text-[11px] text-accent-electric hover:underline cursor-pointer"
      >
        重新检索
      </button>
    </div>
  );

  const renderEmpty = () => (
    <div className="py-4 text-center">
      <BookOpen className="w-6 h-6 text-brand-faint/30 mx-auto mb-1.5" />
      <p className="text-xs text-brand-muted">暂未检索到相关文献，请调整关键词后重试。</p>
      <button
        onClick={handleSearch}
        className="mt-2 text-[11px] text-accent-electric hover:underline cursor-pointer"
      >
        重新检索
      </button>
    </div>
  );

  const renderResults = () => {
    if (!searchResult) return null;
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-brand-muted">
            已检索到 {searchResult.results.length} 篇文献，请选择 1-{MAX_SELECT} 篇
          </span>
        </div>

        <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1" style={{ scrollbarWidth: "thin" }}>
          {searchResult.results.map((item, idx) => {
            const key = getPaperKey(item, idx);
            const isSelected = selectedIds.has(key);
            const isDisabled = !isSelected && selectedCount >= MAX_SELECT;
            return (
              <label
                key={key}
                className={`flex items-start gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? "bg-accent-electric/5 border-accent-electric/20"
                    : isDisabled
                    ? "bg-white/20 border-black/5 opacity-40 cursor-not-allowed"
                    : "bg-white/40 border-black/5 hover:border-accent-electric/15"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  disabled={isDisabled}
                  onChange={() => toggleSelect(key)}
                  className="mt-0.5 w-3.5 h-3.5 rounded accent-accent-electric cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-brand-ink leading-snug line-clamp-2">
                    {item.title || "未提供标题"}
                  </p>
                  <div className="text-[10px] text-brand-muted mt-0.5 space-y-0.5">
                    <p>
                      作者：{Array.isArray(item.authors) && item.authors.length > 0
                        ? item.authors.slice(0, 3).join("; ") + (item.authors.length > 3 ? " 等" : "")
                        : "未提供作者"}
                    </p>
                    <p>年份：{item.year != null ? item.year : "未提供年份"}</p>
                    <p>来源：{item.venue || "未提供来源"}</p>
                    <p>DOI：{item.doi || "未提供 DOI"}</p>
                    <p>PMID：{item.pmid || "未提供 PMID"}</p>
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent-electric hover:underline inline-block mt-0.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        查看原文
                      </a>
                    )}
                  </div>
                  {item.abstract && (
                    <p className="text-[10px] text-brand-muted leading-relaxed mt-1 line-clamp-2">
                      {item.abstract}
                    </p>
                  )}
                </div>
              </label>
            );
          })}
        </div>

        <button
          onClick={handleGenerateNote}
          disabled={selectedCount === 0}
          className="h-8 px-4 rounded-lg bg-gradient-to-r from-accent-electric to-accent-cyan text-xs font-semibold text-white hover:opacity-90 transition-all disabled:opacity-30 cursor-pointer flex items-center gap-1.5"
        >
          <FileText className="w-3.5 h-3.5" />
          生成文献支撑笔记 ({selectedCount})
        </button>

        <button
          onClick={handleSearch}
          className="text-[11px] text-accent-electric hover:underline cursor-pointer ml-1"
        >
          重新检索
        </button>
      </div>
    );
  };

  const renderNoteLoading = () => (
    <div className="flex items-center gap-2 py-2">
      <Loader2 className="w-4 h-4 animate-spin text-accent-electric" />
      <span className="text-xs text-brand-muted">正在生成文献支撑笔记...</span>
    </div>
  );

  const renderNoteReady = () => {
    if (!noteResult) return null;
    return (
      <div className="space-y-2.5">
        <div className="rounded-lg bg-amber-50/50 border border-amber-100/50 p-2.5">
          <p className="text-[10px] text-brand-muted leading-relaxed">
            当前文献支撑笔记仅基于文献元数据，不代表全文解析、证据强度判断或最终科研结论。
          </p>
        </div>

        <div className="rounded-lg bg-white/60 border border-black/5 p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <CheckSquare className="w-3.5 h-3.5 text-accent-electric" />
            <span className="text-xs font-semibold text-brand-ink">
              文献支撑笔记 · 基于 {noteResult.selected_count} 篇文献
            </span>
          </div>
          <div className="text-xs text-brand-muted leading-relaxed whitespace-pre-wrap">
            {noteResult.note || "暂无文献支撑笔记内容"}
          </div>
        </div>

        <button
          onClick={handleSearch}
          className="text-[11px] text-accent-electric hover:underline cursor-pointer"
        >
          重新检索文献
        </button>
      </div>
    );
  };

  return (
    <div className="mt-3 pt-3 border-t border-black/5">
      <div className="flex items-center gap-1.5 mb-2">
        <BookOpen className="w-3.5 h-3.5 text-accent-electric" />
        <span className="text-[11px] font-bold text-brand-ink uppercase tracking-wider">
          文献支撑
        </span>
      </div>

      {panelState === "idle" && renderIdle()}
      {panelState === "loading" && renderLoading()}
      {panelState === "error" && renderError()}
      {panelState === "not_configured" && renderNotConfigured()}
      {panelState === "empty" && renderEmpty()}
      {panelState === "results" && renderResults()}
      {panelState === "note_loading" && renderNoteLoading()}
      {panelState === "note_ready" && renderNoteReady()}
    </div>
  );
}