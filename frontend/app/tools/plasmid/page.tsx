"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bot,
  SendHorizonal,
  ChevronDown,
  ChevronUp,
  Upload,
} from "lucide-react";

const plasmidOptions = ["pBR322", "pET-28a", "pUC19", "pGEX"];

const plasmidFeatures = [
  { label: "ori", color: "#f59e0b" },
  { label: "AmpR", color: "#10b981" },
  { label: "TetR", color: "#3b82f6" },
  { label: "MCS", color: "#6b7280" },
  { label: "rop", color: "#8b5cf6" },
];

const chatMessages = [
  {
    role: "ai",
    text: "这是 pBR322 质粒的环形图谱。ori（橙色弧段）是复制起点，决定了质粒在大肠杆菌中的复制。AmpR（绿色）编码氨苄青霉素抗性，TetR（蓝色）编码四环素抗性。MCS 区域的 BamHI 和 SalI 位点可用于插入外源基因。你想了解哪个元件的详细信息？",
  },
  {
    role: "user",
    text: "如果我插入 GFP 到 BamHI 位点会怎样？",
  },
  {
    role: "ai",
    text: "BamHI 位于 TetR 基因内部。插入 GFP 后，TetR 基因会被打断失活，导致转化菌不能在含四环素的培养基上生长。但 AmpR 仍然完整，所以你可以在含氨苄的平板上筛选阳性克隆。这就是插入失活筛选策略。",
  },
];

export default function PlasmidPage() {
  const [selectedPlasmid, setSelectedPlasmid] = useState("pBR322");
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
              <select
                value={selectedPlasmid}
                onChange={(e) => setSelectedPlasmid(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/60 backdrop-blur border border-white/80 text-brand-ink outline-none focus:border-accent-electric/30 focus:ring-2 focus:ring-accent-electric/10 transition-all appearance-none"
              >
                {plasmidOptions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <span className="absolute left-0 -top-5 text-[11px] text-brand-faint">
                选择示例质粒
              </span>
            </div>
            <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-brand-muted hover:text-brand-ink hover:bg-white/50 transition-all">
              <Upload className="w-4 h-4" />
              上传文件
            </button>
          </div>

          <div className="glass-card flex items-center justify-center p-6 flex-shrink-0">
            <svg
              viewBox="0 0 400 400"
              style={{ width: "100%", maxWidth: 350, height: "auto" }}
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="200" cy="200" r="160" fill="#1e1f24" />

              <circle
                cx="200"
                cy="200"
                r="140"
                fill="none"
                stroke="#333338"
                strokeWidth="1.5"
                strokeDasharray="6 8"
              />

              <path
                d="M 156.7 66.9 A 140 140 0 0 1 243.3 66.9"
                stroke="#f59e0b"
                strokeWidth="28"
                fill="none"
                strokeLinecap="butt"
              />

              <path
                d="M 313.3 117.7 A 140 140 0 0 1 313.3 282.3"
                stroke="#10b981"
                strokeWidth="28"
                fill="none"
                strokeLinecap="butt"
              />

              <path
                d="M 243.3 333.1 A 140 140 0 0 1 313.3 282.3"
                stroke="#3b82f6"
                strokeWidth="28"
                fill="none"
                strokeLinecap="butt"
              />

              <path
                d="M 60 200 A 140 140 0 0 1 86.7 117.7"
                stroke="#6b7280"
                strokeWidth="28"
                fill="none"
                strokeLinecap="butt"
              />

              <path
                d="M 86.7 282.3 A 140 140 0 0 1 156.7 333.1"
                stroke="#8b5cf6"
                strokeWidth="28"
                fill="none"
                strokeLinecap="butt"
              />

              <text
                x="200"
                y="52"
                textAnchor="middle"
                fill="#f59e0b"
                fontSize="13"
                fontWeight="600"
                fontFamily="system-ui, sans-serif"
              >
                ori
              </text>

              <text
                x="360"
                y="149"
                textAnchor="start"
                fill="#10b981"
                fontSize="13"
                fontWeight="600"
                fontFamily="system-ui, sans-serif"
              >
                AmpR
              </text>

              <text
                x="297"
                y="337"
                textAnchor="middle"
                fill="#3b82f6"
                fontSize="13"
                fontWeight="600"
                fontFamily="system-ui, sans-serif"
              >
                TetR
              </text>

              <text
                x="40"
                y="156"
                textAnchor="end"
                fill="#6b7280"
                fontSize="13"
                fontWeight="600"
                fontFamily="system-ui, sans-serif"
              >
                MCS
              </text>

              <text
                x="103"
                y="337"
                textAnchor="middle"
                fill="#8b5cf6"
                fontSize="13"
                fontWeight="600"
                fontFamily="system-ui, sans-serif"
              >
                rop
              </text>

              <circle cx="200" cy="200" r="6" fill="#e5e5e7" />
            </svg>
          </div>

          <div className="flex items-center justify-center gap-6 py-1">
            {plasmidFeatures.map((f) => (
              <div key={f.label} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: f.color }}
                />
                <span className="text-xs text-brand-muted">{f.label}</span>
              </div>
            ))}
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
                这个质粒的复制起点是什么类型？在哪些宿主中可以复制？
              </p>
              <div className="space-y-2.5 mb-4">
                {[
                  { value: "a", label: "A. pMB1 ori，仅在大肠杆菌中复制" },
                  { value: "b", label: "B. pSC101 ori，在多种革兰氏阴性菌中复制" },
                  { value: "c", label: "C. ColE1 ori，可在酵母和大肠杆菌中穿梭复制" },
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
                      name="plasmid-quiz"
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
                  正确！pBR322 使用 pMB1 复制起点，属于 ColE1 类型，复制宿主范围仅限于大肠杆菌等少数肠杆菌科细菌。
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
