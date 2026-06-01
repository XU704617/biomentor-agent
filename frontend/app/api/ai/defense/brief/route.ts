import { NextRequest, NextResponse } from "next/server";

import {
  buildDefenseBriefFromText,
  extractPlainTextFromOfficeXml,
  normalizeDefenseBrief,
} from "@/lib/defense-flow.mjs";
import { callDeepSeekJson, resolveDeepSeekConfig } from "@/lib/deepseek-client.mjs";

export const runtime = "nodejs";

type BriefFallback = Record<string, unknown>;

export async function POST(request: NextRequest) {
  try {
    const payload = await parseRequest(request);
    if (!payload.text.trim()) {
      return NextResponse.json({ success: false, message: "没有读取到可用于答辩的文本内容。" }, { status: 400 });
    }

    const localBrief = buildDefenseBriefFromText(payload) as BriefFallback;
    localBrief._warning = "LLM 不可用时返回本地提取的结构化摘要，非 AI 深度分析。";

    const { apiKey } = resolveDeepSeekConfig();
    if (!apiKey) {
      return NextResponse.json({ success: true, data: localBrief });
    }

    const aiBrief = await generateBriefWithDeepSeek({ ...payload, fallback: localBrief });
    return NextResponse.json({ success: true, data: aiBrief });
  } catch (error) {
    console.error("[defense/brief]", error instanceof Error ? error.message : error);
    return NextResponse.json({ success: false, message: "资料包生成失败，请稍后重试。" }, { status: 200 });
  }
}

async function generateBriefWithDeepSeek({
  text,
  sourceType,
  sourceLabel,
  href,
  fallback,
}: {
  text: string;
  sourceType: string;
  sourceLabel: string;
  href: string;
  fallback: BriefFallback;
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

    return normalizeDefenseBrief(result.parsed, { sourceType, sourceLabel, text, href });
  } catch {
    return fallback;
  } finally {
    clearTimeout(timeout);
  }
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
    text = file instanceof File ? await extractUploadedFileText(file) : String(form.get("text") || "");
  } else {
    const body = await request.json().catch(() => ({}));
    sourceType = String(body.sourceType || "manual");
    sourceLabel = String(body.sourceLabel || "手动输入");
    href = String(body.href || "");
    text = String(body.text || "");
  }

  return { sourceType, sourceLabel, href, text };
}

async function extractUploadedFileText(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());

  if (/\.(txt|md|csv)$/i.test(name)) return buffer.toString("utf8");
  if (/\.pdf$/i.test(name)) {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    return result.text || "";
  }
  if (/\.docx$/i.test(name)) {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value || "";
  }
  if (/\.pptx$/i.test(name)) {
    return extractPptxText(buffer);
  }
  if (/\.ppt$/i.test(name)) {
    return buffer.toString("utf8").replace(/[^\x20-\x7E\u4e00-\u9fa5。，""！？；：、\n]/g, " ");
  }

  return buffer.toString("utf8");
}

async function extractPptxText(buffer: Buffer): Promise<string> {
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(buffer);
  const parts = Object.keys(zip.files)
    .filter((name) => /^ppt\/(slides|notesSlides)\/.*\.xml$/i.test(name))
    .sort();
  const texts = await Promise.all(parts.map(async (name) => extractPlainTextFromOfficeXml(await zip.files[name].async("string"))));
  return texts.join("\n");
}
