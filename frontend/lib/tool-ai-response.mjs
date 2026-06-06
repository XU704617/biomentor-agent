const DEFAULT_DISCLAIMER =
  "本回答用于课程学习和科研训练，不构成医疗、临床或未经验证的实验操作建议。";

export function extractToolJson(raw) {
  const trimmed = String(raw || "").trim();
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) return codeBlockMatch[1].trim();
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) return trimmed.slice(firstBrace, lastBrace + 1);
  return trimmed;
}

export function createHelpfulToolFallback(tool, request) {
  const label = tool || "工具";
  return {
    answer: `${label} 的本地说明仅用于离线展示，不代表真实 GLM 结果。`,
    quickQuestions: [],
    disclaimer: DEFAULT_DISCLAIMER,
    source: "local_fallback",
  };
}

export function normalizeToolAiResponse(raw) {
  const text = String(raw || "").trim();
  if (!text) {
    throw new Error("Tool AI returned empty content");
  }

  try {
    const parsed = JSON.parse(extractToolJson(text));
    const answer = typeof parsed.answer === "string" ? parsed.answer.trim() : "";
    const quickQuestions = Array.isArray(parsed.quickQuestions)
      ? parsed.quickQuestions
          .filter((q) => typeof q === "string" && q.trim())
          .map((q) => q.trim())
          .slice(0, 4)
      : [];
    const disclaimer =
      typeof parsed.disclaimer === "string" && parsed.disclaimer.trim()
        ? parsed.disclaimer.trim()
        : DEFAULT_DISCLAIMER;

    if (!answer) {
      throw new Error("Tool AI returned incomplete JSON");
    }

    return {
      answer,
      quickQuestions,
      disclaimer,
      source: "glm",
    };
  } catch (error) {
    throw error instanceof Error ? error : new Error("Tool AI returned invalid JSON");
  }
}
