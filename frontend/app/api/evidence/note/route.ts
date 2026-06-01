import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const FASTAPI_BACKEND =
  process.env.FASTAPI_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    const upstream = new URL(
      `/api/evidence/note`,
      FASTAPI_BACKEND
    );

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(upstream.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text().catch(() => "unknown");
        return NextResponse.json(
          {
            note: "",
            selected_count: 0,
            error: `evidence note 后端返回错误 ${response.status}`,
            message: `后端服务异常: ${errorText.slice(0, 200)}`,
          },
          { status: 200 }
        );
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (fetchError) {
      clearTimeout(timeout);
      console.error(
        "[evidence/note] 转发失败:",
        fetchError instanceof Error ? fetchError.message : fetchError
      );
      return NextResponse.json(
        {
          note: "",
          selected_count: 0,
          error: "evidence note 服务不可用",
          message: "evidence note 生成服务暂不可用，请稍后重试",
        },
        { status: 200 }
      );
    }
  } catch (err) {
    console.error(
      "[evidence/note] 未预期错误:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      {
        note: "",
        selected_count: 0,
        error: "内部服务错误",
        message: "evidence note 内部错误",
      },
      { status: 200 }
    );
  }
}
