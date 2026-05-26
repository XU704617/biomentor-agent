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
  Dna,
  CircleDot,
  Microscope,
  GitFork,
  FileBarChart,
  BookX,
  ArrowLeft,
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

const studentToolNav = [
  { href: "/student/protein", label: "蛋白结构查看器", icon: Dna },
  { href: "/student/plasmid", label: "质粒图谱查看器", icon: CircleDot },
  { href: "/student/sequence", label: "序列分析工具", icon: Microscope },
  { href: "/student/pathway", label: "通路知识图谱", icon: GitFork },
];

const studentAuxNav = [
  { href: "/student/report", label: "学习诊断", icon: FileBarChart },
  { href: "/student/wrong-questions", label: "错题本", icon: BookX },
];

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const sectionClass =
    "text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-3 pt-5 pb-1.5";

  const navLinkClass = (isActive: boolean) =>
    cn(
      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-colors duration-150 group",
      isActive
        ? "bg-blue-50 text-blue-600 font-medium"
        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
    );

  const iconClass = (isActive: boolean) =>
    cn(
      "w-4 h-4 flex-shrink-0 transition-colors",
      isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-500"
    );

  const renderNavItems = (items: typeof teacherNav) =>
    items.map((item) => {
      const Icon = item.icon;
      const isActive =
        pathname === item.href ||
        (item.href !== `/${role}` && pathname.startsWith(item.href));

      return (
        <Link
          key={item.href}
          href={item.href}
          className={navLinkClass(isActive)}
        >
          <Icon className={iconClass(isActive)} />
          <span>{item.label}</span>
          {isActive && (
            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />
          )}
        </Link>
      );
    });

  return (
    <aside className="fixed top-[var(--header-height)] left-0 bottom-0 w-[var(--sidebar-width)] bg-white/80 backdrop-blur-xl border-r border-[#e5e5e7] flex flex-col z-40">
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {role === "teacher" ? (
          renderNavItems(teacherNav)
        ) : (
          <>
            <div className={sectionClass}>BioToolBox</div>
            {renderNavItems(studentToolNav)}
            <div className="mx-3 my-3 border-t border-[#f3f4f6]" />
            <div className={sectionClass}>学习辅助</div>
            {renderNavItems(studentAuxNav)}
          </>
        )}
      </nav>

      <div className="p-3 border-t border-[#e5e5e7]">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-[12px] text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>返回首页</span>
        </Link>
      </div>
    </aside>
  );
}
