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
