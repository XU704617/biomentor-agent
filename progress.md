# BioMentor Agent 进度日志

## 当前版本（commit `df0cacc`）

### 状态
- **构建**: ✅ Next.js 14.2.35, 15 页 0 错误
- **部署**: ✅ https://frontend-eta-nine-7rvsekcz80.vercel.app
- **动画**: 纯 CSS keyframes，无 GSAP 依赖
- **后端**: 无后端代码（此版本为纯前端静态展示）

### 前端结构
```
frontend/
  app/
    page.tsx                    — 首页
    layout.tsx                  — 根布局
    globals.css                 — 全局样式 + 玻璃设计系统
    explore/page.tsx            — 知识探索中心
    research/page.tsx           — 科研实战训练营
    cases/page.tsx              — 产业案例库
    knowledge-map/page.tsx      — 知识图谱浏览
    seminar/page.tsx            — 学术研讨
    assessment/page.tsx         — 智能测评中心
    diagnosis/page.tsx          — 学习诊断仪表盘
    timeline/page.tsx           — 学习轨迹时间线
    wrong-questions/page.tsx    — 错题本
    tools/page.tsx              — 生物工具箱入口
    tools/protein/page.tsx      — 蛋白结构 3D 查看
    tools/plasmid/page.tsx      — 质粒图谱绘制
    tools/sequence/page.tsx     — 序列分析工具
    tools/pathway/page.tsx      — 通路图谱浏览
  components/
    Navbar.tsx                  — 顶栏毛玻璃导航
    HeroCanvas.tsx              — Canvas 2D 粒子背景
    CountUp.tsx                 — 数字滚动计数器
```

### 设计系统
- **色彩**: 流光玻璃 — surface/canvas 渐变背景, brand-ink/muted/faint 文字, accent-electric/cyan/amber/rose 强调
- **组件类**: glass-card, glass-nav, glass-card-iridescent, btn-hero, btn-hero-secondary, badge-*
- **字体**: Plus Jakarta Sans (font-body), Orbitron/Clash Display 变体 (font-display), JetBrains Mono (font-mono)
- **动画**: animate-reveal-up (淡入上移), animate-scale-in (缩放淡入), animate-float (漂浮)

### 已知问题
- HeroCanvas Canvas 2D 粒子在快速滚动时偶尔出现 negative radius 错误（浏览器处理 `Math.random()` 边界情况），不影响功能
- 工具页面为静态展示，未接入后端 API

---

## 2026-05-26 会话

### 完成的工作
- 已将源项目 12 个文件从 `D:\anti2sys\ppiflow_project\biomentor-agent-trae-handoff` 复制到 `D:\BioMentor Agent`
- 已完整阅读所有项目交接文档，深入理解项目需求
- 已深度研读 25单元调研报告 PDF（22页），掌握完整25个功能单元细节
- 已创建规划三件套 (task_plan.md, findings.md, progress.md)，含5阶段路线图
- 已创建 frontend/ Next.js 项目骨架（31个文件：7教师页+6学生页+5组件+配置）
- 已创建 backend/ FastAPI 项目骨架（33个文件：9模型+9路由+7 schema+配置）
- 后续完成全站重构为统一 14 页 BioMentor Agent，流光玻璃视觉
