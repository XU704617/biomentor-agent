"use client";

import Link from "next/link";
import { Dna, CircleDot, Microscope, GitFork, FileBarChart, BookX } from "lucide-react";

interface ToolCard {
  href: string;
  title: string;
  description: string[];
  Icon: typeof Dna;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
}

const toolCards: ToolCard[] = [
  {
    href: "/student/protein",
    title: "Protein Structure Viewer",
    description: ["3D \u7ed3\u6784\u63a2\u7d22", "\u6d3b\u6027\u4f4d\u70b9\u5206\u6790", "AlphaFold \u9884\u6d4b"],
    Icon: Dna,
    accentColor: "#2563eb",
    accentBg: "rgba(37, 99, 235, 0.08)",
    accentBorder: "#2563eb",
  },
  {
    href: "/student/plasmid",
    title: "Plasmid Map Viewer",
    description: ["\u56fe\u8c31\u6ce8\u91ca", "\u5143\u4ef6\u8bc6\u522b", "\u5b9e\u9a8c\u8bbe\u8ba1"],
    Icon: CircleDot,
    accentColor: "#059669",
    accentBg: "rgba(5, 150, 105, 0.08)",
    accentBorder: "#059669",
  },
  {
    href: "/student/sequence",
    title: "Sequence Analysis",
    description: ["BLAST \u6bd4\u5bf9", "\u5f15\u7269\u8bbe\u8ba1", "\u5e8f\u5217\u7ffb\u8bd1"],
    Icon: Microscope,
    accentColor: "#7c3aed",
    accentBg: "rgba(124, 58, 237, 0.08)",
    accentBorder: "#7c3aed",
  },
  {
    href: "/student/pathway",
    title: "Pathway Explorer",
    description: ["\u4fe1\u53f7\u901a\u8def", "\u86cb\u767d\u4e92\u4f5c", "\u4ee3\u8c22\u7f51\u7edc"],
    Icon: GitFork,
    accentColor: "#d97706",
    accentBg: "rgba(217, 119, 6, 0.08)",
    accentBorder: "#d97706",
  },
];

const assistCards = [
  {
    href: "/student/report",
    title: "Learning Diagnosis",
    subtitle: "\u5b66\u4e60\u8bca\u65ad",
    Icon: FileBarChart,
    accentColor: "#2563eb",
    accentBg: "rgba(37, 99, 235, 0.08)",
  },
  {
    href: "/student/wrong-questions",
    title: "Wrong Question Book",
    subtitle: "\u9519\u9898\u672c",
    Icon: BookX,
    accentColor: "#dc2626",
    accentBg: "rgba(220, 38, 38, 0.08)",
  },
];

function ToolLabel({ text }: { text: string }) {
  return (
    <span
      className="inline-block px-2.5 py-1 rounded-md text-[12px] font-medium leading-none"
      style={{
        background: "#f3f4f6",
        color: "#6b7280",
      }}
    >
      {text}
    </span>
  );
}

export default function BioToolBoxHome() {
  return (
    <div className="space-y-8 animate-reveal">
      <div className="page-header">
        <h1>BioToolBox</h1>
        <p>\u9009\u62e9\u5de5\u5177\u5f00\u59cb\u63a2\u7d22\u751f\u7269\u4e16\u754c</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {toolCards.map((card) => (
          <Link key={card.href} href={card.href} className="group block">
            <div
              className="card p-6 relative overflow-hidden transition-all duration-200 ease-out"
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
                  <h3
                    className="text-[15px] font-semibold mb-2"
                    style={{ color: "#1a1a1a" }}
                  >
                    <span className="mr-2">{card.title}</span>
                    <span
                      className="inline-block text-[11px] font-normal px-1.5 py-0.5 rounded align-middle"
                      style={{
                        background: card.accentBg,
                        color: card.accentColor,
                      }}
                    >
                      Beta
                    </span>
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {card.description.map((desc) => (
                      <ToolLabel key={desc} text={desc} />
                    ))}
                  </div>
                </div>
              </div>

              <div
                className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-1 transition-all duration-200 ease-out"
                style={{ color: card.accentColor }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="divider" />

      <section>
        <h2 className="text-[15px] font-semibold mb-4" style={{ color: "#1a1a1a" }}>
          \u5b66\u4e60\u8f85\u52a9
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assistCards.map((card) => (
            <Link key={card.href} href={card.href} className="group block">
              <div className="card p-5 flex items-center gap-4 transition-all duration-200 ease-out">
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: card.accentBg }}
                >
                  <card.Icon className="w-5 h-5" style={{ color: card.accentColor }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium" style={{ color: "#1a1a1a" }}>
                    {card.title}
                  </p>
                  <p className="text-[12px]" style={{ color: "#6b7280" }}>
                    {card.subtitle}
                  </p>
                </div>
                <div
                  className="flex-shrink-0 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-1 transition-all duration-200 ease-out"
                  style={{ color: card.accentColor }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
