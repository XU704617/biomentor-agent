"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, User } from "lucide-react";

interface HeaderProps {
  role: "teacher" | "student";
}

const titles: Record<string, string> = {
  "/teacher": "教学驾驶舱",
  "/teacher/materials": "课程资料库",
  "/teacher/knowledge-map": "知识地图",
  "/teacher/ai-generate": "AI 智能出题",
  "/teacher/question-bank": "题库管理",
  "/teacher/quiz-publish": "测验发布",
  "/teacher/class-analysis": "班级分析",
  "/student": "BioToolBox",
  "/student/protein": "蛋白结构查看器",
  "/student/plasmid": "质粒图谱查看器",
  "/student/sequence": "序列分析工具",
  "/student/pathway": "通路知识图谱",
  "/student/report": "学习诊断报告",
  "/student/wrong-questions": "错题本",
};

export function Header({ role }: HeaderProps) {
  const pathname = usePathname();
  const pageTitle = titles[pathname] || "BioMentor Agent";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[var(--header-height)] bg-white/80 backdrop-blur-xl border-b border-[#e5e5e7] flex items-center justify-between px-6">
      <div className="flex items-center gap-5">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="w-7 h-7 rounded-md bg-[#2563eb] flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="2" r="1.5" fill="#ffffff"/>
              <circle cx="3" cy="12" r="1.5" fill="#ffffff"/>
              <circle cx="11" cy="12" r="1.5" fill="#ffffff"/>
              <line x1="7" y1="3.5" x2="3" y2="10.5" stroke="#ffffff" strokeWidth="1"/>
              <line x1="7" y1="3.5" x2="11" y2="10.5" stroke="#ffffff" strokeWidth="1"/>
              <line x1="3" y1="10.5" x2="11" y2="10.5" stroke="#ffffff" strokeWidth="0.8"/>
            </svg>
          </span>
          <span className="text-sm font-bold text-gray-900 tracking-tight hidden sm:inline">
            BioMentor
          </span>
        </Link>
        <span className="text-[11px] px-2 py-0.5 rounded bg-gray-100 text-gray-500 tracking-wider font-medium">
          {role === "teacher" ? "教师端" : "学生端"}
        </span>
      </div>

      <h1 className="text-[13px] font-medium text-gray-600 absolute left-1/2 -translate-x-1/2 hidden md:block">
        {pageTitle}
      </h1>

      <div className="flex items-center gap-3">
        <button className="relative w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors">
          <Bell className="w-4 h-4 text-gray-500" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#dc2626]" />
        </button>
        <div className="flex items-center gap-2.5 pl-3 border-l border-[#e5e5e7]">
          <div className="w-7 h-7 rounded-full bg-gray-100 border border-[#e5e5e7] flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-gray-500" />
          </div>
          <div className="hidden sm:block">
            <p className="text-[12px] text-gray-900 font-medium leading-tight">
              {role === "teacher" ? "张教授" : "李明"}
            </p>
            <p className="text-[10px] text-gray-500 leading-tight">
              {role === "teacher" ? "生物工程学院" : "生物工程 2024 级"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
