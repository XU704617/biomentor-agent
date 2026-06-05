from __future__ import annotations

from typing import Any

from sqlalchemy.orm import Session

from app.models import IndustryCase
from app.services.literature_service import LiteratureSearchService
from app.services.query_builder import build_literature_search_query


LOCAL_LITERATURE = [
    {
        "id": "local-mrna-lnp",
        "title": "Lipid Nanoparticles for mRNA Delivery",
        "source_type": "local_curated",
        "source_name": "本地精选文献",
        "year": 2021,
        "url": "https://pubmed.ncbi.nlm.nih.gov/?term=lipid+nanoparticles+mRNA+delivery",
        "snippet": "可用于讨论 LNP 保护 mRNA、促进细胞摄取和递送效率的问题。",
        "keywords": ["mRNA", "LNP", "lipid nanoparticle", "delivery", "vaccine"],
        "relevance_reason": "解释 LNP 在 mRNA 递送中的作用。",
        "trust_level": "medium",
    },
    {
        "id": "local-cart",
        "title": "CAR-T cell therapy evidence and antigen escape",
        "source_type": "local_curated",
        "source_name": "本地精选文献",
        "year": 2018,
        "url": "https://pubmed.ncbi.nlm.nih.gov/?term=CAR-T+antigen+escape",
        "snippet": "适合讨论 CAR-T 识别、抗原逃逸、细胞因子释放和疗效边界。",
        "keywords": ["CAR-T", "CD19", "antigen escape", "cell therapy"],
        "relevance_reason": "支持 CAR-T 机制和耐药讨论。",
        "trust_level": "medium",
    },
    {
        "id": "local-crispr",
        "title": "CRISPR-Cas9 editing principles and therapeutic translation",
        "source_type": "local_curated",
        "source_name": "本地精选文献",
        "year": 2012,
        "url": "https://pubmed.ncbi.nlm.nih.gov/?term=CRISPR+Cas9+genome+editing",
        "snippet": "可用于解释 sgRNA、Cas9、DNA 双链断裂修复和治疗转化风险。",
        "keywords": ["CRISPR", "Cas9", "genome editing", "gene therapy"],
        "relevance_reason": "支持基因编辑机制解释。",
        "trust_level": "medium",
    },
    {
        "id": "local-pet-enzyme",
        "title": "Engineered PET depolymerase for plastic recycling",
        "source_type": "local_curated",
        "source_name": "本地精选文献",
        "year": 2020,
        "url": "https://www.nature.com/articles/s41586-020-2149-4",
        "snippet": "可用于讨论蛋白质工程、酶稳定性和 PET 生物回收边界。",
        "keywords": ["PET", "PETase", "depolymerase", "protein engineering", "enzyme"],
        "relevance_reason": "支持 PET 降解酶和蛋白工程案例。",
        "trust_level": "high",
    },
    {
        "id": "local-venetoclax",
        "title": "Venetoclax and BCL-2 mediated apoptosis",
        "source_type": "local_curated",
        "source_name": "本地精选文献",
        "year": 2016,
        "url": "https://pubmed.ncbi.nlm.nih.gov/?term=venetoclax+BCL-2+apoptosis",
        "snippet": "可用于讨论 BCL-2 抑制、线粒体凋亡和证据边界。",
        "keywords": ["Venetoclax", "BCL-2", "apoptosis", "BH3 mimetic"],
        "relevance_reason": "支持细胞凋亡机制和靶向药物讨论。",
        "trust_level": "medium",
    },
    {
        "id": "local-pd1",
        "title": "PD-1 and PD-L1 immune checkpoint blockade",
        "source_type": "local_curated",
        "source_name": "本地精选文献",
        "year": 2012,
        "url": "https://pubmed.ncbi.nlm.nih.gov/?term=PD-1+PD-L1+immune+checkpoint",
        "snippet": "可用于讨论免疫检查点抑制、T 细胞耗竭和适应症边界。",
        "keywords": ["PD-1", "PD-L1", "immune checkpoint", "immunotherapy"],
        "relevance_reason": "支持肿瘤免疫治疗机制讨论。",
        "trust_level": "medium",
    },
]


class RetrievalService:
    def __init__(self, db: Session | None = None):
        self.db = db
        self.literature = LiteratureSearchService()

    async def collect(
        self,
        query: str,
        case_key: str | None = None,
        selected_task: dict[str, Any] | None = None,
        selected_literature: list[dict[str, Any]] | None = None,
        limit: int = 6,
    ) -> dict[str, Any]:
        evidence: list[dict[str, Any]] = []
        case = self._get_case(case_key)
        case_context = self._case_context(case)
        keywords = self._keywords(query, case, selected_task)

        if case:
            evidence.append(self._case_evidence(case))
            evidence.extend(self._case_source_evidence(case))

        for item in self._local_literature(keywords):
            evidence.append(item)

        for lit in selected_literature or []:
            evidence.append(self._selected_literature_evidence(lit))

        external_query = build_literature_search_query(
            query=query,
            task_title=(selected_task or {}).get("title", ""),
            case_title=case.title if case else None,
            task={"recommended_keywords": keywords[:8]},
        )
        external = await self.literature.search(external_query, limit=limit)
        for item in external.get("results", []):
            evidence.append(self._external_literature_evidence(item, external.get("source") or "公开文献"))

        deduped = self._dedupe(evidence)
        return {
            "query": query,
            "case_context": case_context,
            "evidence_items": deduped[: max(limit, 8)],
            "evidence_count": len(deduped[: max(limit, 8)]),
            "has_external_evidence": any(item.get("source_type") in {"pubmed", "crossref", "semantic_scholar"} for item in deduped),
            "has_local_evidence": any(item.get("source_type") in {"local_case_detail", "case_source", "local_curated"} for item in deduped),
        }

    def _get_case(self, case_key: str | None) -> IndustryCase | None:
        if not self.db or not case_key:
            return None
        return self.db.query(IndustryCase).filter(IndustryCase.case_key == case_key).first()

    def _case_context(self, case: IndustryCase | None) -> dict[str, Any]:
        if not case:
            return {}
        return {
            "case_key": case.case_key,
            "title": case.title,
            "subtitle": case.subtitle,
            "category": case.category,
            "industry_direction": case.industry_direction,
            "core_question": case.core_problem or case.problem_statement,
            "background": case.background,
            "research_foundation": case.research_foundation,
            "application_scenario": case.application_scenario,
            "application_value": case.application_value,
            "display_focus": case.display_focus,
            "training_abilities": case.required_abilities or [],
            "discussion_questions": case.guide_questions or [],
            "keywords": case.recommended_keywords or [],
            "knowledge_points": case.knowledge_points or [],
        }

    def _case_evidence(self, case: IndustryCase) -> dict[str, Any]:
        detail_parts = [
            f"核心问题：{case.core_problem or case.problem_statement or ''}",
            f"背景：{case.background or ''}",
            f"科研基础：{case.research_foundation or ''}",
            f"应用场景：{case.application_scenario or ''}",
            f"应用价值：{case.application_value or ''}",
            f"展示重点：{case.display_focus or ''}",
        ]
        snippet = "\n".join(part for part in detail_parts if not part.endswith("："))
        return {
            "id": f"case-detail-{case.case_key}",
            "title": f"{case.title}：案例详情",
            "source_type": "local_case_detail",
            "source_name": "本地产业案例详情",
            "snippet": snippet,
            "relevance_reason": "提供当前案例的机制背景、科研基础、应用场景和训练任务上下文。",
            "trust_level": "curated",
        }

    def _case_source_evidence(self, case: IndustryCase) -> list[dict[str, Any]]:
        refs = []
        for idx, ref in enumerate(case.references or [], start=1):
            if not isinstance(ref, dict) or not ref.get("url"):
                continue
            refs.append({
                "id": f"{case.case_key}-source-{idx}",
                "title": ref.get("title") or f"{case.title} 来源 {idx}",
                "source_type": "case_source",
                "source_name": ref.get("type") or "案例来源",
                "url": ref.get("url"),
                "snippet": "案例来源记录，可用于追溯产品、监管或论文背景。",
                "relevance_reason": "提供案例公开来源追溯。",
                "trust_level": "high" if ref.get("type") in {"FDA", "NCI", "PubMed", "Label"} else "medium",
            })
        return refs[:3]

    def _keywords(self, query: str, case: IndustryCase | None, selected_task: dict[str, Any] | None) -> list[str]:
        values = [query]
        if case:
            values.extend(case.recommended_keywords or [])
            values.extend(case.knowledge_points or [])
            values.append(case.title or "")
        if selected_task:
            values.extend(selected_task.get("keywords") or selected_task.get("suggested_keywords") or [])
            values.append(selected_task.get("title", ""))
            values.append(selected_task.get("goal", ""))
        tokens: list[str] = []
        for value in values:
            for token in str(value).replace("，", " ").replace("?", " ").replace("？", " ").split():
                token = token.strip()
                if len(token) >= 2 and token not in tokens:
                    tokens.append(token)
        return tokens[:16]

    def _local_literature(self, keywords: list[str]) -> list[dict[str, Any]]:
        lowered = " ".join(keywords).lower()
        matches = []
        for item in LOCAL_LITERATURE:
            if any(str(keyword).lower() in lowered for keyword in item["keywords"]):
                copy = {k: v for k, v in item.items() if k != "keywords"}
                matches.append(copy)
        return matches[:4]

    def _selected_literature_evidence(self, lit: dict[str, Any]) -> dict[str, Any]:
        return {
            "id": lit.get("id") or lit.get("pmid") or lit.get("doi") or lit.get("title") or "selected-literature",
            "title": lit.get("title"),
            "source_type": lit.get("source_provider") or "selected_literature",
            "source_name": lit.get("source_label") or "已选择文献",
            "year": lit.get("year"),
            "authors": lit.get("authors") or [],
            "doi": lit.get("doi"),
            "pmid": lit.get("pmid"),
            "url": lit.get("url"),
            "abstract": lit.get("abstract"),
            "snippet": lit.get("abstract") or "用户已选择作为当前任务参考的文献。",
            "relevance_reason": "用户选择用于支撑当前科研训练任务。",
            "trust_level": "high" if lit.get("pmid") or lit.get("doi") else "medium",
        }

    def _external_literature_evidence(self, item: dict[str, Any], source: str) -> dict[str, Any]:
        source_type = str(item.get("source_provider") or source or "公开文献").lower()
        return {
            "id": item.get("id") or item.get("pmid") or item.get("doi") or item.get("raw_id") or item.get("title"),
            "title": item.get("title"),
            "source_type": source_type,
            "source_name": source,
            "year": item.get("year"),
            "authors": item.get("authors") or [],
            "doi": item.get("doi"),
            "pmid": item.get("pmid"),
            "url": item.get("url"),
            "abstract": item.get("abstract"),
            "snippet": item.get("abstract") or item.get("title") or "",
            "relevance_reason": "由公开文献检索返回，与当前问题关键词匹配。",
            "trust_level": "high" if source_type == "pubmed" else "medium",
        }

    def _dedupe(self, items: list[dict[str, Any]]) -> list[dict[str, Any]]:
        seen = set()
        output = []
        for item in items:
            key = item.get("pmid") or item.get("doi") or item.get("url") or item.get("id") or item.get("title")
            if not key or key in seen:
                continue
            seen.add(key)
            output.append({k: v for k, v in item.items() if v not in (None, "", [])})
        return output
