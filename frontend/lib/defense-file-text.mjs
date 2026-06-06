const FASTAPI_BACKEND =
  process.env.FASTAPI_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://127.0.0.1:10087";

export async function extractUploadedFileTextFromBuffer(fileName, buffer) {
  const bytes = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer || []);
  if (!bytes.length) return "";

  const form = new FormData();
  form.set("file", new Blob([bytes], { type: guessMimeType(fileName) }), fileName || "upload.bin");

  const response = await fetch(`${FASTAPI_BACKEND}/api/photo-learning/ocr`, {
    method: "POST",
    body: form,
    cache: "no-store",
  });

  const raw = await response.text();
  let payload = null;
  try {
    payload = raw ? JSON.parse(raw) : null;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(
      payload?.detail ||
      payload?.error ||
      raw ||
      "Backend OCR request failed",
    );
  }

  return String(payload?.text || "").trim();
}

function guessMimeType(fileName) {
  const name = String(fileName || "").toLowerCase();
  if (name.endsWith(".pdf")) return "application/pdf";
  if (name.endsWith(".doc")) return "application/msword";
  if (name.endsWith(".docx")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (name.endsWith(".ppt")) return "application/vnd.ms-powerpoint";
  if (name.endsWith(".pptx")) return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
  if (name.endsWith(".xls")) return "application/vnd.ms-excel";
  if (name.endsWith(".xlsx")) return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  if (name.endsWith(".csv")) return "text/csv";
  if (name.endsWith(".html") || name.endsWith(".htm")) return "text/html";
  if (name.endsWith(".txt")) return "text/plain";
  if (name.endsWith(".md")) return "text/markdown";
  if (name.endsWith(".wps")) return "application/vnd.ms-works";
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
  if (name.endsWith(".webp")) return "image/webp";
  if (name.endsWith(".bmp")) return "image/bmp";
  if (name.endsWith(".gif")) return "image/gif";
  if (name.endsWith(".heic")) return "image/heic";
  if (name.endsWith(".heif")) return "image/heif";
  if (name.endsWith(".eps")) return "application/postscript";
  if (name.endsWith(".icns")) return "image/x-icon";
  if (name.endsWith(".pcx")) return "image/x-pcx";
  if (name.endsWith(".ppm")) return "image/x-portable-pixmap";
  if (name.endsWith(".tif") || name.endsWith(".tiff")) return "image/tiff";
  if (name.endsWith(".xbm")) return "image/x-xbitmap";
  if (name.endsWith(".jp2")) return "image/jp2";
  return "application/octet-stream";
}
