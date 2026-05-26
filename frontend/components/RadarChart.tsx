"use client";

import {
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";

interface RadarChartProps {
  data: { name: string; value: number }[];
  color?: string;
}

export function RadarChart({ data, color = "#e8983e" }: RadarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <RechartsRadar data={data} cx="50%" cy="50%" outerRadius="70%">
        <PolarGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
        <PolarAngleAxis
          dataKey="name"
          tick={{ fill: "#9d968f", fontSize: 11 }}
          axisLine={{ stroke: "rgba(255,255,255,0.05)" }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fill: "#6b6560", fontSize: 10 }}
          axisLine={{ stroke: "rgba(255,255,255,0.04)" }}
        />
        <Radar
          name="掌握度"
          dataKey="value"
          stroke={color}
          fill={color}
          fillOpacity={0.1}
          strokeWidth={1.5}
          dot={{ r: 2, fill: color, strokeWidth: 0 }}
          activeDot={{ r: 4, fill: color, stroke: "rgba(255,255,255,0.15)", strokeWidth: 1 }}
        />
      </RechartsRadar>
    </ResponsiveContainer>
  );
}
