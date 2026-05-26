"use client";

import Link from "next/link";
import {
  TrendingUp,
  AlertCircle,
  Download,
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
    <div className="space-y-6 animate-reveal">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink" style={{ fontFamily: "Georgia, serif" }}>
            学习诊断报告
          </h1>
          <p className="text-ink-muted mt-1">基因工程课程 · 2025年春季学期</p>
        </div>
        <button className="btn-ghost text-sm flex items-center gap-1.5">
          <Download className="w-4 h-4" />
          导出报告
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="lab-card p-6 text-center">
            <div className="relative w-24 h-24 mx-auto mb-3">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="url(#scoreGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - overallScore / 100)}`}
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#e8983e" />
                    <stop offset="100%" stopColor="#4dab9a" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="stat-number text-2xl text-amber">{overallScore}</span>
              </div>
            </div>
            <p className="text-sm text-ink-muted mt-2">综合掌握度</p>
            <p className="text-xs text-ink-faint mt-1">
              高于班级平均水平
              <TrendingUp className="w-3 h-3 inline ml-1 text-sage" />
            </p>
          </div>

          <div className="lab-card p-4">
            <h3 className="text-sm mb-3" style={{ fontFamily: "Georgia, serif" }}>
              知识短板
            </h3>
            <div className="space-y-2">
              {knowledgeGaps
                .filter((g) => g.level === "weak")
                .map((g) => (
                  <div
                    key={g.topic}
                    className="flex items-center gap-2 p-2 rounded-lg bg-rust/5 border border-rust/10"
                  >
                    <AlertCircle className="w-3.5 h-3.5 text-rust flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-ink truncate">{g.topic}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-rust"
                            style={{ width: `${g.mastery}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-ink-faint">{g.mastery}%</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="lab-card p-5">
            <h3 className="text-base mb-4" style={{ fontFamily: "Georgia, serif" }}>
              知识雷达图
            </h3>
            <RadarChart data={radarData} />
          </div>

          <div className="lab-card p-5">
            <h3 className="text-base mb-4" style={{ fontFamily: "Georgia, serif" }}>
              AI 学习建议
            </h3>
            <div className="space-y-3">
              {recommendations.map((rec) => (
                <div
                  key={rec.topic}
                  className={`p-4 rounded-xl border ${
                    rec.priority === "high"
                      ? "bg-rust/5 border-rust/10"
                      : rec.priority === "medium"
                      ? "bg-amber/5 border-amber/10"
                      : "bg-sage/5 border-sage/5"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-ink">{rec.topic}</h4>
                    <span
                      className={`badge text-xs ${
                        rec.priority === "high"
                          ? "badge-rust"
                          : rec.priority === "medium"
                          ? "badge-amber"
                          : "badge-sage"
                      }`}
                    >
                      {rec.priority === "high" ? "高优先" : rec.priority === "medium" ? "中优先" : "低优先"}
                    </span>
                  </div>
                  <p className="text-xs text-ink-muted">{rec.action}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lab-card p-5">
            <h3 className="text-base mb-4" style={{ fontFamily: "Georgia, serif" }}>
              成绩趋势
            </h3>
            <div className="space-y-2">
              {studentScores.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-surface-raised"
                >
                  <span className="text-sm text-ink-muted">{s.quizTitle}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-ink-faint">{formatDate(s.date)}</span>
                    <span
                      className={`text-sm font-medium ${
                        s.score >= 90 ? "text-sage" : s.score >= 80 ? "text-amber" : "text-amber"
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
