"use client";

import { useState, useRef, useEffect } from "react";
import {
  Search,
  Microscope,
  BookOpen,
  FlaskConical,
  Building2,
  Sparkles,
  ArrowUpRight,
  Loader2,
  Send,
  User,
  Bot,
  Lightbulb,
  FileText,
  GraduationCap,
  X,
} from "lucide-react";

type TabKey = "course" | "research" | "industry";

interface Message {
  role: "user" | "ai";
  content: string;
}

const suggestionChips = [
  "CRISPR-Cas9",
  "细胞周期调控",
  "代谢工程",
  "蛋白质结构",
  "基因表达调控",
];

const mockCourseContent = {
  title: "CRISPR-Cas9 基因编辑技术",
  concepts: [
    "CRISPR 序列的发现与结构",
    "Cas9 核酸内切酶的作用机制",
    "gRNA 设计与靶向特异性",
    "NHEJ 与 HDR 修复通路",
    "基因敲除与敲入实验策略",
  ],
};

const mockResearchContent = {
  papers: [
    {
      title: "Prime Editing: A New Era of Precision Genome Engineering",
      journal: "Nature Reviews Genetics",
      year: 2024,
    },
    {
      title: "CRISPR-Cas9 Mediated Base Editing in Human Embryos",
      journal: "Cell",
      year: 2023,
    },
    {
      title: "High-Throughput Functional Genomics Using CRISPR Screens",
      journal: "Science",
      year: 2023,
    },
  ],
};

const mockIndustryContent = {
  cases: [
    {
      company: "CRISPR Therapeutics",
      application: "CTX001 用于镰刀型细胞贫血症和β-地中海贫血的基因治疗",
      stage: "已获批上市",
    },
    {
      company: "Intellia Therapeutics",
      application: "NTLA-2001 体内CRISPR疗法治疗转甲状腺素蛋白淀粉样变性",
      stage: "III期临床",
    },
    {
      company: "Editas Medicine",
      application: "EDIT-101 治疗Leber先天性黑矇10型 (LCA10)",
      stage: "II期临床",
    },
  ],
};

const demoConversation: Message[] = [
  {
    role: "ai",
    content: "你好！我是你的AI导师。你刚才搜索了 CRISPR-Cas9，这是一个革命性的基因编辑技术。你想深入了解哪个方面呢？",
  },
  {
    role: "user",
    content: "CRISPR-Cas9 的核心机制是什么？",
  },
  {
    role: "ai",
    content: "CRISPR-Cas9 系统由两部分组成：Cas9 核酸内切酶和单链引导 RNA（sgRNA）。sgRNA 通过碱基互补配对识别目标 DNA 序列，Cas9 蛋白在 PAM 序列（NGG）上游进行双链切割。细胞随后通过 NHEJ 或 HDR 途径修复断裂，实现基因敲除或精准编辑。",
  },
];

export default function ExplorePage() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("course");
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<Message[]>(demoConversation);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSearch = () => {
    if (!query.trim()) return;
    setIsSearching(true);
    setHasSearched(false);
    setTimeout(() => {
      setIsSearching(false);
      setHasSearched(true);
    }, 1200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleChipClick = (chip: string) => {
    setQuery(chip);
    setIsSearching(true);
    setHasSearched(false);
    setTimeout(() => {
      setIsSearching(false);
      setHasSearched(true);
    }, 1000);
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const userMsg: Message = { role: "user", content: chatInput.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setTimeout(() => {
      const aiMsg: Message = {
        role: "ai",
        content:
          "这是一个很好的问题！让我来详细解答。Cas9 蛋白的 HNH 和 RuvC 结构域分别切割目标链和非目标链，确保双链断裂的高效性。PAM 序列（5'-NGG-3'）是 Cas9 识别和结合的必要条件。",
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 800);
  };

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: "course", label: "课程基础", icon: <BookOpen className="w-4 h-4" /> },
    { key: "research", label: "科研前沿", icon: <Microscope className="w-4 h-4" /> },
    { key: "industry", label: "产业应用", icon: <Building2 className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen pt-[var(--nav-height)] px-6 md:px-10 pb-20">
      <section className="max-w-6xl mx-auto pt-8 md:pt-16">
        <div className="text-center mb-10">
          <h1
            className="font-display font-extrabold text-brand-ink leading-[1.1] tracking-[-0.03em] mb-3"
            style={{ fontSize: "clamp(28px, 4vw, 48px)" }}
          >
            知识探索中心
          </h1>
          <p className="text-brand-muted text-base md:text-lg font-body max-w-xl mx-auto">
            搜索任意生物知识点，获取从课程基础到科研前沿再到产业应用的三层递进内容
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-6">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-muted pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="搜索知识点，如 CRISPR、细胞周期、代谢通路..."
              className="w-full h-14 pl-13 pr-14 rounded-2xl glass-card text-[15px] font-body text-brand-ink placeholder:text-brand-muted/50 outline-none focus:border-accent-electric/30 transition-all duration-300"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-14 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-black/5 transition-colors"
              >
                <X className="w-4 h-4 text-brand-muted" />
              </button>
            )}
            <button
              onClick={handleSearch}
              disabled={isSearching || !query.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-xl bg-brand-ink text-white disabled:opacity-30 transition-all duration-200 hover:bg-brand-ink/90"
            >
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowUpRight className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {!hasSearched && (
          <div className="flex flex-wrap justify-center gap-2.5 max-w-2xl mx-auto mb-8">
            {suggestionChips.map((chip) => (
              <button
                key={chip}
                onClick={() => handleChipClick(chip)}
                className="px-4 py-2 rounded-xl glass-card text-sm font-medium font-body text-brand-muted hover:text-brand-ink hover:border-accent-electric/20 transition-all duration-200 cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {isSearching && (
          <div className="max-w-3xl mx-auto mt-10 text-center">
            <div className="glass-card rounded-2xl p-12 flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 text-accent-electric animate-spin" />
              <p className="text-brand-muted font-body">正在搜索相关知识内容...</p>
            </div>
          </div>
        )}

        {hasSearched && !isSearching && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 max-w-6xl mx-auto mt-8">
            <div className="lg:col-span-3">
              <div className="glass-card rounded-2xl p-6 md:p-8">
                <h2 className="font-display text-xl font-bold text-brand-ink mb-2">
                  {mockCourseContent.title}
                </h2>
                <p className="text-sm text-brand-muted mb-6 font-body">
                  共检索到 3 个知识模块，覆盖课程、科研与产业三个维度
                </p>

                <div className="flex border-b border-black/5 mb-6 overflow-x-auto scrollbar-none">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium font-body whitespace-nowrap border-b-2 transition-all duration-200 cursor-pointer ${
                        activeTab === tab.key
                          ? "border-brand-ink text-brand-ink"
                          : "border-transparent text-brand-muted hover:text-brand-ink"
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </div>

                {activeTab === "course" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <GraduationCap className="w-5 h-5 text-accent-electric" />
                      <span className="text-sm font-semibold font-body text-brand-ink">
                        核心概念
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {mockCourseContent.concepts.map((concept, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 p-4 rounded-xl bg-white/40 border border-black/5 hover:border-accent-electric/15 transition-all duration-200"
                        >
                          <span className="w-6 h-6 rounded-lg bg-accent-electric/10 text-accent-electric flex items-center justify-center text-xs font-bold font-display shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span className="text-sm font-body text-brand-ink leading-relaxed">
                            {concept}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "research" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <FlaskConical className="w-5 h-5 text-accent-cyan" />
                      <span className="text-sm font-semibold font-body text-brand-ink">
                        最新研究论文
                      </span>
                    </div>
                    {mockResearchContent.papers.map((paper, i) => (
                      <a
                        key={i}
                        href="#"
                        className="flex items-start justify-between gap-4 p-4 rounded-xl bg-white/40 border border-black/5 hover:border-accent-cyan/20 transition-all duration-200 group block no-underline"
                      >
                        <div>
                          <h3 className="text-sm font-semibold font-body text-brand-ink group-hover:text-accent-electric transition-colors mb-1">
                            {paper.title}
                          </h3>
                          <p className="text-xs text-brand-muted font-body">
                            {paper.journal} · {paper.year}
                          </p>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-brand-muted group-hover:text-accent-electric shrink-0 mt-0.5 transition-colors" />
                      </a>
                    ))}
                  </div>
                )}

                {activeTab === "industry" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Building2 className="w-5 h-5 text-accent-amber" />
                      <span className="text-sm font-semibold font-body text-brand-ink">
                        产业案例
                      </span>
                    </div>
                    {mockIndustryContent.cases.map((c, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-xl bg-white/40 border border-black/5 hover:border-accent-amber/20 transition-all duration-200"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold font-body text-brand-ink">
                            {c.company}
                          </span>
                          <span className="badge badge-amber">{c.stage}</span>
                        </div>
                        <p className="text-sm text-brand-muted font-body leading-relaxed">
                          {c.application}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="glass-card-iridescent rounded-2xl p-5 md:p-6 flex flex-col h-full min-h-[460px]">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent-electric to-accent-cyan flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm text-brand-ink">
                      AI导师对话
                    </h3>
                    <p className="text-xs text-brand-muted font-body">实时解答你的疑问</p>
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
                            ? "bg-gradient-to-br from-accent-electric to-accent-cyan"
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
                    placeholder="向AI导师提问..."
                    className="flex-1 h-10 px-4 rounded-xl bg-white/40 border border-black/5 text-sm font-body text-brand-ink placeholder:text-brand-muted/50 outline-none focus:border-accent-electric/20 transition-all duration-200"
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
        )}

        {!hasSearched && !isSearching && (
          <div className="max-w-3xl mx-auto mt-16 text-center">
            <div className="glass-card rounded-2xl p-10">
              <Lightbulb className="w-10 h-10 text-accent-amber mx-auto mb-4" />
              <h3 className="font-display text-lg font-bold text-brand-ink mb-2">
                开始探索生物知识世界
              </h3>
              <p className="text-sm text-brand-muted font-body max-w-md mx-auto">
                输入任意生物知识点，AI将为你构建从基础概念到前沿应用的全景知识图谱
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
