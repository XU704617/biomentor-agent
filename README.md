# BioMentor Agent

BioMentor Agent 是面向生命科学学习、科研训练与产业认知的一体化智能学习平台。项目以知识探索、科研实战、生物工具箱、产业案例、知识图谱、拍照学练和模拟学术答辩为核心模块，帮助学习者把概念理解、实验设计、数据分析和表达训练连接成完整路径。

## 核心模块

| 模块 | 路由 | 说明 |
|---|---|---|
| 首页 | `/` | 展示平台入口与六个核心学习方向 |
| 知识探索 | `/explore` | 课程知识点、测验与学习反馈 |
| 科研实战 | `/research` | 科研任务生成、实验方案与训练流程 |
| 生物工具箱 | `/tools` | 蛋白结构、质粒图谱、序列分析、通路图谱 |
| 产业案例 | `/cases` | 生命科学产业案例与应用分析 |
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
| 部署 | Vercel |

## 本地运行

```bash
cd frontend
npm install
npm run dev
```

默认访问地址：

```text
http://localhost:3000
```

## 构建与测试

```bash
node --test frontend/lib/*.test.mjs
cd frontend
npm run build
```

## 环境变量

生产环境和本地环境可按需配置：

```text
DEEPSEEK_API_KEY=
DEEPSEEK_MODEL=
DEEPSEEK_BASE_URL=
```

环境变量不要提交到仓库，请使用本地 `.env.local` 或部署平台的环境变量配置。
