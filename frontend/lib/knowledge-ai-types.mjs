const defaultQuestions = [
  "请再讲得更通俗一点",
  "这个知识点和哪些实验有关",
  "它和产业应用怎么连接",
  "继续给我一个学习任务",
];

export function buildKnowledgeCacheKey(context) {
  return [
    context.mode || "tutor",
    context.action || "auto_explain",
    context.discipline?.id || "unknown-discipline",
    context.dimension?.id || "root",
    context.node?.id || "unknown-node",
  ].join(":");
}

export function buildKnowledgePromptMessages(context) {
  const modeName = context.mode === "research" ? "科研训练助教" : "知识讲解导师";
  const modeGuidance =
    context.mode === "research"
      ? "回答时强调研究问题、实验设计、证据边界、文献阅读和后续任务。"
      : "回答时强调概念解释、前置知识、学习顺序和练习建议。";
  const latestUserQuestion =
    [...(context.history || [])].reverse().find((message) => message?.role === "user")?.content || "";

  return [
    {
      role: "system",
      content: [
        `你是 BioMentor Agent 的${modeName}，也是科研助手。`,
        modeGuidance,
        "只能基于用户传入的 currentContext 和 history 回答。",
        "如果上下文里没有给出年份、作者、机构、实验结论或应用细节，就明确说当前材料未提供，不要自行补充。",
        "你必须只返回一个合法 JSON 对象，不要输出 Markdown。",
        "JSON 字段固定为：title, answer, keyPoints, nextSteps, suggestedQuestions, moduleLinks。",
        "moduleLinks 只能使用用户传入的站内链接，不要编造外链。",
        "不要暴露 API、模型、后端、fallback、debug 等开发信息。",
      ].join("\n"),
    },
    {
      role: "user",
      content: JSON.stringify(
        {
          task: context.action || "auto_explain",
          mode: context.mode || "tutor",
          currentContext: {
            discipline: context.discipline,
            dimension: context.dimension || null,
            node: context.node,
          },
          latestUserQuestion,
          history: (context.history || []).slice(-8),
          responseType: "JSON",
          outputFormat: {
            title: "简短标题",
            answer: "180-320 字中文解释",
            keyPoints: ["3-5 个关键点"],
            nextSteps: ["3-5 个下一步"],
            suggestedQuestions: ["4-5 个追问按钮文案"],
            moduleLinks: [{ label: "站内模块名称", href: "/path" }],
          },
          instruction:
            context.action === "chat"
              ? "先直接回答 latestUserQuestion，再结合 currentContext 补充解释；如果材料不足，就明确指出材料不足。"
              : "围绕当前节点进行清晰、准确、结构化的解释，只能使用已给出的节点摘要和关键点。",
        },
        null,
        2,
      ),
    },
  ];
}

export function normalizeKnowledgeAiResponse(raw, context = {}) {
  const parsed = safeParseJson(raw);
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Knowledge AI returned invalid JSON");
  }

  const title = cleanString(parsed.title);
  const answer = cleanString(parsed.answer);
  const keyPoints = withFallbackList(normalizeStringArray(parsed.keyPoints), normalizeStringArray(context?.node?.keyPoints), [
    "梳理核心概念",
    "连接相关实验或工具",
  ]);
  const nextSteps = withFallbackList(normalizeStringArray(parsed.nextSteps), [
    `继续阅读${context?.node?.name || "当前节点"}的相关资料`,
    "整理一个可检验的问题",
    "记录证据边界",
  ]);
  const suggestedQuestions = withFallbackList(normalizeStringArray(parsed.suggestedQuestions), defaultQuestions);
  const moduleLinks = normalizeLinks(parsed.moduleLinks).length
    ? normalizeLinks(parsed.moduleLinks)
    : normalizeLinks(context?.node?.moduleLinks);

  if (!title || !answer) {
    throw new Error("Knowledge AI returned incomplete content");
  }

  return {
    title,
    answer,
    keyPoints,
    nextSteps,
    suggestedQuestions,
    moduleLinks,
    source: "glm",
  };
}

export function createLocalKnowledgeAnswer(context) {
  const nodeName = context?.node?.name || "当前节点";
  return {
    title: `${nodeName} - 本地说明`,
    answer: `${nodeName} 的本地说明仅用于离线展示，不代表真实 GLM 结果。`,
    keyPoints: normalizeStringArray(context?.node?.keyPoints).slice(0, 3),
    nextSteps: ["连接真实 GLM 后再继续使用该功能"],
    suggestedQuestions: defaultQuestions,
    moduleLinks: normalizeLinks(context?.node?.moduleLinks),
    source: "local_fallback",
  };
}

function safeParseJson(raw) {
  if (!raw || typeof raw !== "string") return null;
  const text = raw
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
  try {
    return JSON.parse(text);
  } catch {
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      try {
        return JSON.parse(text.slice(firstBrace, lastBrace + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

function cleanString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => cleanString(item))
    .filter(Boolean)
    .slice(0, 6);
}

function withFallbackList(primary, ...fallbacks) {
  for (const list of [primary, ...fallbacks]) {
    if (Array.isArray(list) && list.length > 0) return list;
  }
  return [];
}

function normalizeLinks(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((link) => ({
      label: cleanString(link?.label),
      href: cleanString(link?.href),
    }))
    .filter((link) => link.label && link.href && link.href.startsWith("/"))
    .slice(0, 4);
}
