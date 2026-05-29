"use client";

import { useState, useEffect, useCallback } from "react";
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
} from "lucide-react";
import Link from "next/link";
import type { IndustryCase } from "@/data/industryCases";
import { getIndustryCaseById } from "@/lib/industryApi";
import {
  generateResearchTask,
  generateFallbackResearchTask,
  type ResearchTaskGenerateResponse,
  type ResearchTaskItem,
} from "@/lib/researchApi";

const phases = [
  {
    num: 1,
    title: "文献调研",
    icon: <BookOpen className="w-5 h-5" />,
    description:
      "AI 助手帮你检索相关文献，提取关键信息，构建研究框架与知识图谱",
    accent: "accent-electric",
  },
  {
    num: 2,
    title: "实验设计",
    icon: <FlaskConical className="w-5 h-5" />,
    description:
      "基于文献调研结果，AI 辅助设计实验方案、优化参数、预测潜在风险",
    accent: "accent-cyan",
  },
  {
    num: 3,
    title: "数据分析",
    icon: <BarChart3 className="w-5 h-5" />,
    description:
      "AI 辅助处理实验数据、可视化展示、统计分析与报告撰写",
    accent: "accent-amber",
  },
];

const exampleTopics = [
  "CAR-T 细胞治疗为什么会出现抗原逃逸？",
  "mRNA 疫苗为什么需要 LNP？",
  "Venetoclax 和 BCL-2 的关系？",
  "CRISPR 基因编辑治疗有哪些产业应用？",
];

const taskTypeLabels: Record<string, string> = {
  literature_review: "文献调研",
  experiment_design: "实验设计",
  mechanism_explanation: "机制解释",
  evidence_judgement: "证据判断/数据分析",
};

const taskTypeIcons: Record<string, React.ReactNode> = {
  literature_review: <BookOpen className="w-4 h-4" />,
  experiment_design: <FlaskConical className="w-4 h-4" />,
  mechanism_explanation: <Brain className="w-4 h-4" />,
  evidence_judgement: <BarChart3 className="w-4 h-4" />,
};

function TaskCard({ task, index }: { task: ResearchTaskItem; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl bg-white/60 border border-black/5 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 flex items-start gap-4 text-left hover:bg-white/30 transition-colors"
      >
        <div className="w-10 h-10 rounded-lg bg-accent-electric/10 flex items-center justify-center shrink-0 mt-0.5">
          {taskTypeIcons[task.type] || <Target className="w-4 h-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-semibold text-accent-electric uppercase tracking-wider bg-accent-electric/10 px-2 py-0.5 rounded-full">
              {taskTypeLabels[task.type] || task.type}
            </span>
            <span className="text-xs text-brand-muted">任务 {index + 1}</span>
          </div>
          <h3 className="font-display font-bold text-sm text-brand-ink">{task.title}</h3>
          <p className="text-xs text-brand-muted mt-1 line-clamp-2">{task.goal}</p>
        </div>
        <div className="shrink-0 text-brand-muted">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-black/5 pt-4 space-y-4">
          <div>
            <h4 className="text-xs font-bold text-brand-ink mb-2">任务目标</h4>
            <p className="text-sm text-brand-muted leading-relaxed">{task.goal}</p>
          </div>

          {task.steps && task.steps.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-brand-ink mb-2">操作步骤</h4>
              <div className="space-y-2">
                {task.steps.map((step, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="w-5 h-5 rounded-full bg-accent-electric/10 text-accent-electric flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-brand-ink">{step.title}</p>
                      <p className="text-xs text-brand-muted">{step.description}</p>
                      {step.expected_duration && (
                        <span className="text-[10px] text-brand-faint mt-0.5 inline-block">
                          预计时长：{step.expected_duration}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="text-xs font-bold text-brand-ink mb-2">输出要求</h4>
            <p className="text-sm text-brand-muted leading-relaxed">{task.output_requirement}</p>
          </div>

          {task.suggested_keywords && task.suggested_keywords.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-brand-ink mb-2">推荐关键词</h4>
              <div className="flex flex-wrap gap-1.5">
                {task.suggested_keywords.map((kw, i) => (
                  <span key={i} className="text-xs text-brand-muted bg-white/60 px-2 py-0.5 rounded-md font-mono">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {task.example_outline && (
            <div>
              <h4 className="text-xs font-bold text-brand-ink mb-2">示例提纲</h4>
              <pre className="text-xs text-brand-muted bg-white/40 rounded-lg p-3 font-body leading-relaxed whitespace-pre-wrap">
                {task.example_outline}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DefaultResearchPage() {
  const [topicInput, setTopicInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResearchTaskGenerateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    const topic = topicInput.trim();
    if (!topic) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await generateResearchTask({
        topic,
        case_key: null,
        mode: "independent",
      });
      setResult(data);
    } catch {
      setResult(
        generateFallbackResearchTask(topic, null, "independent")
      );
    } finally {
      setLoading(false);
    }
  }, [topicInput]);

  const handleExampleClick = (topic: string) => {
    setTopicInput(topic);
  };

  return (
    <div className="min-h-screen pt-[var(--nav-height)] px-6 md:px-10 pb-20">
      <div className="max-w-6xl mx-auto pt-8 md:pt-16">
        <div className="text-center mb-12">
          <h1
            className="font-display font-extrabold text-brand-ink leading-[1.1] tracking-[-0.03em] mb-3"
            style={{ fontSize: "clamp(28px, 4vw, 48px)" }}
          >
            科研实战训练营
          </h1>
          <p className="text-brand-muted text-base md:text-lg font-body max-w-xl mx-auto">
            AI 导师全程陪伴式指导，从文献调研到实验设计再到数据分析，系统培养科研能力
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {phases.map((phase) => (
            <div
              key={phase.num}
              className="glass-card rounded-2xl p-6 md:p-7 flex flex-col group cursor-default"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="w-10 h-10 rounded-xl bg-brand-ink/5 flex items-center justify-center text-lg font-bold font-display text-brand-ink">
                  {phase.num}
                </span>
                <div className="w-9 h-9 rounded-xl bg-brand-ink/5 flex items-center justify-center group-hover:bg-brand-ink/10 transition-colors">
                  {phase.icon}
                </div>
              </div>
              <h3 className="font-display text-lg font-bold text-brand-ink mb-2">
                {phase.title}
              </h3>
              <p className="text-sm text-brand-muted font-body leading-relaxed flex-1">
                {phase.description}
              </p>
              <div className="mt-4 pt-4 border-t border-black/5 flex items-center gap-1 text-sm font-medium text-brand-muted group-hover:text-accent-electric transition-colors">
                <span>进入阶段</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>

        <div className="glass-card-iridescent rounded-2xl p-6 md:p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-electric to-accent-cyan flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-brand-ink">
                开始科研训练
              </h2>
              <p className="text-xs text-brand-muted font-body">
                输入研究主题，AI 为你生成结构化科研训练任务
              </p>
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
              {loading ? "生成中..." : "生成科研任务"}
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

        {result && (
          <div className="space-y-6">
            <section className="glass-card rounded-2xl p-6 md:p-8">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-electric to-accent-cyan flex items-center justify-center">
                  <Building2 className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-base text-brand-ink">
                    研究问题
                  </h2>
                  <p className="text-xs text-brand-muted font-body">AI 生成的核心研究框架</p>
                </div>
              </div>

              <div className="rounded-xl bg-blue-50/40 p-4 mb-4">
                <h3 className="font-display font-bold text-lg text-brand-ink mb-2">{result.research_question}</h3>
                <p className="text-sm text-brand-muted font-body leading-relaxed">{result.background}</p>
              </div>

              {result.matched_cases && result.matched_cases.length > 0 && (
                <div className="rounded-xl bg-green-50/40 p-4 mb-4">
                  <h4 className="text-xs font-bold text-brand-ink mb-2">匹配产业案例</h4>
                  <div className="space-y-2">
                    {result.matched_cases.map((c, i) => (
                      <Link
                        key={i}
                        href={`/research?caseId=${c.case_key}`}
                        className="flex items-center gap-2 text-sm text-accent-electric hover:underline"
                      >
                        <ChevronRight className="w-3 h-3" />
                        {c.title}（{c.case_key}）
                        <span className="text-xs text-brand-muted">— {c.reason}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {result.related_knowledge_points && result.related_knowledge_points.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {result.related_knowledge_points.map((kp, i) => (
                    <span key={i} className="badge badge-cyan text-xs">{kp}</span>
                  ))}
                </div>
              )}
            </section>

            <section className="glass-card rounded-2xl p-6 md:p-8">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-amber to-accent-electric flex items-center justify-center">
                  <Microscope className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-base text-brand-ink">
                    科研训练任务
                  </h2>
                  <p className="text-xs text-brand-muted font-body">
                    {result.mode === "case_driven" ? "基于产业案例生成" : "基于研究主题生成"}{" "}
                    · {result.tasks.length} 个任务
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {result.tasks.map((task, i) => (
                  <TaskCard key={i} task={task} index={i} />
                ))}
              </div>
            </section>

            <section className="glass-card rounded-2xl p-6 md:p-8">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-amber flex items-center justify-center">
                  <TrendingUp className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-base text-brand-ink">
                    研究引导
                  </h2>
                </div>
              </div>

              <div className="space-y-4">
                {result.expected_outputs && result.expected_outputs.length > 0 && (
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
                    {result.mentor_advice}
                  </p>
                </div>

                <div className="rounded-xl bg-amber-50/40 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    <h4 className="text-sm font-bold text-brand-ink">免责声明</h4>
                  </div>
                  <p className="text-[12px] text-brand-muted font-body leading-relaxed">
                    {result.disclaimer}
                  </p>
                </div>
              </div>
            </section>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
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
    </div>
  );
}

function CaseDrivenResearchPage({ caseData, caseKey }: { caseData: IndustryCase; caseKey: string }) {
  const [result, setResult] = useState<ResearchTaskGenerateResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const data = await generateResearchTask({
          topic: caseData.coreProblem || caseData.title,
          case_key: caseKey,
          mode: "case_driven",
        });
        if (!cancelled) setResult(data);
      } catch {
        if (!cancelled) {
          setResult(
            generateFallbackResearchTask(
              caseData.coreProblem || caseData.title,
              caseKey,
              "case_driven"
            )
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [caseData, caseKey]);

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
        <p className="text-brand-muted text-sm md:text-base font-body mb-10">
          {caseData.subtitle}
        </p>

        <div className="space-y-6">
          <section className="glass-card rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-electric to-accent-cyan flex items-center justify-center">
                <Building2 className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <h2 className="font-display font-bold text-base text-brand-ink">
                  当前科研案例
                </h2>
                <p className="text-xs text-brand-muted font-body">
                  产业案例基础信息与核心问题
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
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
                <p className="text-[10px] font-bold text-brand-faint uppercase tracking-wider mb-0.5">科研任务</p>
                <p className="text-sm font-semibold text-brand-ink">{caseData.linkedResearchTask}</p>
              </div>
            </div>

            <div className="rounded-xl bg-white/60 border border-black/5 p-4">
              <p className="text-xs font-bold text-brand-faint uppercase tracking-wider mb-1">核心问题</p>
              <p className="text-sm font-body text-brand-ink leading-relaxed">{caseData.coreProblem}</p>
            </div>
          </section>

          <section className="glass-card rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-2.5 mb-4">
              <BookOpen className="w-4 h-4 text-accent-cyan" />
              <h2 className="font-display font-bold text-base text-brand-ink">
                相关知识点
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {caseData.relatedKnowledgePoints.map((kp, i) => (
                <span key={i} className="badge badge-cyan text-xs">{kp}</span>
              ))}
            </div>
          </section>

          {loading && (
            <section className="glass-card rounded-2xl p-10 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-accent-electric" />
              <p className="text-sm text-brand-muted font-body">正在生成科研训练任务...</p>
            </section>
          )}

          {result && !loading && (
            <>
              <section className="glass-card rounded-2xl p-6 md:p-8">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-amber to-accent-electric flex items-center justify-center">
                    <Microscope className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-base text-brand-ink">
                      科研训练任务
                    </h2>
                    <p className="text-xs text-brand-muted font-body">
                      基于案例核心问题与知识点生成 · {result.tasks.length} 个任务
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-5">
                  {result.tasks.map((task, i) => (
                    <TaskCard key={i} task={task} index={i} />
                  ))}
                </div>
              </section>

              <section className="glass-card rounded-2xl p-6 md:p-8">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-amber flex items-center justify-center">
                    <TrendingUp className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-base text-brand-ink">
                      研究引导
                    </h2>
                    <p className="text-xs text-brand-muted font-body">
                      基于案例字段生成的研究框架
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-xl bg-blue-50/40 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Search className="w-3.5 h-3.5 text-accent-electric" />
                      <h4 className="text-sm font-bold text-brand-ink">研究问题</h4>
                    </div>
                    <p className="text-[13px] text-brand-ink font-body leading-relaxed">{result.research_question}</p>
                    {result.background && (
                      <p className="text-xs text-brand-muted mt-2 leading-relaxed">{result.background}</p>
                    )}
                  </div>

                  <div className="rounded-xl bg-blue-50/40 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Hash className="w-3.5 h-3.5 text-accent-cyan" />
                      <h4 className="text-sm font-bold text-brand-ink">推荐关键词</h4>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {result.related_knowledge_points.map((kw, i) => (
                        <span key={i} className="text-xs text-brand-muted bg-white/60 px-2 py-0.5 rounded-md font-mono">{kw}</span>
                      ))}
                    </div>
                  </div>

                  {result.expected_outputs && result.expected_outputs.length > 0 && (
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
                      {result.mentor_advice}
                    </p>
                  </div>

                  <div className="rounded-xl bg-amber-50/40 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      <h4 className="text-sm font-bold text-brand-ink">免责声明</h4>
                    </div>
                    <p className="text-[12px] text-brand-muted font-body leading-relaxed">
                      {result.disclaimer}
                    </p>
                  </div>
                </div>
              </section>
            </>
          )}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
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
        <h2 className="font-display font-bold text-xl text-brand-ink mb-2">
          未找到对应产业案例
        </h2>
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
    const params = new URLSearchParams(window.location.search);
    const id = params.get("caseId");
    if (id) {
      setCaseId(id);
      setLoadingCase(true);
      getIndustryCaseById(id).then((found) => {
        if (found) {
          setCaseData(found);
        } else {
          setCaseNotFound(true);
        }
        setLoadingCase(false);
      });
    } else {
      setCaseId(null);
    }
  }, []);

  if (caseId === undefined || loadingCase) {
    return null;
  }

  if (caseNotFound) {
    return <InvalidCasePage />;
  }

  if (caseData && caseId) {
    return <CaseDrivenResearchPage caseData={caseData} caseKey={caseId} />;
  }

  return <DefaultResearchPage />;
}