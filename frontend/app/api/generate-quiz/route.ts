import { NextRequest, NextResponse } from "next/server";

import { callDeepSeekJson, resolveDeepSeekConfig } from "@/lib/deepseek-client.mjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const content = String(body.content || "").trim();

    if (!content) {
      return NextResponse.json({ success: false, error: "请提供教材内容" }, { status: 400 });
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
              "你是生物医学课程出题助手。",
              "请基于用户给出的学习内容生成练习题。",
              "严禁使用学习内容之外的事实、年份、机构、实验结果或背景知识。",
              "如果材料只提供了少量事实，题目也只能围绕这些事实展开。",
              "只返回合法 JSON，对象字段固定为 questions。",
              "questions 必须是数组，包含 8-10 题，并覆盖 choice、judge、fill 至少三种类型。",
              "每题必须包含 id, type, question, correctAnswer, explanation。",
              "choice 题必须额外包含 options，且 options 长度必须为 4。",
            ].join("\n"),
          },
          {
            role: "user",
            content: JSON.stringify(
              {
                content: content.slice(0, 6000),
                outputFormat: {
                  questions: [
                    {
                      id: 1,
                      type: "choice | judge | fill",
                      question: "题干",
                      options: ["A", "B", "C", "D"],
                      correctAnswer: "正确答案",
                      explanation: "简短解析",
                    },
                  ],
                },
                instruction: "题目和解析只能依据上面的 content 生成，不要扩展到 content 之外。",
              },
              null,
              2,
            ),
          },
        ],
        temperature: 0.2,
        maxTokens: 2200,
        responseFormat: true,
        signal: controller.signal,
      });

      const parsed = result.parsed;
      const questions = normalizeQuestions(parsed?.questions);
      if (questions.length < 5) {
        throw new Error("GLM 生成的题目数量不足");
      }

      return NextResponse.json({
        success: true,
        data: { questions },
      });
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "生成题目失败";
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}

function normalizeQuestions(value: unknown) {
  if (!Array.isArray(value)) return [];

  let nextId = 1;
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const type = String(item.type || "").trim().toLowerCase();
      const normalizedType =
        type === "choice" || type === "judge" || type === "fill" ? type : "";
      const question = String(item.question || "").trim();
      const correctAnswer = String(item.correctAnswer || item.answer || "").trim();
      const explanation = String(item.explanation || "").trim();
      const options = Array.isArray(item.options)
        ? item.options.map((option: unknown) => String(option).trim()).filter(Boolean).slice(0, 4)
        : [];

      if (!normalizedType || !question || !correctAnswer || !explanation) return null;
      if (normalizedType === "choice" && options.length !== 4) return null;

      return {
        id: nextId++,
        type: normalizedType,
        question,
        ...(normalizedType === "choice" ? { options } : {}),
        correctAnswer,
        explanation,
      };
    })
    .filter(Boolean);
}
