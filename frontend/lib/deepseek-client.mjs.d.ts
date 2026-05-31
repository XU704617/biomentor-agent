export type DeepSeekMessage = {
  role: string;
  content: string;
};

export type DeepSeekConfig = {
  apiKey: string;
  baseUrl: string;
  model: string;
};

export type CallDeepSeekJsonOptions = {
  env?: NodeJS.ProcessEnv | Record<string, string | undefined>;
  fetchImpl?: typeof fetch;
  messages: DeepSeekMessage[];
  temperature?: number;
  maxTokens?: number;
  responseFormat?: boolean;
  signal?: AbortSignal;
};

export function resolveDeepSeekConfig(env?: NodeJS.ProcessEnv | Record<string, string | undefined>): DeepSeekConfig;

export function callDeepSeekJson(options: CallDeepSeekJsonOptions): Promise<{
  raw: string;
  parsed: Record<string, unknown>;
}>;

export function parseJsonLike(raw: string): Record<string, unknown>;
