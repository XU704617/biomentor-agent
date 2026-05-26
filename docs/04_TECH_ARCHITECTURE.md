# 04_TECH_ARCHITECTURE.md

# 技术架构

## 五层架构

```text
评价层：能力画像、班级热力图、教学建议、学习路径
应用层：教师端、学生端、测验系统、报告系统
智能体层：知识构建、出题测评、学习诊断、路径规划、科研辅导
知识层：课程知识库、文献知识库、案例知识库、知识地图
数据层：教材、课件、论文、案例、题目、答题记录
```

## 推荐技术栈

### Frontend

```text
Next.js
TypeScript
Tailwind CSS
shadcn/ui
Recharts 或 ECharts
```

### Backend

```text
FastAPI
SQLAlchemy
SQLite
Pydantic
```

### RAG

```text
PyMuPDF
python-docx
Chroma
Embedding API
LLM API
```

## 推荐项目结构

```text
biomentor-agent/
  frontend/
    app/
    components/
    lib/
    data/
  backend/
    app/
      main.py
      config.py
      database.py
      models/
      schemas/
      routers/
      services/
      ai/
      rag/
      utils/
  docs/
  demo-data/
  README.md
  .env.example
```

## 核心数据模型

### User

```text
id, name, role, email, created_at
```

### Course

```text
id, title, description, teacher_id, created_at
```

### FileResource

```text
id, course_id, filename, file_type, file_path, parse_status, summary, created_at
```

### KnowledgeChunk

```text
id, file_id, course_id, content, page_number, chapter_title, embedding_id, metadata
```

### Question

```text
id, course_id, knowledge_node_id, type, stem, options, answer, explanation, rubric, difficulty, source_refs, status
```

### Quiz

```text
id, course_id, title, description, status, start_time, end_time
```

### Attempt

```text
id, quiz_id, student_id, score, status, submitted_at
```

### Response

```text
id, attempt_id, question_id, student_answer, is_correct, score, ai_feedback, error_type
```

### StudentProfile

```text
student_id, course_id, concept_score, mechanism_score, application_score, literature_score, research_design_score, transfer_score
```
