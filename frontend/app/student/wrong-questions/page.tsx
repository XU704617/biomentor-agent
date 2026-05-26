"use client";

import { useState } from "react";
import { Search, Filter, RefreshCw, BookOpen, AlertCircle, ChevronDown } from "lucide-react";
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">错题本</h1>
          <p className="text-text-muted mt-1">收集并回顾你的错题，强化薄弱环节</p>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl glass text-sm text-text-secondary hover:text-text-primary transition-colors">
          <RefreshCw className="w-4 h-4" />
          刷新错题
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-primary-light">{wrongQuestions.length}</p>
          <p className="text-xs text-text-muted mt-1">错题总数</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-accent">
            {wrongQuestions.reduce((s, q) => s + q.wrongCount, 0)}
          </p>
          <p className="text-xs text-text-muted mt-1">累计错误次数</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-purple-400">
            {new Set(wrongQuestions.map((q) => q.course)).size}
          </p>
          <p className="text-xs text-text-muted mt-1">涉及课程</p>
        </div>
      </div>

      <div className="glass-card p-4 flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="搜索错题内容..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/40 transition-colors"
          />
        </div>
        <div className="relative">
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="appearance-none pl-4 pr-8 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-text-primary focus:outline-none focus:border-primary/40 transition-colors"
          >
            {courses.map((c) => (
              <option key={c} value={c} className="bg-bg-dark">
                {c}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((q) => {
          const isExpanded = expandedId === q.id;
          return (
            <div
              key={q.id}
              className="glass-card overflow-hidden hover:border-white/15 transition-all"
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : q.id)}
                className="w-full text-left p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-2 h-2 rounded-full bg-danger flex-shrink-0 mt-1.5" />
                    <div className="min-w-0">
                      <p className="text-sm text-text-primary leading-relaxed line-clamp-2">
                        {q.content}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-text-muted flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {q.course} · {q.chapter}
                        </span>
                        <span className="text-xs text-text-muted flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          错误 {q.wrongCount} 次
                        </span>
                        <span className="text-xs text-text-muted">
                          {formatDate(q.lastWrongDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex items-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${
                      q.wrongCount >= 3
                        ? "bg-danger/10 text-danger border-danger/20"
                        : q.wrongCount >= 2
                        ? "bg-warning/10 text-warning border-warning/20"
                        : "bg-primary/10 text-primary-light border-primary/20"
                    }`}>
                      {q.wrongCount >= 3 ? "高频错误" : q.wrongCount >= 2 ? "需要关注" : "已改善"}
                    </span>
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 pt-0 border-t border-white/5 animate-slide-up">
                  <div className="mt-3 p-3 rounded-xl bg-danger/5 border border-danger/10">
                    <p className="text-xs text-text-muted mb-1">你的答案</p>
                    <p className="text-sm text-danger">{q.myAnswer}</p>
                  </div>
                  <div className="mt-2 p-3 rounded-xl bg-accent/5 border border-accent/10">
                    <p className="text-xs text-text-muted mb-1">正确答案</p>
                    <p className="text-sm text-accent">{q.correctAnswer}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-text-muted">
            <p className="text-sm">未找到相关错题</p>
          </div>
        )}
      </div>
    </div>
  );
}
