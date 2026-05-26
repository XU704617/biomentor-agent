"use client";

import { useState } from "react";
import { ZoomIn, ZoomOut, Maximize2, Info } from "lucide-react";
import { knowledgeMapNodes, knowledgeMapEdges } from "@/lib/mock-data";

const categoryColors: Record<string, string> = {
  core: "bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30 text-primary-light",
  basic: "bg-gradient-to-br from-accent/20 to-accent/5 border-accent/30 text-accent",
  advanced: "bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-purple-500/30 text-purple-400",
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">知识地图</h1>
          <p className="text-text-muted mt-1">生物制造课程知识点关系图谱</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setScale(Math.max(0.5, scale - 0.1))}
            className="p-2 rounded-lg glass hover:bg-white/10 transition-colors"
          >
            <ZoomOut className="w-4 h-4 text-text-secondary" />
          </button>
          <span className="text-xs text-text-muted w-12 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale(Math.min(2, scale + 0.1))}
            className="p-2 rounded-lg glass hover:bg-white/10 transition-colors"
          >
            <ZoomIn className="w-4 h-4 text-text-secondary" />
          </button>
          <button className="p-2 rounded-lg glass hover:bg-white/10 transition-colors">
            <Maximize2 className="w-4 h-4 text-text-secondary" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-3">
          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-primary-light" />
              图例
            </h3>
            <div className="space-y-2">
              {Object.entries(categoryLabels).map(([key, label]) => (
                <div key={key} className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full border ${
                      key === "core"
                        ? "bg-primary/30 border-primary/50"
                        : key === "basic"
                        ? "bg-accent/30 border-accent/50"
                        : "bg-purple-500/30 border-purple-500/50"
                    }`}
                  />
                  <span className="text-xs text-text-secondary">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {selectedNode && (
            <div className="glass-card p-4 animate-fade-in">
              <h3 className="text-sm font-semibold mb-2">节点详情</h3>
              <p className="text-sm text-text-primary">
                {knowledgeMapNodes.find((n) => n.id === selectedNode)?.label}
              </p>
              <p className="text-xs text-text-muted mt-1">
                类型：
                {categoryLabels[
                  knowledgeMapNodes.find((n) => n.id === selectedNode)?.category || "core"
                ]}
              </p>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-xs text-primary-light mt-2 hover:text-primary transition-colors"
              >
                取消选择
              </button>
            </div>
          )}

          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold mb-3">知识点列表</h3>
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {knowledgeMapNodes.map((node) => (
                <button
                  key={node.id}
                  onClick={() => setSelectedNode(node.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                    selectedNode === node.id
                      ? "bg-white/10 text-text-primary"
                      : "text-text-secondary hover:bg-white/5"
                  }`}
                >
                  {node.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="glass-card p-6 relative overflow-hidden" style={{ minHeight: "600px" }}>
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
                    stroke="rgba(255,255,255,0.1)"
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
                          ? "fill-white/15 stroke-primary/60 stroke-[2]"
                          : "fill-white/5 stroke-white/10 stroke-[1]"
                      }`}
                    />
                    <text
                      textAnchor="middle"
                      dy="0.35em"
                      className={`text-xs ${
                        isSelected ? "fill-primary-light" : "fill-text-secondary"
                      } pointer-events-none`}
                    >
                      {node.label}
                    </text>
                    {isSelected && (
                      <circle
                        cx={85}
                        cy={0}
                        r={4}
                        className="fill-primary-light animate-pulse"
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
