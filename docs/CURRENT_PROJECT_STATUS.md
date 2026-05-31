# BioMentor Agent — 当前项目状态

## 一句话定位

BioMentor Agent 是一个面向生物科学教育的 AI 辅助学习与科研训练平台原型。

---

## 已完成能力

### 产业案例库（23 个案例）

- 后端已接入 23 个生物产业案例的 seed 数据。
- 每次后端启动时自动执行 seeding，日志输出 `[seed] Loaded 23 industry cases`。
- `GET /api/industry/cases` 可返回全部 23 条案例记录。

### 案例展示页面（/cases）

- `/cases` 页面可展示完整的 23 个产业案例库。
- 支持**搜索**功能：按案例名称或关键词过滤。
- 支持**筛选**功能：按产业领域或标签筛选案例。

### 案例驱动科研任务生成（/research?caseId=case-xxx）

- 通过 `/research?caseId=case-xxx` 可进入指定案例的科研实战页面。
- 已验证 `case-001` 和 `case-004` 能正常显示 **4 个科研任务卡**（不再一直 loading）。
- 每个任务卡展示对应的科研训练任务标题与描述。

### 案例研讨入口（/seminar）

- 通过 `/seminar?caseId=case-xxx` 可进入指定案例的学术研讨页面。
- 提供案例驱动的学术讨论入口。

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

### 文献检索 API Placeholder

- `GET /api/literature/search?q=mRNA&limit=5` 已预留接口。
- 当前返回：
  - `results: []`（空结果）
  - `source: "not_configured"`（未配置真实文献源）
- **不伪造** DOI / PMID / 文献标题等数据。

---

## 未完成能力

### 真实文献检索

- 尚未接入 PubMed、Crossref、Semantic Scholar 等真实文献数据库。
- 当前 `GET /api/literature/search` 仅返回空占位结果，不执行任何外部 API 调用。
- 文献检索结果是固定的占位数据，不是实时检索。

### 文献 Evidence Grounding

- 科研任务生成的结果**未接入真实文献证据支撑**。
- 任务卡中的描述源自预置的训练引导内容，而非基于文献检索的实时证据。

### 真实数据分析、可视化与报告导出

- 尚未实现任何真实生物数据的上传、解析、分析流程。
- 尚无数据可视化图表（如基因表达热图、蛋白质结构图等）。
- 尚无科研报告（PDF / Word）导出功能。

### 科研任务到学术研讨的深度闭环

- 科研任务页面与学术研讨页面目前通过 `caseId` 参数关联，但两者之间尚未形成自动化的深度闭环。
- 学术研讨页面的讨论内容尚未与科研任务的实验结果或分析结论联动。

### 上传资料到科研实战的知识库闭环

- 尚无文件上传功能。
- 尚无用户自定义资料与科研任务之间的知识库关联。
- 尚无资料解析后的结构化存储与检索能力。

---

## 能力边界（重要）

> **以下声明用于明确当前系统的能力边界，避免过度宣传。**

1. **当前不能宣传为"完整的科研 Agent"**：系统目前是面向教育的训练原型，不是面向真实科研工作者的生产力工具。

2. **当前不能说"自动查真实文献"**：文献接口仅为 placeholder，并未接入任何真实文献数据库，不具备真实文献检索能力。

3. **当前文献接口只是 placeholder**：`GET /api/literature/search` 总是返回空结果和 `source: "not_configured"`，不要向用户承诺可返回真实文献数据。

4. **当前科研任务主要是训练引导**：科研任务卡的设计目标是让学生了解科研流程、锻炼科研思维，输出内容**不是实验方案的最终建议**，不能替代导师或专家的判断。

5. **当前系统是原型阶段**：所有功能均为 MVP（Minimum Viable Product）级别的演示原型，尚未经过安全性、稳定性、准确性等方面的充分验证。

---

## 相关文档

- [本地 Demo 启动指南](./LOCAL_DEMO_STARTUP.md)
- [演示路径指南](./DEMO_WALKTHROUGH.md)
- [产业案例模块状态](./INDUSTRY_CASES_MODULE_STATUS.md)