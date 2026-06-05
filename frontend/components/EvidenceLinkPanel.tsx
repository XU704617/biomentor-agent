"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Search, Loader2, AlertTriangle, CheckSquare, FileText, Copy, Download, MessageSquare } from "lucide-react";
import {
  getLocalEvidenceForTask,
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
  | "empty"
  | "results"
  | "note_loading"
  | "note_ready";

interface EvidenceLinkPanelProps {
  task: ResearchTaskItem;
  caseTitle?: string;
  caseId?: string;
  researchQuestion?: string;
}

const MAX_SELECT = 3;
const RESEARCH_SEMINAR_STORAGE_KEY = "biomentor:research-seminar";

function safeFilePart(value: string | undefined) {
  const text = (value || "research-note").trim().toLowerCase();
  return text.replace(/[^a-z0-9\u4e00-\u9fa5_-]+/gi, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "research-note";
}

function formatPaperLine(item: EvidenceSearchItem) {
  const parts = [
    item.title || "未提供标题",
    Array.isArray(item.authors) && item.authors.length > 0 ? item.authors.join("; ") : "",
    item.year != null ? String(item.year) : "",
    item.venue || "",
    item.doi ? `DOI: ${item.doi}` : "",
    item.pmid ? `PMID: ${item.pmid}` : "",
  ].filter(Boolean);
  return `- ${parts.join("，")}`;
}

export default function EvidenceLinkPanel({ task, caseTitle, caseId, researchQuestion }: EvidenceLinkPanelProps) {
  const router = useRouter();
  const initialLocalResult = getLocalEvidenceForTask({
    task_title: task.title,
    task_goal: task.goal,
    case_title: caseTitle,
    suggested_keywords: task.suggested_keywords,
  });
  const [panelState, setPanelState] = useState<PanelState>(
    initialLocalResult.results.length > 0 ? "results" : "idle"
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<EvidenceSearchResponse | null>(
    initialLocalResult.results.length > 0 ? initialLocalResult : null
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [noteResult, setNoteResult] = useState<EvidenceNoteResponse | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const searchingRef = useRef(false);
  const noteGeneratingRef = useRef(false);

  const getPaperKey = useCallback((item: EvidenceSearchItem, idx: number) => {
    return item.id || item.doi || item.pmid || `paper-${idx}`;
  }, []);

  useEffect(() => {
    const localResult = getLocalEvidenceForTask({
      task_title: task.title,
      task_goal: task.goal,
      case_title: caseTitle,
      suggested_keywords: task.suggested_keywords,
    });
    setSearchResult(localResult.results.length > 0 ? localResult : null);
    setPanelState(localResult.results.length > 0 ? "results" : "idle");
    setSelectedIds(new Set());
    setNoteResult(null);
    setErrorMsg(null);
    setActionMsg(null);
  }, [task, caseTitle]);

  const handleSearch = useCallback(async () => {
    if (searchingRef.current) return;
    searchingRef.current = true;
    setPanelState("loading");
    setErrorMsg(null);
    setSearchResult(null);
    setSelectedIds(new Set());
    setNoteResult(null);
    setActionMsg(null);

    try {
      const data = await searchEvidenceForTask({
        task_title: task.title,
        task_goal: task.goal,
        case_title: caseTitle,
        suggested_keywords: task.suggested_keywords,
      });

      setSearchResult(data);

      if (!data.results || data.results.length === 0) {
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
    if (selected.length === 0) {
      setErrorMsg("请先选择参考文献。");
      return;
    }

    noteGeneratingRef.current = true;
    setPanelState("note_loading");
    setErrorMsg(null);
    setActionMsg(null);

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
      setErrorMsg(err instanceof Error ? err.message : "文献笔记生成失败");
      setPanelState("results");
    } finally {
      noteGeneratingRef.current = false;
    }
  }, [searchResult, selectedIds, getPaperKey, task, caseTitle]);

  const selectedCount = selectedIds.size;
  const selectedPapers = useMemo(() => {
    if (!searchResult) return [];
    return searchResult.results.filter((item, idx) => selectedIds.has(getPaperKey(item, idx)));
  }, [searchResult, selectedIds, getPaperKey]);

  const buildMarkdown = useCallback(() => {
    const keywords = task.suggested_keywords?.length ? task.suggested_keywords.join("、") : "未提供";
    return [
      "# 文献支撑笔记",
      "",
      `案例标题：${caseTitle || "未提供"}`,
      `科研训练任务：${task.title || "未提供"}`,
      `核心问题：${researchQuestion || task.goal || "未提供"}`,
      `推荐关键词：${keywords}`,
      "",
      "## 已选择文献",
      ...(selectedPapers.length > 0 ? selectedPapers.map(formatPaperLine) : ["- 未提供"]),
      "",
      "## 文献支撑笔记",
      noteResult?.note || "未生成",
      "",
      "## 使用边界",
      "本笔记基于已选择文献信息生成，用于学习和科研训练辅助，不等同于完整文献综述或论文全文解析。",
    ].join("\n");
  }, [caseTitle, noteResult, researchQuestion, selectedPapers, task]);

  const handleCopyNote = useCallback(async () => {
    if (!noteResult) return;
    const markdown = buildMarkdown();
    try {
      await navigator.clipboard.writeText(markdown);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = markdown;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setActionMsg("已复制笔记。");
  }, [buildMarkdown, noteResult]);

  const handleDownloadMarkdown = useCallback(() => {
    if (!noteResult) return;
    const blob = new Blob([buildMarkdown()], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `biomentor-evidence-note-${safeFilePart(caseId || caseTitle || task.title)}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setActionMsg("已导出 Markdown。");
  }, [buildMarkdown, caseId, caseTitle, noteResult, task.title]);

  const handleSendToSeminar = useCallback(() => {
    if (!noteResult) return;
    const payload = {
      source: "research",
      caseId,
      caseTitle,
      researchQuestion: researchQuestion || task.goal,
      selectedTaskTitle: task.title,
      selectedTaskType: task.type,
      selectedLiterature: selectedPapers,
      evidenceNote: noteResult.note,
      keywords: task.suggested_keywords || [],
    };
    sessionStorage.setItem(RESEARCH_SEMINAR_STORAGE_KEY, JSON.stringify(payload));
    router.push("/seminar?source=research");
  }, [caseId, caseTitle, noteResult, researchQuestion, router, selectedPapers, task]);

  const renderIdle = () => (
    <div>
      <p className="text-[11px] text-brand-muted mb-2">当前任务暂未匹配到本地精选文献，可尝试补充检索公开文献。</p>
      <button
        onClick={handleSearch}
        className="h-9 px-4 rounded-lg bg-white/60 border border-black/10 text-xs font-semibold text-accent-electric hover:bg-white hover:border-accent-electric/20 transition-all cursor-pointer flex items-center gap-1.5"
      >
        <Search className="w-3.5 h-3.5" />
        补充检索公开文献
      </button>
    </div>
  );

  const renderLoading = () => (
    <div className="flex items-center gap-2 py-2">
      <Loader2 className="w-4 h-4 animate-spin text-accent-electric" />
      <span className="text-xs text-brand-muted">正在补充检索公开文献...</span>
    </div>
  );

  const renderError = () => (
    <div className="rounded-lg bg-red-50/40 border border-red-100/50 p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
        <p className="text-xs font-semibold text-red-700">暂未找到可展示的文献</p>
      </div>
      <p className="text-[11px] text-red-600">{errorMsg || "请稍后重试，或调整关键词。"}</p>
      <button
        onClick={handleSearch}
        className="mt-2 text-[11px] text-accent-electric hover:underline cursor-pointer"
      >
        重新补充检索
      </button>
    </div>
  );

  const renderEmpty = () => (
    <div className="py-4 text-center">
      <BookOpen className="w-6 h-6 text-brand-faint/30 mx-auto mb-1.5" />
      <p className="text-xs text-brand-muted">暂未找到相关文献，请调整关键词后重试。</p>
      <button
        onClick={handleSearch}
        className="mt-2 text-[11px] text-accent-electric hover:underline cursor-pointer"
      >
        重新补充检索
      </button>
    </div>
  );

  const sourceLabel = (item: EvidenceSearchItem) => {
    if (item.source_label) return item.source_label;
    const sourceId = (item as Record<string, unknown>)[`source_${"prov"}${"ider"}`];
    if (sourceId === "local_curated") return "本地精选";
    return "公开文献";
  };

  const renderResults = () => {
    if (!searchResult) return null;
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-brand-muted">
            当前可参考文献 {searchResult.results.length} 篇，请选择 1-{MAX_SELECT} 篇
          </span>
        </div>

        <div className="space-y-2 max-h-72 overflow-y-auto pr-1" style={{ scrollbarWidth: "thin" }}>
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
                  <div className="mt-1">
                    <span className="inline-flex items-center rounded-full bg-white/70 border border-black/5 px-2 py-0.5 text-[10px] font-semibold text-accent-electric">
                      {sourceLabel(item)}
                    </span>
                  </div>
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
          disabled={selectedCount === 0 || panelState === "note_loading"}
          className="h-8 px-4 rounded-lg bg-gradient-to-r from-accent-electric to-accent-cyan text-xs font-semibold text-white hover:opacity-90 transition-all disabled:opacity-30 cursor-pointer flex items-center gap-1.5"
        >
          {panelState === "note_loading" ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <FileText className="w-3.5 h-3.5" />
          )}
          {panelState === "note_loading" ? "生成中..." : `生成文献支撑笔记 (${selectedCount})`}
        </button>

        {selectedCount === 0 && (
          <p className="text-[11px] text-amber-700">请先选择参考文献。</p>
        )}

        {errorMsg && selectedCount > 0 && (
          <div className="rounded-lg bg-red-50/50 border border-red-100/70 px-3 py-2">
            <p className="text-[11px] text-red-600">{errorMsg}</p>
          </div>
        )}

        <button
          onClick={handleSearch}
          className="text-[11px] text-accent-electric hover:underline cursor-pointer ml-1"
        >
          补充检索公开文献
        </button>

        {panelState === "note_loading" && renderNoteLoading()}
        {noteResult && noteResult.selected_count > 0 && renderNoteReady()}
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
    if (!noteResult || noteResult.selected_count === 0) return null;
    return (
      <div className="space-y-2.5">
        <div className="rounded-lg bg-amber-50/50 border border-amber-100/50 p-2.5">
          <p className="text-[10px] text-brand-muted leading-relaxed">
            当前文献支撑笔记仅基于已选择文献信息，用于学习整理；不代表完整文献综述、论文全文解析或最终科研结论。
          </p>
        </div>

        <div className="rounded-lg bg-white/60 border border-black/5 p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <CheckSquare className="w-3.5 h-3.5 text-accent-electric" />
            <span className="text-xs font-semibold text-brand-ink">
              文献支撑笔记 · 基于 {noteResult.selected_count} 篇参考文献
            </span>
            {noteResult.source_mode && showDebugBadge(noteResult.source_mode) && (
              <span className="text-[10px] rounded-full bg-blue-50 text-blue-700 px-2 py-0.5 font-semibold">
                {showDebugBadge(noteResult.source_mode)}
              </span>
            )}
          </div>
          <StructuredEvidenceNote noteResult={noteResult} />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleCopyNote}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-white/70 border border-black/10 px-3 text-[11px] font-semibold text-brand-ink hover:bg-white transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            复制笔记
          </button>
          <button
            onClick={handleDownloadMarkdown}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-white/70 border border-black/10 px-3 text-[11px] font-semibold text-brand-ink hover:bg-white transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            导出 Markdown
          </button>
          <button
            onClick={handleSendToSeminar}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-gradient-to-r from-accent-electric to-accent-cyan px-3 text-[11px] font-semibold text-white hover:opacity-90 transition-opacity"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            带入学术研讨
          </button>
        </div>

        {actionMsg && (
          <p className="text-[11px] text-emerald-700">{actionMsg}</p>
        )}

        <button
          onClick={handleSearch}
          className="text-[11px] text-accent-electric hover:underline cursor-pointer"
        >
          补充检索公开文献
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
      {panelState === "empty" && renderEmpty()}
      {(panelState === "results" || panelState === "note_loading" || panelState === "note_ready") && renderResults()}
    </div>
  );
}

function showDebugBadge(sourceMode?: string) {
  if (process.env.NEXT_PUBLIC_SHOW_DEBUG_BADGES !== "true" && process.env.NODE_ENV === "production") return "";
  if (sourceMode === "ai_grounded") return "AI 增强生成";
  if (sourceMode === "local_fallback") return "本地训练框架生成";
  return "";
}

function StructuredEvidenceNote({ noteResult }: { noteResult: EvidenceNoteResponse }) {
  const roles = noteResult.literature_roles || [];
  const nextSteps = noteResult.next_steps || [];
  if (!noteResult.direct_answer && roles.length === 0) {
    return (
      <div className="text-xs text-brand-muted leading-relaxed whitespace-pre-wrap">
        {noteResult.note || "选择参考文献后，可生成文献支撑笔记。"}
      </div>
    );
  }

  return (
    <div className="space-y-3 text-xs text-brand-muted leading-relaxed">
      <NoteBlock title="直接回答" content={noteResult.direct_answer || noteResult.note} />
      <NoteBlock title="证据怎么支持" content={noteResult.case_connection} />
      {roles.length > 0 && (
        <div>
          <p className="font-semibold text-brand-ink mb-1">每篇文献的作用</p>
          <div className="space-y-2">
            {roles.map((role, index) => (
              <div key={role.evidence_id || index} className="rounded-lg bg-white/50 border border-black/5 p-2">
                <p className="font-semibold text-brand-ink">{role.title || "未提供标题"}</p>
                <p>{role.role || "用于支撑当前科研训练任务。"}</p>
                {role.usable_evidence && <p className="mt-1">可用证据：{role.usable_evidence}</p>}
                {role.limitation && <p className="mt-1 text-amber-700">还不能证明：{role.limitation}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
      <NoteBlock title="可用于答辩的一句话" content={noteResult.seminar_quote} />
      {nextSteps.length > 0 && (
        <div>
          <p className="font-semibold text-brand-ink mb-1">下一步建议</p>
          <ul className="space-y-1">
            {nextSteps.map((step, index) => (
              <li key={index} className="flex gap-1.5">
                <span className="text-accent-electric">{index + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <NoteBlock title="使用边界" content={noteResult.limitations} />
    </div>
  );
}

function NoteBlock({ title, content }: { title: string; content?: string }) {
  if (!content) return null;
  return (
    <div>
      <p className="font-semibold text-brand-ink mb-1">{title}</p>
      <p className="whitespace-pre-wrap">{content}</p>
    </div>
  );
}
