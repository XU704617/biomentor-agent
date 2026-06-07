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
  const label = request?.context?.title || tool || "工具";
  const facts = Array.isArray(request?.context?.facts) ? request.context.facts : [];
  const highlights = Array.isArray(request?.context?.highlights) ? request.context.highlights : [];
  const factText = facts
    .map((item) => `${item?.label || "信息"}：${item?.value || "未提供"}`)
    .join("；");
  const question = String(request?.question || "");
  const isPhQuestion = /pH|酸性|活性/.test(question);
  const answer = isPhQuestion
    ? `${label}通常在酸性环境中发挥作用。以胃蛋白酶为例，常见活性范围可围绕 pH 1.5-2.5 理解；学习时可结合活性位点、底物结合和实验条件继续判断。`
    : `${label}可先从功能定位、关键结构和证据来源三方面理解。${factText ? `当前资料包括 ${factText}。` : ""}${highlights.length ? `重点关注：${highlights.join("、")}。` : ""}`;
  return {
    answer,
    quickQuestions: [
      `${label}的关键功能是什么？`,
      "哪些证据可以支持这个判断？",
      "下一步适合查哪些结构或序列信息？",
    ],
    disclaimer: DEFAULT_DISCLAIMER,
    source: "local_fallback",
  };
}

export function normalizeToolAiResponse(raw, tool, request = {}) {
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
    if (!/[{}]/.test(text)) {
      const fallback = createHelpfulToolFallback(tool, request);
      return {
        answer: text,
        quickQuestions: fallback.quickQuestions,
        disclaimer: fallback.disclaimer,
        source: "local_fallback",
      };
    }
    throw error instanceof Error ? error : new Error("Tool AI returned invalid JSON");
  }
}
