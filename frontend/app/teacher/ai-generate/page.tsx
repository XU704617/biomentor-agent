"use client";

import { useState } from "react";
import { Sparkles, Send, RefreshCw, Copy, ChevronDown, Plus } from "lucide-react";

const courses = ["基因工程", "发酵工程", "代谢工程", "合成生物学", "蛋白质工程"];
const questionTypes = [
  { value: "single", label: "单选题" },
  { value: "multiple", label: "多选题" },
  { value: "judge", label: "判断题" },
  { value: "essay", label: "简答题" },
];
const difficulties = [
  { value: 1, label: "⭐ 简单" },
  { value: 2, label: "⭐⭐ 较易" },
  { value: 3, label: "⭐⭐⭐ 中等" },
  { value: 4, label: "⭐⭐⭐⭐ 较难" },
  { value: 5, label: "⭐⭐⭐⭐⭐ 困难" },
];

interface GeneratedQuestion {
  id: string;
  content: string;
  type: string;
  difficulty: number;
  options?: string[];
  answer: string;
}

export default function AIGeneratePage() {
  const [course, setCourse] = useState(courses[0]);
  const [qtype, setQtype] = useState(questionTypes[0].value);
  const [difficulty, setDifficulty] = useState(3);
  const [count, setCount] = useState(5);
  const [chapter, setChapter] = useState("");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);

  const handleGenerate = () => {
    setLoading(true);
    const generated: GeneratedQuestion[] = Array.from({ length: count }, (_, i) => ({
      id: `gen-${Date.now()}-${i}`,
      content: `[AI生成] ${course} - ${
        qtype === "single"
          ? "下列关于"
          : qtype === "multiple"
          ? "以下哪些属于"
          : qtype === "judge"
          ? "判断下列说法是否正确："
          : "请简述"
      }${chapter || "相关知识"}${qtype === "judge" ? "" : "？"}
（模拟AI生成题目内容，实际部署时对接LLM API）`,
      type: qtype,
      difficulty,
      options:
        qtype === "single" || qtype === "multiple"
          ? ["A. 选项一（模拟）", "B. 选项二（模拟）", "C. 选项三（模拟）", "D. 选项四（模拟）"]
          : undefined,
      answer:
        qtype === "judge" ? "正确" : qtype === "essay" ? "（参考答案：略）" : "A",
    }));

    setTimeout(() => {
      setQuestions(generated);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">AI 智能出题</h1>
          <p className="text-text-muted mt-1">使用 AI 自动生成高质量生物制造题目</p>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-xs text-text-muted mb-1.5">目标课程</label>
            <div className="relative">
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full appearance-none px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-text-primary focus:outline-none focus:border-primary/40 transition-colors"
              >
                {courses.map((c) => (
                  <option key={c} value={c} className="bg-bg-dark">
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1.5">题目类型</label>
            <div className="relative">
              <select
                value={qtype}
                onChange={(e) => setQtype(e.target.value)}
                className="w-full appearance-none px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-text-primary focus:outline-none focus:border-primary/40 transition-colors"
              >
                {questionTypes.map((qt) => (
                  <option key={qt.value} value={qt.value} className="bg-bg-dark">
                    {qt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1.5">难度等级</label>
            <div className="relative">
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(Number(e.target.value))}
                className="w-full appearance-none px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-text-primary focus:outline-none focus:border-primary/40 transition-colors"
              >
                {difficulties.map((d) => (
                  <option key={d.value} value={d.value} className="bg-bg-dark">
                    {d.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1.5">生成数量</label>
            <input
              type="number"
              min={1}
              max={20}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-text-primary focus:outline-none focus:border-primary/40 transition-colors"
            />
          </div>
        </div>
        <div className="mb-6">
          <label className="block text-xs text-text-muted mb-1.5">章节知识点（可选）</label>
          <input
            type="text"
            value={chapter}
            onChange={(e) => setChapter(e.target.value)}
            placeholder="例如：CRISPR-Cas9 基因编辑原理"
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/40 transition-colors"
          />
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              生成中...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              开始生成
            </>
          )}
        </button>
      </div>

      {questions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">生成结果（{questions.length} 题）</h3>
            <button className="btn-accent text-sm flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              加入题库
            </button>
          </div>
          {questions.map((q, i) => (
            <div key={q.id} className="glass-card p-5 animate-slide-up">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary-light">
                  第 {i + 1} 题
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-text-muted">
                  {questionTypes.find((t) => t.value === q.type)?.label}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-text-muted">
                  {"⭐".repeat(q.difficulty)}
                </span>
              </div>
              <p className="text-sm text-text-primary mb-3">{q.content}</p>
              {q.options && (
                <div className="space-y-1.5 mb-3 ml-2">
                  {q.options.map((opt, oi) => (
                    <p key={oi} className="text-xs text-text-secondary">
                      {opt}
                    </p>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between">
                <p className="text-xs text-accent">答案：{q.answer}</p>
                <button className="flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary transition-colors">
                  <Copy className="w-3 h-3" />
                  复制
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
