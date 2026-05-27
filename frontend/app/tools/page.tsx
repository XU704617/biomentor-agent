"use client";

import Link from "next/link";
import { Dna, CircleDot, Microscope, GitFork, ChevronRight, Sparkles } from "lucide-react";

interface ToolCard {
  href: string;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  cta: string;
  Icon: typeof Dna;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
}

const toolCards: ToolCard[] = [
  {
    href: "/tools/protein",
    title: "蛋白结构查看器",
    subtitle: "看见蛋白质的空间结构",
    description: "输入蛋白名、PDB ID 或 UniProt ID，直接查看三维结构，并结合 AI 讲解结构域、活性位点和功能关系。",
    tags: ["三维结构", "结构域", "活性位点"],
    cta: "查看蛋白结构",
    Icon: Dna,
    accentColor: "#2563eb",
    accentBg: "rgba(37, 99, 235, 0.08)",
    accentBorder: "#2563eb",
  },
  {
    href: "/tools/plasmid",
    title: "质粒图谱查看器",
    subtitle: "把质粒序列变成实验图谱",
    description: "上传或选择质粒文件，识别 ori、抗性基因、启动子、MCS 等元件，辅助理解克隆和表达实验设计。",
    tags: ["质粒图谱", "元件识别", "实验设计"],
    cta: "分析质粒图谱",
    Icon: CircleDot,
    accentColor: "#059669",
    accentBg: "rgba(5, 150, 105, 0.08)",
    accentBorder: "#059669",
  },
  {
    href: "/tools/sequence",
    title: "序列分析工具",
    subtitle: "快速理解 DNA / RNA 序列",
    description: "粘贴序列后进行 GC 含量、翻译、引物设计、酶切位点等分析，适合课堂练习和实验前检查。",
    tags: ["GC 含量", "序列翻译", "引物设计"],
    cta: "开始序列分析",
    Icon: Microscope,
    accentColor: "#7c3aed",
    accentBg: "rgba(124, 58, 237, 0.08)",
    accentBorder: "#7c3aed",
  },
  {
    href: "/tools/pathway",
    title: "通路知识图谱",
    subtitle: "用网络理解生命过程",
    description: "选择细胞周期、凋亡、MAPK 等通路，交互式查看关键蛋白、上下游关系和调控机制。",
    tags: ["信号通路", "调控关系", "知识图谱"],
    cta: "探索通路网络",
    Icon: GitFork,
    accentColor: "#d97706",
    accentBg: "rgba(217, 119, 6, 0.08)",
    accentBorder: "#d97706",
  },
];

export default function ToolsPage() {
  return (
    <div className="min-h-screen pt-[var(--nav-height)] px-6 md:px-10 pb-16">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="pt-10 pb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(37,99,235,0.08)] text-accent-electric text-xs font-semibold border border-[#2563eb]/15 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            BioToolBox 生物学习工具箱
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight text-brand-ink">
            把抽象知识变成可操作的生物学探索
          </h1>
          <p className="mt-3 text-sm md:text-base text-brand-muted font-body max-w-3xl leading-relaxed">
            从蛋白结构、质粒图谱、序列分析到通路网络，学生可以边看、边操作、边提问；教师可以把这些工具嵌入案例讲解、测验和实验设计训练。
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {toolCards.map((card) => (
            <Link key={card.href} href={card.href} className="group block">
              <div
                className="glass-card p-6 relative overflow-hidden transition-all duration-200 ease-out h-full hover:-translate-y-0.5"
                style={{ borderLeft: `4px solid ${card.accentBorder}` }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ background: card.accentBg }}
                  >
                    <card.Icon className="w-6 h-6" style={{ color: card.accentColor }} />
                  </div>
                  <div className="min-w-0 flex-1 pr-5">
                    <p className="text-[11px] font-semibold mb-1" style={{ color: card.accentColor }}>
                      {card.subtitle}
                    </p>
                    <h3 className="font-display text-lg font-semibold text-brand-ink mb-2">
                      {card.title}
                    </h3>
                    <p className="text-sm text-brand-muted leading-relaxed mb-4">
                      {card.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {card.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-block px-2.5 py-1 rounded-md text-[12px] font-medium leading-none font-body text-brand-muted"
                          style={{ background: "rgba(13, 13, 26, 0.04)" }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: card.accentColor }}>
                      {card.cta}
                      <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>

                <div
                  className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-1 transition-all duration-200 ease-out"
                  style={{ color: card.accentColor }}
                >
                  <ChevronRight className="w-[18px] h-[18px]" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
