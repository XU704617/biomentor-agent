import { searchLocalLiteratureByKeywords } from "@/lib/knowledgeSearch";

export interface EvidenceSearchItem {
  id?: string | null;
  title?: string | null;
  authors?: string[];
  year?: number | null;
  venue?: string | null;
  doi?: string | null;
  pmid?: string | null;
  url?: string | null;
  abstract?: string | null;
  source_provider?: string;
  source_label?: string;
}

export interface EvidenceSearchRequest {
  task_title: string;
  task_goal: string;
  case_title?: string;
  suggested_keywords?: string[];
}

export interface EvidenceSearchResponse {
  query_info?: Record<string, unknown>;
  source: string;
  results: EvidenceSearchItem[];
  message?: string;
  error?: string;
}

export interface EvidenceNoteRequest {
  task_title: string;
  task_goal: string;
  selected_papers: EvidenceSearchItem[];
  case_title?: string;
}

export interface EvidenceNoteResponse {
  note: string;
  selected_count: number;
  message?: string;
  error?: string;
}

function getEvidenceKey(item: EvidenceSearchItem): string {
  return (
    item.doi?.toLowerCase() ||
    item.pmid?.toLowerCase() ||
    item.id?.toLowerCase() ||
    item.title?.toLowerCase() ||
    ""
  );
}

function normalizeExternalItem(item: EvidenceSearchItem): EvidenceSearchItem {
  return {
    ...item,
    source_label: item.source_label || "公开文献",
    source_provider: item.source_provider || "external_search",
  };
}

function mergeEvidenceItems(
  localItems: EvidenceSearchItem[],
  externalItems: EvidenceSearchItem[],
): EvidenceSearchItem[] {
  const seen = new Set<string>();
  const merged: EvidenceSearchItem[] = [];
  [...localItems, ...externalItems.map(normalizeExternalItem)].forEach((item) => {
    const key = getEvidenceKey(item);
    if (key && seen.has(key)) return;
    if (key) seen.add(key);
    merged.push(item);
  });
  return merged.slice(0, 10);
}

export function getLocalEvidenceForTask(
  input: EvidenceSearchRequest,
): EvidenceSearchResponse {
  const local = searchLocalLiteratureByKeywords(
    input.suggested_keywords || [],
    [input.case_title, input.task_title, input.task_goal].filter(Boolean).join(" "),
    8,
  );

  return {
    source: "local_curated",
    results: local,
    message: local.length > 0 ? "已展示本地精选文献" : "暂未找到本地精选文献",
  };
}

function createLocalEvidenceNote(input: EvidenceNoteRequest): EvidenceNoteResponse {
  const selected = input.selected_papers || [];
  if (selected.length === 0) {
    throw new Error("请先选择参考文献。");
  }

  const paperLines = selected.map((paper, index) => {
    const title = paper.title || "未提供标题";
    const year = paper.year != null ? `，${paper.year}` : "";
    const venue = paper.venue ? `，${paper.venue}` : "";
    const source = paper.source_label || (paper.source_provider === "local_curated" ? "本地精选" : "公开文献");
    return `${index + 1}. ${title}${year}${venue}（${source}）`;
  });

  const keywordHints = Array.from(
    new Set(
      selected
        .flatMap((paper) => [paper.title || "", paper.abstract || ""])
        .join(" ")
        .split(/[\s,，;；/()（）]+/)
        .filter((word) => word.length >= 4)
        .slice(0, 8),
    ),
  );

  return {
    selected_count: selected.length,
    note: [
      "边界说明：这是一份基于已选择文献信息生成的学习辅助笔记，用于整理研究线索；它不是完整文献综述，也不替代论文全文精读或教师判断。",
      "",
      `核心问题：${input.task_goal || input.task_title}`,
      "",
      "参考文献：",
      ...paperLines,
      "",
      "背景分析：",
      `这些文献可帮助理解「${input.case_title || input.task_title}」相关机制、技术路线和证据边界。建议先区分基础机制、转化应用和检测/治疗场景，再回到原文核对实验对象、样本量、终点和局限。`,
      "",
      "相关知识点：",
      keywordHints.length > 0 ? keywordHints.join("、") : "请结合任务关键词和文献标题进一步提取。",
      "",
      "推荐下一步：",
      "1. 逐篇阅读摘要和方法部分，标注该文献能支撑的具体论点。",
      "2. 对比不同文献的研究对象、技术路线和结论边界。",
      "3. 将可直接支撑训练任务的证据整理成图示或表格。",
    ].join("\n"),
  };
}

export async function searchEvidenceForTask(
  input: EvidenceSearchRequest
): Promise<EvidenceSearchResponse> {
  const localResult = getLocalEvidenceForTask(input);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch("/api/evidence/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const data = await response.json();

    if (!response.ok) {
      return localResult;
    }

    if (data?.error || data?.source === "not_configured") {
      return localResult;
    }

    const externalResults = Array.isArray(data?.results) ? data.results : [];
    const merged = mergeEvidenceItems(localResult.results, externalResults);
    return {
      ...data,
      source: localResult.results.length > 0 ? "local_plus_external" : data.source,
      results: merged,
      message:
        merged.length > externalResults.length
          ? "已合并本地精选文献和公开文献"
          : data?.message,
    };
  } catch (error) {
    clearTimeout(timeout);
    return localResult;
  }
}

export async function createEvidenceNote(
  input: EvidenceNoteRequest
): Promise<EvidenceNoteResponse> {
  if (!input.selected_papers || input.selected_papers.length === 0) {
    throw new Error("请先选择参考文献。");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch("/api/evidence/note", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const data = await response.json();

    if (!response.ok) {
      return createLocalEvidenceNote(input);
    }

    if (data?.error || !data?.note || data?.selected_count === 0) {
      return createLocalEvidenceNote(input);
    }

    return data;
  } catch (error) {
    clearTimeout(timeout);
    return createLocalEvidenceNote(input);
  }
}
