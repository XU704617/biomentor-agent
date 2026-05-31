import { NextRequest, NextResponse } from "next/server";

import {
  buildKnowledgePromptMessages,
  createLocalKnowledgeAnswer,
  normalizeKnowledgeAiResponse,
} from "@/lib/knowledge-ai-types.mjs";
import { callDeepSeekJson, resolveDeepSeekConfig } from "@/lib/deepseek-client.mjs";
import type { KnowledgeAiMessage, KnowledgeAiRequest } from "@/lib/knowledge-map-types";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as KnowledgeAiRequest;
    const safeRequest = sanitizeRequest(body);
    const { apiKey } = resolveDeepSeekConfig();

    if (!apiKey) {
      return NextResponse.json({
        success: true,
        data: createLocalKnowledgeAnswer(safeRequest),
      });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const result = await callDeepSeekJson({
      messages: buildKnowledgePromptMessages(safeRequest),
      temperature: safeRequest.mode === "research" ? 0.45 : 0.55,
      maxTokens: 1200,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    return NextResponse.json({
      success: true,
      data: normalizeKnowledgeAiResponse(result.raw, safeRequest),
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "这个节点的解释暂时没有生成成功，你可以稍后重试。",
      },
      { status: 200 },
    );
  }
}

function sanitizeRequest(body: KnowledgeAiRequest): KnowledgeAiRequest {
  return {
    mode: body.mode === "research" ? "research" : "tutor",
    action: body.action || "auto_explain",
    discipline: {
      id: String(body.discipline?.id || "unknown"),
      name: String(body.discipline?.name || "当前学科"),
    },
    dimension: body.dimension
      ? {
          id: String(body.dimension.id || "root"),
          name: String(body.dimension.name || "知识图谱"),
        }
      : null,
    node: {
      id: String(body.node?.id || "unknown-node"),
      name: String(body.node?.name || "当前节点"),
      summary: String(body.node?.summary || ""),
      keyPoints: Array.isArray(body.node?.keyPoints)
        ? body.node.keyPoints.map((item) => String(item)).slice(0, 8)
        : [],
      moduleLinks: Array.isArray(body.node?.moduleLinks)
        ? body.node.moduleLinks
            .map((link) => ({
              label: String(link?.label || ""),
              href: String(link?.href || ""),
            }))
            .filter((link) => link.label && link.href.startsWith("/"))
            .slice(0, 4)
        : [],
    },
    history: sanitizeHistory(body.history),
  };
}

function sanitizeHistory(history: KnowledgeAiRequest["history"]): KnowledgeAiMessage[] {
  if (!Array.isArray(history)) return [];
  return history
    .map((message): KnowledgeAiMessage => ({
      role: message.role === "user" ? "user" : "assistant",
      content: String(message.content || "").slice(0, 1000),
    }))
    .slice(-8);
}
