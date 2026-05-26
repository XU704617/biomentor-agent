"use client";

import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";

const layers = [
  {
    title: "教学资源层",
    subtitle: "Resource Layer",
    desc: "课程资料 · 题库管理 · 知识图谱 · 科研案例",
    delay: "reveal-delay-1",
  },
  {
    title: "智能引擎层",
    subtitle: "AI Engine",
    desc: "自适应推荐 · 知识追踪 · 智能出题 · 学情诊断",
    delay: "reveal-delay-2",
  },
  {
    title: "交互体验层",
    subtitle: "Experience Layer",
    desc: "自适应测验 · 案例辅导 · 即时反馈 · 数据可视化",
    delay: "reveal-delay-3",
  },
  {
    title: "数据分析层",
    subtitle: "Analytics Layer",
    desc: "学情分析 · 薄弱点诊断 · 班级报告 · 趋势预测",
    delay: "reveal-delay-4",
  },
  {
    title: "平台服务层",
    subtitle: "Platform Layer",
    desc: "统一认证 · 数据存储 · 消息通知 · API 网关",
    delay: "reveal-delay-4",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface-base relative overflow-hidden">
      <div className="absolute inset-0 bg-amber-radial pointer-events-none" />
      <div className="absolute inset-0 bg-sage-radial pointer-events-none" />
      <div className="absolute inset-0 bg-dot-grid bg-dot-md pointer-events-none opacity-60" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-16 animate-reveal">
          <div className="inline-flex items-center gap-2.5 mb-8 px-4 py-2 rounded-full bg-surface-field border border-border-subtle">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="2" r="1.3" fill="#e8983e"/>
              <circle cx="3" cy="12" r="1.3" fill="#e8983e"/>
              <circle cx="11" cy="12" r="1.3" fill="#e8983e"/>
              <line x1="7" y1="3.3" x2="3" y2="10.7" stroke="#e8983e" strokeWidth="0.8"/>
              <line x1="7" y1="3.3" x2="11" y2="10.7" stroke="#e8983e" strokeWidth="0.8"/>
              <line x1="3" y1="10.7" x2="11" y2="10.7" stroke="#e8983e" strokeWidth="0.6"/>
            </svg>
            <span className="text-[11px] text-ink-faint tracking-widest uppercase">
              面向生物制造课程的科研型自适应学习智能体平台
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-display font-bold text-ink mb-4 tracking-tight">
            BioMentor Agent
          </h1>
          <p className="text-2xl md:text-3xl font-display text-ink-muted mb-6">
            智造学伴
          </p>
          <p className="text-ink-faint max-w-xl mx-auto text-[15px] leading-relaxed text-balance">
            深度融合生物制造课程体系，基于 AI 技术为师生提供自适应学习体验，
            助力科研型人才培养。
          </p>

          <div className="flex items-center justify-center gap-4 mt-10">
            <Link
              href="/teacher"
              className="btn-amber text-[14px]"
            >
              <span className="font-medium">教师端入口</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/student"
              className="btn-sage text-[14px]"
            >
              <span className="font-medium">学生端入口</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-center mb-8">
            <h3 className="text-[11px] tracking-[0.15em] text-ink-dim mb-2">五层系统架构</h3>
            <p className="text-[13px] text-ink-faint">面向生物制造的自适应学习智能体系统</p>
          </div>

          {layers.map((layer, i) => (
            <div
              key={layer.title}
              className={`lab-card p-5 animate-${layer.delay} group cursor-default`}
            >
              <div className="flex items-center gap-5">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-surface-field border border-border-subtle flex items-center justify-center text-lg">
                  {["📚", "🧠", "💡", "📊", "⚙️"][i]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-[15px] font-medium text-ink">
                      {layer.title}
                    </h2>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-surface-field text-ink-faint uppercase tracking-wider">
                      {layer.subtitle}
                    </span>
                  </div>
                  <p className="text-[13px] text-ink-muted">{layer.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-ink-dim opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-300" />
              </div>
            </div>
          ))}

          <div className="text-center pt-10">
            <p className="text-[11px] text-ink-dim">
              BioMentor Agent v0.1.0  ·  © 2025 智造学伴团队
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
