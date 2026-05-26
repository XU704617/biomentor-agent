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

export default function QuizPublishPage() {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState(courses[0]);
  const [dueDate, setDueDate] = useState("");
  const [totalScore, setTotalScore] = useState(100);
  const [questionCount, setQuestionCount] = useState(20);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">测验发布</h1>
          <p className="text-text-muted mt-1">创建并发布课堂测验与考试</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary text-sm flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          {showForm ? "收起表单" : "新建测验"}
        </button>
      </div>

      {showForm && (
        <div className="glass-card p-6 animate-slide-up">
          <h3 className="text-base font-semibold mb-4">创建新测验</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs text-text-muted mb-1.5">测验标题</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如：基因工程原理 - 第三章测验"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/40 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1.5">所属课程</label>
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-text-primary focus:outline-none focus:border-primary/40 transition-colors"
              >
                {courses.map((c) => (
                  <option key={c} value={c} className="bg-bg-dark">
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1.5">截止日期</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-text-primary focus:outline-none focus:border-primary/40 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1.5">题目数量</label>
              <input
                type="number"
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-text-primary focus:outline-none focus:border-primary/40 transition-colors"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-primary text-sm flex items-center gap-1.5">
              <Send className="w-4 h-4" />
              立即发布
            </button>
            <button className="px-4 py-2.5 rounded-xl glass text-sm text-text-secondary hover:text-text-primary transition-colors">
              保存草稿
            </button>
          </div>
        </div>
      )}

      <div className="glass-card p-5">
        <h3 className="text-base font-semibold mb-4">测验列表</h3>
        <div className="space-y-3">
          {recentQuizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    quiz.status === "published"
                      ? "bg-success/10"
                      : quiz.status === "grading"
                      ? "bg-warning/10"
                      : quiz.status === "completed"
                      ? "bg-accent/10"
                      : "bg-white/5"
                  }`}
                >
                  {quiz.status === "completed" ? (
                    <CheckCircle2 className="w-5 h-5 text-accent" />
                  ) : quiz.status === "draft" ? (
                    <XCircle className="w-5 h-5 text-text-muted" />
                  ) : (
                    <Clock className="w-5 h-5 text-warning" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {quiz.title}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-text-muted flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(quiz.createdAt)} ~ {formatDate(quiz.dueDate)}
                    </span>
                    <span className="text-xs text-text-muted flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {quiz.studentCount}人
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {quiz.avgScore != null && (
                  <span className="text-sm font-medium text-text-primary">
                    均分 {quiz.avgScore}
                  </span>
                )}
                <span
                  className={`text-xs px-2.5 py-1 rounded-full ${
                    quiz.status === "published"
                      ? "bg-success/10 text-success border border-success/20"
                      : quiz.status === "grading"
                      ? "bg-warning/10 text-warning border border-warning/20"
                      : quiz.status === "completed"
                      ? "bg-accent/10 text-accent border border-accent/20"
                      : "bg-white/5 text-text-muted border border-white/10"
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
    </div>
  );
}
