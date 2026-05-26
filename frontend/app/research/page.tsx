"use client";

import { useState, useRef, useEffect } from "react";
import {
  BookOpen,
  ArrowRight,
  Search,
  FlaskConical,
  BarChart3,
  Send,
  Bot,
  User,
  Sparkles,
  Target,
  Play,
  CheckCircle2,
  Clock,
  Lightbulb,
  ChevronRight,
} from "lucide-react";

interface Message {
  role: "user" | "ai";
  content: string;
}

const phases = [
  {
    num: 1,
    title: "文献调研",
    icon: <BookOpen className="w-5 h-5" />,
    description:
      "AI 助手帮你检索相关文献，提取关键信息，构建研究框架与知识图谱",
    accent: "accent-electric",
  },
  {
    num: 2,
    title: "实验设计",
    icon: <FlaskConical className="w-5 h-5" />,
    description:
      "基于文献调研结果，AI 辅助设计实验方案、优化参数、预测潜在风险",
    accent: "accent-cyan",
  },
  {
    num: 3,
    title: "数据分析",
    icon: <BarChart3 className="w-5 h-5" />,
    description:
      "AI 辅助处理实验数据、可视化展示、统计分析与报告撰写",
    accent: "accent-amber",
  },
];

const milestoneChecks = [
  { label: "文献调研完成", done: true },
  { label: "实验方案设计", done: true },
  { label: "预实验验证", done: false },
  { label: "正式实验进行中", done: false },
  { label: "数据分析与论文撰写", done: false },
];

const demoMessages: Message[] = [
  {
    role: "ai",
    content:
      "欢迎进入科研实战训练营！我们将围绕 CRISPR-Cas9 在 CHO 细胞中的基因敲除效率研究，逐步推进文献调研、实验设计和数据分析全流程。你准备好开始了吗？",
  },
  {
    role: "user",
    content: "好的！我该从哪里开始？",
  },
  {
    role: "ai",
    content:
      "建议从文献调研入手。首先检索 CHO 细胞表达系统和 CRISPR-Cas9 递送方式的相关文献，重点关注脂质体转染和电穿孔两种方法的效率差异。我们可以先整理近5年的高被引论文。",
  },
];

export default function ResearchPage() {
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<Message[]>(demoMessages);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const userMsg: Message = { role: "user", content: chatInput.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setTimeout(() => {
      const aiMsg: Message = {
        role: "ai",
        content:
          "好问题！CHO 细胞（中国仓鼠卵巢细胞）是生物制药领域最常用的表达宿主之一。CRISPR-Cas9 的高效递送是关键瓶颈，目前主流方法包括脂质纳米颗粒（LNP）递送和核转染技术。我建议我们先锁定3-5篇关键文献，然后对比不同递送策略的效率数据。",
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 800);
  };

  const completedCount = milestoneChecks.filter((m) => m.done).length;
  const progressPercent = Math.round(
    (completedCount / milestoneChecks.length) * 100
  );

  return (
    <div className="min-h-screen pt-[var(--nav-height)] px-6 md:px-10 pb-20">
      <div className="max-w-6xl mx-auto pt-8 md:pt-16">
        <div className="text-center mb-12">
          <h1
            className="font-display font-extrabold text-brand-ink leading-[1.1] tracking-[-0.03em] mb-3"
            style={{ fontSize: "clamp(28px, 4vw, 48px)" }}
          >
            科研实战训练营
          </h1>
          <p className="text-brand-muted text-base md:text-lg font-body max-w-xl mx-auto">
            AI 导师全程陪伴式指导，从文献调研到实验设计再到数据分析，系统培养科研能力
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
          {phases.map((phase) => (
            <div
              key={phase.num}
              className="glass-card rounded-2xl p-6 md:p-7 flex flex-col group cursor-default"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="w-10 h-10 rounded-xl bg-brand-ink/5 flex items-center justify-center text-lg font-bold font-display text-brand-ink">
                  {phase.num}
                </span>
                <div className="w-9 h-9 rounded-xl bg-brand-ink/5 flex items-center justify-center group-hover:bg-brand-ink/10 transition-colors">
                  {phase.icon}
                </div>
              </div>
              <h3 className="font-display text-lg font-bold text-brand-ink mb-2">
                {phase.title}
              </h3>
              <p className="text-sm text-brand-muted font-body leading-relaxed flex-1">
                {phase.description}
              </p>
              <div className="mt-4 pt-4 border-t border-black/5 flex items-center gap-1 text-sm font-medium text-brand-muted group-hover:text-accent-electric transition-colors">
                <span>进入阶段</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-10">
          <div className="lg:col-span-3">
            <div className="glass-card-iridescent rounded-2xl p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-electric to-accent-cyan flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-brand-ink">
                    当前课题
                  </h2>
                  <p className="text-xs text-brand-muted font-body">
                    进行中的研究项目
                  </p>
                </div>
              </div>

              <h3 className="font-display text-xl font-bold text-brand-ink mb-4 leading-snug">
                探究 CRISPR-Cas9 在 CHO 细胞中的基因敲除效率
              </h3>

              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold font-body text-brand-muted uppercase tracking-wider">
                  研究进度
                </span>
                <span className="text-xs font-bold font-display text-brand-ink">
                  {progressPercent}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-black/5 mb-6 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent-electric via-accent-cyan to-accent-amber transition-all duration-700 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="space-y-3">
                {milestoneChecks.map((milestone, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/40 border border-black/5"
                  >
                    {milestone.done ? (
                      <CheckCircle2 className="w-5 h-5 text-accent-electric shrink-0" />
                    ) : (
                      <Clock className="w-5 h-5 text-brand-muted/40 shrink-0" />
                    )}
                    <span
                      className={`text-sm font-body ${
                        milestone.done ? "text-brand-ink font-medium" : "text-brand-muted"
                      }`}
                    >
                      {milestone.label}
                    </span>
                    {milestone.done && (
                      <span className="ml-auto badge badge-electric text-[10px]">
                        已完成
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <button className="mt-6 w-full btn-hero justify-center cursor-pointer">
                <Play className="w-4 h-4" />
                继续当前课题
              </button>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="glass-card rounded-2xl p-5 md:p-6 flex flex-col h-full min-h-[420px]">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent-amber to-accent-electric flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-brand-ink">
                    AI 科研导师
                  </h3>
                  <p className="text-xs text-brand-muted font-body">
                    实时指导与答疑
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1 max-h-[340px]">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                        msg.role === "ai"
                          ? "bg-gradient-to-br from-accent-amber to-accent-electric"
                          : "bg-brand-ink"
                      }`}
                    >
                      {msg.role === "ai" ? (
                        <Bot className="w-3.5 h-3.5 text-white" />
                      ) : (
                        <User className="w-3.5 h-3.5 text-white" />
                      )}
                    </div>
                    <div
                      className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm font-body leading-relaxed ${
                        msg.role === "ai"
                          ? "bg-white/60 border border-black/5 rounded-tl-md text-brand-ink"
                          : "bg-brand-ink text-white rounded-tr-md"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                  placeholder="向AI科研导师提问..."
                  className="flex-1 h-10 px-4 rounded-xl bg-white/40 border border-black/5 text-sm font-body text-brand-ink placeholder:text-brand-muted/50 outline-none focus:border-accent-amber/20 transition-all duration-200"
                />
                <button
                  onClick={handleSendChat}
                  disabled={!chatInput.trim()}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-brand-ink text-white disabled:opacity-30 transition-all duration-200 hover:bg-brand-ink/90 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button className="btn-hero-secondary cursor-pointer">
            <Lightbulb className="w-4 h-4" />
            开始新课题
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
