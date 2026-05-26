"use client";

import { useState } from "react";
import {
  ArrowRightLeft,
  Search,
  Scissors,
  BarChart3,
  Send,
  ChevronDown,
  ChevronUp,
  Sparkles,
  User,
} from "lucide-react";

type ToolMode = "translate" | "blast" | "primer" | "gc";

interface ChatMessage {
  role: "ai" | "user";
  content: string;
}

const initialChat: ChatMessage[] = [
  {
    role: "ai",
    content:
      "我已分析你输入的序列。这段 DNA 序列长度为 861 bp，GC 含量 52.3%，包含一个完整的开放阅读框（ORF），编码 287 个氨基酸。我在序列中找到了 EcoRI (GAATTC) 和 BamHI (GGATCC) 两个限制酶切位点。你想进行什么分析？",
  },
  {
    role: "user",
    content: "帮我设计一对引物来扩增这段序列",
  },
  {
    role: "ai",
    content:
      "已为你设计引物：上游引物 5'-ATGGCCGTGAAGCTG...-3'（Tm=58.2°C, GC=55%），下游引物 5'-TTACTCGAGCAGTTT...-3'（Tm=59.1°C, GC=48%）。产物长度 450 bp。上下游 Tm 差 0.9°C，在合理范围内。需要注意下游引物 3' 端 GC 含量偏低，可以考虑延长 2-3 个碱基提升特异性。",
  },
];

const tools: { key: ToolMode; label: string; icon: typeof ArrowRightLeft }[] = [
  { key: "translate", label: "翻译", icon: ArrowRightLeft },
  { key: "blast", label: "BLAST 比对", icon: Search },
  { key: "primer", label: "引物设计", icon: Scissors },
  { key: "gc", label: "GC 含量", icon: BarChart3 },
];

const aminoAcidSeq =
  "MAVLKESFVLSFVLIAVFLASMVHHHHHSGLNDIFEAQKIEWHEGGLDRLYATVKKDGSPVSQLLALLHRAKALGGLDKSALYVGMGGISAMSQQLKEKSPEAKILLDPLEKAYAFELEDRKLFEGAWKAIAKVTERGHQLEQLVSFLKANNEQLKSVEEQKREAERQLD";

const blastResults = [
  {
    gene: "EGFP",
    organism: "Aequorea victoria",
    identity: "98.7%",
    eValue: "0.0",
  },
  {
    gene: "GFPuv",
    organism: "Aequorea victoria",
    identity: "95.2%",
    eValue: "2e-180",
  },
  {
    gene: "ZsGreen",
    organism: "Zoanthus sp.",
    identity: "72.4%",
    eValue: "5e-87",
  },
];

export default function SequencePage() {
  const [sequence, setSequence] = useState("");
  const [activeTool, setActiveTool] = useState<ToolMode>("gc");
  const [chatInput, setChatInput] = useState("");
  const [quizOpen, setQuizOpen] = useState(false);

  return (
    <div className="min-h-screen pt-[var(--nav-height)] flex flex-col px-6 md:px-10 pb-10 font-body">
      <div className="flex flex-col lg:flex-row flex-1 gap-6" style={{ minHeight: 0 }}>
        <div className="flex-[3] flex flex-col gap-4 min-w-0">
          <div className="flex flex-col gap-3">
            <textarea
              value={sequence}
              onChange={(e) => setSequence(e.target.value)}
              placeholder="粘贴 DNA/RNA 序列 (FASTA 格式)..."
              className="w-full px-4 py-3 rounded-xl text-sm bg-white/60 backdrop-blur border border-white/80 text-brand-ink placeholder:text-brand-faint outline-none focus:border-accent-electric/30 focus:ring-2 focus:ring-accent-electric/10 transition-all h-28 resize-none font-mono"
            />

            <div className="flex items-center gap-1.5 flex-wrap">
              {tools.map((tool) => {
                const Icon = tool.icon;
                const isActive = activeTool === tool.key;
                return (
                  <button
                    key={tool.key}
                    onClick={() => setActiveTool(tool.key)}
                    className={
                      isActive
                        ? "inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-brand-ink text-white hover:bg-[#1a1a2e] transition-all duration-200"
                        : "inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-brand-muted bg-white/40 border border-white/50 hover:bg-white/70 hover:text-brand-ink transition-all"
                    }
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tool.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="glass-card p-5 flex-1 flex flex-col gap-4 min-h-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="glass-card p-3 text-center">
                <div className="stat-number text-lg text-accent-electric">52.3%</div>
                <div className="text-[11px] text-brand-muted mt-0.5">GC 含量</div>
              </div>
              <div className="glass-card p-3 text-center">
                <div className="stat-number text-lg text-[#059669]">861 bp</div>
                <div className="text-[11px] text-brand-muted mt-0.5">序列长度</div>
              </div>
              <div className="glass-card p-3 text-center">
                <div className="stat-number text-lg text-accent-electric">287 aa</div>
                <div className="text-[11px] text-brand-muted mt-0.5">ORF</div>
              </div>
              <div className="glass-card p-3 text-center">
                <div className="stat-number text-lg text-[#059669]">58.2°C</div>
                <div className="text-[11px] text-brand-muted mt-0.5">Tm</div>
              </div>
            </div>

            <div className="flex-1 min-h-0">
              {activeTool === "translate" && (
                <div className="flex flex-col h-full">
                  <h3 className="font-display text-sm font-medium text-brand-ink mb-2">氨基酸序列</h3>
                  <div className="flex-1 overflow-auto p-3 rounded-lg text-xs break-all leading-relaxed font-mono bg-white/40 border border-white/50">
                    {aminoAcidSeq}
                  </div>
                </div>
              )}

              {activeTool === "primer" && (
                <div className="flex flex-col gap-3">
                  <h3 className="font-display text-sm font-medium text-brand-ink">引物设计结果</h3>
                  <div className="glass-card p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="badge badge-electric text-xs">上游引物</span>
                      <span className="text-xs text-brand-muted">Tm=58.2°C  GC=55%</span>
                    </div>
                    <div className="text-xs p-2.5 rounded-md break-all font-mono bg-white/40 border border-white/50">
                      5&apos;-ATGGCCGTGAAGCTGGAATCTTTCGTGCTGAGCTTCGTGCTGATCGC-3&apos;
                    </div>
                  </div>
                  <div className="glass-card p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="badge badge-cyan text-xs">下游引物</span>
                      <span className="text-xs text-brand-muted">Tm=59.1°C  GC=48%</span>
                    </div>
                    <div className="text-xs p-2.5 rounded-md break-all font-mono bg-white/40 border border-white/50">
                      5&apos;-TTACTCGAGCAGTTTCTGCTCTTCCTCTTTTTGCTCCTC-3&apos;
                    </div>
                  </div>
                  <div className="text-[11px] text-brand-muted mt-1">
                    产物长度：450 bp ｜ 上下游 Tm 差：0.9°C
                  </div>
                </div>
              )}

              {activeTool === "blast" && (
                <div className="flex flex-col gap-3">
                  <h3 className="font-display text-sm font-medium text-brand-ink">BLAST 比对结果</h3>
                  {blastResults.map((r, i) => (
                    <div key={i} className="glass-card p-4 flex items-center justify-between">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-brand-ink">{r.gene}</span>
                        <span className="text-[11px] text-brand-muted">{r.organism}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="stat-number text-[#059669]">{r.identity}</span>
                        <span className="stat-number text-brand-faint">E={r.eValue}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTool === "gc" && (
                <div className="flex flex-col gap-3 h-full">
                  <h3 className="font-display text-sm font-medium text-brand-ink">GC 含量概览</h3>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <div className="stat-number text-4xl text-accent-electric mb-2">52.3%</div>
                      <div className="text-sm text-brand-muted">GC 含量</div>
                      <div className="mt-4 flex items-center gap-6 text-xs text-brand-muted">
                        <div>
                          <span className="stat-number text-brand-ink">250</span> G
                        </div>
                        <div>
                          <span className="stat-number text-brand-ink">200</span> C
                        </div>
                        <div>
                          <span className="stat-number text-brand-ink">211</span> A
                        </div>
                        <div>
                          <span className="stat-number text-brand-ink">200</span> T
                        </div>
                      </div>
                      <div
                        className="mt-5 mx-auto h-3 rounded-full overflow-hidden flex"
                        style={{ width: "280px" }}
                      >
                        <div style={{ width: "29%", background: "#2563eb" }} />
                        <div style={{ width: "23%", background: "#3b82f6" }} />
                        <div style={{ width: "25%", background: "#93c5fd" }} />
                        <div style={{ width: "23%", background: "#dbeafe" }} />
                      </div>
                      <div className="flex justify-between mt-1.5 text-[10px] text-brand-faint" style={{ width: "280px", margin: "4px auto 0" }}>
                        <span>G</span>
                        <span>C</span>
                        <span>A</span>
                        <span>T</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="glass-card overflow-hidden">
            <button
              onClick={() => setQuizOpen(!quizOpen)}
              className="w-full p-4 flex items-center justify-between text-left"
            >
              <span className="text-xs font-medium text-brand-ink font-display">
                这段序列最适合用哪种限制酶进行克隆？为什么？
              </span>
              {quizOpen ? (
                <ChevronUp className="w-4 h-4 text-brand-faint" />
              ) : (
                <ChevronDown className="w-4 h-4 text-brand-faint" />
              )}
            </button>
            {quizOpen && (
              <div className="px-4 pb-4">
                <div
                  className="p-3 rounded-lg text-xs text-brand-muted leading-relaxed font-body"
                  style={{ background: "rgba(37, 99, 235, 0.04)", border: "1px solid rgba(37, 99, 235, 0.1)" }}
                >
                  EcoRI 和 BamHI 都是常用的限制性内切酶，产生粘性末端便于定向克隆。由于序列内部不含这两个酶切位点，可以在引物 5&apos; 端引入酶切位点和保护碱基，PCR 后酶切连接到表达载体中。
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex-[2] glass-card flex flex-col min-w-0">
          <div className="p-4 border-b border-white/60">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(37, 99, 235, 0.1)" }}
              >
                <Sparkles className="w-3.5 h-3.5 text-accent-electric" />
              </div>
              <span className="font-display text-sm font-medium text-brand-ink">AI 助手</span>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-4">
            {initialChat.map((msg, i) => (
              <div key={i} className="flex gap-3">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background:
                      msg.role === "ai"
                        ? "rgba(37, 99, 235, 0.1)"
                        : "rgba(5, 150, 105, 0.1)",
                  }}
                >
                  {msg.role === "ai" ? (
                    <Sparkles className="w-3.5 h-3.5 text-accent-electric" />
                  ) : (
                    <User className="w-3.5 h-3.5 text-[#059669]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-brand-faint mb-1">
                    {msg.role === "ai" ? "AI 助手" : "你"}
                  </div>
                  <div className="text-xs text-brand-ink leading-relaxed whitespace-pre-wrap font-body">
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-white/60">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="输入你的问题..."
                className="flex-1 px-4 py-2.5 rounded-xl text-sm bg-white/60 backdrop-blur border border-white/80 text-brand-ink placeholder:text-brand-faint outline-none focus:border-accent-electric/30 focus:ring-2 focus:ring-accent-electric/10 transition-all"
              />
              <button className="inline-flex items-center justify-center p-2.5 rounded-xl bg-brand-ink text-white hover:bg-[#1a1a2e] hover:shadow-lg hover:shadow-black/10 transition-all duration-200">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
