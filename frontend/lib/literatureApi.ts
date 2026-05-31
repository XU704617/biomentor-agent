export interface LiteratureSearchItem {
  title: string;
  source: string;
  url: string;
}

export interface LiteratureSearchResponse {
  query: string;
  results: LiteratureSearchItem[];
  source: string;
  message: string;
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

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.error || `请求失败 (${response.status})`
      );
    }

    const data: LiteratureSearchResponse = await response.json();
    return data;
  } catch (error) {
    clearTimeout(timeout);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("文献检索请求超时，请稍后重试");
    }
    throw error;
  }
}