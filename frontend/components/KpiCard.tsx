"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import * as Icons from "lucide-react";

interface KpiCardProps {
  label: string;
  value: number;
  unit: string;
  change: number;
  icon: string;
  color: "primary" | "accent" | "purple" | "warning";
}

const colorAccents: Record<string, string> = {
  primary: "bg-amber/10 text-amber border-amber/20",
  accent: "bg-sage/10 text-sage border-sage/20",
  purple: "bg-sage/10 text-sage border-sage/20",
  warning: "bg-rust/10 text-rust border-rust/20",
};

const trendColors = (isUp: boolean, isDown: boolean) => {
  if (isUp) return "text-sage bg-sage/10";
  if (isDown) return "text-rust bg-rust/10";
  return "text-ink-faint bg-surface-field";
};

export function KpiCard({ label, value, unit, change, icon, color }: KpiCardProps) {
  const colors = colorAccents[color] || colorAccents.primary;
  const IconComponent = (Icons as unknown as Record<string, React.ComponentType<any>>)[icon];
  const isUp = change > 0;
  const isDown = change < 0;
  const TrendIcon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;

  return (
    <div className="lab-card p-5 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colors}`}>
            {IconComponent && <IconComponent className="w-4 h-4" />}
          </div>
          <span className="text-[12px] text-ink-muted tracking-wide">{label}</span>
        </div>
        <div className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md font-medium ${trendColors(isUp, isDown)}`}>
          <TrendIcon className="w-3 h-3" />
          <span>{Math.abs(change)}%</span>
        </div>
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="stat-number text-[28px] font-medium text-ink tracking-tight">
          {value.toLocaleString()}
        </span>
        <span className="text-[12px] text-ink-faint">{unit}</span>
      </div>

      <div className="mt-3 h-[2px] w-0 group-hover:w-full bg-amber/20 rounded-full transition-all duration-500" />
    </div>
  );
}
