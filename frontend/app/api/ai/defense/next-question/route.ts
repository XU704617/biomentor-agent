import { NextRequest, NextResponse } from "next/server";

import {
  buildDefensePromptMessages,
  generateLocalDefenseQuestion,
  normalizeDefenseAiJson,
} from "@/lib/defense-flow.mjs";
import { callDeepSeekJson, resolveDeepSeekConfig } from "@/lib/deepseek-client.mjs";

type AiMessage = { role: "system" | "user" | "assistant"; content: string };

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const fallback = (generateLocalDefenseQuestion as unknown as (input: Record<string, unknown>) => unknown)({
      brief: body.brief,
      difficulty: body.difficulty,
      turnIndex: Number(body.turnIndex || 0),
    });
    const { apiKey } = resolveDeepSeekConfig();
    if (!apiKey) return NextResponse.json({ success: true, data: fallback });

    const data = await callDefenseAi({
      messages: (buildDefensePromptMessages as unknown as (input: Record<string, unknown>) => AiMessage[])({
        action: "next_question",
        brief: body.brief,
        difficulty: body.difficulty,
        turnLimit: body.turnLimit,
        transcript: body.transcript || [],
      }),
      maxTokens: 900,
      fallback,
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[defense/next-question]", error instanceof Error ? error.message : error);
    return NextResponse.json({ success: false, message: "答辩问题生成失败，请稍后重试。" }, { status: 200 });
  }
}

async function callDefenseAi({ messages, maxTokens, fallback }: { messages: AiMessage[]; maxTokens: number; fallback: unknown }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const result = await callDeepSeekJson({
      messages,
      temperature: 0.45,
      maxTokens,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return normalizeDefenseAiJson(result.raw, fallback);
  } catch {
    clearTimeout(timeout);
    return fallback;
  }
}
