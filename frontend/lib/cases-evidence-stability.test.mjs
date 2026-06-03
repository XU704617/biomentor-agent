import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const frontendRoot = join(__dirname, "..");
const repoRoot = join(frontendRoot, "..");

const frontendPath = (...parts) => join(frontendRoot, ...parts);
const repoPath = (...parts) => join(repoRoot, ...parts);

function readFrontend(...parts) {
  return readFileSync(frontendPath(...parts), "utf8");
}

function extractIndustryCases() {
  const source = readFrontend("data/industryCases.ts");
  const match = source.match(
    /export const industryCases: IndustryCase\[\] = (\[[\s\S]*?\]);\n\nexport const industryDirections/,
  );
  assert.ok(match, "industryCases array should be present and parseable");
  return JSON.parse(match[1]);
}

function searchableText(caseItem) {
  return [
    caseItem.title,
    caseItem.subtitle,
    caseItem.category,
    caseItem.industryDirection,
    caseItem.realProductOrTechnology,
    caseItem.coreProblem,
    ...(caseItem.relatedKnowledgePoints || []),
    ...(caseItem.recommendedKeywords || []),
  ].join(" ").toLowerCase();
}

test("industry fallback contains complete and enriched case library", () => {
  const cases = extractIndustryCases();

  assert.ok(cases.length >= 23, `expected at least 23 cases, got ${cases.length}`);
  assert.ok(cases.length >= 30 && cases.length <= 35, `expected enriched library around 30-35 cases, got ${cases.length}`);

  const categories = new Set(cases.map((item) => item.category).filter(Boolean));
  assert.ok(categories.size > 1, "category filter should have real categories beyond all-cases");

  for (const query of ["mRNA", "CAR-T", "CRISPR", "PET", "Venetoclax", "BCL-2"]) {
    const hits = cases.filter((item) => searchableText(item).includes(query.toLowerCase()));
    assert.ok(hits.length > 0, `expected fallback search hit for ${query}`);
  }
});

test("industry fallback keeps backend-first behavior and local fallback", () => {
  const industryApi = readFrontend("lib/industryApi.ts");
  const casesPage = readFrontend("app/cases/page.tsx");

  assert.match(industryApi, /\/api\/industry\/cases\?page_size=100/);
  assert.match(industryApi, /return mockCases/);
  assert.match(casesPage, /\/api\/industry\/cases\?page_size=100/);
  assert.match(casesPage, /setAllCases\(localCases\)/);
});

test("new enriched cases have traceable source notes", () => {
  const cases = extractIndustryCases();
  const notes = readFileSync(repoPath("docs/CASE_SOURCE_NOTES.md"), "utf8");
  const newCaseIds = ["case-024", "case-025", "case-026", "case-027", "case-028", "case-029", "case-030"];

  for (const id of newCaseIds) {
    const item = cases.find((caseItem) => caseItem.id === id);
    assert.ok(item, `expected ${id} in frontend fallback`);
    assert.ok(item.sourceUrls.length >= 1, `${id} should keep source URLs`);
    assert.match(notes, new RegExp(id), `${id} should be recorded in CASE_SOURCE_NOTES`);
    assert.match(notes, new RegExp(item.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `${id} title should be recorded`);
  }

  assert.doesNotMatch(notes, /wikipedia|个人博客|营销软文/i);
});

test("local curated literature covers core research keywords", () => {
  const knowledgeSearch = readFrontend("lib/knowledgeSearch.ts");

  const expectedLocalItems = [
    "local-lit-mrna-bnt162b2",
    "local-lit-cart-kymriah",
    "local-lit-crispr-jinek",
    "local-lit-pet-depolymerase",
    "local-lit-venetoclax",
    "local-lit-pd1",
    "local-lit-adc-enhertu",
    "local-lit-aav-sma",
    "local-lit-sirna-patisiran",
    "local-lit-liquid-biopsy-guardant",
    "local-lit-synbio-artemisinic",
    "local-lit-protein-design-alphafold",
  ];

  for (const id of expectedLocalItems) {
    assert.match(knowledgeSearch, new RegExp(id), `missing ${id}`);
  }

  for (const keyword of ["mRNA", "CAR-T", "CRISPR", "PET", "Venetoclax", "PD-1", "PD-L1", "ADC", "AAV", "siRNA", "liquid biopsy", "synthetic biology"]) {
    assert.match(knowledgeSearch.toLowerCase(), new RegExp(keyword.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `missing keyword ${keyword}`);
  }

  assert.match(knowledgeSearch, /searchLocalLiteratureByKeywords/);
  assert.match(knowledgeSearch, /source_label: "本地精选"/);
});

test("local curated literature does not use placeholder identifiers", () => {
  const knowledgeSearch = readFrontend("lib/knowledgeSearch.ts");
  const dois = [...knowledgeSearch.matchAll(/doi: "([^"]+)"/g)].map((match) => match[1]);
  const pmids = [...knowledgeSearch.matchAll(/pmid: "([^"]+)"/g)].map((match) => match[1]);

  assert.doesNotMatch(knowledgeSearch, /DOI 待补|PMID 待补|doi:\s*"待|pmid:\s*"待/);
  dois.forEach((doi) => assert.match(doi, /^10\./, `unexpected DOI format: ${doi}`));
  pmids.forEach((pmid) => assert.match(pmid, /^\d+$/, `unexpected PMID format: ${pmid}`));
});

test("evidence note generation is guarded and visible in the task panel", () => {
  const evidenceApi = readFrontend("lib/evidenceApi.ts");
  const panel = readFrontend("components/EvidenceLinkPanel.tsx");

  assert.match(evidenceApi, /selected_papers\.length === 0/);
  assert.match(evidenceApi, /请先选择参考文献/);
  assert.match(evidenceApi, /selected_count: selected\.length/);
  assert.match(evidenceApi, /边界说明/);
  assert.match(evidenceApi, /不是完整文献综述/);

  assert.match(panel, /disabled=\{selectedCount === 0/);
  assert.match(panel, /文献支撑笔记 · 基于 \{noteResult\.selected_count\} 篇参考文献/);
  assert.match(panel, /本地精选/);
  assert.match(panel, /公开文献/);
});

test("research page avoids blank literature navigation and task-card wording", () => {
  const researchPage = readFrontend("app/research/page.tsx");

  assert.doesNotMatch(researchPage, /href="\/explore"/);
  assert.doesNotMatch(researchPage, /已接入文献|已接入文献材料|科研任务卡|任务卡/);
  assert.match(researchPage, /本地精选文献/);
  assert.match(researchPage, /训练任务/);
});
