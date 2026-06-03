# BioMentor Agent — 当前项目状态

## 一句话定位

BioMentor Agent 是一个面向生物科学教育的 AI 辅助学习与科研训练平台原型。

---

## 已完成能力

### 产业案例库（30 个案例）

- 后端 seed 数据与前端本地精选案例库均已扩展到 30 个生物产业案例。
- 每次后端启动时自动执行 seeding，前端后端不可用时仍可展示完整本地精选案例库。
- `GET /api/industry/cases?page_size=100` 可返回完整案例记录。

### 案例展示页面（/cases）

- `/cases` 页面可展示完整的 30 个产业案例库。
- 支持**搜索**功能：按案例名称或关键词过滤。
- 支持**筛选**功能：按产业领域或标签筛选案例。

### 案例驱动科研任务生成（/research?caseId=case-xxx）

- 通过 `/research?caseId=case-xxx` 可进入指定案例的科研实战页面。
- DeepSeek 可用时优先使用模型生成科研训练任务。
- DeepSeek 无 key、余额不足、超时或异常时，`/api/research/generate-task` 会返回本地训练框架的 **4 个科研训练任务**，避免页面空白或接口 500。
- 每个训练任务展示任务目标、步骤、输出要求、推荐关键词和文献支撑入口。

### 科研实战到学术研讨闭环

- 通过 `/seminar?caseId=case-xxx` 可进入指定案例的学术研讨页面。
- 在科研实战中选择参考文献并生成文献支撑笔记后，可复制、导出 Markdown，并带入 `/seminar` 作为答辩材料。
- `/seminar?source=research` 会读取科研实战导入内容并预填答辩材料；未接收到内容时显示可理解的空状态。

### 本地 Demo 数据库 Reset 脚本

- 提供 `scripts/reset_demo_db.sh`，用于重置本地 demo 数据库。
- 脚本会清理旧的 SQLite 数据库文件（包括 WAL/SHM 文件）。
- 重置后重新启动后端即可自动 seeding 23 个案例。

### 本地启动文档

- `docs/LOCAL_DEMO_STARTUP.md` 提供完整的本地启动指南，涵盖：
  - 环境依赖
  - 数据库配置与常见问题（如 SQLite disk I/O error）
  - 后端 / 前端启动命令
  - 验证 URL 与 API 调用示例

### 文献检索能力

- `GET /api/literature/search?q=mRNA&limit=5` 已预留接口。
- 科研实战页面优先展示本地精选文献；公开文献检索作为增强能力。
- 支持通过环境变量 `LITERATURE_PROVIDER` 切换 provider：
  - `not_configured`（默认）：不发起外部调用，返回空结果。
  - `semantic_scholar`：接入 Semantic Scholar API 进行论文检索。
  - `crossref`：接入 Crossref API 进行学术出版元数据检索。
  - `pubmed`：接入 NCBI PubMed Entrez E-utilities 进行生物医学文献元数据检索。
- **不伪造** DOI / PMID / 文献标题等数据。
- 接口合同详见 [LITERATURE_SEARCH_CONTRACT.md](./LITERATURE_SEARCH_CONTRACT.md)。

### Evidence Link 能力

- 科研任务卡与真实文献 metadata 之间的连接层。
- 目标流程：科研训练任务 → 本地精选文献 / 公开文献补充检索 → 用户手动选择文献 → 生成文献支撑笔记 → 复制 / 导出 Markdown → 带入学术研讨。
- 文献支撑笔记仅基于已选择文献信息组装，不代表全文阅读、不代表证据强度判断、不生成最终科研结论。
- 复用已有的 literature provider 架构（not_configured / semantic_scholar / crossref / pubmed）。
- 推荐演示使用 PubMed provider。
- 详细设计详见 [EVIDENCE_LINK_WORKFLOW.md](./EVIDENCE_LINK_WORKFLOW.md)。

### PubMed metadata live verified

- PubMed provider 已通过 live smoke 验证。
- 可通过 `LITERATURE_PROVIDER=pubmed` 配置，执行真实生物医学文献元数据检索。
- ESearch → PMID list → ESummary → metadata summary 链路已通。
- EFetch XML abstract parsing 留作后续。

---

## 未完成能力

### smoke validation

- 前端 `node --test lib/*.test.mjs`: 通过。
- 前端 `npm run build`: 通过。
- 后端目标测试覆盖 query normalization 和 research fallback。
- `scripts/smoke_demo_api.sh` 目标为 `SMOKE PASS (16/16 checks passed)`。

---

## 能力边界（重要）

> **以下声明用于明确当前系统的能力边界，避免过度宣传。**

1. **当前不能宣传为"完整的科研 Agent"**：系统目前是面向教育的训练原型，不是面向真实科研工作者的生产力工具。

2. **当前不能说"自动查真实文献"**：文献接口支持可配置检索源，科研实战优先展示本地精选文献；公开文献补充检索仅是元数据检索入口，不是完整的 evidence grounding。

3. **当前文献接口不是 evidence grounding**：`GET /api/literature/search` 提供文献元数据检索，不等同于科研证据验证或自动查证。详细信息参见 [LITERATURE_SEARCH_CONTRACT.md](./LITERATURE_SEARCH_CONTRACT.md)。

4. **当前科研任务主要是训练引导**：科研训练任务的设计目标是让学生了解科研流程、锻炼科研思维，输出内容**不是实验方案的最终建议**，不能替代导师或专家的判断。

5. **当前系统是原型阶段**：所有功能均为 MVP（Minimum Viable Product）级别的演示原型，尚未经过安全性、稳定性、准确性等方面的充分验证。

---

## 相关文档

- [本地 Demo 启动指南](./LOCAL_DEMO_STARTUP.md)
- [演示路径指南](./DEMO_WALKTHROUGH.md)
- [文献检索合同文档](./LITERATURE_SEARCH_CONTRACT.md)
- [产业案例模块状态](./INDUSTRY_CASES_MODULE_STATUS.md)
