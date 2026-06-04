"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Compass, RotateCcw, Sparkles, BookOpen, FlaskConical } from "lucide-react";

import { findMindMapNode, findMindMapPath, mindMapRoot, type MindMapNode, type MindMapStatus } from "@/lib/mindmap-data";
import { knowledgePapers, knowledgeResearchTasks, getConceptById } from "@/data/knowledgeBase";
import { getResearchTasksByConcept } from "@/lib/knowledgeSearch";

const nodeVisualStyles: Record<MindMapStatus, { color: string; bg: string }> = {
  mastered: { color: "#2563eb", bg: "rgba(37,99,235,.1)" },
  review: { color: "#d97706", bg: "rgba(245,158,11,.12)" },
  weak: { color: "#e11d48", bg: "rgba(244,63,94,.12)" },
  recommended: { color: "#059669", bg: "rgba(5,150,105,.12)" },
  new: { color: "#64748b", bg: "rgba(100,116,139,.1)" },
};

interface PositionedNode {
  node: MindMapNode;
  x: number;
  y: number;
  level: number;
  parentId?: string;
}

/** 思维导图节点到知识库概念ID的映射 */
const nodeToConceptMap: Record<string, string> = {
  "crispr-cas": "conc-004",
  "cell-cycle": "conc-003",
  "apoptosis": "conc-012",
  "plasmid-vector": "conc-004",
  "protein-basic": "conc-005",
  "gene-regulation": "conc-003",
  "central-dogma": "conc-003",
  "dna": "conc-003",
};

/** 获取节点关联的知识库文献和任务 */
function getNodeRecommendations(nodeId: string): {
  papers: { id: string; title: string; titleZh: string; venue: string; year: number }[];
  tasks: { id: string; title: string; difficulty: string }[];
} {
  const conceptId = nodeToConceptMap[nodeId];
  if (!conceptId) {
    // 尝试从全局概念中模糊匹配
    const allConcepts = [getConceptById("conc-004"), getConceptById("conc-007"), getConceptById("conc-001")].filter(Boolean);
    const papers = allConcepts.flatMap((c) =>
      c!.relatedPaperIds.map((pid) => {
        const p = knowledgePapers.find((pp) => pp.id === pid);
        return p ? { id: p.id, title: p.title, titleZh: p.titleZh, venue: p.venue, year: p.year } : null;
      }).filter(Boolean),
    ).slice(0, 3) as { id: string; title: string; titleZh: string; venue: string; year: number }[];
    return { papers: papers.slice(0, 3), tasks: [] };
  }
  const concept = getConceptById(conceptId);
  if (!concept) return { papers: [], tasks: [] };

  const papers = concept.relatedPaperIds
    .map((pid) => {
      const p = knowledgePapers.find((pp) => pp.id === pid);
      return p ? { id: p.id, title: p.title, titleZh: p.titleZh, venue: p.venue, year: p.year } : null;
    })
    .filter(Boolean)
    .slice(0, 3) as { id: string; title: string; titleZh: string; venue: string; year: number }[];

  const tasks = getResearchTasksByConcept(conceptId)
    .slice(0, 2)
    .map((t) => ({ id: t.id, title: t.title, difficulty: t.difficulty }));

  return { papers, tasks };
}

export default function MindMapPage() {
  const initialNode = mindMapRoot.children?.[0]?.id || mindMapRoot.id;
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set([mindMapRoot.id, initialNode]));
  const [selectedId, setSelectedId] = useState(initialNode);

  useEffect(() => {
    const topic = new URLSearchParams(window.location.search).get("topic");
    const nodeId = topicToNode(topic);
    if (nodeId) {
      setExpanded(new Set([mindMapRoot.id, nodeId]));
      setSelectedId(nodeId);
    }
  }, []);

  const selectedNode = findMindMapNode(selectedId) || mindMapRoot;
  const focusedPath = findMindMapPath(selectedId).map((node) => node.id);
  const positioned = useMemo(() => layoutNodes(expanded), [expanded]);
  const edges = useMemo(() => positioned.filter((item) => item.parentId), [positioned]);
  const recommendations = useMemo(() => getNodeRecommendations(selectedId), [selectedId]);

  const toggleNode = (node: MindMapNode) => {
    setSelectedId(node.id);
    if (node.children?.length) {
      setExpanded((current) => {
        const next = new Set(current);
        if (next.has(node.id) && node.id !== mindMapRoot.id) next.delete(node.id);
        else next.add(node.id);
        return next;
      });
    }
  };

  return (
    <div className="min-h-screen pt-[var(--nav-height)] px-6 md:px-10 pb-12 font-body">
      <div className="max-w-7xl mx-auto pt-8 space-y-6">
        <header className="liquid-card p-6 md:p-8 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
          <div>
            <p className="section-title">BioMind Map</p>
            <h1 className="font-display text-3xl md:text-5xl font-black tracking-[-0.05em] text-[#111827]">渐进展开式思维导图</h1>
            <p className="mt-4 max-w-3xl text-brand-muted leading-relaxed">
              初始只展示一级主题，点击节点逐步展开子节点；详细解释、推荐工具、下一步以及前沿文献和科研任务推荐放在右侧面板。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/knowledge-map" className="rounded-2xl bg-white/55 border border-white/80 px-4 py-2.5 text-sm font-bold text-brand-muted hover:text-[#111827]">返回知识图谱</Link>
            <button onClick={() => { setExpanded(new Set([mindMapRoot.id])); setSelectedId(mindMapRoot.id); }} className="inline-flex items-center gap-2 rounded-2xl bg-[#111827] px-4 py-2.5 text-sm font-bold text-white">
              <RotateCcw className="w-4 h-4" /> 重置视图
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-[220px_minmax(760px,1fr)_340px] gap-6">
          <aside className="liquid-card p-4 h-fit xl:sticky xl:top-24">
            <div className="flex items-center gap-2 mb-4"><Compass className="w-4 h-4 text-accent-electric" /><span className="font-display font-bold text-[#111827]">主题目录</span></div>
            <div className="space-y-2">
              {(mindMapRoot.children || []).map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => { setExpanded(new Set([mindMapRoot.id, topic.id])); setSelectedId(topic.id); }}
                  className={`w-full text-left rounded-2xl px-3 py-3 text-sm font-semibold transition-all ${selectedId === topic.id || focusedPath.includes(topic.id) ? "bg-[#111827] text-white" : "bg-white/45 border border-white/70 text-brand-muted hover:bg-white/80 hover:text-[#111827]"}`}
                >
                  {topic.label}
                </button>
              ))}
            </div>
          </aside>

          <main className="liquid-card relative min-h-[740px] overflow-hidden">
            <div className="absolute inset-0 liquid-hero-bg opacity-70" />
            <div className="bio-network" />
            <svg viewBox="0 0 980 760" className="relative z-10 w-full h-full min-h-[740px]">
              <defs>
                <filter id="mind-node-glow"><feDropShadow dx="0" dy="8" stdDeviation="10" floodOpacity="0.18" /></filter>
              </defs>
              {edges.map((edge) => {
                const parent = positioned.find((item) => item.node.id === edge.parentId);
                if (!parent) return null;
                const active = focusedPath.includes(edge.node.id) && focusedPath.includes(parent.node.id);
                const midX = (parent.x + edge.x) / 2 + (parent.y - edge.y) * 0.06;
                const midY = (parent.y + edge.y) / 2 + (edge.x - parent.x) * 0.04;
                return (
                  <path
                    key={`${edge.parentId}-${edge.node.id}`}
                    d={`M ${parent.x} ${parent.y} Q ${midX} ${midY} ${edge.x} ${edge.y}`}
                    stroke={active ? "#2563eb" : "rgba(100,116,139,.22)"}
                    strokeWidth={active ? 2.6 : 1.2}
                    strokeLinecap="round"
                    fill="none"
                    opacity={active ? 0.9 : 0.42}
                  />
                );
              })}
              {positioned.map((item) => {
                const active = item.node.id === selectedId;
                const inPath = focusedPath.includes(item.node.id);
                const status = nodeVisualStyles[item.node.status];
                const dimmed = focusedPath.length > 1 && !inPath && item.level > 0;
                const width = item.level === 0 ? 168 : item.level === 1 ? 154 : 126;
                const height = item.level === 0 ? 58 : item.level === 1 ? 50 : 42;
                const labelLines = splitMindLabel(item.node.label, item.level === 2 ? 7 : 8);
                return (
                  <g key={item.node.id} onClick={() => toggleNode(item.node)} className="cursor-pointer" opacity={dimmed ? 0.32 : 1}>
                    <rect x={item.x - width / 2} y={item.y - height / 2} width={width} height={height} rx={height / 2} fill={active ? "#111827" : "rgba(255,255,255,.78)"} stroke={active || inPath ? status.color : "rgba(255,255,255,.95)"} strokeWidth={active ? 3 : 1.5} filter="url(#mind-node-glow)" />
                    <text x={item.x} y={item.y - (labelLines.length - 1) * 6 + 4} textAnchor="middle" fill={active ? "#ffffff" : "#111827"} fontSize={item.level === 2 ? 10.5 : 12} fontWeight="800" fontFamily="system-ui, sans-serif">
                      {labelLines.map((line, lineIndex) => (
                        <tspan key={`${item.node.id}-${lineIndex}`} x={item.x} dy={lineIndex === 0 ? 0 : 13}>
                          {line}
                        </tspan>
                      ))}
                    </text>
                    {item.node.children?.length ? <circle cx={item.x + width / 2 - 14} cy={item.y - height / 2 + 12} r="5" fill={expanded.has(item.node.id) ? status.color : "#cbd5e1"} /> : null}
                  </g>
                );
              })}
            </svg>
          </main>

          <aside className="liquid-card p-5 h-fit xl:sticky xl:top-24">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ color: nodeVisualStyles[selectedNode.status].color, background: nodeVisualStyles[selectedNode.status].bg }}><Sparkles className="w-4 h-4" /></div>
              <div><div className="text-[11px] font-bold text-brand-faint">节点详情</div><div className="font-display font-bold text-[#111827]">{selectedNode.label}</div></div>
            </div>
            <p className="text-sm text-brand-muted leading-relaxed mb-5">{selectedNode.summary}</p>
            <div className="space-y-4">
              <Panel title="需要掌握">
                <ul className="list-disc pl-4 space-y-1">{selectedNode.keyPoints.map((point) => <li key={point}>{point}</li>)}</ul>
              </Panel>
              <Panel title="推荐练习">{selectedNode.practice}</Panel>
              <Panel title="下一步">{selectedNode.next}</Panel>
              {selectedNode.tool && (
                <Link href={selectedNode.tool.href} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#111827] px-4 py-3 text-sm font-bold text-white hover:bg-[#1f2937] transition-all">
                  {selectedNode.tool.label}<ChevronRight className="w-4 h-4" />
                </Link>
              )}

              {/* 前沿文献推荐 */}
              {recommendations.papers.length > 0 && (
                <Panel title="前沿文献推荐">
                  <div className="space-y-2">
                    {recommendations.papers.map((paper) => (
                      <Link
                        key={paper.id}
                        href={`/seminar?source=${encodeURIComponent("思维导图文献")}&topic=${encodeURIComponent(`${paper.titleZh} 文献答辩`)}&summary=${encodeURIComponent(`${paper.venue} ${paper.year}。${paper.title}`)}`}
                        className="block p-2.5 rounded-xl bg-white/60 border border-white/70 hover:border-accent-electric/20 transition-all"
                      >
                        <div className="flex items-start gap-2">
                          <BookOpen className="w-3.5 h-3.5 text-accent-electric shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-semibold text-[#111827] leading-snug">{paper.titleZh}</p>
                            <p className="text-[10px] text-brand-faint">{paper.venue} · {paper.year}</p>
                            <p className="mt-1 text-[10px] font-bold text-accent-electric">导入答辩</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </Panel>
              )}

              {/* 推荐科研任务 */}
              {recommendations.tasks.length > 0 && (
                <Panel title="推荐科研任务">
                  <div className="space-y-2">
                    {recommendations.tasks.map((task) => (
                      <Link
                        key={task.id}
                        href="/research"
                        className="block p-2.5 rounded-xl bg-white/60 border border-white/70 hover:border-accent-electric/20 transition-all"
                      >
                        <div className="flex items-start gap-2">
                          <FlaskConical className="w-3.5 h-3.5 text-accent-cyan shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-semibold text-[#111827] leading-snug">{task.title}</p>
                            <p className="text-[10px] text-brand-faint">难度：{task.difficulty}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </Panel>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return <div className="rounded-3xl bg-white/45 border border-white/70 p-4 text-sm text-brand-muted leading-relaxed"><div className="font-semibold text-[#111827] mb-2">{title}</div>{children}</div>;
}

function layoutNodes(expanded: Set<string>): PositionedNode[] {
  const items: PositionedNode[] = [{ node: mindMapRoot, x: 490, y: 380, level: 0 }];
  const primary = mindMapRoot.children || [];
  primary.forEach((node, index) => {
    const angleDeg = -90 + (360 / primary.length) * index;
    const angle = angleDeg * Math.PI / 180;
    const directionX = Math.cos(angle);
    const directionY = Math.sin(angle);
    const x = 490 + Math.cos(angle) * 270;
    const y = 380 + Math.sin(angle) * 250;
    items.push({ node, x, y, level: 1, parentId: mindMapRoot.id });
    if (expanded.has(node.id) && node.children?.length) {
      const tangentX = -directionY;
      const tangentY = directionX;
      const isTopOrBottom = Math.abs(directionY) > 0.72;
      const childSpacing = isTopOrBottom ? 148 : 92;
      const outerDistance = isTopOrBottom ? 130 : 154;
      node.children.forEach((child, childIndex) => {
        const offset = (childIndex - (node.children!.length - 1) / 2) * childSpacing;
        items.push({
          node: child,
          x: clampMindPoint(x + directionX * outerDistance + tangentX * offset, 78, 902),
          y: clampMindPoint(y + directionY * outerDistance + tangentY * offset, 70, 690),
          level: 2,
          parentId: node.id,
        });
      });
    }
  });
  return items;
}

function clampMindPoint(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function splitMindLabel(label: string, maxChars: number): string[] {
  const text = String(label || "").trim();
  if (text.length <= maxChars) return [text];
  const chunks: string[] = [];
  let current = "";
  for (const char of text) {
    const next = `${current}${char}`;
    if (next.length > maxChars && current) {
      chunks.push(current);
      current = char;
    } else {
      current = next;
    }
  }
  if (current) chunks.push(current);
  return chunks.slice(0, 2);
}

function topicToNode(topic: string | null) {
  if (!topic) return null;
  const map: Record<string, string> = {
    "cell-cycle": "pathway-regulation",
    apoptosis: "pathway-regulation",
    mapk: "pathway-regulation",
    glycolysis: "pathway-regulation",
    "dna-repair": "pathway-regulation",
    protein: "protein-structure",
    plasmid: "synthetic-tools",
    sequence: "sequence-design",
  };
  return findMindMapNode(topic)?.id || map[topic] || null;
}
