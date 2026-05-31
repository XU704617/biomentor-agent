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

export async function searchEvidenceForTask(
  input: EvidenceSearchRequest
): Promise<EvidenceSearchResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

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
      throw new Error(data?.error || data?.message || `请求失败 (${response.status})`);
    }

    if (data?.error && data.source !== "not_configured") {
      throw new Error(data.error);
    }

    return data;
  } catch (error) {
    clearTimeout(timeout);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("evidence 文献检索请求超时，请稍后重试");
    }
    throw error;
  }
}

export async function createEvidenceNote(
  input: EvidenceNoteRequest
): Promise<EvidenceNoteResponse> {
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
      throw new Error(data?.error || data?.message || `请求失败 (${response.status})`);
    }

    if (data?.error) {
      throw new Error(data.error);
    }

    return data;
  } catch (error) {
    clearTimeout(timeout);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("evidence note 生成请求超时，请稍后重试");
    }
    throw error;
  }
}