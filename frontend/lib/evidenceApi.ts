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
  source_mode?: string;
  note_title?: string;
  direct_answer?: string;
  core_question?: string;
  literature_roles?: Array<{
    evidence_id?: string;
    title?: string;
    role?: string;
    usable_evidence?: string;
    limitation?: string;
  }>;
  case_connection?: string;
  seminar_quote?: string;
  next_steps?: string[];
  limitations?: string;
  evidence_items?: Array<Record<string, unknown>>;
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
    source_mode: "local_fallback",
    note_title: `${input.case_title || input.task_title} 的文献支撑笔记`,
    direct_answer: `已选择 ${selected.length} 篇文献，可用于围绕「${input.task_title}」整理证据线索。`,
    core_question: input.task_goal || input.task_title,
    literature_roles: selected.map((paper, index) => ({
      evidence_id: paper.id || paper.pmid || paper.doi || `selected-${index + 1}`,
      title: paper.title || "未提供标题",
      role: "用于支撑当前科研训练任务的背景、方法或证据边界。",
      usable_evidence: paper.abstract || "可用于定位原始文献并整理研究线索。",
      limitation: "未进行全文解析，不能直接替代原文阅读或完整证据评价。",
    })),
    case_connection: `这些文献可帮助理解「${input.case_title || input.task_title}」相关机制、技术路线和证据边界。`,
    seminar_quote: "当前判断来自已选择文献和案例资料，仍需回到原文确认方法、结论和适用边界。",
    next_steps: ["逐篇阅读摘要和方法部分", "标注每篇文献能支撑的具体论点", "整理仍无法确认的问题"],
    limitations: "该笔记基于已选择文献信息生成，不替代完整论文阅读。",
    note: [
      "直接回答：",
      `已选择 ${selected.length} 篇文献，可用于围绕「${input.task_title}」整理证据线索。`,
      "",
      `核心问题：${input.task_goal || input.task_title}`,
      "",
      "证据怎么支持：",
      `这些文献可帮助理解「${input.case_title || input.task_title}」相关机制、技术路线和证据边界。`,
      "",
      "每篇文献的作用：",
      ...paperLines,
      "",
      "还不能证明什么：",
      "当前笔记未进行全文解析，不能直接证明某一临床结论、产品效果或监管状态。",
      "",
      "可用于答辩的一句话：",
      "当前判断来自已选择文献和案例资料，仍需回到原文确认方法、结论和适用边界。",
      "",
      "下一步建议：",
      "1. 逐篇阅读摘要和方法部分，标注该文献能支撑的具体论点。",
      "2. 对比不同文献的研究对象、技术路线和结论边界。",
      `3. 提取关键词：${keywordHints.length > 0 ? keywordHints.join("、") : "请结合任务关键词和文献标题进一步提取。"}`,
      "",
      "使用边界：该笔记基于已选择文献信息生成，不替代完整论文阅读。",
    ].join("\n"),
  };
}

function normalizeEvidenceNoteResponse(data: any, input: EvidenceNoteRequest): EvidenceNoteResponse {
  const evidenceNote = data?.evidence_note;
  if (!evidenceNote) return data as EvidenceNoteResponse;
  const note = evidenceNote.summary || [
    evidenceNote.direct_answer ? `直接回答：${evidenceNote.direct_answer}` : "",
    evidenceNote.case_connection ? `证据怎么支持：${evidenceNote.case_connection}` : "",
    Array.isArray(evidenceNote.literature_roles) && evidenceNote.literature_roles.length > 0
      ? ["每篇文献的作用：", ...evidenceNote.literature_roles.map((role: any) => `- ${role.title || "未提供标题"}：${role.role || ""} 局限：${role.limitation || "未提供"}`)].join("\n")
      : "",
    evidenceNote.seminar_quote ? `可用于答辩的一句话：${evidenceNote.seminar_quote}` : "",
    Array.isArray(evidenceNote.next_steps) ? `下一步建议：${evidenceNote.next_steps.join("；")}` : "",
    evidenceNote.limitations?.[0] ? `使用边界：${evidenceNote.limitations[0]}` : "",
  ].filter(Boolean).join("\n\n");
  return {
    selected_count: data?.selected_count ?? input.selected_papers.length,
    message: data?.message,
    error: data?.error,
    note,
    source_mode: evidenceNote.source_mode,
    note_title: evidenceNote.note_title,
    direct_answer: evidenceNote.direct_answer,
    core_question: evidenceNote.core_question,
    literature_roles: evidenceNote.literature_roles,
    case_connection: evidenceNote.case_connection,
    seminar_quote: evidenceNote.seminar_quote,
    next_steps: evidenceNote.next_steps,
    limitations: Array.isArray(evidenceNote.limitations) ? evidenceNote.limitations.join("；") : evidenceNote.limitations,
    evidence_items: evidenceNote.evidence_items,
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
      body: JSON.stringify({
        task_title: input.task_title,
        task_description: input.task_goal,
        case_title: input.case_title,
        recommended_keywords: input.suggested_keywords || [],
      }),
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
      body: JSON.stringify({
        task_title: input.task_title,
        task_description: input.task_goal,
        selected_literature: input.selected_papers,
        case_title: input.case_title,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const data = await response.json();

    if (!response.ok) {
      return createLocalEvidenceNote(input);
    }

    const normalized = normalizeEvidenceNoteResponse(data, input);
    if (normalized?.error || !normalized?.note || normalized?.selected_count === 0) {
      return createLocalEvidenceNote(input);
    }

    return normalized;
  } catch (error) {
    clearTimeout(timeout);
    return createLocalEvidenceNote(input);
  }
}
