import { extractPlainTextFromOfficeXml } from "./defense-flow.mjs";
import { inflateSync } from "node:zlib";

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
