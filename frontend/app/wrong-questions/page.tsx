"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  BookX,
  BookOpen,
  RotateCcw,
  XCircle,
  CheckCircle2,
} from "lucide-react";

const wrongQuestions = [
  {
    id: "wq-1",
    question: "在CRISPR-Cas9系统中，tracrRNA的主要功能是什么？",
    course: "基因工程",
    chapter: "第三章",
    yourAnswer: "识别目标DNA序列",
    correctAnswer: "引导crRNA与Cas9蛋白结合形成功能性核糖核蛋白复合体",
    explanation:
      "tracrRNA（trans-activating crRNA）通过碱基互补配对与pre-crRNA结合，引导crRNA成熟并与Cas9蛋白组装。PAM识别由Cas9蛋白的PAM-interacting结构域完成，而非tracrRNA。",
    wrongCount: 3,
    lastWrongDate: "2025-05-20",
  },
  {
    id: "wq-2",
    question: "在发酵过程中，次级代谢产物通常在哪个生长时期大量合成？",
    course: "发酵工程",
    chapter: "第五章",
    yourAnswer: "对数生长期",
    correctAnswer: "稳定期（静止期）",
    explanation:
      "次级代谢产物（如抗生素、色素、毒素等）通常在稳定期合成。对数生长期细胞主要进行初级代谢以支持快速增殖，当营养受限进入稳定期后，次级代谢途径被激活。",
    wrongCount: 2,
    lastWrongDate: "2025-05-18",
  },
  {
    id: "wq-3",
    question: "下列关于代谢通量分析（MFA）的说法，错误的是？",
    course: "代谢工程",
    chapter: "第四章",
    yourAnswer: "基于化学计量学模型",
    correctAnswer: "无需考虑辅因子平衡",
    explanation:
      "代谢通量分析必须考虑辅因子（如NADH、NADPH、ATP）的平衡。准确的MFA模型需要纳入辅因子平衡方程，以确保代谢网络的质量守恒和能量守恒，这是通量估算精度的关键前提。",
    wrongCount: 1,
    lastWrongDate: "2025-05-15",
  },
  {
    id: "wq-4",
    question: "pBR322质粒载体中含有几个抗生素抗性基因？分别是什么？",
    course: "基因工程",
    chapter: "第二章",
    yourAnswer: "1个：氨苄青霉素抗性基因",
    correctAnswer: "2个：氨苄青霉素抗性基因（AmpR）和四环素抗性基因（TetR），分别位于4361bp的质粒不同位置",
    explanation:
      "pBR322含有两个抗生素抗性标记。AmpR编码beta-内酰胺酶，TetR编码四环素外排泵蛋白。利用这两个标记可以在克隆实验中方便地进行插入失活筛选和重组子鉴定。",
    wrongCount: 3,
    lastWrongDate: "2025-05-19",
  },
  {
    id: "wq-5",
    question: "蛋白质定向进化中，易错PCR属于哪一类突变策略？其优缺点是什么？",
    course: "蛋白质工程",
    chapter: "第六章",
    yourAnswer: "定点突变，优点是精确可控",
    correctAnswer: "随机突变策略，优点是可产生大量突变体文库，缺点是突变位置不可控且偏向特定碱基替换",
    explanation:
      "易错PCR通过使用低保真度DNA聚合酶和调整Mg2+/Mn2+浓度来引入随机突变，属于random mutagenesis。而定点突变（site-directed mutagenesis）使用含特定突变引物的PCR，精确控制突变位点。两者在蛋白质工程中互补使用。",
    wrongCount: 2,
    lastWrongDate: "2025-05-14",
  },
  {
    id: "wq-6",
    question: "在合成生物学中，What does 'orthogonal system' refer to and why is it important for genetic circuit design?",
    course: "合成生物学",
    chapter: "第三章",
    yourAnswer: "与宿主完全相同的代谢系统",
    correctAnswer: "正交系统指与宿主细胞内源组分相互独立、互不干扰的外源系统，其重要性在于保证遗传回路的可预测性和模块化运行",
    explanation:
      "正交性（orthogonality）是合成生物学的核心概念。正交核糖体、正交氨酰tRNA合成酶/tRNA对、正交启动子-转录因子对等，确保外源回路不与宿主调控网络产生交叉干扰（crosstalk），是实现复杂遗传编程的前提。",
    wrongCount: 1,
    lastWrongDate: "2025-05-10",
  },
];

const courses = ["全部课程", "基因工程", "发酵工程", "代谢工程", "蛋白质工程", "合成生物学"];

export default function WrongQuestionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("全部课程");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCourseFilter, setShowCourseFilter] = useState(false);

  const filtered = wrongQuestions.filter((q) => {
    const matchSearch =
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.course.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCourse =
      selectedCourse === "全部课程" || q.course === selectedCourse;
    return matchSearch && matchCourse;
  });

  const totalWrong = wrongQuestions.length;
  const totalWrongCount = wrongQuestions.reduce((s, q) => s + q.wrongCount, 0);
  const totalCourses = new Set(wrongQuestions.map((q) => q.course)).size;

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="min-h-screen pt-[var(--nav-height)]">
      <section className="px-6 md:px-10 py-10 md:py-14 max-w-5xl mx-auto">
        <div className="mb-10">
          <p className="section-title">错题管理</p>
          <h1 className="section-heading text-[clamp(32px,5vw,48px)]">
            错题本
          </h1>
          <p className="text-[#4a4a6a] mt-3 max-w-2xl leading-relaxed">
            收集并回顾你的错题，系统化强化薄弱环节，让每一次错误都成为进步的阶梯
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            {
              icon: BookX,
              label: "错题总数",
              value: totalWrong,
              unit: "道",
              color: "#2563eb",
              bg: "rgba(37,99,235,0.06)",
            },
            {
              icon: RotateCcw,
              label: "累计错误次数",
              value: totalWrongCount,
              unit: "次",
              color: "#f43f5e",
              bg: "rgba(244,63,94,0.06)",
            },
            {
              icon: BookOpen,
              label: "涉及课程数",
              value: totalCourses,
              unit: "门",
              color: "#06b6d4",
              bg: "rgba(6,182,212,0.06)",
            },
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-5 flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: stat.bg }}
              >
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <div>
                <p className="stat-number text-2xl text-[#0d0d1a]">
                  {stat.value}
                  <span className="text-sm text-[#8e8eaa] ml-0.5">{stat.unit}</span>
                </p>
                <p className="text-xs text-[#4a4a6a] mt-0.5">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="glass-card p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8e8eaa]" />
              <input
                type="text"
                placeholder="搜索错题内容或课程名称..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/60 border border-white/60 text-sm text-[#0d0d1a] placeholder:text-[#8e8eaa] focus:outline-none focus:border-[#2563eb]/30"
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setShowCourseFilter(!showCourseFilter)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/60 border border-white/60 text-sm text-[#4a4a6a] hover:border-[#2563eb]/20 transition-colors whitespace-nowrap"
              >
                <Filter className="w-4 h-4" />
                {selectedCourse}
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${
                    showCourseFilter ? "rotate-180" : ""
                  }`}
                />
              </button>
              {showCourseFilter && (
                <div className="absolute right-0 top-full mt-1 bg-white/95 backdrop-blur-xl border border-white/60 rounded-xl shadow-lg z-10 min-w-[160px] overflow-hidden">
                  {courses.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setSelectedCourse(c);
                        setShowCourseFilter(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        selectedCourse === c
                          ? "bg-[#eff6ff] text-[#2563eb] font-medium"
                          : "text-[#4a4a6a] hover:bg-white/60"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {filtered.map((q) => {
            const isExpanded = expandedId === q.id;
            return (
              <div key={q.id} className="glass-card overflow-hidden transition-all">
                <button
                  onClick={() => toggleExpand(q.id)}
                  className="w-full text-left p-5 md:p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-2 h-2 rounded-full bg-[#f43f5e] flex-shrink-0 mt-1.5" />
                      <div className="min-w-0">
                        <p className="text-sm text-[#0d0d1a] leading-relaxed font-medium">
                          {q.question}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 mt-2">
                          <span className="inline-flex items-center gap-1 text-[11px] text-[#4a4a6a]">
                            <BookOpen className="w-3 h-3" />
                            {q.course} | {q.chapter}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] text-[#f43f5e] font-medium">
                            <RotateCcw className="w-3 h-3" />
                            错误 {q.wrongCount} 次
                          </span>
                          <span className="text-[11px] text-[#8e8eaa]">
                            {q.lastWrongDate}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                          q.wrongCount >= 3
                            ? "bg-[#f43f5e]/10 text-[#f43f5e]"
                            : q.wrongCount >= 2
                            ? "bg-[#f59e0b]/10 text-[#f59e0b]"
                            : "bg-[#059669]/10 text-[#059669]"
                        }`}
                      >
                        {q.wrongCount >= 3 ? "高频错误" : q.wrongCount >= 2 ? "需关注" : "已改善"}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-[#8e8eaa]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#8e8eaa]" />
                      )}
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 md:px-6 pb-5 md:pb-6 border-t border-black/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="p-4 rounded-xl bg-[#f43f5e]/5 border border-[#f43f5e]/10">
                        <p className="text-[11px] font-semibold text-[#f43f5e] mb-2 flex items-center gap-1.5">
                          <XCircle className="w-3.5 h-3.5" />
                          你的答案
                        </p>
                        <p className="text-sm text-[#0d0d1a] leading-relaxed">{q.yourAnswer}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-[#059669]/5 border border-[#059669]/10">
                        <p className="text-[11px] font-semibold text-[#059669] mb-2 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          正确答案
                        </p>
                        <p className="text-sm text-[#0d0d1a] leading-relaxed">{q.correctAnswer}</p>
                      </div>
                    </div>
                    <div className="mt-4 p-4 rounded-xl bg-white/60 border border-white/60">
                      <p className="text-[11px] font-semibold text-[#2563eb] mb-2">解析</p>
                      <p className="text-sm text-[#4a4a6a] leading-relaxed">{q.explanation}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="glass-card p-12 text-center">
              <BookX className="w-10 h-10 mx-auto text-[#8e8eaa] mb-3" />
              <p className="text-sm text-[#4a4a6a]">暂无匹配的错题记录</p>
              <p className="text-xs text-[#8e8eaa] mt-1">尝试调整搜索条件或课程筛选</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
