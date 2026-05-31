# BioMentor Agent — Evidence Link Workflow

本文档定义 Evidence Link 模块的能力定位、目标流程、evidence note 边界、provider 复用关系和后续演进路线。

---

## 一、能力定位

Evidence Link 是：

```
科研任务卡和真实文献 metadata 之间的连接层。
```

它的作用是让学生从"科研训练任务"出发，找到相关文献的元数据，并基于真实文献信息生成一份 evidence note（证据说明），用于辅助理解科研任务与真实研究之间的关系。

Evidence Link **不是**：

- 自动科研查证
- 全文解析
- AI 文献总结
- 证据强度判断
- 最终实验建议

---

## 二、目标流程

Evidence Link 的完整流程如下：

```
科研任务卡
→ 查找相关文献（调用 literature search provider）
→ 展示 provider 返回的真实 metadata
→ 用户手动选择文献
→ 生成 evidence note
```

### 2.1 流程说明

| 步骤 | 说明 |
|------|------|
| 查找相关文献 | 根据科研任务卡的 topic 或 case context，调用 `/api/literature/search` 接口。复用已配置的 literature provider（Semantic Scholar、Crossref、PubMed 等）。 |
| 展示真实 metadata | 前端展示 provider 返回的文献元数据，包括标题、作者、年份、期刊、DOI/PMID、摘要等。缺失字段显示"未提供"。 |
| 用户手动选择 | 学生浏览检索结果，手动选择与当前任务最相关的文献（1-N 条）。系统不做自动匹配或推荐排序。 |
| 生成 evidence note | 根据用户选中的文献 metadata，生成一份 evidence note。仅基于已有 metadata 组装，不做全文解析、不做 AI 总结、不做证据强度评估。 |

---

## 三、Evidence Note 边界

Evidence Note 是一份基于文献元数据的"证据说明"，其边界必须严格遵守以下约定：

### 3.1 可以做什么

- 基于 metadata 展示文献与任务的关联信息。
- 列出用户选中文献的基本元数据（标题、作者、年份、期刊、DOI/PMID、摘要）。
- 说明文献来源 provider（如 PubMed、Semantic Scholar、Crossref）。

### 3.2 不能做什么

| 限制 | 说明 |
|------|------|
| **基于 metadata** | Evidence Note 仅使用 provider 返回的元数据字段，不解析全文。 |
| **不代表全文阅读** | 系统未获取或解析论文全文内容。 |
| **不代表证据强度判断** | 不对文献的证据等级、可信度、影响因子等做任何评估。 |
| **不生成最终科研结论** | Evidence Note 不是实验方案建议或科研结论。 |
| **缺字段时不能补编** | 如果 provider 返回数据中缺少 DOI、PMID、author、abstract 等字段，evidence note 中必须如实标记为"未提供"，不得伪造或推测。 |

### 3.3 字段缺失处理

当 provider 返回的 metadata 中某个字段缺失时：

- 字符串字段：标记为 `"未提供"`
- 数组字段：显示为空或标记为 `"未提供"`
- 数字字段：显示为 `"未提供"`

**严格禁止**在任何环节伪造、推测或补编任何文献元数据字段。

---

## 四、Provider 关系

Evidence Link 复用 BioMentor Agent 已有的 literature provider 架构。

### 4.1 可用 Provider

| Provider | 标识 | 说明 |
|----------|------|------|
| 未配置 | `not_configured` | 默认状态，不发起外部调用，返回空结果。 |
| Semantic Scholar | `semantic_scholar` | 学术论文元数据检索。 |
| Crossref | `crossref` | 学术出版元数据检索。 |
| PubMed | `pubmed` | NCBI Entrez E-utilities 生物医学文献元数据检索。 |

### 4.2 推荐演示 Provider

**推荐使用 PubMed provider** 进行 Evidence Link 演示，原因：

- PubMed 覆盖生物医学和生命科学领域，与 BioMentor Agent 的教育定位高度匹配。
- 支持通过 PMID 检索，PMID 是生物医学文献的稳定标识。
- 免费可用，无需 API key 即可进行基本检索。

配置方式：

```bash
export LITERATURE_PROVIDER=pubmed
export LITERATURE_NCBI_TOOL=biomentor-agent
export LITERATURE_NCBI_EMAIL=your_email@example.com  # 可选但建议
```

### 4.3 Provider 切换

通过 `LITERATURE_PROVIDER` 环境变量即可切换 provider，Evidence Link 自动适配当前配置的 provider，无需额外配置。

---

## 五、Demo Usage 与验收方式

### 5.1 推荐演示路径

1. 启动后端和前端（参考 [LOCAL_DEMO_STARTUP.md](./LOCAL_DEMO_STARTUP.md)）。
2. 访问科研实战页面：`http://localhost:3001/research?caseId=case-004`。
3. 在任务卡下的 Evidence Link 区域触发文献检索。
4. 浏览 provider 返回的文献 metadata 列表。
5. 手动选择 1-N 条相关文献。
6. 生成 metadata-based evidence note。

### 5.2 验收方式

| 检查项 | 验收方式 |
|--------|----------|
| Evidence Link API 可用 | `curl "http://localhost:9090/api/evidence/search?query=mRNA+vac&taskId=task-001"` 返回有效结果 |
| Evidence note 生成 | `curl -X POST "http://localhost:9090/api/evidence/note" -d '{"selected_papers": [...]}'` 返回 note |
| 缺失字段处理 | 确认缺失字段显示为"未提供"，无伪造数据 |
| smoke 测试 | 执行 `bash scripts/smoke_evidence.sh`（如可用），确认 `SMOKE PASS` |

### 5.3 成功标准

- Evidence Link API 正常返回文献 metadata 列表
- 用户可手动选择文献并生成 evidence note
- Evidence note 仅基于已有 metadata，未补编缺失字段
- evidence smoke 测试通过（`SMOKE PASS`）

---

## 六、后续路线

以下能力属于 Evidence Link 的未来演进方向，**当前均未完成**：

| 能力 | 状态 | 说明 |
|------|------|------|
| EFetch abstract parsing | 未完成 | 通过 NCBI EFetch 接口获取并解析 PubMed 文献的 XML 格式摘要文本。 |
| 用户上传资料知识库 | 未完成 | 允许学生上传实验数据、文献 PDF、课程笔记等资料，建立个人科研知识库。 |
| citation-based research brief | 未完成 | 基于文献引用关系生成科研简报，帮助学生理解文献之间的引用网络和知识脉络。 |
| seminar discussion integration | 未完成 | 将 Evidence Link 与学术研讨页面（/seminar）集成，使证据 note 可直接用于学术讨论。 |

---

## 七、相关文档

- [当前项目状态](./CURRENT_PROJECT_STATUS.md)
- [演示路径指南](./DEMO_WALKTHROUGH.md)
- [文献检索合同文档](./LITERATURE_SEARCH_CONTRACT.md)
- [本地 Demo 启动指南](./LOCAL_DEMO_STARTUP.md)
- [最终演示指南](./FINAL_DEMO_GUIDE.md)
- [Demo 质量验收清单](./DEMO_QUALITY_CHECKLIST.md)
