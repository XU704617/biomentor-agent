import { NextRequest, NextResponse } from "next/server";

const FASTAPI_BACKEND =
  process.env.FASTAPI_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8000";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const question = typeof body.question === "string" ? body.question.trim() : "";
  if (!question) {
    return NextResponse.json({ error: "question is required" }, { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120000);
  try {
    const response = await fetch(`${FASTAPI_BACKEND}/api/research/tutor`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      return NextResponse.json({ error: text || "Tutor API request failed" }, { status: 502 });
    }

    const data = await response.json();
    if (!data?.answer) {
      return NextResponse.json({ error: "Tutor API returned empty answer" }, { status: 502 });
    }

    return NextResponse.json(data);
  } catch (error) {
    clearTimeout(timeout);
    const message = error instanceof Error ? error.message : "Tutor API request failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
