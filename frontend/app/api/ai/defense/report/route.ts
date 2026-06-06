import { NextRequest, NextResponse } from "next/server";

import {
  applyDefenseQualityGate,
  buildDefensePromptMessages,
  normalizeDefenseAiJson,
  normalizeDefenseReport,
} from "@/lib/defense-flow.mjs";
import { callDeepSeekJson, resolveDeepSeekConfig } from "@/lib/deepseek-client.mjs";

type AiMessage = { role: "system" | "user" | "assistant"; content: string };

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey } = resolveDeepSeekConfig();
    if (!apiKey) {
      return NextResponse.json({ success: false, message: "LLM API Key 未配置。" }, { status: 502 });
    }

    const data = await callDefenseAi({
      messages: (buildDefensePromptMessages as unknown as (input: Record<string, unknown>) => AiMessage[])({
        action: "report",
        brief: body.brief,
        difficulty: body.difficulty,
        turnLimit: body.turnLimit,
        transcript: body.transcript || [],
      }),
      maxTokens: 1800,
      transcript: body.transcript || [],
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "答辩报告生成失败";
    return NextResponse.json({ success: false, message }, { status: 502 });
  }
}

async function callDefenseAi({
  messages,
  maxTokens,
  transcript,
}: {
  messages: AiMessage[];
  maxTokens: number;
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
    const aiParsed = normalizeDefenseAiJson(result.raw, null);
    if (!aiParsed || typeof aiParsed !== "object") {
      throw new Error("Defense AI returned invalid JSON");
    }
    const normalized = normalizeDefenseReport(aiParsed, {
      totalScore: 0,
      dimensions: [],
      committeeFeedback: "",
      weakPoints: [],
      moduleRecommendations: [],
      nextDefenseTopics: [],
    });
    if (!Array.isArray((normalized as Record<string, unknown>).dimensions) || ((normalized as Record<string, unknown>).dimensions as unknown[]).length === 0) {
      throw new Error("Defense AI returned an incomplete report");
    }
    return (applyDefenseQualityGate as unknown as (report: unknown, transcript: unknown[]) => unknown)(
      normalized,
      transcript,
    );
  } finally {
    clearTimeout(timeout);
  }
}
