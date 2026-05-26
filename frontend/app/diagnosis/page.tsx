"use client";

import { useState } from "react";
import {
  Clock,
  Brain,
  CalendarDays,
  AlertTriangle,
  TrendingUp,
  Lightbulb,
  ArrowRight,
} from "lucide-react";

const radarData = [
  { name: "分子生物学", value: 78 },
  { name: "基因工程", value: 65 },
  { name: "蛋白质科学", value: 82 },
  { name: "代谢工程", value: 58 },
  { name: "细胞生物学", value: 71 },
  { name: "生物信息学", value: 45 },
];

const weakPoints = [
  { topic: "CRISPR-Cas9机制", mastery: 40, color: "#f43f5e" },
  { topic: "质粒设计", mastery: 55, color: "#f59e0b" },
  { topic: "代谢通路调控", mastery: 48, color: "#f43f5e" },
  { topic: "RNA干扰机制", mastery: 62, color: "#f59e0b" },
  { topic: "蛋白质表达系统", mastery: 50, color: "#f43f5e" },
];

const recommendations = [
  {
    title: "深入学习CRISPR-Cas9分子机制",
    desc: "建议完成基因编辑章节的交互式学习模块，重点理解Cas9蛋白结构域功能",
    priority: "high",
  },
  {
    title: "强化质粒设计基础知识",
    desc: "使用质粒图谱查看器进行辅助学习，掌握多克隆位点和选择标记的组合策略",
    priority: "high",
  },
  {
    title: "补充生物信息学分析技能",
    desc: "完成序列比对和引物设计相关练习，建议每周投入2小时专项训练",
    priority: "medium",
  },
  {
    title: "拓展代谢工程前沿知识",
    desc: "阅读3篇代谢通路优化相关的最新文献，关注合成生物学方向进展",
    priority: "medium",
  },
];

const priorityConfig = {
  high: { bg: "rgba(244,63,94,0.05)", border: "rgba(244,63,94,0.12)", color: "#f43f5e", label: "高优先" },
  medium: { bg: "rgba(245,158,11,0.05)", border: "rgba(245,158,11,0.12)", color: "#f59e0b", label: "中优先" },
};

function RadarSvg() {
  const cx = 140;
  const cy = 140;
  const r = 100;
  const levels = 5;

  const angleSlice = (2 * Math.PI) / radarData.length;
  const startAngle = -Math.PI / 2;

  const getPoint = (index: number, value: number) => {
    const angle = startAngle + index * angleSlice;
    const dist = (value / 100) * r;
    return {
      x: cx + dist * Math.cos(angle),
      y: cy + dist * Math.sin(angle),
    };
  };

  const gridPolygons = Array.from({ length: levels }, (_, level) => {
    const ratio = (level + 1) / levels;
    return radarData
      .map((_, i) => {
        const angle = startAngle + i * angleSlice;
        const dist = ratio * r;
        return `${cx + dist * Math.cos(angle)},${cy + dist * Math.sin(angle)}`;
      })
      .join(" ");
  });

  const dataPoints = radarData.map((d, i) => getPoint(i, d.value));
  const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg viewBox="0 0 280 280" className="w-full max-w-[400px] mx-auto">
      {gridPolygons.map((points, i) => (
        <polygon
          key={i}
          points={points}
          fill="none"
          stroke="rgba(0,0,0,0.06)"
          strokeWidth="1"
        />
      ))}

      {radarData.map((_, i) => {
        const angle = startAngle + i * angleSlice;
        const ex = cx + r * Math.cos(angle);
        const ey = cy + r * Math.sin(angle);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={ex}
            y2={ey}
            stroke="rgba(0,0,0,0.06)"
            strokeWidth="1"
          />
        );
      })}

      <polygon
        points={dataPolygon}
        fill="rgba(37,99,235,0.1)"
        stroke="#2563eb"
        strokeWidth="2"
      />

      {dataPoints.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="3"
          fill="#2563eb"
          stroke="white"
          strokeWidth="1.5"
        />
      ))}

      {radarData.map((d, i) => {
        const angle = startAngle + i * angleSlice;
        const labelR = r + 18;
        const lx = cx + labelR * Math.cos(angle);
        const ly = cy + labelR * Math.sin(angle);
        return (
          <text
            key={i}
            x={lx}
            y={ly}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#4a4a6a"
            fontSize="11"
            fontFamily="Plus Jakarta Sans, sans-serif"
            fontWeight="500"
          >
            {d.name}
          </text>
        );
      })}
    </svg>
  );
}

export default function DiagnosisPage() {
  return (
    <div className="min-h-screen pt-[var(--nav-height)]">
      <section className="px-6 md:px-10 py-10 md:py-14 max-w-7xl mx-auto">
        <div className="mb-10">
          <p className="section-title">学习诊断</p>
          <h1 className="section-heading text-[clamp(32px,5vw,48px)]">
            学习诊断仪表盘
          </h1>
          <p className="text-[#4a4a6a] mt-3 max-w-2xl leading-relaxed">
            可视化展示你的知识掌握全貌，AI精准定位薄弱环节并给出学习建议
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            {
              icon: Clock,
              label: "学习时长",
              value: 128.5,
              unit: "小时",
              color: "#2563eb",
              bg: "rgba(37,99,235,0.06)",
            },
            {
              icon: Brain,
              label: "知识掌握率",
              value: 76.8,
              unit: "%",
              color: "#06b6d4",
              bg: "rgba(6,182,212,0.06)",
            },
            {
              icon: CalendarDays,
              label: "活跃天数",
              value: 42,
              unit: "天",
              color: "#059669",
              bg: "rgba(5,150,105,0.06)",
            },
          ].map((item) => (
            <div key={item.label} className="glass-card-iridescent p-6">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: item.bg }}
                >
                  <item.icon className="w-5 h-5" style={{ color: item.color }} />
                </div>
                <p className="text-sm text-[#4a4a6a] font-medium">{item.label}</p>
              </div>
              <p className="stat-number text-[36px] text-[#0d0d1a] leading-none">
                {item.value}
                <span className="text-lg text-[#8e8eaa] ml-1">{item.unit}</span>
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 glass-card p-6 md:p-8">
            <h2 className="font-display text-lg font-bold text-[#0d0d1a] mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#2563eb]" />
              知识雷达图
            </h2>
            <RadarSvg />
            <div className="flex justify-center gap-6 mt-4">
              {radarData.map((d) => (
                <div key={d.name} className="text-center">
                  <p className="stat-number text-sm text-[#0d0d1a]">{d.value}%</p>
                  <p className="text-[10px] text-[#8e8eaa]">{d.name}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6 flex flex-col">
            <h2 className="font-display text-base font-bold text-[#0d0d1a] mb-5 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#f43f5e]" />
              薄弱知识点
            </h2>
            <div className="flex-1 space-y-4">
              {weakPoints.map((item) => (
                <div key={item.topic}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-[#0d0d1a] font-medium">{item.topic}</span>
                    <span className="stat-number text-xs" style={{ color: item.color }}>
                      {item.mastery}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#0d0d1a]/5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${item.mastery}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-card-iridescent p-6 md:p-8">
          <h2 className="font-display text-lg font-bold text-[#0d0d1a] mb-5 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-[#f59e0b]" />
            AI学习建议
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec) => {
              const pc = priorityConfig[rec.priority as keyof typeof priorityConfig];
              return (
                <div
                  key={rec.title}
                  className="p-5 rounded-2xl transition-all hover:translate-y-[-2px]"
                  style={{ backgroundColor: pc.bg, border: `1px solid ${pc.border}` }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-display text-sm font-bold text-[#0d0d1a] pr-2">
                      {rec.title}
                    </h3>
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0"
                      style={{ color: pc.color, backgroundColor: `${pc.color}15` }}
                    >
                      {pc.label}
                    </span>
                  </div>
                  <p className="text-xs text-[#4a4a6a] leading-relaxed">{rec.desc}</p>
                  <button className="mt-3 flex items-center gap-1 text-xs font-semibold text-[#2563eb] hover:gap-2 transition-all">
                    开始学习
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
