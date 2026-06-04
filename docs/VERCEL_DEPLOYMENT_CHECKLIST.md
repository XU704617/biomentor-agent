# Vercel 部署检查清单

将 BioMentor Agent 前端部署到 Vercel 后，按此清单逐项检查，确保前后端连通正常。

## 一、Vercel 必需环境变量

在 Vercel 项目设置 → Environment Variables 中配置：

| 变量名 | 值 | 说明 |
|---|---|---|
| `FASTAPI_BACKEND_URL` | `https://你的后端公网地址` | 前端服务端路由访问 FastAPI 的地址 |
| `NEXT_PUBLIC_API_BASE_URL` | `https://你的后端公网地址` | 浏览器侧增强能力使用的后端地址 |
| `NEXT_PUBLIC_SHOW_DEBUG_BADGES` | `false` 或不配置 | 正式展示时隐藏轻量测试提示；本地调试可设为 `true` |

> **重要**：上述两个变量必须配置为后端公网地址（如 `https://api.yourdomain.com` 或 `https://your-server:9090`），**不能**使用以下地址：
>
> - `http://localhost:9090`
> - `http://127.0.0.1:9090`
>
> **原因**：Vercel 运行环境中的 `localhost` / `127.0.0.1` 指向的是 Vercel 的 Serverless Function 容器本身，而不是你的开发机或后端服务器。使用本地地址会导致所有 API 请求失败。

### 其他可选环境变量

| 变量名 | 说明 |
|---|---|
| `DEEPSEEK_API_KEY` | DeepSeek API 密钥，用于工具箱、知识图谱、答辩等 AI 功能 |
| `DEEPSEEK_BASE_URL` | DeepSeek API 地址（默认 `https://api.deepseek.com`） |
| `DEEPSEEK_MODEL` | 模型名称（默认 `deepseek-v4-flash`） |

## 二、部署后必查链接

部署成功后，依次在浏览器中打开以下地址：

### 1. 部署健康检查

```
https://你的域名/api/deploy-health
```

**预期返回示例**：

```json
{
  "frontend": "ok",
  "backendConfigured": true,
  "backendReachable": true,
  "backendBaseUrlHost": "your-backend.example.com",
  "backendBaseUrlLooksLocal": false,
  "casesCount": 30,
  "warnings": []
}
```

**判断标准**：

- `backendReachable: true` — 后端连通正常
- `backendReachable: false` — 检查后端公网地址和环境变量配置
- `backendBaseUrlLooksLocal: true` — 环境变量配置了 `localhost` 或 `127.0.0.1`，不适合 Vercel 部署
- `casesCount` 接近 30 — 数据完整；远小于 30 — 后端可能未 seed 数据，前端页面仍会展示本地精选案例库

### 2. 产业案例接口

```
https://你的域名/api/industry/cases?page_size=100
```

**判断标准**：

- 返回约 **30 个**案例 → 后端连接正常，数据完整
- 页面仍显示约 **30 个**案例但接口不可达 → 前端正在使用本地精选案例库，适合演示但需要继续检查后端地址

### 3. 文献检索接口

```
https://你的域名/api/literature/search?q=mRNA&limit=3
```

**判断标准**：

- 返回文献列表 → 文献检索 provider 已配置并连通
- 返回空或错误 → 检查后端文献检索 provider 配置

### 4. 科研训练任务接口

```
https://你的域名/api/research/generate-task
```

使用 POST 请求发送：

```json
{
  "topic": "mRNA 疫苗为什么需要 LNP？",
  "case_key": null,
  "mode": "independent"
}
```

**判断标准**：

- DeepSeek 可用时：返回模型生成的科研训练任务。
- DeepSeek 无 key、余额不足、超时或后端短暂不可用时：仍应返回 4 个本地训练框架任务，不应返回 500。

## 三、部署责任边界

> 以下说明用于明确部署责任，避免混淆。

- **前端部署到 Vercel 不等于后端也部署了**。Vercel 只负责前端 Next.js 应用的托管和 Serverless 运行。
- **文献检索增强** (`/api/literature/search`)、**公开文献补充检索** (`/api/evidence/search`) 需要 FastAPI 后端和文献检索配置可访问。
- **产业案例页面**、**科研训练任务本地框架**、**本地精选文献**、**文献支撑笔记本地生成** 在后端不可用时仍可演示。
- **DeepSeek / LLM 相关能力** 主要影响个性化生成质量；余额不足或不可用时，科研训练任务会回到本地训练框架。
- 后端部署需要独立完成：启动 FastAPI 服务并确保其公网可达（通过云服务器、反向代理、内网穿透等方式）。

## 四、常见问题

### Q: 部署后 /cases 页面只显示 5 个案例？

A: 这说明前端没有连到后端。检查 Vercel Environment Variables 中是否配置了 `FASTAPI_BACKEND_URL` 和 `NEXT_PUBLIC_API_BASE_URL`，且值不是 `localhost` / `127.0.0.1`。

### Q: /api/deploy-health 返回 backendReachable=false？

A: 表示前端无法访问后端。需要确认：
1. 后端服务是否正在运行
2. 后端地址是否公网可达（可从浏览器直接访问）
3. Vercel 环境变量是否正确配置

### Q: 环境变量配置后需要重新部署吗？

A: 是的，Vercel 环境变量变更后需要重新部署才能生效。在 Vercel Dashboard 中触发 Redeploy。

### Q: 如何确认后端公网可达？

A: 在你的浏览器中直接访问后端健康检查地址：
```
https://你的后端地址/api/health
```
如果能正常返回，说明后端公网可达。
