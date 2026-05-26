"use client";

import { useState } from "react";
import { Search, RefreshCw, BookOpen, AlertCircle, ChevronDown } from "lucide-react";
import { wrongQuestions } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

const courses = ["全部课程", "基因工程", "发酵工程", "代谢工程"];

export default function WrongQuestionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("全部课程");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = wrongQuestions.filter((q) => {
    const matchSearch = q.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCourse = selectedCourse === "全部课程" || q.course === selectedCourse;
    return matchSearch && matchCourse;
  });

  return (
    <div className="space-y-6 animate-reveal">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink" style={{ fontFamily: "Georgia, serif" }}>
            错题本
          </h1>
          <p className="text-ink-muted mt-1">收集并回顾你的错题，强化薄弱环节</p>
        </div>
        <button className="btn-ghost text-sm flex items-center gap-1.5">
          <RefreshCw className="w-4 h-4" />
          刷新错题
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="lab-card p-4 text-center">
          <p className="stat-number text-2xl text-amber">{wrongQuestions.length}</p>
          <p className="text-xs text-ink-muted mt-1">错题总数</p>
        </div>
        <div className="lab-card p-4 text-center">
          <p className="stat-number text-2xl text-sage">
            {wrongQuestions.reduce((s, q) => s + q.wrongCount, 0)}
          </p>
          <p className="text-xs text-ink-muted mt-1">累计错误次数</p>
        </div>
        <div className="lab-card p-4 text-center">
          <p className="stat-number text-2xl text-amber">
            {new Set(wrongQuestions.map((q) => q.course)).size}
          </p>
          <p className="text-xs text-ink-muted mt-1">涉及课程</p>
        </div>
      </div>

      <div className="lab-card p-4 flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
          <input
            type="text"
            placeholder="搜索错题内容..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="lab-input w-full pl-10"
          />
        </div>
        <div className="relative">
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="lab-select appearance-none pr-8"
          >
            {courses.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint pointer-events-none" />
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((q) => {
          const isExpanded = expandedId === q.id;
          return (
            <div key={q.id} className="lab-card overflow-hidden">
              <button
                onClick={() => setExpandedId(isExpanded ? null : q.id)}
                className="w-full text-left p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-2 h-2 rounded-full bg-rust flex-shrink-0 mt-1.5" />
                    <div className="min-w-0">
                      <p className="text-sm text-ink leading-relaxed line-clamp-2">{q.content}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-ink-muted flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {q.course} · {q.chapter}
                        </span>
                        <span className="text-xs text-ink-muted flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          错误 {q.wrongCount} 次
                        </span>
                        <span className="text-xs text-ink-muted">{formatDate(q.lastWrongDate)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex items-center">
                    <span
                      className={`badge text-xs ${
                        q.wrongCount >= 3
                          ? "badge-rust"
                          : q.wrongCount >= 2
                          ? "badge-amber"
                          : "badge-sage"
                      }`}
                    >
                      {q.wrongCount >= 3 ? "高频错误" : q.wrongCount >= 2 ? "需要关注" : "已改善"}
                    </span>
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 pt-0 border-t border-white/5">
                  <div className="mt-3 p-3 rounded-xl bg-rust/5 border border-rust/10">
                    <p className="text-xs text-ink-muted mb-1">你的答案</p>
                    <p className="text-sm text-rust">{q.myAnswer}</p>
                  </div>
                  <div className="mt-2 p-3 rounded-xl bg-sage/5 border border-sage/10">
                    <p className="text-xs text-ink-muted mb-1">正确答案</p>
                    <p className="text-sm text-sage">{q.correctAnswer}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-ink-muted">
            <p className="text-sm">未找到相关错题</p>
          </div>
        )}
      </div>
    </div>
  );
}
