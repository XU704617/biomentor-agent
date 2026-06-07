import fs from "node:fs";
import path from "node:path";

const DEFAULT_BASE_URL = "https://open.bigmodel.cn/api/paas/v4";
const DEFAULT_MODEL = "glm-4-flash";

/**
 * @typedef {{ role: string, content: string | Array<unknown> }} DeepSeekMessage
 * @typedef {{
 *   env?: NodeJS.ProcessEnv | Record<string, string | undefined>,
 *   fetchImpl?: typeof fetch,
 *   messages: DeepSeekMessage[],
 *   temperature?: number,
 *   maxTokens?: number,
 *   responseFormat?: boolean,
 *   signal?: AbortSignal,
 *   retries?: number,
 *   disableThinking?: boolean,
 *   extraBody?: Record<string, unknown>
 * }} CallDeepSeekJsonOptions
 */

export function resolveDeepSeekConfig(env = process.env, options = {}) {
  const fileEnv = options.includeFileEnv === false ? {} : readFrontendEnvFile();
  const apiKey =
    clean(env.DEEPSEEK_API_KEY) ||
    clean(env.BIOMENTOR_DEEPSEEK_API_KEY) ||
    clean(fileEnv.DEEPSEEK_API_KEY) ||
    clean(fileEnv.BIOMENTOR_DEEPSEEK_API_KEY);
  const baseUrl = normalizeBaseUrl(
    clean(env.DEEPSEEK_BASE_URL) ||
    clean(fileEnv.DEEPSEEK_BASE_URL) ||
    DEFAULT_BASE_URL,
  );
  const model =
    clean(env.DEEPSEEK_MODEL) ||
    clean(fileEnv.DEEPSEEK_MODEL) ||
    DEFAULT_MODEL;

  return {
    apiKey,
    baseUrl,
    model,
    chatCompletionsUrl: buildChatCompletionsUrl(baseUrl),
  };
}

/**
 * @param {CallDeepSeekJsonOptions} options
 */
export async function callDeepSeekJson(options = {}) {
  const {
    env = process.env,
    fetchImpl = fetch,
    messages,
    temperature = 0.35,
    maxTokens = 1200,
    responseFormat = true,
    signal,
    retries = 2,
    disableThinking = true,
    extraBody = {},
  } = options;
  const config = resolveDeepSeekConfig(env, { includeFileEnv: options.env == null });
  if (!config.apiKey) {
    throw new Error("GLM API key is not configured");
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error("messages are required");
  }

  let lastError = null;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const body = {
      model: config.model,
      messages,
      temperature,
      max_tokens: maxTokens,
      ...(responseFormat ? { response_format: { type: "json_object" } } : {}),
      ...(disableThinking ? { thinking: { type: "disabled" } } : {}),
      ...extraBody,
    };

    try {
      const response = await fetchImpl(config.chatCompletionsUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify(body),
        signal,
      });

      const text = await response.text().catch(() => "");
      if (!response.ok) {
        if (attempt < retries && shouldRetry(response.status, text)) {
          await sleep(retryDelay(attempt, text));
          continue;
        }
        throw new Error(`GLM API error: ${response.status}${text ? ` ${text.slice(0, 300)}` : ""}`);
      }

      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(`GLM API returned invalid JSON payload: ${text.slice(0, 300)}`);
      }

      const raw = extractMessageContent(data);
      if (!raw) {
        if (attempt < retries) {
          await sleep(retryDelay(attempt, JSON.stringify(data).slice(0, 300)));
          continue;
        }
        throw new Error("GLM response content is empty");
      }

      return {
        raw,
        parsed: safeParseJsonLike(raw),
      };
    } catch (error) {
      lastError = error;
      if (error?.name === "AbortError") {
        throw error;
      }
      if (attempt >= retries) {
        throw error instanceof Error ? error : new Error(String(error || "GLM request failed"));
      }
      await sleep(retryDelay(attempt, String(error?.message || error || "")));
    }
  }

  throw lastError instanceof Error ? lastError : new Error("GLM request failed");
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
    throw new Error("GLM response is not valid JSON");
  }
}

function safeParseJsonLike(raw) {
  try {
    return parseJsonLike(raw);
  } catch {
    return null;
  }
}

function clean(value) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function normalizeBaseUrl(value) {
  return clean(value).replace(/\/+$/, "").replace(/\/v1$/i, "");
}

export function buildChatCompletionsUrl(baseUrl) {
  const normalized = normalizeBaseUrl(baseUrl);
  if (/\/api\/paas\/v4$/i.test(normalized)) {
    return `${normalized}/chat/completions`;
  }
  return `${normalized}/v1/chat/completions`;
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

function extractMessageContent(data) {
  const message = data?.choices?.[0]?.message;
  const content = message?.content;
  if (typeof content === "string") {
    return content.trim();
  }
  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item.text === "string") return item.text;
        return "";
      })
      .join("")
      .trim();
  }
  return "";
}

function shouldRetry(status, detail) {
  const text = String(detail || "").toLowerCase();
  return (
    status === 408 ||
    status === 429 ||
    status >= 500 ||
    text.includes('"code":"1302"') ||
    text.includes('"code":"1305"') ||
    text.includes("rate limit") ||
    text.includes("访问量过大")
  );
}

function retryDelay(attempt, detail) {
  const text = String(detail || "").toLowerCase();
  if (text.includes('"code":"1302"') || text.includes('"code":"1305"') || text.includes("rate limit")) {
    return 6000 * (attempt + 1);
  }
  return 2000 * (attempt + 1);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
