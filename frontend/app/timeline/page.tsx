"use client";

import { CheckCircle, Circle, BookOpen, Award, Microscope, FlaskConical, Presentation, FileText, GitBranch, Zap } from "lucide-react";

const timelineItems = [
  {
    id: "t1",
    date: "2025-05-25",
    title: "完成CRISPR知识探索",
    description: "深入学习了CRISPR-Cas9系统的分子机制，包括PAM识别、DNA切割和修复通路",
    icon: BookOpen,
    status: "completed",
    color: "#2563eb",
  },
  {
    id: "t2",
    date: "2025-05-22",
    title: "通过分子生物学测验 (92分)",
    description: "在基因工程原理第二章测验中获得92分，正确识别了限制性内切酶特性和载体构建原理",
    icon: Award,
    status: "completed",
    color: "#059669",
  },
  {
    id: "t3",
    date: "2025-05-18",
    title: "分析pBR322质粒图谱",
    description: "使用质粒图谱查看器分析了pBR322载体的关键元件：AmpR抗性、TetR抗性和复制起点ori",
    icon: Microscope,
    status: "completed",
    color: "#7c3aed",
  },
  {
    id: "t4",
    date: "2025-05-15",
    title: "完成科研案例: 青蒿素生物合成",
    description: "研究了利用合成生物学方法在酵母中重构青蒿素合成通路的关键步骤和代谢工程策略",
    icon: FlaskConical,
    status: "completed",
    color: "#06b6d4",
  },
  {
    id: "t5",
    date: "2025-05-12",
    title: "参加模拟学术答辩",
    description: "完成CRISPR基因编辑专题的模拟答辩，AI导师给予了关于实验设计逻辑和表达清晰度的反馈",
    icon: Presentation,
    status: "completed",
    color: "#f59e0b",
  },
  {
    id: "t6",
    date: "2025-05-08",
    title: "学习代谢通路调控机制",
    description: "正在学习代谢工程中限速酶的反馈抑制调控、转录调控和翻译后修饰机制",
    icon: GitBranch,
    status: "in-progress",
    color: "#2563eb",
  },
  {
    id: "t7",
    date: "2025-05-05",
    title: "完成蛋白质结构分析练习",
    description: "使用Protein Structure Viewer分析了GFP蛋白的三维结构，识别了荧光发色团的关键氨基酸残基",
    icon: Microscope,
    status: "completed",
    color: "#7c3aed",
  },
  {
    id: "t8",
    date: "2025-04-28",
    title: "完成序列比对与引物设计",
    description: "使用Sequence Analysis工具完成了BLAST比对并成功设计了一对用于PCR扩增的引物",
    icon: FileText,
    status: "completed",
    color: "#059669",
  },
  {
    id: "t9",
    date: "2025-04-20",
    title: "学习合成生物学元件标准化",
    description: "了解了BioBrick标准、Golden Gate组装方法和模块化克隆策略在合成生物学中的应用",
    icon: Zap,
    status: "completed",
    color: "#f59e0b",
  },
];

export default function TimelinePage() {
  return (
    <div className="min-h-screen pt-[var(--nav-height)]">
      <section className="px-6 md:px-10 py-10 md:py-14 max-w-4xl mx-auto">
        <div className="mb-10">
          <p className="section-title">学习轨迹</p>
          <h1 className="section-heading text-[clamp(32px,5vw,48px)]">
            学习轨迹时间线
          </h1>
          <p className="text-[#4a4a6a] mt-3 max-w-2xl leading-relaxed">
            记录你的每一步学习成长，回顾已掌握的知识节点与技能进阶历程
          </p>
        </div>

        <div className="relative">
          <div className="absolute left-[19px] md:left-1/2 md:-translate-x-px top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#2563eb]/30 via-[#06b6d4]/20 to-transparent" />

          <div className="space-y-12">
            {timelineItems.map((item, index) => {
              const isLeft = index % 2 === 0;
              const StatusIcon = item.status === "completed" ? CheckCircle : Circle;

              return (
                <div key={item.id} className="relative">
                  <div
                    className={`flex flex-col md:flex-row items-start gap-6 ${
                      isLeft
                        ? "md:flex-row"
                        : "md:flex-row-reverse"
                    }`}
                  >
                    <div
                      className={`flex-1 md:w-1/2 ${
                        isLeft ? "md:text-right md:pr-8" : "md:text-left md:pl-8"
                      }`}
                    >
                      <div className="glass-card p-5 md:p-6 transition-all hover:translate-y-[-2px]">
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{
                              backgroundColor: `${item.color}12`,
                            }}
                          >
                            <item.icon className="w-4 h-4" style={{ color: item.color }} />
                          </div>
                          <span
                            className={`text-xs font-semibold ${
                              item.status === "completed"
                                ? "text-[#059669]"
                                : "text-[#f59e0b]"
                            }`}
                          >
                            {item.status === "completed" ? "已完成" : "进行中"}
                          </span>
                        </div>
                        <h3 className="font-display text-sm font-bold text-[#0d0d1a] mb-2">
                          {item.title}
                        </h3>
                        <p className="text-xs text-[#4a4a6a] leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 flex items-center justify-center z-10">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-white/60">
                        <StatusIcon
                          className={`w-5 h-5 ${
                            item.status === "completed"
                              ? "text-[#059669]"
                              : "text-[#f59e0b]"
                          }`}
                        />
                      </div>
                    </div>

                    <div className="flex-1 md:w-1/2 pl-12 md:pl-0 md:px-8">
                      <div className="md:pt-0 pt-0">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white/60 border border-white/60 text-[11px] font-medium text-[#4a4a6a]">
                          {item.date}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
