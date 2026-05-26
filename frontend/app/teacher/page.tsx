"use client";

import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Users,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { KpiCard } from "@/components/KpiCard";
import { teacherKpis, recentQuizzes, classWeakPoints } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

export default function TeacherDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">教学驾驶舱</h1>
          <p className="text-text-muted mt-1">欢迎回来，这里是您的教学数据概览</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <Clock className="w-4 h-4" />
          <span>数据更新于 {new Date().toLocaleDateString("zh-CN")}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {teacherKpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold">最近测验</h3>
            <button className="text-xs text-primary-light hover:text-primary transition-colors">
              查看全部 →
            </button>
          </div>
          <div className="space-y-3">
            {recentQuizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      quiz.status === "published"
                        ? "bg-success"
                        : quiz.status === "grading"
                        ? "bg-warning"
                        : quiz.status === "completed"
                        ? "bg-accent"
                        : "bg-text-muted"
                    }`}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {quiz.title}
                    </p>
                    <p className="text-xs text-text-muted">{quiz.course}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-xs text-text-muted">
                      <Users className="w-3 h-3 inline mr-0.5" />
                      {quiz.studentCount}人
                    </p>
                    {quiz.avgScore != null && (
                      <p className="text-xs font-medium text-text-primary">
                        {quiz.avgScore}分
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-text-muted">截止</p>
                    <p className="text-xs text-text-secondary">
                      {formatDate(quiz.dueDate)}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      quiz.status === "published"
                        ? "bg-success/10 text-success"
                        : quiz.status === "grading"
                        ? "bg-warning/10 text-warning"
                        : quiz.status === "completed"
                        ? "bg-accent/10 text-accent"
                        : "bg-white/5 text-text-muted"
                    }`}
                  >
                    {quiz.status === "published"
                      ? "进行中"
                      : quiz.status === "grading"
                      ? "批改中"
                      : quiz.status === "completed"
                      ? "已完成"
                      : "草稿"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold">班级薄弱知识点</h3>
            <button className="text-xs text-primary-light hover:text-primary transition-colors">
              详细分析 →
            </button>
          </div>
          <div className="space-y-3">
            {classWeakPoints.map((wp) => (
              <div
                key={wp.topic}
                className="p-3 rounded-xl bg-white/[0.03] border border-white/5"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-text-primary truncate max-w-[60%]">
                    {wp.topic}
                  </span>
                  <span className="text-xs text-text-muted">
                    {wp.studentCount}名学生
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${wp.accuracy}%`,
                        background:
                          wp.accuracy < 60
                            ? "linear-gradient(90deg, #ef4444, #f59e0b)"
                            : wp.accuracy < 70
                            ? "linear-gradient(90deg, #f59e0b, #0ea5e9)"
                            : "linear-gradient(90deg, #0ea5e9, #06d6a0)",
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-text-secondary w-10 text-right">
                    {wp.accuracy}%
                  </span>
                  {wp.trend === "up" && (
                    <TrendingUp className="w-3.5 h-3.5 text-success" />
                  )}
                  {wp.trend === "down" && (
                    <TrendingDown className="w-3.5 h-3.5 text-danger" />
                  )}
                  {wp.trend === "stable" && (
                    <AlertCircle className="w-3.5 h-3.5 text-warning" />
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
