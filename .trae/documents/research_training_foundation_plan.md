# 科研训练基础架构实施计划

## 项目概述

将 BioMentor Agent 升级为面向生命科学/生物制造课程的科研能力训练平台，本阶段（Stage 1）专注于补齐核心对象的工程骨架、schema、demo 数据和文档。

## 当前项目状态

### 技术栈
- **前端**: Next.js 14 + TypeScript + Tailwind CSS（App Router），图标库为 `lucide-react`
- **后端**: FastAPI + SQLAlchemy + SQLite
- **数据库**: SQLite (demo) / PostgreSQL (prod)

### 现有问题
1. `backend/app/routers/ai_generate.py` 第 36 行使用 `Session` 但未导入
2. `backend/app/routers/rag.py` 第 24 行使用 `Session` 但未导入
3. 缺少 `tests/` 目录结构
4. 缺少 JSON Schema 定义目录

### 已确认的文件路径
- 学生端导航组件: `frontend/components/Sidebar.tsx`（已确认存在且包含 `studentAuxNav`）
- 学生端布局: `frontend/app/student/layout.tsx`（透传 children，无独立导航）
- 全局样式: `frontend/app/globals.css`（使用 `.card`、`.page-header`、`.badge-*` 等自定义类）
- 前端 lockfile: `frontend/package-lock.json`（已确认存在，使用 `npm ci`）
- Sidebar 已有图标: `LayoutDashboard, FileText, GitBranch, Sparkles, Database, Send, BarChart3, Dna, CircleDot, Microscope, GitFork, FileBarChart, BookX, ArrowLeft`

## 实施阶段

### 阶段 0: 前置检查与创建分支

1. **运行 `git status --short`**：检查工作区是否干净
   - 如果有未提交修改 → **立即停止并报告**，不继续执行
   - 如果干净 → 继续
2. **创建分支**: `git checkout -b feature/research-training-foundation`
   - 如果分支已存在则换用 `feature/evidence-card-foundation`

### 阶段 1: 修复后端导入问题

**修改 `backend/app/routers/ai_generate.py`**
- 添加 `from sqlalchemy.orm import Session`

**修改 `backend/app/routers/rag.py`**
- 添加 `from sqlalchemy.orm import Session`

**验证**: `python -m py_compile backend/app/routers/ai_generate.py backend/app/routers/rag.py`

### 阶段 2: 创建文档 (docs/)

6 个 Markdown 文档，严格按用户要求的文件名和内容要求：

1. `docs/BIOMENTOR_RESEARCH_TRAINING_WORKFLOW.md`
   - 三条闭环（基础学习/文献探索/科研案例），每条配 Mermaid flowchart

2. `docs/BIOMENTOR_EVIDENCE_CARD_DESIGN.md`
   - 证据卡作为核心中间层的设计说明
   - 所有字段解释（research_question, study_system, core_methods, key_findings, evidence_anchor, relation_to_course, relation_to_industry, limitations, evidence_strength, source_refs, extraction_status）
   - demo/mock 证据卡声明

3. `docs/BIOMENTOR_AGENT_ROLES.md`
   - 8 个 Agent 角色（基础课老师/文献导师/实验导师/产业导师/审稿人导师/工具调用/能力诊断/教师决策）
   - 每个 Agent 写：职责、输入、输出、可调用工具、证据要求、禁止行为、失败回退策略

4. `docs/BIOMENTOR_BIOTOOLBOX_ROADMAP.md`
   - P0 工具（AlphaFold/RCSB, Reactome, pLannotate）
   - P1 工具（BLAST+, Primer3, MAFFT, Biopython）
   - 每个工具写：教学场景、输入、输出、是否本地运行、隐私/版权风险、MVP 是否接入、优先级原因

5. `docs/BIOMENTOR_STAGE1_SUMMARY.md`
   - 新增内容、原因、当前 mock 状态、未实现功能、下一阶段建议

6. `docs/PR_DESCRIPTION_DRAFT.md`
   - Summary / Changes / Tests / Non-goals / Risks / Follow-up

### 阶段 3: 创建 JSON Schema (schemas/)

7 个 JSON Schema，严格按用户要求的 required 字段列表：

1. `schemas/knowledge_point.schema.json`
   - required: id, name, course_id, chapter, basic_explanation, research_frontiers, industry_applications, prerequisite_ids, related_ids, source_refs

2. `schemas/evidence_card.schema.json`
   - required: card_id, knowledge_point_id, query_intent, title, paper_identifier, paper_type, study_system, research_question, core_methods, key_findings, evidence_anchor, relation_to_course, relation_to_industry, limitations, evidence_strength, source_refs, extraction_status, demo_only, not_real_benchmark, requires_teacher_review
   - evidence_strength enum: background, preliminary, moderate, strong, teacher_review_required

3. `schemas/evidence_matrix.schema.json`
   - required: matrix_id, knowledge_point_id, research_question, card_ids, consensus_findings, conflicting_findings, evidence_strength_summary, limitations_summary, course_mapping, report_outline, demo_only, not_real_benchmark, requires_teacher_review

4. `schemas/research_case.schema.json`
   - required: case_id, title, scenario, background, linked_knowledge_points, linked_evidence_cards, student_tasks, experiment_design_prompts, industry_context, rubric, demo_only, not_real_benchmark, requires_teacher_review

5. `schemas/agent_role.schema.json`
   - required: role_id, name, responsibility, inputs, outputs, tools, evidence_rules, forbidden_behaviors, fallback_strategy

6. `schemas/research_report.schema.json`
   - required: report_id, student_id, knowledge_point_id, title, research_question, selected_evidence_cards, evidence_matrix_id, mechanism_summary, experiment_design, limitations, industry_translation, tutor_feedback, reviewer_questions, status, demo_only, not_real_benchmark, requires_teacher_review

7. `schemas/student_profile.schema.json`
   - required: student_id, knowledge_mastery, literature_search, paper_understanding, evidence_judgment, mechanism_explanation, experiment_design, industry_transfer, updated_at

### 阶段 4: 创建 Demo 数据

**`examples/demo_topics/cell_apoptosis.demo.json`**

包含 6 个子对象：
1. `knowledge_point` - 细胞凋亡三层展开（基础/前沿/产业）
2. `evidence_cards` - 至少 3 张，全部使用 `mock_pmid`（如 MOCK-APOP-001），禁止真实 PMID，禁止 verified=true
3. `evidence_matrix` - 引用上面 3 张 card_id
4. `research_case` - 围绕细胞凋亡与肿瘤治疗
5. `agent_roles` - 至少 5 个
6. `research_report` - draft 状态

所有顶层和重要子对象必须包含：
- `demo_only: true`
- `not_real_benchmark: true`
- `requires_teacher_review: true`

### 阶段 5: 创建测试文件

**`tests/test_research_training_schemas.py`**
- 不引入 jsonschema 依赖，仅用 `json.load()` 检查 JSON 可解析
- 检查每个 schema 有 `required` 字段
- evidence_card.schema.json required 中必须包含 limitations、evidence_strength、source_refs
- research_report.schema.json required 中必须包含 reviewer_questions、requires_teacher_review

**`tests/test_cell_apoptosis_demo.py`**
- cell_apoptosis.demo.json 可解析
- 顶层 demo_only=true / not_real_benchmark=true / requires_teacher_review=true
- evidence_cards 至少 3 张
- evidence_matrix 引用的 card_ids 都存在
- agent_roles 至少 5 个
- research_report 存在且 status 不是 final
- 所有 paper_identifier 使用 mock_pmid 或 demo_paper_id，不允许 verified=true

**运行**: `python -m pytest tests/test_research_training_schemas.py tests/test_cell_apoptosis_demo.py -v`

### 阶段 6: 创建前端页面

**新增 `frontend/app/student/research/page.tsx`**
- 使用页面内 `const demoData` 静态数据，不跨目录 import `examples/demo_topics/`
- 页面必须展示的 9 个区域（按用户要求）
- **必须明显显示** demo_only=true / not_real_benchmark=true / requires_teacher_review=true（用醒目的 banner 或 badge）
- 符合现有前端风格（使用 `.card`、`.page-header`、`.badge-*` 等已有 CSS 类）

**修改 `frontend/components/Sidebar.tsx`**
- 在 `studentAuxNav` 中添加科研训练入口
- **图标选择策略**：优先使用 `FlaskConical`（lucide-react 较新版本可用）；如果 build 失败则回退到项目中已确认可用的图标（如 `Microscope` 或 `BookOpen`），不引入新依赖
- 修改前先确认当前 lucide-react 版本支持所选图标

### 阶段 7: 更新 README

**修改 `README.md`**
- **只追加** Stage 1 说明段落，不覆盖原有内容
- 包含：项目定位升级、Stage 1 新增内容、测试运行方法、/student/research 页面查看方法
- 当前边界声明（未调用 PubMed/PMC/AlphaFold/RCSB/Reactome/pLannotate，未真实评分，所有 evidence card 为 demo）
- 下一阶段建议

### 阶段 8: 验证与提交

1. 后端编译验证：`python -m py_compile backend/app/routers/ai_generate.py backend/app/routers/rag.py`
2. 测试运行：`python -m pytest tests/test_research_training_schemas.py tests/test_cell_apoptosis_demo.py -v`
3. 前端构建：`cd frontend && npm ci && npm run build`
   - 如果 build 失败：判断是否由本阶段新增文件导致
   - 只修复与本阶段直接相关的问题
   - 如果是既有项目问题，只记录日志，不扩大重构范围
4. **提交前必须输出** `git diff --stat` 和 `git status --short`
5. **git add 只添加本阶段实际修改的文件**，逐文件列出，不用过宽路径
6. 提交：`git commit -m "add research training foundation"`
7. **不 push 到 origin**，仅本地 commit

## 关键约束（全部）

1. 创建分支前先 `git status --short`，有未提交修改则停止
2. 不编造真实论文结论
3. 不伪造真实 PMID，全部使用 mock_pmid 或 demo_paper_id，不允许 verified=true
4. 所有 demo 数据标注 demo_only / not_real_benchmark / requires_teacher_review
5. 不重构项目、不删除现有结构
6. 不引入大依赖（jsonschema 等）
7. 不直接 push 到 origin，仅本地 commit
8. commit 消息必须是单行：`git commit -m "add research training foundation"`
9. Sidebar 图标必须使用项目中已确认可用的 lucide-react 图标
10. /student/research 页面使用页面内 const demoData，不跨目录 import
11. README 只追加，不覆盖
12. npm run build 失败只修复本阶段引起的问题
13. git add 只添加本阶段实际修改文件
14. 提交前必须输出 git diff --stat 和 git status --short

## 最终输出

1. 当前分支名
2. 修改文件清单
3. 新增核心对象列表
4. 前端新增页面
5. 修复的已有问题
6. 测试结果（原文）
7. `git diff --stat` 输出（原文）
8. `git status --short` 输出（原文）
9. 当前未实现的真实功能
10. `PR_DESCRIPTION_DRAFT.md` 内容摘要
11. 从 fork 提 PR 的操作建议
12. 下一阶段建议
