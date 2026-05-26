"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import * as Icons from "lucide-react";

interface KpiCardProps {
  label: string;
  value: number;
  unit: string;
  change: number;
  icon: string;
  color: "primary" | "accent" | "purple" | "warning";
}

const colorMap = {
  primary: {
    bg: "from-primary/10 to-primary/5",
    border: "border-primary/20",
    text: "text-primary-light",
    glow: "shadow-primary/10",
    line: "from-transparent via-primary to-transparent",
  },
  accent: {
    bg: "from-accent/10 to-accent/5",
    border: "border-accent/20",
    text: "text-accent",
    glow: "shadow-accent/10",
    line: "from-transparent via-accent to-transparent",
  },
  purple: {
    bg: "from-purple-500/10 to-purple-500/5",
    border: "border-purple-500/20",
    text: "text-purple-400",
    glow: "shadow-purple-500/10",
    line: "from-transparent via-purple-500 to-transparent",
  },
  warning: {
    bg: "from-warning/10 to-warning/5",
    border: "border-warning/20",
    text: "text-warning",
    glow: "shadow-warning/10",
    line: "from-transparent via-warning to-transparent",
  },
};

export function KpiCard({ label, value, unit, change, icon, color }: KpiCardProps) {
  const colors = colorMap[color];
  const IconComponent = (Icons as Record<string, React.ComponentType<{ className?: string }>>)[icon];
  const isUp = change > 0;
  const isDown = change < 0;
  const TrendIcon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;

  return (
    <div className={cn("kpi-card group cursor-default", colors.border, colors.glow)}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br",
              colors.bg,
              colors.border
            )}
          >
            {IconComponent && <IconComponent className={cn("w-5 h-5", colors.text)} />}
          </div>
          <span className="text-sm text-text-secondary">{label}</span>
        </div>
        <div
          className={cn(
            "flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-full",
            isUp && "text-success bg-success/10",
            isDown && "text-danger bg-danger/10",
            !isUp && !isDown && "text-text-muted bg-white/5"
          )}
        >
          <TrendIcon className="w-3 h-3" />
          <span>{Math.abs(change)}%</span>
        </div>
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className={cn("text-3xl font-bold", colors.text)}>
          {value.toLocaleString()}
        </span>
        <span className="text-sm text-text-muted">{unit}</span>
      </div>

      <div
        className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `linear-gradient(90deg, transparent, var(--${color === "purple" ? "purple" : color}), transparent)`,
        }}
      />
    </div>
  );
}
