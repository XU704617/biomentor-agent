"use client";

import { useState } from "react";
import {
  Send,
  Plus,
  Clock,
  Users,
  Calendar,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { recentQuizzes } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

const courses = ["基因工程", "发酵工程", "代谢工程", "合成生物学", "蛋白质工程"];

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

const statusIconBg: Record<string, string> = {
  published: "bg-sage/10",
  grading: "bg-rust/10",
  completed: "bg-amber/10",
  draft: "bg-surface-field",
};

const statusIconColor: Record<string, string> = {
  published: "text-sage",
  grading: "text-rust",
  completed: "text-amber",
  draft: "text-ink-faint",
};

export default function QuizPublishPage() {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState(courses[0]);
  const [dueDate, setDueDate] = useState("");
  const [totalScore, setTotalScore] = useState(100);
  const [questionCount, setQuestionCount] = useState(20);

  return (
    <div className="space-y-8">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1>测验发布</h1>
          <p>创建并发布课堂测验与考试</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-amber text-sm"
        >
          <Plus className="w-4 h-4" />
          {showForm ? "收起表单" : "新建测验"}
        </button>
      </div>

      {showForm && (
        <div className="lab-card p-6 animate-reveal">
          <h3 className="mb-4">创建新测验</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-[12px] text-ink-faint mb-1.5">测验标题</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如：基因工程原理 - 第三章测验"
                className="lab-input"
              />
            </div>
            <div>
              <label className="block text-[12px] text-ink-faint mb-1.5">所属课程</label>
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
            </div>
            <div>
              <label className="block text-[12px] text-ink-faint mb-1.5">截止日期</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="lab-input"
              />
            </div>
            <div>
              <label className="block text-[12px] text-ink-faint mb-1.5">题目数量</label>
              <input
                type="number"
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="lab-input"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-amber text-sm">
              <Send className="w-4 h-4" />
              立即发布
            </button>
            <button className="btn-ghost">保存草稿</button>
          </div>
        </div>
      )}

      <div className="lab-card p-6 animate-reveal">
        <h3 className="mb-4">测验列表</h3>
        <div className="space-y-2">
          {recentQuizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="flex items-center justify-between p-4 rounded-lg bg-surface-field border border-border-subtle hover:border-border-muted transition-colors"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${statusIconBg[quiz.status]}`}
                >
                  {quiz.status === "completed" ? (
                    <CheckCircle2 className={`w-5 h-5 ${statusIconColor[quiz.status]}`} />
                  ) : quiz.status === "draft" ? (
                    <XCircle className={`w-5 h-5 ${statusIconColor[quiz.status]}`} />
                  ) : (
                    <Clock className={`w-5 h-5 ${statusIconColor[quiz.status]}`} />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[14px] font-medium text-ink truncate">
                    {quiz.title}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[12px] text-ink-faint flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(quiz.createdAt)} ~ {formatDate(quiz.dueDate)}
                    </span>
                    <span className="text-[12px] text-ink-faint flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {quiz.studentCount}人
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {quiz.avgScore != null && (
                  <span className="text-[14px] font-medium text-ink stat-number">
                    均分 {quiz.avgScore}
                  </span>
                )}
                <span className={`badge text-[11px] ${statusBadge[quiz.status]}`}>
                  {statusLabel[quiz.status]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
