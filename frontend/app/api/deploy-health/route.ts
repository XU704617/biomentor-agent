import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function looksLocal(url: string): boolean {
  try {
    const hostname = new URL(url).hostname;
    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname === "::1"
    );
  } catch {
    return false;
  }
}

function getHost(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

export async function GET() {
  const FASTAPI_BACKEND =
    process.env.FASTAPI_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://127.0.0.1:9090";

  const backendConfigured = Boolean(
    process.env.FASTAPI_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL
  );

  const backendBaseUrlHost = getHost(FASTAPI_BACKEND);
  const backendBaseUrlLooksLocal = looksLocal(FASTAPI_BACKEND);

  const warnings: string[] = [];

  if (backendBaseUrlLooksLocal) {
    warnings.push(
      "Backend URL is localhost or 127.0.0.1, which is not reachable from Vercel deployment. Set FASTAPI_BACKEND_URL to a public address."
    );
  }

  if (!backendConfigured) {
    warnings.push(
      "Neither FASTAPI_BACKEND_URL nor NEXT_PUBLIC_API_BASE_URL is set. Backend connectivity will not work in production."
    );
  }

  let backendReachable = false;
  let casesCount = 0;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const healthRes = await fetch(`${FASTAPI_BACKEND}/api/health`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (healthRes.ok) {
        backendReachable = true;

        try {
          const casesRes = await fetch(
            `${FASTAPI_BACKEND}/api/industry/cases?page_size=100`,
            { signal: AbortSignal.timeout(10000) }
          );
          if (casesRes.ok) {
            const casesData = await casesRes.json();
            if (casesData?.items && Array.isArray(casesData.items)) {
              casesCount = casesData.items.length;
            }
          }
        } catch {
          warnings.push("Backend is reachable but /api/industry/cases check failed.");
        }
      } else {
        warnings.push(`Backend /api/health returned status ${healthRes.status}.`);
      }
    } catch {
      clearTimeout(timeout);
      warnings.push("Backend is not reachable. Check FASTAPI_BACKEND_URL or NEXT_PUBLIC_API_BASE_URL.");
    }
  } catch {
    warnings.push("Backend health check encountered an error.");
  }

  return NextResponse.json({
    frontend: "ok",
    backendConfigured,
    backendReachable,
    backendBaseUrlHost,
    backendBaseUrlLooksLocal,
    casesCount,
    warnings,
  });
}