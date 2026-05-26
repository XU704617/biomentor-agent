# BioMentor 学生端重构 — 设计方案

> 2026-05-26 确认通过

## 核心定位变更

**从** "刷题+成绩排名"的应试平台
**到** **BioToolBox 生物学习工具箱** — 4 个生物信息学工具 + AI 智能体讲解

## 页面架构

```
/student                  BioToolBox 工具箱主页（4 工具入口 + 辅助入口）
/student/protein          蛋白结构查看器（3D 可视化 + AI 对话）
/student/plasmid          质粒图谱查看器（图谱展示 + AI 对话）
/student/sequence         序列分析工具（翻译/BLAST/引物设计 + AI 对话）
/student/pathway          通路知识图谱（Reactome + AI 对话）
/student/report           学习诊断报告（保留）
/student/wrong-questions  错题本（保留）
```

删除：`/student/quiz`, `/student/quiz/result`, `/student/case-study`

## 页面布局

每个工具页采用 Canvas 风格：**左侧可视化区 + 右侧 AI 对话面板**，底部可折叠验证题目。

## 侧边导航

两个分组：
- **工具箱**：蛋白结构查看器、质粒图谱查看器、序列分析工具、通路知识图谱
- **学习辅助**：学习诊断、错题本

## 视觉系统

- 背景：极浅灰 #f5f5f7（Apple 风格）
- 卡片：纯白 #ffffff + 1px #e5e5e7 边框
- 主色：电光蓝 #2563eb
- 辅色：翠绿 #059669
- 警示：红 #dc2626
- 字体：全系统无衬线（放弃 Georgia）
- 去掉：圆点纹理、径向光晕、过度动效、Emoji

## 开发策略

混合策略：先一次性搭完所有页面 UI（demo 数据），再逐个接入后端工具。

## 工具接入可行性

| 工具 | 前端库 | 难度 |
|------|--------|------|
| 蛋白 3D | 3Dmol.js | 低 |
| 质粒图谱 | SeqViz + pLannotate | 中 |
| 序列分析 | Biopython + Primer3 | 中 |
| 通路图谱 | Cytoscape.js + Reactome API | 低 |
