export interface LiteratureSearchItem {
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
  raw_id?: string | null;
}

export type LiteratureSource = "not_configured" | "semantic_scholar" | "crossref";

export interface LiteratureSearchResponse {
  query: string;
  source: LiteratureSource | string;
  results: LiteratureSearchItem[];
  message?: string;
  error?: string;
}

export async function searchLiterature(
  query: string,
  limit?: number
): Promise<LiteratureSearchResponse> {
  const params = new URLSearchParams();
  params.set("q", query);
  params.set("limit", String(limit ?? 5));

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(
      `/api/literature/search?${params.toString()}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
      }
    );
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
      throw new Error("文献检索请求超时，请稍后重试");
    }
    throw error;
  }
}