import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const FASTAPI_BACKEND =
  process.env.FASTAPI_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8000";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const limit = searchParams.get("limit") || "5";

    const upstream = new URL(
      `/api/literature/search?q=${encodeURIComponent(q)}&limit=${encodeURIComponent(limit)}`,
      FASTAPI_BACKEND
    );

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(upstream.toString(), {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text().catch(() => "unknown");
        return NextResponse.json(
          { error: `后端返回错误 ${response.status}: ${errorText.slice(0, 200)}` },
          { status: response.status }
        );
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (fetchError) {
      clearTimeout(timeout);
      console.error(
        "[literature/search] 转发失败:",
        fetchError instanceof Error ? fetchError.message : fetchError
      );
      return NextResponse.json(
        { error: "文献检索服务不可用，请稍后重试" },
        { status: 502 }
      );
    }
  } catch (err) {
    console.error(
      "[literature/search] 未预期错误:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json({ error: "内部服务错误" }, { status: 500 });
  }
}
