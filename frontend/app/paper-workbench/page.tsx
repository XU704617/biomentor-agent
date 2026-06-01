"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Bookmark,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileText,
  FlaskConical,
  GraduationCap,
  Lightbulb,
  Loader2,
  Sparkles,
  Trash2,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const STORAGE_KEY = "biomentor:backend-paper-workbench";
const LEGACY_STORAGE_KEY = "biomentor:selected-papers";

interface ResearchPaper {
  id: number;
  title: string;
  title_zh: string;
  direction: string;
  venue: string;
  year: number;
  source_type: string;
  keywords: string[];
  abstract: string;
  core_problem: string;
  method_summary: string;
  key_finding: string;
  teaching_value: string;
  research_value: string;
  evidence_level: string;
  reading_difficulty: string;
  suggested_reading_order: number;
  selectable: boolean;
  can_support_demo: boolean;
  demo_scenarios: string[];
  demo_questions: string[];
  discussion_prompts: string[];
  recommended_for: string[];
  experiment_learning_value: string;
  defense_value: string;
  related_concepts: string[];
  related_tools: string[];
  related_cases: string[];
  pdf_filename: string;
  pdf_storage_path: string;
  pdf_text_char_count: number;
}

interface ResearchPaperListResponse {
  items: ResearchPaper[];
}

interface PaperLearningPlan {
  paper_id: number;
  title: string;
  learning_goal: string;
  prerequisite_concepts: string[];
  one_sentence_summary: string;
  key_innovation?: string;
  reading_steps: string[];
  experiment_thinking: string[];
  defense_talking_points: string[];
  discussion_questions: string[];
  reading_difficulty: string;
}

interface WorkbenchTask {
  id: string;
  title: string;
  difficulty: string;
  scenario: string;
  input_knowledge: string;
  expected_output: string;
  steps: string[];
  evaluation_rubric: string[];
}

const categoryLabels: Record<string, string> = {
  "实验学习": "实验学习",
  "答辩材料": "答辩材料",
  "科研任务": "科研任务",
  "知识图谱": "知识图谱",
  "产业案例": "产业案例",
  "未分类": "未分类",
};

function loadSelectedIds(): number[] {
  if (typeof window === "undefined") return [];

  try {
    const current = localStorage.getItem(STORAGE_KEY);
    if (current) {
      const parsed = JSON.parse(current);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => Number(item))
          .filter((item) => Number.isInteger(item) && item > 0);
      }
    }

    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy) {
      const parsed = JSON.parse(legacy);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => Number(item?.paperId))
          .filter((item) => Number.isInteger(item) && item > 0);
      }
    }
  } catch {
    return [];
  }

  return [];
}

function persistSelectedIds(ids: number[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

function groupPapersByRecommendedFor(papers: ResearchPaper[]) {
  const grouped: Record<string, ResearchPaper[]> = {};
  for (const paper of papers) {
    const categories = Array.isArray(paper.recommended_for) && paper.recommended_for.length > 0
      ? paper.recommended_for
      : ["未分类"];
    for (const category of categories) {
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(paper);
    }
  }
  return grouped;
}

function difficultyLabel(value: string) {
  const normalized = (value || "").toLowerCase();
  if (normalized.includes("easy") || value === "入门") return "入门";
  if (normalized.includes("hard") || value === "较难" || value === "挑战") return "挑战";
  if (value === "中等") return "进阶";
  return "进阶";
}

export default function PaperWorkbenchPage() {
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [expandedPlanId, setExpandedPlanId] = useState<number | null>(null);
  const [learningPlans, setLearningPlans] = useState<Record<number, PaperLearningPlan>>({});
  const [planLoadingId, setPlanLoadingId] = useState<number | null>(null);
  const [defenseOutline, setDefenseOutline] = useState<string[] | null>(null);
  const [defenseLoading, setDefenseLoading] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState<WorkbenchTask[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);

  useEffect(() => {
    setSelectedIds(loadSelectedIds());
    void loadPapers();
  }, []);

  const selectedPapers = useMemo(
    () => selectedIds.map((paperId) => papers.find((paper) => paper.id === paperId)).filter(Boolean) as ResearchPaper[],
    [papers, selectedIds],
  );

  const groupedSelectedPapers = useMemo(
    () => groupPapersByRecommendedFor(selectedPapers),
    [selectedPapers],
  );

  const groupedKeys = useMemo(() => Object.keys(groupedSelectedPapers), [groupedSelectedPapers]);

  async function loadPapers() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/research/papers?page_size=100`);
      if (!response.ok) throw new Error("后端文献库加载失败");
      const data = (await response.json()) as ResearchPaperListResponse;
      setPapers(data.items || []);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "后端文献库加载失败");
    } finally {
      setLoading(false);
    }
  }

  function updateSelection(nextIds: number[]) {
    const deduped = Array.from(new Set(nextIds)).filter((item) => Number.isInteger(item) && item > 0);
    setSelectedIds(deduped);
    persistSelectedIds(deduped);
  }

  function togglePaper(paperId: number) {
    if (selectedIds.includes(paperId)) {
      updateSelection(selectedIds.filter((item) => item !== paperId));
      if (expandedPlanId === paperId) setExpandedPlanId(null);
      return;
    }
    updateSelection([...selectedIds, paperId]);
  }

  function clearWorkspace() {
    updateSelection([]);
    setDefenseOutline(null);
    setGeneratedTasks([]);
    setExpandedPlanId(null);
    setLearningPlans({});
  }

  async function handleGeneratePlan(paperId: number) {
    if (expandedPlanId === paperId) {
      setExpandedPlanId(null);
      return;
    }

    if (learningPlans[paperId]) {
      setExpandedPlanId(paperId);
      return;
    }

    setPlanLoadingId(paperId);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/research/papers/${paperId}/learning-plan`);
      if (!response.ok) {
        const body = await response.json().catch(() => ({ detail: "学习计划生成失败" }));
        throw new Error(body.detail || "学习计划生成失败");
      }
      const plan = (await response.json()) as PaperLearningPlan;
      setLearningPlans((previous) => ({ ...previous, [paperId]: plan }));
      setExpandedPlanId(paperId);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "学习计划生成失败");
    } finally {
      setPlanLoadingId(null);
    }
  }

  async function handleGenerateDefense() {
    if (selectedIds.length === 0) return;
    setDefenseLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/research/papers/defense-outline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedIds),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({ detail: "答辩提纲生成失败" }));
        throw new Error(body.detail || "答辩提纲生成失败");
      }
      const data = await response.json();
      setDefenseOutline(Array.isArray(data.outline) ? data.outline : []);
      setSuccess("已基于后端真实文献生成答辩提纲");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "答辩提纲生成失败");
    } finally {
      setDefenseLoading(false);
    }
  }

  async function handleGenerateTasks() {
    if (selectedIds.length === 0) return;
    setTasksLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/research/papers/research-tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedIds),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({ detail: "科研任务生成失败" }));
        throw new Error(body.detail || "科研任务生成失败");
      }
      const data = await response.json();
      setGeneratedTasks(Array.isArray(data.tasks) ? data.tasks : []);
      setSuccess("已基于后端真实文献生成科研任务");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "科研任务生成失败");
    } finally {
      setTasksLoading(false);
    }
  }

  return (
    <div className="min-h-screen pt-[var(--nav-height)] px-6 md:px-10 pb-20">
      <div className="max-w-6xl mx-auto pt-8 md:pt-16">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-electric/8 text-accent-electric text-[11px] font-semibold font-body mb-5">
            <Bookmark className="w-3 h-3" />
            Paper Workbench
          </div>
          <h1
            className="font-display font-extrabold text-brand-ink leading-[1.1] tracking-[-0.03em] mb-3"
            style={{ fontSize: "clamp(28px, 4vw, 48px)" }}
          >
            文献工作台
          </h1>
          <p className="text-brand-muted text-base md:text-lg font-body max-w-2xl mx-auto">
            这里不再读取前端假文献库。工作台直接连接后端真实文献库，用于管理所选文献，并生成真实学习计划、答辩提纲和科研任务。
          </p>
        </div>

        {(error || success) && (
          <div className={`mb-6 rounded-2xl px-4 py-3 text-sm ${error ? "bg-red-50 text-red-700 border border-red-100" : "bg-green-50 text-green-700 border border-green-100"}`}>
            {error || success}
          </div>
        )}

        {selectedPapers.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            <button
              onClick={() => void handleGenerateDefense()}
              disabled={defenseLoading}
              className="btn-hero cursor-pointer inline-flex items-center gap-2 disabled:opacity-50"
            >
              {defenseLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              生成答辩提纲
            </button>
            <button
              onClick={() => void handleGenerateTasks()}
              disabled={tasksLoading}
              className="btn-hero-secondary cursor-pointer inline-flex items-center gap-2 disabled:opacity-50"
            >
              {tasksLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GraduationCap className="w-4 h-4" />}
              生成科研任务
            </button>
            <button
              onClick={clearWorkspace}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-accent-rose hover:bg-accent-rose/5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              清空工作台
            </button>
          </div>
        )}

        <section className="glass-card rounded-2xl p-6 md:p-8 mb-10">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="font-display text-lg font-bold text-brand-ink">后端真实文献库</h2>
              <p className="text-sm text-brand-muted">从后端 research_papers 中选择文献加入当前工作台</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => void loadPapers()}
                disabled={loading}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/80 border border-black/5 text-sm text-brand-ink disabled:opacity-50"
              >
                <Loader2 className={`w-4 h-4 ${loading ? "animate-spin" : "hidden"}`} />
                {!loading && <ExternalLink className="w-4 h-4" />}
                刷新
              </button>
              <Link href="/paper-library" className="text-sm font-medium text-accent-electric hover:text-brand-ink transition-colors">
                去文献库新增 / 导入 PDF
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="py-16 flex items-center justify-center text-brand-muted">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              正在加载后端文献库
            </div>
          ) : papers.length === 0 ? (
            <div className="text-center py-14">
              <BookOpen className="w-10 h-10 text-brand-faint/30 mx-auto mb-3" />
              <p className="text-sm text-brand-muted mb-4">后端真实文献库当前为空。</p>
              <Link href="/paper-library" className="btn-hero inline-flex items-center gap-2">
                去导入 PDF 或新增文献
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {papers.map((paper) => {
                const selected = selectedIds.includes(paper.id);
                return (
                  <div key={paper.id} className="rounded-2xl border border-black/5 bg-white/60 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-brand-ink leading-6">{paper.title_zh || paper.title}</p>
                        <p className="text-xs text-brand-muted mt-1 break-all">{paper.title}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="text-[10px] px-2 py-1 rounded-full bg-black/5 text-brand-faint">{paper.direction || "未标注方向"}</span>
                          <span className="text-[10px] px-2 py-1 rounded-full bg-black/5 text-brand-faint">{paper.venue || "未标注来源"} · {paper.year || "未知年份"}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => togglePaper(paper.id)}
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition-colors ${
                          selected
                            ? "bg-accent-rose/10 text-accent-rose border-accent-rose/15"
                            : "bg-accent-electric/10 text-accent-electric border-accent-electric/15"
                        }`}
                      >
                        {selected ? "移出工作台" : "加入工作台"}
                      </button>
                    </div>
                    {paper.core_problem && (
                      <p className="text-sm text-brand-muted mt-3 leading-6">{paper.core_problem}</p>
                    )}
                    {paper.pdf_filename && (
                      <p className="text-xs text-brand-faint mt-3">PDF：{paper.pdf_filename}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {selectedPapers.length === 0 ? (
          <div className="text-center py-10">
            <Bookmark className="w-12 h-12 text-brand-faint/30 mx-auto mb-4" />
            <h2 className="font-display text-lg font-bold text-brand-ink mb-2">工作台还没有选中文献</h2>
            <p className="text-sm text-brand-muted font-body max-w-md mx-auto">
              直接从上面的后端真实文献库里选择文献加入工作台。这里不再依赖前端内置假数据。
            </p>
          </div>
        ) : (
          <div className="space-y-8 mb-12">
            {groupedKeys.map((category) => {
              const categoryPapers = groupedSelectedPapers[category];
              return (
                <section key={category}>
                  <div className="flex items-center gap-2 mb-4">
                    {category === "实验学习" && <FlaskConical className="w-4 h-4 text-accent-electric" />}
                    {category === "答辩材料" && <FileText className="w-4 h-4 text-accent-amber" />}
                    {category === "科研任务" && <GraduationCap className="w-4 h-4 text-accent-cyan" />}
                    {category !== "实验学习" && category !== "答辩材料" && category !== "科研任务" && <BookOpen className="w-4 h-4 text-brand-faint" />}
                    <h2 className="font-display text-lg font-bold text-brand-ink">{categoryLabels[category] || category}</h2>
                    <span className="text-sm text-brand-faint font-body">({categoryPapers.length} 篇)</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categoryPapers.map((paper) => {
                      const expanded = expandedPlanId === paper.id;
                      const plan = learningPlans[paper.id];
                      return (
                        <div key={paper.id} className="glass-card rounded-2xl p-5">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex-1">
                              <h3 className="font-display font-bold text-sm text-brand-ink leading-snug mb-1">
                                {paper.title_zh || paper.title}
                              </h3>
                              <p className="text-xs text-brand-muted font-body">{paper.venue} · {paper.year || "未知年份"}</p>
                            </div>
                            <button
                              onClick={() => togglePaper(paper.id)}
                              className="p-1.5 rounded-lg hover:bg-black/5 transition-colors shrink-0 cursor-pointer"
                              title="移除此文献"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-brand-faint hover:text-accent-rose transition-colors" />
                            </button>
                          </div>

                          <div className="space-y-2 mb-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/5 text-brand-faint font-body">
                                {paper.direction || "未标注方向"}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/5 text-brand-faint font-body">
                                难度：{difficultyLabel(paper.reading_difficulty)}
                              </span>
                            </div>
                            <p className="text-xs text-brand-muted font-body leading-relaxed">
                              核心问题：{paper.core_problem || "暂无核心问题描述"}
                            </p>
                            {paper.experiment_learning_value && (
                              <p className="text-xs text-brand-muted font-body leading-relaxed">
                                实验学习价值：{paper.experiment_learning_value}
                              </p>
                            )}
                            {paper.defense_value && (
                              <p className="text-xs text-brand-muted font-body leading-relaxed">
                                答辩价值：{paper.defense_value}
                              </p>
                            )}
                          </div>

                          <button
                            onClick={() => void handleGeneratePlan(paper.id)}
                            disabled={planLoadingId === paper.id}
                            className="inline-flex items-center gap-1 text-xs font-medium text-accent-electric hover:text-brand-ink transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {planLoadingId === paper.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                            {expanded ? "收起学习路径" : "生成真实学习路径"}
                            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>

                          {expanded && plan && (
                            <div className="mt-4 p-4 rounded-xl bg-white/60 border border-black/5 space-y-3">
                              <div>
                                <p className="text-xs font-semibold text-brand-ink mb-1">学习目标</p>
                                <p className="text-xs text-brand-muted">{plan.learning_goal}</p>
                              </div>
                              {plan.prerequisite_concepts.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold text-brand-ink mb-1">前置概念</p>
                                  <div className="flex flex-wrap gap-1">
                                    {plan.prerequisite_concepts.map((concept) => (
                                      <span key={concept} className="text-[10px] px-1.5 py-0.5 rounded bg-accent-electric/10 text-accent-electric font-body">
                                        {concept}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              <div>
                                <p className="text-xs font-semibold text-brand-ink mb-1">阅读步骤</p>
                                {plan.reading_steps.map((step, index) => (
                                  <p key={`${paper.id}-step-${index}`} className="text-xs text-brand-muted">{step}</p>
                                ))}
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-brand-ink mb-1">实验思考</p>
                                {plan.experiment_thinking.map((step, index) => (
                                  <p key={`${paper.id}-exp-${index}`} className="text-xs text-brand-muted">{step}</p>
                                ))}
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-brand-ink mb-1">答辩要点</p>
                                {plan.defense_talking_points.map((point, index) => (
                                  <p key={`${paper.id}-def-${index}`} className="text-xs text-brand-muted">{point}</p>
                                ))}
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-brand-ink mb-1">讨论问题</p>
                                {plan.discussion_questions.map((question, index) => (
                                  <p key={`${paper.id}-q-${index}`} className="text-xs text-brand-muted">· {question}</p>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {defenseOutline && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-accent-amber" />
              <h2 className="font-display text-lg font-bold text-brand-ink">后端答辩提纲</h2>
            </div>
            <div className="glass-card rounded-2xl p-6 md:p-8">
              <pre className="text-sm text-brand-ink font-body leading-relaxed whitespace-pre-wrap">
                {defenseOutline.join("\n")}
              </pre>
            </div>
          </div>
        )}

        {generatedTasks.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="w-5 h-5 text-accent-cyan" />
              <h2 className="font-display text-lg font-bold text-brand-ink">后端科研任务</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {generatedTasks.map((task) => (
                <div key={task.id} className="glass-card rounded-2xl p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-display font-bold text-sm text-brand-ink">{task.title}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      task.difficulty === "入门" ? "bg-green-100 text-green-700" :
                      task.difficulty === "挑战" ? "bg-red-100 text-red-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>{task.difficulty}</span>
                  </div>
                  <p className="text-xs text-brand-muted font-body mb-2">{task.scenario}</p>
                  <p className="text-xs text-brand-muted font-body mb-2">输入知识：{task.input_knowledge}</p>
                  <p className="text-xs text-brand-muted font-body mb-2">预期输出：{task.expected_output}</p>
                  <div className="mb-2">
                    <p className="text-[10px] font-semibold text-brand-faint mb-1">步骤</p>
                    {task.steps.map((step, index) => (
                      <p key={`${task.id}-step-${index}`} className="text-xs text-brand-muted">· {step}</p>
                    ))}
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-brand-faint mb-1">评价标准</p>
                    {task.evaluation_rubric.map((rubric, index) => (
                      <p key={`${task.id}-rubric-${index}`} className="text-xs text-brand-muted">· {rubric}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center pt-10 border-t border-black/5">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-brand-faint" />
            <span className="text-xs text-brand-faint font-body">工作台数据源说明</span>
          </div>
          <p className="text-sm text-brand-muted font-body max-w-2xl mx-auto">
            当前文献工作台只读取后端真实文献库。文献详情、学习计划、答辩提纲和科研任务都围绕后端 research_papers 运行，不再依赖前端内置文献假数据。
          </p>
        </div>
      </div>
    </div>
  );
}
