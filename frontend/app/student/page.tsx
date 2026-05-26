"use client";

import Link from "next/link";
import {
  BookOpen,
  ClipboardCheck,
  Clock,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  FileText,
  Microscope,
  FileBarChart,
  BookX,
} from "lucide-react";
import { studentTasks, studentScores, knowledgeGaps } from "@/lib/mock-data";
import { RadarChart } from "@/components/RadarChart";
import { formatDate } from "@/lib/utils";

const radarData = knowledgeGaps.map((g) => ({
  name: g.topic.length > 6 ? g.topic.slice(0, 6) + "..." : g.topic,
  value: g.mastery,
}));

const shortcutCards = [
  {
    href: "/student/quiz",
    label: "在线测验",
    icon: ClipboardCheck,
    color: "from-primary/20 to-primary/5 border-primary/20",
    textColor: "text-primary-light",
  },
  {
    href: "/student/report",
    label: "学习诊断",
    icon: FileBarChart,
    color: "from-accent/20 to-accent/5 border-accent/20",
    textColor: "text-accent",
  },
  {
    href: "/student/wrong-questions",
    label: "错题本",
    icon: BookX,
    color: "from-purple-500/20 to-purple-500/5 border-purple-500/20",
    textColor: "text-purple-400",
  },
  {
    href: "/student/case-study",
    label: "科研案例",
    icon: Microscope,
    color: "from-warning/20 to-warning/5 border-warning/20",
    textColor: "text-warning",
  },
];

export default function StudentHome() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">学习中心</h1>
        <p className="text-text-muted mt-1">
          生物工程 2024 级 · 基因工程课程
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {shortcutCards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className={`glass-card p-4 text-center hover:scale-[1.02] transition-all hover:shadow-lg ${card.textColor}`}
          >
            <div
              className={`w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}
            >
              <card.icon className={`w-5 h-5 ${card.textColor}`} />
            </div>
            <span className="text-xs font-medium">{card.label}</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">今日任务</h3>
              <Link
                href="/student/quiz"
                className="text-xs text-primary-light hover:text-primary transition-colors"
              >
                查看全部 →
              </Link>
            </div>
            <div className="space-y-2">
              {studentTasks.map((task) => {
                const isOverdue = task.status === "overdue";
                return (
                  <Link
                    key={task.id}
                    href={
                      task.type === "quiz"
                        ? "/student/quiz"
                        : task.type === "case-study"
                        ? "/student/case-study"
                        : "#"
                    }
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          task.status === "completed"
                            ? "bg-success"
                            : isOverdue
                            ? "bg-danger"
                            : "bg-primary-light"
                        }`}
                      />
                      <div className="min-w-0">
                        <p className="text-sm text-text-primary truncate">
                          {task.title}
                        </p>
                        <p className="text-xs text-text-muted">
                          {task.course} ·{" "}
                          {task.type === "quiz"
                            ? "测验"
                            : task.type === "reading"
                            ? "阅读"
                            : task.type === "practice"
                            ? "练习"
                            : "案例分析"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span
                        className={`text-xs flex items-center gap-1 ${
                          isOverdue ? "text-danger" : "text-text-muted"
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        {formatDate(task.dueDate)}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          task.status === "completed"
                            ? "bg-success/10 text-success"
                            : isOverdue
                            ? "bg-danger/10 text-danger"
                            : "bg-primary/10 text-primary-light"
                        }`}
                      >
                        {task.status === "pending"
                          ? "待完成"
                          : task.status === "overdue"
                          ? "已逾期"
                          : "已完成"}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">最近成绩</h3>
              <Link
                href="/student/report"
                className="text-xs text-primary-light hover:text-primary transition-colors"
              >
                详细报告 →
              </Link>
            </div>
            <div className="space-y-2">
              {studentScores.map((score) => (
                <div
                  key={score.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                        score.score >= 90
                          ? "bg-accent/20 text-accent"
                          : score.score >= 80
                          ? "bg-primary/20 text-primary-light"
                          : score.score >= 70
                          ? "bg-warning/20 text-warning"
                          : "bg-danger/20 text-danger"
                      }`}
                    >
                      {score.score}
                    </div>
                    <div>
                      <p className="text-sm text-text-primary">{score.quizTitle}</p>
                      <p className="text-xs text-text-muted">
                        {formatDate(score.date)} · 排名 {score.rank}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <TrendingUp
                        className={`w-3.5 h-3.5 ${
                          score.score >= 85 ? "text-success" : "text-warning"
                        }`}
                      />
                      <span className="text-xs text-text-secondary">
                        {score.score}/{score.totalScore}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-5">
            <h3 className="text-base font-semibold mb-2">知识掌握雷达</h3>
            <RadarChart data={radarData} />
          </div>

          <div className="glass-card p-5">
            <h3 className="text-base font-semibold mb-3">薄弱知识点</h3>
            <div className="space-y-2">
              {knowledgeGaps
                .filter((g) => g.level === "weak")
                .map((g) => (
                  <div
                    key={g.topic}
                    className="flex items-center gap-2 p-2.5 rounded-lg bg-danger/5 border border-danger/10"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-danger flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-text-primary truncate">{g.topic}</p>
                      <p className="text-[10px] text-text-muted">掌握度 {g.mastery}%</p>
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
