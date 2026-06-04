import { NextRequest, NextResponse } from "next/server";

import {
  applyDefenseQualityGate,
  buildDefensePromptMessages,
  generateLocalDefenseReport,
  normalizeDefenseAiJson,
  normalizeDefenseReport,
} from "@/lib/defense-flow.mjs";
import { callDeepSeekJson, resolveDeepSeekConfig } from "@/lib/deepseek-client.mjs";

type AiMessage = { role: "system" | "user" | "assistant"; content: string };

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const fallback = (generateLocalDefenseReport as unknown as (input: Record<string, unknown>) => unknown)({ brief: body.brief, transcript: body.transcript || [] });
    const { apiKey } = resolveDeepSeekConfig();
    if (!apiKey) return NextResponse.json({ success: true, data: fallback });

    const data = await callDefenseAi({
      messages: (buildDefensePromptMessages as unknown as (input: Record<string, unknown>) => AiMessage[])({
        action: "report",
        brief: body.brief,
        difficulty: body.difficulty,
        turnLimit: body.turnLimit,
        transcript: body.transcript || [],
      }),
      maxTokens: 1800,
      fallback,
      transcript: body.transcript || [],
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[defense/report]", error instanceof Error ? error.message : error);
    return NextResponse.json({ success: false, message: "答辩报告生成失败，请稍后重试。" }, { status: 200 });
  }
}

async function callDefenseAi({
  messages,
  maxTokens,
  fallback,
  transcript,
}: {
  messages: AiMessage[];
  maxTokens: number;
  fallback: unknown;
  transcript: unknown[];
}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const result = await callDeepSeekJson({
      messages,
      temperature: 0.35,
      maxTokens,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const aiParsed = normalizeDefenseAiJson(result.raw, fallback);
    const normalized = normalizeDefenseReport(aiParsed, fallback as Record<string,unknown>);
    return (applyDefenseQualityGate as unknown as (report: unknown, transcript: unknown[]) => unknown)(
      normalized,
      transcript,
    );
  } catch {
    clearTimeout(timeout);
    return fallback;
  }
}
