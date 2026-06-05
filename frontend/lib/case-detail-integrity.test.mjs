import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const frontendRoot = join(__dirname, "..");
const repoRoot = join(frontendRoot, "..");

function readFrontend(...parts) {
  return readFileSync(join(frontendRoot, ...parts), "utf8");
}

function extractIndustryCases() {
  const source = readFrontend("data/industryCases.ts");
  const match = source.match(
    /export const industryCases: IndustryCase\[\] = (\[[\s\S]*?\]);\r?\n\r?\nexport const industryDirections/,
  );
  assert.ok(match, "industryCases array should be present and parseable");
  return JSON.parse(match[1]);
}

test("frontend fallback mirrors backend seed case keys and detail count", () => {
  const frontendCases = extractIndustryCases();
  const backendCases = JSON.parse(readFileSync(join(repoRoot, "backend/app/seed_data/industry_cases.json"), "utf8"));

  assert.equal(frontendCases.length, backendCases.length);
  assert.deepEqual(
    frontendCases.map((item) => item.id),
    backendCases.map((item) => item.case_key),
  );
});

test("frontend fallback carries complete detail fields for case-031 onward", () => {
  const cases = extractIndustryCases();

  for (const item of cases.filter((caseItem) => Number(caseItem.id.split("-").at(-1)) >= 31)) {
    assert.ok(item.background.length >= 120, `${item.id} should have detailed background`);
    assert.ok(item.researchFoundation.length >= 120, `${item.id} should have detailed research foundation`);
    assert.ok(item.applicationScenario.length >= 80, `${item.id} should have detailed application scenario`);
    assert.ok(item.applicationValue.length >= 80, `${item.id} should have detailed application value`);
    assert.ok(item.notes.length >= 80, `${item.id} should keep notes`);
    assert.ok(item.guideQuestions.length >= 3, `${item.id} should keep discussion questions`);
    assert.ok(item.references.length >= 1, `${item.id} should keep references`);
  }
});

test("detail modal renders real detail fields and hides empty sections", () => {
  const modal = readFrontend("components/IndustryCaseDetailModal.tsx");

  assert.match(modal, /guideQuestions/);
  assert.match(modal, /hasText\(c\.background\)/);
  assert.match(modal, /hasText\(c\.researchFoundation\)/);
  assert.match(modal, /hasText\(c\.applicationScenario\)/);
  assert.match(modal, /hasText\(c\.applicationValue\)/);
  assert.match(modal, /hasText\(c\.notes\)/);
  assert.match(modal, /c\.references\.length > 0/);
  assert.match(modal, /cleanItems\(c\.migrationPath\.textbookBase\)/);
  assert.doesNotMatch(modal, /知识迁移 → →/);
});

test("frontend local research fallback uses case-detail context", () => {
  const researchApi = readFrontend("lib/researchApi.ts");

  assert.match(researchApi, /industryCases/);
  assert.match(researchApi, /case-detail-\$\{caseDetail\.id\}/);
  assert.match(researchApi, /source_type: "local_case_detail"/);
  assert.match(researchApi, /本地产业案例详情/);
  assert.match(researchApi, /caseDetail\.researchFoundation/);
});
