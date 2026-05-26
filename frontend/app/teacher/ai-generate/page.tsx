"use client";

import { useState } from "react";
import { Sparkles, RefreshCw, Copy, ChevronDown, Plus } from "lucide-react";

const courses = ["基因工程", "发酵工程", "代谢工程", "合成生物学", "蛋白质工程"];
const questionTypes = [
  { value: "single", label: "单选题" },
  { value: "multiple", label: "多选题" },
  { value: "judge", label: "判断题" },
  { value: "essay", label: "简答题" },
];
const difficulties = [
  { value: 1, label: "简单" },
  { value: 2, label: "较易" },
  { value: 3, label: "中等" },
  { value: 4, label: "较难" },
  { value: 5, label: "困难" },
];

const difficultyStars: Record<number, string> = {
  1: "\u2605",
  2: "\u2605\u2605",
  3: "\u2605\u2605\u2605",
  4: "\u2605\u2605\u2605\u2605",
  5: "\u2605\u2605\u2605\u2605\u2605",
};

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
      content: `[AI\u751F\u6210] ${course} - ${
        qtype === "single"
          ? "\u4E0B\u5217\u5173\u4E8E"
          : qtype === "multiple"
          ? "\u4EE5\u4E0B\u54EA\u4E9B\u5C5E\u4E8E"
          : qtype === "judge"
          ? "\u5224\u65AD\u4E0B\u5217\u8BF4\u6CD5\u662F\u5426\u6B63\u786E\uFF1A"
          : "\u8BF7\u7B80\u8FF0"
      }${chapter || "\u76F8\u5173\u77E5\u8BC6"}${qtype === "judge" ? "" : "\uFF1F"}
\uFF08\u6A21\u62DFAI\u751F\u6210\u9898\u76EE\u5185\u5BB9\uFF0C\u5B9E\u9645\u90E8\u7F72\u65F6\u5BF9\u63A5LLM API\uFF09`,
      type: qtype,
      difficulty,
      options:
        qtype === "single" || qtype === "multiple"
          ? ["A. \u9009\u9879\u4E00\uFF08\u6A21\u62DF\uFF09", "B. \u9009\u9879\u4E8C\uFF08\u6A21\u62DF\uFF09", "C. \u9009\u9879\u4E09\uFF08\u6A21\u62DF\uFF09", "D. \u9009\u9879\u56DB\uFF08\u6A21\u62DF\uFF09"]
          : undefined,
      answer:
        qtype === "judge" ? "\u6B63\u786E" : qtype === "essay" ? "\uFF08\u53C2\u8003\u7B54\u6848\uFF1A\u7565\uFF09" : "A",
    }));

    setTimeout(() => {
      setQuestions(generated);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-8">
      <div className="page-header">
        <h1>AI \u667A\u80FD\u51FA\u9898</h1>
        <p>\u4F7F\u7528 AI \u81EA\u52A8\u751F\u6210\u9AD8\u8D28\u91CF\u751F\u7269\u5236\u9020\u9898\u76EE</p>
      </div>

      <div className="lab-card p-6 animate-reveal">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-[12px] text-ink-faint mb-1.5">\u76EE\u6807\u8BFE\u7A0B</label>
            <div className="relative">
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="lab-select w-full"
              >
                {courses.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-[12px] text-ink-faint mb-1.5">\u9898\u76EE\u7C7B\u578B</label>
            <div className="relative">
              <select
                value={qtype}
                onChange={(e) => setQtype(e.target.value)}
                className="lab-select w-full"
              >
                {questionTypes.map((qt) => (
                  <option key={qt.value} value={qt.value}>
                    {qt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-[12px] text-ink-faint mb-1.5">\u96BE\u5EA6\u7B49\u7EA7</label>
            <div className="relative">
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(Number(e.target.value))}
                className="lab-select w-full"
              >
                {difficulties.map((d) => (
                  <option key={d.value} value={d.value}>
                    {difficultyStars[d.value]} {d.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-[12px] text-ink-faint mb-1.5">\u751F\u6210\u6570\u91CF</label>
            <input
              type="number"
              min={1}
              max={20}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="lab-input"
            />
          </div>
        </div>
        <div className="mb-6">
          <label className="block text-[12px] text-ink-faint mb-1.5">\u7AE0\u8282\u77E5\u8BC6\u70B9\uFF08\u53EF\u9009\uFF09</label>
          <input
            type="text"
            value={chapter}
            onChange={(e) => setChapter(e.target.value)}
            placeholder="\u4F8B\u5982\uFF1ACRISPR-Cas9 \u57FA\u56E0\u7F16\u8F91\u539F\u7406"
            className="lab-input"
          />
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="btn-amber text-sm"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              \u751F\u6210\u4E2D...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              \u5F00\u59CB\u751F\u6210
            </>
          )}
        </button>
      </div>

      {questions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3>\u751F\u6210\u7ED3\u679C\uFF08{questions.length} \u9898\uFF09</h3>
            <button className="btn-sage text-sm">
              <Plus className="w-3.5 h-3.5" />
              \u52A0\u5165\u9898\u5E93
            </button>
          </div>
          {questions.map((q, i) => (
            <div key={q.id} className="lab-card p-5 animate-reveal">
              <div className="flex items-center gap-3 mb-3">
                <span className="badge badge-amber text-[11px]">
                  \u7B2C {i + 1} \u9898
                </span>
                <span className="badge badge-muted text-[11px]">
                  {questionTypes.find((t) => t.value === q.type)?.label}
                </span>
                <span className="badge badge-muted text-[11px]">
                  {difficultyStars[q.difficulty]}
                </span>
              </div>
              <p className="text-[14px] text-ink mb-3">{q.content}</p>
              {q.options && (
                <div className="space-y-1.5 mb-3 ml-2">
                  {q.options.map((opt, oi) => (
                    <p key={oi} className="text-[12px] text-ink-muted">
                      {opt}
                    </p>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between">
                <p className="text-[12px] text-sage">\u7B54\u6848\uFF1A{q.answer}</p>
                <button className="flex items-center gap-1 text-[12px] text-ink-faint hover:text-ink-muted transition-colors">
                  <Copy className="w-3 h-3" />
                  \u590D\u5236
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
