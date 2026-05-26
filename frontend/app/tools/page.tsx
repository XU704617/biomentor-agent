"use client";

import Link from "next/link";
import { Dna, CircleDot, Microscope, GitFork, ChevronRight } from "lucide-react";

interface ToolCard {
  href: string;
  title: string;
  tags: string[];
  Icon: typeof Dna;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
}

const toolCards: ToolCard[] = [
  {
    href: "/tools/protein",
    title: "蛋白结构查看器",
    tags: ["3D 结构探索", "活性位点分析", "AlphaFold 预测"],
    Icon: Dna,
    accentColor: "#2563eb",
    accentBg: "rgba(37, 99, 235, 0.08)",
    accentBorder: "#2563eb",
  },
  {
    href: "/tools/plasmid",
    title: "质粒图谱查看器",
    tags: ["图谱注释", "元件识别", "实验设计"],
    Icon: CircleDot,
    accentColor: "#059669",
    accentBg: "rgba(5, 150, 105, 0.08)",
    accentBorder: "#059669",
  },
  {
    href: "/tools/sequence",
    title: "序列分析工具",
    tags: ["BLAST 比对", "引物设计", "序列翻译"],
    Icon: Microscope,
    accentColor: "#7c3aed",
    accentBg: "rgba(124, 58, 237, 0.08)",
    accentBorder: "#7c3aed",
  },
  {
    href: "/tools/pathway",
    title: "通路知识图谱",
    tags: ["信号通路", "蛋白互作", "代谢网络"],
    Icon: GitFork,
    accentColor: "#d97706",
    accentBg: "rgba(217, 119, 6, 0.08)",
    accentBorder: "#d97706",
  },
];

export default function ToolsPage() {
  return (
    <div className="min-h-screen pt-[var(--nav-height)] px-6 md:px-10 pb-16">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="pt-10 pb-2">
          <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight text-brand-ink">
            生物工具箱
          </h1>
          <p className="mt-2 text-sm md:text-base text-brand-muted font-body">
            选择工具开始探索生物世界 — 从蛋白质结构到信号通路，一站式分析
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {toolCards.map((card) => (
            <Link key={card.href} href={card.href} className="group block">
              <div
                className="glass-card p-6 relative overflow-hidden transition-all duration-200 ease-out"
                style={{ borderLeft: `4px solid ${card.accentBorder}` }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ background: card.accentBg }}
                  >
                    <card.Icon className="w-6 h-6" style={{ color: card.accentColor }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-[15px] font-semibold mb-2 text-brand-ink">
                      {card.title}
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
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
