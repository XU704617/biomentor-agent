"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  CheckCircle2,
} from "lucide-react";

const quizQuestions = [
  {
    id: "qzq-1",
    type: "single",
    content: "CRISPR-Cas9 系统中，Cas9 蛋白的主要功能是什么？",
    options: [
      "A. 识别 PAM 序列",
      "B. 切割目标 DNA 双链",
      "C. 引导 crRNA 结合",
      "D. 修复 DNA 断裂",
    ],
  },
  {
    id: "qzq-2",
    type: "single",
    content: "下列哪种限制性内切酶产生平末端？",
    options: ["A. EcoRI", "B. HindIII", "C. SmaI", "D. BamHI"],
  },
  {
    id: "qzq-3",
    type: "single",
    content: "质粒载体中，多克隆位点（MCS）的作用是什么？",
    options: [
      "A. 增强基因表达",
      "B. 提供多个限制酶切位点",
      "C. 筛选重组子",
      "D. 启动 DNA 复制",
    ],
  },
  {
    id: "qzq-4",
    type: "single",
    content: "在发酵过程中，对数生长期的菌体特点是什么？",
    options: [
      "A. 生长速率逐渐下降",
      "B. 菌体数量呈指数增长",
      "C. 次级代谢产物大量合成",
      "D. 菌体开始自溶",
    ],
  },
  {
    id: "qzq-5",
    type: "single",
    content: "代谢工程中，过表达限速酶的主要目的是？",
    options: [
      "A. 降低底物浓度",
      "B. 提高代谢通量",
      "C. 抑制竞争途径",
      "D. 减少副产物生成",
    ],
  },
];

export default function QuizPage() {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const q = quizQuestions[current];
  const answered = Object.keys(answers).length;

  const handleSelect = (option: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [q.id]: option }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  return (
    <div className="space-y-6 animate-reveal">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink" style={{ fontFamily: "Georgia, serif" }}>
            基因工程原理 - 第三章测验
          </h1>
          <p className="text-ink-muted mt-1">单选题 · 共 {quizQuestions.length} 题</p>
        </div>
        <div className="flex items-center gap-3 text-sm text-ink-muted">
          <Clock className="w-4 h-4" />
          <span>剩余时间：28:45</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 mb-4">
        {quizQuestions.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
              i === current
                ? "bg-amber text-surface-base"
                : answers[quizQuestions[i].id]
                ? "bg-sage/20 text-sage border border-sage/30"
                : "bg-surface-raised text-ink-muted border border-white/5"
            }`}
          >
            {i + 1}
          </button>
        ))}
        <span className="text-xs text-ink-muted ml-2">
          {answered}/{quizQuestions.length} 已答
        </span>
      </div>

      {!submitted ? (
        <div className="lab-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="badge badge-amber text-xs">第 {current + 1} 题</span>
            <span className="badge badge-muted text-xs">单选题</span>
          </div>

          <p className="text-base text-ink mb-6 leading-relaxed">{q.content}</p>

          <div className="space-y-3">
            {q.options.map((opt) => {
              const isSelected = answers[q.id] === opt;
              return (
                <button
                  key={opt}
                  onClick={() => handleSelect(opt)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    isSelected
                      ? "bg-amber/10 border-amber/30 text-amber"
                      : "bg-surface-raised border-white/5 text-ink-muted hover:bg-white/[0.06] hover:border-white/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected ? "border-amber bg-amber/20" : "border-white/10"
                      }`}
                    >
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-amber" />}
                    </div>
                    <span className="text-sm">{opt}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
            <button
              onClick={() => setCurrent(Math.max(0, current - 1))}
              disabled={current === 0}
              className="btn-ghost text-sm flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              上一题
            </button>

            <button className="btn-ghost text-sm flex items-center gap-1 text-amber">
              <Flag className="w-4 h-4" />
              标记
            </button>

            {current < quizQuestions.length - 1 ? (
              <button
                onClick={() => setCurrent(current + 1)}
                className="btn-ghost text-sm flex items-center gap-1"
              >
                下一题
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleSubmit} className="btn-sage text-sm flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                提交试卷
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="lab-card p-8 text-center">
          <CheckCircle2 className="w-16 h-16 mx-auto text-sage mb-4" />
          <h2 className="text-xl font-bold text-ink mb-2" style={{ fontFamily: "Georgia, serif" }}>
            测验提交成功！
          </h2>
          <p className="text-ink-muted mb-6">
            你已完成 {answered}/{quizQuestions.length} 道题目
          </p>
          <Link href="/student/quiz/result" className="btn-amber text-sm">
            查看测验结果 →
          </Link>
        </div>
      )}
    </div>
  );
}
