"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { TrendingUp, Download, Users } from "lucide-react";
import { classAnalysisData } from "@/lib/mock-data";

const scoreDistribution = [
  { range: "0-59", count: 3 },
  { range: "60-69", count: 8 },
  { range: "70-79", count: 15 },
  { range: "80-89", count: 12 },
  { range: "90-100", count: 7 },
];

const trendData = [
  { week: "第1周", avg: 72, class1: 70, class2: 74 },
  { week: "第2周", avg: 74, class1: 72, class2: 76 },
  { week: "第3周", avg: 73, class1: 71, class2: 75 },
  { week: "第4周", avg: 76, class1: 74, class2: 78 },
  { week: "第5周", avg: 78, class1: 76, class2: 80 },
  { week: "第6周", avg: 79, class1: 78, class2: 81 },
];

const tooltipStyle = {
  backgroundColor: "rgba(25,27,36,0.96)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "10px",
  color: "#e8e4dd",
  fontSize: "12px",
  fontFamily: "'JetBrains Mono', monospace",
};

export default function ClassAnalysisPage() {
  const [selectedClass, setSelectedClass] = useState(classAnalysisData[0]);

  return (
    <div className="space-y-8">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1>班级分析</h1>
          <p>全面的班级学情数据分析</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedClass.id}
            onChange={(e) =>
              setSelectedClass(classAnalysisData.find((c) => c.id === e.target.value)!)
            }
            className="lab-select"
          >
            {classAnalysisData.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button className="btn-ghost !px-2.5">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-reveal">
        <div className="lab-card p-5 animate-reveal-delay-1">
          <p className="text-[12px] text-ink-faint mb-1 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            学生人数
          </p>
          <p className="stat-number text-[28px] font-medium text-amber">
            {selectedClass.studentCount}
          </p>
          <p className="text-[12px] text-ink-faint mt-1">人</p>
        </div>
        <div className="lab-card p-5 animate-reveal-delay-2">
          <p className="text-[12px] text-ink-faint mb-1">平均成绩</p>
          <p className="stat-number text-[28px] font-medium text-sage">
            {selectedClass.avgScore}
          </p>
          <p className="text-[12px] text-ink-faint mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-sage" />
            较上次 +2.3
          </p>
        </div>
        <div className="lab-card p-5 animate-reveal-delay-3">
          <p className="text-[12px] text-ink-faint mb-1">完成率</p>
          <p className="stat-number text-[28px] font-medium text-sage">
            {selectedClass.completionRate}%
          </p>
          <div className="mt-2 h-1.5 rounded-full bg-border-subtle overflow-hidden">
            <div
              className="h-full rounded-full bg-sage transition-all"
              style={{ width: `${selectedClass.completionRate}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lab-card p-6 animate-reveal">
          <h3 className="mb-4">成绩分布</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={scoreDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="range" tick={{ fill: "#9d968f", fontSize: 12 }} />
              <YAxis tick={{ fill: "#6b6560", fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="rgba(232,152,62,0.5)" radius={[4, 4, 0, 0]} name="人数" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="lab-card p-6 animate-reveal">
          <h3 className="mb-4">成绩趋势</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="week" tick={{ fill: "#9d968f", fontSize: 12 }} />
              <YAxis domain={[60, 90]} tick={{ fill: "#6b6560", fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend
                wrapperStyle={{ fontSize: "12px", color: "#9d968f" }}
              />
              <Line
                type="monotone"
                dataKey="class1"
                stroke="#e8983e"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="A班"
              />
              <Line
                type="monotone"
                dataKey="class2"
                stroke="#4dab9a"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="B班"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="lab-card p-6 animate-reveal">
        <h3 className="mb-4">各知识点掌握情况</h3>
        <div className="space-y-3">
          {selectedClass.topics.map((topic) => (
            <div key={topic.name} className="flex items-center gap-4">
              <span className="text-[13px] text-ink-muted w-24 flex-shrink-0">
                {topic.name}
              </span>
              <div className="flex-1 h-3 rounded-full bg-border-subtle overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${topic.avgAccuracy}%`,
                    background: "linear-gradient(90deg, #e8983e, #4dab9a)",
                  }}
                />
              </div>
              <span className="stat-number text-[13px] font-medium text-ink w-10 text-right">
                {topic.avgAccuracy}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
