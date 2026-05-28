# 产业案例模块状态文档

## 当前已完成

### 1. 五个真实产业案例
| ID | 标题 | 产业方向 |
|----|------|----------|
| case-001 | 细胞凋亡与抗肿瘤药物研发 | 药物研发 |
| case-002 | CAR-T 细胞治疗与肿瘤免疫 | 细胞治疗 |
| case-003 | PD-1/PD-L1 免疫检查点抑制剂 | 药物研发 |
| case-004 | mRNA 疫苗递送技术 | 疫苗研发 |
| case-005 | CRISPR 基因编辑治疗 | 细胞治疗 |

每个案例包含完整字段：id、title、subtitle、industryDirection、relatedKnowledgePoints、coreProblem、researchFoundation、applicationValue、requiredAbilities、recommendedKeywords、linkedResearchTask、evidenceLevel、sourceType、background、applicationScenario、displayFocus、migrationPath、references。

### 2. 案例卡片
- 简洁卡片布局：案例名称、副标题、产业方向、核心问题、知识点标签、能力标签、知识迁移摘要条
- "查看详情"按钮 → 打开案例详情弹窗
- "进入科研实战"按钮 → 跳转 `/research?caseId=case-xxx`

### 3. 案例详情弹窗
- 全屏弹窗，展示：背景、科研基础、知识迁移路径（三列）、应用场景、应用价值、展示重点、知识点、能力、关键词、关联任务、参考来源
- `frontend/components/IndustryCaseDetailModal.tsx`

### 4. 产业智能问答 API
- 服务端 API Route：`POST /api/industry/answer`
- 请求体：`{ "query": "用户问题" }`
- 返回结构化 JSON：answer、relatedKnowledgePoints、matchedCases、researchFrontiers、industryApplications、requiredAbilities、recommendedKeywords、nextTasks、sourceScope、disclaimer
- 位于 `frontend/app/api/industry/answer/route.ts`

### 5. 本地案例上下文
- API Route 将前五个案例的摘要字段作为上下文传入 LLM prompt
- 模型基于本地案例库 + 自身知识进行结构化问答
- sourceScope 标识知识来源：based_on_local_cases / extended_reasoning / no_direct_match

### 6. Mock Fallback
- `DEEPSEEK_API_KEY` 未配置时自动降级到本地 mock
- API 调用失败/超时时自动降级
- mock 同样返回结构化结果（基于关键词匹配和案例筛选）
- 前端无白屏风险

### 7. 科研实战入口预留
- 卡片底部 "进入科研实战" 按钮传递 `caseId`
- 详情弹窗中 "进入科研实战" 按钮传递 `caseId`
- 链接格式：`/research?caseId=case-001`

### 8. AI 问答展示优化
- 结果按优先级展示：综合回答 → 直接匹配案例 → 相关知识与技术点 → 产业应用场景 → 科研实战任务
- 次要信息折叠：科研前沿方向、推荐关键词、相关拓展案例、训练能力
- sourceScope 标签可视化：基于本地案例库（绿色）、拓展性分析（蓝色）、暂无直接匹配（琥珀色）
- 免责声明始终显示

### 9. 安全合规
- API Key 仅从服务端环境变量读取（无 NEXT_PUBLIC_ 前缀）
- 不硬编码任何密钥
- 不在日志中打印完整 API Key
- .env.local 不提交 Git

---

## 当前未完成

### 1. 完整知识库 / RAG
- 当前仅基于五个本地案例摘要 + LLM 通用知识
- 无向量检索、无语义搜索
- 由其他同学负责后续实现

### 2. PubMed API 接入
- 尚未接入外部文献数据库
- 参考来源仅限案例数据中预置的 references 字段

### 3. 15 个案例全结构化
- 当前仅完成 5 个案例
- 后续可扩充更多产业方向案例

### 4. 科研实战页面消费 caseId
- `/research` 页面路由已预留 `caseId` 参数
- 当前科研实战模块尚未根据 caseId 动态加载对应任务

### 5. 文献证据卡片系统
- 参考来源（references）仅在详情弹窗中展示链接
- 尚未实现文献摘要、证据等级评分等高级功能

---

## 后续对接方式

### 知识库（由其他同学负责）
1. 知识库同学提供 RAG / 检索接口后，只需修改：
   - `frontend/app/api/industry/answer/route.ts` 中的 `buildCasesContext()` 函数
   - 将检索结果替换或追加到当前 prompt 上下文
2. 如需扩展 PubMed API：
   - 新增独立服务/API Route，如 `app/api/pubmed/search/route.ts`
   - 在产业问答 Route 中调用 PubMed 结果作为额外上下文

### 当前版本能力边界
- 前五个本地案例摘要 → LLM prompt 上下文
- LLM 自身知识补充（标注为 extended_reasoning）
- 结构化 JSON 输出，前端分块展示

---

## 安全边界

1. 不提供医疗建议
2. 不编造临床结论或商业数据（如销售额）
3. 无本地案例直接匹配时，sourceScope 标注为 extended_reasoning 或 no_direct_match
4. 所有回答附带免责声明："本回答用于课程学习和科研训练，不构成医疗或临床建议。"
5. API Key 仅服务端读取，无前端泄露风险