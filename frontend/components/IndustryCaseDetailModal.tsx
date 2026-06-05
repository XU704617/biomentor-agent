"use client";

import { X, BookOpen, Lightbulb, Factory, ExternalLink, FlaskConical, Target, Search } from "lucide-react";
import Link from "next/link";
import type { IndustryCase } from "@/data/industryCases";

interface IndustryCaseDetailModalProps {
  caseData: IndustryCase;
  onClose: () => void;
}

const refTypeStyles: Record<string, string> = {
  FDA: "bg-blue-50 text-blue-700 border-blue-200",
  PubMed: "bg-green-50 text-green-700 border-green-200",
  DOI: "bg-purple-50 text-purple-700 border-purple-200",
  NCI: "bg-teal-50 text-teal-700 border-teal-200",
  Label: "bg-amber-50 text-amber-700 border-amber-200",
  Review: "bg-cyan-50 text-cyan-700 border-cyan-200",
  ProductPage: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Other: "bg-gray-50 text-gray-600 border-gray-200",
};

const refTypeLabels: Record<string, string> = {
  ProductPage: "产品页",
};

function hasText(value: string | undefined | null) {
  return typeof value === "string" && value.trim().length > 0;
}

function hasItems(items: string[] | undefined | null) {
  return Array.isArray(items) && items.some((item) => hasText(item));
}

function cleanItems(items: string[] | undefined | null) {
  return (items || []).filter((item) => hasText(item));
}

export function IndustryCaseDetailModal({ caseData, onClose }: IndustryCaseDetailModalProps) {
  const c = caseData;
  const researchParams = new URLSearchParams({
    caseId: c.id,
    caseTitle: c.title,
    category: c.category,
    coreQuestion: c.coreProblem,
    keywords: c.recommendedKeywords.slice(0, 6).join(","),
  });
  const discussionQuestions = cleanItems(c.guideQuestions);
  const readingDirections = [
    c.recommendedKeywords.slice(0, 3).join(" / "),
    c.relatedKnowledgePoints.slice(0, 3).join(" / "),
    c.references[0]?.title || "",
  ].filter(Boolean);
  const migrationPath = {
    textbookBase: cleanItems(c.migrationPath.textbookBase),
    researchFrontier: cleanItems(c.migrationPath.researchFrontier),
    industryApplication: cleanItems(c.migrationPath.industryApplication),
  };
  const hasMigrationPath = hasItems(migrationPath.textbookBase) || hasItems(migrationPath.researchFrontier) || hasItems(migrationPath.industryApplication);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto pt-12 pb-12">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-3xl mx-4 glass-card rounded-2xl overflow-hidden animate-reveal-up">
        <div className="sticky top-0 z-20 flex items-center justify-between p-5 border-b border-black/5 bg-white/90 backdrop-blur-md rounded-t-2xl">
          <div className="flex-1 min-w-0 mr-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="badge badge-electric text-[10px]">{c.industryDirection}</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.evidenceLevel === "高" ? "bg-green-50 text-green-700" : c.evidenceLevel === "中" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"}`}>
                {c.evidenceLevel}证据
              </span>
            </div>
            <h2 className="font-display text-lg font-extrabold text-brand-ink truncate">{c.title}</h2>
            <p className="text-xs text-brand-faint font-body mt-0.5">{c.subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-black/5 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5 text-brand-faint" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* 案例背景 */}
          {hasText(c.background) && (
            <section>
              <h3 className="font-display text-sm font-bold text-brand-ink mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-500" />
                案例背景
              </h3>
              <p className="text-sm text-brand-muted font-body leading-relaxed whitespace-pre-line">{c.background}</p>
            </section>
          )}

          {/* 科研基础 */}
          {hasText(c.researchFoundation) && (
            <section>
              <h3 className="font-display text-sm font-bold text-brand-ink mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                科研基础
              </h3>
              <p className="text-sm text-brand-muted font-body leading-relaxed whitespace-pre-line">{c.researchFoundation}</p>
            </section>
          )}

          {/* 核心科学问题 */}
          {hasText(c.coreProblem) && (
            <section>
              <h3 className="font-display text-sm font-bold text-brand-ink mb-2 flex items-center gap-2">
                <Target className="w-4 h-4 text-rose-500" />
                核心科学问题
              </h3>
              <p className="text-sm text-brand-muted font-body leading-relaxed whitespace-pre-line">{c.coreProblem}</p>
            </section>
          )}

          {/* 知识迁移路径 */}
          {hasMigrationPath && (
          <section>
            <h3 className="font-display text-sm font-bold text-brand-ink mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-500" />
              知识迁移路径
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-xl bg-blue-50/60 p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="w-5 h-5 rounded-md bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center">1</span>
                  <span className="text-xs font-bold text-blue-700">课本基础</span>
                </div>
                <ul className="space-y-1">
                  {migrationPath.textbookBase.map((item, i) => (
                    <li key={i} className="text-xs text-brand-muted font-body flex items-start gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl bg-cyan-50/60 p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="w-5 h-5 rounded-md bg-cyan-500 text-white text-[10px] font-bold flex items-center justify-center">2</span>
                  <span className="text-xs font-bold text-cyan-700">科研前沿</span>
                </div>
                <ul className="space-y-1">
                  {migrationPath.researchFrontier.map((item, i) => (
                    <li key={i} className="text-xs text-brand-muted font-body flex items-start gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl bg-amber-50/60 p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="w-5 h-5 rounded-md bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">3</span>
                  <span className="text-xs font-bold text-amber-700">产业应用</span>
                </div>
                <ul className="space-y-1">
                  {migrationPath.industryApplication.map((item, i) => (
                    <li key={i} className="text-xs text-brand-muted font-body flex items-start gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
          )}

          {/* 应用场景 */}
          {hasText(c.applicationScenario) && (
            <section>
              <h3 className="font-display text-sm font-bold text-brand-ink mb-2 flex items-center gap-2">
                <Factory className="w-4 h-4 text-orange-500" />
                应用场景
              </h3>
              <p className="text-sm text-brand-muted font-body leading-relaxed whitespace-pre-line">{c.applicationScenario}</p>
            </section>
          )}

          {/* 应用价值 */}
          {hasText(c.applicationValue) && (
            <section>
              <h3 className="font-display text-sm font-bold text-brand-ink mb-2 flex items-center gap-2">
                <Target className="w-4 h-4 text-rose-500" />
                应用价值
              </h3>
              <p className="text-sm text-brand-muted font-body leading-relaxed whitespace-pre-line">{c.applicationValue}</p>
            </section>
          )}

          {/* 展示重点 */}
          {hasText(c.displayFocus) && (
          <section>
            <div className="rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50/50 p-4">
              <h3 className="font-display text-xs font-bold text-brand-ink mb-1.5 uppercase tracking-wider">推荐展示重点</h3>
              <p className="text-sm text-brand-muted font-body">{c.displayFocus}</p>
            </div>
          </section>
          )}

          {/* 标签区：知识点 + 能力 + 关键词 */}
          <section className="space-y-4">
            {hasItems(c.relatedKnowledgePoints) && (
            <div>
              <h3 className="font-display text-xs font-bold text-brand-ink mb-2 uppercase tracking-wider">相关知识点</h3>
              <div className="flex flex-wrap gap-1.5">
                {cleanItems(c.relatedKnowledgePoints).map((kp, i) => (
                  <span key={i} className="badge badge-cyan text-[11px]">{kp}</span>
                ))}
              </div>
            </div>
            )}
            {hasItems(c.requiredAbilities) && (
            <div>
              <h3 className="font-display text-xs font-bold text-brand-ink mb-2 uppercase tracking-wider">适合训练能力</h3>
              <div className="flex flex-wrap gap-1.5">
                {cleanItems(c.requiredAbilities).map((ab, i) => (
                  <span key={i} className="badge badge-amber text-[11px]">{ab}</span>
                ))}
              </div>
            </div>
            )}
            {hasItems(c.recommendedKeywords) && (
            <div>
              <h3 className="font-display text-xs font-bold text-brand-ink mb-2 uppercase tracking-wider">推荐检索关键词</h3>
              <div className="flex flex-wrap gap-1.5">
                {cleanItems(c.recommendedKeywords).map((kw, i) => (
                  <code key={i} className="text-[10px] font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                    {kw}
                  </code>
                ))}
              </div>
            </div>
            )}
          </section>

          {/* 讨论与阅读 */}
          {(discussionQuestions.length > 0 || readingDirections.length > 0) && (
          <section className="grid gap-3 md:grid-cols-2">
            {discussionQuestions.length > 0 && (
            <div className="rounded-xl bg-white/60 border border-black/5 p-4">
              <h3 className="font-display text-xs font-bold text-brand-ink mb-2 uppercase tracking-wider">可讨论问题</h3>
              <ul className="space-y-1.5">
                {discussionQuestions.map((question, i) => (
                  <li key={i} className="text-xs text-brand-muted leading-relaxed flex gap-1.5">
                    <span className="text-blue-500 shrink-0">{i + 1}.</span>
                    <span>{question}</span>
                  </li>
                ))}
              </ul>
            </div>
            )}
            {readingDirections.length > 0 && (
            <div className="rounded-xl bg-white/60 border border-black/5 p-4">
              <h3 className="font-display text-xs font-bold text-brand-ink mb-2 uppercase tracking-wider">推荐阅读方向</h3>
              <ul className="space-y-1.5">
                {readingDirections.map((direction, i) => (
                  <li key={i} className="text-xs text-brand-muted leading-relaxed flex gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                    <span>{direction}</span>
                  </li>
                ))}
              </ul>
            </div>
            )}
          </section>
          )}

          {hasText(c.notes) && (
            <section>
              <div className="rounded-xl bg-slate-50/70 border border-slate-200/70 p-4">
                <h3 className="font-display text-xs font-bold text-brand-ink mb-1.5 uppercase tracking-wider">备注</h3>
                <p className="text-xs text-brand-muted font-body leading-relaxed whitespace-pre-line">{c.notes}</p>
              </div>
            </section>
          )}

          {/* 可关联训练任务 */}
          {hasText(c.linkedResearchTask) && (
          <section className="border-t border-black/5 pt-5">
            <h3 className="font-display text-sm font-bold text-brand-ink mb-2 flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-500" />
              关联科研实战任务
            </h3>
            <div className="flex items-center justify-between rounded-xl bg-blue-50/40 p-4">
              <div>
                <p className="text-sm font-semibold text-brand-ink">{c.linkedResearchTask}</p>
                <p className="text-[11px] text-brand-faint font-mono mt-0.5">caseId: {c.id}</p>
              </div>
              <Link
                href={`/research?${researchParams.toString()}`}
                className="flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl transition-colors cursor-pointer shrink-0"
              >
                <FlaskConical className="w-3.5 h-3.5" />
                进入科研实战
              </Link>
            </div>
          </section>
          )}

          {/* 参考来源 */}
          {c.references.length > 0 && (
          <section className="border-t border-black/5 pt-5">
            <h3 className="font-display text-sm font-bold text-brand-ink mb-3 flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-brand-faint" />
              参考来源
            </h3>
            <div className="space-y-2">
              {c.references.map((ref, i) => (
                <a
                  key={i}
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-black/[0.02] transition-colors group"
                >
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${refTypeStyles[ref.type] || refTypeStyles.Other}`}>
                    {refTypeLabels[ref.type] || ref.type}
                  </span>
                  <span className="text-xs text-brand-muted font-body group-hover:text-blue-600 transition-colors flex-1 leading-snug">
                    {ref.title}
                  </span>
                  <ExternalLink className="w-3 h-3 text-brand-faint/40 group-hover:text-blue-500 transition-colors shrink-0" />
                </a>
              ))}
            </div>
          </section>
          )}
        </div>
      </div>
    </div>
  );
}
