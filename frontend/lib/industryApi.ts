import { industryCases as mockCases, getMockAnswer, type IndustryAnswer, type IndustryCase } from "@/data/industryCases";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

const industryAliasMap: Record<string, string[]> = {
  "case-002": ["car-t", "cart", "嵌合抗原受体", "t 细胞", "t细胞"],
  "case-004": ["mrna", "lnp", "脂质纳米", "递送"],
  "case-003": ["crispr", "基因编辑"],
  "case-006": ["pd-1", "pd-l1", "免疫检查点"],
  "case-001": ["venetoclax", "bcl-2", "细胞凋亡"],
  "case-035": ["alphafold", "蛋白结构预测", "结构预测"],
  "case-036": ["培养细胞食品", "cultured meat", "upside", "培养动物细胞"],
};

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function localCaseSearch(query: string): (IndustryCase & { _dataSource?: string })[] {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) {
    return mockCases.map((item) => ({ ...item, _dataSource: "local_fallback" }));
  }

  return mockCases
    .filter((item) => {
      const aliases = industryAliasMap[item.id] || [];
      const text = normalizeText([
        item.title,
        item.subtitle,
        item.category,
        item.industryDirection,
        item.realProductOrTechnology,
        item.coreProblem,
        item.background,
        ...(item.relatedKnowledgePoints || []),
        ...(item.recommendedKeywords || []),
        ...(item.guideQuestions || []),
      ].filter(Boolean).join(" "));
      return text.includes(normalizedQuery) || aliases.some((alias) => normalizedQuery.includes(alias) || text.includes(alias));
    })
    .map((item) => ({ ...item, _dataSource: "local_fallback" }));
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

function mapEvidenceLevel(value: string): IndustryCase["evidenceLevel"] {
  if (value === "high") return "高";
  if (value === "medium") return "中";
  return "发展中";
}

function mapSourceType(value: string): IndustryCase["sourceType"] {
  if (value === "academic") return "学术文献";
  if (value === "clinical_trial") return "临床试验";
  if (value === "patent") return "专利文献";
  if (value === "regulatory") return "监管文件";
  if (value === "product_page") return "产品页";
  return "产业报告";
}

function mapSourceScope(value: string | undefined): IndustryAnswer["sourceScope"] {
  if (value === "based_on_local_cases" || value === "extended_reasoning" || value === "no_direct_match") {
    return value;
  }
  return undefined;
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
    evidenceLevel: mapEvidenceLevel(apiCase.evidence_level),
    sourceType: mapSourceType(apiCase.source_type),
    background: apiCase.background,
    applicationScenario: apiCase.application_scenario,
    displayFocus: apiCase.display_focus,
    notes: apiCase.analysis_text || "",
    migrationPath: apiCase.migration_path || { textbookBase: [], researchFrontier: [], industryApplication: [] },
        references: Array.isArray(apiCase.references)
      ? apiCase.references.map((item) => ({
          title: item.title,
          url: item.url,
          type: item.type as "FDA" | "PubMed" | "DOI" | "NCI" | "Label" | "Review" | "ProductPage" | "Other",
        }))
      : [],
    sourceUrls: apiCase.source_urls || [],
  };
}

export async function fetchIndustryCases(): Promise<(IndustryCase & { _dataSource?: string })[]> {
  try {
    const data = await apiFetch<{ items: ApiIndustryCase[] }>("/api/industry/cases?page_size=100");
    if (Array.isArray(data.items) && data.items.length > 0) {
      return (data.items || []).map((item) => ({ ...convertApiCaseToFrontend(item), _dataSource: "api" }));
    }
  } catch {
    // Fall through to the curated local case library.
  }
  return mockCases.map((item) => ({ ...item, _dataSource: "local_fallback" }));
}

export async function searchIndustryCases(query: string): Promise<(IndustryCase & { _dataSource?: string })[]> {
  try {
    const data = await apiFetch<ApiIndustryCase[]>(`/api/industry/cases/search?q=${encodeURIComponent(query)}`);
    if (Array.isArray(data) && data.length > 0) {
      return (data || []).map((item) => ({ ...convertApiCaseToFrontend(item), _dataSource: "api" }));
    }
  } catch {
    // Use local aliases and curated case fields when the backend search is unavailable.
  }
  return localCaseSearch(query);
}

export async function getIndustryAnswer(query: string): Promise<IndustryAnswer> {
  try {
    const data = await apiFetch<{
      query: string;
      answer: string;
      relatedKnowledgePoints?: string[];
      researchFrontiers?: string[];
      industryApplications?: string[];
      requiredAbilities?: string[];
      recommendedKeywords?: string[];
      nextTasks?: string[];
      sourceScope?: string;
      disclaimer?: string;
    }>("/api/industry/answer", {
      method: "POST",
      body: JSON.stringify({ query }),
    });

    return {
      query: data.query,
      answer: data.answer,
      relatedKnowledgePoints: data.relatedKnowledgePoints || [],
      researchFrontiers: data.researchFrontiers || [],
      industryApplications: data.industryApplications || [],
      abilityDirections: [],
      requiredAbilities: data.requiredAbilities || [],
      recommendedKeywords: data.recommendedKeywords || [],
      researchTasks: [],
      nextTasks: data.nextTasks || [],
      sourceScope: mapSourceScope(data.sourceScope),
      disclaimer: data.disclaimer,
      _dataSource: "api" as const,
    };
  } catch {
    return { ...getMockAnswer(query), _dataSource: "local_fallback" as const };
  }
}

export async function getIndustryCaseById(caseId: string): Promise<(IndustryCase & { _dataSource?: string }) | null> {
  try {
    const data = await apiFetch<ApiIndustryCase>(`/api/industry/cases/${caseId}`);
    return { ...convertApiCaseToFrontend(data), _dataSource: "api" as const };
  } catch {
    const localCase = mockCases.find((item) => item.id === caseId);
    return localCase ? { ...localCase, _dataSource: "local_fallback" as const } : null;
  }
}

export async function getRelatedResearchTasks(caseId: string): Promise<{ tasks: string[]; _dataSource?: string }> {
  try {
    const data = await apiFetch<{ tasks: string[] }>(`/api/industry/cases/${caseId}/research-tasks`);
    return { tasks: data.tasks || [], _dataSource: "api" as const };
  } catch {
    const localCase = mockCases.find((item) => item.id === caseId);
    return {
      tasks: localCase?.linkedResearchTask ? [localCase.linkedResearchTask] : [],
      _dataSource: "local_fallback" as const,
    };
  }
}
