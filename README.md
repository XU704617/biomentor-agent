# BioMentor Agent | 智造学伴

面向生物制造课程的科研型自适应学习智能体平台，通过领域 RAG 知识库、多智能体测评诊断、科研案例辅导和教师学习分析看板，实现从知识学习到科研能力训练的闭环培养。

## 项目结构

```
BioMentor Agent/
├── frontend/                # Next.js + TypeScript + Tailwind + shadcn/ui
│   ├── app/
│   │   ├── page.tsx         # 首页：五层架构展示 + 双入口
│   │   ├── teacher/         # 教师端 (7页)
│   │   │   ├── page.tsx                 # Dashboard
│   │   │   ├── materials/               # 课程资料库
│   │   │   ├── knowledge-map/           # 知识地图
│   │   │   ├── ai-generate/             # AI 出题
│   │   │   ├── question-bank/           # 题库管理
│   │   │   ├── quiz-publish/            # 测验发布
│   │   │   └── class-analysis/          # 班级分析
│   │   └── student/         # 学生端 (6页)
│   │       ├── page.tsx                 # 学习中心
│   │       ├── quiz/                    # 在线测验
│   │       ├── quiz/result/             # 测验结果
│   │       ├── report/                  # 学习诊断报告
│   │       ├── wrong-questions/         # 错题本
│   │       └── case-study/              # 科研案例辅导
│   ├── components/          # 共享组件
│   │   ├── AppLayout.tsx    # 自动识别教师/学生/首页布局
│   │   ├── Header.tsx       # 顶部导航
│   │   ├── Sidebar.tsx      # 侧边导航
│   │   ├── KpiCard.tsx      # KPI 统计卡片
│   │   └── RadarChart.tsx   # 能力雷达图
│   └── lib/
│       ├── utils.ts         # 工具函数
│       └── mock-data.ts     # Mock 数据
├── backend/                 # FastAPI + SQLAlchemy + SQLite
│   ├── app/
│   │   ├── main.py          # 应用入口 + CORS
│   │   ├── config.py        # 环境变量配置
│   │   ├── database.py      # 数据库连接
│   │   ├── models/          # SQLAlchemy 模型 (9个)
│   │   ├── schemas/         # Pydantic v2 schema (7组)
│   │   └── routers/         # API 路由 (9个模块)
│   └── requirements.txt
├── docs/                    # 项目文档
│   ├── 00_TRAE_HANDOFF.md   # 交接说明
│   ├── 01_PROJECT_BRIEF.md  # 项目简报
│   ├── 02_PRD.md            # 产品需求
│   ├── 03_PAGE_LIST.md      # 页面清单
│   ├── 04_TECH_ARCHITECTURE.md # 技术架构
│   ├── 05_DEVELOPMENT_TASKS.md # 开发任务
│   ├── 06_VISUAL_STYLE.md   # 视觉风格
│   ├── 07_DEMO_SCRIPT.md    # 演示脚本
│   ├── 08_TRAE_START_PROMPT.md # 启动提示
│   └── BioMentor_Agent_25单元深度调研报告.pdf
├── demo-data/               # 示例数据
│   ├── sample_course.md
│   ├── sample_questions.json
│   └── sample_students.json
├── task_plan.md             # 任务计划（5阶段路线）
├── findings.md              # 研究发现
├── progress.md              # 进度日志
└── .env.example             # 环境变量模板
```

## 五层架构

```
评价层：RAG可信度、题目质量、评分一致性、可验证指标
  ↑
应用层：教师端、学生端、报告、看板
  ↑
智能体层：出题、评分、诊断、推荐、科研辅导 (LangGraph状态机)
  ↑
知识层：chunk、embedding、metadata、知识点 (Chroma + 关系库)
  ↑
数据层：教材、课件、论文、案例、题目、答题记录
```

## 核心闭环

```
资料 → 知识库 → 出题 → 测验 → 批改 → 诊断 → 推荐 → 教学决策
```

## 技术栈

| 层 | 技术 |
|---|------|
| 前端 | Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui + Recharts |
| 后端 | FastAPI + Python + SQLAlchemy + Pydantic v2 |
| 数据库 | SQLite (demo) / PostgreSQL (prod) |
| 向量库 | Chroma |
| AI | OpenAI API (GPT-4 + text-embedding-3-small) |
| Agent | LangGraph 风格状态机 |

## 快速开始

### 前端

```bash
cd frontend
npm install
npm run dev
# 访问 http://localhost:3000
```

### 后端

```bash
cd backend
pip install -r requirements.txt
cp ../.env.example ../.env
# 编辑 .env 填入 OPENAI_API_KEY
uvicorn app.main:app --reload
# 访问 http://localhost:8000/docs
```

## 开发路线（来自25单元调研报告）

| 阶段 | 单元 | 目标 |
|------|------|------|
| A: 底座 | 01,02,20 | 文件上传解析 + RAG知识库 + 数据模型 |
| B: 测评 | 04,05,06 | AI出题 + 题目质控 + 学生答题 |
| C: 诊断 | 07,08,09,10,11 | 主观题评分 + 知识点诊断 + 能力画像 + 学习路径 + 错题本 |
| D: 冲奖 | 03,12,13,14,16,17,18,19 | 知识地图 + 案例辅导Agent + 班级看板 + 多智能体 |
| E: 包装 | 21,22,25 | 评估指标 + 内容安全 + 演示系统 |

## 评估指标

| 指标 | 目标值 |
|------|-------|
| 资料解析成功率 | ≥ 90% |
| 题目教师可接受率 | ≥ 70% |
| AI评分与教师相关性 | ≥ 0.75 |
| 教师备题时间节省 | ≥ 50% |
