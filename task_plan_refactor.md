# BioMentor Agent 全站重构 任务计划

## 目标
去掉学生/教师角色分叉，统一为 14 页 BioMentor Agent，流光玻璃视觉，Vercel 部署。

## 阶段

### 阶段 1: 设计系统重写 (状态: pending)
- [ ] tailwind.config.ts — 流光玻璃色彩系统
- [ ] globals.css — 全部组件类重写
- [ ] root layout.tsx — 简化，引入新字体

### 阶段 2: 全局组件 (状态: pending)
- [ ] components/Navbar.tsx — 顶栏毛玻璃导航
- [ ] components/Footer.tsx — 页脚
- [ ] components/HeroCanvas.tsx — Three.js 3D 粒子背景
- [ ] components/CountUp.tsx — 数字滚动计数器
- [ ] 删除旧组件：Sidebar.tsx, AppLayout.tsx (重写), Header.tsx (重写)

### 阶段 3: 品牌首页 / (状态: pending)
- [ ] app/page.tsx — 全屏 3D Hero + 三层递进 + AI导师 + 数字计数器 + 功能入口

### 阶段 4: 核心功能页 (状态: pending)
- [ ] app/explore/page.tsx — 知识探索中心
- [ ] app/research/page.tsx — 科研实战训练营
- [ ] app/cases/page.tsx — 产业案例库
- [ ] app/knowledge-map/page.tsx — 知识图谱浏览
- [ ] app/seminar/page.tsx — 学术研讨/模拟答辩
- [ ] app/assessment/page.tsx — 智能测评中心
- [ ] app/diagnosis/page.tsx — 学习诊断仪表盘
- [ ] app/timeline/page.tsx — 学习轨迹时间线
- [ ] app/wrong-questions/page.tsx — 错题本

### 阶段 5: 生物工具箱页 (状态: pending)
- [ ] app/tools/page.tsx — 工具箱入口（从 student/page.tsx 迁移）
- [ ] app/tools/protein/page.tsx — 蛋白结构（从 student/protein 迁移）
- [ ] app/tools/plasmid/page.tsx — 质粒图谱
- [ ] app/tools/sequence/page.tsx — 序列分析
- [ ] app/tools/pathway/page.tsx — 通路图谱

### 阶段 6: 清理 + 构建 (状态: pending)
- [ ] 删除 /student/* /teacher/* 旧路由
- [ ] 删除旧组件 Sidebar, 重写 Header→Navbar
- [ ] 构建验证 + 修复
- [ ] Vercel 部署
