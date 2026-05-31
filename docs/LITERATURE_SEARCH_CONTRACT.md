# BioMentor Agent — Literature Search Contract

本文档定义 BioMentor Agent 文献检索能力的接口合同、provider 配置、能力边界和演示说明。

---

## 一、当前能力定位

BioMentor Agent 的 literature search **当前是"可配置文献检索入口/接口能力"**，不是完整的 evidence grounding。

具体含义：

- 系统已预留文献检索的 API 接口和前端入口（`/research` 页面）。
- 支持通过环境变量切换不同的文献数据源 provider。
- **不等于**：真实文献证据链、自动科研查证、论文全文解析、evidence grounding。

当前阶段目标是提供一个诚实、可配置的文献检索入口，让演示者和开发者能够了解系统的检索能力边界，而不是宣称已具备完整的科研文献验证能力。

---

## 二、统一响应合同

### 2.1 LiteratureSearchResponse

所有文献检索 API 返回统一的 `LiteratureSearchResponse` 结构：

```json
{
  "query": "string | null",
  "source": "string",
  "results": "LiteratureSearchItem[]",
  "message": "string | null",
  "error": "string | null"
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `query` | `string \| null` | 用户输入的检索查询词。未提供查询时可为 null。 |
| `source` | `string` | 当前使用的文献数据源标识，如 `"semantic_scholar"`、`"crossref"`、`"not_configured"`。 |
| `results` | `LiteratureSearchItem[]` | 检索结果列表。无结果时为空数组 `[]`。 |
| `message` | `string \| null` | 可选的提示信息，用于向调用方传递状态说明。 |
| `error` | `string \| null` | 可选的错误信息。仅在 provider 调用失败或配置异常时非 null。 |

### 2.2 LiteratureSearchItem

每条检索结果为一个 `LiteratureSearchItem` 结构：

```json
{
  "id": "string",
  "title": "string | null",
  "authors": "string[] | null",
  "year": "number | null",
  "venue": "string | null",
  "doi": "string | null",
  "pmid": "string | null",
  "url": "string | null",
  "abstract": "string | null",
  "source_provider": "string",
  "raw_id": "string | null"
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | `string` | 系统内部唯一标识。 |
| `title` | `string \| null` | 文献标题。缺失时为 null。 |
| `authors` | `string[] \| null` | 作者列表。缺失时为 null 或空数组 `[]`。 |
| `year` | `number \| null` | 发表年份。缺失时为 null。 |
| `venue` | `string \| null` | 发表期刊/会议名称。缺失时为 null。 |
| `doi` | `string \| null` | DOI 标识符。缺失时为 null。 |
| `pmid` | `string \| null` | PubMed ID。缺失时为 null。 |
| `url` | `string \| null` | 文献公开访问链接。缺失时为 null。 |
| `abstract` | `string \| null` | 摘要文本。缺失时为 null。 |
| `source_provider` | `string` | 数据来源 provider 标识，如 `"semantic_scholar"`、`"crossref"`。 |
| `raw_id` | `string \| null` | provider 原生 ID。缺失时为 null。 |

### 2.3 字段缺失约定

当某个字段在 provider 返回数据中不存在时：

- **字符串字段**：使用 `null`
- **数组字段**：使用 `null` 或空数组 `[]`
- **数字字段**：使用 `null`
- **文本字段**：使用字符串 `"未提供"` 作为前端展示的占位文本

**严格禁止补编数据**：不得在缺失字段时伪造 DOI、PMID、标题、作者、期刊、年份或任何其他元数据。

---

## 三、Provider 配置

### 3.1 环境变量

| 环境变量 | 可选值 | 默认值 | 说明 |
|----------|--------|--------|------|
| `LITERATURE_PROVIDER` | `not_configured`、`semantic_scholar`、`crossref` | `not_configured` | 选择文献检索数据源。 |

可选环境变量：

| 环境变量 | 说明 |
|----------|------|
| `LITERATURE_SEMANTIC_SCHOLAR_API_KEY` | Semantic Scholar API 密钥。仅当 `LITERATURE_PROVIDER=semantic_scholar` 时使用。 |

### 3.2 默认行为（not_configured）

当 `LITERATURE_PROVIDER` 未设置或设为 `not_configured` 时：

- `GET /api/literature/search` 返回 `source: "not_configured"`，`results: []`。
- 不发起任何外部 API 调用。
- 前端 `/research` 页面的文献检索区域显示"未配置文献数据源"状态。

### 3.3 配置示例

```bash
# 不启用文献检索（默认）
export LITERATURE_PROVIDER=not_configured

# 使用 Semantic Scholar
export LITERATURE_PROVIDER=semantic_scholar
export LITERATURE_SEMANTIC_SCHOLAR_API_KEY=your_api_key_here

# 使用 Crossref
export LITERATURE_PROVIDER=crossref
```

---

## 四、Provider 能力边界

### 4.1 Semantic Scholar

**可用能力：**

- 论文检索：按关键词、标题、作者等查询学术论文。
- 基础元数据获取：标题、作者、年份、期刊/会议、DOI、摘要、引用计数等。

**不等于：**

- 最终科研证据验证。
- 论文全文解析或内容理解。
- 临床证据等级评估。
- 系统性文献综述或 meta-analysis。

**注意事项：**

- Semantic Scholar 覆盖范围以计算机科学、生物医学等领域为主，不覆盖所有学科。
- 部分论文可能缺少摘要、作者全名或 DOI。
- API 有速率限制，免费 tier 通常为每秒 1 请求。

### 4.2 Crossref

**可用能力：**

- 学术出版元数据检索：按 DOI、标题、作者等查询出版物元数据。
- 获取出版信息：期刊名称、卷期页码、出版日期、出版社等。

**不等于：**

- 完整的论文摘要数据库（Crossref 不保证每条记录都有摘要）。
- 作者信息的完整性保障（部分记录作者信息缺失或不完整）。
- PubMed ID 数据源（Crossref 不保证每条记录都有 PMID）。

**注意事项：**

- Crossref 是元数据注册机构，主要存储出版元数据而非全文内容。
- 摘要字段（`abstract`）为可选字段，大量记录不包含摘要。
- PMID 仅在出版社主动注册时才会出现在 Crossref 记录中。

---

## 五、禁止宣传与允许宣传

### 5.1 禁止宣传（不能说）

| 禁止说法 | 原因 |
|----------|------|
| "已完成真实文献证据链" | 当前未实现 evidence grounding，不能宣称具备证据链能力。 |
| "已完成自动科研查证" | 文献检索不等同于自动科研查证。 |
| "已完成 PubMed 接入" | PubMed 尚未接入为 provider 选项。 |
| "已完成论文全文解析" | 系统不解析论文全文，仅获取元数据。 |
| "已完成 evidence grounding" | evidence grounding 是更高级的能力，当前仅提供文献检索入口。 |

### 5.2 允许宣传（可以说）

| 允许说法 |
|----------|
| "已有文献检索入口" |
| "支持可配置 provider 的准备" |
| "未配置 provider 时显示 not_configured" |
| "不伪造 DOI/PMID/标题/作者/期刊/年份" |

---

## 六、演示路径

### 6.1 默认演示（无 provider 配置）

1. 启动系统（不设置 `LITERATURE_PROVIDER` 或设为 `not_configured`）。
2. 访问 `/research` 页面。
3. 文献检索区域显示"未配置文献数据源"（`not_configured`）状态。
4. 调用 `GET /api/literature/search` 返回空结果，`source: "not_configured"`。

**演示要点：**

- 向观众说明：这是一个预留的文献检索接口，尚未接入真实文献数据库。
- 强调诚实设计：不伪造任何文献数据。

### 6.2 配置 provider 演示（可选）

1. 设置 `LITERATURE_PROVIDER=semantic_scholar`（或 `crossref`）及对应 API Key。
2. 重启后端。
3. 访问 `/research` 页面，在文献检索区域输入关键词搜索。
4. 展示返回的真实文献元数据。
5. 特别说明缺失字段显示为"未提供"。

**演示要点：**

- 展示真实文献元数据时，诚实地指出缺少的字段。
- 强调：这是文献检索入口，不等同于 evidence grounding 或科研验证。
- 不做 AI 证据总结。

---

## 七、相关文档

- [当前项目状态](./CURRENT_PROJECT_STATUS.md)
- [演示路径指南](./DEMO_WALKTHROUGH.md)
- [本地 Demo 启动指南](./LOCAL_DEMO_STARTUP.md)