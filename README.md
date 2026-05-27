# BioMentor Agent | 智造学伴

面向生物制造课程的 AI 辅助学习平台，融合 Canvas 粒子动画与流光玻璃美学，通过蛋白结构分析、质粒图谱解读、序列分析和代谢通路四大工具，为学生和教师提供沉浸式、生动有趣的学习体验。

## 项目结构

```
BioMentor Agent/
├── frontend/                # Next.js 14 + TypeScript + Tailwind CSS
│   ├── app/
│   │   ├── page.tsx                  # 首页
│   │   ├── about/page.tsx            # 关于我们
│   │   ├── features/page.tsx         # 核心功能
│   │   ├── tools/
│   │   │   ├── protein/page.tsx      # 蛋白结构分析
│   │   │   ├── plasmid/page.tsx      # 质粒图谱解读
│   │   │   ├── sequence/page.tsx    # 序列分析
│   │   │   └── pathway/page.tsx     # 代谢通路分析
│   │   ├── learning/page.tsx         # 课程学习
│   │   ├── dashboard/page.tsx        # 学习看板
│   │   ├── courses/page.tsx           # 课程中心
│   │   ├── research/page.tsx          # 科研园地
│   │   ├── community/page.tsx        # 社区交流
│   │   ├── contact/page.tsx          # 联系我们
│   │   ├── privacy/page.tsx          # 隐私政策
│   │   └── terms/page.tsx            # 服务条款
│   ├── components/
│   │   ├── HeroCanvas.tsx    # Canvas 2D 粒子背景动画
│   │   ├── Navbar.tsx        # 顶部导航栏
│   │   ├── Footer.tsx        # 页脚
│   │   └── CountUp.tsx       # 数字滚动动画
│   └── styles/
│       └── globals.css       # CSS 动画（animate-reveal-up / animate-scale-in / animate-float）
└── docs/
    ├── 00_TRAE_HANDOFF.md    # 交接说明
    ├── 01_PROJECT_BRIEF.md   # 项目简报
    ├── 02_PRD.md             # 产品需求
    ├── 03_PAGE_LIST.md       # 页面清单
    ├── 04_TECH_ARCHITECTURE.md # 技术架构
    ├── 05_DEVELOPMENT_TASKS.md # 开发任务
    ├── 06_VISUAL_STYLE.md    # 视觉风格
    ├── 07_DEMO_SCRIPT.md     # 演示脚本
    └── 08_TRAE_START_PROMPT.md # 启动提示
```

## 页面清单（15页）

| # | 页面 | 路由 | 核心功能 |
|---|------|------|----------|
| 1 | 首页 | `/` | 五层架构展示 + Canvas 粒子动画 |
| 2 | 关于我们 | `/about` | 团队介绍 |
| 3 | 核心功能 | `/features` | 功能概览 |
| 4 | 蛋白结构分析 | `/tools/protein` | PDB 结构搜索 + 3D 视图 + AI 导师 |
| 5 | 质粒图谱解读 | `/tools/plasmid` | 质粒图谱展示 |
| 6 | 序列分析 | `/tools/sequence` | 序列工具 |
| 7 | 代谢通路分析 | `/tools/pathway` | 代谢通路可视化 |
| 8 | 课程学习 | `/learning` | 章节列表 + 进度 |
| 9 | 学习看板 | `/dashboard` | 学习数据可视化 |
| 10 | 课程中心 | `/courses` | 课程浏览 |
| 11 | 科研园地 | `/research` | 科研资源 |
| 12 | 社区交流 | `/community` | 社区互动 |
| 13 | 联系我们 | `/contact` | 联系表单 |
| 14 | 隐私政策 | `/privacy` | 隐私条款 |
| 15 | 服务条款 | `/terms` | 服务条款 |

## 技术栈

| 层 | 技术 |
|---|------|
| 前端框架 | Next.js 14 + TypeScript + Tailwind CSS + App Router |
| 动画 | 纯 CSS @keyframes + Canvas 2D |
| 3D 结构 | NGL.js（蛋白结构可视化） |
| 图标 | Lucide React |
| 数字动画 | requestAnimationFrame |

## 设计系统

### 主题色彩

| 角色 | 色值 | 用途 |
|------|------|------|
| Primary | `#00D4AA` | 主色调（科技青） |
| Secondary | `#6366F1` | 次要色（靛蓝） |
| Accent | `#F472B6` | 强调色（粉色） |
| Background | `#0A0E1A` | 深色背景 |
| Surface | `rgba(15,23,42,0.8)` | 玻璃卡片 |

### CSS 动画

| 动画类 | 效果 | 适用场景 |
|--------|------|----------|
| `animate-reveal-up` | 从下往上淡入滑出 | 列表项、卡片 |
| `animate-scale-in` | 缩放淡入 | 弹窗、模态框 |
| `animate-float` | 悬浮上下浮动 | 装饰性元素 |
| `animate-pulse-glow` | 脉冲发光 | 交互按钮 |
| `animate-gradient-shift` | 渐变色流动 | 背景装饰 |

### 视觉风格

- **风格定位**：科技感 + 生物科学主题，深色沉浸式体验
- **主视觉**：Canvas 2D 粒子背景（20层深度模拟 + z 轴空间透视 + 鼠标交互）
- **玻璃拟态**：毛玻璃效果 + 微妙边框 + 背景模糊
- **流光效果**：渐变光晕 + 发光文字 + 霓虹强调色

## 快速开始

```bash
cd frontend
npm install
npm run dev
# 访问 http://localhost:3000
```

## 当前版本状态

- **版本基准**：`df0cacc`
- **最后更新时间**：2026-05-27
- **动画方案**：纯 CSS keyframes + Canvas 2D（无 GSAP / Three.js）
- **工具页状态**：静态展示页面（无后端 API 接入）
- **代码审核**：待其他 AI 协助审核

## 文件说明

| 文件 | 说明 |
|------|------|
| `task_plan_refactor.md` | 重构任务计划 |
| `progress.md` | 开发进度日志 |
| `findings.md` | 技术调研发现 |
