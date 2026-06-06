import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BACKEND_BASE = (
  process.env.FASTAPI_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://127.0.0.1:10087"
)
  .trim()
  .replace(/\/+$/, "");

function buildTargetUrl(request: NextRequest, path: string[]) {
  const cleanPath = path.join("/").replace(/^\/+/, "");
  const target = new URL(`${BACKEND_BASE}/api/system/${cleanPath}`);
  target.search = request.nextUrl.search;
  return target;
}

async function proxy(request: NextRequest, context: { params: { path: string[] } }) {
  const path = Array.isArray(context.params.path) ? context.params.path : [];
  const target = buildTargetUrl(request, path);

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("content-length");
  headers.delete("expect");
  headers.delete("connection");
  headers.delete("transfer-encoding");

  const method = request.method.toUpperCase();
  const hasBody = method !== "GET" && method !== "HEAD";
  const rawBody = hasBody ? Buffer.from(await request.arrayBuffer()) : undefined;

  const response = await fetch(target, {
    method,
    headers,
    body: rawBody && rawBody.length > 0 ? rawBody : undefined,
    cache: "no-store",
    redirect: "manual",
  });

  const responseHeaders = new Headers(response.headers);
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");

  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;
export const HEAD = proxy;
