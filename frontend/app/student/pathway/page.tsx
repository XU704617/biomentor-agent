"use client";

import { useState } from "react";
import {
  Search,
  Send,
  Sparkles,
  User,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Minus,
} from "lucide-react";

interface NodeData {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;
  textColor: string;
}

interface EdgeData {
  from: string;
  to: string;
  type: "activation" | "inhibition" | "phosphorylation";
  label: string;
}

const pathways: Record<string, { name: string; nodes: NodeData[]; edges: EdgeData[] }> = {
  "cell-cycle": {
    name: "细胞周期",
    nodes: [
      { id: "dna-damage", label: "DNA 损伤", x: 330, y: 30, w: 80, h: 30, fill: "#9ca3af", textColor: "#ffffff" },
      { id: "p53", label: "p53", x: 180, y: 120, w: 60, h: 30, fill: "#059669", textColor: "#ffffff" },
      { id: "cyclin-d", label: "Cyclin D", x: 30, y: 240, w: 80, h: 30, fill: "#f59e0b", textColor: "#ffffff" },
      { id: "cdk46", label: "CDK4/6", x: 180, y: 240, w: 80, h: 30, fill: "#2563eb", textColor: "#ffffff" },
      { id: "rb", label: "Rb", x: 340, y: 240, w: 60, h: 30, fill: "#7c3aed", textColor: "#ffffff" },
      { id: "e2f", label: "E2F", x: 490, y: 240, w: 60, h: 30, fill: "#059669", textColor: "#ffffff" },
      { id: "cyclin-e", label: "Cyclin E", x: 490, y: 340, w: 80, h: 30, fill: "#f59e0b", textColor: "#ffffff" },
      { id: "p21", label: "p21", x: 180, y: 370, w: 60, h: 30, fill: "#dc2626", textColor: "#ffffff" },
      { id: "cdk2-cycline", label: "CDK2/Cyclin E", x: 340, y: 370, w: 120, h: 30, fill: "#2563eb", textColor: "#ffffff" },
    ],
    edges: [
      { from: "dna-damage", to: "p53", type: "activation", label: "" },
      { from: "p53", to: "p21", type: "activation", label: "" },
      { from: "cyclin-d", to: "cdk46", type: "activation", label: "" },
      { from: "cdk46", to: "rb", type: "phosphorylation", label: "" },
      { from: "rb", to: "e2f", type: "activation", label: "" },
      { from: "e2f", to: "cyclin-e", type: "activation", label: "" },
      { from: "p21", to: "cdk2-cycline", type: "inhibition", label: "" },
    ],
  },
  apoptosis: {
    name: "细胞凋亡",
    nodes: [
      { id: "death-signal", label: "死亡信号", x: 320, y: 30, w: 80, h: 30, fill: "#9ca3af", textColor: "#ffffff" },
      { id: "bax", label: "Bax", x: 100, y: 130, w: 60, h: 30, fill: "#dc2626", textColor: "#ffffff" },
      { id: "bcl2", label: "Bcl-2", x: 260, y: 130, w: 60, h: 30, fill: "#059669", textColor: "#ffffff" },
      { id: "cytc", label: "Cyt c", x: 180, y: 230, w: 60, h: 30, fill: "#f59e0b", textColor: "#ffffff" },
      { id: "apaf1", label: "Apaf-1", x: 320, y: 230, w: 70, h: 30, fill: "#2563eb", textColor: "#ffffff" },
      { id: "casp9", label: "Caspase-9", x: 320, y: 330, w: 90, h: 30, fill: "#2563eb", textColor: "#ffffff" },
      { id: "casp3", label: "Caspase-3", x: 450, y: 330, w: 90, h: 30, fill: "#dc2626", textColor: "#ffffff" },
      { id: "apoptosis", label: "细胞凋亡", x: 500, y: 430, w: 80, h: 30, fill: "#9ca3af", textColor: "#ffffff" },
    ],
    edges: [
      { from: "death-signal", to: "bax", type: "activation", label: "" },
      { from: "bcl2", to: "bax", type: "inhibition", label: "" },
      { from: "bax", to: "cytc", type: "activation", label: "" },
      { from: "bcl2", to: "cytc", type: "inhibition", label: "" },
      { from: "cytc", to: "apaf1", type: "activation", label: "" },
      { from: "apaf1", to: "casp9", type: "activation", label: "" },
      { from: "casp9", to: "casp3", type: "activation", label: "" },
      { from: "casp3", to: "apoptosis", type: "activation", label: "" },
    ],
  },
  mapk: {
    name: "MAPK 信号通路",
    nodes: [
      { id: "gf", label: "生长因子", x: 320, y: 30, w: 80, h: 30, fill: "#9ca3af", textColor: "#ffffff" },
      { id: "rtk", label: "RTK", x: 200, y: 120, w: 60, h: 30, fill: "#2563eb", textColor: "#ffffff" },
      { id: "ras", label: "Ras", x: 340, y: 120, w: 60, h: 30, fill: "#f59e0b", textColor: "#ffffff" },
      { id: "raf", label: "Raf", x: 200, y: 220, w: 60, h: 30, fill: "#2563eb", textColor: "#ffffff" },
      { id: "mek", label: "MEK", x: 340, y: 220, w: 60, h: 30, fill: "#2563eb", textColor: "#ffffff" },
      { id: "erk", label: "ERK", x: 270, y: 320, w: 60, h: 30, fill: "#2563eb", textColor: "#ffffff" },
      { id: "tf", label: "转录因子", x: 170, y: 410, w: 80, h: 30, fill: "#059669", textColor: "#ffffff" },
      { id: "proliferation", label: "细胞增殖", x: 360, y: 410, w: 80, h: 30, fill: "#7c3aed", textColor: "#ffffff" },
    ],
    edges: [
      { from: "gf", to: "rtk", type: "activation", label: "" },
      { from: "rtk", to: "ras", type: "activation", label: "" },
      { from: "ras", to: "raf", type: "activation", label: "" },
      { from: "raf", to: "mek", type: "phosphorylation", label: "" },
      { from: "mek", to: "erk", type: "phosphorylation", label: "" },
      { from: "erk", to: "tf", type: "activation", label: "" },
      { from: "erk", to: "proliferation", type: "activation", label: "" },
    ],
  },
  glycolysis: {
    name: "糖酵解",
    nodes: [
      { id: "glucose", label: "葡萄糖", x: 320, y: 20, w: 70, h: 30, fill: "#f59e0b", textColor: "#ffffff" },
      { id: "g6p", label: "G-6-P", x: 120, y: 120, w: 70, h: 30, fill: "#2563eb", textColor: "#ffffff" },
      { id: "f6p", label: "F-6-P", x: 250, y: 120, w: 70, h: 30, fill: "#2563eb", textColor: "#ffffff" },
      { id: "fbp", label: "F-1,6-BP", x: 380, y: 120, w: 85, h: 30, fill: "#2563eb", textColor: "#ffffff" },
      { id: "gap", label: "GAP", x: 100, y: 240, w: 70, h: 30, fill: "#7c3aed", textColor: "#ffffff" },
      { id: "dhap", label: "DHAP", x: 250, y: 240, w: 70, h: 30, fill: "#7c3aed", textColor: "#ffffff" },
      { id: "pyruvate", label: "丙酮酸", x: 175, y: 350, w: 70, h: 30, fill: "#059669", textColor: "#ffffff" },
      { id: "atp", label: "ATP", x: 350, y: 350, w: 60, h: 30, fill: "#dc2626", textColor: "#ffffff" },
    ],
    edges: [
      { from: "glucose", to: "g6p", type: "activation", label: "" },
      { from: "g6p", to: "f6p", type: "activation", label: "" },
      { from: "f6p", to: "fbp", type: "phosphorylation", label: "" },
      { from: "fbp", to: "gap", type: "activation", label: "" },
      { from: "fbp", to: "dhap", type: "activation", label: "" },
      { from: "gap", to: "pyruvate", type: "activation", label: "" },
      { from: "dhap", to: "pyruvate", type: "activation", label: "" },
      { from: "pyruvate", to: "atp", type: "activation", label: "" },
    ],
  },
  "dna-repair": {
    name: "DNA 修复",
    nodes: [
      { id: "damage", label: "DNA 损伤", x: 320, y: 30, w: 80, h: 30, fill: "#9ca3af", textColor: "#ffffff" },
      { id: "atm", label: "ATM", x: 180, y: 130, w: 60, h: 30, fill: "#2563eb", textColor: "#ffffff" },
      { id: "atr", label: "ATR", x: 360, y: 130, w: 60, h: 30, fill: "#2563eb", textColor: "#ffffff" },
      { id: "chk1", label: "Chk1", x: 360, y: 230, w: 60, h: 30, fill: "#2563eb", textColor: "#ffffff" },
      { id: "chk2", label: "Chk2", x: 180, y: 230, w: 60, h: 30, fill: "#2563eb", textColor: "#ffffff" },
      { id: "p53-repair", label: "p53", x: 90, y: 330, w: 60, h: 30, fill: "#059669", textColor: "#ffffff" },
      { id: "cdc25", label: "Cdc25", x: 270, y: 330, w: 70, h: 30, fill: "#dc2626", textColor: "#ffffff" },
      { id: "repair", label: "DNA 修复", x: 200, y: 420, w: 80, h: 30, fill: "#059669", textColor: "#ffffff" },
      { id: "arrest", label: "周期阻滞", x: 370, y: 420, w: 80, h: 30, fill: "#f59e0b", textColor: "#ffffff" },
    ],
    edges: [
      { from: "damage", to: "atm", type: "activation", label: "" },
      { from: "damage", to: "atr", type: "activation", label: "" },
      { from: "atm", to: "chk2", type: "phosphorylation", label: "" },
      { from: "atr", to: "chk1", type: "phosphorylation", label: "" },
      { from: "chk2", to: "p53-repair", type: "activation", label: "" },
      { from: "chk1", to: "cdc25", type: "inhibition", label: "" },
      { from: "p53-repair", to: "repair", type: "activation", label: "" },
      { from: "cdc25", to: "arrest", type: "inhibition", label: "" },
    ],
  },
};

interface ChatMessage {
  role: "ai" | "user";
  content: string;
}

const initialChat: ChatMessage[] = [
  {
    role: "ai",
    content:
      "这是细胞周期的调控通路。Cyclin D 与 CDK4/6 结合后磷酸化 Rb 蛋白，释放转录因子 E2F，推动细胞进入 S 期。p53 作为关键的抑癌蛋白，在 DNA 损伤时被激活，进而上调 p21 表达。p21 抑制 CDK2/Cyclin E 复合物，阻止细胞周期进程。",
  },
  {
    role: "user",
    content: "如果 p53 发生突变会怎样？",
  },
  {
    role: "ai",
    content:
      "p53 突变后无法正常激活 p21 转录，失去了对细胞周期的刹车作用。DNA 损伤的细胞可能继续分裂，积累更多突变，这是许多癌症的共同特征。超过 50% 的人类肿瘤中存在 p53 突变。你可以看到通路图中 p53→p21 的箭头路径被打断了（高亮显示）。",
  },
];

function getNodeCenter(n: NodeData): { cx: number; cy: number } {
  return { cx: n.x + n.w / 2, cy: n.y + n.h / 2 };
}

function drawEdge(fromNode: NodeData, toNode: NodeData, type: EdgeData["type"]) {
  const from = getNodeCenter(fromNode);
  const to = getNodeCenter(toNode);

  const dx = to.cx - from.cx;
  const dy = to.cy - from.cy;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return null;

  const ux = dx / len;
  const uy = dy / len;

  const nodeRadius = 18;

  const x1 = from.cx + ux * nodeRadius;
  const y1 = from.cy + uy * nodeRadius;
  const x2 = to.cx - ux * nodeRadius;
  const y2 = to.cy - uy * nodeRadius;

  if (type === "inhibition") {
    const tBarLen = 8;
    const perpX = -uy * tBarLen;
    const perpY = ux * tBarLen;

    return (
      <g key={`${fromNode.id}-${toNode.id}`}>
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#dc2626"
          strokeWidth="2"
        />
        <line
          x1={to.cx - ux * (nodeRadius + 2)}
          y1={to.cy - uy * (nodeRadius + 2)}
          x2={to.cx - ux * (nodeRadius + 2) + perpX}
          y2={to.cy - uy * (nodeRadius + 2) + perpY}
          stroke="#dc2626"
          strokeWidth="2"
        />
        <line
          x1={to.cx - ux * (nodeRadius + 2)}
          y1={to.cy - uy * (nodeRadius + 2)}
          x2={to.cx - ux * (nodeRadius + 2) - perpX}
          y2={to.cy - uy * (nodeRadius + 2) - perpY}
          stroke="#dc2626"
          strokeWidth="2"
        />
      </g>
    );
  }

  const arrowSize = 8;
  const ax = x2 - ux * arrowSize;
  const ay = y2 - uy * arrowSize;

  const perpX = -uy * 5;
  const perpY = ux * 5;

  const strokeColor = type === "phosphorylation" ? "#7c3aed" : "#6b7280";

  return (
    <g key={`${fromNode.id}-${toNode.id}`}>
      <line
        x1={x1}
        y1={y1}
        x2={ax}
        y2={ay}
        stroke={strokeColor}
        strokeWidth="2"
      />
      <polygon
        points={`${x2},${y2} ${ax + perpX},${ay + perpY} ${ax - perpX},${ay - perpY}`}
        fill={strokeColor}
      />
      {type === "phosphorylation" && (
        <text
          x={from.cx + dx * 0.45}
          y={from.cy + dy * 0.45 - 6}
          textAnchor="middle"
          fontSize="14"
          fill="#7c3aed"
          fontWeight="bold"
        >
          ⊕
        </text>
      )}
    </g>
  );
}

export default function PathwayPage() {
  const [selectedPathway, setSelectedPathway] = useState("cell-cycle");
  const [searchTerm, setSearchTerm] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [quizOpen, setQuizOpen] = useState(false);

  const pathwayKeys = Object.keys(pathways);
  const filteredKeys = searchTerm
    ? pathwayKeys.filter((k) =>
        pathways[k].name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : pathwayKeys;

  const currentPathway = pathways[selectedPathway] || pathways["cell-cycle"];

  return (
    <div className="flex h-[calc(100vh-var(--header-height)-2rem)] gap-4">
      <div className="flex-[3] flex flex-col gap-4 min-w-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={selectedPathway}
              onChange={(e) => setSelectedPathway(e.target.value)}
              className="select pr-8 text-sm"
            >
              {filteredKeys.map((k) => (
                <option key={k} value={k}>
                  {pathways[k].name}
                </option>
              ))}
            </select>
            <ChevronDown
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af] pointer-events-none"
            />
          </div>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9ca3af]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索通路..."
              className="input pl-9 text-xs py-2"
            />
          </div>
        </div>

        <div
          className="card flex-1 flex items-center justify-center min-h-0 overflow-hidden"
          style={{ background: "#1e1f24" }}
        >
          <svg viewBox="0 0 640 480" className="w-full h-full max-w-[640px]">
            {currentPathway.edges.map((edge) => {
              const fromNode = currentPathway.nodes.find((n) => n.id === edge.from)!;
              const toNode = currentPathway.nodes.find((n) => n.id === edge.to)!;
              if (!fromNode || !toNode) return null;
              return drawEdge(fromNode, toNode, edge.type);
            })}

            {currentPathway.nodes.map((node) => (
              <g key={node.id}>
                <rect
                  x={node.x}
                  y={node.y}
                  width={node.w}
                  height={node.h}
                  rx="8"
                  ry="8"
                  fill={node.fill}
                  opacity="0.95"
                />
                <text
                  x={node.x + node.w / 2}
                  y={node.y + node.h / 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="12"
                  fill={node.textColor}
                  fontWeight={600}
                  fontFamily="system-ui, sans-serif"
                >
                  {node.label}
                </text>
              </g>
            ))}
          </svg>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-[#6b7280] px-1">
          <span className="flex items-center gap-1.5">
            <ArrowRight className="w-3 h-3" />
            激活
          </span>
          <span className="flex items-center gap-1.5">
            <Minus className="w-3 h-3" style={{ color: "#dc2626" }} />
            <span style={{ color: "#dc2626" }}>抑制</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-sm font-bold" style={{ color: "#7c3aed" }}>⊕</span>
            <span>磷酸化</span>
          </span>
        </div>

        <div className="card">
          <button
            onClick={() => setQuizOpen(!quizOpen)}
            className="w-full p-4 flex items-center justify-between text-left"
          >
            <span className="text-xs font-medium text-[#1a1a1a]">
              CDK 抑制剂会导致细胞周期阻滞在哪个阶段？为什么？
            </span>
            {quizOpen ? (
              <ChevronUp className="w-4 h-4 text-[#9ca3af]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#9ca3af]" />
            )}
          </button>
          {quizOpen && (
            <div className="px-4 pb-4">
              <div
                className="p-3 rounded-lg text-xs text-[#6b7280] leading-relaxed"
                style={{
                  background: "rgba(37, 99, 235, 0.04)",
                  border: "1px solid rgba(37, 99, 235, 0.1)",
                }}
              >
                CDK 抑制剂主要导致细胞周期阻滞在 G1/S 检查点。因为 Cyclin D-CDK4/6 复合物负责磷酸化
                Rb 释放 E2F，启动 S 期基因转录。CDK4/6 抑制剂阻止了这一过程，使 Rb 保持未磷酸化状态，
                继续抑制 E2F 活性，细胞无法进入 S 期。
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-[2] card flex flex-col min-w-0">
        <div className="p-4" style={{ borderBottom: "1px solid #e5e5e7" }}>
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(37, 99, 235, 0.1)" }}
            >
              <Sparkles className="w-3.5 h-3.5" style={{ color: "#2563eb" }} />
            </div>
            <span className="text-sm font-medium text-[#1a1a1a]">AI 助手</span>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-4">
          {initialChat.map((msg, i) => (
            <div key={i} className="flex gap-3">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background:
                    msg.role === "ai"
                      ? "rgba(37, 99, 235, 0.1)"
                      : "rgba(5, 150, 105, 0.1)",
                }}
              >
                {msg.role === "ai" ? (
                  <Sparkles className="w-3.5 h-3.5" style={{ color: "#2563eb" }} />
                ) : (
                  <User className="w-3.5 h-3.5" style={{ color: "#059669" }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] text-[#9ca3af] mb-1">
                  {msg.role === "ai" ? "AI 助手" : "你"}
                </div>
                <div className="text-xs text-[#1a1a1a] leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4" style={{ borderTop: "1px solid #e5e5e7" }}>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="输入你的问题..."
              className="input flex-1 text-xs py-2"
            />
            <button className="btn-primary p-2.5">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
