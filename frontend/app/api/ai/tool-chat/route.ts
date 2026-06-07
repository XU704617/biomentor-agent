import { NextRequest, NextResponse } from "next/server";

import type { ToolAiRequest, ToolAiResponse } from "@/lib/tool-ai-types";
import { normalizeToolAiResponse } from "@/lib/tool-ai-response.mjs";
import { callDeepSeekJson, resolveDeepSeekConfig } from "@/lib/deepseek-client.mjs";

const TOOL_LABELS: Record<string, string> = {
  protein: "蛋白工具",
  plasmid: "质粒工具",
  sequence: "序列分析工具",
  pathway: "通路工具",
};

function buildSystemPrompt(tool: string): string {
  const label = TOOL_LABELS[tool] || tool;
  return [
    `你是 BioMentor Agent 的${label}教学助手。`,
    "请基于用户提供的工具上下文回答，不要编造事实。",
    "只能使用用户给出的 facts、highlights、warnings 和问题本身。",
    "如果当前上下文不足以支持细节，就明确说“当前工具上下文未提供该细节”。",
    "不要暴露 API、模型、服务器或调试信息。",
    "只返回合法 JSON，对象字段固定为 answer, quickQuestions, disclaimer。",
  ].join("\n");
}

function buildUserPrompt(request: ToolAiRequest): string {
  const { mode, question, context } = request;
  const facts = context.facts.map((item) => `${item.label}: ${item.value}`).join("\n");
  const highlights = context.highlights.join("\n");
  const warnings = Array.isArray(context.warnings) ? context.warnings.join("\n") : "";
  const history = Array.isArray(request.history)
    ? request.history
        .slice(-8)
        .map((message) => `${message.role === "user" ? "学生" : "助手"}: ${message.content}`)
        .join("\n")
    : "";

  if (mode === "initial") {
    return [
      `标题: ${context.title}`,
      context.subtitle ? `副标题: ${context.subtitle}` : "",
      context.sourceLabel ? `数据来源: ${context.sourceLabel}` : "",
      context.selectedItemLabel ? `当前选中: ${context.selectedItemLabel}` : "",
      "",
      "关键事实:",
      facts || "(暂无)",
      "",
      "教学要点:",
      highlights || "(暂无)",
      warnings ? `\n注意事项:\n${warnings}` : "",
      "",
      "请先给出一段面向学生的初始讲解，只能依据上面的工具上下文；再给出 2-4 个可继续追问的问题。",
    ].join("\n");
  }

  return [
    `标题: ${context.title}`,
    context.subtitle ? `副标题: ${context.subtitle}` : "",
    "",
    "关键事实:",
    facts || "(暂无)",
    "",
    "教学要点:",
    highlights || "(暂无)",
    warnings ? `\n注意事项:\n${warnings}` : "",
    "",
    `学生追问: ${question}`,
    history ? `\n最近对话:\n${history}` : "",
    "",
    "请先直接回答学生追问。",
    "如果问题是“如何做”，优先给出步骤式回答。",
    "只能依据上面的工具上下文作答；如果细节不足，要明确指出当前工具上下文未提供。",
    "最后给出 2-4 个可继续追问的问题。",
  ].join("\n");
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as ToolAiRequest | null;
    if (!body || !body.tool || !body.context?.title) {
      return NextResponse.json({ error: "缺少必要参数 tool 或 context.title" }, { status: 400 });
    }

    if (body.mode !== "initial" && body.mode !== "question") {
      return NextResponse.json({ error: "mode 必须是 initial 或 question" }, { status: 400 });
    }
    if (body.mode === "question" && !String(body.question || "").trim()) {
      return NextResponse.json({ error: "question 模式需要提供 question" }, { status: 400 });
    }

    const { apiKey } = resolveDeepSeekConfig();
    if (!apiKey) {
      return NextResponse.json({ error: "GLM API Key 未配置" }, { status: 502 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000);

    try {
      const result = await callDeepSeekJson({
        messages: [
          { role: "system", content: buildSystemPrompt(body.tool) },
          { role: "user", content: buildUserPrompt(body) },
        ],
        temperature: 0.2,
        maxTokens: 1600,
        responseFormat: true,
        signal: controller.signal,
      });

      const normalized = normalizeToolAiResponse(result.raw) as ToolAiResponse;
      return NextResponse.json(normalized);
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "工具问答失败";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
