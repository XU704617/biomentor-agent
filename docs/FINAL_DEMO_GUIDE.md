# BioMentor Agent — 最终演示指南（Final Demo Guide）

本文档提供 BioMentor Agent 的完整演示路径，面向评审者、导师和非技术观众，说明系统当前能演示什么、怎么演示、以及能力边界在哪里。

---

## 一、演示前准备

### 1. 启动后端和前端

按照 [LOCAL_DEMO_STARTUP.md](./LOCAL_DEMO_STARTUP.md) 完成环境准备后：

```bash
# 终端 1：启动后端
cd backend
export DATABASE_URL=sqlite:////tmp/biomentor_demo_23cases.db
python -m uvicorn app.main:app --host 0.0.0.0 --port 9090
```

```bash
# 终端 2：启动前端
cd frontend
npm run dev -- -p 3001
```

等待两个服务均启动成功，确认日志中输出 `[seed] Loaded 23 industry cases`。

### 2. 重置 demo 数据库（可选）

如需确保 demo 数据是干净的 23 个案例：

```bash
bash scripts/reset_demo_db.sh
```

然后重新启动后端和前端。

### 3. 推荐演示用例

| 项目 | 推荐值 |
|------|--------|
| 案例 ID | `case-004` |
| 搜索关键词 | `mRNA vaccine delivery` |
| 文献 Provider | `not_configured`（默认）；`pubmed`（可选 live 演示） |

---

## 二、完整演示路径（13 步）

### 第 1 步：启动后端和前端

确认两个服务均正常运行：

- 后端：`http://localhost:9090`
- 前端：`http://localhost:3001`

### 第 2 步：重置 demo 数据库

如已执行过 reset，跳过此步。否则执行：

```bash
bash scripts/reset_demo_db.sh
```

并重启后端，确认日志包含 `[seed] Loaded 23 industry cases`。

### 第 3 步：打开首页

浏览器访问：

```
http://localhost:3001
```

向观众说明：

- BioMentor Agent 是面向生物科学教育的 AI 辅助学习与科研训练平台原型。
- 首页展示平台的核心模块入口。

### 第 4 步：进入产业案例库

访问：

```
http://localhost:3001/cases
```

### 第 5 步：查看 23 个产业案例

在 `/cases` 页面中：

- 确认页面加载全部 **23 个产业案例**。
- 每个案例卡片包含案例名称、产业领域、简要描述。
- 案例覆盖多个生物产业细分领域（如 mRNA 疫苗、CAR-T 细胞治疗、合成生物学等）。

### 第 6 步：搜索 mRNA / CAR-T

在案例页面的搜索框中尝试：

- 搜索 **"mRNA"**：筛选出与 mRNA 技术相关的案例。
- 搜索 **"CAR-T"**：筛选出与 CAR-T 细胞治疗相关的案例。

验证搜索功能能正确过滤案例列表。

### 第 7 步：进入科研实战任务页

访问：

```
http://localhost:3001/research?caseId=case-004
```

或从案例库点击 `case-004` 的"科研实战"入口跳转。

### 第 8 步：查看 4 个科研训练任务卡

在科研实战页面中：

- 确认页面展示 **4 个科研训练任务卡**。
- 每个任务卡包含任务标题和任务描述。
- 任务内容围绕所选案例（case-004）的生物学主题展开。

向观众说明：

> 当前科研任务卡的内容是预置的训练引导内容，旨在帮助学生理解科研流程，**不是真实的实验方案建议**。

### 第 9 步：查看 AI 文献检索区域

在同一 `/research` 页面中：

- 向下滚动至 **AI 文献检索** 区域。
- 确认检索区域正常展示，包含搜索输入框和搜索按钮。

### 第 10 步：展示 PubMed / provider-ready 文献 metadata search

#### 默认演示（not_configured）

- 确认检索区域显示 `not_configured` 状态或未配置提示。
- 输入关键词（如 `mRNA vaccine delivery`）并点击搜索。
- 展示返回状态：无结果，`source: "not_configured"`。

向观众说明：

> 当前未配置文献数据源，系统不伪造任何文献数据。这是诚实的设计。

#### 可选 live 演示（pubmed）

如需展示真实文献检索能力，先配置 PubMed provider：

```bash
export LITERATURE_PROVIDER=pubmed
export LITERATURE_NCBI_TOOL=biomentor-agent
export LITERATURE_NCBI_EMAIL=your_email@example.com
```

重启后端后，在 `/research` 页面：

1. 输入关键词：`mRNA vaccine delivery`
2. 点击搜索
3. 展示 PubMed 返回的真实文献元数据（标题、作者、年份、PMID 等）
4. 强调缺失字段显示为"未提供"
5. 说明这是文献检索入口，**不是 evidence grounding**

### 第 11 步：在任务卡下使用 Evidence Link

在科研实战页面的某个任务卡中：

1. 找到该任务卡下的 **Evidence Link** 区域。
2. 系统会根据任务卡 topic 自动调用文献检索（使用当前配置的 provider）。
3. 展示检索到的文献 metadata 列表。
4. 用户手动选择 1-N 条与当前任务最相关的文献。

向观众说明：

> Evidence Link 是科研任务卡与真实文献 metadata 之间的连接层。系统不做自动匹配或推荐排序，由学生手动选择文献。

### 第 12 步：生成 metadata-based evidence note

用户选中文献后：

1. 系统基于选中文献的 metadata 生成一份 **evidence note**。
2. Evidence note 包含：文献标题、作者、年份、期刊、DOI/PMID、摘要、来源 provider。
3. 缺失字段显示为"未提供"。

向观众说明：

> Evidence note 仅基于已有 metadata 组装，**不代表全文阅读**、**不代表证据强度判断**、**不生成最终科研结论**。

### 第 13 步：说明边界

演示结束时，向观众明确说明以下能力边界：

| 不能做什么 | 说明 |
|------------|------|
| 全文解析 | 系统不获取或解析论文全文内容。 |
| AI 文献总结 | 系统不做 AI 证据总结或自动文献综述。 |
| 自动 evidence grounding | Evidence Link 是连接层，不是自动科研查证。 |
| 最终科研结论 | 科研任务卡是训练引导，不生成实验方案建议或科研结论。 |
| 补编缺失字段 | 缺 DOI/PMID/author/abstract 时不伪造数据。 |

---

## 三、演示要点总结

| 环节 | 关键点 |
|------|--------|
| 案例库 | 23 个案例，支持搜索和筛选 |
| 科研任务 | 案例驱动生成 4 个训练任务卡 |
| 文献检索 | provider-ready 接口，默认 not_configured |
| Evidence Link | 任务卡 → 文献 metadata → 用户选择 → evidence note |
| 能力边界 | 不是全文解析、不是 AI 总结、不是自动查证、不是最终结论 |

---

## 四、相关文档

- [本地 Demo 启动指南](./LOCAL_DEMO_STARTUP.md)
- [Demo 质量验收清单](./DEMO_QUALITY_CHECKLIST.md)
- [当前项目状态](./CURRENT_PROJECT_STATUS.md)
- [Evidence Link 工作流](./EVIDENCE_LINK_WORKFLOW.md)
- [文献检索合同文档](./LITERATURE_SEARCH_CONTRACT.md)
