import { NextRequest, NextResponse } from "next/server";

const FASTAPI_BACKEND =
  process.env.FASTAPI_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://127.0.0.1:10087";

type BackendQuestion = {
  type?: string;
  question?: string;
  answer?: string;
  explanation?: string;
};

type BackendAnalysis = {
  raw_text: string;
  summary: string;
  extracted_keywords: string[];
  learning_suggestions?: string[];
  matched_concepts?: Array<{ id?: number; name?: string; definition?: string }>;
  questions?: BackendQuestion[];
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const content = String(body.content || "").trim();
    const fileName = String(body.fileName || "").trim();

    if (!content) {
      return NextResponse.json({ success: false, error: "请提供要分析的内容" }, { status: 400 });
    }

    const analysis = isDataUrl(content)
      ? await analyzeUploadedDataUrl(content, fileName)
      : await analyzeText(content);

    const knowledgePoints = buildKnowledgePoints(analysis);
    const studyTips = (analysis.learning_suggestions || [])
      .filter((item) => typeof item === "string" && item.trim())
      .slice(0, 4)
      .map((item, index) => ({
        id: index + 1,
        title: `学习建议 ${index + 1}`,
        content: item.trim(),
      }));

    return NextResponse.json({
      success: true,
      data: {
        knowledgePoints,
        keywords: Array.isArray(analysis.extracted_keywords) ? analysis.extracted_keywords.slice(0, 12) : [],
        studyTips,
        rawResponse: pickDisplayText(analysis),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "分析失败";
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}

async function analyzeText(text: string): Promise<BackendAnalysis> {
  const response = await postJson("/api/photo-learning/analyze", { text }, 120000);
  return response as BackendAnalysis;
}

async function analyzeUploadedDataUrl(dataUrl: string, fileName: string): Promise<BackendAnalysis> {
  const { mimeType, buffer } = decodeDataUrl(dataUrl);
  const form = new FormData();
  form.append("file", new Blob([buffer], { type: mimeType }), fileName || guessFileName(mimeType));
  const response = await fetchWithTimeout(`${FASTAPI_BACKEND}/api/photo-learning/full-pipeline`, {
    method: "POST",
    body: form,
  }, 180000);
  return response as BackendAnalysis;
}

function buildKnowledgePoints(analysis: BackendAnalysis) {
  const points = [
    {
      id: 1,
      title: "核心摘要",
      content: analysis.summary || analysis.raw_text || "",
    },
    ...(analysis.matched_concepts || [])
      .filter((item) => item?.name)
      .slice(0, 6)
      .map((item, index) => ({
        id: index + 2,
        title: String(item.name || "").trim(),
        content: String(item.definition || analysis.summary || "").trim(),
      })),
  ].filter((item) => item.content);

  if (points.length > 0) {
    return points;
  }

  return [
    {
      id: 1,
      title: "分析结果",
      content: analysis.raw_text || "未返回可展示的分析结果",
    },
  ];
}

function pickDisplayText(analysis: BackendAnalysis) {
  const raw = String(analysis.raw_text || "").trim();
  if (!raw) return analysis.summary || "";
  const questionMarks = (raw.match(/\?/g) || []).length;
  if (questionMarks >= Math.max(8, Math.floor(raw.length / 3))) {
    return analysis.summary || raw;
  }
  return raw;
}

async function postJson(path: string, payload: unknown, timeoutMs: number) {
  return fetchWithTimeout(
    `${FASTAPI_BACKEND}${path}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    timeoutMs,
  );
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;
    if (!response.ok) {
      throw new Error(data?.detail || data?.error || data?.message || `请求失败 (${response.status})`);
    }
    return data;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("分析超时，请稍后重试");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function isDataUrl(value: string) {
  return value.startsWith("data:");
}

function decodeDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:([^;,]+);base64,(.+)$/);
  if (!match) {
    throw new Error("无法解析上传内容");
  }
  return {
    mimeType: match[1],
    buffer: Buffer.from(match[2], "base64"),
  };
}

function guessFileName(mimeType: string) {
  if (mimeType === "application/pdf") return "uploaded.pdf";
  if (mimeType.startsWith("image/")) return `uploaded.${mimeType.split("/")[1] || "png"}`;
  return "uploaded.bin";
}
