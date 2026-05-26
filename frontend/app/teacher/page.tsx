"use client";

import {
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Clock,
} from "lucide-react";
import { KpiCard } from "@/components/KpiCard";
import { teacherKpis, recentQuizzes, classWeakPoints } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

const statusLabel: Record<string, string> = {
  published: "进行中",
  grading: "批改中",
  completed: "已完成",
  draft: "草稿",
};

const statusBadge: Record<string, string> = {
  published: "badge-amber",
  grading: "badge-rust",
  completed: "badge-sage",
  draft: "badge-muted",
};

const statusDot: Record<string, string> = {
  published: "bg-sage",
  grading: "bg-rust",
  completed: "bg-amber",
  draft: "bg-ink-faint",
};

export default function TeacherDashboard() {
  return (
    <div className="space-y-8">
      <div className="page-header">
        <h1>教学驾驶舱</h1>
        <p>欢迎回来，这里是您的教学数据概览</p>
      </div>

      <div className="flex items-center gap-2 text-[13px] text-ink-faint">
        <Clock className="w-3.5 h-3.5" />
        <span>数据更新于 {new Date().toLocaleDateString("zh-CN")}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-reveal">
        {teacherKpis.map((kpi, i) => (
          <div
            key={kpi.label}
            className={`animate-reveal-delay-${i + 1}`}
          >
            <KpiCard {...kpi} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lab-card p-6 animate-reveal">
          <h3 className="mb-4">最近测验</h3>
          <div className="space-y-2">
            {recentQuizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="flex items-center justify-between p-3 rounded-lg bg-surface-field border border-border-subtle hover:border-border-muted transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDot[quiz.status]}`}
                  />
                  <div className="min-w-0">
                    <p className="text-[14px] text-ink truncate">
                      {quiz.title}
                    </p>
                    <p className="text-[12px] text-ink-faint">{quiz.course}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-[12px] text-ink-faint">
                      <Users className="w-3 h-3 inline mr-0.5 -mt-0.5" />
                      {quiz.studentCount}人
                    </p>
                    {quiz.avgScore != null && (
                      <p className="text-[12px] font-medium text-ink stat-number">
                        {quiz.avgScore}分
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-[12px] text-ink-faint">截止</p>
                    <p className="text-[12px] text-ink-muted">
                      {formatDate(quiz.dueDate)}
                    </p>
                  </div>
                  <span className={`badge text-[11px] ${statusBadge[quiz.status]}`}>
                    {statusLabel[quiz.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lab-card p-6 animate-reveal">
          <h3 className="mb-4">班级薄弱知识点</h3>
          <div className="space-y-3">
            {classWeakPoints.map((wp) => (
              <div
                key={wp.topic}
                className="p-3 rounded-lg bg-surface-field border border-border-subtle"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px] text-ink truncate max-w-[60%]">
                    {wp.topic}
                  </span>
                  <span className="text-[12px] text-ink-faint">
                    {wp.studentCount}名学生
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full bg-border-subtle overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${wp.accuracy}%`,
                        background:
                          wp.accuracy < 60
                            ? "linear-gradient(90deg, #d96459, #e8983e)"
                            : wp.accuracy < 70
                            ? "linear-gradient(90deg, #e8983e, #4dab9a)"
                            : "linear-gradient(90deg, #4dab9a, #7bc4b6)",
                      }}
                    />
                  </div>
                  <span className="text-[13px] font-medium text-ink-muted stat-number w-10 text-right">
                    {wp.accuracy}%
                  </span>
                  {wp.trend === "up" && (
                    <TrendingUp className="w-3.5 h-3.5 text-sage" />
                  )}
                  {wp.trend === "down" && (
                    <TrendingDown className="w-3.5 h-3.5 text-rust" />
                  )}
                  {wp.trend === "stable" && (
                    <Minus className="w-3.5 h-3.5 text-ink-faint" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
