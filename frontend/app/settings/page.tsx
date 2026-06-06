"use client";

import { useEffect, useState } from "react";

type ConfigView = {
  api_key_set: boolean;
  api_key: string;
  base_url: string;
  model: string;
};

type TestResponse = {
  ok: boolean;
  balance_ok: boolean;
  chat_ok: boolean;
  base_url: string;
  model: string;
  balance?: Record<string, unknown> | null;
  chat_summary: string;
  error: string;
};

const defaultBaseUrl = "https://api.deepseek.com/v1";
const defaultModel = "deepseek-v4-flash";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState(defaultBaseUrl);
  const [model, setModel] = useState(defaultModel);
  const [currentConfig, setCurrentConfig] = useState<ConfigView | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState("");
  const [testResult, setTestResult] = useState<TestResponse | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      setLoadingConfig(true);
      setMessage("");
      try {
        const res = await fetch("/gateway/api/system/llm/config", { cache: "no-store" });
        if (!res.ok) {
          throw new Error("读取当前配置失败");
        }
        const data: ConfigView = await res.json();
        setCurrentConfig(data);
        setApiKey("");
        setBaseUrl(data.base_url || defaultBaseUrl);
        setModel(data.model || defaultModel);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "读取当前配置失败");
      } finally {
        setLoadingConfig(false);
      }
    };

    void loadConfig();
  }, []);

  const handleTest = async () => {
    setTesting(true);
    setMessage("");
    setTestResult(null);
    try {
      const res = await fetch("/gateway/api/system/llm/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: apiKey, base_url: baseUrl, model }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "测试失败");
      }
      setTestResult(data);
      if (!data.ok) {
        setMessage(data.error || "测试未完全通过");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "测试失败");
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/gateway/api/system/llm/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: apiKey, base_url: baseUrl, model }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "保存失败");
      }
      setCurrentConfig(data);
      setApiKey("");
      setMessage("配置已保存并立即生效");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const balanceText = testResult?.balance ? JSON.stringify(testResult.balance, null, 2) : "";

  return (
    <section className="px-6 md:px-10 py-28 md:py-32 max-w-5xl mx-auto">
      <div className="mb-10">
        <p className="section-title">系统设置</p>
        <h1 className="section-heading">LLM API Key 配置与检测</h1>
        <p className="mt-4 text-brand-muted max-w-3xl leading-relaxed">
          在这里填写 API Key、Base URL 和模型名，然后直接测试余额和连通性。保存后，后端立即使用新配置。
        </p>
      </div>

      <div className="liquid-card p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-3xl border border-white/80 bg-white/50 p-5">
            <div className="text-xs font-bold text-brand-faint mb-2">当前状态</div>
            {loadingConfig ? (
              <div className="text-sm text-brand-muted">读取中...</div>
            ) : (
              <div className="space-y-2 text-sm text-[#111827]">
                <div>已配置 API Key：{currentConfig?.api_key_set ? "是" : "否"}</div>
                <div>密钥明文不会在页面回显</div>
                <div>当前 Base URL：{currentConfig?.base_url || "-"}</div>
                <div>当前模型：{currentConfig?.model || "-"}</div>
              </div>
            )}
          </div>
          <div className="rounded-3xl border border-white/80 bg-white/50 p-5">
            <div className="text-xs font-bold text-brand-faint mb-2">说明</div>
            <div className="space-y-2 text-sm text-brand-muted leading-relaxed">
              <div>余额测试会请求供应商余额接口。</div>
              <div>连通性测试会发一条最小 chat completion 请求。</div>
              <div>保存后只更新咱们自己的后端配置，不影响其它服务。</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <label className="block">
            <div className="mb-2 text-sm font-semibold text-[#111827]">API Key</div>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="输入新的 API Key"
              className="w-full rounded-2xl border border-white/80 bg-white/70 px-4 py-3 text-sm text-[#111827] outline-none focus:border-[#111827]"
            />
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <div className="mb-2 text-sm font-semibold text-[#111827]">Base URL</div>
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                className="w-full rounded-2xl border border-white/80 bg-white/70 px-4 py-3 text-sm text-[#111827] outline-none focus:border-[#111827]"
              />
            </label>

            <label className="block">
              <div className="mb-2 text-sm font-semibold text-[#111827]">模型名</div>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full rounded-2xl border border-white/80 bg-white/70 px-4 py-3 text-sm text-[#111827] outline-none focus:border-[#111827]"
              />
            </label>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => void handleTest()}
            disabled={testing}
            className="rounded-2xl bg-[#111827] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {testing ? "测试中..." : "测试余额与连通性"}
          </button>
          <button
            onClick={() => void handleSave()}
            disabled={saving}
            className="rounded-2xl border border-[#111827] px-5 py-3 text-sm font-semibold text-[#111827] disabled:opacity-60"
          >
            {saving ? "保存中..." : "保存配置"}
          </button>
        </div>

        {message ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {message}
          </div>
        ) : null}

        {testResult ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-3xl border border-white/80 bg-white/50 p-5 space-y-2 text-sm">
              <div>余额接口：{testResult.balance_ok ? "通过" : "失败"}</div>
              <div>连通性：{testResult.chat_ok ? "通过" : "失败"}</div>
              <div>Base URL：{testResult.base_url}</div>
              <div>模型：{testResult.model}</div>
              <div>返回摘要：{testResult.chat_summary || "-"}</div>
            </div>
            <div className="rounded-3xl border border-white/80 bg-[#0f172a] p-5 text-xs text-slate-100 overflow-auto">
              <pre className="whitespace-pre-wrap break-all">{balanceText || testResult.error || "无返回"}</pre>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
