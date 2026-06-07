import { NextRequest, NextResponse } from "next/server";

const FASTAPI_BACKEND =
  process.env.FASTAPI_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const topicCandidate = [
      body?.topic,
      body?.case_title,
      body?.caseTitle,
      body?.core_question,
      body?.coreQuestion,
      body?.query,
    ].find((value) => typeof value === "string" && value.trim().length > 0);

    if (!body || typeof topicCandidate !== "string") {
      return NextResponse.json({ error: "缺少 topic 参数" }, { status: 400 });
    }

    const topic = topicCandidate.trim();
    if (!topic) {
      return NextResponse.json({ error: "topic 不能为空" }, { status: 400 });
    }
    const caseKey =
      typeof body.case_key === "string" && body.case_key.trim()
        ? body.case_key.trim()
        : typeof body.caseId === "string" && body.caseId.trim()
        ? body.caseId.trim()
        : null;
    const mode = body.mode === "case_driven" || caseKey ? "case_driven" : "independent";

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000);

    try {
      const response = await fetch(`${FASTAPI_BACKEND}/api/research/generate-task`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          case_key: caseKey,
          case_title: typeof body.case_title === "string" ? body.case_title : typeof body.caseTitle === "string" ? body.caseTitle : undefined,
          core_question: typeof body.core_question === "string" ? body.core_question : typeof body.coreQuestion === "string" ? body.coreQuestion : undefined,
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
