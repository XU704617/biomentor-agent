"use client";

import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const resultDetail = {
  quizTitle: "基因工程原理 - 第三章测验",
  totalScore: 100,
  score: 85,
  correct: 17,
  wrong: 3,
  total: 20,
  timeUsed: "22分18秒",
  avgScore: 78.5,
  rank: "5/45",
};

const performanceData = [
  { name: "基因编辑", value: 85 },
  { name: "限制酶", value: 92 },
  { name: "质粒载体", value: 72 },
  { name: "CRISPR", value: 88 },
  { name: "表达系统", value: 78 },
];

const questionReview = [
  {
    id: "r1",
    content: "CRISPR-Cas9 系统中，Cas9 蛋白的主要功能是什么？",
    correctAnswer: "B",
    yourAnswer: "B",
    isCorrect: true,
  },
  {
    id: "r2",
    content: "下列哪种限制性内切酶产生平末端？",
    correctAnswer: "C",
    yourAnswer: "C",
    isCorrect: true,
  },
  {
    id: "r3",
    content: "质粒载体中，多克隆位点（MCS）的作用是什么？",
    correctAnswer: "B",
    yourAnswer: "A",
    isCorrect: false,
  },
];

const scoreColor =
  resultDetail.score >= 90
    ? "text-sage"
    : resultDetail.score >= 80
    ? "text-amber"
    : resultDetail.score >= 60
    ? "text-amber"
    : "text-rust";

export default function QuizResultPage() {
  return (
    <div className="space-y-6 animate-reveal">
      <div className="text-center py-8">
        <Award className="w-16 h-16 mx-auto text-amber mb-4" />
        <h1 className="text-2xl font-bold text-ink mb-2" style={{ fontFamily: "Georgia, serif" }}>
          测验结果
        </h1>
        <p className="text-ink-muted">{resultDetail.quizTitle}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="lab-card p-5 text-center">
          <p className={`stat-number text-4xl font-extrabold ${scoreColor}`}>{resultDetail.score}</p>
          <p className="text-xs text-ink-muted mt-1">得分 / {resultDetail.totalScore}</p>
        </div>
        <div className="lab-card p-5 text-center">
          <div className="flex items-center justify-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-sage" />
            <span className="stat-number text-xl text-sage">{resultDetail.correct}</span>
          </div>
          <p className="text-xs text-ink-muted mt-1">正确</p>
        </div>
        <div className="lab-card p-5 text-center">
          <div className="flex items-center justify-center gap-1">
            <XCircle className="w-4 h-4 text-rust" />
            <span className="stat-number text-xl text-rust">{resultDetail.wrong}</span>
          </div>
          <p className="text-xs text-ink-muted mt-1">错误</p>
        </div>
        <div className="lab-card p-5 text-center">
          <div className="flex items-center justify-center gap-1">
            <Clock className="w-4 h-4 text-ink-muted" />
            <span className="text-lg font-bold text-ink">{resultDetail.timeUsed}</span>
          </div>
          <p className="text-xs text-ink-muted mt-1">用时</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lab-card p-5">
          <h3 className="text-base mb-4" style={{ fontFamily: "Georgia, serif" }}>
            知识掌握分析
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={performanceData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: "#6b6560", fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#9d968f", fontSize: 12 }} width={70} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#191b24",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "8px",
                  color: "#e8e4dd",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} name="掌握度">
                {performanceData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={
                      entry.value >= 85
                        ? "#4dab9a"
                        : entry.value >= 70
                        ? "#e8983e"
                        : "#d96459"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="lab-card p-5">
          <h3 className="text-base mb-2" style={{ fontFamily: "Georgia, serif" }}>
            成绩对比
          </h3>
          <div className="space-y-3 mt-6">
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-raised">
              <span className="text-sm text-ink-muted">你的成绩</span>
              <span className="text-sm font-bold text-amber">{resultDetail.score}分</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-raised">
              <span className="text-sm text-ink-muted">班级均分</span>
              <span className="text-sm font-bold text-ink">{resultDetail.avgScore}分</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-raised">
              <span className="text-sm text-ink-muted">班级排名</span>
              <span className="text-sm font-bold text-sage">{resultDetail.rank}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-raised">
              <span className="text-sm text-ink-muted flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-sage" />
                较上次
              </span>
              <span className="text-sm font-bold text-sage">+5分</span>
            </div>
          </div>
        </div>
      </div>

      <div className="lab-card p-5">
        <h3 className="text-base mb-4" style={{ fontFamily: "Georgia, serif" }}>
          错题回顾
        </h3>
        <div className="space-y-3">
          {questionReview.map((q) => (
            <div
              key={q.id}
              className={`p-4 rounded-xl border ${
                q.isCorrect ? "bg-sage/5 border-sage/10" : "bg-rust/5 border-rust/10"
              }`}
            >
              <div className="flex items-start gap-2">
                {q.isCorrect ? (
                  <CheckCircle2 className="w-4 h-4 text-sage flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-rust flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="text-sm text-ink">{q.content}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-ink-muted">
                      正确答案：<span className="text-sage">{q.correctAnswer}</span>
                    </span>
                    <span className="text-xs text-ink-muted">
                      你的答案：
                      <span className={q.isCorrect ? "text-sage" : "text-rust"}>{q.yourAnswer}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 pt-4">
        <Link href="/student/report" className="btn-amber text-sm flex items-center gap-1.5">
          查看详细报告
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link href="/student/quiz" className="btn-sage text-sm">
          继续练习
        </Link>
      </div>
    </div>
  );
}
