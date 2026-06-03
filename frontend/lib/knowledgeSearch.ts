// ============================================================
// BioMentor Agent — Knowledge Search
// 知识库检索：支持关键词搜索、ID 查找、关联查询
// ============================================================

import type {
  KnowledgePaper,
  KnowledgeConcept,
  KnowledgeResearchTask,
  KnowledgeSearchResult,
} from "@/lib/knowledgeTypes";
import {
  knowledgePapers,
  knowledgeConcepts,
  knowledgeResearchTasks,
  getPaperById,
  getConceptById,
} from "@/data/knowledgeBase";

export interface LocalLiteratureItem {
  id: string;
  title: string;
  authors: string[];
  year: number;
  venue: string;
  doi?: string | null;
  pmid?: string | null;
  url: string;
  abstract: string;
  keywords: string[];
  source_provider: "local_curated";
  source_label: "本地精选";
}

const localLiteratureItems: LocalLiteratureItem[] = [
  {
    id: "local-lit-mrna-bnt162b2",
    title: "Safety and Efficacy of the BNT162b2 mRNA Covid-19 Vaccine",
    authors: ["Polack FP", "Thomas SJ", "Kitchin N", "Absalon J"],
    year: 2020,
    venue: "New England Journal of Medicine",
    doi: "10.1056/NEJMoa2034577",
    pmid: "33301246",
    url: "https://pubmed.ncbi.nlm.nih.gov/33301246/",
    abstract: "可用于讨论 mRNA 疫苗、LNP 递送、抗原表达和疫苗临床证据之间的关系。",
    keywords: ["mRNA", "mRNA vaccine", "LNP", "lipid nanoparticle", "BNT162b2", "Comirnaty", "vaccine"],
    source_provider: "local_curated",
    source_label: "本地精选",
  },
  {
    id: "local-lit-lnp-review",
    title: "Lipid Nanoparticles for mRNA Delivery",
    authors: [],
    year: 2021,
    venue: "PubMed indexed review",
    doi: null,
    pmid: "34408243",
    url: "https://pubmed.ncbi.nlm.nih.gov/34408243/",
    abstract: "适合作为 LNP 组成、内体逃逸和核酸递送设计的课程参考。",
    keywords: ["LNP", "lipid nanoparticle", "mRNA delivery", "ionizable lipid", "endosomal escape"],
    source_provider: "local_curated",
    source_label: "本地精选",
  },
  {
    id: "local-lit-cart-kymriah",
    title: "Tisagenlecleucel in Children and Young Adults with B-Cell Lymphoblastic Leukemia",
    authors: [],
    year: 2018,
    venue: "New England Journal of Medicine",
    doi: null,
    pmid: "29385370",
    url: "https://pubmed.ncbi.nlm.nih.gov/29385370/",
    abstract: "可用于讨论 CD19 CAR-T、工程化 T 细胞制备、疗效评估和安全性监测。",
    keywords: ["CAR-T", "chimeric antigen receptor", "tisagenlecleucel", "Kymriah", "CD19", "T cell"],
    source_provider: "local_curated",
    source_label: "本地精选",
  },
  {
    id: "local-lit-crispr-jinek",
    title: "A Programmable Dual-RNA-Guided DNA Endonuclease in Adaptive Bacterial Immunity",
    authors: ["Jinek M", "Chylinski K", "Fonfara I", "Hauer M"],
    year: 2012,
    venue: "Science",
    doi: "10.1126/science.1225829",
    pmid: null,
    url: "https://doi.org/10.1126/science.1225829",
    abstract: "适合作为 CRISPR-Cas9 可编程编辑机制、sgRNA 设计和 DNA 切割机制的基础文献。",
    keywords: ["CRISPR", "CRISPR-Cas9", "Cas9", "sgRNA", "genome editing", "DNA repair"],
    source_provider: "local_curated",
    source_label: "本地精选",
  },
  {
    id: "local-lit-crispr-casgevy",
    title: "Exagamglogene Autotemcel for Severe Sickle Cell Disease",
    authors: [],
    year: 2024,
    venue: "New England Journal of Medicine",
    doi: null,
    pmid: "38661449",
    url: "https://pubmed.ncbi.nlm.nih.gov/38661449/",
    abstract: "可用于讨论 CRISPR 编辑造血干细胞、BCL11A 增强子、HbF 重新激活和基因治疗转化。",
    keywords: ["CRISPR", "Casgevy", "exagamglogene autotemcel", "BCL11A", "sickle cell disease", "gene therapy"],
    source_provider: "local_curated",
    source_label: "本地精选",
  },
  {
    id: "local-lit-pet-depolymerase",
    title: "An engineered PET depolymerase to break down and recycle plastic bottles",
    authors: [],
    year: 2020,
    venue: "Nature",
    doi: "10.1038/s41586-020-2149-4",
    pmid: "32269349",
    url: "https://pubmed.ncbi.nlm.nih.gov/32269349/",
    abstract: "可用于讨论 PET depolymerase、LCC 酶工程、塑料生物回收和蛋白质工程产业化。",
    keywords: ["PET", "PETase", "PET depolymerase", "protein engineering", "enzyme engineering", "plastic recycling", "CARBIOS"],
    source_provider: "local_curated",
    source_label: "本地精选",
  },
  {
    id: "local-lit-venetoclax",
    title: "Targeting BCL2 with Venetoclax in Relapsed Chronic Lymphocytic Leukemia",
    authors: [],
    year: 2016,
    venue: "New England Journal of Medicine",
    doi: null,
    pmid: "26639348",
    url: "https://pubmed.ncbi.nlm.nih.gov/26639348/",
    abstract: "适合作为 BCL-2、BH3 mimetics、线粒体凋亡通路和肿瘤细胞凋亡成瘾的参考文献。",
    keywords: ["venetoclax", "BCL-2", "BCL2", "apoptosis", "BH3 mimetics", "CLL", "mitochondrial apoptosis"],
    source_provider: "local_curated",
    source_label: "本地精选",
  },
  {
    id: "local-lit-pd1",
    title: "Pembrolizumab versus Ipilimumab in Advanced Melanoma",
    authors: [],
    year: 2015,
    venue: "New England Journal of Medicine",
    doi: null,
    pmid: "25891173",
    url: "https://pubmed.ncbi.nlm.nih.gov/25891173/",
    abstract: "可用于讨论 PD-1 免疫检查点阻断、肿瘤免疫治疗和临床证据解读。",
    keywords: ["PD-1", "PD-L1", "pembrolizumab", "Keytruda", "immune checkpoint", "immunotherapy", "melanoma"],
    source_provider: "local_curated",
    source_label: "本地精选",
  },
  {
    id: "local-lit-adc-enhertu",
    title: "Trastuzumab Deruxtecan in Previously Treated HER2-Positive Breast Cancer",
    authors: [],
    year: 2020,
    venue: "New England Journal of Medicine",
    doi: "10.1056/NEJMoa1914510",
    pmid: "31825192",
    url: "https://pubmed.ncbi.nlm.nih.gov/31825192/",
    abstract: "可用于讨论 HER2 抗体偶联药物、连接子载荷设计和 ADC 临床转化。",
    keywords: ["ADC", "antibody-drug conjugate", "Enhertu", "trastuzumab deruxtecan", "HER2"],
    source_provider: "local_curated",
    source_label: "本地精选",
  },
  {
    id: "local-lit-aav-sma",
    title: "Single-Dose Gene-Replacement Therapy for Spinal Muscular Atrophy",
    authors: [],
    year: 2017,
    venue: "New England Journal of Medicine",
    doi: "10.1056/NEJMoa1706198",
    pmid: "29091557",
    url: "https://pubmed.ncbi.nlm.nih.gov/29091557/",
    abstract: "可用于讨论 AAV9、SMN1 基因补充、脊髓性肌萎缩症和基因治疗递送。",
    keywords: ["AAV", "AAV9", "Zolgensma", "SMN1", "gene therapy", "spinal muscular atrophy"],
    source_provider: "local_curated",
    source_label: "本地精选",
  },
  {
    id: "local-lit-sirna-patisiran",
    title: "Patisiran, an RNAi Therapeutic, for Hereditary Transthyretin Amyloidosis",
    authors: [],
    year: 2018,
    venue: "New England Journal of Medicine",
    doi: "10.1056/NEJMoa1716153",
    pmid: "29972753",
    url: "https://pubmed.ncbi.nlm.nih.gov/29972753/",
    abstract: "适合讨论 siRNA、RNAi、TTR mRNA 降低和脂质复合物递送策略。",
    keywords: ["siRNA", "RNAi", "patisiran", "Onpattro", "TTR", "lipid complex", "transthyretin"],
    source_provider: "local_curated",
    source_label: "本地精选",
  },
  {
    id: "local-lit-liquid-biopsy-guardant",
    title: "Clinical validation of Guardant360 CDx as a blood-based companion diagnostic for sotorasib",
    authors: [],
    year: 2021,
    venue: "Lung Cancer",
    doi: null,
    pmid: "34838325",
    url: "https://pubmed.ncbi.nlm.nih.gov/34838325/",
    abstract: "可用于讨论 ctDNA 液体活检、伴随诊断和 KRAS G12C 靶向治疗匹配。",
    keywords: ["liquid biopsy", "ctDNA", "Guardant360", "companion diagnostic", "KRAS G12C", "NGS"],
    source_provider: "local_curated",
    source_label: "本地精选",
  },
  {
    id: "local-lit-synbio-artemisinic",
    title: "High-level semi-synthetic production of the potent antimalarial artemisinin",
    authors: [],
    year: 2013,
    venue: "Nature",
    doi: "10.1038/nature12051",
    pmid: null,
    url: "https://www.nature.com/articles/nature12051",
    abstract: "适合讨论合成生物学、酵母代谢工程、天然产物通路重构和半合成青蒿素产业化。",
    keywords: ["synthetic biology", "metabolic engineering", "artemisinic acid", "artemisinin", "Saccharomyces cerevisiae", "fermentation"],
    source_provider: "local_curated",
    source_label: "本地精选",
  },
  {
    id: "local-lit-protein-design-alphafold",
    title: "Highly accurate protein structure prediction with AlphaFold",
    authors: [],
    year: 2021,
    venue: "Nature",
    doi: "10.1038/s41586-021-03819-2",
    pmid: "34265844",
    url: "https://pubmed.ncbi.nlm.nih.gov/34265844/",
    abstract: "可用于讨论蛋白质结构预测、蛋白设计和生物信息学辅助研发。",
    keywords: ["protein design", "protein engineering", "AlphaFold", "structure prediction", "bioinformatics"],
    source_provider: "local_curated",
    source_label: "本地精选",
  },
];

/** 规范化关键词：去除首尾空格，转小写 */
export function normalizeKeyword(input: string): string {
  return input.trim().toLowerCase();
}

function expandLiteratureTerms(terms: string[]): string[] {
  const expanded = new Set<string>();
  const aliases: Record<string, string[]> = {
    "car-t": ["chimeric antigen receptor", "cd19", "tisagenlecleucel"],
    cart: ["car-t", "chimeric antigen receptor"],
    crispr: ["cas9", "genome editing", "bcl11a"],
    mrna: ["mRNA vaccine", "lnp", "lipid nanoparticle"],
    lnp: ["lipid nanoparticle", "mRNA delivery"],
    pet: ["pet depolymerase", "petase", "plastic recycling"],
    venetoclax: ["bcl-2", "bcl2", "apoptosis"],
    apoptosis: ["bcl-2", "venetoclax", "bh3"],
    "pd-1": ["pd-l1", "immune checkpoint", "pembrolizumab"],
    "pd-l1": ["pd-1", "immune checkpoint", "pembrolizumab"],
    adc: ["antibody-drug conjugate", "enhertu", "trastuzumab deruxtecan"],
    aav: ["aav9", "gene therapy", "zolgensma"],
    sirna: ["rnai", "patisiran", "onpattro"],
    "liquid biopsy": ["ctdna", "guardant360", "companion diagnostic"],
    ctdna: ["liquid biopsy", "guardant360"],
    "synthetic biology": ["metabolic engineering", "fermentation", "artemisinic acid"],
    "protein engineering": ["protein design", "pet depolymerase", "alphafold"],
  };

  terms.forEach((term) => {
    const normalized = normalizeKeyword(term);
    if (!normalized) return;
    expanded.add(normalized);
    normalized.split(/[\s/，,;；]+/).forEach((part) => {
      if (part.length >= 2) expanded.add(part);
    });
    (aliases[normalized] || []).forEach((alias) => expanded.add(normalizeKeyword(alias)));
  });

  return Array.from(expanded);
}

export function searchLocalLiteratureByKeywords(
  keywords: string[],
  query = "",
  limit = 8,
): LocalLiteratureItem[] {
  const terms = expandLiteratureTerms([...keywords, query]);
  if (terms.length === 0) {
    return localLiteratureItems.slice(0, limit);
  }

  const scored = localLiteratureItems
    .map((paper) => {
      const haystack = normalizeKeyword(
        [
          paper.title,
          paper.venue,
          paper.abstract,
          paper.keywords.join(" "),
          paper.authors.join(" "),
        ].join(" "),
      );
      const score = terms.reduce((total, term) => {
        if (!term) return total;
        if (haystack.includes(term)) return total + (term.length > 4 ? 2 : 1);
        return total;
      }, 0);
      return { paper, score };
    })
    .filter((item) => item.score > 0);

  scored.sort((a, b) => b.score - a.score || b.paper.year - a.paper.year);
  return scored.slice(0, limit).map((item) => item.paper);
}

/** 核心搜索函数 */
export function searchKnowledge(query: string): KnowledgeSearchResult {
  const q = normalizeKeyword(query);

  if (!q) {
    return {
      query,
      concepts: [],
      papers: [],
      tasks: [],
      suggestionTopics: [
        "Prime editing",
        "CRISPR-Cas12",
        "单细胞基础模型",
        "LNP mRNA递送",
        "TCR特异性",
        "TxPert",
      ],
    };
  }

  // 搜索 concepts：name、nameEn、shortDefinition、longExplanation
  const matchedConcepts = knowledgeConcepts.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.nameEn.toLowerCase().includes(q) ||
      c.shortDefinition.toLowerCase().includes(q) ||
      c.longExplanation.toLowerCase().includes(q),
  );

  // 搜索 papers：title、titleZh、direction、keywords
  const matchedPapers = knowledgePapers.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.titleZh.toLowerCase().includes(q) ||
      p.direction.toLowerCase().includes(q) ||
      p.keywords.some((k) => normalizeKeyword(k).includes(q)),
  );

  // 搜索 tasks：title、scenario、relatedConceptIds
  const matchedConceptIds = matchedConcepts.map((c) => c.id);
  const matchedTasks = knowledgeResearchTasks.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      t.scenario.toLowerCase().includes(q) ||
      t.relatedConceptIds.some((cid) => matchedConceptIds.includes(cid)),
  );

  // 生成建议主题
  const allConcepts = new Set<string>();
  matchedPapers.forEach((p) =>
    p.relatedConceptIds.forEach((cid) => {
      const concept = getConceptById(cid);
      if (concept) allConcepts.add(concept.name);
    }),
  );
  matchedConcepts.forEach((c) => {
    c.relatedConceptIds.forEach((cid) => {
      const concept = getConceptById(cid);
      if (concept && !matchedConcepts.find((mc) => mc.id === cid)) {
        allConcepts.add(concept.name);
      }
    });
  });

  const suggestionTopics = Array.from(allConcepts).slice(0, 6);

  return {
    query,
    concepts: matchedConcepts,
    papers: matchedPapers,
    tasks: matchedTasks,
    suggestionTopics:
      suggestionTopics.length > 0
        ? suggestionTopics
        : [
            "Prime editing",
            "CRISPR-Cas12",
            "单细胞基础模型",
            "LNP mRNA递送",
            "TCR特异性",
            "TxPert",
          ],
  };
}

/** 获取关联论文 */
export function getRelatedPapers(conceptId: string): KnowledgePaper[] {
  const concept = getConceptById(conceptId);
  if (!concept) return [];
  return concept.relatedPaperIds
    .map((pid) => getPaperById(pid))
    .filter((p): p is KnowledgePaper => p !== undefined);
}

/** 获取关联概念 */
export function getRelatedConcepts(conceptId: string): KnowledgeConcept[] {
  const concept = getConceptById(conceptId);
  if (!concept) return [];
  return concept.relatedConceptIds
    .map((cid) => getConceptById(cid))
    .filter((c): c is KnowledgeConcept => c !== undefined);
}

/** 获取概念相关的科研任务 */
export function getResearchTasksByConcept(conceptId: string): KnowledgeResearchTask[] {
  return knowledgeResearchTasks.filter((t) =>
    t.relatedConceptIds.includes(conceptId),
  );
}

/** 获取paper相关的概念 */
export function getConceptsForPaper(paperId: string): KnowledgeConcept[] {
  const paper = getPaperById(paperId);
  if (!paper) return [];
  return paper.relatedConceptIds
    .map((cid) => getConceptById(cid))
    .filter((c): c is KnowledgeConcept => c !== undefined);
}
