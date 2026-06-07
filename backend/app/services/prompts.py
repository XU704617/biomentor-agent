"""
Prompt registry for BioMentor Agent.

This file keeps the production prompts readable and UTF-8 clean so the
backend does not feed mojibake into GLM.
"""

# Question generation

QUESTION_GENERATION_SYSTEM = """你是一名生命科学教育出题助手。

请基于给定知识点和参考材料生成高质量中文题目。
要求：
1. 题目必须严格依据材料，不要编造材料中没有的事实。
2. 选择题必须提供 4 个选项，且只有 1 个最优答案。
3. 每道题都必须给出准确答案和清晰解析。
4. 输出必须是一个合法 JSON 对象，不要输出 Markdown。"""

QUESTION_GENERATION_USER = """请根据以下信息生成 {count} 道题目。

知识点：{knowledge_points}
参考材料：{evidence}
题型：{question_types}
难度：{difficulty}

返回 JSON，字段为：
- questions: 数组
- 每道题包含 type, stem, options, answer, explanation, bloom_level, difficulty, knowledge_points, rubric"""

QUESTION_GENERATION_SCHEMA = {
    "type": "object",
    "properties": {
        "questions": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "type": {
                        "type": "string",
                        "enum": ["choice", "truefalse", "short_answer", "essay", "research", "industry"],
                    },
                    "stem": {"type": "string"},
                    "options": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "label": {"type": "string"},
                                "text": {"type": "string"},
                            },
                            "required": ["label", "text"],
                            "additionalProperties": False,
                        },
                    },
                    "answer": {"type": "string"},
                    "explanation": {"type": "string"},
                    "bloom_level": {
                        "type": "string",
                        "enum": ["remember", "understand", "apply", "analyze", "evaluate", "create"],
                    },
                    "difficulty": {"type": "string", "enum": ["easy", "medium", "hard"]},
                    "knowledge_points": {"type": "array", "items": {"type": "string"}},
                    "rubric": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "dimension": {"type": "string"},
                                "max_score": {"type": "number"},
                                "description": {"type": "string"},
                            },
                            "required": ["dimension", "max_score", "description"],
                            "additionalProperties": False,
                        },
                    },
                },
                "required": ["type", "stem", "answer", "explanation", "difficulty"],
                "additionalProperties": False,
            },
        },
    },
    "required": ["questions"],
    "additionalProperties": False,
}

# Grading

GRADING_SYSTEM = """你是一名生命科学课程评分助手。
请严格按照评分标准评分，给出分项得分、总分、缺失点和反馈。
输出必须是合法 JSON，不要输出 Markdown。"""

GRADING_USER = """题目：{question_stem}
参考答案：{reference_answer}
评分标准：{rubric}
学生答案：{student_answer}

请返回结构化评分结果。"""

GRADING_SCHEMA = {
    "type": "object",
    "properties": {
        "score_breakdown": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "dimension": {"type": "string"},
                    "score": {"type": "number"},
                    "max_score": {"type": "number"},
                    "comment": {"type": "string"},
                },
                "required": ["dimension", "score", "max_score", "comment"],
                "additionalProperties": False,
            },
        },
        "total_score": {"type": "number"},
        "max_score": {"type": "number"},
        "missing_points": {"type": "array", "items": {"type": "string"}},
        "feedback": {"type": "string"},
        "confidence": {"type": "number"},
        "needs_review": {"type": "boolean"},
    },
    "required": ["score_breakdown", "total_score", "max_score", "feedback", "confidence", "needs_review"],
    "additionalProperties": False,
}

# RAG answer synthesis

RAG_SYNTHESIS_SYSTEM = """你是一名生命科学学习助手。
请只基于提供的参考材料回答，不要编造来源。
如果材料不足以支持结论，请明确说明证据不足。"""

RAG_SYNTHESIS_USER = """学生问题：{query}

参考材料：
{context}

请基于这些材料回答学生问题。"""

# Photo learning / material analysis

PHOTO_ANALYSIS_SYSTEM = """你是一位专业的{subject}大学课程导师，擅长深入分析专业教材内容，提取核心知识点，提供专业学习建议。请使用专业、严谨的学术语言。

返回格式要求：
1. 必须返回一个合法的JSON对象
2. 不要输出markdown格式
3. 所有内容基于上传的材料

JSON字段说明：
- knowledge_points: 从内容中提炼5-10个独立的核心知识点数组，每个知识点包含name（名称）和description（详细解释，50-150字）
- keywords: 提取内容中最关键的8-12个专业术语和核心概念，用数组形式返回
- learning_suggestions: 3-4条学习建议数组，每条建议包含error_point（错误知识点）、error_reason（错误原因分析）、training_method（针对性训练方法）
- questions: 10道题目（6道选择题、2道判断题、2道简答题），每道题包含type（题型）、stem（题目内容）、options（选项，仅选择题需要）、answer（答案）、explanation（解析）"""

PHOTO_ANALYSIS_USER = """请分析以下PDF学习材料，文件名为：{fileName}。

材料内容：
{pdfText}

请按照指定的JSON格式返回分析结果。"""

PHOTO_ANALYSIS_SCHEMA = {
    "type": "object","""
Prompt registry for BioMentor Agent.

This file keeps the production prompts readable and UTF-8 clean so the
backend does not feed mojibake into GLM.
"""

# Question generation

QUESTION_GENERATION_SYSTEM = """你是一名生命科学教育出题助手。

请基于给定知识点和参考材料生成高质量中文题目。
要求：
1. 题目必须严格依据材料，不要编造材料中没有的事实。
2. 选择题必须提供 4 个选项，且只有 1 个最优答案。
3. 判断题必须明确给出"正确"或"错误"答案。
4. 填空题需要在题目中用下划线"___"标出空缺位置。
5. 每道题都必须给出准确答案和清晰解析。
6. 输出必须是一个合法 JSON 对象，不要输出 Markdown。
7. 必须覆盖所有提供的知识点，确保每个知识点至少被一道题目考察。"""

QUESTION_GENERATION_USER = """请根据以下信息生成 10 道题目。

知识点：{knowledge_points}
参考材料：{evidence}
题型：选择题、判断题、填空题
难度：{difficulty}

题目分布要求：
- 6道选择题（choice）
- 2道判断题（truefalse）
- 2道填空题（short_answer）

确保所有知识点都被考察到。

返回 JSON，字段为：
- questions: 数组
- 每道题包含 type, stem, options, answer, explanation, bloom_level, difficulty, knowledge_points, rubric"""

QUESTION_GENERATION_SCHEMA = {
    "type": "object",
    "properties": {
        "questions": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "type": {
                        "type": "string",
                        "enum": ["choice", "truefalse", "short_answer"],
                    },
                    "stem": {"type": "string"},
                    "options": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "label": {"type": "string"},
                                "text": {"type": "string"},
                            },
                            "required": ["label", "text"],
                            "additionalProperties": False,
                        },
                    },
                    "answer": {"type": "string"},
                    "explanation": {"type": "string"},
                    "bloom_level": {
                        "type": "string",
                        "enum": ["remember", "understand", "apply", "analyze", "evaluate", "create"],
                    },
                    "difficulty": {"type": "string", "enum": ["easy", "medium", "hard"]},
                    "knowledge_points": {"type": "array", "items": {"type": "string"}},
                    "rubric": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "dimension": {"type": "string"},
                                "max_score": {"type": "number"},
                                "description": {"type": "string"},
                            },
                            "required": ["dimension", "max_score", "description"],
                            "additionalProperties": False,
                        },
                    },
                },
                "required": ["type", "stem", "answer", "explanation", "difficulty"],
                "additionalProperties": False,
            },
        },
    },
    "required": ["questions"],
    "additionalProperties": False,
}

# Grading

GRADING_SYSTEM = """你是一名生命科学课程评分助手。
请严格按照评分标准评分，给出分项得分、总分、缺失点和反馈。
输出必须是合法 JSON，不要输出 Markdown。"""

GRADING_USER = """题目：{question_stem}
参考答案：{reference_answer}
评分标准：{rubric}
学生答案：{student_answer}

请返回结构化评分结果。"""

GRADING_SCHEMA = {
    "type": "object",
    "properties": {
        "score_breakdown": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "dimension": {"type": "string"},
                    "score": {"type": "number"},
                    "max_score": {"type": "number"},
                    "comment": {"type": "string"},
                },
                "required": ["dimension", "score", "max_score", "comment"],
                "additionalProperties": False,
            },
        },
        "total_score": {"type": "number"},
        "max_score": {"type": "number"},
        "missing_points": {"type": "array", "items": {"type": "string"}},
        "feedback": {"type": "string"},
        "confidence": {"type": "number"},
        "needs_review": {"type": "boolean"},
    },
    "required": ["score_breakdown", "total_score", "max_score", "feedback", "confidence", "needs_review"],
    "additionalProperties": False,
}

# RAG answer synthesis

RAG_SYNTHESIS_SYSTEM = """你是一名生命科学学习助手。
请只基于提供的参考材料回答，不要编造来源。
如果材料不足以支持结论，请明确说明证据不足。"""

RAG_SYNTHESIS_USER = """学生问题：{query}

参考材料：
{context}

请基于这些材料回答学生问题。"""

# Photo learning / material analysis

PHOTO_ANALYSIS_SYSTEM = """你是一位专业的{subject}大学课程导师，擅长深入分析专业教材内容，提取核心知识点，提供专业学习建议。请使用专业、严谨的学术语言。

返回格式要求：
1. 必须返回一个合法的JSON对象
2. 不要输出markdown格式
3. 所有内容基于上传的材料

JSON字段说明：
- knowledge_points: 从内容中提炼5-10个独立的核心知识点数组，每个知识点包含name（名称）和description（详细解释，50-150字）
- keywords: 提取内容中最关键的8-12个专业术语和核心概念，用数组形式返回
- learning_suggestions: 3-4条学习建议数组，每条建议包含error_point（错误知识点）、error_reason（错误原因分析）、training_method（针对性训练方法）
- questions: 10道题目（6道选择题、2道判断题、2道简答题），每道题包含type（题型）、stem（题目内容）、options（选项，仅选择题需要）、answer（答案）、explanation（解析）"""

PHOTO_ANALYSIS_USER = """请分析以下PDF学习材料，文件名为：{fileName}。

材料内容：
{pdfText}

请按照指定的JSON格式返回分析结果。"""

PHOTO_ANALYSIS_SCHEMA = {
    "type": "object",
    "properties": {
        "knowledge_points": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "description": {"type": "string"}
                },
                "required": ["name", "description"],
                "additionalProperties": False
            }
        },
        "keywords": {"type": "array", "items": {"type": "string"}},
        "learning_suggestions": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "error_point": {"type": "string"},
                    "error_reason": {"type": "string"},
                    "training_method": {"type": "string"}
                },
                "required": ["error_point", "error_reason", "training_method"],
                "additionalProperties": False
            }
        },
        "questions": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "type": {
                        "type": "string",
                        "enum": ["choice", "truefalse", "short_answer"],
                    },
                    "stem": {"type": "string"},
                    "options": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "label": {"type": "string"},
                                "text": {"type": "string"},
                            },
                            "required": ["label", "text"],
                            "additionalProperties": False,
                        },
                    },
                    "answer": {"type": "string"},
                    "explanation": {"type": "string"},
                },
                "required": ["type", "stem", "answer", "explanation"],
                "additionalProperties": False,
            },
        },
    },
    "required": ["knowledge_points", "keywords", "learning_suggestions", "questions"],
    "additionalProperties": False,
}

# Case tutor

CASE_TUTOR_SYSTEM = """你是一名产业案例学习导师。
请围绕案例背景、机制、证据和应用边界进行引导式回答，不要编造来源。"""

CASE_TUTOR_USER = """产业案例：{case_title}
案例背景：{case_background}
核心问题：{case_problem}
相关知识：{knowledge_points}

学生输入：{student_input}

请用启发式方式回答。"""

# Diagnosis

DIAGNOSIS_SYSTEM = """你是一名学习诊断助手。
请分析学生答题记录，识别薄弱点、错误模式、能力画像和建议。
输出必须是合法 JSON。"""

DIAGNOSIS_USER = """学生答题数据：
{attempt_data}

知识体系：
{knowledge_structure}

请返回结构化诊断。"""

DIAGNOSIS_SCHEMA = {
    "type": "object",
    "properties": {
        "weak_points": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "concept": {"type": "string"},
                    "level": {"type": "number"},
                    "reason": {"type": "string"},
                },
                "required": ["concept", "level"],
                "additionalProperties": False,
            },
        },
        "strengths": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "concept": {"type": "string"},
                    "level": {"type": "number"},
                },
                "required": ["concept", "level"],
                "additionalProperties": False,
            },
        },
        "error_patterns": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "type": {"type": "string"},
                    "description": {"type": "string"},
                    "frequency": {"type": "string"},
                },
                "required": ["type", "description"],
                "additionalProperties": False,
            },
        },
        "ability_profile": {
            "type": "object",
            "properties": {
                "concept_mastery": {"type": "number"},
                "mechanism_understanding": {"type": "number"},
                "application_ability": {"type": "number"},
                "literature_comprehension": {"type": "number"},
                "research_design": {"type": "number"},
                "knowledge_transfer": {"type": "number"},
            },
            "required": [
                "concept_mastery",
                "mechanism_understanding",
                "application_ability",
                "literature_comprehension",
                "research_design",
                "knowledge_transfer",
            ],
            "additionalProperties": False,
        },
        "recommendations": {"type": "array", "items": {"type": "string"}},
    },
    "required": ["weak_points", "strengths", "error_patterns", "ability_profile", "recommendations"],
    "additionalProperties": False,
}

# Paper analysis

PAPER_ANALYSIS_SYSTEM = """你是一名论文教学分析助手。
请基于论文元数据和摘要内容生成适合教学与答辩准备的结构化分析。
输出必须是合法 JSON。"""

PAPER_ANALYSIS_USER = """论文标题：{title}
摘要：{abstract}
方法：{methods}
发现：{findings}
方向：{direction}

请返回结构化学习分析。"""

PAPER_ANALYSIS_SCHEMA = {
    "type": "object",
    "properties": {
        "one_sentence_summary": {"type": "string"},
        "key_innovation": {"type": "string"},
        "method_breakdown": {"type": "array", "items": {"type": "string"}},
        "teaching_points": {"type": "array", "items": {"type": "string"}},
        "discussion_questions": {"type": "array", "items": {"type": "string"}},
        "experiment_ideas": {"type": "array", "items": {"type": "string"}},
        "defense_talking_points": {"type": "array", "items": {"type": "string"}},
        "reading_difficulty": {"type": "string", "enum": ["入门", "中等", "较难"]},
    },
    "required": ["one_sentence_summary", "key_innovation", "teaching_points"],
    "additionalProperties": False,
}

# Learning path

LEARNING_PATH_SYSTEM = """你是一名个性化学习路径设计助手。
请基于诊断结果设计分步骤的学习计划。
输出必须是合法 JSON。"""

LEARNING_PATH_USER = """薄弱知识点：{weak_points}
已掌握知识：{strengths}
错误类型：{error_patterns}
能力画像：{ability_profile}

请返回结构化学习路径。"""

LEARNING_PATH_SCHEMA = {
    "type": "object",
    "properties": {
        "title": {"type": "string"},
        "description": {"type": "string"},
        "estimated_total_hours": {"type": "number"},
        "steps": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "order": {"type": "integer"},
                    "title": {"type": "string"},
                    "type": {
                        "type": "string",
                        "enum": ["review", "practice", "explore", "experiment", "case_study", "discussion", "assessment"],
                    },
                    "description": {"type": "string"},
                    "learning_objective": {"type": "string"},
                    "estimated_minutes": {"type": "integer"},
                    "resources": {"type": "array", "items": {"type": "string"}},
                    "success_criteria": {"type": "string"},
                },
                "required": ["order", "title", "type", "description", "learning_objective"],
                "additionalProperties": False,
            },
        },
    },
    "required": ["title", "steps"],
    "additionalProperties": False,
}

# Material summary

MATERIAL_SUMMARY_SYSTEM = """你是一名教材与学习材料分析助手。
请提炼核心概念、知识关系、难度和教学建议。
输出必须是合法 JSON。"""

MATERIAL_SUMMARY_USER = """资料内容：
{content}

请返回结构化分析。"""

MATERIAL_SUMMARY_SCHEMA = {
    "type": "object",
    "properties": {
        "title": {"type": "string"},
        "subject_area": {"type": "string"},
        "key_concepts": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "definition": {"type": "string"},
                    "importance": {"type": "string", "enum": ["核心", "重要", "了解"]},
                },
                "required": ["name", "definition"],
                "additionalProperties": False,
            },
        },
        "knowledge_relations": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "from": {"type": "string"},
                    "to": {"type": "string"},
                    "type": {"type": "string", "enum": ["前置知识", "因果关系", "并列关系", "应用关系"]},
                },
                "required": ["from", "to", "type"],
                "additionalProperties": False,
            },
        },
        "difficulty_level": {"type": "string", "enum": ["入门", "基础", "进阶", "高级"]},
        "suggested_prerequisites": {"type": "array", "items": {"type": "string"}},
        "teaching_suggestions": {"type": "array", "items": {"type": "string"}},
    },
    "required": ["title", "subject_area", "key_concepts"],
    "additionalProperties": False,
}

# General tutor

TUTOR_SYSTEM = """你是 BioMentor Agent 的生命科学学习导师。

要求：
1. 优先保证科学准确性。
2. 解释要清楚、结构化、适合学生理解。
3. 如果依据不足，要明确说明不确定性。
4. 不要暴露 API、模型、调试信息或系统内部实现。
5. 可以使用 Markdown 组织回答。"""

# Recommendation

RECOMMENDATION_SYSTEM = """你是一名学习推荐助手。
请基于学生学习状态，生成知识复习、练习、案例、论文或工具方面的推荐。
输出必须是合法 JSON。"""

RECOMMENDATION_USER = """薄弱知识点：{weak_points}
已掌握知识：{strengths}
近期错误类型：{error_patterns}
能力画像：{ability_profile}
已学习内容：{learned_topics}

请返回结构化推荐。"""

RECOMMENDATION_SCHEMA = {
    "type": "object",
    "properties": {
        "recommendations": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "type": {"type": "string", "enum": ["knowledge", "quiz", "case", "paper", "tool"]},
                    "title": {"type": "string"},
                    "description": {"type": "string"},
                    "reason": {"type": "string"},
                    "priority": {"type": "integer"},
                    "action": {"type": "string"},
                },
                "required": ["type", "title", "reason", "priority"],
                "additionalProperties": False,
            },
        },
    },
    "required": ["recommendations"],
    "additionalProperties": False,
}
