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
  const target = new URL(`${BACKEND_BASE}/api/photo-learning/${cleanPath}`);
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
  const contentType = request.headers.get("content-type") || "";
  const isMultipart = hasBody && contentType.includes("multipart/form-data");
  const body = hasBody
    ? isMultipart
      ? await rebuildMultipartFormData(request)
      : Buffer.from(await request.arrayBuffer())
    : undefined;

  if (isMultipart) {
    headers.delete("content-type");
  }

  const response = await fetch(target, {
    method,
    headers,
    body:
      body instanceof FormData
        ? body
        : body && body.length > 0
          ? body
          : undefined,
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

async function rebuildMultipartFormData(request: NextRequest) {
  const source = await request.formData();
  const target = new FormData();

  for (const [key, value] of source.entries()) {
    if (value instanceof File) {
      const fileBuffer = Buffer.from(await value.arrayBuffer());
      const fileBlob = new Blob([fileBuffer], {
        type: value.type || "application/octet-stream",
      });
      target.append(key, fileBlob, value.name);
      continue;
    }
    target.append(key, String(value));
  }

  return target;
}
