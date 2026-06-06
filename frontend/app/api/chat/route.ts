import { NextRequest, NextResponse } from "next/server";

import { callDeepSeekJson, resolveDeepSeekConfig } from "@/lib/deepseek-client.mjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const message = String(body.message || "").trim();
    const context = String(body.context || "").trim();

    if (!message) {
      return NextResponse.json({ success: false, error: "请提供问题" }, { status: 400 });
    }

    const { apiKey } = resolveDeepSeekConfig();
    if (!apiKey) {
      return NextResponse.json({ success: false, error: "GLM API Key 未配置" }, { status: 503 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000);

    try {
      const result = await callDeepSeekJson({
        messages: [
          {
            role: "system",
            content: [
              "你是生物医学学习助手。",
              "请基于用户提供的上下文直接回答问题。",
              "不要编造文献、实验结果、年份、机构或外部检索事实。",
              "只能使用当前上下文材料；如果上下文不足，要明确说明当前材料不足。",
            ].join("\n"),
          },
          {
            role: "user",
            content: [
              `问题：${message}`,
              "",
              "上下文：",
              context ? context.slice(0, 6000) : "当前没有提供上下文材料。",
              "",
              "请用中文直接回答，先给核心结论，再补充 2-4 句解释。",
              "严禁使用上下文之外的事实。",
            ].join("\n"),
          },
        ],
        temperature: 0.2,
        maxTokens: 1200,
        responseFormat: false,
        signal: controller.signal,
      });

      const answer = String(result.raw || "").replace(/\*\*/g, "").trim();
      if (!answer) {
        throw new Error("GLM 未返回可展示的回答");
      }

      return NextResponse.json({
        success: true,
        message: answer,
      });
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "问答失败";
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}
