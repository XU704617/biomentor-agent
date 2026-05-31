# BioMentor Agent — 演示路径指南

本文档面向非核心开发者，提供 BioMentor Agent 的推荐演示路线。请先按照启动文档完成本地环境搭建。

---

## 前提条件

在开始演示之前，请确保已完成以下步骤：

1. 阅读并执行本地启动指南：[LOCAL_DEMO_STARTUP.md](./LOCAL_DEMO_STARTUP.md)
2. （可选）如需重置 demo 数据库，运行：

   ```bash
   bash scripts/reset_demo_db.sh
   ```

3. 确认后端和前端均已启动：
   - 后端：`http://localhost:9090`
   - 前端：`http://localhost:3001`

验证 API 是否正常：

```bash
curl "http://localhost:9090/api/industry/cases?page_size=100"
```

预期返回 `total=23`。

---

## 推荐演示路线

### 第 1 步：首页

打开浏览器访问 `http://localhost:3001`，进入 BioMentor Agent 首页。

- 首页展示平台的定位：面向生物科学教育的 AI 辅助学习与科研训练平台。
- 可看到进入产业案例库、科研实战、学术研讨等主要功能的入口。

### 第 2 步：产业案例库

点击进入产业案例页面，或直接访问 `http://localhost:3001/cases`。

- 页面展示完整的产业案例库。
- 案例卡片包含案例名称、产业领域、简要描述等信息。

### 第 3 步：查看全部 23 个产业案例

在 `/cases` 页面中：

- 浏览全部 23 个产业案例，涵盖多个生物产业细分领域。
- 验证案例卡片内容完整、加载正常。

### 第 4 步：搜索功能

在案例页面的搜索框中尝试搜索关键词：

- 搜索 **"mRNA"**：筛选出与 mRNA 技术相关的案例。
- 搜索 **"CAR-T"**：筛选出与 CAR-T 细胞治疗相关的案例。
- 验证搜索功能能正确过滤案例列表。

### 第 5 步：进入科研实战

点击任意案例卡，选择"科研实战"跳转，或直接访问：

- `http://localhost:3001/research?caseId=case-001`
- `http://localhost:3001/research?caseId=case-004`

进入科研实战页面后：

- 页面展示 **4 个科研训练任务卡**。
- 每个任务卡包含任务标题和任务描述。
- 任务内容围绕所选案例的生物学主题展开。

> **注意**：当前科研任务卡的内容是预置的训练引导内容，旨在帮助学生理解科研流程，**不是真实的实验方案建议**。

### 第 6 步：进入学术研讨

点击案例卡中的"学术研讨"入口，或直接访问：

- `http://localhost:3001/seminar?caseId=case-001`

进入学术研讨页面后：

- 可看到基于所选案例的学术讨论入口。
- 这是案例驱动学习的讨论环节。

> **注意**：当前学术研讨页面与科研任务之间尚未形成自动化的深度闭环。

### 第 7 步：展示文献检索入口

#### 7.1 前端入口（/research 页面）

访问 `/research` 页面（如 `http://localhost:3001/research?caseId=case-001`），页面上展示 **AI 文献检索入口**。

- 页面包含文献检索区域，可输入关键词进行文献搜索。
- **默认未配置真实 provider** 时，检索区域显示 `not_configured` 状态。
- 这是诚实的设计：不伪造任何文献数据。

#### 7.2 API 接口验证

通过 API 工具调用文献检索接口：

```bash
curl "http://localhost:9090/api/literature/search?q=mRNA&limit=5"
```

观察返回结果：

```json
{
  "query": "mRNA",
  "source": "not_configured",
  "results": [],
  "message": null,
  "error": null
}
```

向演示观众说明：

- 这是文献检索接口的预留入口。
- `source: "not_configured"` 表示当前未配置任何文献数据源。
- `results` 为空是因为默认不发起外部 API 调用。
- 支持通过 `LITERATURE_PROVIDER` 环境变量配置 Semantic Scholar、Crossref 或 PubMed。
- **不伪造** DOI、PMID、文献标题、作者、期刊、年份。

#### 7.3 配置 provider 后的演示（可选）

如果已配置 `LITERATURE_PROVIDER=semantic_scholar`、`crossref` 或 `pubmed`：

1. 在 `/research` 页面输入关键词搜索。
2. 展示返回的真实文献元数据（标题、作者、年份、期刊等）。
3. **缺失字段**显示为"未提供"。
4. 强调：这是文献检索入口，**不是 evidence grounding**，不做 AI 证据总结。

> 详细信息参见 [文献检索合同文档](./LITERATURE_SEARCH_CONTRACT.md)。

### 第 8 步：Evidence Link 演示

#### 8.1 在任务卡下查找相关文献

1. 访问科研实战页面：`http://localhost:3001/research?caseId=case-004`
2. 在某个科研任务卡下，找到 **Evidence Link** 区域。
3. 系统会根据任务卡的 topic 自动调用 `/api/literature/search` 接口。
4. 展示 provider 返回的文献 metadata 列表。

#### 8.2 用户手动选择文献

- 浏览检索结果，手动选择与当前任务最相关的文献（1-N 条）。
- 系统不做自动匹配或推荐排序。

#### 8.3 生成 metadata-based evidence note

- 用户选中文献后，系统基于 metadata 生成 evidence note。
- Evidence note 包含：标题、作者、年份、期刊、DOI/PMID、摘要、来源 provider。
- 缺失字段显示为"未提供"。

> **重要说明**：Evidence note 仅基于 metadata 组装，不代表全文阅读、不代表证据强度判断、不生成最终科研结论。详细信息参见 [Evidence Link 工作流](./EVIDENCE_LINK_WORKFLOW.md)。

---

## 演示要点说明

在演示过程中，建议向观众说明以下能力边界：

| 问题 | 说明 |
|------|------|
| 能查真实文献吗？ | 支持可配置 provider（Semantic Scholar、Crossref、PubMed），但默认 not_configured。文献检索是入口能力，不是 evidence grounding。 |
| 科研任务是真实实验方案吗？ | 不是。是训练引导内容，不能替代导师建议。 |
| 能上传实验数据吗？ | 不能。尚无文件上传和数据分析功能。 |
| 能导出报告吗？ | 不能。报告导出功能尚未实现。 |
| 有 PubMed 吗？ | 前端已支持 pubmed source/provider label，后端实现待完善。PubMed 支持基本文献元数据检索，不等同于全文解析或 evidence grounding。 |
| 能做 AI 证据总结吗？ | 不能。文献检索入口不做 AI 证据总结或 evidence grounding。 |

> **诚实演示原则**：展示当前已完成的功能，同时坦诚说明未完成的功能和能力边界。不夸大、不虚假宣传。

---

## 相关文档

- [本地 Demo 启动指南](./LOCAL_DEMO_STARTUP.md)
- [当前项目状态](./CURRENT_PROJECT_STATUS.md)
- [文献检索合同文档](./LITERATURE_SEARCH_CONTRACT.md)
- [产业案例模块状态](./INDUSTRY_CASES_MODULE_STATUS.md)