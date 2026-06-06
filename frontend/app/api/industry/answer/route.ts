import { NextRequest, NextResponse } from "next/server";

import { industryCases } from "@/data/industryCases";
import { callDeepSeekJson } from "@/lib/deepseek-client.mjs";

interface MatchCase {
  id: string;
  title: string;
  reason: string;
}

interface IndustryAnswerResponse {
  query: string;
  answer: string;
  relatedKnowledgePoints: string[];
  matchedCases: MatchCase[];
  researchFrontiers: string[];
  industryApplications: string[];
  requiredAbilities: string[];
  recommendedKeywords: string[];
  nextTasks: string[];
  sourceScope: "based_on_local_cases" | "extended_reasoning" | "no_direct_match";
  disclaimer: string;
  _source?: "glm";
}

function buildCasesContext(): string {
  return industryCases
    .map((item, index) => {
      return [
        `Case ${index + 1}: [${item.id}] ${item.title}`,
        `Subtitle: ${item.subtitle}`,
        `Industry Direction: ${item.industryDirection}`,
        `Core Problem: ${item.coreProblem}`,
        `Knowledge Points: ${item.relatedKnowledgePoints.join(", ")}`,
        `Research Foundation: ${item.researchFoundation}`,
        `Application Value: ${item.applicationValue}`,
        `Required Abilities: ${item.requiredAbilities.join(", ")}`,
        `Recommended Keywords: ${item.recommendedKeywords.join(", ")}`,
        `Next Research Task: ${item.linkedResearchTask}`,
      ].join("\n");
    })
    .join("\n\n");
}

const SYSTEM_PROMPT = `You are an industry-case tutor for life science education.

Return exactly one JSON object in Simplified Chinese.
Do not output markdown.
Do not fabricate local fallback answers.
Ground the answer in the provided case library, and clearly mark when the query needs extended reasoning.

Required fields:
- answer: concise but concrete answer in Chinese
- relatedKnowledgePoints: array of strings
- matchedCases: array of {id, title, reason}
- researchFrontiers: array of strings
- industryApplications: array of strings
- requiredAbilities: array of strings
- recommendedKeywords: array of strings
- nextTasks: array of strings
- sourceScope: one of based_on_local_cases / extended_reasoning / no_direct_match
- disclaimer: one short disclaimer for learning use only`;

function buildUserPrompt(query: string): string {
  return `Case library:
${buildCasesContext()}

User query:
${query}

Return a JSON object that matches the required schema.`;
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item || "").trim()).filter(Boolean);
}

function normalizeMatchedCases(value: unknown): MatchCase[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const id = String(row.id || "").trim();
      const title = String(row.title || "").trim();
      const reason = String(row.reason || "").trim();
      if (!id || !title || !reason) return null;
      return { id, title, reason };
    })
    .filter((item): item is MatchCase => item !== null)
    .slice(0, 3);
}

function normalizeSourceScope(value: unknown): IndustryAnswerResponse["sourceScope"] {
  const text = String(value || "").trim();
  if (text === "based_on_local_cases" || text === "extended_reasoning" || text === "no_direct_match") {
    return text;
  }
  return "extended_reasoning";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const query = typeof body?.query === "string" ? body.query.trim() : "";
    if (!query) {
      return NextResponse.json({ error: "query is required" }, { status: 400 });
    }
    if (query.length > 2000) {
      return NextResponse.json({ error: "query is too long" }, { status: 400 });
    }

    const { parsed, raw } = await callDeepSeekJson({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(query) },
      ],
      temperature: 0.2,
      maxTokens: 1800,
      responseFormat: true,
    });

    const source = parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
    const answer = String(source.answer || "").trim();
    if (!answer) {
      throw new Error(`GLM returned empty answer: ${String(raw).slice(0, 300)}`);
    }

    const response: IndustryAnswerResponse = {
      query,
      answer,
      relatedKnowledgePoints: normalizeStringArray(source.relatedKnowledgePoints),
      matchedCases: normalizeMatchedCases(source.matchedCases),
      researchFrontiers: normalizeStringArray(source.researchFrontiers),
      industryApplications: normalizeStringArray(source.industryApplications),
      requiredAbilities: normalizeStringArray(source.requiredAbilities),
      recommendedKeywords: normalizeStringArray(source.recommendedKeywords),
      nextTasks: normalizeStringArray(source.nextTasks),
      sourceScope: normalizeSourceScope(source.sourceScope),
      disclaimer: String(source.disclaimer || "本回答仅用于学习与科研训练，不构成医疗、临床或商业决策建议。").trim(),
      _source: "glm",
    };

    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Industry answer generation failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
