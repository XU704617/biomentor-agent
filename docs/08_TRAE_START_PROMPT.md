# 08_TRAE_START_PROMPT.md

# 给 Trae Solo 的启动提示词

请将以下内容直接复制给 Trae Solo：

```text
你现在接手一个新项目：BioMentor Agent｜智造学伴。

这是一个面向生物制造课程的科研型自适应学习智能体平台。请先完整阅读：

1. docs/00_TRAE_HANDOFF.md
2. docs/01_PROJECT_BRIEF.md
3. docs/02_PRD.md
4. docs/03_PAGE_LIST.md
5. docs/04_TECH_ARCHITECTURE.md
6. docs/05_DEVELOPMENT_TASKS.md
7. docs/06_VISUAL_STYLE.md
8. docs/07_DEMO_SCRIPT.md

当前目标不是做完整商业产品，而是先完成一个可演示、可运行的 MVP。

MVP 闭环是：
教师上传资料 → 文档解析 → RAG 知识库 → AI 自动出题 → 教师审核题目 → 发布测验 → 学生答题 → 自动评分 → 学习诊断报告 → 教师端班级分析。

请严格遵守以下原则：

1. 先搭项目骨架，再做页面，再接后端，再接 AI。
2. 前端使用 Next.js + TypeScript + Tailwind + shadcn/ui。
3. 后端使用 FastAPI + SQLAlchemy + SQLite。
4. 第一版不要做复杂登录权限，使用 mock 用户即可。
5. 第一版不要做重型知识图谱，用轻量知识点标签和关系图即可。
6. 所有 AI 输出都必须结构化 JSON。
7. 所有题目、报告、诊断都要能追溯到资料来源。
8. 页面风格要高级、科技感、生物制造主题、适合竞赛展示。
9. 每完成一个模块，都要保证可以本地运行和演示。
10. 不要擅自扩展需求，优先完成 MVP 闭环。

请先输出：
1. 你对项目的理解；
2. 你准备创建的目录结构；
3. 第一阶段开发计划；
4. 然后开始创建项目骨架。
```
