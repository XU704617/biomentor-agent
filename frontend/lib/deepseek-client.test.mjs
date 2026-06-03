import test from "node:test";
import assert from "node:assert/strict";

import {
  callDeepSeekJson,
  resolveDeepSeekConfig,
} from "./deepseek-client.mjs";

test("resolveDeepSeekConfig accepts server-side key aliases without exposing them to the client", () => {
  const config = resolveDeepSeekConfig({
    BIOMENTOR_DEEPSEEK_API_KEY: "server-key",
    DEEPSEEK_MODEL: "deepseek-v4-flash",
  });

  assert.equal(config.apiKey, "server-key");
  assert.equal(config.model, "deepseek-v4-flash");
  assert.equal(config.baseUrl, "https://api.deepseek.com");
});

test("resolveDeepSeekConfig normalizes base URLs that already include the v1 path", () => {
  const config = resolveDeepSeekConfig({
    DEEPSEEK_API_KEY: "server-key",
    DEEPSEEK_BASE_URL: "https://api.deepseek.com/v1/",
  });

  assert.equal(config.baseUrl, "https://api.deepseek.com");
});

test("callDeepSeekJson sends messages to the chat completions API and parses JSON content", async () => {
  const calls = [];
  const result = await callDeepSeekJson({
    env: { DEEPSEEK_API_KEY: "test-key", DEEPSEEK_MODEL: "deepseek-v4-flash" },
    fetchImpl: async (url, init) => {
      calls.push({ url, init });
      return {
        ok: true,
        status: 200,
        async json() {
          return {
            choices: [
              {
                message: {
                  content: "```json\n{\"answer\":\"真实模型回答\",\"terms\":[\"amylase\"]}\n```",
                },
              },
            ],
          };
        },
      };
    },
    messages: [{ role: "user", content: "测试" }],
  });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://api.deepseek.com/v1/chat/completions");
  const body = JSON.parse(calls[0].init.body);
  assert.equal(body.model, "deepseek-v4-flash");
  assert.deepEqual(result.parsed, { answer: "真实模型回答", terms: ["amylase"] });
  assert.equal(result.raw, "```json\n{\"answer\":\"真实模型回答\",\"terms\":[\"amylase\"]}\n```");
});

test("callDeepSeekJson reports missing key instead of pretending remote AI was used", async () => {
  await assert.rejects(
    () => callDeepSeekJson({
      env: {},
      fetchImpl: async () => {
        throw new Error("should not fetch");
      },
      messages: [{ role: "user", content: "测试" }],
    }),
    /DEEPSEEK_API_KEY/,
  );
});
