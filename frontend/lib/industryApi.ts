import type { IndustryCase, IndustryAnswer } from "@/data/industryCases";
import { industryCases as mockCases, getMockAnswer } from "@/data/industryCases";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const response = await fetch(path, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export interface ApiIndustryCase {
  id: number;
  case_key: string;
  title: string;
  subtitle: string;
  industry_direction: string;
  category: string;
  real_product_or_technology: string;
  background: string;
  core_problem: string;
  research_foundation: string;
  application_value: string;
  knowledge_points: string[];
  required_abilities: string[];
  guide_questions: string[];
  recommended_keywords: string[];
  linked_research_task: string;
  evidence_level: string;
  source_type: string;
  application_scenario: string;
  display_focus: string;
  analysis_text: string;
  migration_path: {
    textbookBase: string[];
    researchFrontier: string[];
    industryApplication: string[];
  };
  references: Array<{ title: string; url: string; type: string }>;
  source_urls: string[];
}

export function convertApiCaseToFrontend(apiCase: ApiIndustryCase): IndustryCase {
  return {
    id: apiCase.case_key,
    title: apiCase.title,
    subtitle: apiCase.subtitle,
    category: apiCase.category || "",
    realProductOrTechnology: apiCase.real_product_or_technology || "",
    relatedKnowledgePoints: apiCase.knowledge_points || [],
    industryDirection: apiCase.industry_direction,
    coreProblem: apiCase.core_problem,
    researchFoundation: apiCase.research_foundation,
    applicationValue: apiCase.application_value,
    requiredAbilities: apiCase.required_abilities || [],
    recommendedKeywords: apiCase.recommended_keywords || [],
    guideQuestions: apiCase.guide_questions || [],
    linkedResearchTask: apiCase.linked_research_task,
    evidenceLevel: apiCase.evidence_level === "high" ? "高" : apiCase.evidence_level === "medium" ? "中" : "发展中",
    sourceType: apiCase.source_type === "academic" ? "学术文献" : apiCase.source_type === "clinical_trial" ? "临床试验" : apiCase.source_type === "patent" ? "专利文献" : apiCase.source_type === "regulatory" ? "监管文件" : apiCase.source_type === "product_page" ? "产品页" : "产业报告",
    background: apiCase.background,
    applicationScenario: apiCase.application_scenario,
    displayFocus: apiCase.display_focus,
    notes: apiCase.analysis_text || "",
    migrationPath: apiCase.migration_path || { textbookBase: [], researchFrontier: [], industryApplication: [] },
    references: Array.isArray(apiCase.references) ? apiCase.references.map(r => ({
      title: r.title,
      url: r.url,
      type: r.type as "FDA" | "PubMed" | "DOI" | "NCI" | "Label" | "Review" | "ProductPage" | "Other",
    })) : [],
    sourceUrls: apiCase.source_urls || [],
  };
}

export async function fetchIndustryCases(): Promise<(IndustryCase & { _dataSource?: string })[]> {
  const data = await apiFetch<{ items: ApiIndustryCase[] }>("/api/industry/cases?page_size=100");
  if (data?.items && data.items.length > 0) {
    return data.items.map(c => ({ ...convertApiCaseToFrontend(c), _dataSource: "api" }));
  }
  return mockCases.map(c => ({ ...c, _dataSource: "local_fallback" }));
}

export async function searchIndustryCases(query: string): Promise<(IndustryCase & { _dataSource?: string })[]> {
  const data = await apiFetch<ApiIndustryCase[]>(`/api/industry/cases/search?q=${encodeURIComponent(query)}`);
  if (data && data.length > 0) {
    return data.map(c => ({ ...convertApiCaseToFrontend(c), _dataSource: "api" }));
  }
  const lower = query.toLowerCase();
  const aliasMap: Record<string, string[]> = {
    "case-002": ["car-t", "cart", "嵌合抗原受体", "t 细胞", "t细胞"],
    "case-004": ["mrna", "lnp", "脂质纳米"],
    "case-003": ["crispr", "基因编辑"],
    "case-006": ["pd-1", "pd-l1", "免疫检查点"],
    "case-001": ["venetoclax", "bcl-2", "细胞凋亡"],
    "case-035": ["alphafold", "蛋白结构预测", "结构预测"],
    "case-036": ["培养细胞食品", "cultured meat", "upside", "培养动物细胞"],
  };
  return mockCases
    .filter(c => (aliasMap[c.id] || []).some(alias => lower.includes(alias.toLowerCase())) || c.title.toLowerCase().includes(lower) || c.industryDirection.toLowerCase().includes(lower) || c.category.toLowerCase().includes(lower) || c.relatedKnowledgePoints.some(k => k.toLowerCase().includes(lower)) || c.recommendedKeywords.some(k => k.toLowerCase().includes(lower)) || c.coreProblem.toLowerCase().includes(lower))
    .map(c => ({ ...c, _dataSource: "local_fallback" }));
}

export async function getIndustryAnswer(query: string): Promise<IndustryAnswer> {
  try {
    const response = await fetch("/api/industry/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    if (response.ok) {
      const data = await response.json();
      if (!data.error) {
        return {
          query: data.query,
          answer: data.answer,
          relatedKnowledgePoints: data.relatedKnowledgePoints || [],
          researchFrontiers: data.researchFrontiers || [],
          industryApplications: data.industryApplications || [],
          abilityDirections: [],
          recommendedKeywords: data.recommendedKeywords || [],
          researchTasks: [],
          _dataSource: "api" as const,
        };
      }
    }
  } catch {
    // API down, fallback
  }
  return { ...getMockAnswer(query), _dataSource: "local_fallback" as const };
}

export async function getIndustryCaseById(caseId: string): Promise<(IndustryCase & { _dataSource?: string }) | null> {
  const data = await apiFetch<ApiIndustryCase>(`/api/industry/cases/${caseId}`);
  if (data) {
    return { ...convertApiCaseToFrontend(data), _dataSource: "api" as const };
  }
  const found = mockCases.find((c) => c.id === caseId);
  return found ? { ...found, _dataSource: "local_fallback" as const } : null;
}

export async function getRelatedResearchTasks(caseId: string): Promise<{ tasks: string[]; _dataSource?: string }> {
  const data = await apiFetch<{ tasks: string[] }>(`/api/industry/cases/${caseId}/research-tasks`);
  if (data?.tasks) {
    return { tasks: data.tasks, _dataSource: "api" as const };
  }
  const found = mockCases.find((c) => c.id === caseId);
  return { tasks: found ? [found.linkedResearchTask] : [], _dataSource: "local_fallback" as const };
}
