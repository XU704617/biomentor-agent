"use client";

import { useState } from "react";
import { Search, Filter, Trash2, Edit, Eye, Plus, Sparkles } from "lucide-react";
import { questionBank } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

const typeLabel: Record<string, string> = {
  single: "单选题",
  multiple: "多选题",
  judge: "判断题",
  essay: "简答题",
};

const difficultyStars: Record<number, string> = {
  1: "\u2605",
  2: "\u2605\u2605",
  3: "\u2605\u2605\u2605",
  4: "\u2605\u2605\u2605\u2605",
  5: "\u2605\u2605\u2605\u2605\u2605",
};

const statItems = [
  { label: "题目总数", value: questionBank.length, color: "text-amber" },
  { label: "单选题", value: questionBank.filter((q) => q.type === "single").length, color: "text-sage" },
  { label: "多选题", value: questionBank.filter((q) => q.type === "multiple").length, color: "text-sage" },
  { label: "简答题", value: questionBank.filter((q) => q.type === "essay").length, color: "text-rust" },
];

export default function QuestionBankPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");

  const filtered = questionBank.filter((q) => {
    const matchSearch =
      q.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchType = selectedType === "all" || q.type === selectedType;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-8">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1>题库管理</h1>
          <p>管理所有课程题库题目</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-amber text-sm">
            <Plus className="w-4 h-4" />
            添加题目
          </button>
          <button className="btn-sage text-sm">
            <Sparkles className="w-4 h-4" />
            AI 批量导入
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 animate-reveal">
        {statItems.map((item, i) => (
          <div
            key={item.label}
            className={`lab-card p-4 text-center animate-reveal-delay-${i + 1}`}
          >
            <p className={`stat-number text-[22px] font-medium ${item.color}`}>
              {item.value}
            </p>
            <p className="text-[12px] text-ink-faint mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="lab-card p-4 flex items-center gap-4 animate-reveal">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
          <input
            type="text"
            placeholder="搜索题目内容或标签..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="lab-input pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-ink-faint" />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="lab-select"
          >
            <option value="all">全部类型</option>
            <option value="single">单选题</option>
            <option value="multiple">多选题</option>
            <option value="judge">判断题</option>
            <option value="essay">简答题</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map((q) => (
          <div
            key={q.id}
            className="lab-card p-4 animate-reveal"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="badge badge-amber text-[11px]">
                    {typeLabel[q.type]}
                  </span>
                  <span className="badge badge-muted text-[11px]">
                    {difficultyStars[q.difficulty]}
                  </span>
                  <span className="text-[12px] text-ink-faint">
                    {q.course} \u00B7 {q.chapter}
                  </span>
                </div>
                <p className="text-[14px] text-ink leading-relaxed line-clamp-2">
                  {q.content}
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                  {q.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-1.5 py-0.5 rounded-md bg-surface-field text-ink-faint"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button className="p-2 rounded-lg hover:bg-surface-field transition-colors">
                  <Eye className="w-4 h-4 text-ink-faint" />
                </button>
                <button className="p-2 rounded-lg hover:bg-surface-field transition-colors">
                  <Edit className="w-4 h-4 text-ink-faint" />
                </button>
                <button className="p-2 rounded-lg hover:bg-rust/10 transition-colors">
                  <Trash2 className="w-4 h-4 text-ink-faint hover:text-rust" />
                </button>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border-subtle">
              <p className="text-[11px] text-ink-faint">
                创建于 {formatDate(q.createdAt)}
              </p>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-ink-faint">
            <p className="text-[14px]">未找到匹配的题目</p>
          </div>
        )}
      </div>
    </div>
  );
}
