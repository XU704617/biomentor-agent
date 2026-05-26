# BioMentor Stage 1 总结

> 本文档总结 BioMentor Agent 平台 Stage 1（科研训练基础架构）的实施内容和当前状态。

---

## 1. 新增了什么

### 1.1 文档（6 个）

| 文件 | 说明 |
|------|------|
| `docs/BIOMENTOR_RESEARCH_TRAINING_WORKFLOW.md` | 三条闭环工作流定义（基础学习/文献探索/科研案例），每条配 Mermaid 流程图 |
| `docs/BIOMENTOR_EVIDENCE_CARD_DESIGN.md` | 证据卡设计文档，包含字段规范、证据强度分级、demo 声明 |
| `docs/BIOMENTOR_AGENT_ROLES.md` | 8 个 Agent 角色定义（职责/输入/输出/工具/证据要求/禁止行为/回退策略） |
| `docs/BIOMENTOR_BIOTOOLBOX_ROADMAP.md` | BioToolBox 路线图（P0 工具 3 个 + P1 工具 4 个） |
| `docs/BIOMENTOR_STAGE1_SUMMARY.md` | 本文档 |
| `docs/PR_DESCRIPTION_DRAFT.md` | PR 描述草稿 |

### 1.2 JSON Schema（7 个）

| 文件 | 说明 |
|------|------|
| `schemas/knowledge_point.schema.json` | 知识点 Schema（三层展开：基础/前沿/产业） |
| `schemas/evidence_card.schema.json` | 证据卡 Schema（含 evidence_strength 分级） |
| `schemas/evidence_matrix.schema.json` | 证据矩阵 Schema（多篇证据卡汇总） |
| `schemas/research_case.schema.json` | 科研案例 Schema |
| `schemas/agent_role.schema.json` | Agent 角色 Schema |
| `schemas/research_report.schema.json` | 调研报告 Schema（含审稿人追问） |
| `schemas/student_profile.schema.json` | 学生能力画像 Schema（八维能力评分） |

### 1.3 Demo 数据

| 文件 | 说明 |
|------|------|
| `examples/demo_topics/cell_apoptosis.demo.json` | 细胞凋亡主题的完整 demo 数据，包含知识点、3 张证据卡、证据矩阵、科研案例、5 个 Agent 角色、调研报告 |

### 1.4 测试

| 文件 | 说明 |
|------|------|
| `tests/test_research_training_schemas.py` | Schema 完整性测试（检查 required 字段） |
| `tests/test_cell_apoptosis_demo.py` | Demo 数据完整性测试（检查 demo 标记、引用一致性等） |

### 1.5 前端页面

| 文件 | 说明 |
|------|------|
| `frontend/app/student/research/page.tsx` | 科研训练展示页面（9 个区域，使用页面内静态 demo 数据） |
| `frontend/components/Sidebar.tsx`（修改） | 新增科研训练入口导航项 |

### 1.6 后端修复

| 文件 | 说明 |
|------|------|
| `backend/app/routers/ai_generate.py`（修改） | 修复 Session 导入缺失 |
| `backend/app/routers/rag.py`（修改） | 修复 Session 导入缺失 |

---

## 2. 为什么要新增

### 2.1 核心问题

原有 BioMentor 平台聚焦于"课程学习"场景（教师上传资料 -> AI 出题 -> 学生答题 -> 评分），但缺少**科研训练**能力：

| 缺失能力 | 影响 |
|---------|------|
| 文献调研能力训练 | 学生不会检索文献、不会评估证据强度 |
| 科研案例分析 | 学生无法将课程知识与科研实践关联 |
| 产业应用理解 | 学生不了解科研成果的转化路径 |
| 结构化证据体系 | 缺少从"原始论文"到"学生理解"的中间层 |
| Agent 角色体系 | 缺少不同教学场景下的专业化 Agent |

### 2.2 Stage 1 的目标

Stage 1 的核心目标是**补齐工程骨架**，为后续的科研训练功能实现奠定基础：

1. **定义概念模型**：通过文档明确三条闭环工作流、证据卡设计、Agent 角色分工
2. **定义数据模型**：通过 JSON Schema 明确核心数据结构
3. **提供演示数据**：通过 demo 数据展示完整的数据流转
4. **验证工程可行性**：通过测试和前端页面验证 schema 和数据流的正确性

---

## 3. 当前仍是 Mock / Demo

### 3.1 重要声明

> **Stage 1 的所有内容均为 mock/demo 数据，不代表真实论文、真实学生或真实教学场景。**

### 3.2 Mock 标记

所有 demo 数据均包含以下标记：

```json
{
  "demo_only": true,
  "not_real_benchmark": true,
  "requires_teacher_review": true
}
```

### 3.3 具体限制

| 限制 | 说明 |
|------|------|
| **没有真实调用外部 API** | 前端页面使用页面内静态数据，未调用 PubMed、AlphaFold DB、Reactome 等外部 API |
| **没有真实抓取论文全文** | 证据卡中的内容为 AI 生成的模拟数据，使用 `MOCK-XXX-NNN` 格式的 mock PMID |
| **没有真实学生评分** | 学生能力画像为静态 demo 数据，未基于真实答题行为计算 |
| **没有真实 AI Agent** | Agent 角色仅为 schema 定义，未实现实际的 Agent 逻辑 |
| **没有真实教师审核** | 所有内容标记为 `requires_teacher_review: true`，未经教师审核 |

### 3.4 前端展示

前端科研训练页面包含醒目的 demo 标识：

- 页面顶部显示 **"DEMO 数据 - 仅供演示"** 横幅
- 所有证据卡、调研报告等区域显示 **demo_only / not_real_benchmark / requires_teacher_review** 标签
- 禁止在 demo 数据上显示"已验证"或"已审核"状态

---

## 4. 下一阶段建议

### 4.1 Stage 2 优先事项

| 优先级 | 任务 | 说明 |
|--------|------|------|
| **P0** | PubMed E-utilities 集成 | 实现真实的文献检索功能，替换 mock PMID |
| **P0** | 真实证据卡草稿生成 | 基于 PubMed 摘要自动生成证据卡草稿（仍需教师审核） |
| **P0** | 教师审核流程 | 实现教师对证据卡和调研报告的审核界面和流程 |
| **P1** | BioToolBox P0 工具真实接入 | 将蛋白结构、通路网络、质粒注释的前端页面连接到真实 API |
| **P1** | 基础学习闭环实现 | 实现知识点讲解 -> 练习 -> 批改 -> 错因分析的完整流程 |
| **P1** | 能力画像计算 | 基于真实答题数据计算学生能力评分 |

### 4.2 技术债务

| 债务 | 说明 |
|------|------|
| 后端 Agent 实现 | 当前仅有 Agent 的 schema 定义，需要实现实际的 Agent 逻辑 |
| 数据库迁移 | 需要将 JSON Schema 转换为 SQLAlchemy 模型并创建数据库表 |
| API 接口 | 需要为科研训练功能设计 REST API 接口 |
| 前端状态管理 | 需要引入状态管理（如 React Query）处理 API 数据 |
| 测试覆盖 | 需要补充 API 测试、前端组件测试和端到端测试 |

### 4.3 长期规划

- **Stage 3**：实现文献探索闭环（真实文献检索 + 证据卡生成 + 证据矩阵 + 调研报告）
- **Stage 4**：实现科研案例闭环（案例库 + 实验设计诊断 + 产业应用分析）
- **Stage 5**：实现教师决策支持（班级分析 + 教学策略推荐 + 内容质量监控）
