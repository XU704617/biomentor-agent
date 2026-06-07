from __future__ import annotations

import enum
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field, field_validator, model_validator


# ---------------------------------------------------------------------------
# Shared Enums
# ---------------------------------------------------------------------------

class DifficultyEnum(str, enum.Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"


class QuestionTypeEnum(str, enum.Enum):
    choice = "choice"
    truefalse = "truefalse"
    short_answer = "short_answer"
    essay = "essay"
    research = "research"
    industry = "industry"


class QuestionStatusEnum(str, enum.Enum):
    draft = "draft"
    reviewed = "reviewed"
    published = "published"
    archived = "archived"


class QuizStatusEnum(str, enum.Enum):
    draft = "draft"
    published = "published"
    closed = "closed"


# ---------------------------------------------------------------------------
# User
# ---------------------------------------------------------------------------

class UserOut(BaseModel):
    id: int
    name: str
    role: str
    avatar_url: str = ""
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


class UserCreate(BaseModel):
    name: str
    role: str = "student"
    avatar_url: str = ""


# ---------------------------------------------------------------------------
# Course & Knowledge Structure
# ---------------------------------------------------------------------------

class ChapterOut(BaseModel):
    id: int
    course_id: int
    title: str
    order: int = 0
    description: str = ""
    learning_objectives: list[str] = []
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


class KnowledgePointOut(BaseModel):
    id: int
    chapter_id: int
    name: str
    name_en: str = ""
    order: int = 0
    category: str = "基础概念"
    definition: str = ""
    explanation: str = ""
    bloom_level: str = "understand"
    difficulty: str = "medium"
    prerequisites: list[str] = []
    common_misunderstandings: list[str] = []
    learning_path: list[str] = []

    model_config = {"from_attributes": True}


class CourseOut(BaseModel):
    id: int
    name: str
    name_en: str = ""
    description: str = ""
    cover_url: str = ""
    teacher_name: str = ""
    is_active: bool = True
    chapters: list[ChapterOut] = []
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


class CourseCreate(BaseModel):
    name: str
    name_en: str = ""
    description: str = ""
    teacher_name: str = ""


class ChapterCreate(BaseModel):
    title: str
    order: int = 0
    description: str = ""
    learning_objectives: list[str] = []


class KnowledgePointCreate(BaseModel):
    name: str
    name_en: str = ""
    order: int = 0
    category: str = "基础概念"
    definition: str = ""
    explanation: str = ""
    bloom_level: str = "understand"
    difficulty: str = "medium"
    prerequisites: list[str] = []
    common_misunderstandings: list[str] = []
    learning_path: list[str] = []


# ---------------------------------------------------------------------------
# Material & Chunk
# ---------------------------------------------------------------------------

class MaterialOut(BaseModel):
    id: int
    course_id: int | None = None
    chapter_id: int | None = None
    filename: str
    file_type: str
    file_size_bytes: int = 0
    content_text: str = ""
    status: str = "uploading"
    error_message: str = ""
    chunk_count: int = 0
    uploaded_at: datetime | None = None

    model_config = {"from_attributes": True}


class MaterialChunkOut(BaseModel):
    id: int
    material_id: int
    chunk_index: int = 0
    content: str
    token_count: int = 0

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Research Paper
# ---------------------------------------------------------------------------

class ResearchPaperOut(BaseModel):
    id: int
    title: str
    title_zh: str = ""
    direction: str = ""
    venue: str = ""
    year: int = 2024
    source_type: str = "学术文献"
    keywords: list[str] = []
    abstract: str = ""
    core_problem: str = ""
    method_summary: str = ""
    key_finding: str = ""
    teaching_value: str = ""
    research_value: str = ""
    pdf_filename: str = ""
    pdf_storage_path: str = ""
    pdf_text_char_count: int = 0
    evidence_level: str = "medium"
    reading_difficulty: str = "medium"
    suggested_reading_order: int = 0
    selectable: bool = True
    can_support_demo: bool = False
    demo_scenarios: list[str] = []
    demo_questions: list[str] = []
    discussion_prompts: list[str] = []
    recommended_for: list[str] = []
    experiment_learning_value: str = ""
    defense_value: str = ""
    related_concepts: list[str] = []
    related_tools: list[str] = []
    related_cases: list[str] = []

    model_config = {"from_attributes": True}

    @field_validator(
        "title_zh",
        "direction",
        "venue",
        "source_type",
        "abstract",
        "core_problem",
        "method_summary",
        "key_finding",
        "teaching_value",
        "research_value",
        "pdf_filename",
        "pdf_storage_path",
        "experiment_learning_value",
        "defense_value",
        mode="before",
    )
    @classmethod
    def _normalize_nullable_paper_strings(cls, value: Any) -> str:
        return "" if value is None else str(value)

    @field_validator(
        "keywords",
        "demo_scenarios",
        "demo_questions",
        "discussion_prompts",
        "recommended_for",
        "related_concepts",
        "related_tools",
        "related_cases",
        mode="before",
    )
    @classmethod
    def _normalize_nullable_paper_lists(cls, value: Any) -> list[Any]:
        return [] if value is None else value

    @field_validator("pdf_text_char_count", "suggested_reading_order", mode="before")
    @classmethod
    def _normalize_nullable_paper_ints(cls, value: Any) -> int:
        return 0 if value is None else int(value)


class ResearchPaperCreate(BaseModel):
    title: str
    title_zh: str = ""
    direction: str = ""
    venue: str = ""
    year: int = 2024
    source_type: str = "学术文献"
    keywords: list[str] = []
    abstract: str = ""
    core_problem: str = ""
    method_summary: str = ""
    key_finding: str = ""
    teaching_value: str = ""
    research_value: str = ""
    pdf_filename: str = ""
    pdf_storage_path: str = ""
    pdf_text_char_count: int = 0
    related_concepts: list[str] = []


class ResearchPaperUpdate(BaseModel):
    title: str | None = None
    title_zh: str | None = None
    direction: str | None = None
    venue: str | None = None
    year: int | None = None
    source_type: str | None = None
    keywords: list[str] | None = None
    abstract: str | None = None
    core_problem: str | None = None
    method_summary: str | None = None
    key_finding: str | None = None
    teaching_value: str | None = None
    research_value: str | None = None
    pdf_filename: str | None = None
    pdf_storage_path: str | None = None
    pdf_text_char_count: int | None = None
    related_concepts: list[str] | None = None


# ---------------------------------------------------------------------------
# Industry Case
# ---------------------------------------------------------------------------

class IndustryCaseOut(BaseModel):
    id: int
    case_key: str
    title: str
    subtitle: str = ""
    industry_direction: str = ""
    company: str = ""
    category: str = ""
    real_product_or_technology: str = ""
    background: str = ""
    core_problem: str = ""
    problem_statement: str = ""
    research_foundation: str = ""
    application_value: str = ""
    data_description: str = ""
    knowledge_points: list[str] = []
    required_abilities: list[str] = []
    guide_questions: list[str] = []
    references: list[dict[str, str]] = []
    evaluation_dimensions: list[str] = []
    analysis_text: str = ""
    difficulty: str = "medium"
    recommended_keywords: list[str] = []
    related_papers: list[str] = []
    related_concepts: list[str] = []
    linked_research_task: str = ""
    evidence_level: str = "medium"
    source_type: str = "学术文献"
    application_scenario: str = ""
    display_focus: str = ""
    migration_path: dict[str, list[str]] = {}
    source_urls: list[str] = []
    is_featured: bool = False

    model_config = {"from_attributes": True}

    @field_validator(
        "subtitle",
        "industry_direction",
        "company",
        "category",
        "real_product_or_technology",
        "background",
        "core_problem",
        "problem_statement",
        "research_foundation",
        "application_value",
        "data_description",
        "analysis_text",
        "linked_research_task",
        "application_scenario",
        "display_focus",
        mode="before",
    )
    @classmethod
    def _normalize_nullable_strings(cls, value: Any) -> str:
        return "" if value is None else str(value)

    @field_validator(
        "knowledge_points",
        "required_abilities",
        "guide_questions",
        "references",
        "evaluation_dimensions",
        "recommended_keywords",
        "related_papers",
        "related_concepts",
        "source_urls",
        mode="before",
    )
    @classmethod
    def _normalize_nullable_lists(cls, value: Any) -> list[Any]:
        return [] if value is None else value

    @field_validator("migration_path", mode="before")
    @classmethod
    def _normalize_nullable_dict(cls, value: Any) -> dict[str, list[str]]:
        return {} if value is None else value


class IndustryCaseCreate(BaseModel):
    case_key: str
    title: str
    subtitle: str = ""
    industry_direction: str = ""
    company: str = ""
    category: str = ""
    real_product_or_technology: str = ""
    background: str = ""
    core_problem: str = ""
    research_foundation: str = ""
    application_value: str = ""
    knowledge_points: list[str] = []
    required_abilities: list[str] = []
    guide_questions: list[str] = []
    recommended_keywords: list[str] = []
    linked_research_task: str = ""
    evidence_level: str = "medium"
    source_type: str = "学术文献"
    application_scenario: str = ""
    display_focus: str = ""
    migration_path: dict[str, list[str]] = {}
    source_urls: list[str] = []
    references: list[dict[str, str]] = []


# ---------------------------------------------------------------------------
# Question
# ---------------------------------------------------------------------------

class QuestionOption(BaseModel):
    label: str
    text: str


class SourceRef(BaseModel):
    material_id: int | None = None
    chunk_id: int | None = None
    paper_id: str | None = None
    excerpt: str = ""


class RubricItem(BaseModel):
    dimension: str
    max_score: float = 1.0
    description: str = ""


class QuestionOut(BaseModel):
    id: int
    course_id: int | None = None
    knowledge_point_ids: list[str] = []
    type: str
    stem: str
    options: list[Any] = []
    answer: str = ""
    explanation: str = ""
    rubric: list[Any] = []
    source_refs: list[Any] = []
    bloom_level: str = "understand"
    difficulty: str = "medium"
    status: str = "draft"
    created_by: str = "manual"
    ai_confidence: float = 0.0
    needs_review: bool = True
    tag_list: list[str] = []
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


class QuestionCreate(BaseModel):
    course_id: int | None = None
    knowledge_point_ids: list[str] = []
    type: QuestionTypeEnum
    stem: str
    options: list[Any] = []
    answer: str = ""
    explanation: str = ""
    rubric: list[Any] = []
    source_refs: list[Any] = []
    bloom_level: str = "understand"
    difficulty: str = "medium"
    tag_list: list[str] = []


class AIQuestionGenerateRequest(BaseModel):
    course_id: int | None = None
    knowledge_points: list[str] = []
    evidence_text: str = ""
    question_types: list[QuestionTypeEnum] = []
    count: int = 5
    difficulty: str = "medium"


# ---------------------------------------------------------------------------
# Quiz
# ---------------------------------------------------------------------------

class QuizQuestionItem(BaseModel):
    question_id: int
    score: float = 1.0


class QuizOut(BaseModel):
    id: int
    course_id: int | None = None
    title: str
    description: str = ""
    time_limit_minutes: int = 0
    total_score: float = 0.0
    status: str = "draft"
    knowledge_point_ids: list[str] = []
    quiz_questions: list[Any] = []
    created_at: datetime | None = None
    published_at: datetime | None = None
    due_at: datetime | None = None

    model_config = {"from_attributes": True}


class QuizCreate(BaseModel):
    course_id: int | None = None
    title: str
    description: str = ""
    time_limit_minutes: int = 0
    knowledge_point_ids: list[str] = []
    question_ids: list[int] = []


# ---------------------------------------------------------------------------
# Attempt & Response
# ---------------------------------------------------------------------------

class ResponseCreate(BaseModel):
    question_id: int
    answer_text: str


class AttemptSubmit(BaseModel):
    responses: list[ResponseCreate]


class ResponseOut(BaseModel):
    id: int
    attempt_id: int
    question_id: int
    answer_text: str = ""
    is_correct: bool | None = None
    score: float = 0.0
    max_score: float = 1.0
    grader_type: str = "auto"

    model_config = {"from_attributes": True}


class GradeOut(BaseModel):
    id: int
    response_id: int
    rubric_scores: list[Any] = []
    score_breakdown: list[Any] = []
    missing_points: list[Any] = []
    feedback: str = ""
    confidence: float = 0.0
    needs_review: bool = False

    model_config = {"from_attributes": True}


class AttemptOut(BaseModel):
    id: int
    quiz_id: int
    user_id: int
    status: str = "in_progress"
    total_score: float = 0.0
    max_score: float = 0.0
    started_at: datetime | None = None
    submitted_at: datetime | None = None
    graded_at: datetime | None = None
    responses: list[ResponseOut] = []

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Diagnosis
# ---------------------------------------------------------------------------

class StudentKnowledgeStateOut(BaseModel):
    id: int
    user_id: int
    knowledge_point_id: int
    mastery_level: float = 0.0
    total_attempts: int = 0
    correct_count: int = 0
    error_types: list[str] = []
    last_assessed_at: datetime | None = None

    model_config = {"from_attributes": True}


class ErrorEventOut(BaseModel):
    id: int
    user_id: int
    knowledge_point_id: int | None = None
    question_id: int | None = None
    error_type: str = ""
    description: str = ""
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


class AbilityProfile(BaseModel):
    concept_mastery: float = 0.0
    mechanism_understanding: float = 0.0
    application_ability: float = 0.0
    literature_comprehension: float = 0.0
    research_design: float = 0.0
    knowledge_transfer: float = 0.0


class DiagnosisReport(BaseModel):
    user_id: int
    ability_profile: AbilityProfile
    knowledge_states: list[StudentKnowledgeStateOut] = []
    error_events: list[ErrorEventOut] = []
    weak_points: list[str] = []
    strengths: list[str] = []
    recommendations: list[str] = []


# ---------------------------------------------------------------------------
# Wrong Questions
# ---------------------------------------------------------------------------

class WrongQuestionEntryOut(BaseModel):
    id: int
    user_id: int
    question_id: int | None = None
    attempt_id: int | None = None
    knowledge_point_ids: list[str] = []
    error_type: str = ""
    review_count: int = 0
    mastery_status: str = "not_mastered"
    last_reviewed_at: datetime | None = None
    next_review_at: datetime | None = None

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Learning Path & Recommendation
# ---------------------------------------------------------------------------

class LearningPathOut(BaseModel):
    id: int
    user_id: int
    title: str
    description: str = ""
    steps: list[Any] = []
    status: str = "active"
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


class RecommendationOut(BaseModel):
    id: int
    user_id: int
    type: str
    target_id: str = ""
    reason: str = ""
    evidence: list[Any] = []
    priority: int = 0
    is_consumed: bool = False

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Knowledge Graph
# ---------------------------------------------------------------------------

class KnowledgeGraphNodeOut(BaseModel):
    id: str
    label: str
    node_type: str
    description: str = ""
    category: str = ""
    x: float = 0.0
    y: float = 0.0
    r: float = 24.0
    color: str = "#2563eb"

    model_config = {"from_attributes": True}


class KnowledgeGraphEdgeOut(BaseModel):
    from_: str = Field(alias="from")
    to: str
    type: str
    label: str = ""


class KnowledgeGraphOut(BaseModel):
    nodes: list[KnowledgeGraphNodeOut] = []
    edges: list[KnowledgeGraphEdgeOut] = []


# ---------------------------------------------------------------------------
# RAG / AI Generate
# ---------------------------------------------------------------------------

class RAGSearchRequest(BaseModel):
    query: str
    course_id: int | None = None
    collection: str = "course_materials"
    top_k: int = 5


class RAGSearchResult(BaseModel):
    chunk_id: int
    content: str
    score: float = 0.0
    source: dict[str, Any] = {}


class RAGSearchResponse(BaseModel):
    query: str
    results: list[RAGSearchResult] = []
    answer: str = ""
    source_refs: list[dict[str, Any]] = []


class AIGenerateResponse(BaseModel):
    status: str = "ok"
    result: dict[str, Any] = {}
    tokens_used: int = 0
    duration_ms: int = 0


# ---------------------------------------------------------------------------
# Photo Learning
# ---------------------------------------------------------------------------

class PhotoLearningRequest(BaseModel):
    text: str
    image_base64: str | None = None


class GeneratedQuestion(BaseModel):
    id: str
    type: str
    question: str
    options: list[Any] = []
    answer: str = ""
    explanation: str = ""
    related_concept_ids: list[str] = []
    related_paper_ids: list[str] = []


class PhotoLearningResponse(BaseModel):
    raw_text: str = ""
    extracted_keywords: list[str] = []
    domain: str = ""
    matched_concepts: list[dict[str, Any]] = []
    matched_papers: list[dict[str, Any]] = []
    matched_tasks: list[dict[str, Any]] = []
    summary: str = ""
    learning_suggestions: list[str] = []
    questions: list[GeneratedQuestion] = []
    source_kind: str = ""
    processing_engine: str = ""
    processing_char_count: int = 0
    processing_filename: str = ""
    ocr_engine: str = ""
    ocr_char_count: int = 0
    ocr_filename: str = ""


# ---------------------------------------------------------------------------
# Pagination
# ---------------------------------------------------------------------------

class PaginatedResponse(BaseModel):
    items: list[Any] = []
    total: int = 0
    page: int = 1
    page_size: int = 20
    total_pages: int = 0


# ---------------------------------------------------------------------------
# Research Task Generation
# ---------------------------------------------------------------------------

class TaskStep(BaseModel):
    title: str
    description: str
    expected_duration: str = ""


class TaskItem(BaseModel):
    type: str
    title: str
    goal: str
    steps: list[TaskStep] = []
    output_requirement: str = ""
    suggested_keywords: list[str] = []
    example_outline: str = ""
    why_this_task: str = ""
    expected_output: str = ""
    keywords: list[str] = []
    evidence_ids: list[str] = []
    difficulty: str = "中等"


class ResearchTaskGenerateRequest(BaseModel):
    topic: str = ""
    case_key: str | None = None
    case_title: str | None = None
    core_question: str | None = None
    mode: str = "independent"

    @model_validator(mode="before")
    @classmethod
    def fill_topic_from_case_fields(cls, data: Any):
        if not isinstance(data, dict):
            return data
        topic = data.get("topic")
        if isinstance(topic, str) and topic.strip():
            data["topic"] = topic.strip()
            return data
        for key in ("case_title", "caseTitle", "core_question", "coreQuestion", "query"):
            value = data.get(key)
            if isinstance(value, str) and value.strip():
                data["topic"] = value.strip()
                break
        return data


class ResearchTaskGenerateResponse(BaseModel):
    topic: str
    case_key: str | None = None
    mode: str = "independent"
    research_question: str = ""
    background: str = ""
    matched_cases: list[dict[str, str]] = []
    related_knowledge_points: list[str] = []
    tasks: list[TaskItem] = []
    expected_outputs: list[str] = []
    mentor_advice: str = ""
    seminar_topic: str = ""
    source_scope: str = ""
    disclaimer: str = ""
    source_mode: str = "local_fallback"
    evidence_mode: str = "local_only"
    debug_hint: str = ""
    evidence_items: list[dict[str, Any]] = []
    limitations: str = ""


# ---------------------------------------------------------------------------
# Literature Search
# ---------------------------------------------------------------------------

class LiteratureSearchItem(BaseModel):
    id: str | None = None
    title: str | None = None
    authors: list[str] = []
    year: int | None = None
    venue: str | None = None
    doi: str | None = None
    pmid: str | None = None
    url: str | None = None
    abstract: str | None = None
    source_provider: str = ""
    raw_id: str | None = None


class LiteratureSearchResponse(BaseModel):
    query: str
    results: list[LiteratureSearchItem] = []
    source: str = "not_configured"
    message: str | None = None
    error: str | None = None


# ---------------------------------------------------------------------------
# Evidence Link
# ---------------------------------------------------------------------------

class EvidenceSearchRequest(BaseModel):
    task_title: str
    task_description: str | None = None
    case_title: str | None = None
    query: str | None = None
    limit: int = Field(default=5, ge=1, le=20)
    recommended_keywords: list[str] = []


class EvidenceSearchResponse(BaseModel):
    query: str
    source: str = "not_configured"
    task_title: str
    results: list[LiteratureSearchItem] = []
    message: str | None = None
    error: str | None = None


class EvidenceLiteratureItem(BaseModel):
    id: str | None = None
    title: str | None = None
    authors: list[str] = []
    year: int | None = None
    venue: str | None = None
    doi: str | None = None
    pmid: str | None = None
    url: str | None = None
    abstract: str | None = None
    source_provider: str = ""
    raw_id: str | None = None


class EvidenceReferenceItem(BaseModel):
    title: str | None = None
    authors: list[str] = []
    year: int | None = None
    venue: str | None = None
    doi: str | None = None
    pmid: str | None = None
    url: str | None = None
    source_provider: str = ""


class EvidenceNoteData(BaseModel):
    summary: str
    references: list[EvidenceReferenceItem] = []
    limitations: list[str] = []
    source_mode: str = "local_fallback"
    note_title: str = ""
    direct_answer: str = ""
    core_question: str = ""
    literature_roles: list[dict[str, Any]] = []
    case_connection: str = ""
    seminar_quote: str = ""
    next_steps: list[str] = []
    evidence_items: list[dict[str, Any]] = []


class EvidenceNoteRequest(BaseModel):
    task_title: str
    task_description: str | None = None
    selected_literature: list[EvidenceLiteratureItem] = []
    case_title: str | None = None


class EvidenceNoteResponse(BaseModel):
    task_title: str
    selected_count: int = 0
    evidence_note: EvidenceNoteData
    message: str | None = None
    error: str | None = None
