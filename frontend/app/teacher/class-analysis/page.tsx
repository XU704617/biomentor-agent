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

export default function ClassAnalysisPage() {
  const [selectedClass, setSelectedClass] = useState(classAnalysisData[0]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">班级分析</h1>
          <p className="text-text-muted mt-1">全面的班级学情数据分析</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedClass.id}
            onChange={(e) =>
              setSelectedClass(classAnalysisData.find((c) => c.id === e.target.value)!)
            }
            className="px-4 py-2 rounded-xl glass text-sm text-text-primary focus:outline-none"
          >
            {classAnalysisData.map((c) => (
              <option key={c.id} value={c.id} className="bg-bg-dark">
                {c.name}
              </option>
            ))}
          </select>
          <button className="p-2 rounded-xl glass hover:bg-white/10 transition-colors">
            <Download className="w-4 h-4 text-text-secondary" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <p className="text-xs text-text-muted mb-1 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            学生人数
          </p>
          <p className="text-3xl font-bold text-primary-light">{selectedClass.studentCount}</p>
          <p className="text-xs text-text-muted mt-1">人</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-xs text-text-muted mb-1">平均成绩</p>
          <p className="text-3xl font-bold text-accent">{selectedClass.avgScore}</p>
          <p className="text-xs text-text-muted mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-success" />
            较上次 +2.3
          </p>
        </div>
        <div className="glass-card p-5">
          <p className="text-xs text-text-muted mb-1">完成率</p>
          <p className="text-3xl font-bold text-purple-400">{selectedClass.completionRate}%</p>
          <div className="mt-2 h-1.5 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-primary"
              style={{ width: `${selectedClass.completionRate}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <h3 className="text-base font-semibold mb-4">成绩分布</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={scoreDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="range" tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15,23,42,0.95)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  color: "#e2e8f0",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="count" fill="rgba(14,165,233,0.6)" radius={[4, 4, 0, 0]} name="人数" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-5">
          <h3 className="text-base font-semibold mb-4">成绩趋势</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="week" tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <YAxis domain={[60, 90]} tick={{ fill: "#64748b", fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15,23,42,0.95)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  color: "#e2e8f0",
                  fontSize: "12px",
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: "12px", color: "#94a3b8" }}
              />
              <Line
                type="monotone"
                dataKey="class1"
                stroke="#0ea5e9"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="A班"
              />
              <Line
                type="monotone"
                dataKey="class2"
                stroke="#06d6a0"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="B班"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card p-5">
        <h3 className="text-base font-semibold mb-4">各知识点掌握情况</h3>
        <div className="space-y-3">
          {selectedClass.topics.map((topic) => (
            <div key={topic.name} className="flex items-center gap-4">
              <span className="text-sm text-text-secondary w-24 flex-shrink-0">
                {topic.name}
              </span>
              <div className="flex-1 h-3 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all"
                  style={{ width: `${topic.avgAccuracy}%` }}
                />
              </div>
              <span className="text-sm font-medium text-text-primary w-10 text-right">
                {topic.avgAccuracy}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
