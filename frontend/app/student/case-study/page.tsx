"use client";

import { useState } from "react";
import { Search, BookOpen, Clock, ChevronRight, Filter, Tag, ArrowRight, ExternalLink } from "lucide-react";
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">科研案例辅导</h1>
          <p className="text-text-muted mt-1">
            通过真实科研案例加深对知识的理解
          </p>
        </div>
      </div>

      {!selectedStudy ? (
        <>
          <div className="glass-card p-4 flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="搜索案例标题或标签..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/40 transition-colors"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass text-sm text-text-secondary hover:text-text-primary transition-colors">
              <Filter className="w-4 h-4" />
              筛选
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((cs) => (
              <button
                key={cs.id}
                onClick={() => setSelectedStudy(cs.id)}
                className="glass-card p-5 text-left hover:scale-[1.02] transition-all hover:shadow-lg hover:border-white/15 group"
              >
                <div className="flex items-start gap-2 mb-3">
                  <BookOpen className="w-5 h-5 text-primary-light flex-shrink-0 mt-0.5" />
                  <h3 className="text-sm font-semibold text-text-primary line-clamp-2 group-hover:text-primary-light transition-colors">
                    {cs.title}
                  </h3>
                </div>
                <p className="text-xs text-text-secondary line-clamp-3 mb-4 leading-relaxed">
                  {cs.summary}
                </p>
                <div className="flex items-center flex-wrap gap-1.5 mb-3">
                  {cs.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/5 text-text-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <div className="flex items-center gap-3 text-[10px] text-text-muted">
                    <span className="flex items-center gap-1">
                      {"⭐".repeat(cs.difficulty)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(cs.publishDate)}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-primary-light group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="animate-fade-in space-y-6">
          <button
            onClick={() => setSelectedStudy(null)}
            className="text-sm text-primary-light hover:text-primary transition-colors flex items-center gap-1"
          >
            ← 返回案例列表
          </button>

          {study && (
            <>
              <div className="glass-card p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/5 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-primary-light" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-text-primary">{study.title}</h2>
                    <div className="flex items-center gap-3 mt-2">
                      {study.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-text-secondary"
                        >
                          <Tag className="w-3 h-3 inline mr-1" />
                          {tag}
                        </span>
                      ))}
                      <span className="text-xs text-text-muted">
                        难度：{"⭐".repeat(study.difficulty)}
                      </span>
                      <span className="text-xs text-text-muted">
                        {formatDate(study.publishDate)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                  <h3 className="text-sm font-semibold mb-2">案例概述</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{study.summary}</p>
                </div>
              </div>

              <div className="glass-card p-6">
                <h3 className="text-sm font-semibold mb-4">📖 案例背景</h3>
                <p className="text-sm text-text-secondary leading-relaxed mb-6">
                  生物制造是运用生物学原理和工程技术，利用生物体或其组成部分进行产品生产的新兴领域。在合成生物学和代谢工程的推动下，通过理性设计和改造微生物细胞工厂，可以实现高附加值化合物的高效生物合成。本案例将带领你深入了解前沿科研方法。
                </p>

                <h3 className="text-sm font-semibold mb-3">🔑 核心知识点</h3>
                <div className="space-y-2 mb-6">
                  {[
                    "基因编辑工具的选择与应用策略",
                    "代谢通路改造的关键设计原则",
                    "发酵过程中关键参数的优化与控制",
                    "合成生物学标准化元件的设计与应用",
                  ].map((k, i) => (
                    <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary-light text-xs flex items-center justify-center flex-shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-xs text-text-secondary">{k}</span>
                    </div>
                  ))}
                </div>

                <h3 className="text-sm font-semibold mb-3">💡 思考题</h3>
                <div className="space-y-3 mb-6">
                  {[
                    "为什么选择CRISPR-Cas9而不是传统的同源重组方法？",
                    "在代谢通路改造中，如何平衡菌体生长与产物合成？",
                    "发酵工艺放大过程中，哪些参数最容易出现偏差？",
                  ].map((q, i) => (
                    <div key={i} className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
                      <p className="text-xs text-text-secondary">
                        <span className="text-purple-400 font-medium mr-1">Q{i + 1}.</span>
                        {q}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <button className="btn-primary text-sm flex items-center gap-1.5">
                    开始学习
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl glass text-sm text-text-secondary hover:text-text-primary transition-colors">
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
