# BioMentor Agent — Demo Quality Checklist

本文档提供 BioMentor Agent 的 Demo 质量验收清单，用于确保每次演示前系统状态符合预期。

---

## 一、环境检查

- [ ] Python 3.10+ 已安装
- [ ] Node.js 18+ 已安装
- [ ] 后端依赖已安装：`cd backend && pip install -r requirements.txt`
- [ ] 前端依赖已安装：`cd frontend && npm install`
- [ ] 工作目录正确：`/data/hanxu/projects/biomentor-agent-demo-docs`
- [ ] 当前分支：`feature/demo-quality-docs`

---

## 二、数据库 Reset

- [ ] 执行数据库重置：

  ```bash
  bash scripts/reset_demo_db.sh
  ```

- [ ] 确认旧数据库文件已清理（`biomentor.db`、`-wal`、`-shm`）
- [ ] 确认 `.env.local` 和 `seed_data` 文件未被修改

---

## 三、后端启动

- [ ] 设置数据库路径：

  ```bash
  export DATABASE_URL=sqlite:////tmp/biomentor_demo_23cases.db
  ```

- [ ] 启动后端：

  ```bash
  cd backend
  python -m uvicorn app.main:app --host 0.0.0.0 --port 9090
  ```

- [ ] 确认日志输出包含：

  ```
  [seed] Loaded 23 industry cases
  ```

- [ ] 验证后端健康：

  ```bash
  curl "http://localhost:9090/api/industry/cases?page_size=100"
  ```

  预期返回 `total=23`。

---

## 四、前端 Build

- [ ] 进入前端目录：

  ```bash
  cd frontend
  ```

- [ ] 执行构建：

  ```bash
  npm run build
  ```

- [ ] 确认构建成功，无错误输出

> 演示时可使用 `npm run dev -- -p 3001` 启动开发服务器，build 仅用于验收。

---

## 五、API Smoke 测试

### 5.1 Default Smoke

- [ ] 执行默认 smoke 测试：

  ```bash
  bash scripts/smoke_demo_api.sh
  ```

- [ ] 确认输出包含 `SMOKE PASS` 或全部检查项通过

---

## 六、PubMed Live Smoke（可选）

- [ ] 配置 PubMed provider：

  ```bash
  export LITERATURE_PROVIDER=pubmed
  export LITERATURE_NCBI_TOOL=biomentor-agent
  export LITERATURE_NCBI_EMAIL=your_email@example.com
  ```

- [ ] 重启后端

- [ ] 验证 PubMed 检索：

  ```bash
  curl "http://localhost:9090/api/literature/search?q=mRNA&limit=3"
  ```

- [ ] 确认返回非空结果，包含真实文献元数据（title、authors、PMID 等）
- [ ] 确认缺失字段为 null 或"未提供"，无伪造数据

> 此步骤为可选。PubMed live 检查不作为本地 smoke 必过条件。

---

## 七、Evidence Link Smoke

- [ ] 在科研任务卡下触发文献检索（通过前端 `/research` 页面）
- [ ] 确认 Evidence Link 区域正常展示文献 metadata 列表
- [ ] 手动选择文献后，确认能生成 metadata-based evidence note
- [ ] 确认 evidence note 仅使用已有 metadata，未补编缺失字段
- [ ] 执行 evidence smoke 测试（如可用）：

  ```bash
  bash scripts/smoke_evidence.sh
  ```

- [ ] 确认输出包含 `SMOKE PASS` 或全部检查项通过

---

## 八、关键页面检查

- [ ] 首页 `http://localhost:3001` 加载正常
- [ ] 产业案例页 `http://localhost:3001/cases` 展示 23 个案例
- [ ] 案例搜索功能正常（搜索 "mRNA"、"CAR-T"）
- [ ] 科研实战页 `http://localhost:3001/research?caseId=case-004` 展示 4 个任务卡
- [ ] 科研实战页的 AI 文献检索区域正常展示
- [ ] 学术研讨页 `http://localhost:3001/seminar?caseId=case-004` 加载正常

---

## 九、禁止事项检查

以下行为在演示中严格禁止：

- [ ] **不宣传**系统已完成完整科研 Agent
- [ ] **不宣传**系统已完成自动科研查证
- [ ] **不宣传**系统已完成全文解析
- [ ] **不宣传**系统已完成 AI 文献总结
- [ ] **不宣传**系统已完成 automatic evidence grounding
- [ ] **不伪造** DOI / PMID / author / abstract 等文献元数据字段
- [ ] **不声称**科研任务卡是真实实验方案建议

---

## 十、成功标准

所有演示必须满足以下成功标准：

| 标准 | 状态 |
|------|------|
| backend tests passed | `57 passed` |
| npm run build passed | ✅ |
| default smoke passed | ✅ |
| evidence smoke passed | ✅ |
| PubMed live smoke (optional) | ✅ / ⏭️ |

如上述标准中有未通过项，**不得进行正式演示**。

---

## 十一、演示就绪确认

完成以上所有检查后，确认：

- [ ] 环境检查通过
- [ ] 数据库已 reset
- [ ] 后端启动正常
- [ ] 前端 build 通过
- [ ] API smoke 通过
- [ ] Evidence Link smoke 通过
- [ ] 关键页面检查通过
- [ ] 禁止事项已确认
- [ ] 成功标准全部满足

**Demo 就绪。** 可按照 [FINAL_DEMO_GUIDE.md](./FINAL_DEMO_GUIDE.md) 进行演示。

---

## 十二、相关文档

- [最终演示指南](./FINAL_DEMO_GUIDE.md)
- [本地 Demo 启动指南](./LOCAL_DEMO_STARTUP.md)
- [当前项目状态](./CURRENT_PROJECT_STATUS.md)
- [Evidence Link 工作流](./EVIDENCE_LINK_WORKFLOW.md)
- [文献检索合同文档](./LITERATURE_SEARCH_CONTRACT.md)
