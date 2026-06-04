import { NextRequest, NextResponse } from "next/server";
import { generateLocalResearchTask } from "@/lib/researchApi";

const FASTAPI_BACKEND =
  process.env.FASTAPI_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body.topic !== "string") {
      return NextResponse.json({ error: "缺少 topic 参数" }, { status: 400 });
    }

    const topic = body.topic.trim();
    if (!topic) {
      return NextResponse.json({ error: "topic 不能为空" }, { status: 400 });
    }
    const mode = body.mode === "case_driven" ? "case_driven" : "independent";
    const caseKey = typeof body.case_key === "string" && body.case_key.trim() ? body.case_key.trim() : null;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(`${FASTAPI_BACKEND}/api/research/generate-task`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          case_key: caseKey,
          mode,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        return NextResponse.json(generateLocalResearchTask(topic, caseKey, mode));
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (fetchError) {
      clearTimeout(timeout);
      console.error("[research/generate-task] 转发失败:", fetchError instanceof Error ? fetchError.message : fetchError);
      return NextResponse.json(generateLocalResearchTask(topic, caseKey, mode));
    }
  } catch (err) {
    console.error("[research/generate-task] 未预期错误:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "内部服务错误" }, { status: 500 });
  }
}
