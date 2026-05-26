"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Clock,
  AlertCircle,
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
  const unanswered = quizQuestions.length - answered;

  const handleSelect = (option: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [q.id]: option }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">基因工程原理 - 第三章测验</h1>
          <p className="text-text-muted mt-1">单选题 · 共 {quizQuestions.length} 题</p>
        </div>
        <div className="flex items-center gap-3 text-sm text-text-secondary">
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
                ? "bg-primary text-white"
                : answers[quizQuestions[i].id]
                ? "bg-accent/20 text-accent border border-accent/30"
                : "bg-white/5 text-text-muted border border-white/10"
            }`}
          >
            {i + 1}
          </button>
        ))}
        <span className="text-xs text-text-muted ml-2">
          {answered}/{quizQuestions.length} 已答
        </span>
      </div>

      {!submitted ? (
        <div className="glass-card p-6 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary-light">
              第 {current + 1} 题
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-text-muted">
              单选题
            </span>
          </div>

          <p className="text-base text-text-primary mb-6 leading-relaxed">
            {q.content}
          </p>

          <div className="space-y-3">
            {q.options.map((opt) => {
              const isSelected = answers[q.id] === opt;
              return (
                <button
                  key={opt}
                  onClick={() => handleSelect(opt)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    isSelected
                      ? "bg-primary/10 border-primary/40 text-primary-light"
                      : "bg-white/[0.03] border-white/10 text-text-secondary hover:bg-white/[0.06] hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? "border-primary bg-primary/20"
                          : "border-white/20"
                      }`}
                    >
                      {isSelected && (
                        <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                      )}
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
              className="flex items-center gap-1 px-4 py-2 rounded-xl glass text-sm text-text-secondary hover:text-text-primary disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              上一题
            </button>

            <button className="flex items-center gap-1 px-3 py-2 rounded-xl glass text-sm text-warning hover:text-warning/80 transition-colors">
              <Flag className="w-4 h-4" />
              标记
            </button>

            {current < quizQuestions.length - 1 ? (
              <button
                onClick={() => setCurrent(current + 1)}
                className="flex items-center gap-1 px-4 py-2 rounded-xl glass text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                下一题
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="btn-accent text-sm flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                提交试卷
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="glass-card p-8 text-center animate-slide-up">
          <CheckCircle2 className="w-16 h-16 mx-auto text-accent mb-4" />
          <h2 className="text-xl font-bold mb-2">测验提交成功！</h2>
          <p className="text-text-secondary mb-6">
            你已完成 {answered}/{quizQuestions.length} 道题目
          </p>
          <Link href="/student/quiz/result" className="btn-primary text-sm">
            查看测验结果 →
          </Link>
        </div>
      )}
    </div>
  );
}
