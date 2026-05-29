export interface KnowledgeModuleLink {
  label: string;
  href: string;
}

export interface KnowledgeChildNode {
  id: string;
  label: string;
  summary: string;
  keyPoints: string[];
  importance: string;
  nextStep: string;
  moduleLinks: KnowledgeModuleLink[];
}

export interface KnowledgeDimension {
  id: string;
  label: string;
  accent: string;
  short: string;
  summary: string;
  children: KnowledgeChildNode[];
}

export interface KnowledgeDiscipline {
  id: string;
  label: string;
  group: string;
  summary: string;
  featured: boolean;
  color: string;
  x: number;
  y: number;
  related: string[];
  dimensions: KnowledgeDimension[];
}

export interface KnowledgePathItem {
  id: string;
  label: string;
  type: "discipline" | "dimension" | "node";
}

export const featuredDisciplineIds: string[];
export const knowledgeDimensions: Array<Pick<KnowledgeDimension, "id" | "label" | "accent" | "short">>;
export const knowledgeDisciplines: KnowledgeDiscipline[];

export function getDisciplineById(id: string): KnowledgeDiscipline;
export function findKnowledgeNode(
  disciplineId: string,
  nodeId: string,
): KnowledgeDiscipline | KnowledgeDimension | KnowledgeChildNode | undefined;
export function getKnowledgePath(disciplineId: string, nodeId: string): KnowledgePathItem[];
export function getGalaxyEdges(): Array<{ from: string; to: string }>;
export function getDimensionById(id: string): Pick<KnowledgeDimension, "id" | "label" | "accent" | "short">;
