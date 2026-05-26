"use client";

import {
  BookOpen,
  Microscope,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  MessageSquare,
  ShieldAlert,
  Lightbulb,
} from "lucide-react";

/* ─── Demo 标记 ─── */
const DEMO_FLAGS = {
  demo_only: true,
  not_real_benchmark: true,
  requires_teacher_review: true,
} as const;

/* ─── 知识点 ─── */
const knowledgePoint = {
  id: "kp_apoptosis_001",
  name: "细胞凋亡",
  basic_explanation: [
    "线粒体途径：Bcl-2 家族蛋白调控线粒体外膜通透化，释放细胞色素 c，激活 caspase-9",
    "死亡受体途径：Fas/FasL 结合招募 FADD，激活 caspase-8",
    "Caspase 级联反应：执行 caspase（caspase-3/6/7）降解底物，导致细胞有序死亡",
  ],
  research_frontiers: [
    "肿瘤治疗中的凋亡诱导策略与耐药机制",
    "免疫治疗与细胞死亡调控的交叉研究",
    "新型细胞死亡形式（焦亡、铁死亡）与凋亡的互作",
  ],
  industry_applications: [
    "抗肿瘤药物研发：靶向 Bcl-2/Bax 的药物设计",
    "分子诊断：凋亡标志物检测",
    "细胞治疗：CAR-T 细胞的凋亡调控",
    "药物筛选：caspase 活性高通量筛选平台",
  ],
};

/* ─── 证据卡 ─── */
const evidenceCards = [
  {
    card_id: "ec_apoptosis_001",
    title: "Bcl-2 家族蛋白调控线粒体途径细胞凋亡的分子机制",
    paper_identifier: { type: "mock_pmid", value: "MOCK-APOP-001" },
    evidence_strength: "strong",
    research_question: "Bcl-2 家族蛋白如何调控线粒体外膜通透化？",
    study_system: "体外培养的肿瘤细胞系",
    core_methods: "蛋白质免疫印迹、流式细胞术、线粒体膜电位检测",
    key_findings: "Bax/Bcl-2 比例决定细胞对凋亡信号的敏感性",
    limitations: "仅使用体外细胞系，缺乏动物模型验证",
    relation_to_course: "直接关联细胞凋亡章节的核心机制",
    relation_to_industry: "为 Bcl-2 靶向药物设计提供理论依据",
  },
  {
    card_id: "ec_apoptosis_002",
    title: "死亡受体途径与肿瘤免疫逃逸的关系",
    paper_identifier: { type: "mock_pmid", value: "MOCK-APOP-002" },
    evidence_strength: "moderate",
    research_question: "肿瘤细胞如何通过死亡受体途径逃避免疫监视？",
    study_system: "小鼠肿瘤模型 + 临床样本",
    core_methods: "免疫组化、RNA-seq、流式细胞术",
    key_findings: "肿瘤细胞下调 Fas 表达以逃避免疫细胞介导的凋亡",
    limitations: "样本量较小，需要更大规模临床验证",
    relation_to_course: "关联免疫学与细胞凋亡的交叉内容",
    relation_to_industry: "为免疫检查点联合治疗提供参考",
  },
  {
    card_id: "ec_apoptosis_003",
    title: "Caspase 靶向药物筛选策略研究",
    paper_identifier: { type: "mock_pmid", value: "MOCK-APOP-003" },
    evidence_strength: "preliminary",
    research_question: "如何高通量筛选 caspase 激活剂？",
    study_system: "高通量筛选平台",
    core_methods: "荧光底物法、高通量筛选、分子对接",
    key_findings: "建立了基于荧光信号的 caspase-3 激活剂筛选方法",
    limitations: "筛选结果尚未进行细胞水平验证",
    relation_to_course: "关联实验技术与药物筛选方法",
    relation_to_industry: "为抗肿瘤药物早期发现提供技术平台",
  },
];

/* ─── 证据矩阵 ─── */
const evidenceMatrix = {
  consensus_findings: [
    "Bcl-2 家族蛋白是调控细胞凋亡的关键分子",
    "凋亡调控异常与肿瘤发生发展密切相关",
  ],
  conflicting_findings: [
    "关于 Bcl-2 抑制剂在实体瘤中的疗效，不同研究结论不一致",
  ],
  evidence_strength_summary: "3 张证据卡中，1 张 strong、1 张 moderate、1 张 preliminary，整体证据强度中等",
  limitations_summary: "现有证据主要来自体外研究和动物模型，临床转化证据不足",
  report_outline: "1. 研究背景 → 2. 课程知识基础 → 3. 文献证据总结 → 4. 机制解释 → 5. 实验设计思路 → 6. 局限性 → 7. 产业应用",
};

/* ─── 多角色导师 ─── */
const agentRoles = [
  {
    name: "基础课老师",
    icon: BookOpen,
    color: "#2563eb",
    bg: "rgba(37,99,235,0.08)",
    question: "请用你自己的话解释线粒体途径和死亡受体途径的区别，以及它们在什么情况下会被激活？",
  },
  {
    name: "文献导师",
    icon: FileText,
    color: "#059669",
    bg: "rgba(5,150,105,0.08)",
    question: "这三篇文献的研究问题分别是什么？它们使用了哪些不同的实验方法？你认为哪篇证据最可靠？",
  },
  {
    name: "实验导师",
    icon: Microscope,
    color: "#7c3aed",
    bg: "rgba(124,58,237,0.08)",
    question: "如果要验证 Bax/Bcl-2 比例对凋亡的影响，你会如何设计对照组？需要哪些关键实验？",
  },
  {
    name: "产业导师",
    icon: Lightbulb,
    color: "#d97706",
    bg: "rgba(217,119,6,0.08)",
    question: "基于现有证据，你认为哪种凋亡调控策略最有产业化潜力？需要考虑哪些实际因素？",
  },
  {
    name: "审稿人导师",
    icon: ShieldAlert,
    color: "#dc2626",
    bg: "rgba(220,38,38,0.08)",
    question: "你的结论由哪些证据支持？是否存在因果性论证不足的问题？",
  },
];

/* ─── 审稿人追问 ─── */
const reviewerQuestions = [
  "你的结论由哪些证据支持？证据强度是否足以支撑你的论点？",
  "你引用的研究是否只是相关性而非因果性？如何区分？",
  "实验设计中是否包含阴性和阳性对照？如果没有，结论的可靠性如何？",
  "该实验体系能否支持产业转化判断？从实验室到产业化还需要哪些验证？",
];

/* ─── 调研报告骨架 ─── */
const reportSections = [
  { title: "研究背景", content: "细胞凋亡是程序性细胞死亡的重要形式，与肿瘤发生发展密切相关..." },
  { title: "课程知识基础", content: "基于课堂学习的线粒体途径和死亡受体途径知识..." },
  { title: "文献证据总结", content: "通过检索相关文献，整理了 3 篇核心证据卡..." },
  { title: "机制解释", content: "Bcl-2 家族蛋白通过调控线粒体外膜通透化..." },
  { title: "实验设计思路", content: "设计包含对照组和实验组的验证方案..." },
  { title: "局限性", content: "现有证据主要来自体外研究，缺乏临床数据..." },
  { title: "产业应用", content: "靶向 Bcl-2 的药物设计、凋亡标志物分子诊断..." },
];

/* ─── 证据强度颜色映射 ─── */
function strengthColor(s: string) {
  switch (s) {
    case "strong": return "text-emerald-600 bg-emerald-50";
    case "moderate": return "text-amber-600 bg-amber-50";
    case "preliminary": return "text-orange-600 bg-orange-50";
    default: return "text-gray-600 bg-gray-50";
  }
}

export default function ResearchTrainingPage() {
  return (
    <div className="space-y-8 animate-reveal">
      {/* ── Demo 标记 Banner ── */}
      <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <p className="font-semibold mb-1">Demo 数据展示</p>
          <p className="font-mono text-xs">
            demo_only={String(DEMO_FLAGS.demo_only)} &nbsp;|&nbsp; not_real_benchmark={String(DEMO_FLAGS.not_real_benchmark)} &nbsp;|&nbsp; requires_teacher_review={String(DEMO_FLAGS.requires_teacher_review)}
          </p>
          <p className="text-xs text-amber-700 mt-1">
            本页面所有文献均为模拟数据，不代表真实论文。所有内容需教师审核后方可用于教学。
          </p>
        </div>
      </div>

      {/* ── 页面标题 ── */}
      <div className="page-header">
        <h1>科研训练：从知识点到文献证据</h1>
        <p>通过结构化文献调研培养科研思维与证据判断能力</p>
      </div>

      {/* ── 知识点卡片 ── */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">知识点：细胞凋亡</h2>
        <div className="card p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 基础知识 */}
            <div>
              <h3 className="text-sm font-semibold text-blue-600 mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> 基础知识
              </h3>
              <ul className="space-y-2">
                {knowledgePoint.basic_explanation.map((item, i) => (
                  <li key={i} className="text-[13px] text-gray-700 leading-relaxed pl-4 border-l-2 border-blue-200">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            {/* 科研前沿 */}
            <div>
              <h3 className="text-sm font-semibold text-purple-600 mb-3 flex items-center gap-2">
                <Microscope className="w-4 h-4" /> 科研前沿
              </h3>
              <ul className="space-y-2">
                {knowledgePoint.research_frontiers.map((item, i) => (
                  <li key={i} className="text-[13px] text-gray-700 leading-relaxed pl-4 border-l-2 border-purple-200">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            {/* 产业应用 */}
            <div>
              <h3 className="text-sm font-semibold text-emerald-600 mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" /> 产业应用
              </h3>
              <ul className="space-y-2">
                {knowledgePoint.industry_applications.map((item, i) => (
                  <li key={i} className="text-[13px] text-gray-700 leading-relaxed pl-4 border-l-2 border-emerald-200">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── 文献调研任务卡 ── */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">文献调研任务</h2>
        <div className="card p-6 border-l-4 border-l-blue-500">
          <p className="text-sm font-semibold text-gray-900 mb-2">
            围绕「细胞凋亡与肿瘤治疗」完成一个小型文献调研
          </p>
          <p className="text-[13px] text-gray-600 leading-relaxed">
            请基于以下 3 张文献证据卡，完成证据矩阵整理，撰写一份包含机制解释和实验设计思路的调研报告。
            注意评估每篇证据的强度和局限性，形成你自己的判断。
          </p>
        </div>
      </section>

      {/* ── 文献证据卡列表 ── */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">文献证据卡</h2>
        <div className="space-y-4">
          {evidenceCards.map((card) => (
            <div key={card.card_id} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">{card.title}</h3>
                  <p className="text-[11px] text-gray-400 font-mono">
                    {card.paper_identifier.type}: {card.paper_identifier.value}
                  </p>
                </div>
                <span className={`badge ml-3 flex-shrink-0 ${strengthColor(card.evidence_strength)}`}>
                  {card.evidence_strength}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[13px]">
                <div>
                  <p className="text-gray-500 text-[11px] font-medium mb-0.5">研究问题</p>
                  <p className="text-gray-700">{card.research_question}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-[11px] font-medium mb-0.5">实验体系</p>
                  <p className="text-gray-700">{card.study_system}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-[11px] font-medium mb-0.5">核心方法</p>
                  <p className="text-gray-700">{card.core_methods}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-[11px] font-medium mb-0.5">主要发现</p>
                  <p className="text-gray-700">{card.key_findings}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-[11px] font-medium mb-0.5">局限性</p>
                  <p className="text-gray-700">{card.limitations}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-[11px] font-medium mb-0.5">产业关联</p>
                  <p className="text-gray-700">{card.relation_to_industry}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 证据矩阵 ── */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">证据矩阵</h2>
        <div className="card p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-emerald-600 mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> 共识发现
              </h3>
              <ul className="space-y-1.5">
                {evidenceMatrix.consensus_findings.map((item, i) => (
                  <li key={i} className="text-[13px] text-gray-700 pl-3 border-l-2 border-emerald-300">{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-amber-600 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> 冲突与不足
              </h3>
              <ul className="space-y-1.5">
                {evidenceMatrix.conflicting_findings.map((item, i) => (
                  <li key={i} className="text-[13px] text-gray-700 pl-3 border-l-2 border-amber-300">{item}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="divider my-4" />
          <div className="space-y-2">
            <p className="text-[13px] text-gray-700"><span className="font-medium text-gray-500">证据强度总结：</span>{evidenceMatrix.evidence_strength_summary}</p>
            <p className="text-[13px] text-gray-700"><span className="font-medium text-gray-500">局限性总结：</span>{evidenceMatrix.limitations_summary}</p>
          </div>
        </div>
      </section>

      {/* ── 多角色导师组 ── */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">多角色科研导师</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agentRoles.map((role) => {
            const Icon = role.icon;
            return (
              <div key={role.name} className="card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: role.bg }}
                  >
                    <Icon className="w-4.5 h-4.5" style={{ color: role.color }} />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900">{role.name}</h3>
                </div>
                <p className="text-[13px] text-gray-600 leading-relaxed">{role.question}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 审稿人追问区 ── */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">审稿人追问</h2>
        <div className="card p-6">
          <p className="text-[13px] text-gray-500 mb-4">提交调研报告后，审稿人导师将从以下角度追问：</p>
          <ul className="space-y-3">
            {reviewerQuestions.map((q, i) => (
              <li key={i} className="flex items-start gap-3 text-[13px] text-gray-700">
                <MessageSquare className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── 调研报告骨架 ── */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">调研报告骨架</h2>
        <div className="card p-6">
          <div className="space-y-4">
            {reportSections.map((section, i) => (
              <div key={i} className="flex items-start gap-3">
                <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900 mb-0.5">{section.title}</h3>
                  <p className="text-[13px] text-gray-500">{section.content}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="divider my-4" />
          <div className="flex items-center gap-2 text-[12px] text-amber-600">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>待教师审核 — 报告状态：draft_requires_review</span>
          </div>
        </div>
      </section>
    </div>
  );
}
