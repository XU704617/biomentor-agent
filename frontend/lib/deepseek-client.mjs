import fs from "node:fs";
import path from "node:path";

const DEFAULT_BASE_URL = "https://api.deepseek.com";
const DEFAULT_MODEL = "deepseek-v4-flash";

/**
 * @typedef {{ role: string, content: string }} DeepSeekMessage
 * @typedef {{
 *   env?: NodeJS.ProcessEnv | Record<string, string | undefined>,
 *   fetchImpl?: typeof fetch,
 *   messages: DeepSeekMessage[],
 *   temperature?: number,
 *   maxTokens?: number,
 *   responseFormat?: boolean,
 *   signal?: AbortSignal
 * }} CallDeepSeekJsonOptions
 */

export function resolveDeepSeekConfig(env = process.env) {
  const fileEnv = readFrontendEnvFile();
  const apiKey =
    clean(env.DEEPSEEK_API_KEY) ||
    clean(env.BIOMENTOR_DEEPSEEK_API_KEY) ||
    clean(fileEnv.DEEPSEEK_API_KEY) ||
    clean(fileEnv.BIOMENTOR_DEEPSEEK_API_KEY);
  const baseUrl = (
    clean(env.DEEPSEEK_BASE_URL) ||
    clean(fileEnv.DEEPSEEK_BASE_URL) ||
    DEFAULT_BASE_URL
  ).replace(/\/+$/, "");
  const model =
    clean(env.DEEPSEEK_MODEL) ||
    clean(fileEnv.DEEPSEEK_MODEL) ||
    DEFAULT_MODEL;

  return { apiKey, baseUrl, model };
}

/**
 * @param {CallDeepSeekJsonOptions} options
 */
export async function callDeepSeekJson({
  env = process.env,
  fetchImpl = fetch,
  messages,
  temperature = 0.35,
  maxTokens = 1200,
  responseFormat = true,
  signal,
} = {}) {
  const config = resolveDeepSeekConfig(env);
  if (!config.apiKey) {
    throw new Error("DEEPSEEK_API_KEY is not configured");
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error("messages are required");
  }

  const body = {
    model: config.model,
    messages,
    temperature,
    max_tokens: maxTokens,
  };
  if (responseFormat) body.response_format = { type: "json_object" };

  const response = await fetchImpl(`${config.baseUrl}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    throw new Error(`DeepSeek API error: ${response.status}`);
  }

  const data = await response.json();
  const raw = data?.choices?.[0]?.message?.content || "";
  if (!raw) {
    throw new Error("DeepSeek response content is empty");
  }

  return {
    raw,
    parsed: parseJsonLike(raw),
  };
}

export function parseJsonLike(raw) {
  const text = String(raw || "")
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
  try {
    return JSON.parse(text);
  } catch {
    const first = text.indexOf("{");
    const last = text.lastIndexOf("}");
    if (first >= 0 && last > first) {
      return JSON.parse(text.slice(first, last + 1));
    }
    throw new Error("DeepSeek response is not valid JSON");
  }
}

function clean(value) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function readFrontendEnvFile() {
  try {
    const envPath = path.join(process.cwd(), ".env.local");
    if (!fs.existsSync(envPath)) return {};
    const raw = fs.readFileSync(envPath, "utf8");
    return Object.fromEntries(
      raw
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#") && line.includes("="))
        .map((line) => {
          const [key, ...rest] = line.split("=");
          return [key.trim(), rest.join("=").trim()];
        }),
    );
  } catch {
    return {};
  }
}
