"use client";

import { useState } from "react";
import { ZoomIn, ZoomOut, Maximize2, Info, Layers } from "lucide-react";
import { knowledgeMapNodes, knowledgeMapEdges } from "@/lib/mock-data";

const categoryDot: Record<string, string> = {
  core: "bg-amber/30 border-amber/50",
  basic: "bg-sage/30 border-sage/50",
  advanced: "bg-rust/30 border-rust/50",
};

const categoryLabels: Record<string, string> = {
  core: "核心概念",
  basic: "基础知识",
  advanced: "进阶内容",
};

export default function KnowledgeMapPage() {
  const [scale, setScale] = useState(1);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1>知识地图</h1>
          <p>生物制造课程知识点关系图谱</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setScale(Math.max(0.5, scale - 0.1))}
            className="btn-ghost !px-2.5"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-[12px] text-ink-faint w-12 text-center stat-number">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale(Math.min(2, scale + 0.1))}
            className="btn-ghost !px-2.5"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button className="btn-ghost !px-2.5">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="lab-card p-5 animate-reveal">
            <h3 className="mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-ink-faint" />
              图例
            </h3>
            <div className="space-y-2">
              {Object.entries(categoryLabels).map(([key, label]) => (
                <div key={key} className="flex items-center gap-2.5">
                  <div
                    className={`w-3 h-3 rounded-full border ${categoryDot[key]}`}
                  />
                  <span className="text-[12px] text-ink-muted">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {selectedNode && (
            <div className="lab-card p-5 animate-reveal">
              <h3 className="mb-2">节点详情</h3>
              <p className="text-[14px] text-ink">
                {knowledgeMapNodes.find((n) => n.id === selectedNode)?.label}
              </p>
              <p className="text-[12px] text-ink-faint mt-1">
                类型：
                {categoryLabels[
                  knowledgeMapNodes.find((n) => n.id === selectedNode)?.category || "core"
                ]}
              </p>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-[12px] text-amber mt-2 hover:text-amber-soft transition-colors"
              >
                取消选择
              </button>
            </div>
          )}

          <div className="lab-card p-5 animate-reveal">
            <h3 className="mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-ink-faint" />
              知识点列表
            </h3>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {knowledgeMapNodes.map((node) => (
                <button
                  key={node.id}
                  onClick={() => setSelectedNode(node.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-[12px] transition-colors ${
                    selectedNode === node.id
                      ? "bg-surface-field text-ink"
                      : "text-ink-muted hover:bg-surface-field"
                  }`}
                >
                  {node.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="lab-card p-6 relative overflow-hidden animate-reveal" style={{ minHeight: "600px" }}>
            <svg
              viewBox="0 0 800 750"
              className="w-full h-full"
              style={{ transform: `scale(${scale})`, transformOrigin: "center" }}
            >
              {knowledgeMapEdges.map((edge, i) => {
                const from = knowledgeMapNodes.find((n) => n.id === edge.from);
                const to = knowledgeMapNodes.find((n) => n.id === edge.to);
                if (!from || !to) return null;
                return (
                  <line
                    key={`edge-${i}`}
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                  />
                );
              })}

              {knowledgeMapNodes.map((node) => {
                const isSelected = selectedNode === node.id;
                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onClick={() => setSelectedNode(node.id)}
                    className="cursor-pointer"
                  >
                    <rect
                      x={-80}
                      y={-24}
                      width={160}
                      height={48}
                      rx={12}
                      className={`transition-all duration-300 ${
                        isSelected
                          ? "fill-white/[0.12] stroke-amber/50 stroke-[2]"
                          : "fill-white/[0.04] stroke-border-muted stroke-[1]"
                      }`}
                    />
                    <text
                      textAnchor="middle"
                      dy="0.35em"
                      className={`text-[11px] ${
                        isSelected ? "fill-amber" : "fill-ink-muted"
                      } pointer-events-none`}
                      fontFamily='"Noto Sans SC", sans-serif'
                    >
                      {node.label}
                    </text>
                    {isSelected && (
                      <circle
                        cx={85}
                        cy={0}
                        r={4}
                        className="fill-amber animate-pulse-warm"
                      />
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
