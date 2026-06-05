import { NextRequest, NextResponse } from "next/server";

const FASTAPI_BACKEND =
  process.env.FASTAPI_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8000";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const question = typeof body.question === "string" ? body.question.trim() : "";
  if (!question) {
    return NextResponse.json({ error: "缺少 question 参数" }, { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch(`${FASTAPI_BACKEND}/api/research/tutor`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!response.ok) {
      return NextResponse.json(localTutor(body));
    }
    const data = await response.json();
    return NextResponse.json(data?.answer ? data : localTutor(body));
  } catch {
    clearTimeout(timeout);
    return NextResponse.json(localTutor(body));
  }
}

function localTutor(body: Record<string, unknown>) {
  const task = body.selected_task && typeof body.selected_task === "object"
    ? body.selected_task as Record<string, unknown>
    : {};
  return {
    source_mode: "local_fallback",
    answer: `可以先围绕「${task.title || "当前任务"}」把问题拆成研究目标、证据来源、方法设计和局限性四部分。建议先确认已选文献是否直接支持该判断；若没有直接证据，应写明当前资料不足，不能确认。`,
    evidence_used: [],
    suggested_next_questions: ["哪些证据能直接支持这个判断？", "实验对照应该如何设置？", "当前资料还有哪些不能证明？"],
    boundary: "该回答用于科研训练，不替代真实实验设计审批。",
  };
}
