"use client";

import Link from "next/link";
import { ArrowRight, ArrowDown, Sparkles, BookOpen, Microscope, Building2, Users, ChevronRight } from "lucide-react";
import { HeroCanvas } from "@/components/HeroCanvas";
import { CountUp } from "@/components/CountUp";

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-[var(--nav-height)]">
        <HeroCanvas />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#f0f4ff] pointer-events-none" />

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <div className="animate-reveal-up">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 backdrop-blur-xl border border-white/60 text-[13px] font-semibold text-[#4a4a6a] mb-8">
              <Sparkles className="w-3.5 h-3.5 text-[#2563eb]" />
              科研型自适应学习智能体
            </span>
          </div>

          <h1 className="font-display font-black text-[#0d0d1a] leading-[0.9] tracking-[-0.04em] mb-6">
            <span className="block text-[clamp(64px,10vw,120px)] animate-reveal-up">
              BIO
            </span>
            <span className="block text-[clamp(48px,7vw,88px)] animate-reveal-up-1">
              MENTOR
            </span>
            <span className="block text-[clamp(36px,5vw,64px)] animate-reveal-up-2 text-[#1a1a2e]">
              AGENT
            </span>
          </h1>

          <p className="text-lg md:text-xl text-[#4a4a6a] max-w-xl mx-auto leading-relaxed mb-10 animate-reveal-up-3">
            以知识点为入口，融合课程知识、科研文献、产业案例、
            多角色 AI 导师和生物专业工具
          </p>

          <div className="flex items-center justify-center gap-4 animate-reveal-up-4">
            <Link href="/explore" className="btn-hero">
              开始探索
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() =>
                document
                  .getElementById("narrative")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="btn-hero-secondary"
            >
              了解更多
              <ArrowDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* NARRATIVE: 三层递进 */}
      <section
        id="narrative"
        className="py-24 md:py-32 px-6 md:px-10 max-w-6xl mx-auto"
      >
        <div className="text-center mb-16">
          <p className="section-title">学习架构</p>
          <h2 className="section-heading">
            从基础到前沿，
            <br className="hidden md:block" />
            三层递进式学习
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: BookOpen,
              title: "基础知识",
              desc: "课程核心概念与理论体系，系统化掌握学科框架",
              color: "text-[#2563eb]",
              bg: "bg-[#eff6ff]",
              border: "border-[#dbeafe]",
            },
            {
              icon: Microscope,
              title: "科研前沿",
              desc: "最新文献追踪与实验方法，理解科研思维与技术创新",
              color: "text-[#06b6d4]",
              bg: "bg-[#ecfeff]",
              border: "border-[#cffafe]",
            },
            {
              icon: Building2,
              title: "产业应用",
              desc: "真实产业案例与转化路径，连接学术研究与产业实践",
              color: "text-[#f59e0b]",
              bg: "bg-[#fffbeb]",
              border: "border-[#fef3c7]",
            },
          ].map((item, i) => (
            <div
              key={item.title}
              className={`glass-card p-8 md:p-10 text-center animate-reveal-up`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div
                className={`w-14 h-14 mx-auto mb-6 rounded-2xl ${item.bg} border ${item.border} flex items-center justify-center`}
              >
                <item.icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <h3 className="font-display text-xl font-bold text-[#0d0d1a] mb-3">
                {item.title}
              </h3>
              <p className="text-sm text-[#4a4a6a] leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* AI MENTOR TEAM */}
      <section className="py-24 md:py-32 px-6 md:px-10 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="section-title">多角色 AI 导师</p>
          <h2 className="section-heading">
            你的专属科研导师团队
          </h2>
          <p className="text-[#4a4a6a] mt-4 max-w-lg mx-auto">
            三位 AI 导师各司其职，从课程学习到科研实战，全程陪伴你的成长
          </p>
        </div>

        <div className="glass-card-iridescent p-8 md:p-12 max-w-3xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {["课程导师", "科研导师", "产业导师"].map((role, i) => (
              <button
                key={role}
                className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                  i === 0
                    ? "bg-[#0d0d1a] text-white"
                    : "bg-white/40 text-[#4a4a6a] hover:bg-white/70"
                }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                {role}
              </button>
            ))}
          </div>
          <div className="bg-[#f8f9fc] rounded-2xl p-6 md:p-8 border border-[#e8e8f0]">
            <p className="text-[#4a4a6a] leading-relaxed">
              <span className="font-semibold text-[#0d0d1a]">
                你好，我是你的专属课程导师。
              </span>
              <br className="mb-2" />
              让我们一起探索 CRISPR 基因编辑技术的分子机制。首先我会帮你理解 Cas9
              蛋白的三维结构和功能域，然后我们通过文献阅读了解最新的碱基编辑器进展，
              最后分析这项技术在农业育种中的产业应用。
            </p>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-20 px-6 md:px-10">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: 500, suffix: "+", label: "知识节点" },
            { value: 200, suffix: "+", label: "科研案例" },
            { value: 4, suffix: " 大", label: "生物工具" },
            { value: 24, suffix: "/7", label: "AI 陪伴" },
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-6 md:p-8 text-center">
              <CountUp end={stat.value} suffix={stat.suffix} />
              <p className="text-sm text-[#4a4a6a] mt-2 font-medium">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURE ENTRY */}
      <section className="py-24 md:py-32 px-6 md:px-10 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="section-title">核心功能</p>
          <h2 className="section-heading">
            探索你的学习之旅
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              href: "/explore",
              title: "知识探索中心",
              desc: "搜索知识点，三层内容展开，AI 导师实时讲解",
              accent: "#2563eb",
            },
            {
              href: "/research",
              title: "科研实战训练营",
              desc: "AI 引导完成文献调研、实验设计、数据分析",
              accent: "#06b6d4",
            },
            {
              href: "/tools",
              title: "生物工具箱",
              desc: "蛋白3D查看、质粒图谱、序列分析、通路探索",
              accent: "#f59e0b",
            },
            {
              href: "/seminar",
              title: "学术研讨",
              desc: "模拟学术会议与答辩，训练科研表达能力",
              accent: "#7c3aed",
            },
            {
              href: "/cases",
              title: "产业案例库",
              desc: "生物合成、基因治疗、CAR-T 等真实案例",
              accent: "#059669",
            },
            {
              href: "/knowledge-map",
              title: "知识图谱浏览",
              desc: "可视化学科知识网络，发现知识关联",
              accent: "#dc2626",
            },
          ].map((feature) => (
            <Link
              key={feature.href}
              href={feature.href}
              className="glass-card group p-6 md:p-8 flex flex-col gap-3 cursor-pointer"
            >
              <div
                className="w-2 h-2 rounded-full mb-2"
                style={{ backgroundColor: feature.accent }}
              />
              <h3 className="font-display text-lg font-bold text-[#0d0d1a] group-hover:text-[#2563eb] transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-[#4a4a6a] leading-relaxed">
                {feature.desc}
              </p>
              <span className="flex items-center gap-1 text-xs font-semibold text-[#2563eb] mt-auto opacity-0 group-hover:opacity-100 transition-opacity">
                进入
                <ChevronRight className="w-3 h-3" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-black/5 py-12 px-6 md:px-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-[#0d0d1a] flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </span>
            <span className="font-display text-sm font-bold text-[#0d0d1a]">
              BioMentor Agent
            </span>
            <span className="text-xs text-[#8e8eaa] ml-2">智造学伴</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-[#4a4a6a]">
            <span>Next.js + FastAPI</span>
            <span>Three.js</span>
            <span>Cytoscape.js</span>
          </div>
          <p className="text-xs text-[#8e8eaa]">
            &copy; 2025 BioMentor Agent
          </p>
        </div>
      </footer>
    </>
  );
}
