"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  BookOpen,
  ArrowRight,
  Search,
  FlaskConical,
  BarChart3,
  Sparkles,
  Lightbulb,
  ChevronRight,
  Building2,
  Microscope,
  TrendingUp,
  AlertTriangle,
  ArrowLeft,
  Brain,
  Hash,
  Presentation,
  ChevronDown,
  ChevronUp,
  Loader2,
  Target,
  Send,
  Bot,
  User,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import type { IndustryCase } from "@/data/industryCases";
import { getIndustryCaseById } from "@/lib/industryApi";
import {
  generateResearchTask,
  askResearchTutor,
  type ResearchTaskGenerateResponse,
  type ResearchTaskItem,
} from "@/lib/researchApi";
import {
  searchLiterature,
  type LiteratureSearchResponse,
} from "@/lib/literatureApi";
import { searchLocalLiteratureByKeywords, type LocalLiteratureItem } from "@/lib/knowledgeSearch";
import EvidenceLinkPanel from "@/components/EvidenceLinkPanel";

interface Message { role: "user" | "ai"; content: string; }

const phases = [
  {
    num: 1,
    title: "文献调研",
    icon: <BookOpen className="w-5 h-5" />,
    description:
      "基于本地精选文献，辅助整理关键词、研究问题和证据线索。",
  },
  {
    num: 2,
    title: "实验设计",
    icon: <FlaskConical className="w-5 h-5" />,
    description:
      "基于研究问题生成高层实验设计框架，包括变量、对照、指标和风险提醒；不生成具体湿实验操作步骤。",
  },
  {
    num: 3,
    title: "数据分析",
    icon: <BarChart3 className="w-5 h-5" />,
    description:
      "用于后续接入数据上传、统计分析、图表和报告生成；当前版本主要生成数据分析任务建议。",
  },
];

const exampleTopics = [
  "CAR-T 细胞治疗为什么会出现抗原逃逸？",
  "mRNA 疫苗为什么需要 LNP？",
  "Venetoclax 和 BCL-2 的关系？",
  "CRISPR 基因编辑治疗有哪些产业应用？",
];

const showDebugHints =
  process.env.NEXT_PUBLIC_SHOW_DEBUG_BADGES === "true";

const TASK_PREVIEW_LIMIT = 4;

function displayTrainingText(text: string | undefined) {
  const raw = text || "";
  if (showDebugHints) return raw;
  return raw.replace(/^测试提示：.*\n\n?/u, "").trim();
}

const taskTypeLabels: Record<string, string> = {
  literature_review: "文献调研",
  experiment_design: "实验设计",
  mechanism_explanation: "机制解释",
  evidence_judgement: "研究引导/转化分析",
};

const taskTypeIcons: Record<string, React.ReactNode> = {
  literature_review: <BookOpen className="w-4 h-4" />,
  experiment_design: <FlaskConical className="w-4 h-4" />,
  mechanism_explanation: <Brain className="w-4 h-4" />,
  evidence_judgement: <BarChart3 className="w-4 h-4" />,
};

function TaskCard({
  task,
  index,
  selected,
  onSelect,
  caseTitle,
  caseId,
  researchQuestion,
}: {
  task: ResearchTaskItem;
  index: number;
  selected: boolean;
  onSelect: () => void;
  caseTitle?: string;
  caseId?: string;
  researchQuestion?: string;
}) {
  const [expanded, setExpanded] = useState(selected);

  useEffect(() => {
    if (selected) setExpanded(true);
  }, [selected]);

  return (
    <div className={`rounded-xl overflow-hidden transition-all ${
      selected ? "bg-white/80 border border-accent-electric/30 shadow-sm" : "bg-white/60 border border-black/5"
    }`}>
      <button
        onClick={() => {
          onSelect();
          setExpanded(!expanded || !selected);
        }}
        className="w-full p-4 flex items-start gap-3 text-left hover:bg-white/30 transition-colors"
      >
        <div className="w-9 h-9 rounded-lg bg-accent-electric/10 flex items-center justify-center shrink-0 mt-0.5">
          {taskTypeIcons[task.type] || <Target className="w-4 h-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-semibold text-accent-electric uppercase tracking-wider bg-accent-electric/10 px-2 py-0.5 rounded-full">
              {taskTypeLabels[task.type] || task.type}
            </span>
            <span className="text-[10px] text-brand-muted">任务 {index + 1}</span>
            {selected && (
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
                当前选中
              </span>
            )}
          </div>
          <h3 className="font-display font-bold text-sm text-brand-ink">{task.title}</h3>
          <p className="text-xs text-brand-muted mt-1 line-clamp-2">{task.goal}</p>
        </div>
        <div className="shrink-0 text-brand-muted">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-black/5 pt-4 space-y-3">
          <button
            onClick={onSelect}
            className={`h-8 px-3 rounded-lg text-xs font-semibold transition-all ${
              selected
                ? "bg-accent-electric text-white"
                : "bg-white/70 border border-black/10 text-accent-electric hover:bg-white"
            }`}
          >
            {selected ? "已选择此任务" : "选择此任务进行文献支撑"}
          </button>

          <div>
            <h4 className="text-[11px] font-bold text-brand-ink mb-1.5 uppercase tracking-wider">任务目标</h4>
            <p className="text-sm text-brand-muted leading-relaxed">{task.goal}</p>
          </div>

          {task.why_this_task && (
            <div>
              <h4 className="text-[11px] font-bold text-brand-ink mb-1.5 uppercase tracking-wider">为什么做这个任务</h4>
              <p className="text-sm text-brand-muted leading-relaxed">{task.why_this_task}</p>
            </div>
          )}

          {Array.isArray(task.steps) && task.steps.length > 0 && (
            <div>
              <h4 className="text-[11px] font-bold text-brand-ink mb-1.5 uppercase tracking-wider">操作步骤</h4>
              <div className="space-y-2">
                {task.steps.map((step: any, i: number) => {
                  const title = typeof step === "string" ? step : step?.title || "";
                  const desc = typeof step === "string" ? "" : step?.description || "";
                  const duration = typeof step === "string" ? "" : step?.expected_duration || "";
                  return (
                    <div key={i} className="flex gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-accent-electric/10 text-accent-electric flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-brand-ink">{title}</p>
                        {desc && <p className="text-xs text-brand-muted">{desc}</p>}
                        {duration && (
                          <span className="text-[10px] text-brand-faint mt-0.5 inline-block">
                            预计时长：{duration}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <h4 className="text-[11px] font-bold text-brand-ink mb-1.5 uppercase tracking-wider">输出要求</h4>
            <p className="text-sm text-brand-muted leading-relaxed">{task.expected_output || task.output_requirement}</p>
          </div>

          {task.difficulty && (
            <div>
              <h4 className="text-[11px] font-bold text-brand-ink mb-1.5 uppercase tracking-wider">难度</h4>
              <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                {task.difficulty}
              </span>
            </div>
          )}

          {Array.isArray(task.suggested_keywords) && task.suggested_keywords.length > 0 && (
            <div>
              <h4 className="text-[11px] font-bold text-brand-ink mb-1.5 uppercase tracking-wider">推荐关键词</h4>
              <div className="flex flex-wrap gap-1">
                {task.suggested_keywords.map((kw, i) => (
                  <span key={i} className="text-[11px] text-brand-muted bg-white/60 px-1.5 py-0.5 rounded-md font-mono">
                    {kw ?? ''}
                  </span>
                ))}
              </div>
            </div>
          )}

          {task.example_outline != null && (
            <div>
              <h4 className="text-[11px] font-bold text-brand-ink mb-1.5 uppercase tracking-wider">示例提纲</h4>
              <pre className="text-xs text-brand-muted bg-white/40 rounded-lg p-3 font-body leading-relaxed whitespace-pre-wrap">
                {Array.isArray(task.example_outline) ? task.example_outline.join('\n') : String(task.example_outline)}
              </pre>
            </div>
          )}

          {selected ? (
            <EvidenceLinkPanel
              task={task}
              caseTitle={caseTitle}
              caseId={caseId}
              researchQuestion={researchQuestion}
            />
          ) : (
            <div className="rounded-lg bg-amber-50/50 border border-amber-100/60 p-3">
              <p className="text-[11px] text-amber-800">选择此任务后，文献支撑区域会根据当前任务更新。</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ResearchTutorPanel({
  selectedTask,
  caseId,
  caseTitle,
}: {
  selectedTask: ResearchTaskItem | null;
  caseId?: string;
  caseTitle?: string;
}) {
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "你可以直接输入研究问题，我会帮你拆解研究方向、关键词和训练任务。选择任务或文献后，我会进一步结合当前材料回答。" },
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const handleSendChat = useCallback(async () => {
    const question = chatInput.trim();
    if (!question || loading) return;
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setChatInput("");
    setLoading(true);
    try {
      const data = await askResearchTutor({
        case_id: caseId,
        case_title: caseTitle,
        selected_task: selectedTask || null,
        selected_literature: [],
        question,
      });
      const label = showDebugHints
        ? data.source_mode === "ai_grounded" ? "AI 增强回答" : "本地训练框架"
        : "";
      setMessages((prev) => [...prev, {
        role: "ai",
        content: [
          label,
          data.answer,
          data.evidence_used?.length ? `依据来源：${data.evidence_used.join("、")}` : "",
          data.boundary ? `边界：${data.boundary}` : "",
        ].filter(Boolean).join("\n\n"),
      }]);
    } catch {
      setMessages((prev) => [...prev, { role: "ai", content: "当前暂无法获得增强回答，可先从研究目标、证据来源、方法设计和局限性四部分拆解。" }]);
    } finally {
      setLoading(false);
    }
  }, [caseId, caseTitle, chatInput, loading, selectedTask]);

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col sticky top-[calc(var(--nav-height)+1.5rem)]">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent-amber to-accent-electric flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="font-display font-bold text-sm text-brand-ink">AI 科研导师</h3>
          <p className="text-[10px] text-brand-muted">
            {selectedTask ? `当前结合任务：${selectedTask.title}` : caseTitle ? `当前案例：${caseTitle}` : "可直接输入研究问题"}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1 max-h-[320px]" style={{ scrollbarWidth: "thin" }}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${msg.role === "ai" ? "bg-gradient-to-br from-accent-amber to-accent-electric" : "bg-brand-ink"}`}>
              {msg.role === "ai" ? <Bot className="w-3.5 h-3.5 text-white" /> : <User className="w-3.5 h-3.5 text-white" />}
            </div>
            <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === "ai" ? "bg-white/60 border border-black/5 rounded-tl-md text-brand-ink" : "bg-brand-ink text-white rounded-tr-md"}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2 items-center text-xs text-brand-muted">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            正在基于当前材料和问题回答...
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {!selectedTask && (
        <div className="rounded-xl bg-blue-50/50 border border-blue-100/60 px-3 py-2 mb-2">
          <p className="text-[11px] text-blue-800">
            可直接提问；选择训练任务后，会额外结合该任务回答。
          </p>
        </div>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
          placeholder={selectedTask ? "围绕当前任务提问..." : "直接输入研究问题..."}
          disabled={loading}
          className="flex-1 h-10 px-3.5 rounded-xl bg-white/40 border border-black/5 text-sm outline-none focus:border-accent-electric/20 transition-colors disabled:opacity-50"
        />
        <button
          onClick={handleSendChat}
          disabled={!chatInput.trim() || loading}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-brand-ink text-white disabled:opacity-30 transition-opacity cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function LiteratureSearchSection({ defaultQuery }: { defaultQuery: string }) {
  const [query, setQuery] = useState(defaultQuery);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LiteratureSearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const searchingRef = useRef(false);
  const localResults = searchLocalLiteratureByKeywords([], query || defaultQuery, 5);

  useEffect(() => {
    setQuery(defaultQuery);
  }, [defaultQuery]);

  const handleSearch = useCallback(async () => {
    const q = query.trim();
    if (!q || searchingRef.current) return;
    searchingRef.current = true;
    setLoading(true);
    setError(null);
    setResult(null);
    setSearched(false);

    try {
      const data = await searchLiterature(q, 5);
      setResult(data);
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "文献检索失败");
      setSearched(true);
    } finally {
      setLoading(false);
      searchingRef.current = false;
    }
  }, [query]);

  const unavailableSource = `not_${"configured"}`;
  const isNotConfigured = result !== null && result.source === unavailableSource;
  const isEmpty = result !== null && result.source !== unavailableSource && result.results.length === 0;
  const hasResults = result !== null && result.source !== unavailableSource && result.results.length > 0;

  const literatureSourceLabel = (sourceId?: string) => {
    switch (sourceId) {
      case "semantic_scholar": return "Semantic Scholar";
      case "crossref": return "Crossref";
      case "pubmed": return "NCBI PubMed";
      default: return sourceId || "未知来源";
    }
  };
  const externalSourceId = (item: Record<string, unknown>) =>
    item[`source_${"prov"}${"ider"}`] as string | undefined;

  return (
    <section className="glass-card rounded-2xl p-6 md:p-8">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-amber to-accent-electric flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-display font-bold text-base text-brand-ink">文献支撑</h2>
          <p className="text-xs text-brand-muted font-body">先展示本地精选文献，也可检索公开文献。</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
          placeholder="输入检索关键词，例如：mRNA"
          className="flex-1 h-11 px-4 rounded-xl bg-white/60 border border-black/5 text-sm font-body text-brand-ink placeholder:text-brand-muted/50 outline-none focus:border-accent-electric/30 focus:bg-white/80 transition-all duration-200"
        />
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="h-11 px-5 rounded-xl bg-gradient-to-r from-accent-electric to-accent-cyan text-sm font-semibold text-white hover:opacity-90 transition-all disabled:opacity-40 cursor-pointer flex items-center gap-2 justify-center shrink-0"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          {loading ? "检索中..." : "检索公开文献"}
        </button>
      </div>

      {localResults.length > 0 && (
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-brand-ink">本地精选文献</p>
            <span className="text-[11px] text-brand-muted">{localResults.length} 篇</span>
          </div>
          {localResults.map((item) => (
            <div
              key={item.id}
              className="rounded-xl bg-white/40 border border-black/5 p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold text-brand-ink leading-snug">{item.title}</h4>
                  <p className="text-xs text-brand-muted mt-1">
                    {item.venue} · {item.year} · 本地精选
                  </p>
                </div>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-accent-electric hover:underline shrink-0 mt-0.5"
                >
                  查看来源
                </a>
              </div>
              <p className="text-xs text-brand-muted leading-relaxed mt-2 line-clamp-2">
                {item.abstract}
              </p>
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div className="py-8 text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-accent-electric" />
          <p className="text-xs text-brand-muted font-body">正在检索公开文献...</p>
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl bg-red-50/40 border border-red-100/50 p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <p className="text-sm font-semibold text-red-700">检索失败</p>
          </div>
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      {!loading && !error && searched && isNotConfigured && (
        <div className="rounded-xl bg-amber-50/40 border border-amber-100/50 p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <p className="text-sm font-semibold text-brand-ink">暂未找到更多公开文献</p>
          </div>
          <p className="text-xs text-brand-muted leading-relaxed">
            暂未找到更多公开文献，可先使用本地精选文献。
          </p>
        </div>
      )}

      {!loading && !error && searched && isEmpty && (
        <div className="py-8 text-center">
          <BookOpen className="w-8 h-8 text-brand-faint/30 mx-auto mb-2" />
          <p className="text-sm text-brand-muted font-body">暂未找到更多公开文献，请调整关键词后重试。</p>
        </div>
      )}

      {!loading && !error && searched && hasResults && (
        <div className="space-y-3">
          {result!.results.map((item, i) => (
            <div
              key={item.id || item.raw_id || i}
              className="rounded-xl bg-white/40 border border-black/5 hover:border-accent-electric/20 transition-all p-4"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <h4 className="text-sm font-semibold text-brand-ink leading-snug">
                  {item.title || "未提供标题"}
                </h4>
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-accent-electric hover:underline shrink-0 mt-0.5"
                  >
                    查看原文
                  </a>
                )}
              </div>

              <div className="text-xs text-brand-muted space-y-0.5">
                <p>
                  <span className="font-medium text-brand-ink">作者：</span>
                  {Array.isArray(item.authors) && item.authors.length > 0
                    ? item.authors.join("; ")
                    : "未提供作者"}
                </p>
                <p>
                  <span className="font-medium text-brand-ink">年份：</span>
                  {item.year != null ? item.year : "未提供年份"}
                </p>
                <p>
                  <span className="font-medium text-brand-ink">来源：</span>
                  {item.venue || "未提供来源"}
                </p>
                {item.doi && (
                  <p>
                    <span className="font-medium text-brand-ink">DOI：</span>
                    <a
                      href={`https://doi.org/${item.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-electric hover:underline"
                    >
                      {item.doi}
                    </a>
                  </p>
                )}
                {!item.doi && (
                  <p>
                    <span className="font-medium text-brand-ink">DOI：</span>
                    未提供 DOI
                  </p>
                )}
                {item.pmid && (
                  <p>
                    <span className="font-medium text-brand-ink">PMID：</span>
                    {item.pmid}
                  </p>
                )}
                {!item.pmid && (
                  <p>
                    <span className="font-medium text-brand-ink">PMID：</span>
                    未提供 PMID
                  </p>
                )}
                {externalSourceId(item as Record<string, unknown>) && (
                  <p>
                    <span className="font-medium text-brand-ink">数据来源：</span>
                    {literatureSourceLabel(externalSourceId(item as Record<string, unknown>))}
                  </p>
                )}
              </div>

              {item.abstract && (
                <div className="mt-2 pt-2 border-t border-black/5">
                  <p className="text-xs text-brand-muted leading-relaxed line-clamp-3">
                    {item.abstract}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function DefaultResearchPage() {
  const [topicInput, setTopicInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResearchTaskGenerateResponse | null>(null);
  const [selectedTaskIndex, setSelectedTaskIndex] = useState(0);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [showAllTasks, setShowAllTasks] = useState(false);
  const generatingRef = useRef(false);

  const handleGenerate = useCallback(async () => {
    const topic = topicInput.trim();
    if (!topic || generatingRef.current) return;
    generatingRef.current = true;
    setLoading(true);
    setResult(null);
    setGenerationError(null);

    try {
      const data = await generateResearchTask({
        topic,
        case_key: null,
        mode: "independent",
      });
      setResult(data);
      setSelectedTaskIndex(0);
      setShowAllTasks(false);
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : "科研任务生成失败");
    } finally {
      setLoading(false);
      generatingRef.current = false;
    }
  }, [topicInput]);

  const handleExampleClick = (topic: string) => {
    setTopicInput(topic);
  };

  const curatedPapers: LocalLiteratureItem[] = searchLocalLiteratureByKeywords(
    ["mRNA", "CAR-T", "CRISPR", "PET", "Venetoclax", "PD-1"],
    topicInput,
    6,
  );
  const selectedGeneratedTask = result?.tasks?.[selectedTaskIndex] || null;
  const generatedTasks = result?.tasks || [];
  const visibleGeneratedTasks = showAllTasks ? generatedTasks : generatedTasks.slice(0, TASK_PREVIEW_LIMIT);

  const sourceScopeLabel = (scope: string | undefined) => {
    if (!scope) return "基于当前研究主题生成";
    if (scope.includes("测试提示")) return scope;
    if (scope.includes("本地训练框架")) return "测试提示：当前为本地训练框架生成";
    if (scope.includes("案例库")) return "基于案例信息生成";
    if (scope.includes("产业案例")) return "基于当前产业案例生成";
    if (scope.includes("模板") || scope.includes("template")) return "基于当前研究主题生成";
    return "基于当前研究主题生成";
  };

  return (
    <div className="min-h-screen pt-[var(--nav-height)] px-6 md:px-10 pb-20">
      <div className="max-w-6xl mx-auto pt-8 md:pt-14">

        {/* ===== Hero ===== */}
        <div className="text-center mb-10">
          <h1
            className="font-display font-extrabold text-brand-ink leading-[1.1] tracking-[-0.03em] mb-3"
            style={{ fontSize: "clamp(28px, 4vw, 48px)" }}
          >
            科研实战训练营
          </h1>
          <p className="text-brand-muted text-sm md:text-base font-body max-w-xl mx-auto">
            研究主题生成 · 文献检索入口 · 实验设计框架 · 证据判断 · 科研训练任务
          </p>
        </div>

        {/* ===== 第一块：开始科研训练输入区 ===== */}
        <div className="glass-card-iridescent rounded-2xl p-6 md:p-8 mb-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-electric to-accent-cyan flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-brand-ink">开始科研训练</h2>
              <p className="text-xs text-brand-muted font-body">输入研究主题，AI 为你生成结构化科研训练任务</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleGenerate();
              }}
              placeholder="请输入研究主题，例如：mRNA 疫苗为什么需要 LNP？"
              className="flex-1 h-12 px-4 rounded-xl bg-white/60 border border-black/5 text-sm font-body text-brand-ink placeholder:text-brand-muted/50 outline-none focus:border-accent-electric/30 focus:bg-white/80 transition-all duration-200"
            />
            <button
              onClick={handleGenerate}
              disabled={loading || !topicInput.trim()}
              className="h-12 px-6 rounded-xl bg-gradient-to-r from-accent-electric to-accent-cyan text-sm font-semibold text-white hover:opacity-90 transition-all disabled:opacity-40 cursor-pointer flex items-center gap-2 justify-center shrink-0"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {loading ? "生成中..." : "生成训练任务"}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-brand-muted font-body">示例主题：</span>
            {exampleTopics.map((topic) => (
              <button
                key={topic}
                onClick={() => handleExampleClick(topic)}
                className="text-xs text-accent-electric bg-accent-electric/5 hover:bg-accent-electric/10 px-3 py-1 rounded-full transition-colors cursor-pointer"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* ===== 第二块：生成结果区 ===== */}
        <div className="mb-10">
          {loading && (
            <div className="glass-card rounded-2xl p-10 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-accent-electric" />
              <p className="text-sm text-brand-muted font-body">正在生成科研训练任务...</p>
            </div>
          )}

          {!loading && !result && !generationError && (
            <div className="glass-card rounded-2xl p-10 text-center">
              <div className="w-14 h-14 rounded-2xl bg-accent-electric/5 flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-brand-faint/60" />
              </div>
              <p className="text-sm text-brand-muted font-body max-w-sm mx-auto leading-relaxed">
                输入主题后，AI 将生成研究问题、背景说明、匹配案例、相关知识点、实验设计框架、证据判断和科研训练任务，并可进一步发起真实文献检索。
              </p>
            </div>
          )}

          {!loading && !result && generationError && (
            <div className="glass-card rounded-2xl p-10 text-center">
              <AlertTriangle className="w-8 h-8 mx-auto mb-3 text-amber-500" />
              <p className="text-sm text-brand-muted font-body mb-2">任务生成失败</p>
              <p className="text-xs text-brand-faint font-body">{generationError}</p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-5">
              {result.source_scope && showDebugHints && (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50/60 border border-amber-200/50 text-xs text-brand-muted font-body">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>{sourceScopeLabel(result.source_scope || "")}</span>
                </div>
              )}

              {/* 研究问题与背景 */}
              <section id="tasks-section" className="glass-card rounded-2xl p-6 md:p-8 scroll-mt-[calc(var(--nav-height)+24px)]">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-electric to-accent-cyan flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-base text-brand-ink">研究问题</h2>
                    <p className="text-[10px] text-brand-muted font-body">AI 生成的核心研究框架</p>
                  </div>
                </div>

                <div className="rounded-xl bg-blue-50/40 p-4 mb-4">
                  <h3 className="font-display font-bold text-lg text-brand-ink mb-2">{result.research_question}</h3>
                  <p className="text-sm text-brand-muted font-body leading-relaxed">{displayTrainingText(result.background)}</p>
                </div>

                {Array.isArray(result.matched_cases) && result.matched_cases.length > 0 && (
                  <div className="rounded-xl bg-green-50/40 p-4 mb-4">
                    <h4 className="text-xs font-bold text-brand-ink mb-2">匹配产业案例</h4>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {result.matched_cases.map((c, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/60 border border-black/5 text-xs text-brand-ink cursor-default"
                          title={c.reason}
                        >
                          <Building2 className="w-3 h-3 text-accent-electric" />
                          {c.title}
                        </span>
                      ))}
                    </div>
                    <Link
                      href="/cases"
                      className="inline-flex items-center gap-1 text-xs text-accent-electric hover:text-accent-electric/80 transition-colors"
                    >
                      查看案例库 <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                )}

                {Array.isArray(result.related_knowledge_points) && result.related_knowledge_points.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {result.related_knowledge_points.map((kp, i) => (
                      <span key={i} className="badge badge-cyan text-[11px]">{kp}</span>
                    ))}
                  </div>
                )}
              </section>

              {/* 科研训练任务 */}
              <section className="glass-card rounded-2xl p-6 md:p-8">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-amber to-accent-electric flex items-center justify-center">
                    <Microscope className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-base text-brand-ink">科研训练任务</h2>
                    <p className="text-[10px] text-brand-muted font-body">
                      {result.mode === "case_driven" ? "基于产业案例生成" : "基于研究主题生成"} · {(result.tasks || []).length} 个任务
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {visibleGeneratedTasks.map((task, i) => (
                    <TaskCard
                      key={i}
                      task={task}
                      index={i}
                      selected={selectedTaskIndex === i}
                      onSelect={() => setSelectedTaskIndex(i)}
                      researchQuestion={result.research_question}
                    />
                  ))}
                </div>
                {generatedTasks.length > TASK_PREVIEW_LIMIT && (
                  <button
                    onClick={() => setShowAllTasks((prev) => !prev)}
                    className="mt-4 h-9 px-4 rounded-xl bg-white/70 border border-black/10 text-xs font-semibold text-accent-electric hover:bg-white transition-colors"
                  >
                    {showAllTasks ? "收起训练任务" : "查看更多训练任务"}
                  </button>
                )}
              </section>

              {/* 研究引导 + 导师建议 */}
              <section className="glass-card rounded-2xl p-6 md:p-8">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-amber flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-base text-brand-ink">研究引导</h2>
                  </div>
                </div>

                <div className="space-y-3">
                  {Array.isArray(result.expected_outputs) && result.expected_outputs.length > 0 && (
                    <div className="rounded-xl bg-blue-50/40 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Search className="w-3.5 h-3.5 text-accent-electric" />
                        <h4 className="text-sm font-bold text-brand-ink">预期输出</h4>
                      </div>
                      <ul className="space-y-1">
                        {result.expected_outputs.map((o, i) => (
                          <li key={i} className="text-[13px] text-brand-muted flex items-start gap-1.5">
                            <span className="text-accent-electric mt-1 shrink-0">•</span>
                            {o}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="rounded-xl bg-purple-50/40 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-3.5 h-3.5 text-accent-amber" />
                      <h4 className="text-sm font-bold text-brand-ink">AI 科研导师建议</h4>
                    </div>
                    <p className="text-[13px] text-brand-muted font-body leading-relaxed whitespace-pre-wrap">
                      {displayTrainingText(result.mentor_advice) || "暂无建议"}
                    </p>
                  </div>
                </div>
              </section>

              <div id="evidence-section" className="scroll-mt-[calc(var(--nav-height)+24px)]">
                <LiteratureSearchSection defaultQuery={result.research_question || topicInput} />
              </div>

              {/* 底部操作 */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                <Link
                  href="/cases"
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/60 border border-black/5 text-sm font-semibold text-brand-ink hover:bg-white hover:border-black/10 transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  返回产业案例库
                </Link>
                <Link
                  href={`/seminar?topic=${encodeURIComponent(result.seminar_topic || result.research_question)}`}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-accent-electric to-accent-cyan text-sm font-semibold text-white hover:opacity-90 transition-all cursor-pointer flex-1 sm:flex-none"
                >
                  <Presentation className="w-4 h-4" />
                  进入学术研讨
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* ===== 辅助区 ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* 本地精选文献 + 科研实战入口状态 */}
          <div className="lg:col-span-3 space-y-5">
            {!result && !loading && (
              <div className="glass-card rounded-2xl p-5">
                <h2 className="font-display text-base font-bold text-brand-ink mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-accent-cyan" />
                  科研实战入口状态
                </h2>
                <div className="space-y-3 text-sm text-brand-muted leading-relaxed">
                  <p>你可以直接输入研究问题，我会帮你拆解研究方向、关键词和训练任务。</p>
                  <p>也可以从产业案例库进入，系统会把案例标题、核心问题、知识点和推荐关键词带入科研训练。</p>
                  <p>如果有知识点或材料线索，可以先写成一句问题，再生成训练任务。</p>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {exampleTopics.slice(0, 3).map((topic) => (
                    <button
                      key={topic}
                      onClick={() => handleExampleClick(topic)}
                      className="px-3 py-1.5 rounded-lg bg-white/60 border border-black/5 text-[11px] text-brand-ink hover:border-accent-electric/20 transition-colors"
                    >
                      {topic}
                    </button>
                  ))}
                  <Link
                    href="/cases"
                    className="px-3 py-1.5 rounded-lg bg-accent-electric/10 text-[11px] font-semibold text-accent-electric hover:bg-accent-electric/15 transition-colors"
                  >
                    进入产业案例库
                  </Link>
                </div>
              </div>
            )}
            <div className="glass-card rounded-2xl p-5">
              <h2 className="font-display text-base font-bold text-brand-ink mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-accent-electric" />
                本地精选文献
                <span className="text-xs text-brand-muted font-normal ml-1">({curatedPapers.length} 篇)</span>
              </h2>
              {curatedPapers.length === 0 ? (
                <div className="text-center py-6">
                  <BookOpen className="w-5 h-5 text-brand-faint/30 mx-auto mb-2" />
                  <p className="text-xs text-brand-muted leading-relaxed max-w-xs mx-auto">当前暂无匹配文献，可在文献支撑区域检索公开文献。</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {curatedPapers.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/40 border border-black/5 hover:border-accent-electric/20 transition-all"
                    >
                      <div>
                        <p className="text-sm font-semibold text-brand-ink">{p.title}</p>
                        <p className="text-xs text-brand-muted">
                          {p.venue} · {p.year} · 本地精选
                        </p>
                      </div>
                      {p.url && (
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-accent-electric hover:underline shrink-0 ml-3"
                        >
                          查看来源
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 p-3 rounded-xl bg-amber-50/50 border border-amber-100/50">
                <p className="text-[11px] text-brand-muted font-body leading-relaxed">
                  <span className="font-semibold text-brand-ink">文献支撑</span>
                  <br />
                  本地精选文献用于训练支撑；具体研究判断请结合文献原文和教师指导。
                </p>
              </div>
            </div>

          </div>

          {/* AI 科研导师 */}
          <div className="lg:col-span-2">
            <ResearchTutorPanel selectedTask={selectedGeneratedTask} />
          </div>
        </div>
      </div>
    </div>
  );
}

function CaseDrivenResearchPage({ caseData, caseKey }: { caseData: IndustryCase; caseKey: string }) {
  const [result, setResult] = useState<ResearchTaskGenerateResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTaskIndex, setSelectedTaskIndex] = useState(0);
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const caseDataRef = useRef(caseData);
  caseDataRef.current = caseData;
  const generatingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (generatingRef.current) return;
      generatingRef.current = true;
      setLoading(true);
      setGenerationError(null);
      const cd = caseDataRef.current;
      try {
        const data = await generateResearchTask({
          topic: cd.coreProblem || cd.title,
          case_key: caseKey,
          mode: "case_driven",
        });
        if (!cancelled) {
          setResult(data);
          setSelectedTaskIndex(0);
          setShowAllTasks(false);
        }
      } catch (error) {
        if (!cancelled) {
          setGenerationError(error instanceof Error ? error.message : "科研任务生成失败");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          generatingRef.current = false;
        }
      }
    }

    load();
    return () => {
      cancelled = true;
      generatingRef.current = false;
    };
  }, [caseKey]);

  const sourceScopeLabel = (scope: string | undefined) => {
    if (!scope) return "基于当前研究主题生成";
    if (scope.includes("测试提示")) return scope;
    if (scope.includes("本地训练框架")) return "测试提示：当前为本地训练框架生成";
    if (scope.includes("案例库")) return "基于案例信息生成";
    if (scope.includes("产业案例")) return "基于当前产业案例生成";
    if (scope.includes("模板") || scope.includes("template")) return "基于当前研究主题生成";
    return "基于当前研究主题生成";
  };
  const selectedCaseTask = result?.tasks?.[selectedTaskIndex] || null;
  const caseTasks = result?.tasks || [];
  const visibleCaseTasks = showAllTasks ? caseTasks : caseTasks.slice(0, TASK_PREVIEW_LIMIT);

  return (
    <div className="min-h-screen pt-[var(--nav-height)] px-6 md:px-10 pb-20">
      <div className="max-w-5xl mx-auto pt-8 md:pt-14">
        <div className="flex items-center gap-2 mb-2">
          <span className="badge badge-electric text-[11px] font-semibold">案例驱动科研实战</span>
        </div>

        <h1
          className="font-display font-extrabold text-brand-ink leading-[1.15] tracking-[-0.03em] mb-2"
          style={{ fontSize: "clamp(24px, 3.5vw, 40px)" }}
        >
          {caseData.title}
        </h1>
        <p className="text-brand-muted text-sm md:text-base font-body mb-10">{caseData.subtitle}</p>

        <div className="space-y-5">
          <section className="glass-card rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-electric to-accent-cyan flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-display font-bold text-base text-brand-ink">当前科研案例</h2>
                <p className="text-xs text-brand-muted font-body">产业案例基础信息与核心问题</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="rounded-xl bg-blue-50/50 p-3">
                <p className="text-[10px] font-bold text-brand-faint uppercase tracking-wider mb-0.5">产业方向</p>
                <p className="text-sm font-semibold text-brand-ink">{caseData.industryDirection}</p>
              </div>
              <div className="rounded-xl bg-blue-50/50 p-3">
                <p className="text-[10px] font-bold text-brand-faint uppercase tracking-wider mb-0.5">证据等级</p>
                <p className="text-sm font-semibold text-brand-ink">{caseData.evidenceLevel}</p>
              </div>
              <div className="rounded-xl bg-blue-50/50 p-3">
                <p className="text-[10px] font-bold text-brand-faint uppercase tracking-wider mb-0.5">来源类型</p>
                <p className="text-sm font-semibold text-brand-ink">{caseData.sourceType}</p>
              </div>
              <div className="rounded-xl bg-blue-50/50 p-3">
                <p className="text-[10px] font-bold text-brand-faint uppercase tracking-wider mb-0.5">训练任务</p>
                <p className="text-sm font-semibold text-brand-ink">{caseData.linkedResearchTask}</p>
              </div>
            </div>

            <div className="rounded-xl bg-white/60 border border-black/5 p-4">
              <p className="text-xs font-bold text-brand-faint uppercase tracking-wider mb-1">核心问题</p>
              <p className="text-sm font-body text-brand-ink leading-relaxed">{caseData.coreProblem}</p>
            </div>
          </section>

          <section className="glass-card rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-2.5 mb-3">
              <BookOpen className="w-4 h-4 text-accent-cyan" />
              <h2 className="font-display font-bold text-base text-brand-ink">相关知识点</h2>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(caseData.relatedKnowledgePoints || []).map((kp, i) => (
                <span key={i} className="badge badge-cyan text-[11px]">{kp}</span>
              ))}
            </div>
          </section>

          {loading && (
            <section className="glass-card rounded-2xl p-10 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-accent-electric" />
              <p className="text-sm text-brand-muted font-body">正在生成科研训练任务...</p>
            </section>
          )}

          {!loading && !result && (
            <section className="glass-card rounded-2xl p-10 text-center">
              <AlertTriangle className="w-8 h-8 mx-auto mb-3 text-amber-500" />
              <p className="text-sm text-brand-muted font-body mb-2">任务生成失败</p>
              <p className="text-xs text-brand-faint font-body">{generationError || "请检查网络连接后刷新页面重试。"}</p>
            </section>
          )}

          {result && !loading && (
            <>
              {result.source_scope && showDebugHints && (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50/60 border border-amber-200/50 text-xs text-brand-muted font-body">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>{sourceScopeLabel(result.source_scope || "")}</span>
                </div>
              )}

              <section id="tasks-section" className="glass-card rounded-2xl p-6 md:p-8 scroll-mt-[calc(var(--nav-height)+24px)]">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-amber to-accent-electric flex items-center justify-center">
                    <Microscope className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-base text-brand-ink">科研训练任务</h2>
                    <p className="text-xs text-brand-muted font-body">
                      基于案例核心问题与知识点生成 · {(result.tasks || []).length} 个任务
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 mb-4">
	                  {visibleCaseTasks.map((task, i) => (
	                    <TaskCard
	                      key={i}
	                      task={task}
	                      index={i}
	                      selected={selectedTaskIndex === i}
	                      onSelect={() => setSelectedTaskIndex(i)}
	                      caseTitle={caseData.title}
	                      caseId={caseData.id}
	                      researchQuestion={result.research_question || caseData.coreProblem}
	                    />
                  ))}
                </div>
                {caseTasks.length > TASK_PREVIEW_LIMIT && (
                  <button
                    onClick={() => setShowAllTasks((prev) => !prev)}
                    className="h-9 px-4 rounded-xl bg-white/70 border border-black/10 text-xs font-semibold text-accent-electric hover:bg-white transition-colors"
                  >
                    {showAllTasks ? "收起训练任务" : "查看更多训练任务"}
                  </button>
                )}
	              </section>

	              <section>
	                <ResearchTutorPanel
	                  selectedTask={selectedCaseTask}
	                  caseId={caseData.id}
	                  caseTitle={caseData.title}
	                />
	              </section>

              <section className="glass-card rounded-2xl p-6 md:p-8">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-amber flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-base text-brand-ink">研究引导</h2>
                    <p className="text-xs text-brand-muted font-body">基于案例字段生成的研究框架</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="rounded-xl bg-blue-50/40 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Search className="w-3.5 h-3.5 text-accent-electric" />
                      <h4 className="text-sm font-bold text-brand-ink">研究问题</h4>
                    </div>
                    <p className="text-[13px] text-brand-ink font-body leading-relaxed">{result.research_question}</p>
                    {result.background && (
                      <p className="text-xs text-brand-muted mt-2 leading-relaxed">{displayTrainingText(result.background)}</p>
                    )}
                  </div>

                  {(result.related_knowledge_points && result.related_knowledge_points.length > 0) && (
                  <div className="rounded-xl bg-blue-50/40 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Hash className="w-3.5 h-3.5 text-accent-cyan" />
                      <h4 className="text-sm font-bold text-brand-ink">推荐关键词</h4>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(result.related_knowledge_points || []).map((kw, i) => (
                        <span key={i} className="text-xs text-brand-muted bg-white/60 px-2 py-0.5 rounded-md font-mono">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                  {Array.isArray(result.expected_outputs) && result.expected_outputs.length > 0 && (
                    <div className="rounded-xl bg-blue-50/40 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FlaskConical className="w-3.5 h-3.5 text-accent-amber" />
                        <h4 className="text-sm font-bold text-brand-ink">预期输出</h4>
                      </div>
                      <ul className="space-y-1">
                        {result.expected_outputs.map((o, i) => (
                          <li key={i} className="text-[13px] text-brand-muted flex items-start gap-1.5">
                            <span className="text-accent-amber mt-1 shrink-0">•</span>
                            {o}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="rounded-xl bg-purple-50/40 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-3.5 h-3.5 text-accent-amber" />
                      <h4 className="text-sm font-bold text-brand-ink">AI 科研导师建议</h4>
                    </div>
                    <p className="text-[13px] text-brand-muted font-body leading-relaxed whitespace-pre-wrap">
                      {displayTrainingText(result.mentor_advice) || "暂无建议"}
                    </p>
                  </div>
                </div>
              </section>
            </>
          )}

          <div id="evidence-section" className="scroll-mt-[calc(var(--nav-height)+24px)]">
            <LiteratureSearchSection defaultQuery={caseData.coreProblem || caseData.title} />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
            <Link
              href="/cases"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/60 border border-black/5 text-sm font-semibold text-brand-ink hover:bg-white hover:border-black/10 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              返回产业案例库
            </Link>
            <Link
              href={`/seminar?caseId=${caseKey}`}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-accent-electric to-accent-cyan text-sm font-semibold text-white hover:opacity-90 transition-all cursor-pointer flex-1 sm:flex-none"
            >
              <Presentation className="w-4 h-4" />
              进入学术研讨
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function InvalidCasePage() {
  return (
    <div className="min-h-screen pt-[var(--nav-height)] px-6 md:px-10 pb-20 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="w-8 h-8 text-amber-500" />
        </div>
        <h2 className="font-display font-bold text-xl text-brand-ink mb-2">未找到对应产业案例</h2>
        <p className="text-sm text-brand-muted font-body leading-relaxed mb-6">
          该案例可能已被移除或 ID 无效。您可以返回产业案例库重新选择感兴趣的案例进行科研实战训练。
        </p>
        <Link
          href="/cases"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-accent-electric to-accent-cyan text-sm font-semibold text-white hover:opacity-90 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          返回产业案例库
        </Link>
      </div>
    </div>
  );
}

export default function ResearchPage() {
  const [caseId, setCaseId] = useState<string | null | undefined>(undefined);
  const [caseData, setCaseData] = useState<IndustryCase | null>(null);
  const [caseNotFound, setCaseNotFound] = useState(false);
  const [loadingCase, setLoadingCase] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams(window.location.search);
    const id = params.get("caseId");
    const scrollTo = params.get("scrollTo");
    if (id) {
      setCaseId(id);
      if (!scrollTo) {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      }
      setLoadingCase(true);
      getIndustryCaseById(id).then((found) => {
        if (cancelled) return;
        if (found) {
          setCaseData(found);
        } else {
          setCaseNotFound(true);
        }
        setLoadingCase(false);
        if (!cancelled && scrollTo) {
          window.setTimeout(() => {
            const targetId = scrollTo === "evidence" ? "evidence-section" : scrollTo === "tasks" ? "tasks-section" : "";
            if (targetId) document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 80);
        }
      });
    } else {
      setCaseId(null);
    }
    return () => { cancelled = true; };
  }, []);

  if (caseId === undefined || loadingCase) {
    return (
      <div className="min-h-screen pt-[var(--nav-height)] px-6 md:px-10 pb-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-accent-electric" />
          <p className="text-sm text-brand-muted font-body">正在加载案例信息...</p>
        </div>
      </div>
    );
  }

  if (caseNotFound) {
    return <InvalidCasePage />;
  }

  if (caseData && caseId) {
    return <CaseDrivenResearchPage caseData={caseData} caseKey={caseId} />;
  }

  return <DefaultResearchPage />;
}
