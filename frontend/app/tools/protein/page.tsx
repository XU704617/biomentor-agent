"use client";

import { useState, useRef, useEffect } from "react";
import {
  Search,
  Bot,
  SendHorizonal,
  RotateCw,
  ZoomIn,
  Box,
  Layers,
  FlaskConical,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const suggestions = ["CRISPR-Cas9", "GFP", "胰岛素", "血红蛋白"];

const chatMessages = [
  {
    role: "ai",
    text: "这是 CRISPR-Cas9 蛋白的三维结构。Cas9 蛋白（灰色区域）包含 RuvC 和 HNH 两个核酸酶结构域。sgRNA（橙色）引导 Cas9 识别目标 DNA 序列。你可以旋转、缩放来探索结构。有什么想了解的？",
  },
  {
    role: "user",
    text: "活性位点在哪里？",
  },
  {
    role: "ai",
    text: "RuvC 结构域（第 10-75 号残基）和 HNH 结构域（第 780-910 号残基）共同构成切割活性中心。我已在结构中高亮显示了这两个区域。RuvC 切割非靶标链，HNH 切割靶标链。你想进一步了解它们的催化机制吗？",
  },
];

const toolButtons = [
  { icon: RotateCw, label: "旋转" },
  { icon: ZoomIn, label: "缩放" },
  { icon: Box, label: "表面" },
  { icon: Layers, label: "卡通" },
  { icon: FlaskConical, label: "配体" },
];

export default function ProteinPage() {
  const [proteinName, setProteinName] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState("");
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleQuizSubmit = () => {
    if (quizAnswer) setQuizSubmitted(true);
  };

  return (
    <div className="min-h-screen pt-[var(--nav-height)] flex flex-col px-6 md:px-10 pb-10 font-body">
      <div className="flex flex-col lg:flex-row flex-1 gap-6" style={{ minHeight: 0 }}>
        <div className="flex-[3] flex flex-col gap-4 min-w-0">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-faint" />
              <input
                type="text"
                placeholder="输入蛋白名或 UniProt ID"
                value={proteinName}
                onChange={(e) => setProteinName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white/60 backdrop-blur border border-white/80 text-brand-ink placeholder:text-brand-faint outline-none focus:border-accent-electric/30 focus:ring-2 focus:ring-accent-electric/10 transition-all"
              />
            </div>
            <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-brand-ink text-white hover:bg-[#1a1a2e] hover:shadow-lg hover:shadow-black/10 transition-all duration-200">
              查看
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => setProteinName(s)}
                className="px-3 py-1.5 rounded-full text-xs font-medium text-brand-muted bg-white/40 border border-white/50 hover:bg-white/70 hover:border-accent-electric/20 transition-all"
              >
                {s}
              </button>
            ))}
          </div>

          <div
            className="glass-card flex items-center justify-center relative overflow-hidden flex-shrink-0"
            style={{
              backgroundColor: "#1e1f24",
              minHeight: 420,
            }}
          >
            <svg
              viewBox="0 0 200 320"
              style={{ width: 160, height: 260 }}
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M50 40 C90 80 140 20 156 80 C172 140 120 140 136 200 C152 260 100 300 100 320"
                stroke="#3b82f6"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
                opacity="0.7"
              />
              <path
                d="M150 40 C110 80 60 20 44 80 C28 140 80 140 64 200 C48 260 100 300 100 320"
                stroke="#60a5fa"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
                opacity="0.5"
              />
              <line x1="50" y1="50" x2="150" y2="50" stroke="#4b5563" strokeWidth="0.8" opacity="0.4" />
              <line x1="42" y1="90" x2="158" y2="90" stroke="#4b5563" strokeWidth="0.8" opacity="0.4" />
              <line x1="38" y1="130" x2="162" y2="130" stroke="#4b5563" strokeWidth="0.8" opacity="0.4" />
              <line x1="42" y1="170" x2="158" y2="170" stroke="#4b5563" strokeWidth="0.8" opacity="0.4" />
              <line x1="50" y1="210" x2="150" y2="210" stroke="#4b5563" strokeWidth="0.8" opacity="0.4" />
              <line x1="58" y1="250" x2="142" y2="250" stroke="#4b5563" strokeWidth="0.8" opacity="0.4" />
              <line x1="70" y1="290" x2="130" y2="290" stroke="#4b5563" strokeWidth="0.8" opacity="0.4" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-sm font-medium text-brand-faint">3D 蛋白结构视图</p>
              <p className="text-xs mt-1 text-brand-muted">Mol* / 3Dmol.js 集成区域</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 py-1">
            {toolButtons.map((btn) => (
              <button
                key={btn.label}
                className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-brand-muted hover:text-brand-ink hover:bg-white/50 transition-all"
                title={btn.label}
              >
                <btn.icon className="w-4 h-4" />
                <span className="text-[10px]">{btn.label}</span>
              </button>
            ))}
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-display text-sm font-semibold text-brand-ink">CRISPR-Cas9</span>
              <span className="badge badge-electric">AlphaFold DB</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-brand-muted">
              <span>
                pLDDT: <span className="stat-number text-[#059669]">92.3</span>
              </span>
              <span>
                PDB: <span className="stat-number text-accent-electric">7Z4C</span>
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[rgba(5,150,105,0.08)] text-[#059669]">高置信度</span>
            </div>
          </div>
        </div>

        <div className="flex-[2] glass-card flex flex-col min-w-0">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-white/60">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "rgba(37,99,235,0.08)" }}
            >
              <Bot className="w-4 h-4 text-accent-electric" />
            </div>
            <span className="font-display text-sm font-semibold text-brand-ink">AI 智能体</span>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4" style={{ minHeight: 0 }}>
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className="flex"
                style={{ justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}
              >
                <div
                  className="max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
                  style={
                    msg.role === "ai"
                      ? { backgroundColor: "rgba(13,13,26,0.04)", color: "#0d0d1a", borderBottomLeftRadius: 6 }
                      : { backgroundColor: "#2563eb", color: "#ffffff", borderBottomRightRadius: 6 }
                  }
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 border-t border-white/60">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="输入你的问题..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm bg-white/60 backdrop-blur border border-white/80 text-brand-ink placeholder:text-brand-faint outline-none focus:border-accent-electric/30 focus:ring-2 focus:ring-accent-electric/10 transition-all"
              />
              <button className="inline-flex items-center justify-center p-2.5 rounded-xl bg-brand-ink text-white hover:bg-[#1a1a2e] hover:shadow-lg hover:shadow-black/10 transition-all duration-200">
                <SendHorizonal className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card mt-4 overflow-hidden">
        <button
          onClick={() => setQuizOpen(!quizOpen)}
          className="w-full flex items-center justify-between px-6 py-3 text-sm font-medium hover:bg-white/30 transition-colors text-brand-ink"
        >
          <span>验证理解</span>
          {quizOpen ? (
            <ChevronUp className="w-4 h-4 text-brand-muted" />
          ) : (
            <ChevronDown className="w-4 h-4 text-brand-muted" />
          )}
        </button>

        {quizOpen && (
          <div className="px-6 pb-5">
            <div className="glass-card p-5">
              <p className="font-body text-sm font-medium mb-4 text-brand-ink">
                Cas9 蛋白的两个核酸酶结构域分别叫什么？
              </p>
              <div className="space-y-2.5 mb-4">
                {[
                  { value: "a", label: "A. RuvC 和 HNH" },
                  { value: "b", label: "B. Cas1 和 Cas2" },
                  { value: "c", label: "C. RecA 和 RecBCD" },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      quizSubmitted && opt.value === "a"
                        ? "bg-[#ecfdf5] border border-[#059669]/20"
                        : quizSubmitted && quizAnswer === opt.value && opt.value !== "a"
                        ? "bg-[#fef2f2] border border-[#dc2626]/20"
                        : quizAnswer === opt.value
                        ? "bg-[rgba(37,99,235,0.04)] border border-[#2563eb]/20"
                        : "bg-white/40 border border-transparent hover:bg-white/70"
                    }`}
                  >
                    <div
                      className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                      style={
                        quizSubmitted && opt.value === "a"
                          ? { borderColor: "#059669", backgroundColor: "rgba(5,150,105,0.15)" }
                          : quizSubmitted && quizAnswer === opt.value && opt.value !== "a"
                          ? { borderColor: "#dc2626", backgroundColor: "rgba(220,38,38,0.1)" }
                          : quizAnswer === opt.value
                          ? { borderColor: "#2563eb", backgroundColor: "rgba(37,99,235,0.15)" }
                          : { borderColor: "#d4d4d8" }
                      }
                    >
                      {quizAnswer === opt.value && (
                        <div
                          className="w-2 h-2 rounded-full"
                          style={
                            quizSubmitted && opt.value === "a"
                              ? { backgroundColor: "#059669" }
                              : quizSubmitted && opt.value !== "a"
                              ? { backgroundColor: "#dc2626" }
                              : { backgroundColor: "#2563eb" }
                          }
                        />
                      )}
                    </div>
                    <input
                      type="radio"
                      name="protein-quiz"
                      value={opt.value}
                      checked={quizAnswer === opt.value}
                      onChange={(e) => setQuizAnswer(e.target.value)}
                      disabled={quizSubmitted}
                      className="hidden"
                    />
                    <span
                      className="text-sm font-body"
                      style={
                        quizSubmitted && opt.value === "a"
                          ? { color: "#059669" }
                          : quizSubmitted && opt.value !== "a"
                          ? { color: "#dc2626" }
                          : { color: "#0d0d1a" }
                      }
                    >
                      {opt.label}
                    </span>
                    {quizSubmitted && opt.value === "a" && (
                      <span className="badge badge-electric ml-auto">正确</span>
                    )}
                  </label>
                ))}
              </div>
              <button
                onClick={handleQuizSubmit}
                disabled={!quizAnswer || quizSubmitted}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-brand-ink text-white hover:bg-[#1a1a2e] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
              >
                提交
              </button>
              {quizSubmitted && (
                <p className="text-xs mt-3 text-[#059669] font-body">
                  回答正确！RuvC 和 HNH 是 Cas9 蛋白的两个关键核酸酶结构域。
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
