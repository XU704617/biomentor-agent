# BioMentor Agent 任务计划

## 目标
完成 BioMentor Agent | 智造学伴 完整 MVP，按5阶段路线推进：底座→测评→诊断→冲奖→包装。

## 整体路线（来自25单元调研报告）

```
阶段A: 真实可用底座 (01,02,20) → 阶段B: 测评闭环 (04,05,06) → 阶段C: 诊断与报告 (07,08,09,10,11) → 阶段D: 冲奖增强 (03,12,13,14,16,17) → 阶段E: 评估与包装 (21,22,25)
```

## 阶段 1: 文件迁移与项目理解 (状态: completed)
- [x] 复制源项目所有文档到目标目录
- [x] 阅读全部 12 个交接文件，深度理解项目需求
- [x] 深度研读 25单元调研报告 PDF（22页），完整理解25个功能单元
- [x] 创建规划文件 task_plan.md / findings.md / progress.md
- [x] 创建 frontend/ Next.js 项目骨架（31个文件）
- [x] 创建 backend/ FastAPI 项目骨架（33个文件）

## 阶段 A: 真实可用底座 - 单元01/02/20 (状态: pending)
- [ ] 单元01: 课程资料上传与解析 - ingestion pipeline (文件上传→类型识别→文本抽取→清洗→分块→来源绑定)
- [ ] 单元01: 支持文本型 PDF/DOCX/TXT，扫描版留 OCR 插槽
- [ ] 单元02: 生物制造领域知识库构建 - hybrid metadata-first RAG
- [ ] 单元02: 按 course/source_type/chapter/knowledge_tags 过滤 + 向量召回 top-k + 重排
- [ ] 单元02: chunk_size 400-800 中文字可调策略
- [ ] 单元20: 完善数据模型 - 补充 knowledge_nodes/edges, source_refs, agent_runs 等表
- [ ] 创建 Chroma 向量库集合: course_materials, papers, cases
- [ ] 前后端联调：文件上传 → 解析 → chunk → embedding → 检索

## 阶段 B: 测评闭环 - 单元04/05/06 (状态: pending)
- [ ] 单元04: AI 自动出题 - Prompt 输入知识点+证据+题型+Bloom层级+难度+负例约束
- [ ] 单元04: 输出 JSON schema: stem/options/answer/explanation/rubric/source_refs/tags
- [ ] 单元04: 二次校验 Agent（证据一致性、答案唯一性、选项互斥性、难度估计）
- [ ] 单元05: 题目质量控制 - 自动检查+一键发布+可编辑
- [ ] 单元05: 教师审核界面（编辑、驳回、发布、查看来源证据）
- [ ] 单元06: 学生测验系统 - quiz/attempt/response 数据流
- [ ] 单元06: 客观题实时判分，主观题进入AI评分队列
- [ ] 保存作答时间、修改次数、提交轨迹

## 阶段 C: 诊断与报告 - 单元07/08/09/10/11 (状态: pending)
- [ ] 单元07: 主观题 rubric-based grading（要点、分值、常见误区→score_breakdown/missing_points/feedback/confidence）
- [ ] 单元07: 低置信度答案标记 needs_review 交给教师复核
- [ ] 单元08: 知识点诊断 - 规则+LLM：错题触发掌握度下降，主观题反馈抽取 error_type
- [ ] 单元08: student_knowledge_state 表 + error_events 表
- [ ] 单元09: 能力画像 - 6个维度(concept/mechanism/application/literature/research_design/transfer)
- [ ] 单元09: 能力雷达图前端组件
- [ ] 单元10: 个性化学习路径 - 推荐器三层：知识点补弱、题型补练、案例迁移
- [ ] 单元10: 每条推荐必须带 reason 和 evidence
- [ ] 单元11: 错题本 - 按知识点聚合，支持重做原题/生成相似题/查看资料
- [ ] 单元11: 间隔复习规则（Leitner 简化版）

## 阶段 D: 冲奖增强 - 单元03/12/13/14/16/17/18/19 (状态: pending)
- [ ] 单元03: 轻量知识地图 - LLM抽concepts→生成relations(prerequisite/related/applied_in/assessed_by)
- [ ] 单元03: ECharts force graph 可视化
- [ ] 单元12: 生物制造案例库 - case_template(背景/问题/数据/知识点/引导问题/参考资料/评分维度)
- [ ] 单元12: 首批人工精选 6-10 个高质量案例（青蒿素、PHA、生物塑料、工程菌、酶催化等）
- [ ] 单元13: 科研案例辅导Agent - Socratic tutoring流程(理解答案→判断阶段→提示→要求补充→rubric评价)
- [ ] 单元13: 提示优先、答案延迟（不能直接替学生写完整答案）
- [ ] 单元14: 文献阅读与论文问答 - paper_card(研究问题/方法/结果/局限/课程知识点)
- [ ] 单元14: 问答必须引用段落/页码
- [ ] 单元16: 班级学习分析看板 - KPI卡片/知识点热力图/能力箱线图/学生列表/错题排行
- [ ] 单元17: 教学改进建议生成 - 输入analytics JSON+课程目标+错题样本→薄弱点/讲解顺序/案例推荐
- [ ] 单元18: 多智能体编排 - LangGraph风格状态机：IngestGraph/QuestionGraph/GradingGraph/DiagnosisGraph/CaseTutorGraph
- [ ] 单元19: Prompt模板版本化，每个workflow有validate_node做格式和证据校验

## 阶段 E: 评估与包装 - 单元21/22/25 (状态: pending)
- [ ] 单元21: 四类 eval：RAG factuality、question quality、grading agreement、learning analytics usefulness
- [ ] 单元21: 准备 20-50 个人工标注样例
- [ ] 单元22: 内容安全 - 来源引用、置信度、教师审核、敏感内容过滤、日志脱敏
- [ ] 单元25: 固定演示剧本：上传文献→知识图谱→出题→学生答题→能力画像→科研案例辅导→教师建议
- [ ] 单元25: demo_seed_data、showcase_mode、配套 PPT 和讲解脚本

## 遇到的错误
| 错误 | 解决方案 |
|------|---------|
