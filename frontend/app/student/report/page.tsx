"use client";

import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Download,
  ArrowRight,
} from "lucide-react";
import { RadarChart } from "@/components/RadarChart";
import { knowledgeGaps, studentScores } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

const radarData = knowledgeGaps.map((g) => ({
  name: g.topic.length > 6 ? g.topic.slice(0, 6) + "..." : g.topic,
  value: g.mastery,
}));

const recommendations = [
  {
    topic: "CRISPR-Cas9 工作原理",
    action: "建议复习基因编辑章节第3节，完成配套练习",
    priority: "high",
  },
  {
    topic: "质粒载体的选择与构建",
    action: "阅读课程资料中质粒构建相关文献",
    priority: "high",
  },
  {
    topic: "代谢通路调控机制",
    action: "观看代谢工程第五章教学视频",
    priority: "medium",
  },
  {
    topic: "发酵工艺参数优化",
    action: "完成发酵工艺参数优化练习",
    priority: "low",
  },
];

const overallScore = 82;

export default function ReportPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">学习诊断报告</h1>
          <p className="text-text-muted mt-1">
            基因工程课程 · 2025年春季学期
          </p>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl glass text-sm text-text-secondary hover:text-text-primary transition-colors">
          <Download className="w-4 h-4" />
          导出报告
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-card p-6 text-center">
            <div className="w-24 h-24 mx-auto mb-3">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - overallScore / 100)}`}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0ea5e9" />
                    <stop offset="100%" stopColor="#06d6a0" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <span className="text-2xl font-bold text-gradient">{overallScore}</span>
              </div>
            </div>
            <p className="text-sm text-text-secondary mt-2">综合掌握度</p>
            <p className="text-xs text-text-muted mt-1">
              高于班级平均水平
              <TrendingUp className="w-3 h-3 inline ml-1 text-success" />
            </p>
          </div>

          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold mb-3">知识短板</h3>
            <div className="space-y-2">
              {knowledgeGaps
                .filter((g) => g.level === "weak")
                .map((g) => (
                  <div
                    key={g.topic}
                    className="flex items-center gap-2 p-2 rounded-lg bg-danger/5 border border-danger/10"
                  >
                    <AlertCircle className="w-3.5 h-3.5 text-danger flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-text-primary truncate">{g.topic}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-danger"
                            style={{ width: `${g.mastery}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-text-muted">{g.mastery}%</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-5">
            <h3 className="text-base font-semibold mb-4">知识雷达图</h3>
            <RadarChart data={radarData} color="#0ea5e9" />
          </div>

          <div className="glass-card p-5">
            <h3 className="text-base font-semibold mb-4">AI 学习建议</h3>
            <div className="space-y-3">
              {recommendations.map((rec) => (
                <div
                  key={rec.topic}
                  className={`p-4 rounded-xl border ${
                    rec.priority === "high"
                      ? "bg-danger/5 border-danger/10"
                      : rec.priority === "medium"
                      ? "bg-warning/5 border-warning/10"
                      : "bg-primary/5 border-primary/10"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-text-primary">
                      {rec.topic}
                    </h4>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        rec.priority === "high"
                          ? "bg-danger/10 text-danger"
                          : rec.priority === "medium"
                          ? "bg-warning/10 text-warning"
                          : "bg-primary/10 text-primary-light"
                      }`}
                    >
                      {rec.priority === "high"
                        ? "高优先"
                        : rec.priority === "medium"
                        ? "中优先"
                        : "低优先"}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary">{rec.action}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-5">
            <h3 className="text-base font-semibold mb-4">成绩趋势</h3>
            <div className="space-y-2">
              {studentScores.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5"
                >
                  <span className="text-sm text-text-secondary">{s.quizTitle}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-text-muted">{formatDate(s.date)}</span>
                    <span
                      className={`text-sm font-medium ${
                        s.score >= 90 ? "text-accent" : s.score >= 80 ? "text-primary-light" : "text-warning"
                      }`}
                    >
                      {s.score}分
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
