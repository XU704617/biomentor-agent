import { extractPlainTextFromOfficeXml } from "./defense-flow.mjs";
import { resolveDeepSeekConfig } from "./deepseek-client.mjs";
import { inflateSync } from "node:zlib";

export async function extractUploadedFileTextFromBuffer(fileName, buffer) {
  const name = String(fileName || "").toLowerCase();
  const bytes = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer || []);
  const glmParsedText = await tryGlmFileParse(name, bytes);

  if (glmParsedText) return glmParsedText;

  if (/\.(txt|md|csv)$/i.test(name)) return bytes.toString("utf8");
  if (/\.docx$/i.test(name)) {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer: bytes });
    return result.value || "";
  }
  if (/\.pdf$/i.test(name)) return extractPdfText(bytes);
  if (/\.pptx$/i.test(name)) return extractPptxText(bytes);
  if (/\.ppt$/i.test(name)) {
    return bytes.toString("utf8").replace(/[^\x20-\x7E\u4e00-\u9fa5。，""！？；：、\n]/g, " ");
  }

  return bytes.toString("utf8");
}

async function tryGlmFileParse(fileName, buffer) {
  const fileType = resolveGlmFileType(fileName);
  if (!fileType) return "";

  const { apiKey, baseUrl } = resolveDeepSeekConfig(process.env, { includeFileEnv: false });
  if (!apiKey) return "";

  const normalizedBase = String(baseUrl || "").replace(/\/+$/, "");
  if (!/bigmodel\.cn/i.test(normalizedBase)) return "";

  const form = new FormData();
  form.set("tool_type", "prime-sync");
  form.set("file_type", fileType);
  form.set("file", new Blob([buffer], { type: guessMimeType(fileName) }), fileName || `upload.${fileType}`);

  try {
    const response = await fetch(`${normalizedBase}/files/parser/sync`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: form,
    });
    if (!response.ok) return "";

    const payload = await response.json();
    return String(payload?.content || "").trim();
  } catch {
    return "";
  }
}

function resolveGlmFileType(fileName) {
  const name = String(fileName || "").toLowerCase();
  if (name.endsWith(".pdf")) return "pdf";
  if (name.endsWith(".doc")) return "doc";
  if (name.endsWith(".docx")) return "docx";
  if (name.endsWith(".ppt")) return "ppt";
  if (name.endsWith(".pptx")) return "pptx";
  if (name.endsWith(".xls")) return "xls";
  if (name.endsWith(".xlsx")) return "xlsx";
  if (name.endsWith(".csv")) return "csv";
  if (name.endsWith(".html") || name.endsWith(".htm")) return "html";
  if (name.endsWith(".txt")) return "txt";
  if (name.endsWith(".md")) return "md";
  if (name.endsWith(".wps")) return "wps";
  if (name.endsWith(".png")) return "png";
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "jpg";
  if (name.endsWith(".webp")) return "webp";
  if (name.endsWith(".bmp")) return "bmp";
  if (name.endsWith(".gif")) return "gif";
  if (name.endsWith(".heic")) return "heic";
  if (name.endsWith(".heif")) return "heif";
  if (name.endsWith(".eps")) return "eps";
  if (name.endsWith(".icns")) return "icns";
  if (name.endsWith(".im")) return "im";
  if (name.endsWith(".pcx")) return "pcx";
  if (name.endsWith(".ppm")) return "ppm";
  if (name.endsWith(".tif") || name.endsWith(".tiff")) return "tiff";
  if (name.endsWith(".xbm")) return "xbm";
  if (name.endsWith(".jp2")) return "jp2";
  return "";
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

async function extractPdfText(buffer) {
  const errors = [];

  const fallbackText = extractVisiblePdfText(buffer);
  if (fallbackText) return fallbackText;

  try {
    const pdfParse = await import("pdf-parse");

    if (typeof pdfParse.default === "function") {
      const result = await pdfParse.default(buffer);
      return result.text || "";
    }

    if (typeof pdfParse.PDFParse === "function") {
      const parser = new pdfParse.PDFParse({ data: buffer });
      const result = await parser.getText();
      return result.text || "";
    }
  } catch (error) {
    errors.push(error);
  }

  throw errors[0] || new Error("Unsupported pdf-parse API");
}

async function extractPptxText(buffer) {
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(buffer);
  const parts = Object.keys(zip.files)
    .filter((name) => /^ppt\/(slides|notesSlides)\/.*\.xml$/i.test(name))
    .sort();
  const texts = await Promise.all(
    parts.map(async (name) => extractPlainTextFromOfficeXml(await zip.files[name].async("string"))),
  );
  return texts.join("\n");
}

function extractVisiblePdfText(buffer) {
  const source = buffer.toString("latin1");
  const chunks = [];

  chunks.push(...extractPdfTextOperators(source));

  for (const stream of extractDecodedPdfStreams(source)) {
    chunks.push(...extractPdfTextOperators(stream));
  }

  return chunks
    .map((item) => item.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n")
    .trim();
}

function extractPdfTextOperators(source) {
  const chunks = [];

  for (const match of source.matchAll(/\[((?:.|\r|\n)*?)\]\s*TJ/g)) {
    chunks.push(...extractPdfLiteralStrings(match[1]));
  }
  for (const match of source.matchAll(/\(((?:\\.|[^\\)])*)\)\s*Tj/g)) {
    chunks.push(decodePdfLiteralString(match[1]));
  }

  return chunks;
}

function extractDecodedPdfStreams(source) {
  const decoded = [];
  for (const match of source.matchAll(/<<([\s\S]*?)>>\s*stream\r?\n?([\s\S]*?)\r?\n?endstream/g)) {
    const dictionary = match[1];
    const rawStream = match[2].replace(/\r?\n?$/, "");
    try {
      let bytes = Buffer.from(rawStream, "latin1");
      if (/ASCII85Decode/i.test(dictionary)) bytes = decodeAscii85(bytes.toString("latin1"));
      if (/FlateDecode/i.test(dictionary)) bytes = inflateSync(bytes);
      decoded.push(bytes.toString("latin1"));
    } catch {
      // Ignore streams that are images, binary metadata, or unsupported filters.
    }
  }
  return decoded;
}

function decodeAscii85(value) {
  const input = String(value || "")
    .replace(/^<~/, "")
    .replace(/~>$/, "")
    .replace(/\s+/g, "");
  const output = [];
  let group = [];

  for (const char of input) {
    if (char === "z" && group.length === 0) {
      output.push(0, 0, 0, 0);
      continue;
    }
    const code = char.charCodeAt(0);
    if (code < 33 || code > 117) continue;
    group.push(code - 33);
    if (group.length === 5) {
      appendAscii85Group(output, group, 4);
      group = [];
    }
  }

  if (group.length > 0) {
    const byteCount = group.length - 1;
    while (group.length < 5) group.push(84);
    appendAscii85Group(output, group, byteCount);
  }

  return Buffer.from(output);
}

function appendAscii85Group(output, group, byteCount) {
  let value = 0;
  for (const digit of group) value = value * 85 + digit;
  const bytes = [
    (value >>> 24) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 8) & 0xff,
    value & 0xff,
  ];
  output.push(...bytes.slice(0, byteCount));
}

function extractPdfLiteralStrings(source) {
  return [...source.matchAll(/\(((?:\\.|[^\\)])*)\)/g)].map((match) => decodePdfLiteralString(match[1]));
}

function decodePdfLiteralString(value) {
  return value
    .replace(/\\([0-7]{1,3})/g, (_, octal) => String.fromCharCode(parseInt(octal, 8)))
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\b/g, "\b")
    .replace(/\\f/g, "\f")
    .replace(/\\([()\\])/g, "$1");
}
