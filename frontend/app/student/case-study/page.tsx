"use client";

import { useState } from "react";
import {
  Search,
  BookOpen,
  Clock,
  ChevronRight,
  Filter,
  Tag,
  ArrowRight,
  ExternalLink,
  Star,
} from "lucide-react";
import { caseStudies } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

export default function CaseStudyPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudy, setSelectedStudy] = useState<string | null>(null);

  const filtered = caseStudies.filter(
    (c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const study = selectedStudy ? caseStudies.find((s) => s.id === selectedStudy) : null;

  return (
    <div className="space-y-6 animate-reveal">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink" style={{ fontFamily: "Georgia, serif" }}>
            科研案例辅导
          </h1>
          <p className="text-ink-muted mt-1">通过真实科研案例加深对知识的理解</p>
        </div>
      </div>

      {!selectedStudy ? (
        <>
          <div className="lab-card p-4 flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
              <input
                type="text"
                placeholder="搜索案例标题或标签..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="lab-input w-full pl-10"
              />
            </div>
            <button className="btn-ghost text-sm flex items-center gap-2">
              <Filter className="w-4 h-4" />
              筛选
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((cs) => (
              <button
                key={cs.id}
                onClick={() => setSelectedStudy(cs.id)}
                className="lab-card p-5 text-left hover:scale-[1.02] transition-all group"
              >
                <div className="flex items-start gap-2 mb-3">
                  <BookOpen className="w-5 h-5 text-amber flex-shrink-0 mt-0.5" />
                  <h3 className="text-sm font-semibold text-ink line-clamp-2 group-hover:text-amber transition-colors">
                    {cs.title}
                  </h3>
                </div>
                <p className="text-xs text-ink-muted line-clamp-3 mb-4 leading-relaxed">{cs.summary}</p>
                <div className="flex items-center flex-wrap gap-1.5 mb-3">
                  {cs.tags.map((tag) => (
                    <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-md bg-surface-raised text-ink-faint">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <div className="flex items-center gap-3 text-[10px] text-ink-muted">
                    <span className="flex items-center gap-0.5">
                      {Array.from({ length: cs.difficulty }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber/30 text-amber/30" />
                      ))}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(cs.publishDate)}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-ink-faint group-hover:text-amber group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <button
            onClick={() => setSelectedStudy(null)}
            className="text-sm text-amber hover:opacity-80 transition-colors flex items-center gap-1"
          >
            &larr; 返回案例列表
          </button>

          {study && (
            <>
              <div className="lab-card p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber/20 to-sage/5 border border-amber/20 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-amber" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-ink" style={{ fontFamily: "Georgia, serif" }}>
                      {study.title}
                    </h2>
                    <div className="flex items-center gap-3 mt-2">
                      {study.tags.map((tag) => (
                        <span key={tag} className="badge badge-muted text-xs">
                          <Tag className="w-3 h-3 inline mr-1" />
                          {tag}
                        </span>
                      ))}
                      <span className="text-xs text-ink-muted flex items-center gap-0.5">
                        难度：
                        {Array.from({ length: study.difficulty }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber/30 text-amber/30" />
                        ))}
                      </span>
                      <span className="text-xs text-ink-faint">{formatDate(study.publishDate)}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-surface-raised">
                  <h3 className="text-sm font-semibold text-ink mb-2" style={{ fontFamily: "Georgia, serif" }}>
                    案例概述
                  </h3>
                  <p className="text-sm text-ink-muted leading-relaxed">{study.summary}</p>
                </div>
              </div>

              <div className="lab-card p-6">
                <h3 className="text-sm font-semibold text-ink mb-4" style={{ fontFamily: "Georgia, serif" }}>
                  案例背景
                </h3>
                <p className="text-sm text-ink-muted leading-relaxed mb-6">
                  生物制造是运用生物学原理和工程技术，利用生物体或其组成部分进行产品生产的新兴领域。在合成生物学和代谢工程的推动下，通过理性设计和改造微生物细胞工厂，可以实现高附加值化合物的高效生物合成。本案例将带领你深入了解前沿科研方法。
                </p>

                <h3 className="text-sm font-semibold text-ink mb-3" style={{ fontFamily: "Georgia, serif" }}>
                  核心知识点
                </h3>
                <div className="space-y-2 mb-6">
                  {[
                    "基因编辑工具的选择与应用策略",
                    "代谢通路改造的关键设计原则",
                    "发酵过程中关键参数的优化与控制",
                    "合成生物学标准化元件的设计与应用",
                  ].map((k, i) => (
                    <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-raised">
                      <span className="w-5 h-5 rounded-full bg-amber/10 text-amber text-xs flex items-center justify-center flex-shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-xs text-ink-muted">{k}</span>
                    </div>
                  ))}
                </div>

                <h3 className="text-sm font-semibold text-ink mb-3" style={{ fontFamily: "Georgia, serif" }}>
                  思考题
                </h3>
                <div className="space-y-3 mb-6">
                  {[
                    "为什么选择CRISPR-Cas9而不是传统的同源重组方法？",
                    "在代谢通路改造中，如何平衡菌体生长与产物合成？",
                    "发酵工艺放大过程中，哪些参数最容易出现偏差？",
                  ].map((q, i) => (
                    <div key={i} className="p-3 rounded-xl bg-amber/5 border border-amber/10">
                      <p className="text-xs text-ink-muted">
                        <span className="text-amber font-medium mr-1">Q{i + 1}.</span>
                        {q}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <button className="btn-amber text-sm flex items-center gap-1.5">
                    开始学习
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button className="btn-ghost text-sm flex items-center gap-1.5">
                    <ExternalLink className="w-4 h-4" />
                    查看原文
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
