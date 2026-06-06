import { NextRequest, NextResponse } from "next/server";

import { buildDefenseBriefFromText, normalizeDefenseBrief } from "@/lib/defense-flow.mjs";
import { extractUploadedFileTextFromBuffer } from "@/lib/defense-file-text.mjs";
import { callDeepSeekJson, resolveDeepSeekConfig } from "@/lib/deepseek-client.mjs";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const payload = await parseRequest(request);
    if (!payload.text.trim()) {
      return NextResponse.json({ success: false, message: "没有读取到可用于答辩的文本内容。" }, { status: 400 });
    }

    const { apiKey } = resolveDeepSeekConfig();
    if (!apiKey) {
      return NextResponse.json({ success: false, message: "LLM API Key 未配置。" }, { status: 502 });
    }

    const aiBrief = await generateBriefWithGlm(payload);
    return NextResponse.json({ success: true, data: aiBrief });
  } catch (error) {
    const message = error instanceof Error ? error.message : "答辩资料生成失败";
    return NextResponse.json({ success: false, message }, { status: 502 });
  }
}

async function generateBriefWithGlm({
  text,
  sourceType,
  sourceLabel,
  href,
}: {
  text: string;
  sourceType: string;
  sourceLabel: string;
  href: string;
}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const result = await callDeepSeekJson({
      messages: [
        {
          role: "system",
          content:
            "你是 BioMentor Agent 的科研答辩资料整理助手。请把用户资料整理为 Defense Brief JSON，不要输出 Markdown，不要暴露 API、模型或调试信息。",
        },
        {
          role: "user",
          content: JSON.stringify({
            sourceType,
            sourceLabel,
            text: text.slice(0, 16000),
            requiredFields: [
              "title",
              "mode",
              "background",
              "researchQuestion",
              "hypothesis",
              "objectives",
              "methods",
              "evidence",
              "limitations",
              "innovationPoints",
              "applicationValue",
              "keywords",
              "relatedKnowledgeNodes",
              "relatedTools",
            ],
          }),
        },
      ],
      temperature: 0.25,
      maxTokens: 2200,
      signal: controller.signal,
    });

    const parsed = unwrapBriefPayload(
      result.parsed && typeof result.parsed === "object"
        ? (result.parsed as Record<string, unknown>)
        : null,
    );
    if (!parsed) {
      return buildDefenseBriefFromText({ text, sourceType, sourceLabel, href });
    }

    const hasCoreField = Boolean(
      String(parsed.title || "").trim() ||
      String(parsed.background || "").trim() ||
      String(parsed.researchQuestion || "").trim(),
    );
    if (!hasCoreField) {
      return buildDefenseBriefFromText({ text, sourceType, sourceLabel, href });
    }

    return normalizeDefenseBrief(parsed, { sourceType, sourceLabel, text, href });
  } finally {
    clearTimeout(timeout);
  }
}

function unwrapBriefPayload(parsed: Record<string, unknown> | null) {
  if (!parsed) return null;

  const nested = [parsed.answer, parsed.brief, parsed.data].find(
    (item) => item && typeof item === "object",
  ) as Record<string, unknown> | undefined;

  if (!nested) return parsed;
  return {
    ...parsed,
    ...nested,
  };
}

async function parseRequest(request: NextRequest) {
  const contentType = request.headers.get("content-type") || "";
  let sourceType = "manual";
  let sourceLabel = "手动输入";
  let href = "";
  let text = "";

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const file = form.get("file");
    sourceType = String(form.get("sourceType") || "file");
    sourceLabel = String(form.get("sourceLabel") || (file instanceof File ? file.name : "上传文件"));
    href = String(form.get("href") || "");
    text = file instanceof File
      ? await extractUploadedFileTextFromBuffer(file.name, Buffer.from(await file.arrayBuffer()))
      : String(form.get("text") || "");
  } else {
    const body = await request.json().catch(() => ({}));
    sourceType = String(body.sourceType || "manual");
    sourceLabel = String(body.sourceLabel || "手动输入");
    href = String(body.href || "");
    text = String(body.text || "");
  }

  return { sourceType, sourceLabel, href, text };
}
