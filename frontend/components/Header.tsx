"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dna, GraduationCap, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  role: "teacher" | "student";
}

export function Header({ role }: HeaderProps) {
  const pathname = usePathname();

  const titles: Record<string, string> = {
    "/teacher": "教学驾驶舱",
    "/teacher/materials": "课程资料库",
    "/teacher/knowledge-map": "知识地图",
    "/teacher/ai-generate": "AI 智能出题",
    "/teacher/question-bank": "题库管理",
    "/teacher/quiz-publish": "测验发布",
    "/teacher/class-analysis": "班级分析",
    "/student": "学习中心",
    "/student/quiz": "在线测验",
    "/student/quiz/result": "测验结果",
    "/student/report": "学习诊断报告",
    "/student/wrong-questions": "错题本",
    "/student/case-study": "科研案例辅导",
  };

  const pageTitle = titles[pathname] || "BioMentor Agent";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[var(--header-height)] glass border-b border-white/5 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center group-hover:shadow-lg group-hover:shadow-primary/20 transition-all">
            <Dna className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-gradient hidden sm:inline">
            BioMentor Agent
          </span>
        </Link>
        <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-text-secondary hidden sm:block">
          {role === "teacher" ? "教师端" : "学生端"}
        </span>
      </div>

      <h1 className="text-lg font-semibold text-text-primary absolute left-1/2 -translate-x-1/2 hidden md:block">
        {pageTitle}
      </h1>

      <div className="flex items-center gap-3">
        <button className="relative w-9 h-9 rounded-lg glass flex items-center justify-center hover:bg-white/10 transition-colors">
          <Bell className="w-4 h-4 text-text-secondary" />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-danger border-2 border-bg-dark" />
        </button>
        <div className="flex items-center gap-2 pl-3 border-l border-white/10">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-primary flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-xs text-text-primary font-medium leading-tight">
              {role === "teacher" ? "张教授" : "李明"}
            </p>
            <p className="text-[10px] text-text-muted leading-tight">
              {role === "teacher" ? "生物工程学院" : "生物工程 2024 级"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
