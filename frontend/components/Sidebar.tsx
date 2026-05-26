"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  GitBranch,
  Sparkles,
  Database,
  Send,
  BarChart3,
  Home,
  BookOpen,
  ClipboardCheck,
  FileBarChart,
  BookX,
  Microscope,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  role: "teacher" | "student";
}

const teacherNav = [
  { href: "/teacher", label: "教学驾驶舱", icon: LayoutDashboard },
  { href: "/teacher/materials", label: "课程资料库", icon: FileText },
  { href: "/teacher/knowledge-map", label: "知识地图", icon: GitBranch },
  { href: "/teacher/ai-generate", label: "AI 智能出题", icon: Sparkles },
  { href: "/teacher/question-bank", label: "题库管理", icon: Database },
  { href: "/teacher/quiz-publish", label: "测验发布", icon: Send },
  { href: "/teacher/class-analysis", label: "班级分析", icon: BarChart3 },
];

const studentNav = [
  { href: "/student", label: "学习中心", icon: Home },
  { href: "/student/quiz", label: "在线测验", icon: ClipboardCheck },
  { href: "/student/report", label: "学习诊断", icon: FileBarChart },
  { href: "/student/wrong-questions", label: "错题本", icon: BookX },
  { href: "/student/case-study", label: "科研案例", icon: Microscope },
];

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const navItems = role === "teacher" ? teacherNav : studentNav;

  return (
    <aside className="fixed top-[var(--header-height)] left-0 bottom-0 w-[var(--sidebar-width)] glass border-r border-white/5 flex flex-col z-40">
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== `/${role}` && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                isActive
                  ? "bg-white/10 text-primary-light border border-primary/20"
                  : "text-text-secondary hover:text-text-primary hover:bg-white/5 border border-transparent"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 transition-colors",
                  isActive ? "text-primary-light" : "text-text-muted group-hover:text-text-secondary"
                )}
              />
              <span>{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-light shadow-glow" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/5">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs text-text-muted hover:text-text-secondary hover:bg-white/5 transition-all"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>返回首页</span>
        </Link>
      </div>
    </aside>
  );
}
