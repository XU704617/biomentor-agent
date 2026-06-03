import { extractPlainTextFromOfficeXml } from "./defense-flow.mjs";

export async function extractUploadedFileTextFromBuffer(fileName, buffer) {
  const name = String(fileName || "").toLowerCase();
  const bytes = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer || []);

  if (/\.(txt|md|csv)$/i.test(name)) return bytes.toString("utf8");
  if (/\.pdf$/i.test(name)) return extractPdfText(bytes);
  if (/\.docx$/i.test(name)) {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer: bytes });
    return result.value || "";
  }
  if (/\.pptx$/i.test(name)) return extractPptxText(bytes);
  if (/\.ppt$/i.test(name)) {
    return bytes.toString("utf8").replace(/[^\x20-\x7E\u4e00-\u9fa5。，""！？；：、\n]/g, " ");
  }

  return bytes.toString("utf8");
}

async function extractPdfText(buffer) {
  const errors = [];
  const legacyParser = await loadLegacyPdfParser();
  if (legacyParser) {
    try {
      const result = await legacyParser(buffer);
      return result.text || "";
    } catch (error) {
      errors.push(error);
    }
  }

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

  const fallbackText = extractVisiblePdfText(buffer);
  if (fallbackText) return fallbackText;

  throw errors[0] || new Error("Unsupported pdf-parse API");
}

async function loadLegacyPdfParser() {
  try {
    const mod = await import("pdf-parse/lib/pdf-parse.js");
    if (typeof mod.default === "function") return mod.default;
    if (typeof mod === "function") return mod;
  } catch {
    return null;
  }
  return null;
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

  for (const match of source.matchAll(/\[((?:.|\r|\n)*?)\]\s*TJ/g)) {
    chunks.push(...extractPdfLiteralStrings(match[1]));
  }
  for (const match of source.matchAll(/\(((?:\\.|[^\\)])*)\)\s*Tj/g)) {
    chunks.push(decodePdfLiteralString(match[1]));
  }

  return chunks
    .map((item) => item.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n")
    .trim();
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
