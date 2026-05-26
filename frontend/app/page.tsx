"use client";

import Link from "next/link";
import { Dna, GraduationCap, ArrowRight, ChevronRight } from "lucide-react";

const layers = [
  {
    title: "教学资源层",
    subtitle: "Resource Layer",
    desc: "课程资料 · 题库管理 · 知识图谱 · 科研案例",
    color: "from-primary/20 to-primary/5",
    border: "border-primary/30",
    icon: "📚",
    delay: "0",
  },
  {
    title: "智能引擎层",
    subtitle: "AI Engine",
    desc: "自适应推荐 · 知识追踪 · 智能出题 · 学情诊断",
    color: "from-accent/20 to-accent/5",
    border: "border-accent/30",
    icon: "🧠",
    delay: "100",
  },
  {
    title: "交互体验层",
    subtitle: "Experience Layer",
    desc: "自适应测验 · 案例辅导 · 即时反馈 · 数据可视化",
    color: "from-purple-500/20 to-purple-500/5",
    border: "border-purple-500/30",
    icon: "💡",
    delay: "200",
  },
  {
    title: "数据分析层",
    subtitle: "Analytics Layer",
    desc: "学情分析 · 薄弱点诊断 · 班级报告 · 趋势预测",
    color: "from-primary/15 to-accent/5",
    border: "border-primary/30",
    icon: "📊",
    delay: "300",
  },
  {
    title: "平台服务层",
    subtitle: "Platform Layer",
    desc: "统一认证 · 数据存储 · 消息通知 · API 网关",
    color: "from-slate-500/20 to-slate-500/5",
    border: "border-slate-500/30",
    icon: "⚙️",
    delay: "400",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-bg-dark relative overflow-hidden">
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent-glow rounded-full blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-purple-500/10 to-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2.5 mb-6 px-4 py-2 rounded-full glass border-white/10">
            <Dna className="w-4 h-4 text-primary-light" />
            <span className="text-xs text-text-secondary tracking-wider">
              面向生物制造课程的科研型自适应学习智能体平台
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 tracking-tight">
            <span className="text-gradient">BioMentor Agent</span>
          </h1>
          <p className="text-3xl md:text-4xl font-bold text-text-primary mb-6">
            智造学伴
          </p>
          <p className="text-text-secondary max-w-2xl mx-auto text-base leading-relaxed">
            基于 AI 技术的自适应学习平台，深度融合生物制造课程体系，
            为师生提供智能化的教学与学习体验，助力科研型人才培养。
          </p>

          <div className="flex items-center justify-center gap-4 mt-10">
            <Link
              href="/teacher"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-primary-dark to-primary border border-primary/40 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all duration-300"
            >
              <GraduationCap className="w-5 h-5" />
              <span>教师端入口</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/student"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-accent-dark to-accent border border-accent/40 hover:shadow-lg hover:shadow-accent/20 hover:-translate-y-0.5 transition-all duration-300"
            >
              <GraduationCap className="w-5 h-5" />
              <span>学生端入口</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-text-primary">五层系统架构</h2>
            <p className="text-sm text-text-muted mt-1">
              面向生物制造的自适应学习智能体系统
            </p>
          </div>

          {layers.map((layer) => (
            <div
              key={layer.title}
              className="glass-card p-5 relative overflow-hidden group cursor-default"
              style={{ animationDelay: `${layer.delay}ms` }}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-r ${layer.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />
              <div className="relative z-10 flex items-center gap-4">
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl">
                  {layer.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-semibold text-text-primary">
                      {layer.title}
                    </h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-text-muted border border-white/10">
                      {layer.subtitle}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary">{layer.desc}</p>
                </div>
                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1">
                  <ChevronRight className="w-5 h-5 text-text-muted" />
                </div>
              </div>
            </div>
          ))}

          <div className="text-center pt-8">
            <p className="text-xs text-text-muted flex items-center justify-center gap-1.5">
              <Dna className="w-3 h-3" />
              BioMentor Agent  v0.1.0  |  © 2025 智造学伴团队
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
