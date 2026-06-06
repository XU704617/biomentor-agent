import { NextRequest, NextResponse } from "next/server";

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
    const timeout = setTimeout(() => controller.abort(), 120000);

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
        const text = await response.text().catch(() => "");
        return NextResponse.json(
          { error: text || "Research task generation failed" },
          { status: response.status || 502 },
        );
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (fetchError) {
      clearTimeout(timeout);
      const message = fetchError instanceof Error ? fetchError.message : "Research task request failed";
      return NextResponse.json({ error: message }, { status: 502 });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
