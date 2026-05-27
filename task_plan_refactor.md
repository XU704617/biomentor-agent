# BioMentor Agent 全站重构 任务计划

## 目标
去掉学生/教师角色分叉，统一为 14 页 BioMentor Agent，流光玻璃视觉，Vercel 部署。

## 阶段

### 阶段 1: 设计系统重写 (状态: ✅ completed)
- [x] tailwind.config.ts — 流光玻璃色彩系统
- [x] globals.css — 全部组件类重写
- [x] root layout.tsx — 简化，引入新字体

### 阶段 2: 全局组件 (状态: ✅ completed)
- [x] components/Navbar.tsx — 顶栏毛玻璃导航
- [x] components/HeroCanvas.tsx — Canvas 2D 粒子背景
- [x] components/CountUp.tsx — 数字滚动计数器
- [x] 删除旧组件：Sidebar.tsx, AppLayout.tsx, Header.tsx

### 阶段 3: 品牌首页 / (状态: ✅ completed)
- [x] app/page.tsx — Hero + 三层递进 + AI导师 + 数字计数器 + 功能入口

### 阶段 4: 核心功能页 (状态: ✅ completed)
- [x] app/explore/page.tsx — 知识探索中心
- [x] app/research/page.tsx — 科研实战训练营
- [x] app/cases/page.tsx — 产业案例库
- [x] app/knowledge-map/page.tsx — 知识图谱浏览
- [x] app/seminar/page.tsx — 学术研讨/模拟答辩
- [x] app/assessment/page.tsx — 智能测评中心
- [x] app/diagnosis/page.tsx — 学习诊断仪表盘
- [x] app/timeline/page.tsx — 学习轨迹时间线
- [x] app/wrong-questions/page.tsx — 错题本

### 阶段 5: 生物工具箱页 (状态: ✅ completed)
- [x] app/tools/page.tsx — 工具箱入口
- [x] app/tools/protein/page.tsx — 蛋白结构 3D 查看
- [x] app/tools/plasmid/page.tsx — 质粒图谱绘制
- [x] app/tools/sequence/page.tsx — 序列分析工具
- [x] app/tools/pathway/page.tsx — 通路图谱浏览

### 阶段 6: 清理 + 构建 (状态: ✅ completed)
- [x] 删除 /student/* /teacher/* 旧路由
- [x] 删除旧组件 Sidebar, 重写 Header→Navbar
- [x] npm run build 通过 (15 页面, 0 错误)
- [x] Vercel 部署: https://frontend-eta-nine-7rvsekcz80.vercel.app

## 当前技术栈
- **前端**: Next.js 14 + TypeScript + Tailwind CSS
- **动画**: 纯 CSS keyframes (reveal-up / scale-in / float)
- **组件**: Navbar + HeroCanvas (Canvas 2D 粒子) + CountUp
- **部署**: Vercel (frontend-eta-nine-7rvsekcz80.vercel.app)

## 页面清单 (15 页)
| 路由 | 说明 |
|------|------|
| `/` | 品牌首页：Hero + 三层递进 + AI导师 + 功能入口 |
| `/explore` | 知识探索中心 |
| `/research` | 科研实战训练营 |
| `/cases` | 产业案例库 |
| `/knowledge-map` | 知识图谱浏览 |
| `/seminar` | 学术研讨/模拟答辩 |
| `/assessment` | 智能测评中心 |
| `/diagnosis` | 学习诊断仪表盘 |
| `/timeline` | 学习轨迹时间线 |
| `/wrong-questions` | 错题本 |
| `/tools` | 生物工具箱入口 |
| `/tools/protein` | 蛋白结构 3D 查看 |
| `/tools/plasmid` | 质粒图谱绘制 |
| `/tools/sequence` | 序列分析工具 |
| `/tools/pathway` | 通路图谱浏览 |

## 版本说明
- **当前版本**: commit `df0cacc`
- **无 GSAP / Three.js 依赖**，所有动画为纯 CSS
- 无后端代码 (backend/ 在后续版本中已移除)
- 工具页为静态展示页，无真实 API 对接
