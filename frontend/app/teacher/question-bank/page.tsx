"use client";

import { useState } from "react";
import { Search, Filter, Trash2, Edit, Eye, Plus } from "lucide-react";
import { questionBank } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

const typeLabel: Record<string, string> = {
  single: "单选题",
  multiple: "多选题",
  judge: "判断题",
  essay: "简答题",
};

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">题库管理</h1>
          <p className="text-text-muted mt-1">管理所有课程题库题目</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-primary text-sm flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            添加题目
          </button>
          <button className="btn-accent text-sm">AI 批量导入</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="glass-card p-3 text-center">
          <p className="text-2xl font-bold text-primary-light">{questionBank.length}</p>
          <p className="text-xs text-text-muted mt-1">题目总数</p>
        </div>
        <div className="glass-card p-3 text-center">
          <p className="text-2xl font-bold text-accent">
            {questionBank.filter((q) => q.type === "single").length}
          </p>
          <p className="text-xs text-text-muted mt-1">单选题</p>
        </div>
        <div className="glass-card p-3 text-center">
          <p className="text-2xl font-bold text-purple-400">
            {questionBank.filter((q) => q.type === "multiple").length}
          </p>
          <p className="text-xs text-text-muted mt-1">多选题</p>
        </div>
        <div className="glass-card p-3 text-center">
          <p className="text-2xl font-bold text-warning">
            {questionBank.filter((q) => q.type === "essay").length}
          </p>
          <p className="text-xs text-text-muted mt-1">简答题</p>
        </div>
      </div>

      <div className="glass-card p-4 flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="搜索题目内容或标签..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/40 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-text-muted" />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-text-primary focus:outline-none focus:border-primary/40 transition-colors"
          >
            <option value="all" className="bg-bg-dark">全部类型</option>
            <option value="single" className="bg-bg-dark">单选题</option>
            <option value="multiple" className="bg-bg-dark">多选题</option>
            <option value="judge" className="bg-bg-dark">判断题</option>
            <option value="essay" className="bg-bg-dark">简答题</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((q) => (
          <div key={q.id} className="glass-card p-4 hover:border-white/15 transition-all">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary-light">
                    {typeLabel[q.type]}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-text-muted">
                    {"⭐".repeat(q.difficulty)}
                  </span>
                  <span className="text-xs text-text-muted">{q.course} · {q.chapter}</span>
                </div>
                <p className="text-sm text-text-primary leading-relaxed line-clamp-2">
                  {q.content}
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                  {q.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/5 text-text-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                  <Eye className="w-4 h-4 text-text-muted" />
                </button>
                <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                  <Edit className="w-4 h-4 text-text-muted" />
                </button>
                <button className="p-2 rounded-lg hover:bg-danger/10 transition-colors">
                  <Trash2 className="w-4 h-4 text-text-muted hover:text-danger" />
                </button>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-white/5">
              <p className="text-[10px] text-text-muted">创建于 {formatDate(q.createdAt)}</p>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-text-muted">
            <p className="text-sm">未找到匹配的题目</p>
          </div>
        )}
      </div>
    </div>
  );
}
