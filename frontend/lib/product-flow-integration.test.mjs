import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const frontendPath = (...parts) => {
  const cwd = process.cwd();
  return cwd.endsWith("/frontend") ? join(cwd, ...parts) : join(cwd, "frontend", ...parts);
};

test("navigation and home modules put knowledge map before bio tools", () => {
  const navbar = readFileSync(frontendPath("components/Navbar.tsx"), "utf8");
  const home = readFileSync(frontendPath("app/page.tsx"), "utf8");

  assert.ok(navbar.indexOf('href: "/knowledge-map"') < navbar.indexOf('href: "/tools"'));
  assert.ok(home.indexOf('href: "/knowledge-map"') < home.indexOf('href: "/tools"'));
});

test("seminar source screen exposes file upload and knowledge-base import", () => {
  const seminar = readFileSync(frontendPath("app/seminar/page.tsx"), "utf8");

  assert.match(seminar, /上传文件/);
  assert.match(seminar, /知识库导入|从知识库导入/);
  assert.match(seminar, /paper-workbench|knowledgePapers|getSelectedPapers/);
});

test("seminar brief, defense and report stages expose return paths", () => {
  const seminar = readFileSync(frontendPath("app/seminar/page.tsx"), "utf8");

  assert.match(seminar, /resetSeminar/);
  assert.match(seminar, /返回导入材料/);
  assert.match(seminar, /返回 Brief/);
  assert.match(seminar, /重新导入材料|重新开始答辩/);
});

test("seminar imports explicit backend workbench papers instead of silently using the first local demo", () => {
  const seminar = readFileSync(frontendPath("app/seminar/page.tsx"), "utf8");

  assert.match(seminar, /biomentor:backend-paper-workbench/);
  assert.match(seminar, /selectedKnowledgePaperIds/);
  assert.match(seminar, /导入已勾选文献|选择要导入的文献/);
  assert.doesNotMatch(seminar, /题目：\$\{papers\[0\]\.direction\} 方向文献答辩/);
});

test("protein explorer explains empty search results instead of failing silently", () => {
  const proteinPage = readFileSync(frontendPath("app/tools/protein/page.tsx"), "utf8");

  assert.match(proteinPage, /未找到匹配结构/);
  assert.match(proteinPage, /UniProt\/RCSB\/AlphaFold/);
  assert.match(proteinPage, /英文全名、基因名、PDB ID 或 UniProt ID/);
  assert.match(proteinPage, /常见结构|不是所有蛋白/);
});

test("pathway graph explains that public pathway search may not return every pathway", () => {
  const pathwayPage = readFileSync(frontendPath("app/tools/pathway/page.tsx"), "utf8");

  assert.match(pathwayPage, /常见通路|公共通路数据库/);
  assert.match(pathwayPage, /不是所有通路|查不到/);
});

test("tool AI chat scrolls to the newest generated answer", () => {
  const chat = readFileSync(frontendPath("components/BioMentorToolChat.tsx"), "utf8");

  assert.match(chat, /messagesEndRef/);
  assert.match(chat, /scrollIntoView/);
  assert.match(chat, /data-testid="tool-chat-messages"/);
});

test("mind map recommendations stay inside useful knowledge or seminar flows", () => {
  const mindmap = readFileSync(frontendPath("app/knowledge-map/mindmap/page.tsx"), "utf8");

  assert.doesNotMatch(mindmap, /href=\{`\/explore`\}/);
  assert.match(mindmap, /导入答辩|文献详情|\/seminar\?/);
  assert.doesNotMatch(mindmap, /已掌握|需复习|未学习|薄弱/);
  assert.match(mindmap, /viewBox="0 0 980 760"/);
});

test("browser-side backend modules default to same-origin API paths", () => {
  const files = [
    "frontend/lib/bioToolApi.ts",
    "frontend/lib/photoLearningPipeline.ts",
    "frontend/app/paper-library/page.tsx",
    "frontend/app/paper-workbench/page.tsx",
  ];

  for (const file of files) {
    const source = readFileSync(frontendPath(file.replace(/^frontend\//, "")), "utf8");
    assert.doesNotMatch(source, /http:\/\/localhost:8000/, `${file} should not send end-user browsers to localhost`);
  }
});

test("knowledge exploration extracts uploaded PDF text before asking AI to analyze it", () => {
  const analyzeRoute = readFileSync(frontendPath("app/api/analyze/route.ts"), "utf8");
  const explorePage = readFileSync(frontendPath("app/explore/page.tsx"), "utf8");

  assert.match(analyzeRoute, /extractUploadedFileTextFromBuffer/);
  assert.doesNotMatch(explorePage, /PDF 直连 DeepSeek/);
});

test("seminar PDF upload avoids the pdf-parse debug entrypoint", () => {
  const extractor = readFileSync(frontendPath("lib/defense-file-text.mjs"), "utf8");

  assert.doesNotMatch(extractor, /pdf-parse\/lib\/pdf-parse\.js/);
  assert.match(extractor, /import\("pdf-parse"\)/);
  assert.ok(extractor.indexOf("extractVisiblePdfText(buffer)") < extractor.indexOf('import("pdf-parse")'));
});

test("knowledge map uses a larger unframed graph canvas with wrapped labels", () => {
  const source = readFileSync(frontendPath("app/knowledge-map/page.tsx"), "utf8");

  assert.match(source, /viewBox="0 0 1040 840"/);
  assert.match(source, /splitKnowledgeLabel/);
  assert.doesNotMatch(source, /rounded-\[34px\] border border-white\/85 bg-white\/50/);
});
