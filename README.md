# BioMentor Agent

BioMentor Agent 是面向生物科学教育的 AI 辅助学习与科研训练平台原型。

## 核心模块

| 模块 | 路由 | 说明 |
|---|---|---|
| 产业案例库 | `/cases` | 23 个生物产业案例，支持搜索和筛选 |
| 科研实战任务 | `/research` | 案例驱动生成 4 个科研训练任务卡 |
| 文献检索 provider | `/api/literature/search` | 支持 not_configured / semantic_scholar / crossref / pubmed |
| Evidence Link | `/api/evidence/search`, `/api/evidence/note` | 任务卡 → 文献 metadata → evidence note |
| 本地 smoke 验收 | `scripts/smoke_demo_api.sh` | 后端 tests / 前端 build / API smoke |
| 首页 | `/` | 平台入口与核心学习方向 |
| 知识探索 | `/explore` | 课程知识点、测验与学习反馈 |
| 生物工具箱 | `/tools` | 蛋白结构、质粒图谱、序列分析、通路图谱 |
| 知识图谱 | `/knowledge-map` | 生命科学分支网络与学科工作台 |
| 拍照学练 | `/photo-learning` | 图片/文本识别后的知识匹配与练习生成 |
| 学术答辩 | `/seminar` | 导入材料、生成答辩资料包并进行多轮模拟答辩 |

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Next.js 14, React, TypeScript, Tailwind CSS |
| 可视化 | SVG, Cytoscape.js, 3Dmol.js, Recharts |
| AI 接口 | Next.js Route Handlers |
| 文档解析 | PDF, DOCX, PPTX, TXT/MD 文本导入 |
| 部署 | 云服务器 / 自托管服务 |

## 快速启动

详细启动步骤请参考 [docs/LOCAL_DEMO_STARTUP.md](docs/LOCAL_DEMO_STARTUP.md)

简要流程：

```bash
# 重置 demo 数据库（可选）
bash scripts/reset_demo_db.sh

# 终端 1：启动后端
cd backend
export DATABASE_URL=sqlite:////tmp/biomentor_demo_23cases.db
python -m uvicorn app.main:app --host 0.0.0.0 --port 9090

# 终端 2：启动前端
cd frontend
npm run dev -- -p 3001
```

## 演示与验收

- **完整演示路径**：[docs/FINAL_DEMO_GUIDE.md](docs/FINAL_DEMO_GUIDE.md)
- **Demo 质量验收清单**：[docs/DEMO_QUALITY_CHECKLIST.md](docs/DEMO_QUALITY_CHECKLIST.md)
- **当前项目状态**：[docs/CURRENT_PROJECT_STATUS.md](docs/CURRENT_PROJECT_STATUS.md)
- **推荐展示案例**：[docs/SHOWCASE_CASES.md](docs/SHOWCASE_CASES.md)
- **测试反馈指南**：[docs/TESTING_FEEDBACK_GUIDE.md](docs/TESTING_FEEDBACK_GUIDE.md)

## 构建与测试

```bash
node --test frontend/lib/*.test.mjs
cd frontend
npm run build
```

## 能力边界

> 以下声明用于明确当前系统的能力边界，避免过度宣传。

- **不是全文解析**：系统不获取或解析论文全文内容。
- **不是 AI 文献总结**：系统不做 AI 证据总结或自动文献综述。
- **不是自动 evidence grounding**：Evidence Link 是连接层，不是自动科研查证。
- **不是最终科研结论生成**：科研任务卡是训练引导，不生成实验方案建议或科研结论。
- **缺 DOI / PMID / author / abstract 时不能补编**：缺失字段如实标记为"未提供"，不伪造数据。

## 环境变量

生产环境和本地环境可按需配置：

```text
DEEPSEEK_API_KEY=
DEEPSEEK_MODEL=
DEEPSEEK_BASE_URL=
```

环境变量不要提交到仓库，请使用本地 `.env.local` 或部署平台的环境变量配置。
