# PR Description Draft: Stage 1 - 科研训练基础架构

---

## Summary

本 PR 为 BioMentor Agent 平台新增**科研训练基础架构**（Stage 1），补齐了科研训练场景的核心工程骨架，包括概念定义（文档）、数据模型（JSON Schema）、演示数据（demo）、自动化测试和前端展示页面。

**核心目标**：将 BioMentor 从"课程学习平台"升级为"科研能力训练平台"的基础架构准备。

---

## Changes

### 新增文档（6 个）

```
docs/BIOMENTOR_RESEARCH_TRAINING_WORKFLOW.md   # 三条闭环工作流定义
docs/BIOMENTOR_EVIDENCE_CARD_DESIGN.md          # 证据卡设计文档
docs/BIOMENTOR_AGENT_ROLES.md                   # 8 个 Agent 角色定义
docs/BIOMENTOR_BIOTOOLBOX_ROADMAP.md            # BioToolBox 路线图
docs/BIOMENTOR_STAGE1_SUMMARY.md                # Stage 1 总结
docs/PR_DESCRIPTION_DRAFT.md                    # 本文档
```

### 新增 JSON Schema（7 个）

```
schemas/knowledge_point.schema.json             # 知识点 Schema
schemas/evidence_card.schema.json               # 证据卡 Schema
schemas/evidence_matrix.schema.json             # 证据矩阵 Schema
schemas/research_case.schema.json               # 科研案例 Schema
schemas/agent_role.schema.json                  # Agent 角色 Schema
schemas/research_report.schema.json             # 调研报告 Schema
schemas/student_profile.schema.json             # 学生能力画像 Schema
```

### 新增 Demo 数据

```
examples/demo_topics/cell_apoptosis.demo.json   # 细胞凋亡主题完整 demo 数据
```

包含 6 个子对象：knowledge_point、evidence_cards（3 张）、evidence_matrix、research_case、agent_roles（5 个）、research_report。

### 新增测试（2 个）

```
tests/test_research_training_schemas.py         # Schema 完整性测试
tests/test_cell_apoptosis_demo.py               # Demo 数据完整性测试
```

### 新增前端页面

```
frontend/app/student/research/page.tsx          # 科研训练展示页面
```

### 修改文件

```
frontend/components/Sidebar.tsx                 # 新增科研训练导航入口
backend/app/routers/ai_generate.py              # 修复 Session 导入缺失
backend/app/routers/rag.py                      # 修复 Session 导入缺失
```

---

## Tests

### Schema 测试 (`tests/test_research_training_schemas.py`)

- 验证 7 个 JSON Schema 文件可正确解析
- 验证每个 Schema 包含 `required` 字段
- 验证 `evidence_card.schema.json` 的 required 中包含 `limitations`、`evidence_strength`、`source_refs`
- 验证 `research_report.schema.json` 的 required 中包含 `reviewer_questions`、`requires_teacher_review`

### Demo 数据测试 (`tests/test_cell_apoptosis_demo.py`)

- 验证 `cell_apoptosis.demo.json` 可正确解析
- 验证顶层包含 `demo_only: true` / `not_real_benchmark: true` / `requires_teacher_review: true`
- 验证 `evidence_cards` 至少 3 张
- 验证 `evidence_matrix` 引用的 `card_ids` 都存在于 `evidence_cards` 中
- 验证 `agent_roles` 至少 5 个
- 验证 `research_report` 存在且 `status` 不是 `final`
- 验证所有 `paper_identifier` 使用 `mock_pmid` 或 `demo_paper_id`，不允许 `verified: true`

### 运行命令

```bash
python -m pytest tests/test_research_training_schemas.py tests/test_cell_apoptosis_demo.py -v
```

---

## Non-goals

本 PR **不**实现以下内容：

| Non-goal | 说明 |
|----------|------|
| 不实现真实 PubMed 调用 | 前端页面使用静态 demo 数据，未集成 PubMed E-utilities API |
| 不实现真实 AI Agent | Agent 角色仅为 schema 定义，未实现实际的 LLM 调用逻辑 |
| 不重构现有项目 | 不修改现有的课程学习功能（教师出题、学生答题、评分等） |
| 不实现数据库持久化 | JSON Schema 未转换为 SQLAlchemy 模型，数据未入库 |
| 不实现 REST API | 未新增科研训练相关的 API 接口 |
| 不实现教师审核流程 | 审核功能仅作为 schema 字段定义，未实现 UI 和流程 |
| 不实现 BioToolBox 真实 API 调用 | 前端页面已有蛋白结构、通路网络、质粒注释的 UI，但未连接真实 API |

---

## Risks

| 风险 | 等级 | 缓解措施 |
|------|------|---------|
| Demo 数据被误认为真实数据 | 中 | 所有 demo 数据强制标记 `demo_only` / `not_real_benchmark`；前端页面显示醒目的 demo 标识 |
| Schema 设计与实际需求不匹配 | 中 | Schema 为 Stage 1 初版，预期在 Stage 2 根据实际使用反馈调整 |
| 前端页面性能 | 低 | 使用页面内静态数据，无外部 API 调用，性能风险可控 |
| 后端导入修复的兼容性 | 低 | 仅添加缺失的 import 语句，不影响现有功能 |

---

## Follow-up（下一阶段计划）

### Stage 2 优先事项

1. **PubMed E-utilities 集成**：实现真实文献检索，替换 mock PMID
2. **真实证据卡草稿生成**：基于 PubMed 摘要自动生成证据卡草稿
3. **教师审核流程**：实现教师对证据卡和调研报告的审核界面
4. **BioToolBox P0 工具真实接入**：连接 AlphaFold DB、Reactome、pLannotate 的真实 API
5. **基础学习闭环实现**：实现知识点讲解 -> 练习 -> 批改 -> 错因分析的完整流程
6. **能力画像计算**：基于真实答题数据计算学生能力评分

### 技术债务

- 将 JSON Schema 转换为 SQLAlchemy 模型
- 设计科研训练功能的 REST API 接口
- 引入前端状态管理（React Query）
- 补充 API 测试和端到端测试
- 实现实际的 Agent 逻辑（LLM 调用 + 工具使用）

---

## Reviewer Checklist

- [ ] 6 个文档内容完整、格式正确
- [ ] 7 个 JSON Schema 可正确解析且包含 required 字段
- [ ] Demo 数据包含所有必需的子对象和 demo 标记
- [ ] 2 个测试文件全部通过
- [ ] 前端科研训练页面正常渲染且显示 demo 标识
- [ ] Sidebar 新增导航项可正常跳转
- [ ] 后端导入修复不影响现有功能
