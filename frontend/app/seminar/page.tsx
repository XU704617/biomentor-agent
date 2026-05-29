"use client";

import { useState, useEffect } from "react";
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
  ArrowRight,
  ArrowLeft,
  Brain,
  Target,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  FlaskConical,
} from "lucide-react";
import Link from "next/link";
import { industryCases, type IndustryCase } from "@/data/industryCases";

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
    message: "是的，我们尝试了2'-O-甲基和硫代磷酸酯修饰，发现3'端修饰可将体内半衰期延长约3倍，显著提升了编辑窗口期。",
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

interface DefenseQuestionCategory {
  category: string;
  icon: React.ReactNode;
  questions: string[];
}

function generateDefenseQuestions(caseData: IndustryCase): DefenseQuestionCategory[] {
  const kp = caseData.relatedKnowledgePoints;

  return [
    {
      category: "基础理解",
      icon: <BookOpen className="w-4 h-4" />,
      questions: [
        `请简要说明"${caseData.title}"这一产业案例主要解决什么问题？它在${caseData.industryDirection}领域有何意义？`,
        `"${caseData.title}"涉及的核心生物学机制是什么？请从分子层面进行阐述。`,
        `${kp[0]}在该案例中扮演什么角色？请结合具体机制说明其功能。`,
      ],
    },
    {
      category: "机制解释",
      icon: <Brain className="w-4 h-4" />,
      questions: [
        `${kp.slice(0, 2).join("、")}等知识点如何共同支撑"${caseData.title}"的产业应用？请分析其因果关系。`,
        `请详细阐述该案例中涉及的关键通路或分子机制，并说明该机制的调控方式和信号传递过程。`,
        `从${caseData.industryDirection}角度看，该案例的技术原理与同类方法相比有何本质差异或优势？`,
      ],
    },
    {
      category: "证据判断",
      icon: <CheckCircle2 className="w-4 h-4" />,
      questions: [
        `该案例的证据主要来自${caseData.sourceType}（证据等级：${caseData.evidenceLevel}），请评估这些证据的可靠性和潜在局限性。`,
        `在评估该案例研究结论时，需要考虑哪些潜在的混杂因素、样本偏差或方法学限制？`,
        `如果要进一步验证该案例的核心结论，还需要补充哪类证据或进行何种验证实验？`,
      ],
    },
    {
      category: "实验设计",
      icon: <FlaskConical className="w-4 h-4" />,
      questions: [
        `请设计一个实验方案来验证"${caseData.coreProblem}"中的关键假设，需明确实验组、对照组和主要检测指标。`,
        `如果要评估${kp[0]}在产业应用中的效能，你会选择哪些检测指标？为什么选择这些指标？`,
        `针对该案例的研究方向，请设计一个合理的阳性对照和阴性对照，并说明其必要性。`,
      ],
    },
    {
      category: "局限与改进",
      icon: <AlertTriangle className="w-4 h-4" />,
      questions: [
        `${caseData.title}的技术路线可能面临哪些风险或局限性？请从技术、产业和安全性角度分析。`,
        `从实验室研究到${caseData.industryDirection}产业转化，可能遇到哪些主要障碍？有哪些应对策略？`,
        `结合当前${kp[0]}领域的前沿进展，该案例的技术方案还有哪些改进空间或新方向？`,
      ],
    },
  ];
}

interface ReportOutlineItem {
  section: string;
  description: string;
}

function generateReportOutline(caseData: IndustryCase): ReportOutlineItem[] {
  return [
    {
      section: "研究背景",
      description: `围绕${caseData.title}的产业需求，阐述${caseData.relatedKnowledgePoints.slice(0, 2).join("、")}等基础理论与本研究的关联。`,
    },
    {
      section: "核心机制",
      description: `聚焦${caseData.coreProblem}，系统分析关键分子机制和调控网络，阐释从基础研究到产业应用的技术路径。`,
    },
    {
      section: "产业应用价值",
      description: `${caseData.applicationValue.slice(0, 100)}...说明该技术对${caseData.industryDirection}领域的实际贡献和发展前景。`,
    },
    {
      section: "证据与局限",
      description: `评估${caseData.evidenceLevel}等级证据（${caseData.sourceType}来源）的可靠性，指出研究方法和数据支持中的局限性。`,
    },
    {
      section: "后续研究问题",
      description: `基于当前研究进展和产业需求，提出${caseData.coreProblem.slice(0, 30)}...等方向的延伸研究问题和技术优化方向。`,
    },
  ];
}

const categoryColors: Record<string, { bg: string; border: string; icon: string; text: string }> = {
  "基础理解": { bg: "bg-blue-50/60", border: "border-blue-100", icon: "text-blue-500", text: "text-blue-700" },
  "机制解释": { bg: "bg-purple-50/60", border: "border-purple-100", icon: "text-purple-500", text: "text-purple-700" },
  "证据判断": { bg: "bg-emerald-50/60", border: "border-emerald-100", icon: "text-emerald-500", text: "text-emerald-700" },
  "实验设计": { bg: "bg-amber-50/60", border: "border-amber-100", icon: "text-amber-500", text: "text-amber-700" },
  "局限与改进": { bg: "bg-rose-50/60", border: "border-rose-100", icon: "text-rose-500", text: "text-rose-700" },
};

function DefaultSeminarPage() {
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

function CaseDrivenSeminarPage({ caseData }: { caseData: IndustryCase }) {
  const questions = generateDefenseQuestions(caseData);
  const outline = generateReportOutline(caseData);

  return (
    <div className="min-h-screen pt-[var(--nav-height)] px-6 md:px-10 pb-20">
      <div className="max-w-5xl mx-auto pt-8 md:pt-14">

        <div className="flex items-center gap-2 mb-2">
          <span className="badge badge-electric text-[11px] font-semibold">案例驱动学术研讨</span>
        </div>

        <h1
          className="font-display font-extrabold text-[#0d0d1a] leading-[1.15] tracking-[-0.03em] mb-2"
          style={{ fontSize: "clamp(24px, 3.5vw, 40px)" }}
        >
          {caseData.title}
        </h1>
        <p className="text-[#4a4a6a] text-sm md:text-base font-body mb-10">
          {caseData.subtitle}
        </p>

        <div className="space-y-6">
          {/* A. 当前研讨案例 */}
          <section className="glass-card rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-electric to-accent-cyan flex items-center justify-center">
                <Target className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <h2 className="font-display font-bold text-base text-[#0d0d1a]">
                  当前研讨案例
                </h2>
                <p className="text-xs text-[#4a4a6a] font-body">
                  案例基础信息与核心问题
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              <div className="rounded-xl bg-blue-50/50 p-3">
                <p className="text-[10px] font-bold text-[#8e8eaa] uppercase tracking-wider mb-0.5">产业方向</p>
                <p className="text-sm font-semibold text-[#0d0d1a]">{caseData.industryDirection}</p>
              </div>
              <div className="rounded-xl bg-blue-50/50 p-3">
                <p className="text-[10px] font-bold text-[#8e8eaa] uppercase tracking-wider mb-0.5">证据等级</p>
                <p className="text-sm font-semibold text-[#0d0d1a]">{caseData.evidenceLevel}</p>
              </div>
              <div className="rounded-xl bg-blue-50/50 p-3">
                <p className="text-[10px] font-bold text-[#8e8eaa] uppercase tracking-wider mb-0.5">来源类型</p>
                <p className="text-sm font-semibold text-[#0d0d1a]">{caseData.sourceType}</p>
              </div>
              <div className="rounded-xl bg-blue-50/50 p-3">
                <p className="text-[10px] font-bold text-[#8e8eaa] uppercase tracking-wider mb-0.5">科研任务</p>
                <p className="text-sm font-semibold text-[#0d0d1a]">{caseData.linkedResearchTask}</p>
              </div>
            </div>

            <div className="rounded-xl bg-white/60 border border-black/5 p-4 mb-4">
              <p className="text-xs font-bold text-[#8e8eaa] uppercase tracking-wider mb-1">核心问题</p>
              <p className="text-sm font-body text-[#0d0d1a] leading-relaxed">{caseData.coreProblem}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {caseData.relatedKnowledgePoints.map((kp, i) => (
                <span key={i} className="badge badge-cyan text-xs">{kp}</span>
              ))}
            </div>
          </section>

          {/* B. 模拟答辩问题 */}
          <section className="glass-card rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-electric to-accent-cyan flex items-center justify-center">
                <Presentation className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <h2 className="font-display font-bold text-base text-[#0d0d1a]">
                  模拟答辩问题
                </h2>
                <p className="text-xs text-[#4a4a6a] font-body">
                  基于案例字段生成的5类学术研讨题目
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {questions.map((cat, catIdx) => {
                const colors = categoryColors[cat.category] || categoryColors["基础理解"];
                return (
                  <div key={catIdx} className={`rounded-xl ${colors.bg} border ${colors.border} p-5`}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={colors.icon}>{cat.icon}</span>
                      <h3 className={`font-display text-sm font-bold ${colors.text}`}>
                        第{catIdx + 1}类：{cat.category}
                      </h3>
                    </div>
                    <ul className="space-y-2.5">
                      {cat.questions.map((q, qi) => (
                        <li key={qi} className="flex items-start gap-2 text-[13px] text-[#0d0d1a] font-body leading-relaxed">
                          <span className="font-bold text-[#4a4a6a] shrink-0 mt-0.5">{qi + 1}.</span>
                          <span>{q}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>

          {/* C. 汇报提纲 */}
          <section className="glass-card rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-amber to-accent-cyan flex items-center justify-center">
                <Lightbulb className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <h2 className="font-display font-bold text-base text-[#0d0d1a]">
                  汇报提纲
                </h2>
                <p className="text-xs text-[#4a4a6a] font-body">
                  适用于学术汇报的结构化提纲
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {outline.map((item, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl bg-white/60 border border-black/5 p-4">
                  <div className="w-7 h-7 rounded-lg bg-accent-electric/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-accent-electric">{i + 1}</span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-[#0d0d1a] mb-1">{item.section}</h4>
                    <p className="text-xs text-[#4a4a6a] font-body leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* D. 下一步操作 */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <Link
              href={`/research?caseId=${caseData.id}`}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/60 border border-black/5 text-sm font-semibold text-[#0d0d1a] hover:bg-white hover:border-black/10 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              返回科研实战
            </Link>
            <Link
              href="/cases"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/60 border border-black/5 text-sm font-semibold text-[#0d0d1a] hover:bg-white hover:border-black/10 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              返回产业案例库
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function InvalidCasePage() {
  return (
    <div className="min-h-screen pt-[var(--nav-height)] px-6 md:px-10 pb-20 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="w-8 h-8 text-amber-500" />
        </div>
        <h2 className="font-display font-bold text-xl text-[#0d0d1a] mb-2">
          未找到对应产业案例
        </h2>
        <p className="text-sm text-[#4a4a6a] font-body leading-relaxed mb-6">
          该案例可能已被移除或 ID 无效。您可以返回科研实战或产业案例库重新选择感兴趣的案例进行学术研讨。
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/research"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/60 border border-black/5 text-sm font-semibold text-[#0d0d1a] hover:bg-white transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            返回科研实战
          </Link>
          <Link
            href="/cases"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-electric to-accent-cyan text-sm font-semibold text-white hover:opacity-90 transition-all cursor-pointer"
          >
            返回产业案例库
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SeminarPage() {
  const [caseId, setCaseId] = useState<string | null | undefined>(undefined);
  const [caseData, setCaseData] = useState<IndustryCase | null>(null);
  const [caseNotFound, setCaseNotFound] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("caseId");
    if (id) {
      setCaseId(id);
      const found = industryCases.find((c) => c.id === id);
      if (found) {
        setCaseData(found);
      } else {
        setCaseNotFound(true);
      }
    } else {
      setCaseId(null);
    }
  }, []);

  if (caseId === undefined) {
    return null;
  }

  if (caseNotFound) {
    return <InvalidCasePage />;
  }

  if (caseData) {
    return <CaseDrivenSeminarPage caseData={caseData} />;
  }

  return <DefaultSeminarPage />;
}