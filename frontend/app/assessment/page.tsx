"use client";

import { useState } from "react";
import {
  ClipboardCheck,
  TrendingUp,
  Brain,
  AlertTriangle,
  Clock,
  FileText,
  Sliders,
  Hash,
  Sparkles,
  ChevronRight,
} from "lucide-react";

const recentResults: {
  id: string;
  quizName: string;
  score: number | null;
  totalScore: number;
  date: string;
  status: "passed" | "failed" | "in-progress";
}[] = [
  {
    id: "r1",
    quizName: "基因工程原理 - 第二章测验",
    score: 92,
    totalScore: 100,
    date: "2025-05-20",
    status: "passed",
  },
  {
    id: "r2",
    quizName: "发酵工程 - 单元测试",
    score: 85,
    totalScore: 100,
    date: "2025-05-15",
    status: "passed",
  },
  {
    id: "r3",
    quizName: "代谢工程 - 随堂测验",
    score: 58,
    totalScore: 100,
    date: "2025-05-10",
    status: "failed",
  },
  {
    id: "r4",
    quizName: "合成生物学 - 基础测试",
    score: null,
    totalScore: 100,
    date: "2025-05-08",
    status: "in-progress",
  },
];

const statusConfig = {
  passed: { label: "已通过", bg: "rgba(5,150,105,0.08)", color: "#059669", border: "rgba(5,150,105,0.15)" },
  failed: { label: "未通过", bg: "rgba(244,63,94,0.08)", color: "#f43f5e", border: "rgba(244,63,94,0.15)" },
  "in-progress": { label: "进行中", bg: "rgba(245,158,11,0.08)", color: "#f59e0b", border: "rgba(245,158,11,0.15)" },
};

export default function AssessmentPage() {
  const [difficulty, setDifficulty] = useState(3);
  const [questionCount, setQuestionCount] = useState(10);

  return (
    <div className="min-h-screen pt-[var(--nav-height)]">
      <section className="px-6 md:px-10 py-10 md:py-14 max-w-7xl mx-auto">
        <div className="mb-10">
          <p className="section-title">智能测评</p>
          <h1 className="section-heading text-[clamp(32px,5vw,48px)]">
            智能测评中心
          </h1>
          <p className="text-[#4a4a6a] mt-3 max-w-2xl leading-relaxed">
            自适应测评引擎，精准评估知识掌握水平，智能生成个性化练习
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              icon: ClipboardCheck,
              label: "已完成测评数",
              value: 12,
              color: "#2563eb",
              bg: "rgba(37,99,235,0.06)",
            },
            {
              icon: TrendingUp,
              label: "平均得分",
              value: 82.5,
              suffix: "分",
              color: "#059669",
              bg: "rgba(5,150,105,0.06)",
            },
            {
              icon: Brain,
              label: "知识掌握率",
              value: 76.8,
              suffix: "%",
              color: "#06b6d4",
              bg: "rgba(6,182,212,0.06)",
            },
            {
              icon: AlertTriangle,
              label: "薄弱知识点数",
              value: 5,
              color: "#f59e0b",
              bg: "rgba(245,158,11,0.06)",
            },
          ].map((item) => (
            <div key={item.label} className="glass-card p-5">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                style={{ backgroundColor: item.bg }}
              >
                <item.icon className="w-4 h-4" style={{ color: item.color }} />
              </div>
              <p className="stat-number text-[28px] text-[#0d0d1a]">
                {item.suffix ? (
                  <>
                    {item.value}
                    <span className="text-[#8e8eaa] text-sm ml-0.5">{item.suffix}</span>
                  </>
                ) : (
                  item.value
                )}
              </p>
              <p className="text-xs text-[#4a4a6a] mt-1">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 glass-card-iridescent p-6 md:p-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="font-display text-lg font-bold text-[#0d0d1a] mb-1">
                  分子生物学基础测验
                </h2>
                <p className="text-xs text-[#4a4a6a]">当前待完成的测评任务</p>
              </div>
              <span className="badge badge-electric">待完成</span>
            </div>

            <div className="flex items-center gap-6 mb-6">
              <div className="flex items-center gap-2 text-sm text-[#4a4a6a]">
                <FileText className="w-4 h-4 text-[#2563eb]" />
                <span>5 道题目</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#4a4a6a]">
                <Clock className="w-4 h-4 text-[#2563eb]" />
                <span>30 分钟</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#4a4a6a]">
                <Brain className="w-4 h-4 text-[#2563eb]" />
                <span>中等难度</span>
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-[#2563eb]/10 via-[#06b6d4]/10 to-transparent mb-6" />

            <div className="flex items-center gap-4">
              <button className="btn-hero">
                开始测评
                <ChevronRight className="w-4 h-4" />
              </button>
              <button className="btn-hero-secondary text-sm">稍后作答</button>
            </div>
          </div>

          <div className="glass-card p-5 flex flex-col">
            <h3 className="font-display text-sm font-bold text-[#0d0d1a] mb-4">历史最佳</h3>
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto rounded-full border-[3px] border-[#2563eb]/20 flex items-center justify-center mb-3">
                  <span className="stat-number text-2xl text-[#2563eb]">95</span>
                </div>
                <p className="text-xs text-[#4a4a6a]">基因工程期末测验</p>
                <p className="text-[10px] text-[#8e8eaa] mt-1">2025-03-28</p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 md:p-8 mb-8">
          <h2 className="font-display text-lg font-bold text-[#0d0d1a] mb-5 flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-[#2563eb]" />
            最近测评记录
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-black/5">
                  <th className="text-left text-xs font-semibold text-[#4a4a6a] pb-3">测评名称</th>
                  <th className="text-left text-xs font-semibold text-[#4a4a6a] pb-3">得分</th>
                  <th className="text-left text-xs font-semibold text-[#4a4a6a] pb-3">日期</th>
                  <th className="text-left text-xs font-semibold text-[#4a4a6a] pb-3">状态</th>
                </tr>
              </thead>
              <tbody>
                {recentResults.map((row) => {
                  const sc = statusConfig[row.status];
                  return (
                    <tr key={row.id} className="border-b border-black/[0.03] hover:bg-white/30 transition-colors">
                      <td className="py-3.5 pr-4 text-sm text-[#0d0d1a] font-medium">{row.quizName}</td>
                      <td className="py-3.5 pr-4">
                        {row.score !== null ? (
                          <span
                            className={`text-sm font-semibold ${
                              row.score >= 80 ? "text-[#059669]" : "text-[#f43f5e]"
                            }`}
                          >
                            {row.score}/{row.totalScore}
                          </span>
                        ) : (
                          <span className="text-sm text-[#8e8eaa]">--</span>
                        )}
                      </td>
                      <td className="py-3.5 pr-4 text-sm text-[#4a4a6a]">{row.date}</td>
                      <td className="py-3.5">
                        <span
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold"
                          style={{
                            color: sc.color,
                            backgroundColor: sc.bg,
                            border: `1px solid ${sc.border}`,
                          }}
                        >
                          {sc.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-card-iridescent p-6 md:p-8">
          <h2 className="font-display text-lg font-bold text-[#0d0d1a] mb-5 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#f59e0b]" />
            自定义出题
          </h2>
          <p className="text-xs text-[#4a4a6a] mb-6">
            AI将根据你设定的参数智能生成个性化测评题目
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            <div>
              <label className="block text-xs font-semibold text-[#4a4a6a] mb-2">测评主题</label>
              <input
                type="text"
                placeholder="例: 分子生物学、基因工程..."
                className="w-full px-4 py-3 rounded-xl bg-white/60 border border-white/60 text-sm text-[#0d0d1a] placeholder:text-[#8e8eaa] focus:outline-none focus:border-[#2563eb]/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4a4a6a] mb-2">
                难度等级: {difficulty}
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={difficulty}
                onChange={(e) => setDifficulty(Number(e.target.value))}
                className="w-full accent-[#2563eb] h-2 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #2563eb ${(difficulty - 1) * 25}%, rgba(0,0,0,0.06) ${(difficulty - 1) * 25}%)`,
                }}
              />
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-[#8e8eaa]">简单</span>
                <span className="text-[10px] text-[#8e8eaa]">困难</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            <div>
              <label className="block text-xs font-semibold text-[#4a4a6a] mb-2 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5" />
                题目数量: {questionCount} 题
              </label>
              <div className="flex gap-2">
                {[5, 10, 15, 20].map((n) => (
                  <button
                    key={n}
                    onClick={() => setQuestionCount(n)}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                      questionCount === n
                        ? "bg-[#2563eb] text-white"
                        : "bg-white/60 text-[#4a4a6a] hover:bg-white/80"
                    }`}
                  >
                    {n}题
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-end">
              <button className="w-full px-5 py-3 rounded-xl bg-[#0d0d1a] text-white text-sm font-semibold hover:bg-[#1a1a2e] transition-all flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" />
                生成测评
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
