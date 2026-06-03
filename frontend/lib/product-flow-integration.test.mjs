import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("navigation and home modules put knowledge map before bio tools", () => {
  const navbar = readFileSync("frontend/components/Navbar.tsx", "utf8");
  const home = readFileSync("frontend/app/page.tsx", "utf8");

  assert.ok(navbar.indexOf('href: "/knowledge-map"') < navbar.indexOf('href: "/tools"'));
  assert.ok(home.indexOf('href: "/knowledge-map"') < home.indexOf('href: "/tools"'));
});

test("seminar source screen exposes file upload and knowledge-base import", () => {
  const seminar = readFileSync("frontend/app/seminar/page.tsx", "utf8");

  assert.match(seminar, /上传文件/);
  assert.match(seminar, /知识库导入|从知识库导入/);
  assert.match(seminar, /paper-workbench|knowledgePapers|getSelectedPapers/);
});

test("seminar report screen exposes a restart path back to source import", () => {
  const seminar = readFileSync("frontend/app/seminar/page.tsx", "utf8");

  assert.match(seminar, /resetSeminar/);
  assert.match(seminar, /重新导入材料|重新开始答辩/);
});

test("protein explorer explains empty search results instead of failing silently", () => {
  const proteinPage = readFileSync("frontend/app/tools/protein/page.tsx", "utf8");

  assert.match(proteinPage, /未找到匹配结构/);
  assert.match(proteinPage, /UniProt\/RCSB\/AlphaFold/);
  assert.match(proteinPage, /英文全名、基因名、PDB ID 或 UniProt ID/);
});

test("browser-side backend modules default to same-origin API paths", () => {
  const files = [
    "frontend/lib/bioToolApi.ts",
    "frontend/lib/photoLearningPipeline.ts",
    "frontend/app/paper-library/page.tsx",
    "frontend/app/paper-workbench/page.tsx",
  ];

  for (const file of files) {
    const source = readFileSync(file, "utf8");
    assert.doesNotMatch(source, /http:\/\/localhost:8000/, `${file} should not send end-user browsers to localhost`);
  }
});

test("knowledge exploration extracts uploaded PDF text before asking AI to analyze it", () => {
  const analyzeRoute = readFileSync("frontend/app/api/analyze/route.ts", "utf8");
  const explorePage = readFileSync("frontend/app/explore/page.tsx", "utf8");

  assert.match(analyzeRoute, /extractUploadedFileTextFromBuffer/);
  assert.doesNotMatch(explorePage, /PDF 直连 DeepSeek/);
});

test("knowledge map uses a larger unframed graph canvas with wrapped labels", () => {
  const source = readFileSync("frontend/app/knowledge-map/page.tsx", "utf8");

  assert.match(source, /viewBox="0 0 1040 840"/);
  assert.match(source, /splitKnowledgeLabel/);
  assert.doesNotMatch(source, /rounded-\[34px\] border border-white\/85 bg-white\/50/);
});
