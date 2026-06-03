import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const frontendPath = (...parts) => {
  const cwd = process.cwd();
  return cwd.endsWith("/frontend") ? join(cwd, ...parts) : join(cwd, "frontend", ...parts);
};

const routeFiles = [
  "app/api/ai/tool-chat/route.ts",
  "app/api/ai/knowledge-chat/route.ts",
  "app/api/ai/defense/brief/route.ts",
  "app/api/ai/defense/next-question/route.ts",
  "app/api/ai/defense/report/route.ts",
];

test("AI routes for tools, knowledge map and seminar share the real DeepSeek client", () => {
  for (const file of routeFiles) {
    const source = readFileSync(frontendPath(file), "utf8");

    assert.match(source, /@\/lib\/deepseek-client\.mjs/, `${file} should import the shared client`);
    assert.match(source, /callDeepSeekJson|resolveDeepSeekConfig/, `${file} should use shared DeepSeek helpers`);
    assert.doesNotMatch(source, /fetch\(`\$\{baseUrl\}\/v1\/chat\/completions`/, `${file} should not reimplement chat fetch`);
  }
});
