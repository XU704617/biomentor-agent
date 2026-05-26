"use client";

import { useState } from "react";
import {
  MessageSquare,
  Presentation,
  Users,
  Award,
  Send,
  ChevronDown,
  Bot,
  User,
  Mic,
  Quote,
  BookOpen,
} from "lucide-react";

const defenseTopics = [
  "CRISPR基因编辑的分子机制",
  "CAR-T细胞的信号转导",
  "代谢工程中的限速酶调控",
  "合成生物学元件标准化",
  "蛋白质工程定向进化策略",
];

const mockDefenseTranscript = [
  {
    role: "导师",
    speaker: "AI课程导师",
    message: "同学，请你先简要说明CRISPR-Cas9系统中Cas9蛋白的核酸酶结构域及其催化功能。",
    type: "mentor",
  },
  {
    role: "学生",
    speaker: "你",
    message: "Cas9蛋白包含两个核酸酶结构域：HNH结构域负责切割与crRNA互补的DNA链，RuvC-like结构域切割非互补链，两者协同作用产生双链断裂（DSB）。",
    type: "student",
  },
  {
    role: "导师",
    speaker: "AI科研导师",
    message: "很好。那么请问，当PAM序列缺失时，Cas9的构象会发生什么变化？这对基因编辑效率有何影响？",
    type: "mentor",
  },
  {
    role: "学生",
    speaker: "你",
    message: "PAM识别会触发Cas9的构象重排，使HNH结构域从非活性状态转变为活性状态。缺乏PAM时Cas9无法完成这一构象变化，因此无法切割目标DNA，这是CRISPR系统的一种天然安全机制。",
    type: "student",
  },
  {
    role: "导师",
    speaker: "AI产业导师",
    message: "在实际产业应用中，你如何评价CRISPR技术在农业育种与人类基因治疗两个方向的挑战差异？",
    type: "mentor",
  },
  {
    role: "学生",
    speaker: "你",
    message: "农业育种主要面临多基因性状编辑效率和脱靶效应的平衡问题，以及转基因监管框架的不确定性；而人类基因治疗更关注递送系统的安全性、免疫原性反应和长期伦理评估。两者都依赖精准编辑技术的发展。",
    type: "student",
  },
];

const mockConferenceTranscript = [
  {
    role: "Chair",
    speaker: "会议主席",
    message: "欢迎各位参加今天的学术研讨会。我们讨论的主题是'基因编辑技术的前沿进展'。请第一位报告人开始。",
  },
  {
    role: "Reviewer",
    speaker: "审稿人A",
    message: "我注意到您在实验中使用的是SpCas9变体，请问为何未选择更高保真度的eSpCas9或HypaCas9？",
  },
  {
    role: "Presenter",
    speaker: "报告人（你）",
    message: "我们前期工作发现SpCas9在该细胞系中的编辑效率已达到82%且脱靶率低于0.5%，满足研究需求。但我们也计划在后续实验中对比高保真变体的性能。",
    isSelf: true,
  },
  {
    role: "Audience",
    speaker: "听众B",
    message: "关于sgRNA的设计策略，你们是否考虑过使用化学修饰来增强稳定性？",
  },
  {
    role: "Presenter",
    speaker: "报告人（你）",
    message: "是的，我们尝试了2\'-O-甲基和硫代磷酸酯修饰，发现3\'端修饰可将体内半衰期延长约3倍，显著提升了编辑窗口期。",
    isSelf: true,
  },
  {
    role: "Chair",
    speaker: "会议主席",
    message: "感谢精彩的报告和讨论。这个工作为精准基因编辑的应用提供了有价值的数据支持。",
  },
];

const roleIcons: Record<string, string> = {
  Chair: "#06b6d4",
  Reviewer: "#f59e0b",
  Presenter: "#2563eb",
  Audience: "#f43f5e",
};

export default function SeminarPage() {
  const [selectedTopic, setSelectedTopic] = useState(defenseTopics[0]);
  const [showTopicDropdown, setShowTopicDropdown] = useState(false);

  return (
    <div className="min-h-screen pt-[var(--nav-height)]">
      <section className="px-6 md:px-10 py-10 md:py-14 max-w-7xl mx-auto">
        <div className="mb-10">
          <p className="section-title">学术研讨</p>
          <h1 className="section-heading text-[clamp(32px,5vw,48px)]">
            模拟学术答辩
          </h1>
          <p className="text-[#4a4a6a] mt-3 max-w-2xl leading-relaxed">
            在多角色AI导师的引导下进行学术答辩模拟训练，提升科研表达与学术交流能力
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Mock Defense */}
          <div className="glass-card-iridescent p-6 md:p-8 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#eff6ff] border border-[#dbeafe] flex items-center justify-center">
                <Presentation className="w-5 h-5 text-[#2563eb]" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-[#0d0d1a]">
                  模拟学术答辩
                </h2>
                <p className="text-xs text-[#4a4a6a]">AI导师扮演答辩委员会进行提问</p>
              </div>
            </div>

            <div className="relative mb-5">
              <label className="block text-xs font-semibold text-[#4a4a6a] mb-2">
                选择答辩课题
              </label>
              <button
                onClick={() => setShowTopicDropdown(!showTopicDropdown)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/60 border border-white/60 text-sm text-[#0d0d1a] hover:border-[#2563eb]/20 transition-colors"
              >
                <span className="truncate">{selectedTopic}</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#4a4a6a] transition-transform ${
                    showTopicDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>
              {showTopicDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white/95 backdrop-blur-xl border border-white/60 rounded-xl shadow-lg z-10 overflow-hidden">
                  {defenseTopics.map((topic) => (
                    <button
                      key={topic}
                      onClick={() => {
                        setSelectedTopic(topic);
                        setShowTopicDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        selectedTopic === topic
                          ? "bg-[#eff6ff] text-[#2563eb] font-medium"
                          : "text-[#4a4a6a] hover:bg-white/60"
                      }`}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button className="w-full mb-6 px-5 py-3 rounded-xl bg-[#0d0d1a] text-white text-sm font-semibold hover:bg-[#1a1a2e] transition-all flex items-center justify-center gap-2">
              <Mic className="w-4 h-4" />
              开始模拟答辩
            </button>

            <div className="flex-1 bg-white/40 rounded-2xl border border-white/60 p-4 space-y-4 max-h-[480px] overflow-y-auto">
              <p className="text-xs font-semibold text-[#4a4a6a] flex items-center gap-2 mb-3">
                <MessageSquare className="w-3.5 h-3.5 text-[#2563eb]" />
                答辩记录演示
              </p>
              {mockDefenseTranscript.map((item, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${
                    item.type === "student" ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      item.type === "student"
                        ? "bg-[#eff6ff]"
                        : "bg-[#f3f4f6]"
                    }`}
                  >
                    {item.type === "student" ? (
                      <User className="w-4 h-4 text-[#2563eb]" />
                    ) : (
                      <Bot className="w-4 h-4 text-[#4a4a6a]" />
                    )}
                  </div>
                  <div
                    className={`flex-1 px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      item.type === "student"
                        ? "bg-[#2563eb] text-white rounded-tr-md"
                        : "bg-white/80 rounded-tl-md"
                    }`}
                  >
                    <p
                      className={`text-[10px] font-semibold mb-1 ${
                        item.type === "student"
                          ? "text-white/70"
                          : "text-[#4a4a6a]"
                      }`}
                    >
                      {item.speaker}
                    </p>
                    <p className={item.type === "student" ? "text-white" : "text-[#0d0d1a]"}>
                      {item.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Conference Simulation */}
          <div className="glass-card p-6 md:p-8 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#ecfeff] border border-[#cffafe] flex items-center justify-center">
                <Users className="w-5 h-5 text-[#06b6d4]" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-[#0d0d1a]">
                  学术会议模拟
                </h2>
                <p className="text-xs text-[#4a4a6a]">AI扮演不同角色模拟真实学术会议</p>
              </div>
            </div>

            <p className="text-xs text-[#4a4a6a] mb-4 flex items-center gap-2">
              <Quote className="w-3.5 h-3.5 text-[#06b6d4]" />
              主题：基因编辑技术的前沿进展
            </p>

            <div className="flex-1 bg-white/40 rounded-2xl border border-white/60 p-4 space-y-4 max-h-[480px] overflow-y-auto">
              {mockConferenceTranscript.map((item, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${
                    item.isSelf ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-white"
                    style={{
                      backgroundColor: roleIcons[item.role] || "#6b7280",
                    }}
                  >
                    {item.role === "Chair"
                      ? "C"
                      : item.role === "Reviewer"
                      ? "R"
                      : item.role === "Presenter"
                      ? "P"
                      : "A"}
                  </div>
                  <div
                    className={`flex-1 px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      item.isSelf
                        ? "bg-[#06b6d4] text-white rounded-tr-md"
                        : "bg-white/80 rounded-tl-md"
                    }`}
                  >
                    <p
                      className={`text-[10px] font-semibold mb-1 ${
                        item.isSelf ? "text-white/70" : "text-[#4a4a6a]"
                      }`}
                    >
                      {item.speaker}
                      <span
                        className="ml-2 px-1.5 py-0.5 rounded-full text-[9px]"
                        style={{
                          color: roleIcons[item.role],
                          backgroundColor: `${roleIcons[item.role]}15`,
                        }}
                      >
                        {item.role}
                      </span>
                    </p>
                    <p className={item.isSelf ? "text-white" : "text-[#0d0d1a]"}>
                      {item.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <input
                type="text"
                placeholder="输入你的发言..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/60 border border-white/60 text-sm text-[#0d0d1a] placeholder:text-[#8e8eaa] focus:outline-none focus:border-[#06b6d4]/30"
              />
              <button className="px-4 py-2.5 rounded-xl bg-[#06b6d4] text-white hover:bg-[#0891b2] transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 md:px-10 py-6 md:py-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: Award,
              title: "答辩评分系统",
              desc: "AI对答辩表现进行多维度评分",
              color: "#2563eb",
              bg: "rgba(37,99,235,0.06)",
            },
            {
              icon: BookOpen,
              title: "知识盲区诊断",
              desc: "基于答辩表现识别知识薄弱点",
              color: "#06b6d4",
              bg: "rgba(6,182,212,0.06)",
            },
            {
              icon: Mic,
              title: "口语表达训练",
              desc: "提升学术汇报与即兴应答能力",
              color: "#f59e0b",
              bg: "rgba(245,158,11,0.06)",
            },
          ].map((item) => (
            <div key={item.title} className="glass-card p-5 flex items-start gap-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: item.bg }}
              >
                <item.icon className="w-5 h-5" style={{ color: item.color }} />
              </div>
              <div>
                <h3 className="font-display text-sm font-bold text-[#0d0d1a] mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-[#4a4a6a] leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
