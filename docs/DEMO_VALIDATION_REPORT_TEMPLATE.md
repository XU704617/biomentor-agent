# BioMentor Agent Demo Validation Report

## 验证基本信息

| 字段 | 值 |
|------|-----|
| 验证日期 | YYYY-MM-DD HH:MM TZ |
| Commit Hash | _(e.g. 9fbe7ac)_ |
| 分支 | _(e.g. feature/demo-quality-validation)_ |
| 验证人 | _(name)_ |
| 环境 | _(local / dev / staging)_ |
| Backend URL | _(e.g. http://127.0.0.1:9090)_ |
| LITERATURE_PROVIDER | _(not_configured / pubmed / crossref / semantic_scholar)_ |

## 自动化检查结果

| 检查项 | 状态 (PASS/FAIL/SKIPPED) | 备注 |
|--------|--------------------------|------|
| Backend 可达性 | | |
| Default Smoke (产业案例/任务生成/文献搜索) | | |
| Evidence Link Checks | | _(可选，需 RUN_EVIDENCE_LINK_CHECKS=1)_ |
| PubMed Live Checks | | _(可选，需 RUN_LIVE_LITERATURE_CHECKS=1)_ |

## 后端测试

| 指标 | 值 |
|------|-----|
| 测试通过数 | _(e.g. 57 passed)_ |
| 测试失败数 | |
| 运行命令 | `cd backend && python -m pytest` |

## 前端构建

| 指标 | 值 |
|------|-----|
| 构建状态 | PASS / FAIL |
| 运行命令 | `cd frontend && npm run build` |

## 已验证功能清单

- [ ] 23 个产业案例完整展示
- [ ] `/api/industry/cases?page_size=100` 返回 total >= 23
- [ ] `/api/industry/cases/case-004` 返回正确的 case_key
- [ ] `/api/research/generate-task` 生成 4 个科研训练任务卡
- [ ] 文献搜索 baseline（source=not_configured 时返回空数组）
- [ ] 文献搜索 anti-spoofing（无伪造字段）
- [ ] 空查询 validation（返回 422）
- [ ] `/research?caseId=case-xxx` 前端页面正常渲染

## 可选验证（按配置）

- [ ] Evidence Search POST `/api/evidence/search` 返回有效结果
- [ ] Evidence Note POST `/api/evidence/note` 返回边界信息
- [ ] PubMed live metadata 查询返回真实数据
- [ ] PubMed 结果字段完整性（source_provider, pmid, title, doi, authors, abstract）

## 未覆盖能力

> 列出本次验证未覆盖的功能或场景。

- _(e.g. 前端 UI 交互未在脚本中验证)_
- _(e.g. 多 case 批量生成任务卡未验证)_
- _(e.g. 语义学者/跨端搜索 provider 未验证)_

## 已知边界

> 列出已知的限制条件或边界情况。

- _(e.g. PubMed live 检查依赖外网访问)_
- _(e.g. Evidence API 可能在某些部署中未启用)_
- _(e.g. 脚本不验证前端浏览器渲染)_

## 运行命令记录

```bash
# Quality validation runner
BACKEND_BASE=http://127.0.0.1:9090 bash scripts/run_demo_quality_checks.sh

# With evidence checks
RUN_EVIDENCE_LINK_CHECKS=1 BACKEND_BASE=http://127.0.0.1:9090 bash scripts/run_demo_quality_checks.sh

# With live PubMed checks
RUN_LIVE_LITERATURE_CHECKS=1 LITERATURE_PROVIDER=pubmed BACKEND_BASE=http://127.0.0.1:9090 bash scripts/run_demo_quality_checks.sh
```

## 结论

> 对本次 demo 验证的整体评价。

**验证结论**: PASS / FAIL / CONDITIONAL_PASS

**说明**:

_(在此填写验证结论说明)_

---

_本报告由 `scripts/run_demo_quality_checks.sh` 辅助生成，填写后请存档。_
