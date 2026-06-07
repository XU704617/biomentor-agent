import { NextRequest, NextResponse } from "next/server";

import {
  buildDefensePromptMessages,
  normalizeDefenseAiJson,
} from "@/lib/defense-flow.mjs";
import { callDeepSeekJson, resolveDeepSeekConfig } from "@/lib/deepseek-client.mjs";

type AiMessage = { role: "system" | "user" | "assistant"; content: string };
type CommitteeRole = { id: string; label: string; focus: string };

const DEFENSE_ROLES: CommitteeRole[] = [
  { id: "mechanism", label: "机制委员", focus: "科学问题、机制链路和因果解释" },
  { id: "method", label: "方法委员", focus: "实验设计、技术路线、对照和可行性" },
  { id: "evidence", label: "证据委员", focus: "数据证据、替代解释和结论边界" },
  { id: "application", label: "应用委员", focus: "产业应用、转化价值、风险和伦理边界" },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey } = resolveDeepSeekConfig();
    if (!apiKey) {
      return NextResponse.json({ success: false, message: "LLM API Key 未配置。" }, { status: 502 });
    }

    const data = await callDefenseAi({
      messages: (buildDefensePromptMessages as unknown as (input: Record<string, unknown>) => AiMessage[])({
        action: "next_question",
        brief: body.brief,
        difficulty: body.difficulty,
        turnLimit: body.turnLimit,
        turnIndex: body.turnIndex,
        transcript: body.transcript || [],
      }),
      maxTokens: 900,
      expectedRole: DEFENSE_ROLES[Number(body.turnIndex) % DEFENSE_ROLES.length] || DEFENSE_ROLES[0],
      brief: body.brief,
      difficulty: body.difficulty,
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "答辩问题生成失败";
    return NextResponse.json({ success: false, message }, { status: 502 });
  }
}

async function callDefenseAi({
  messages,
  maxTokens,
  expectedRole,
  brief,
  difficulty,
}: {
  messages: AiMessage[];
  maxTokens: number;
  expectedRole: CommitteeRole;
  brief: Record<string, unknown>;
  difficulty?: string;
}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    let normalized = await requestDefenseQuestion({
      messages,
      maxTokens,
      signal: controller.signal,
    });
    if (!normalized || typeof normalized !== "object") {
      throw new Error("Defense AI returned invalid JSON");
    }
    const content = typeof (normalized as Record<string, unknown>).content === "string"
      ? String((normalized as Record<string, unknown>).content).trim()
      : typeof (normalized as Record<string, unknown>).question === "string"
        ? String((normalized as Record<string, unknown>).question).trim()
        : "";
    if (!content) {
      throw new Error("Defense AI returned empty next question");
    }
    if (!matchesRoleFocus(expectedRole, normalized)) {
      normalized = await requestDefenseQuestion({
        messages: [
          {
            role: "system",
            content: "你是科研答辩委员会提问改写助手。必须只返回合法 JSON，不要 Markdown。",
          },
          {
            role: "user",
            content: JSON.stringify(
              {
                expectedRole,
                brief,
                previousQuestion: normalized,
                seedQuestion: buildSeedQuestion(expectedRole.id, brief, difficulty),
                instruction:
                  "请把 previousQuestion 改写为严格符合 expectedRole.focus 的问题。committeeRole 必须等于 expectedRole.label，question 必须与 seedQuestion 同方向但可自然改写。",
              },
              null,
              2,
            ),
          },
        ],
        maxTokens: 700,
        signal: controller.signal,
      });
    }
    (normalized as Record<string, unknown>).committeeRole = expectedRole.label;
    return normalized;
  } finally {
    clearTimeout(timeout);
  }
}

async function requestDefenseQuestion({
  messages,
  maxTokens,
  signal,
}: {
  messages: AiMessage[];
  maxTokens: number;
  signal: AbortSignal;
}) {
  const result = await callDeepSeekJson({
    messages,
    temperature: 0.45,
    maxTokens,
    signal,
  });
  return unwrapDefenseQuestion(normalizeDefenseAiJson(result.raw, null));
}

function matchesRoleFocus(expectedRole: CommitteeRole, payload: unknown) {
  if (!payload || typeof payload !== "object") return false;
  const role = String((payload as Record<string, unknown>).committeeRole || "");
  const question = String(
    (payload as Record<string, unknown>).question ||
    (payload as Record<string, unknown>).content ||
    "",
  );
  const haystack = `${role} ${question}`;
  const roleMatched = haystack.includes(expectedRole.label);
  const focusMatched = {
    mechanism: /(机制|链路|因果|变量|表型|通路)/,
    method: /(方法|实验|对照|指标|验证|特异性|设计)/,
    evidence: /(证据|数据|结果|统计|支撑|相反结果|边界)/,
    application: /(应用|转化|产业|风险|伦理|落地)/,
  }[expectedRole.id]?.test(haystack);
  return Boolean(roleMatched && focusMatched);
}

function buildSeedQuestion(roleId: string, brief: Record<string, unknown>, difficulty?: string) {
  const title = String(brief?.title || "当前课题");
  const seeds: Record<string, string> = {
    mechanism: `请你用一到两句话说明"${title}"背后的核心机制链路：关键变量如何影响表型或结论？`,
    method: "你的方法设计如何排除替代解释？请说明至少一个关键对照、一个读出指标和一个失败风险。",
    evidence: "目前哪些证据最能支持你的结论？如果出现相反结果，你会优先检查哪一环？",
    application: "这个研究如果要进入应用或产业场景，最大的转化价值和风险边界分别是什么？",
  };
  const challengeTail = difficulty === "challenge" ? " 请特别注意不要只给结论，要说明证据边界。" : "";
  return `${seeds[roleId] || seeds.mechanism}${challengeTail}`;
}

function unwrapDefenseQuestion(payload: unknown) {
  if (!payload || typeof payload !== "object") return payload;
  const answer = (payload as Record<string, unknown>).answer;
  if (answer && typeof answer === "object") {
    const unwrapped = {
      ...(payload as Record<string, unknown>),
      ...(answer as Record<string, unknown>),
    };
    delete (unwrapped as Record<string, unknown>).answer;
    return unwrapped;
  }
  return payload;
}
