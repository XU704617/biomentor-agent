export interface MigrationPath {
  textbookBase: string[];
  researchFrontier: string[];
  industryApplication: string[];
}

export interface Reference {
  title: string;
  url: string;
  type: "FDA" | "PubMed" | "DOI" | "NCI" | "Label" | "Review" | "Other";
}

export interface IndustryCase {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  realProductOrTechnology: string;
  relatedKnowledgePoints: string[];
  industryDirection: string;
  coreProblem: string;
  researchFoundation: string;
  applicationValue: string;
  requiredAbilities: string[];
  recommendedKeywords: string[];
  linkedResearchTask: string;
  evidenceLevel: "高" | "中" | "发展中";
  sourceType: "学术文献" | "产业报告" | "专利文献" | "临床试验" | "监管文件";
  background: string;
  applicationScenario: string;
  displayFocus: string;
  migrationPath: MigrationPath;
  references: Reference[];
  sourceUrls: string[];
}

export interface MatchCase {
  id: string;
  title: string;
  reason: string;
}

export interface IndustryAnswer {
  query: string;
  answer?: string;
  relatedKnowledgePoints: string[];
  matchedCases?: MatchCase[];
  researchFrontiers: string[];
  industryApplications: string[];
  abilityDirections: string[];
  requiredAbilities?: string[];
  recommendedKeywords: string[];
  researchTasks: string[];
  nextTasks?: string[];
  sourceScope?: "based_on_local_cases" | "extended_reasoning" | "no_direct_match";
  disclaimer?: string;
  _dataSource?: "api" | "local_fallback";
}

export interface AbilityMapping {
  id: string;
  name: string;
  description: string;
  progress: number;
}

export interface IndustryDirection {
  id: string;
  name: string;
  description: string;
}

export const industryCases: IndustryCase[] = [
  {
    "id": "case-001",
    "title": "细胞凋亡与抗肿瘤药物研发",
    "subtitle": "从线粒体凋亡通路到 BCL-2 靶向药物",
    "category": "核酸药物与靶向药物研发",
    "realProductOrTechnology": "Venetoclax / VENCLEXTA，BCL-2 小分子抑制剂",
    "relatedKnowledgePoints": [
      "细胞凋亡",
      "caspase 家族",
      "线粒体凋亡通路",
      "Bcl-2 家族",
      "MOMP",
      "BH3-only 蛋白",
      "肿瘤耐药",
      "肿瘤溶解综合征"
    ],
    "industryDirection": "药物研发 / 靶向治疗 / 肿瘤精准治疗",
    "coreProblem": "如何基于细胞凋亡信号通路，开发能够选择性诱导肿瘤细胞死亡的小分子靶向药物？",
    "researchFoundation": "该案例的核心机制是线粒体外膜通透化（MOMP）及其上游 BCL-2 家族蛋白调控。正常细胞在受到 DNA 损伤、生长因子撤除或强烈应激时，BH3-only 蛋白会激活 BAX/BAK，促使线粒体外膜形成孔道，细胞色素 c 释放到胞质，随后 apoptosome 形成并启动 caspase-9、caspase-3 等级联反应，细胞进入不可逆凋亡。BCL-2、BCL-XL、MCL-1 等抗凋亡蛋白可以结合并抑制促凋亡蛋白，使肿瘤细胞即使带有异常突变也不容易死亡。Venetoclax 属于 BH3 mimetic，能够高亲和力结合 BCL-2 的疏水沟槽，释放被 BCL-2 扣留的促凋亡信号，让肿瘤细胞重新进入线粒体凋亡路径。因此这个案例可以清楚展示“机制发现—靶点确认—小分子设计—临床应用”的转化链条。",
    "applicationValue": "该案例能把“细胞为什么会死亡”转化为“药物如何设计靶点”。学生可以理解凋亡通路、抗凋亡蛋白、靶向药设计、临床适应证、疗效评价和安全性管理之间的完整产业链条。",
    "requiredAbilities": [
      "机制解释能力",
      "药物作用机制分析能力",
      "实验设计能力",
      "耐药机制推理能力",
      "文献证据解读能力",
      "安全性风险判断能力"
    ],
    "recommendedKeywords": [
      "apoptosis",
      "BCL-2 inhibitor",
      "venetoclax",
      "BH3 mimetics",
      "mitochondrial apoptosis",
      "MOMP",
      "caspase activation",
      "drug resistance"
    ],
    "linkedResearchTask": "BH3 profiling 实验设计",
    "evidenceLevel": "高",
    "sourceType": "监管文件",
    "background": "许多肿瘤细胞并不只是增殖速度异常，还会通过抑制程序性死亡来获得生存优势。BCL-2 是线粒体凋亡通路中的关键抗凋亡蛋白，BCL-2 过度表达可帮助 CLL、SLL、AML 等肿瘤细胞抵抗应激和药物杀伤。Venetoclax 是围绕 BCL-2 设计的小分子抑制剂，是把基础细胞死亡机制转化为真实药物产品的典型案例。",
    "applicationScenario": "主要用于血液肿瘤治疗，包括成人 CLL/SLL，以及与阿扎胞苷、地西他滨或低剂量阿糖胞苷联合用于部分新诊断 AML 成人患者。教学上可延伸到靶点发现、结构基础药物设计、BH3 profiling、联合用药、耐药机制和肿瘤溶解综合征风险管理。",
    "displayFocus": "线粒体凋亡通路示意图；BCL-2 如何阻断凋亡；Venetoclax 如何解除抗凋亡信号；治疗中为什么关注 TLS 风险。",
    "migrationPath": {
      "textbookBase": [
        "细胞凋亡",
        "caspase 家族",
        "线粒体凋亡通路"
      ],
      "researchFrontier": [
        "BH3 profiling 实验设计",
        "apoptosis",
        "BCL-2 inhibitor"
      ],
      "industryApplication": [
        "Venetoclax / VENCLEXTA，BCL-2 小分子抑制剂",
        "药物研发 / 靶向治疗 / 肿瘤精准治疗",
        "核酸药物与靶向药物研发"
      ]
    },
    "references": [
      {
        "title": "FDA reference 1",
        "url": "https://www.accessdata.fda.gov/drugsatfda_docs/label/2026/208573s031lbl.pdf",
        "type": "Label"
      },
      {
        "title": "PubMed reference 2",
        "url": "https://pubmed.ncbi.nlm.nih.gov/26639348/",
        "type": "PubMed"
      }
    ],
    "sourceUrls": [
      "https://www.accessdata.fda.gov/drugsatfda_docs/label/2026/208573s031lbl.pdf",
      "https://pubmed.ncbi.nlm.nih.gov/26639348/"
    ]
  },
  {
    "id": "case-002",
    "title": "CAR-T 细胞治疗与肿瘤免疫",
    "subtitle": "从 T 细胞活化到工程化细胞治疗",
    "category": "细胞与基因治疗",
    "realProductOrTechnology": "Tisagenlecleucel / KYMRIAH，CD19 CAR-T 细胞治疗",
    "relatedKnowledgePoints": [
      "T 细胞活化",
      "免疫突触",
      "抗原识别",
      "细胞信号转导",
      "CD19",
      "细胞毒性 T 细胞",
      "细胞因子释放综合征"
    ],
    "industryDirection": "细胞治疗 / 肿瘤免疫治疗 / 个体化治疗",
    "coreProblem": "如何通过工程化改造患者自身 T 细胞，使其能够识别并清除肿瘤细胞？",
    "researchFoundation": "CAR-T 的核心原理是把抗体样抗原识别结构与 T 细胞激活信号模块组合到同一个人工受体中。以 CD19 CAR-T 为例，胞外单链抗体片段（scFv）负责识别 B 细胞肿瘤表面的 CD19；跨膜区负责固定受体；胞内 CD3ζ 信号区和共刺激结构域（如 4-1BB 或 CD28）负责启动 T 细胞活化、增殖和效应功能。与传统 TCR 识别不同，CAR 可以直接识别细胞表面抗原，不一定依赖 MHC 呈递。工程化 T 细胞回输后，与 CD19 阳性肿瘤细胞接触，释放穿孔素和颗粒酶，诱导靶细胞死亡，同时分泌细胞因子放大免疫反应。该机制也解释了为什么 CAR-T 可能产生细胞因子释放综合征、神经毒性以及 B 细胞缺失等风险。",
    "applicationValue": "该案例能让学生看到：细胞治疗不是简单“用细胞治病”，而是免疫学、细胞生物学、病毒载体、细胞工程、临床治疗和生产质控的系统集成。",
    "requiredAbilities": [
      "免疫机制解释能力",
      "治疗流程分析能力",
      "细胞工程理解能力",
      "风险判断能力",
      "文献证据解读能力"
    ],
    "recommendedKeywords": [
      "CAR-T",
      "tisagenlecleucel",
      "Kymriah",
      "CD19",
      "T cell activation",
      "immunotherapy",
      "cytokine release syndrome"
    ],
    "linkedResearchTask": "CAR-T 制备流程排序",
    "evidenceLevel": "高",
    "sourceType": "监管文件",
    "background": "传统化疗主要依赖药物直接杀伤肿瘤细胞，而 CAR-T 治疗把患者自身 T 细胞改造成“活的药物”。KYMRIAH 是真实获批的 CD19-directed genetically modified autologous T-cell immunotherapy，代表了细胞治疗从实验室免疫学走向产业化生产和临床应用的重要方向。",
    "applicationScenario": "主要用于部分复发或难治性 B 细胞血液肿瘤。教学上适合连接 T 细胞识别、免疫突触、细胞信号转导、基因转导、细胞扩增、GMP 生产、回输治疗和临床风险管理。",
    "displayFocus": "患者 T 细胞采集—体外改造—扩增—回输流程；CAR 结构图；CAR-T 识别 CD19 阳性肿瘤细胞并杀伤的过程。",
    "migrationPath": {
      "textbookBase": [
        "T 细胞活化",
        "免疫突触",
        "抗原识别"
      ],
      "researchFrontier": [
        "CAR-T 制备流程排序",
        "CAR-T",
        "tisagenlecleucel"
      ],
      "industryApplication": [
        "Tisagenlecleucel / KYMRIAH，CD19 CAR-T 细胞治疗",
        "细胞治疗 / 肿瘤免疫治疗 / 个体化治疗",
        "细胞与基因治疗"
      ]
    },
    "references": [
      {
        "title": "FDA reference 1",
        "url": "https://www.fda.gov/vaccines-blood-biologics/cellular-gene-therapy-products/kymriah",
        "type": "FDA"
      },
      {
        "title": "PubMed reference 2",
        "url": "https://pubmed.ncbi.nlm.nih.gov/29385370/",
        "type": "PubMed"
      }
    ],
    "sourceUrls": [
      "https://www.fda.gov/vaccines-blood-biologics/cellular-gene-therapy-products/kymriah",
      "https://pubmed.ncbi.nlm.nih.gov/29385370/"
    ]
  },
  {
    "id": "case-003",
    "title": "PD-1/PD-L1 免疫检查点抑制剂",
    "subtitle": "从免疫逃逸机制到抗体药物开发",
    "category": "抗体药物与肿瘤免疫治疗",
    "realProductOrTechnology": "Pembrolizumab / KEYTRUDA，PD-1 阻断抗体",
    "relatedKnowledgePoints": [
      "细胞通讯",
      "受体-配体结合",
      "T 细胞耗竭",
      "免疫逃逸",
      "抗体药物",
      "肿瘤微环境"
    ],
    "industryDirection": "免疫治疗 / 抗体药物 / 肿瘤精准治疗",
    "coreProblem": "如何通过阻断 PD-1/PD-L1 免疫抑制信号，恢复 T 细胞对肿瘤细胞的杀伤能力？",
    "researchFoundation": "PD-1/PD-L1 通路本来是机体防止免疫反应过度、维持外周免疫耐受的重要机制。T 细胞持续受到抗原刺激后，PD-1 表达上调；当 PD-1 与 PD-L1 或 PD-L2 结合，会通过胞内抑制性信号降低 TCR/CD28 下游通路活性，使 T 细胞增殖、细胞因子分泌和杀伤功能下降。肿瘤细胞可以上调 PD-L1，把这一生理性“免疫刹车”转化为免疫逃逸策略。Pembrolizumab 通过结合 PD-1 受体，阻断 PD-1 与 PD-L1/PD-L2 的相互作用，释放被抑制的 T 细胞效应功能。这个案例说明抗体药物不一定直接杀死肿瘤细胞，也可以通过重塑细胞通讯和肿瘤微环境来产生治疗作用。",
    "applicationValue": "该案例帮助学生理解肿瘤治疗范式从直接细胞毒杀伤走向免疫调控，也适合作为细胞通讯、受体-配体关系、抗体药物和伴随诊断联动的案例。",
    "requiredAbilities": [
      "机制解释能力",
      "通路分析能力",
      "肿瘤免疫理解能力",
      "抗体药物作用机制分析能力",
      "临床适用性分析能力"
    ],
    "recommendedKeywords": [
      "PD-1",
      "PD-L1",
      "immune checkpoint inhibitor",
      "pembrolizumab",
      "Keytruda",
      "T cell exhaustion",
      "tumor immune escape"
    ],
    "linkedResearchTask": "PD-1/PD-L1 免疫逃逸机制分析",
    "evidenceLevel": "高",
    "sourceType": "监管文件",
    "background": "肿瘤细胞常利用免疫检查点通路让 T 细胞“踩刹车”。PD-1 是 T 细胞表面的抑制性受体，PD-L1 可表达在肿瘤细胞或抗原呈递细胞上。KEYTRUDA 官方说明书明确 pembrolizumab 是 programmed death receptor-1 (PD-1)-blocking antibody，已用于多种肿瘤治疗场景。",
    "applicationScenario": "广泛用于黑色素瘤、非小细胞肺癌、头颈部鳞癌、尿路上皮癌、MSI-H/dMMR 实体瘤等多个治疗场景，具体适应证需以最新说明书和临床指南为准。",
    "displayFocus": "PD-1/PD-L1 结合如何抑制 T 细胞；PD-1 抗体如何解除免疫刹车；免疫治疗与传统化疗的差异。",
    "migrationPath": {
      "textbookBase": [
        "细胞通讯",
        "受体-配体结合",
        "T 细胞耗竭"
      ],
      "researchFrontier": [
        "PD-1/PD-L1 免疫逃逸机制分析",
        "PD-1",
        "PD-L1"
      ],
      "industryApplication": [
        "Pembrolizumab / KEYTRUDA，PD-1 阻断抗体",
        "免疫治疗 / 抗体药物 / 肿瘤精准治疗",
        "抗体药物与肿瘤免疫治疗"
      ]
    },
    "references": [
      {
        "title": "merck.com 1",
        "url": "https://www.merck.com/product/usa/pi_circulars/k/keytruda/keytruda_pi.pdf",
        "type": "Other"
      },
      {
        "title": "PubMed reference 2",
        "url": "https://pubmed.ncbi.nlm.nih.gov/25891173/",
        "type": "PubMed"
      }
    ],
    "sourceUrls": [
      "https://www.merck.com/product/usa/pi_circulars/k/keytruda/keytruda_pi.pdf",
      "https://pubmed.ncbi.nlm.nih.gov/25891173/"
    ]
  },
  {
    "id": "case-004",
    "title": "mRNA 疫苗递送技术",
    "subtitle": "从脂质纳米颗粒到抗原表达",
    "category": "核酸药物与靶向药物研发",
    "realProductOrTechnology": "BNT162b2 / COMIRNATY，mRNA-LNP 疫苗",
    "relatedKnowledgePoints": [
      "细胞膜结构",
      "脂质纳米颗粒",
      "胞吞作用",
      "内体逃逸",
      "mRNA 翻译",
      "抗原表达",
      "免疫应答"
    ],
    "industryDirection": "疫苗研发 / 核酸药物 / 药物递送",
    "coreProblem": "如何把不稳定、易降解的 mRNA 安全递送进细胞，并让细胞短暂表达目标抗原以诱导免疫反应？",
    "researchFoundation": "mRNA 疫苗的关键难点是“信息分子如何进入细胞并被正确读取”。裸 mRNA 带负电、分子大、容易被核酸酶降解，也难以直接穿过脂质双层膜，因此需要脂质纳米颗粒（LNP）保护并递送。LNP 通常包含可离子化脂质、胆固醇、辅助磷脂和 PEG-脂质：在制剂中包裹 mRNA，在体内被细胞通过胞吞摄取，随后在内体酸化环境中促进脂质重排和内体逃逸，使 mRNA 进入细胞质。mRNA 不进入细胞核，而是在核糖体上翻译成抗原蛋白；抗原可以通过 MHC I/II 相关路径被免疫系统识别，诱导中和抗体和 T 细胞应答。原始 BNT162b2 两剂方案在早期临床试验中表现出约 95% 的疫苗效力，但当前保护效果需结合变异株、配方更新和真实世界背景解释。",
    "applicationValue": "该案例体现了平台型核酸药物的价值：当递送平台和生产体系成熟后，可以通过更换 mRNA 序列快速面向不同抗原或治疗蛋白开发产品。",
    "requiredAbilities": [
      "递送机制解释能力",
      "细胞结构分析能力",
      "免疫应答理解能力",
      "技术路线比较能力",
      "文献检索能力"
    ],
    "recommendedKeywords": [
      "mRNA vaccine",
      "lipid nanoparticle",
      "LNP",
      "endocytosis",
      "endosomal escape",
      "translation",
      "BNT162b2",
      "Comirnaty"
    ],
    "linkedResearchTask": "mRNA-LNP 递送流程图构建",
    "evidenceLevel": "高",
    "sourceType": "监管文件",
    "background": "mRNA 疫苗不是把完整病毒直接打入人体，而是递送一段编码抗原蛋白的 mRNA，让宿主细胞短暂表达抗原，再诱导免疫系统识别。COMIRNATY 的 FDA 说明书明确其核苷修饰 mRNA 被脂质颗粒包裹，脂质颗粒帮助 mRNA 进入宿主细胞并表达 SARS-CoV-2 S 抗原。",
    "applicationScenario": "典型应用是传染病疫苗，也可拓展到肿瘤治疗性疫苗、罕见病蛋白替代、基因编辑工具递送等方向。教学上适合解释细胞膜、胞吞、翻译、抗原呈递和平台型疫苗研发。",
    "displayFocus": "LNP 包裹 mRNA 的结构；LNP 进入细胞、释放 mRNA、翻译抗原流程；mRNA 疫苗与灭活/蛋白疫苗差异。",
    "migrationPath": {
      "textbookBase": [
        "细胞膜结构",
        "脂质纳米颗粒",
        "胞吞作用"
      ],
      "researchFrontier": [
        "mRNA-LNP 递送流程图构建",
        "mRNA vaccine",
        "lipid nanoparticle"
      ],
      "industryApplication": [
        "BNT162b2 / COMIRNATY，mRNA-LNP 疫苗",
        "疫苗研发 / 核酸药物 / 药物递送",
        "核酸药物与靶向药物研发"
      ]
    },
    "references": [
      {
        "title": "FDA reference 1",
        "url": "https://www.fda.gov/media/151707/download",
        "type": "FDA"
      },
      {
        "title": "PubMed reference 2",
        "url": "https://pubmed.ncbi.nlm.nih.gov/33301246/",
        "type": "PubMed"
      }
    ],
    "sourceUrls": [
      "https://www.fda.gov/media/151707/download",
      "https://pubmed.ncbi.nlm.nih.gov/33301246/"
    ]
  },
  {
    "id": "case-005",
    "title": "CRISPR 基因编辑治疗",
    "subtitle": "从 DNA 修复机制到遗传病细胞治疗",
    "category": "细胞与基因治疗",
    "realProductOrTechnology": "Exagamglogene autotemcel / CASGEVY，CRISPR/Cas9 基因编辑细胞治疗",
    "relatedKnowledgePoints": [
      "DNA 双链断裂",
      "DNA 修复",
      "基因突变",
      "细胞核功能",
      "造血干细胞",
      "CRISPR/Cas9",
      "BCL11A",
      "胎儿血红蛋白"
    ],
    "industryDirection": "基因治疗 / 细胞治疗 / 遗传病治疗",
    "coreProblem": "如何利用 CRISPR/Cas9 技术改造患者自身造血干细胞，从源头改善遗传性血液病？",
    "researchFoundation": "CASGEVY 的策略并不是直接修复每个患者的 HBB 致病突变，而是在患者自体 CD34+ 造血干/祖细胞中编辑 BCL11A 的红系特异性增强子。BCL11A 是胎儿血红蛋白（HbF）表达的重要抑制因子；当其在红系细胞中的表达被降低，HbF 水平升高，可以缓解镰状血红蛋白聚合导致的红细胞变形、溶血和血管阻塞。CRISPR/Cas9 由向导 RNA 引导 Cas9 到目标 DNA 序列，产生 DNA 双链断裂，细胞通过非同源末端连接等修复机制形成特定编辑结果。临床上先采集患者造血干细胞，体外编辑和质控后，患者接受清髓预处理，再回输编辑后的细胞并长期随访。这个案例非常适合讲 DNA 修复、基因调控、干细胞和临床转化风险的关系。",
    "applicationValue": "该案例说明基因编辑已从概念验证走向真实产业应用，可帮助学生理解基因编辑疗法必须同时解决机制、递送、生产、质控、临床获益和安全性。",
    "requiredAbilities": [
      "基因编辑机制解释能力",
      "DNA 修复分析能力",
      "临床转化判断能力",
      "伦理与安全性分析能力",
      "文献证据解读能力"
    ],
    "recommendedKeywords": [
      "CRISPR",
      "Cas9",
      "Casgevy",
      "exagamglogene autotemcel",
      "BCL11A enhancer",
      "fetal hemoglobin",
      "sickle cell disease",
      "beta thalassemia"
    ],
    "linkedResearchTask": "CRISPR 编辑 BCL11A 增强子机制分析",
    "evidenceLevel": "高",
    "sourceType": "监管文件",
    "background": "CASGEVY 是 CRISPR 基因编辑治疗进入真实临床应用的标志性案例。FDA 明确其为首个使用 CRISPR/Cas9 技术的 FDA 批准疗法之一，用于 12 岁及以上、伴反复血管闭塞危象的镰状细胞病患者，并进一步获批用于输血依赖型 β 地中海贫血患者。",
    "applicationScenario": "主要应用于遗传性血液病治疗，包括镰状细胞病和输血依赖型 β 地中海贫血。也适合用于讲解体外编辑、细胞回输、长期安全性随访和治疗伦理。",
    "displayFocus": "造血干细胞采集—CRISPR 编辑—回输流程；BCL11A 抑制 HbF 的机制；为什么提高 HbF 可以改善血红蛋白病。",
    "migrationPath": {
      "textbookBase": [
        "DNA 双链断裂",
        "DNA 修复",
        "基因突变"
      ],
      "researchFrontier": [
        "CRISPR 编辑 BCL11A 增强子机制分析",
        "CRISPR",
        "Cas9"
      ],
      "industryApplication": [
        "Exagamglogene autotemcel / CASGEVY，CRISPR/Cas9 基因编辑细胞治疗",
        "基因治疗 / 细胞治疗 / 遗传病治疗",
        "细胞与基因治疗"
      ]
    },
    "references": [
      {
        "title": "FDA reference 1",
        "url": "https://www.fda.gov/news-events/press-announcements/fda-approves-first-gene-therapies-treat-patients-sickle-cell-disease",
        "type": "FDA"
      },
      {
        "title": "FDA reference 2",
        "url": "https://www.fda.gov/media/175179/download",
        "type": "FDA"
      },
      {
        "title": "PubMed reference 3",
        "url": "https://pubmed.ncbi.nlm.nih.gov/38661449/",
        "type": "PubMed"
      }
    ],
    "sourceUrls": [
      "https://www.fda.gov/news-events/press-announcements/fda-approves-first-gene-therapies-treat-patients-sickle-cell-disease",
      "https://www.fda.gov/media/175179/download",
      "https://pubmed.ncbi.nlm.nih.gov/38661449/"
    ]
  },
  {
    "id": "case-006",
    "title": "ZOLGENSMA 脊髓性肌萎缩症基因治疗",
    "subtitle": "从 SMN1 缺陷到 AAV9 递送基因补充",
    "category": "细胞与基因治疗",
    "realProductOrTechnology": "Onasemnogene abeparvovec-xioi / ZOLGENSMA，AAV9 基因治疗",
    "relatedKnowledgePoints": [
      "SMN1 基因",
      "AAV9 载体",
      "运动神经元",
      "基因补充",
      "转录表达",
      "神经肌肉疾病"
    ],
    "industryDirection": "细胞与基因治疗",
    "coreProblem": "如何通过病毒载体向患者细胞递送功能性 SMN 基因，改善由 SMN1 双等位基因突变导致的脊髓性肌萎缩症？",
    "researchFoundation": "ZOLGENSMA 体现的是“基因补充”而不是基因编辑。SMA 患者缺失或突变的 SMN1 不能产生足够功能性 SMN 蛋白，而 SMN2 虽可部分补偿，但大多数转录本剪接异常，难以完全满足运动神经元需求。ZOLGENSMA 使用 AAV9 载体携带 SMN 转基因表达盒，AAV9 对神经系统和多种组织具有较好转导能力，给药后载体进入细胞并将转基因以主要非整合的形式存在于细胞核中，驱动 SMN 蛋白表达。SMN 蛋白参与小核核糖核蛋白装配和 RNA 剪接相关过程，对运动神经元存活十分关键。该案例能清楚区分“基因补充、基因编辑、RNA 剪接调控”三类遗传病治疗路线，也能引出 AAV 免疫原性、载体剂量、肝毒性监测和长期随访等产业化问题。",
    "applicationValue": "该案例让学生理解基因治疗不只依靠“剪 DNA”，也可以通过补充缺失功能基因来改变疾病进程。它能把分子遗传学和真实药物监管案例连接起来。",
    "requiredAbilities": [
      "遗传病机制解释能力",
      "病毒载体路径分析能力",
      "基因治疗路线比较能力",
      "安全性风险判断能力"
    ],
    "recommendedKeywords": [
      "Zolgensma",
      "onasemnogene abeparvovec",
      "SMN1",
      "AAV9",
      "spinal muscular atrophy",
      "gene addition"
    ],
    "linkedResearchTask": "SMA 致病机制图构建",
    "evidenceLevel": "高",
    "sourceType": "监管文件",
    "background": "脊髓性肌萎缩症（SMA）与 SMN1 基因缺陷密切相关，患者运动神经元因 SMN 蛋白不足而退化，造成进行性肌无力。FDA 页面显示 ZOLGENSMA 的 proper name 为 onasemnogene abeparvovec-xioi，用于 2 岁以下、SMN1 双等位基因突变的 SMA 儿童患者。",
    "applicationScenario": "用于儿科遗传病基因治疗教学，可连接遗传突变、神经细胞功能、病毒载体、递送效率、一次性治疗定价与长期安全性评估。",
    "displayFocus": "SMN1 缺陷—运动神经元退化—AAV9 递送 SMN 基因—表达恢复的路径图。",
    "migrationPath": {
      "textbookBase": [
        "SMN1 基因",
        "AAV9 载体",
        "运动神经元"
      ],
      "researchFrontier": [
        "SMA 致病机制图构建",
        "Zolgensma",
        "onasemnogene abeparvovec"
      ],
      "industryApplication": [
        "Onasemnogene abeparvovec-xioi / ZOLGENSMA，AAV9 基因治疗",
        "细胞与基因治疗",
        "细胞与基因治疗"
      ]
    },
    "references": [
      {
        "title": "FDA reference 1",
        "url": "https://www.fda.gov/vaccines-blood-biologics/zolgensma",
        "type": "FDA"
      }
    ],
    "sourceUrls": [
      "https://www.fda.gov/vaccines-blood-biologics/zolgensma"
    ]
  },
  {
    "id": "case-007",
    "title": "HERCEPTIN 抗 HER2 单克隆抗体靶向治疗",
    "subtitle": "从 HER2 受体扩增到抗体药物治疗",
    "category": "抗体药物与肿瘤免疫治疗",
    "realProductOrTechnology": "Trastuzumab / HERCEPTIN，HER2 靶向单克隆抗体",
    "relatedKnowledgePoints": [
      "HER2/ERBB2",
      "受体酪氨酸激酶",
      "单克隆抗体",
      "信号转导",
      "ADCC",
      "乳腺癌分子分型"
    ],
    "industryDirection": "抗体药物与靶向治疗",
    "coreProblem": "如何利用肿瘤细胞表面 HER2 过度表达这一分子特征，开发选择性靶向治疗策略？",
    "researchFoundation": "HER2 属于 EGFR/ERBB 受体酪氨酸激酶家族。正常情况下，HER 家族受体通过二聚化和下游 PI3K-AKT、RAS-MAPK 等信号通路调控细胞增殖和存活；当 HER2 扩增或过度表达时，细胞表面受体数量异常增加，信号输入持续增强，推动肿瘤生长、侵袭和复发。Trastuzumab 是人源化单克隆抗体，主要结合 HER2 胞外结构域，能够干扰 HER2 相关信号、促进受体内吞或降解，并通过 Fc 片段募集免疫效应细胞产生抗体依赖的细胞介导细胞毒作用（ADCC）。该案例也体现了伴随诊断的重要性：只有明确 HER2 阳性状态，靶向治疗才有明确适用基础。",
    "applicationValue": "该案例适合作为抗体药物和精准治疗入门案例，能让学生理解“靶点表达状态—诊断检测—药物机制—临床获益”的闭环。",
    "requiredAbilities": [
      "受体信号通路分析能力",
      "抗体机制解释能力",
      "伴随诊断理解能力",
      "靶向治疗策略比较能力"
    ],
    "recommendedKeywords": [
      "trastuzumab",
      "Herceptin",
      "HER2",
      "ERBB2",
      "monoclonal antibody",
      "ADCC",
      "breast cancer"
    ],
    "linkedResearchTask": "HER2 信号通路解释",
    "evidenceLevel": "高",
    "sourceType": "监管文件",
    "background": "HER2 阳性乳腺癌常由 ERBB2/HER2 扩增或过度表达驱动，肿瘤细胞依赖 HER2 相关信号获得增殖优势。HERCEPTIN 是经典抗 HER2 单克隆抗体药物，说明书中明确其适用于 HER2 过表达或扩增相关治疗场景。",
    "applicationScenario": "用于 HER2 阳性乳腺癌、胃癌等治疗相关教学，可延伸到肿瘤分子分型、抗体药物设计、IHC/FISH 检测和耐药机制分析。",
    "displayFocus": "HER2 过表达驱动肿瘤；trastuzumab 结合 HER2 的位置；ADCC 与信号抑制双重机制。",
    "migrationPath": {
      "textbookBase": [
        "HER2/ERBB2",
        "受体酪氨酸激酶",
        "单克隆抗体"
      ],
      "researchFrontier": [
        "HER2 信号通路解释",
        "trastuzumab",
        "Herceptin"
      ],
      "industryApplication": [
        "Trastuzumab / HERCEPTIN，HER2 靶向单克隆抗体",
        "抗体药物与靶向治疗",
        "抗体药物与肿瘤免疫治疗"
      ]
    },
    "references": [
      {
        "title": "gene.com 1",
        "url": "https://www.gene.com/download/pdf/herceptin_prescribing.pdf",
        "type": "Other"
      }
    ],
    "sourceUrls": [
      "https://www.gene.com/download/pdf/herceptin_prescribing.pdf"
    ]
  },
  {
    "id": "case-008",
    "title": "FoundationOne CDx 肿瘤综合基因组检测",
    "subtitle": "从 NGS 面板到肿瘤伴随诊断",
    "category": "分子诊断与检测平台",
    "realProductOrTechnology": "FoundationOne CDx，FDA 批准的组织型 NGS 伴随诊断检测",
    "relatedKnowledgePoints": [
      "NGS",
      "基因突变",
      "拷贝数变异",
      "基因融合",
      "MSI",
      "TMB",
      "伴随诊断"
    ],
    "industryDirection": "肿瘤精准检测与伴随诊断",
    "coreProblem": "如何通过一次 NGS 检测获得肿瘤基因组信息，并帮助患者匹配可能获益的靶向治疗？",
    "researchFoundation": "FoundationOne CDx 的基本原理是基于肿瘤组织样本提取 DNA，经过文库构建、靶向捕获、二代测序和生物信息分析，识别与治疗相关的单核苷酸变异、小片段插入缺失、拷贝数改变和部分基因重排。与单基因检测相比，大面板 NGS 能在一个实验流程中同时观察多个驱动基因和耐药基因，适合肿瘤高度异质和多靶点用药的场景。MSI 反映错配修复缺陷相关的微卫星不稳定，TMB 反映肿瘤突变负荷，两者可辅助免疫治疗决策。该案例也能引出前处理质量、测序深度、肿瘤含量、变异注释、阳性/阴性结果解释和伴随诊断监管要求。",
    "applicationValue": "该案例能把“基因突变知识点”转化为“临床治疗选择依据”，适合连接测序技术、生物信息分析、药物适应证和临床报告解读。",
    "requiredAbilities": [
      "分子诊断理解能力",
      "测序结果解读能力",
      "变异注释能力",
      "精准用药分析能力"
    ],
    "recommendedKeywords": [
      "FoundationOne CDx",
      "NGS",
      "companion diagnostic",
      "tumor mutational burden",
      "MSI",
      "targeted therapy"
    ],
    "linkedResearchTask": "肿瘤 NGS 报告解读",
    "evidenceLevel": "高",
    "sourceType": "监管文件",
    "background": "肿瘤治疗越来越依赖分子分型。FoundationOne CDx 是真实的肿瘤综合基因组检测案例，FDA 文件显示其为 NGS 体外诊断设备，可检测多个基因突变、MSI、TMB，并作为伴随诊断用于匹配靶向治疗。",
    "applicationScenario": "用于实体瘤基因组检测、靶向药匹配、免疫治疗标志物分析、临床试验入组筛选和精准医学教学。",
    "displayFocus": "样本—测序—变异注释—治疗匹配流程；NGS 面板与单基因检测对比。",
    "migrationPath": {
      "textbookBase": [
        "NGS",
        "基因突变",
        "拷贝数变异"
      ],
      "researchFrontier": [
        "肿瘤 NGS 报告解读",
        "FoundationOne CDx",
        "NGS"
      ],
      "industryApplication": [
        "FoundationOne CDx，FDA 批准的组织型 NGS 伴随诊断检测",
        "肿瘤精准检测与伴随诊断",
        "分子诊断与检测平台"
      ]
    },
    "references": [
      {
        "title": "FDA reference 1",
        "url": "https://www.accessdata.fda.gov/cdrh_docs/pdf17/P170019B.pdf",
        "type": "Label"
      }
    ],
    "sourceUrls": [
      "https://www.accessdata.fda.gov/cdrh_docs/pdf17/P170019B.pdf"
    ]
  },
  {
    "id": "case-009",
    "title": "Cepheid Xpert MTB/RIF 结核与利福平耐药检测",
    "subtitle": "从自动化实时 PCR 到感染快速诊断",
    "category": "分子诊断与检测平台",
    "realProductOrTechnology": "Xpert MTB/RIF system，结核分枝杆菌与利福平耐药自动化核酸检测",
    "relatedKnowledgePoints": [
      "PCR",
      "实时荧光检测",
      "结核分枝杆菌 DNA",
      "rpoB 基因",
      "耐药突变",
      "样本前处理"
    ],
    "industryDirection": "病原体核酸检测与感染诊断",
    "coreProblem": "如何在较短时间内同时判断样本中是否存在结核分枝杆菌及其是否可能对利福平耐药？",
    "researchFoundation": "Xpert MTB/RIF 将样本裂解、核酸释放、扩增和实时荧光检测集成在一次性封闭式检测盒中，降低了手工操作复杂度和污染风险。检测靶点之一是结核分枝杆菌复合群相关 DNA 序列，同时通过多条分子探针覆盖 rpoB 基因的利福平耐药决定区域。利福平耐药常由 rpoB 特定位点突变导致，突变会影响探针结合和荧光信号模式，从而提示耐药风险。该技术的核心价值在于把“病原体是否存在”和“关键一线药物耐药风险”放在同一套分子诊断流程中完成，为早期隔离、治疗方案调整和公共卫生控制争取时间。",
    "applicationValue": "该案例能帮助学生理解 PCR 不只是实验室扩增技术，也能通过封闭式自动化系统成为临床感染诊断和公共卫生管理工具。",
    "requiredAbilities": [
      "核酸检测原理理解能力",
      "病原诊断流程分析能力",
      "耐药突变解释能力",
      "公共卫生场景判断能力"
    ],
    "recommendedKeywords": [
      "Xpert MTB/RIF",
      "tuberculosis",
      "rifampicin resistance",
      "real-time PCR",
      "rpoB",
      "nucleic acid amplification"
    ],
    "linkedResearchTask": "rpoB 突变与耐药机制解释",
    "evidenceLevel": "高",
    "sourceType": "监管文件",
    "background": "传统结核培养耗时较长，耐药检测更加延后。WHO 文件明确 Xpert MTB/RIF 是用于快速、同步检测结核和利福平耐药的自动化实时核酸扩增技术，是感染诊断从培养依赖走向分子快速检测的代表案例。",
    "applicationScenario": "用于结核病快速筛查、疑似耐药结核评估、HIV 合并感染患者诊断、基层或区域实验室感染病检测能力建设。",
    "displayFocus": "封闭式检测盒流程；rpoB 探针检测耐药突变；快速诊断对治疗决策的影响。",
    "migrationPath": {
      "textbookBase": [
        "PCR",
        "实时荧光检测",
        "结核分枝杆菌 DNA"
      ],
      "researchFrontier": [
        "rpoB 突变与耐药机制解释",
        "Xpert MTB/RIF",
        "tuberculosis"
      ],
      "industryApplication": [
        "Xpert MTB/RIF system，结核分枝杆菌与利福平耐药自动化核酸检测",
        "病原体核酸检测与感染诊断",
        "分子诊断与检测平台"
      ]
    },
    "references": [
      {
        "title": "who.int 1",
        "url": "https://www.who.int/publications/i/item/9789241501545",
        "type": "Other"
      }
    ],
    "sourceUrls": [
      "https://www.who.int/publications/i/item/9789241501545"
    ]
  },
  {
    "id": "case-010",
    "title": "MON 87705 / Vistive Gold 高油酸大豆",
    "subtitle": "从脂肪酸代谢调控到作物品质改良",
    "category": "农业与动物水产生物技术",
    "realProductOrTechnology": "MON 87705 soybean / Vistive Gold，高油酸大豆",
    "relatedKnowledgePoints": [
      "脂肪酸代谢",
      "FAD2",
      "FATB",
      "RNA 调控",
      "植物分子育种",
      "营养品质改良"
    ],
    "industryDirection": "转基因与分子育种作物品质改良",
    "coreProblem": "如何通过调控植物脂肪酸代谢通路，改良大豆油的油酸含量和加工稳定性？",
    "researchFoundation": "大豆油的脂肪酸组成决定其营养属性、氧化稳定性和加工性能。FAD2 编码脂肪酸去饱和酶，参与将油酸进一步转化为亚油酸；FATB 与饱和脂肪酸从质体输出相关。MON 87705 的设计思路是通过分子手段改变相关基因表达，使油酸比例升高，同时降低部分饱和脂肪酸和多不饱和脂肪酸比例。油酸含量提高后，油脂在加热和储存过程中更稳定，能减少部分氢化需求，也能减少反式脂肪产生风险。这个案例能说明农业生物技术不只解决“虫害和除草剂抗性”，还可以围绕营养品质、加工适配性和健康需求改良作物内源代谢通路。",
    "applicationValue": "该案例把植物生理代谢与真实农业产品连接起来，适合帮助学生理解基因调控如何改变作物商品属性。",
    "requiredAbilities": [
      "植物代谢通路分析能力",
      "育种目标拆解能力",
      "监管证据检索能力",
      "产业应用价值判断能力"
    ],
    "recommendedKeywords": [
      "MON 87705",
      "Vistive Gold",
      "high oleic soybean",
      "FAD2",
      "FATB",
      "fatty acid profile"
    ],
    "linkedResearchTask": "脂肪酸代谢路径图绘制",
    "evidenceLevel": "高",
    "sourceType": "监管文件",
    "background": "USDA APHIS 文件明确 MON 87705 是 improved fatty acid profile soybean，涉及 FAD2、FATB 等脂肪酸代谢相关基因。它适合作为农业生物技术中“作物品质改良”而不是单纯增产或抗虫的案例。",
    "applicationScenario": "用于讲解植物代谢工程、油料作物育种、营养品质改良、转基因作物监管和食品加工性能评价。",
    "displayFocus": "脂肪酸通路如何影响油脂稳定性；FAD2/FATB 在油酸比例中的作用。",
    "migrationPath": {
      "textbookBase": [
        "脂肪酸代谢",
        "FAD2",
        "FATB"
      ],
      "researchFrontier": [
        "脂肪酸代谢路径图绘制",
        "MON 87705",
        "Vistive Gold"
      ],
      "industryApplication": [
        "MON 87705 soybean / Vistive Gold，高油酸大豆",
        "转基因与分子育种作物品质改良",
        "农业与动物水产生物技术"
      ]
    },
    "references": [
      {
        "title": "aphis.usda.gov 1",
        "url": "https://www.aphis.usda.gov/sites/default/files/09_20101p_dea.pdf",
        "type": "Other"
      }
    ],
    "sourceUrls": [
      "https://www.aphis.usda.gov/sites/default/files/09_20101p_dea.pdf"
    ]
  },
  {
    "id": "case-011",
    "title": "Bt 生物农药与 Bt 抗虫作物",
    "subtitle": "从微生物毒蛋白到害虫精准防控",
    "category": "农业与动物水产生物技术",
    "realProductOrTechnology": "Bacillus thuringiensis / Bt 生物农药与 Bt 作物",
    "relatedKnowledgePoints": [
      "苏云金芽孢杆菌",
      "Cry 蛋白",
      "昆虫中肠",
      "受体结合",
      "生物农药",
      "植物内源保护物"
    ],
    "industryDirection": "生物农药与微生物菌肥",
    "coreProblem": "如何利用微生物产生的特异性杀虫蛋白，实现农业害虫防控并降低部分化学农药依赖？",
    "researchFoundation": "Bt 的关键机制来自苏云金芽孢杆菌在形成芽孢时产生的晶体毒素蛋白，常见为 Cry 蛋白。害虫幼虫取食后，晶体蛋白进入昆虫碱性中肠，被蛋白酶切割激活为毒性片段；活化毒素与中肠上皮细胞特异性受体结合，插入膜并形成孔道，破坏离子平衡和肠道完整性，最终导致幼虫停食、感染或死亡。不同 Cry 蛋白对鳞翅目、鞘翅目等害虫有不同靶谱，因此 Bt 技术具有较强选择性。产业化路径有两类：一类是微生物发酵制备 Bt 生物农药制剂，另一类是把 Bt 毒蛋白基因导入作物，使作物自身表达抗虫蛋白。该案例还可以讨论抗性治理，如高剂量/庇护所策略和多基因叠加。",
    "applicationValue": "该案例让学生理解微生物资源如何转化为农业防控工具，也能训练学生从机制、生态和监管三个层面评估农业生物技术。",
    "requiredAbilities": [
      "微生物机制解释能力",
      "害虫防控策略分析能力",
      "生态风险判断能力",
      "抗性管理思维"
    ],
    "recommendedKeywords": [
      "Bacillus thuringiensis",
      "Bt",
      "Cry protein",
      "biopesticide",
      "plant-incorporated protectant",
      "insect resistance management"
    ],
    "linkedResearchTask": "Cry 蛋白作用机制排序",
    "evidenceLevel": "高",
    "sourceType": "监管文件",
    "background": "EPA 官方资料说明 Bt 是广泛使用的微生物农药，Bt 蛋白可杀灭特定昆虫幼虫，相关基因也可导入植物形成植物内源保护物。",
    "applicationScenario": "用于玉米、棉花、蔬菜等害虫防控，也适合讲解生物农药、转基因抗虫作物、害虫抗性管理和生态风险评估。",
    "displayFocus": "幼虫取食—中肠激活—受体结合—孔道形成—害虫死亡流程。",
    "migrationPath": {
      "textbookBase": [
        "苏云金芽孢杆菌",
        "Cry 蛋白",
        "昆虫中肠"
      ],
      "researchFrontier": [
        "Cry 蛋白作用机制排序",
        "Bacillus thuringiensis",
        "Bt"
      ],
      "industryApplication": [
        "Bacillus thuringiensis / Bt 生物农药与 Bt 作物",
        "生物农药与微生物菌肥",
        "农业与动物水产生物技术"
      ]
    },
    "references": [
      {
        "title": "epa.gov 1",
        "url": "https://www.epa.gov/ingredients-used-pesticide-products/what-are-biopesticides",
        "type": "Other"
      }
    ],
    "sourceUrls": [
      "https://www.epa.gov/ingredients-used-pesticide-products/what-are-biopesticides"
    ]
  },
  {
    "id": "case-012",
    "title": "IDEXX SNAP 4Dx Plus 犬用即时诊断检测",
    "subtitle": "从免疫检测到动物健康快速筛查",
    "category": "分子诊断与检测平台",
    "realProductOrTechnology": "IDEXX SNAP 4Dx Plus Test，犬用即时免疫诊断检测",
    "relatedKnowledgePoints": [
      "抗原抗体反应",
      "免疫层析",
      "ELISA",
      "心丝虫抗原",
      "蜱媒病抗体",
      "兽医诊断"
    ],
    "industryDirection": "动物疫苗与兽医诊断",
    "coreProblem": "如何用快速免疫检测在临床现场筛查犬类心丝虫和多种蜱媒病暴露风险？",
    "researchFoundation": "SNAP 4Dx Plus 的核心是基于抗原-抗体特异性结合的即时免疫检测。不同检测位点预包被与目标病原相关的抗原或抗体，样本加入后，若含有相应抗原或抗体，会与标记物形成免疫复合物并在检测区域产生可视化信号。与传统送检相比，即时检测的优势是样本量小、操作简单、结果返回快，适合兽医门诊进行初筛和年度体检。它同时检测心丝虫抗原和多种蜱媒病相关抗体，反映的是“当前感染风险”或“暴露/免疫反应线索”，因此阳性结果还需要结合病史、流行地区、临床症状和必要的复核检测。这个案例适合说明免疫诊断在动物医疗中的产业化形态。",
    "applicationValue": "该案例能把抗原抗体反应从教材实验转化为真实兽医诊断产品，体现动物健康产业和人类诊断技术之间的共通底层原理。",
    "requiredAbilities": [
      "免疫检测原理理解能力",
      "结果解释能力",
      "动物健康场景分析能力",
      "诊断路径设计能力"
    ],
    "recommendedKeywords": [
      "IDEXX",
      "SNAP 4Dx Plus",
      "heartworm",
      "Lyme disease",
      "Ehrlichia",
      "Anaplasma",
      "ELISA"
    ],
    "linkedResearchTask": "抗原抗体检测机制解释",
    "evidenceLevel": "高",
    "sourceType": "监管文件",
    "background": "IDEXX 官方页面说明 SNAP 4Dx Plus 可用于犬心丝虫、莱姆病、埃立克体、无形体等媒介传播疾病筛查，是动物健康诊断平台的真实商业化案例。",
    "applicationScenario": "用于宠物医院体检、媒介传播疾病筛查、犬心丝虫管理、蜱媒病风险评估和兽医公共卫生教学。",
    "displayFocus": "检测卡结构；心丝虫抗原与蜱媒病抗体筛查逻辑；结果解释边界。",
    "migrationPath": {
      "textbookBase": [
        "抗原抗体反应",
        "免疫层析",
        "ELISA"
      ],
      "researchFrontier": [
        "抗原抗体检测机制解释",
        "IDEXX",
        "SNAP 4Dx Plus"
      ],
      "industryApplication": [
        "IDEXX SNAP 4Dx Plus Test，犬用即时免疫诊断检测",
        "动物疫苗与兽医诊断",
        "分子诊断与检测平台"
      ]
    },
    "references": [
      {
        "title": "idexx.com 1",
        "url": "https://www.idexx.com/en/veterinary/snap-tests/snap-4dx-plus-test/",
        "type": "Other"
      }
    ],
    "sourceUrls": [
      "https://www.idexx.com/en/veterinary/snap-tests/snap-4dx-plus-test/"
    ]
  },
  {
    "id": "case-013",
    "title": "AquAdvantage Salmon 转基因大西洋鲑",
    "subtitle": "从生长激素调控到水产生物育种",
    "category": "农业与动物水产生物技术",
    "realProductOrTechnology": "AquAdvantage Salmon，含 opAFP-GHc2 rDNA 构建的转基因大西洋鲑",
    "relatedKnowledgePoints": [
      "转基因动物",
      "生长激素",
      "启动子",
      "rDNA 构建",
      "三倍体",
      "水产育种",
      "生物安全"
    ],
    "industryDirection": "水产养殖生物技术",
    "coreProblem": "如何通过调控生长激素表达，提高养殖鱼类生长效率，同时控制生态扩散风险？",
    "researchFoundation": "AquAdvantage Salmon 的分子设计把来自海洋鱼类的抗冻蛋白启动子/调控序列与 Chinook salmon 生长激素相关编码序列组合，使大西洋鲑在特定养殖条件下持续表达生长激素信号，从而缩短达到上市体重的时间。生长激素通过内分泌轴影响食欲、蛋白合成、能量代谢和体长增长。监管文件强调该产品为特定品系的三倍体、半合子、全雌性大西洋鲑，并对生产设施、物理隔离、繁殖控制和记录管理提出要求，以降低逃逸和基因扩散风险。这个案例适合同时讲“转基因构建如何影响表型”和“水产动物产业化为什么必须考虑生态安全”。",
    "applicationValue": "该案例帮助学生理解动物生物技术不仅关注分子设计，还必须同时处理养殖效率、环境隔离、伦理接受度和食品监管问题。",
    "requiredAbilities": [
      "动物转基因机制解释能力",
      "生长调控分析能力",
      "生物安全风险判断能力",
      "监管资料阅读能力"
    ],
    "recommendedKeywords": [
      "AquAdvantage Salmon",
      "opAFP-GHc2",
      "growth hormone",
      "transgenic salmon",
      "triploid",
      "aquaculture"
    ],
    "linkedResearchTask": "转基因构建图解析",
    "evidenceLevel": "高",
    "sourceType": "监管文件",
    "background": "FDA 批准文件明确 AquAdvantage Salmon 含 opAFP-GHc2 rDNA 构建，并列出 NADA 141-454 批准信息。这是动物基因工程进入食品动物监管的代表案例。",
    "applicationScenario": "用于水产养殖、生长性状改良、转基因动物监管、生物安全评估和现代渔业技术教学。",
    "displayFocus": "opAFP-GHc2 构建；生长激素表达与生长速度；三倍体和封闭养殖作为风险控制。",
    "migrationPath": {
      "textbookBase": [
        "转基因动物",
        "生长激素",
        "启动子"
      ],
      "researchFrontier": [
        "转基因构建图解析",
        "AquAdvantage Salmon",
        "opAFP-GHc2"
      ],
      "industryApplication": [
        "AquAdvantage Salmon，含 opAFP-GHc2 rDNA 构建的转基因大西洋鲑",
        "水产养殖生物技术",
        "农业与动物水产生物技术"
      ]
    },
    "references": [
      {
        "title": "FDA reference 1",
        "url": "https://www.fda.gov/animal-veterinary/animals-intentional-genomic-alterations/aquadvantage-salmon-approval-letter-and-appendix",
        "type": "FDA"
      }
    ],
    "sourceUrls": [
      "https://www.fda.gov/animal-veterinary/animals-intentional-genomic-alterations/aquadvantage-salmon-approval-letter-and-appendix"
    ]
  },
  {
    "id": "case-014",
    "title": "Yakult 益生菌发酵乳饮品",
    "subtitle": "从乳酸菌发酵到消费级功能食品",
    "category": "食品发酵与营养健康",
    "realProductOrTechnology": "Yakult probiotic drink，含 L. paracasei strain Shirota 的益生菌饮品",
    "relatedKnowledgePoints": [
      "乳酸菌发酵",
      "益生菌",
      "肠道菌群",
      "碳水化合物代谢",
      "食品发酵",
      "功能食品"
    ],
    "industryDirection": "益生菌与功能发酵食品",
    "coreProblem": "如何利用特定乳酸菌菌株发酵乳基质，形成稳定可消费的益生菌食品？",
    "researchFoundation": "Yakult 的基础是乳酸菌发酵和菌株稳定生产。L. paracasei strain Shirota 可利用乳中的糖类或添加糖进行发酵，主要产生乳酸，使体系 pH 降低、形成特征风味，并抑制部分腐败微生物生长。益生菌产品的关键不只是“有菌”，还包括菌株鉴定、活菌数控制、发酵条件、冷链或货架稳定性、胃酸和胆盐耐受性以及进入肠道后的生态作用。肠道菌群通过代谢底物、产生有机酸、影响肠屏障和免疫信号等方式参与宿主健康，但具体功效必须以菌株和证据为单位判断，不能把所有益生菌泛化为同一功能。该案例适合训练学生区分“发酵食品”“益生菌菌株”和“健康声称证据”。",
    "applicationValue": "该案例把微生物发酵、食品工业和肠道微生态连接起来，适合作为食品生物技术入门案例。",
    "requiredAbilities": [
      "发酵原理解释能力",
      "菌株功能辨析能力",
      "食品工艺理解能力",
      "健康声称证据判断能力"
    ],
    "recommendedKeywords": [
      "Yakult",
      "probiotic drink",
      "L. paracasei Shirota",
      "lactic acid bacteria",
      "fermentation",
      "gut microbiota"
    ],
    "linkedResearchTask": "益生菌与普通发酵菌区别",
    "evidenceLevel": "高",
    "sourceType": "监管文件",
    "background": "Yakult 官方产品资料明确其为 probiotic drink，核心菌株为 L. paracasei strain Shirota。它是益生菌与功能发酵食品产业化的典型消费级案例。",
    "applicationScenario": "用于功能发酵乳、益生菌饮品、肠道健康消费品、食品发酵工艺和营养健康教学。",
    "displayFocus": "菌株—发酵—活菌稳定—肠道作用的产业链条。",
    "migrationPath": {
      "textbookBase": [
        "乳酸菌发酵",
        "益生菌",
        "肠道菌群"
      ],
      "researchFrontier": [
        "益生菌与普通发酵菌区别",
        "Yakult",
        "probiotic drink"
      ],
      "industryApplication": [
        "Yakult probiotic drink，含 L. paracasei strain Shirota 的益生菌饮品",
        "益生菌与功能发酵食品",
        "食品发酵与营养健康"
      ]
    },
    "references": [
      {
        "title": "yakultusa.com 1",
        "url": "https://www.yakultusa.com/products/yakult/",
        "type": "Other"
      }
    ],
    "sourceUrls": [
      "https://www.yakultusa.com/products/yakult/"
    ]
  },
  {
    "id": "case-015",
    "title": "Perfect Day β-乳球蛋白精准发酵乳清蛋白",
    "subtitle": "从重组蛋白表达到动物源替代食品蛋白",
    "category": "食品发酵与营养健康",
    "realProductOrTechnology": "Perfect Day β-lactoglobulin，Trichoderma reesei 发酵生产的乳清蛋白",
    "relatedKnowledgePoints": [
      "精准发酵",
      "重组蛋白表达",
      "β-乳球蛋白",
      "食品蛋白",
      "真菌发酵",
      "GRAS"
    ],
    "industryDirection": "精准发酵食品蛋白",
    "coreProblem": "如何不依赖奶牛，通过微生物发酵生产与乳清蛋白功能相近的食品蛋白原料？",
    "researchFoundation": "精准发酵的核心是把目标蛋白的编码序列导入工业微生物，使微生物像生产酶或重组药物一样生产食品蛋白。β-乳球蛋白是乳清蛋白的重要成分，具有营养价值和起泡、乳化、凝胶等食品功能。Perfect Day 案例中，工程化 Trichoderma reesei 在发酵罐中表达 β-乳球蛋白，发酵液经过分离、纯化、干燥等步骤得到蛋白原料。与传统畜牧来源不同，这一路线不需要动物泌乳，但分子层面仍生产乳蛋白成分，因此过敏原标识和食品安全评估仍然重要。该案例能说明“微生物工厂”如何从药用重组蛋白扩展到食品蛋白，并引出 GRAS、安全性、纯化残留、规模化成本和消费者接受度等问题。",
    "applicationValue": "该案例能把重组蛋白表达、发酵工程和消费食品产业连接起来，是食品发酵与工业生物制造交叉方向的代表案例。",
    "requiredAbilities": [
      "重组表达机制解释能力",
      "发酵工艺分析能力",
      "食品安全证据判断能力",
      "替代蛋白产业理解能力"
    ],
    "recommendedKeywords": [
      "Perfect Day",
      "precision fermentation",
      "beta-lactoglobulin",
      "Trichoderma reesei",
      "whey protein",
      "GRAS Notice 863"
    ],
    "linkedResearchTask": "精准发酵流程图",
    "evidenceLevel": "高",
    "sourceType": "监管文件",
    "background": "FDA GRAS Notice 863 明确该项目为 Perfect Day 申报的 β-lactoglobulin produced by Trichoderma reesei，拟作为食品中乳或植物蛋白替代来源使用，FDA 对该 GRAS 通知表示 no questions。",
    "applicationScenario": "用于新食品、替代蛋白、乳制品配方、精准发酵平台、食品安全评价和生物制造教学。",
    "displayFocus": "工程菌构建—发酵表达—蛋白纯化—食品应用—安全评价流程。",
    "migrationPath": {
      "textbookBase": [
        "精准发酵",
        "重组蛋白表达",
        "β-乳球蛋白"
      ],
      "researchFrontier": [
        "精准发酵流程图",
        "Perfect Day",
        "precision fermentation"
      ],
      "industryApplication": [
        "Perfect Day β-lactoglobulin，Trichoderma reesei 发酵生产的乳清蛋白",
        "精准发酵食品蛋白",
        "食品发酵与营养健康"
      ]
    },
    "references": [
      {
        "title": "FDA reference 1",
        "url": "https://www.hfpappexternal.fda.gov/scripts/fdcc/index.cfm?id=863&set=GRASNotices",
        "type": "FDA"
      }
    ],
    "sourceUrls": [
      "https://www.hfpappexternal.fda.gov/scripts/fdcc/index.cfm?id=863&set=GRASNotices"
    ]
  },
  {
    "id": "case-016",
    "title": "工程酵母生产青蒿素前体 artemisinic acid",
    "subtitle": "从代谢通路重构到高价值天然产物制造",
    "category": "工业生物制造与合成生物学",
    "realProductOrTechnology": "Engineered Saccharomyces cerevisiae for artemisinic acid，半合成青蒿素前体生产",
    "relatedKnowledgePoints": [
      "合成生物学",
      "代谢工程",
      "酵母工程",
      "萜类合成",
      "甲羟戊酸途径",
      "天然产物路径重构"
    ],
    "industryDirection": "工程菌合成高价值化合物",
    "coreProblem": "如何把植物来源复杂天然产物通路转移到微生物中，实现更稳定的药物前体生产？",
    "researchFoundation": "青蒿素最初来自黄花蒿，但植物种植、提取和价格波动会影响供应稳定性。合成生物学路线的思路是把萜类前体供应和关键氧化步骤重构到酿酒酵母中。工程化过程包括增强甲羟戊酸途径，提高乙酰辅酶 A 到异戊烯焦磷酸和法呢基焦磷酸的通量；引入 amorphadiene synthase 使 FPP 转化为 amorphadiene；再通过 CYP71AV1 等细胞色素 P450 相关酶把 amorphadiene 逐步氧化为 artemisinic acid。微生物发酵得到的 artemisinic acid 再经化学步骤转化为青蒿素。这个案例能清楚展示“通路识别—酶基因表达—代谢通量优化—发酵放大—化学半合成”的合成生物学产业链。",
    "applicationValue": "该案例让学生理解微生物不仅能生产乙醇和氨基酸，也能通过路径重构生产复杂药物前体。",
    "requiredAbilities": [
      "代谢通路拆解能力",
      "合成生物学设计能力",
      "酶功能解释能力",
      "发酵放大理解能力"
    ],
    "recommendedKeywords": [
      "artemisinic acid",
      "semi-synthetic artemisinin",
      "Saccharomyces cerevisiae",
      "metabolic engineering",
      "mevalonate pathway",
      "synthetic biology"
    ],
    "linkedResearchTask": "青蒿素前体合成路径图",
    "evidenceLevel": "高",
    "sourceType": "监管文件",
    "background": "Nature 论文报道工程化酿酒酵母可高水平生产 artemisinic acid，是半合成青蒿素产业化基础。这是合成生物学和工业生物制造的经典真实案例。",
    "applicationScenario": "用于抗疟药物供应、植物天然产物替代生产、工程菌细胞工厂、发酵放大和合成生物学教学。",
    "displayFocus": "甲羟戊酸途径增强；amorphadiene synthase 与 CYP71AV1 的作用；发酵到半合成的流程。",
    "migrationPath": {
      "textbookBase": [
        "合成生物学",
        "代谢工程",
        "酵母工程"
      ],
      "researchFrontier": [
        "青蒿素前体合成路径图",
        "artemisinic acid",
        "semi-synthetic artemisinin"
      ],
      "industryApplication": [
        "Engineered Saccharomyces cerevisiae for artemisinic acid，半合成青蒿素前体生产",
        "工程菌合成高价值化合物",
        "工业生物制造与合成生物学"
      ]
    },
    "references": [
      {
        "title": "nature.com 1",
        "url": "https://www.nature.com/articles/nature12051",
        "type": "DOI"
      }
    ],
    "sourceUrls": [
      "https://www.nature.com/articles/nature12051"
    ]
  },
  {
    "id": "case-017",
    "title": "KANEKA Green Planet PHBH 生物基可降解材料",
    "subtitle": "从微生物储碳聚合物到可降解塑料",
    "category": "工业生物制造与合成生物学",
    "realProductOrTechnology": "KANEKA Biodegradable Polymer Green Planet™ / PHBH，微生物生物合成材料",
    "relatedKnowledgePoints": [
      "PHA",
      "PHBH",
      "微生物储碳",
      "植物油原料",
      "生物降解",
      "生物基材料"
    ],
    "industryDirection": "生物基材料与生物降解塑料",
    "coreProblem": "如何利用微生物把可再生碳源转化为可降解聚合物材料，替代部分传统塑料？",
    "researchFoundation": "PHBH 属于 PHA 家族聚合物。许多微生物在碳源充足但氮、磷等营养限制时，会把多余碳源转化为细胞内聚羟基脂肪酸酯颗粒，用作能量和碳储备。工业生产中，通过筛选或改造高产菌株，控制碳源、营养限制、溶氧、pH 和发酵时间，使微生物大量积累 PHBH；随后通过细胞收集、破碎、提取和造粒得到材料。PHBH 的性能取决于单体组成和分子量，不同羟基脂肪酸单元比例会影响柔韧性、熔点和加工适配性。进入环境后，特定微生物和酶可逐步降解聚合物链，使其回到碳循环中。该案例适合解释生物基材料并不等同于一定快速降解，材料结构、环境条件和微生物生态共同决定降解表现。",
    "applicationValue": "该案例能把微生物代谢、发酵工程和材料产业结合起来，帮助学生理解“细胞工厂如何生产材料”。",
    "requiredAbilities": [
      "微生物代谢解释能力",
      "材料属性分析能力",
      "发酵工艺理解能力",
      "环境降解评价能力"
    ],
    "recommendedKeywords": [
      "KANEKA Green Planet",
      "PHBH",
      "PHA",
      "biodegradable polymer",
      "microbial biosynthesis",
      "plant oils"
    ],
    "linkedResearchTask": "PHA/PHBH 合成路径说明",
    "evidenceLevel": "高",
    "sourceType": "监管文件",
    "background": "KANEKA 官方资料说明 Green Planet™（PHBH）由微生物以植物油等为主要原料生物合成，可在土壤和海水中被环境微生物最终降解为 CO2 和 H2O。",
    "applicationScenario": "用于食品包装、吸管、购物袋、餐具等塑料替代场景，也适合用于讲解生物基材料、微生物发酵、环境降解和循环经济。",
    "displayFocus": "微生物储碳颗粒；植物油到聚合物；土壤/海水降解路径。",
    "migrationPath": {
      "textbookBase": [
        "PHA",
        "PHBH",
        "微生物储碳"
      ],
      "researchFrontier": [
        "PHA/PHBH 合成路径说明",
        "KANEKA Green Planet",
        "PHBH"
      ],
      "industryApplication": [
        "KANEKA Biodegradable Polymer Green Planet™ / PHBH，微生物生物合成材料",
        "生物基材料与生物降解塑料",
        "工业生物制造与合成生物学"
      ]
    },
    "references": [
      {
        "title": "kaneka.co.jp 1",
        "url": "https://www.kaneka.co.jp/en/business/material/nbd_001.html",
        "type": "Other"
      }
    ],
    "sourceUrls": [
      "https://www.kaneka.co.jp/en/business/material/nbd_001.html"
    ]
  },
  {
    "id": "case-018",
    "title": "CARBIOS PET depolymerase 塑料降解酶产业化",
    "subtitle": "从蛋白质工程到 PET 生物回收",
    "category": "蛋白质工程与智能研发平台",
    "realProductOrTechnology": "CARBIOS PET depolymerase / engineered LCC enzyme，PET 酶法解聚技术",
    "relatedKnowledgePoints": [
      "PETase",
      "酶工程",
      "蛋白质热稳定性",
      "酯键水解",
      "塑料降解",
      "生物催化"
    ],
    "industryDirection": "工业酶制剂开发",
    "coreProblem": "如何通过蛋白质工程改造塑料降解酶，使其具备工业条件下高效解聚 PET 的能力？",
    "researchFoundation": "PET 是由对苯二甲酸和乙二醇通过酯键聚合形成的聚酯材料，结晶度高、链段运动受限，因此天然条件下难以快速降解。PET hydrolase 的作用是水解 PET 链中的酯键，生成 MHET、BHET、对苯二甲酸和乙二醇等可再利用单体。CARBIOS 相关研究以叶枝堆肥角质酶 LCC 为基础，通过理性设计和突变筛选提高酶的热稳定性和催化效率，使其能在接近 PET 玻璃化转变温度的条件下工作；温度升高可增加 PET 链段活动性，提升酶接触底物和切割酯键的效率。该案例体现了蛋白质工程的核心思想：理解结构—功能关系，针对稳定性、底物结合和催化效率进行改造，再把酶反应嵌入塑料循环利用工艺。",
    "applicationValue": "该案例能够清晰展示酶工程如何从“能降解”走向“可产业化高效降解”，适合连接蛋白质结构、催化机制和工业应用。",
    "requiredAbilities": [
      "蛋白质结构分析能力",
      "酶催化机制解释能力",
      "工业条件评价能力",
      "循环经济方案设计能力"
    ],
    "recommendedKeywords": [
      "CARBIOS",
      "PET depolymerase",
      "LCC",
      "protein engineering",
      "enzymatic recycling",
      "PET hydrolase"
    ],
    "linkedResearchTask": "PET 酯键水解机制",
    "evidenceLevel": "高",
    "sourceType": "监管文件",
    "background": "Nature 论文报道工程化 PET depolymerase 可在 10 小时内实现至少 90% PET 解聚，并可将生物回收单体重新制成性能等同石化 PET 的材料。",
    "applicationScenario": "用于 PET 塑料回收、纺织聚酯回收、工业酶开发、循环经济和环境生物技术教学。",
    "displayFocus": "PET 高分子链—酶结合—酯键水解—单体回收—再聚合流程。",
    "migrationPath": {
      "textbookBase": [
        "PETase",
        "酶工程",
        "蛋白质热稳定性"
      ],
      "researchFrontier": [
        "PET 酯键水解机制",
        "CARBIOS",
        "PET depolymerase"
      ],
      "industryApplication": [
        "CARBIOS PET depolymerase / engineered LCC enzyme，PET 酶法解聚技术",
        "工业酶制剂开发",
        "蛋白质工程与智能研发平台"
      ]
    },
    "references": [
      {
        "title": "nature.com 1",
        "url": "https://www.nature.com/articles/s41586-020-2149-4",
        "type": "DOI"
      }
    ],
    "sourceUrls": [
      "https://www.nature.com/articles/s41586-020-2149-4"
    ]
  },
  {
    "id": "case-019",
    "title": "HUMULIN R 重组人胰岛素",
    "subtitle": "从重组 DNA 到蛋白药物产业化",
    "category": "蛋白质工程与智能研发平台",
    "realProductOrTechnology": "HUMULIN R，重组人胰岛素注射液",
    "relatedKnowledgePoints": [
      "重组 DNA",
      "E. coli 表达",
      "蛋白纯化",
      "胰岛素",
      "激素调控",
      "糖代谢"
    ],
    "industryDirection": "重组蛋白与蛋白质改造",
    "coreProblem": "如何利用微生物表达系统生产人源蛋白药物，替代动物胰岛素来源并实现规模化制造？",
    "researchFoundation": "胰岛素由 A 链和 B 链通过二硫键连接形成，能够促进葡萄糖摄取、糖原合成和脂代谢调控。早期胰岛素主要从猪或牛胰腺提取，存在来源限制、纯化复杂和免疫原性差异等问题。重组人胰岛素的产业化思路是将人胰岛素相关编码序列导入工程化 E. coli，在发酵罐中表达前体蛋白或链段，经细胞收获、蛋白提取、折叠/酶切、二硫键形成、层析纯化和质量控制，得到与人胰岛素序列一致的蛋白药物。该案例体现了重组 DNA 技术、微生物发酵、蛋白质复性、纯化工艺和药品质量标准的完整链条，也可以作为“从基因到蛋白药物”的入门案例。",
    "applicationValue": "该案例让学生理解基因工程不仅改变研究方法，也彻底改变了蛋白药物的生产方式。",
    "requiredAbilities": [
      "重组表达机制理解能力",
      "蛋白纯化流程分析能力",
      "生物制药工艺理解能力",
      "质量控制意识"
    ],
    "recommendedKeywords": [
      "Humulin R",
      "human insulin",
      "recombinant DNA",
      "E. coli",
      "protein expression",
      "diabetes"
    ],
    "linkedResearchTask": "重组蛋白生产流程排序",
    "evidenceLevel": "高",
    "sourceType": "监管文件",
    "background": "Lilly 说明书明确 HUMULIN R 是 human insulin injection，且由 recombinant DNA technology 使用非致病性 E. coli 生产，是重组蛋白药物产业化的经典案例。",
    "applicationScenario": "用于糖尿病治疗、重组蛋白药物生产、微生物表达系统、蛋白纯化和生物制药质量控制教学。",
    "displayFocus": "人胰岛素基因—E. coli 表达—蛋白纯化—药物制剂流程。",
    "migrationPath": {
      "textbookBase": [
        "重组 DNA",
        "E. coli 表达",
        "蛋白纯化"
      ],
      "researchFrontier": [
        "重组蛋白生产流程排序",
        "Humulin R",
        "human insulin"
      ],
      "industryApplication": [
        "HUMULIN R，重组人胰岛素注射液",
        "重组蛋白与蛋白质改造",
        "蛋白质工程与智能研发平台"
      ]
    },
    "references": [
      {
        "title": "pi.lilly.com 1",
        "url": "https://pi.lilly.com/us/humulin-r-pi.pdf",
        "type": "Other"
      }
    ],
    "sourceUrls": [
      "https://pi.lilly.com/us/humulin-r-pi.pdf"
    ]
  },
  {
    "id": "case-020",
    "title": "CDC Wastewater Monitoring Program 废水流行病学监测",
    "subtitle": "从环境样本到群体感染趋势预警",
    "category": "环境与海洋生物技术",
    "realProductOrTechnology": "CDC Wastewater Monitoring Program，废水病原监测公共卫生平台",
    "relatedKnowledgePoints": [
      "病原核酸",
      "RT-qPCR",
      "环境样本",
      "群体感染",
      "公共卫生预警",
      "废水流行病学"
    ],
    "industryDirection": "废水流行病学与环境生物监测",
    "coreProblem": "如何通过检测污水中的病原核酸，提前观察社区层面的感染变化趋势？",
    "researchFoundation": "感染者可通过粪便、尿液或呼吸道分泌物相关途径把病毒或细菌核酸排入污水系统。废水处理厂或管网采集混合样本后，实验室通过浓缩、核酸提取、RT-qPCR、数字 PCR 或测序等方法检测目标病原体信号。与个体检测不同，废水样本反映的是服务区域内人群总体排放信号，不依赖每个人主动就医或采样，因此可能在临床报告上升前提供趋势预警。数据解释需要考虑降雨稀释、管网覆盖人口、样本保存、核酸降解、排泄差异和归一化指标等因素。该案例适合说明“环境样本—分子检测—群体健康数据—公共卫生决策”的跨学科路径。",
    "applicationValue": "该案例把分子诊断从个体样本扩展到环境和群体层面，适合训练学生理解数据代表性和监测系统的局限。",
    "requiredAbilities": [
      "环境样本分析能力",
      "核酸检测原理理解能力",
      "公共卫生数据解释能力",
      "监测系统设计能力"
    ],
    "recommendedKeywords": [
      "wastewater surveillance",
      "CDC",
      "pathogen nucleic acid",
      "RT-qPCR",
      "public health",
      "community monitoring"
    ],
    "linkedResearchTask": "废水监测流程图",
    "evidenceLevel": "高",
    "sourceType": "监管文件",
    "background": "CDC 官方页面说明 Wastewater Monitoring Program 利用废水监测传染病，帮助社区更快采取公共卫生行动，是环境生物监测与公共卫生结合的真实平台案例。",
    "applicationScenario": "用于传染病趋势监测、疫情预警、病原变异监测、社区公共卫生管理和环境生物检测教学。",
    "displayFocus": "污水采样—核酸浓缩—PCR/测序—趋势分析—公共卫生预警流程。",
    "migrationPath": {
      "textbookBase": [
        "病原核酸",
        "RT-qPCR",
        "环境样本"
      ],
      "researchFrontier": [
        "废水监测流程图",
        "wastewater surveillance",
        "CDC"
      ],
      "industryApplication": [
        "CDC Wastewater Monitoring Program，废水病原监测公共卫生平台",
        "废水流行病学与环境生物监测",
        "环境与海洋生物技术"
      ]
    },
    "references": [
      {
        "title": "cdc.gov 1",
        "url": "https://www.cdc.gov/wastewater/index.html",
        "type": "Other"
      }
    ],
    "sourceUrls": [
      "https://www.cdc.gov/wastewater/index.html"
    ]
  },
  {
    "id": "case-021",
    "title": "红藻来源卡拉胶 Carrageenan 食品添加剂产业化",
    "subtitle": "从海藻多糖结构到食品稳定剂",
    "category": "环境与海洋生物技术",
    "realProductOrTechnology": "Carrageenan，红藻来源硫酸化多糖食品添加剂",
    "relatedKnowledgePoints": [
      "红藻",
      "硫酸化多糖",
      "半乳糖",
      "凝胶形成",
      "食品稳定剂",
      "海洋生物资源"
    ],
    "industryDirection": "海洋生物资源开发",
    "coreProblem": "如何从海洋红藻中提取功能性多糖，并利用其凝胶和增稠性质服务食品加工？",
    "researchFoundation": "卡拉胶是从红藻中水提得到的硫酸化半乳聚糖，主要由半乳糖和 3,6-脱水半乳糖单元构成，硫酸基含量和位置决定其类型与功能。常见 κ-、ι-、λ-卡拉胶具有不同凝胶行为：κ-卡拉胶容易与钾离子形成较硬凝胶，ι-卡拉胶在钙离子存在下形成较弹性凝胶，λ-卡拉胶更偏向增稠而非强凝胶。其产业价值来自多糖链与水、离子、乳蛋白或其他食品组分之间的相互作用，可改善乳制品、饮料、肉制品、凝胶甜品等体系的悬浮稳定性、口感和质构。该案例能说明海洋生物资源不只用于药物发现，也能通过多糖结构功能关系进入食品材料产业。",
    "applicationValue": "该案例将海洋生物资源、天然高分子化学和食品工业连接起来，适合展示“结构决定功能”的材料应用逻辑。",
    "requiredAbilities": [
      "多糖结构解释能力",
      "食品功能材料分析能力",
      "海洋资源转化理解能力",
      "法规证据检索能力"
    ],
    "recommendedKeywords": [
      "carrageenan",
      "red seaweed",
      "sulfated polysaccharide",
      "food additive",
      "thickener",
      "stabilizer"
    ],
    "linkedResearchTask": "κ/ι/λ 卡拉胶功能比较",
    "evidenceLevel": "高",
    "sourceType": "监管文件",
    "background": "eCFR 21 CFR 172.620 明确 carrageenan 可作为食品添加剂使用，来源于红藻类原料，并可作为乳化剂、稳定剂或增稠剂使用。",
    "applicationScenario": "用于食品增稠、乳化稳定、凝胶甜品、乳制品悬浮稳定、海藻资源开发和海洋生物材料教学。",
    "displayFocus": "红藻提取—硫酸化多糖结构—离子/蛋白相互作用—食品稳定功能。",
    "migrationPath": {
      "textbookBase": [
        "红藻",
        "硫酸化多糖",
        "半乳糖"
      ],
      "researchFrontier": [
        "κ/ι/λ 卡拉胶功能比较",
        "carrageenan",
        "red seaweed"
      ],
      "industryApplication": [
        "Carrageenan，红藻来源硫酸化多糖食品添加剂",
        "海洋生物资源开发",
        "环境与海洋生物技术"
      ]
    },
    "references": [
      {
        "title": "ecfr.gov 1",
        "url": "https://www.ecfr.gov/current/title-21/chapter-I/subchapter-B/part-172/subpart-G/section-172.620",
        "type": "Other"
      }
    ],
    "sourceUrls": [
      "https://www.ecfr.gov/current/title-21/chapter-I/subchapter-B/part-172/subpart-G/section-172.620"
    ]
  },
  {
    "id": "case-022",
    "title": "AlphaFold Protein Structure Database",
    "subtitle": "从 AI 结构预测到蛋白功能研究平台",
    "category": "蛋白质工程与智能研发平台",
    "realProductOrTechnology": "AlphaFold Protein Structure Database，AI 蛋白结构预测数据库",
    "relatedKnowledgePoints": [
      "蛋白质折叠",
      "氨基酸序列",
      "深度学习",
      "结构生物学",
      "pLDDT",
      "功能注释"
    ],
    "industryDirection": "AI 药物发现与蛋白结构预测",
    "coreProblem": "如何利用 AI 从氨基酸序列预测蛋白质三维结构，并加速结构生物学和药物研发前期研究？",
    "researchFoundation": "蛋白质的功能高度依赖三维结构，但传统 X 射线晶体学、冷冻电镜和 NMR 成本高、周期长，并非所有蛋白都容易实验解析。AlphaFold 以氨基酸序列为输入，结合进化共变信息、多序列比对、结构模板和深度神经网络，预测残基间空间关系并生成三维坐标。AlphaFold DB 不只是提供坐标文件，还给出 pLDDT 等置信度指标，帮助用户判断局部结构可信度；PAE 等指标可辅助判断结构域相对位置的可靠性。该平台并不替代所有实验结构，因为构象变化、配体结合、膜环境和蛋白复合物状态仍需实验验证，但它显著降低了结构假设生成门槛，能支持突变解释、靶点分析、蛋白工程和药物发现前期筛选。",
    "applicationValue": "该案例展示 AI 如何成为生物研发基础设施，适合帮助学生理解生物信息平台如何改变实验设计和文献检索方式。",
    "requiredAbilities": [
      "结构生物学理解能力",
      "AI 工具使用能力",
      "蛋白功能推理能力",
      "模型置信度判断能力"
    ],
    "recommendedKeywords": [
      "AlphaFold",
      "protein structure prediction",
      "AI",
      "EMBL-EBI",
      "Google DeepMind",
      "pLDDT",
      "structural biology"
    ],
    "linkedResearchTask": "AlphaFold 结构可信度解读",
    "evidenceLevel": "高",
    "sourceType": "监管文件",
    "background": "AlphaFold DB 官方页面说明该数据库由 Google DeepMind 与 EMBL-EBI 开发，开放超过 2 亿个蛋白结构预测，用于加速科学研究。",
    "applicationScenario": "用于蛋白功能预测、突变影响分析、酶工程、抗体/抗原研究、靶点结构建模和 AI 药物发现教学。",
    "displayFocus": "序列输入—AI 预测—置信度评估—功能解释—实验验证流程。",
    "migrationPath": {
      "textbookBase": [
        "蛋白质折叠",
        "氨基酸序列",
        "深度学习"
      ],
      "researchFrontier": [
        "AlphaFold 结构可信度解读",
        "AlphaFold",
        "protein structure prediction"
      ],
      "industryApplication": [
        "AlphaFold Protein Structure Database，AI 蛋白结构预测数据库",
        "AI 药物发现与蛋白结构预测",
        "蛋白质工程与智能研发平台"
      ]
    },
    "references": [
      {
        "title": "alphafold.ebi.ac.uk 1",
        "url": "https://alphafold.ebi.ac.uk/",
        "type": "Other"
      }
    ],
    "sourceUrls": [
      "https://alphafold.ebi.ac.uk/"
    ]
  },
  {
    "id": "case-023",
    "title": "10x Genomics Chromium 单细胞转录组平台",
    "subtitle": "从微流控条形码到单细胞多组学分析",
    "category": "蛋白质工程与智能研发平台",
    "realProductOrTechnology": "10x Genomics Chromium Single Cell Gene Expression，单细胞转录组平台",
    "relatedKnowledgePoints": [
      "单细胞 RNA-seq",
      "微流控",
      "细胞条形码",
      "UMI",
      "转录组",
      "细胞异质性",
      "多组学"
    ],
    "industryDirection": "多组学数据分析与智能实验平台",
    "coreProblem": "如何在成千上万个单细胞水平上测量基因表达，并解析组织或肿瘤中的细胞异质性？",
    "researchFoundation": "传统 bulk RNA-seq 得到的是混合样本平均表达，容易掩盖少数细胞群和细胞状态差异。10x Chromium 的核心是微流控分隔和条形码标记：单个细胞与带有特定 cell barcode、UMI 和 poly(dT) 引物的凝胶微珠共同进入油滴或微反应体系；细胞裂解释放 mRNA，mRNA 的 poly(A) 尾被捕获并反转录，每个转录本被打上细胞来源条形码和分子唯一标识。测序后，生物信息流程先按 barcode 归属细胞，再用 UMI 去重，构建“细胞 × 基因”表达矩阵。后续通过降维、聚类、差异表达、轨迹推断和细胞类型注释解析样本中的细胞组成、状态转换和疾病相关亚群。该案例非常适合讲实验平台与算法分析如何共同构成现代生物研发基础设施。",
    "applicationValue": "该案例帮助学生理解现代生物学已经从“平均表达”走向“细胞级解析”，也能连接实验设计、测序平台和数据分析能力。",
    "requiredAbilities": [
      "单细胞实验流程理解能力",
      "组学数据分析能力",
      "细胞异质性解释能力",
      "平台技术比较能力"
    ],
    "recommendedKeywords": [
      "10x Genomics",
      "Chromium",
      "single-cell RNA-seq",
      "cell barcode",
      "UMI",
      "transcriptomics",
      "multiomics"
    ],
    "linkedResearchTask": "单细胞 RNA-seq 流程排序",
    "evidenceLevel": "高",
    "sourceType": "监管文件",
    "background": "10x Genomics 官方页面说明 Chromium Single Cell Universal 3' 支持全转录组覆盖、500–20,000 个细胞通量和多组学选项，是单细胞组学平台的代表案例。",
    "applicationScenario": "用于肿瘤异质性研究、免疫细胞图谱、发育轨迹分析、药物响应研究、空间组学前期设计和多组学数据分析教学。",
    "displayFocus": "单细胞分隔—条形码标记—测序—矩阵构建—聚类注释流程。",
    "migrationPath": {
      "textbookBase": [
        "单细胞 RNA-seq",
        "微流控",
        "细胞条形码"
      ],
      "researchFrontier": [
        "单细胞 RNA-seq 流程排序",
        "10x Genomics",
        "Chromium"
      ],
      "industryApplication": [
        "10x Genomics Chromium Single Cell Gene Expression，单细胞转录组平台",
        "多组学数据分析与智能实验平台",
        "蛋白质工程与智能研发平台"
      ]
    },
    "references": [
      {
        "title": "10xgenomics.com 1",
        "url": "https://www.10xgenomics.com/products/single-cell-gene-expression",
        "type": "Other"
      }
    ],
    "sourceUrls": [
      "https://www.10xgenomics.com/products/single-cell-gene-expression"
    ]
  },
  {
    "id": "case-024",
    "title": "ENHERTU HER2 抗体偶联药物",
    "subtitle": "从靶向抗体到细胞毒载荷递送",
    "category": "抗体药物与肿瘤免疫治疗",
    "realProductOrTechnology": "Fam-trastuzumab deruxtecan-nxki / ENHERTU，HER2-directed antibody-drug conjugate",
    "relatedKnowledgePoints": [
      "抗体偶联药物",
      "HER2",
      "拓扑异构酶抑制剂",
      "连接子稳定性",
      "肿瘤靶向递送",
      "旁观者效应"
    ],
    "industryDirection": "抗体药物 / ADC / 肿瘤精准治疗",
    "coreProblem": "如何把抗体的靶向识别能力与强效细胞毒载荷结合，使药物优先作用于 HER2 表达相关肿瘤细胞？",
    "researchFoundation": "抗体偶联药物由靶向抗体、化学连接子和细胞毒载荷组成。ENHERTU 以 trastuzumab 相关抗体部分识别 HER2，连接拓扑异构酶 I 抑制剂载荷；药物与 HER2 表达细胞结合后发生内吞，连接子在细胞内环境中裂解并释放载荷，从而干扰 DNA 复制相关过程。教学上可以用该案例解释为什么 ADC 不是简单把抗体和毒素相加，而需要同时优化靶点表达、连接子稳定性、载荷强度、药物抗体比和安全性窗口。对 HER2 低表达或异质表达肿瘤的讨论也适合引出旁观者效应和伴随诊断边界。",
    "applicationValue": "该案例能把抗原识别、蛋白质工程、有机连接子化学和肿瘤治疗策略连成一条产业转化链条，适合作为 ADC 教学展示案例。",
    "requiredAbilities": [
      "抗体药物机制解释能力",
      "靶向递送路径分析能力",
      "伴随诊断理解能力",
      "安全性证据判断能力"
    ],
    "recommendedKeywords": [
      "Enhertu",
      "trastuzumab deruxtecan",
      "antibody-drug conjugate",
      "HER2",
      "topoisomerase inhibitor",
      "bystander effect"
    ],
    "linkedResearchTask": "ADC 结构与 HER2 靶向递送机制分析",
    "evidenceLevel": "高",
    "sourceType": "监管文件",
    "background": "ENHERTU 是 HER2 方向抗体偶联药物的代表案例。FDA 公开资料显示 fam-trastuzumab deruxtecan-nxki 是 HER2-directed antibody and topoisomerase inhibitor conjugate，并在多个 HER2 相关肿瘤治疗场景中获得批准或加速批准。",
    "applicationScenario": "用于肿瘤靶向治疗、抗体工程、药物递送、伴随诊断和 ADC 安全性讨论。",
    "displayFocus": "HER2 识别—ADC 内吞—连接子裂解—载荷释放—肿瘤细胞杀伤流程。",
    "migrationPath": {
      "textbookBase": [
        "抗原抗体特异性识别",
        "受体介导内吞",
        "DNA 复制与拓扑异构酶"
      ],
      "researchFrontier": [
        "ADC 连接子与载荷设计",
        "HER2 低表达肿瘤用药边界",
        "旁观者效应与毒性窗口"
      ],
      "industryApplication": [
        "ENHERTU 多适应证开发",
        "HER2 伴随诊断",
        "新一代 ADC 药物平台"
      ]
    },
    "references": [
      {
        "title": "FDA D.I.S.C.O. Burst Edition: ENHERTU approval for HER2-positive solid tumors",
        "url": "https://www.fda.gov/drugs/resources-information-approved-drugs/fda-disco-burst-edition-fda-approval-enhertu-fam-trastuzumab-deruxtecan-nxki-unresectable-or",
        "type": "FDA"
      },
      {
        "title": "NCI Drug Information: Fam-trastuzumab deruxtecan-nxki",
        "url": "https://www.cancer.gov/about-cancer/treatment/drugs/famtrastuzumabderuxtecan-nxki",
        "type": "NCI"
      },
      {
        "title": "Trastuzumab Deruxtecan in Previously Treated HER2-Positive Breast Cancer",
        "url": "https://pubmed.ncbi.nlm.nih.gov/31825192/",
        "type": "PubMed"
      }
    ],
    "sourceUrls": [
      "https://www.fda.gov/drugs/resources-information-approved-drugs/fda-disco-burst-edition-fda-approval-enhertu-fam-trastuzumab-deruxtecan-nxki-unresectable-or",
      "https://www.cancer.gov/about-cancer/treatment/drugs/famtrastuzumabderuxtecan-nxki",
      "https://pubmed.ncbi.nlm.nih.gov/31825192/"
    ]
  },
  {
    "id": "case-025",
    "title": "ONPATTRO siRNA 脂质递送药物",
    "subtitle": "从 RNA 干扰到肝脏靶向基因沉默",
    "category": "核酸药物与靶向药物研发",
    "realProductOrTechnology": "Patisiran / ONPATTRO，siRNA lipid complex",
    "relatedKnowledgePoints": [
      "RNA 干扰",
      "siRNA",
      "TTR mRNA",
      "脂质纳米递送",
      "肝细胞递送",
      "基因沉默"
    ],
    "industryDirection": "RNA 药物 / siRNA / 递送系统",
    "coreProblem": "如何把易降解的 siRNA 分子递送到目标组织，并通过 RNA 干扰降低致病蛋白表达？",
    "researchFoundation": "RNA 干扰利用双链 siRNA 引导 RISC 复合物识别互补 mRNA，并促使目标 mRNA 降解，从而降低对应蛋白表达。Patisiran 靶向 TTR mRNA，目标是减少突变型和野生型 transthyretin 的生成。由于 siRNA 分子本身带负电、容易被核酸酶降解，药物需要脂质复合物保护并帮助进入肝细胞。该案例适合和 mRNA 疫苗的 LNP 递送对比：两者都依赖核酸递送，但 mRNA 递送的目标是表达蛋白，siRNA 递送的目标是降低目标 mRNA 水平。",
    "applicationValue": "该案例帮助学生理解核酸药物并不只有 mRNA 疫苗，还可以通过 RNAi 调节基因表达，是核酸治疗产业化的重要代表。",
    "requiredAbilities": [
      "RNAi 机制解释能力",
      "递送系统比较能力",
      "遗传病机制分析能力",
      "文献证据解读能力"
    ],
    "recommendedKeywords": [
      "Onpattro",
      "patisiran",
      "siRNA",
      "RNA interference",
      "lipid complex",
      "transthyretin amyloidosis",
      "TTR"
    ],
    "linkedResearchTask": "siRNA 脂质递送与 TTR 基因沉默机制分析",
    "evidenceLevel": "高",
    "sourceType": "监管文件",
    "background": "FDA 对 RNA 药物的介绍中将 patisiran / ONPATTRO 作为 RNA-based medicine 的重要案例。DailyMed 说明书显示 ONPATTRO 含有 patisiran，是用于递送至肝细胞的 double-stranded siRNA lipid complex。",
    "applicationScenario": "用于 RNA 药物、罕见病治疗、核酸递送、肝脏靶向和基因沉默机制教学。",
    "displayFocus": "siRNA 保护递送—肝细胞摄取—RISC 加载—TTR mRNA 降解—蛋白表达下降流程。",
    "migrationPath": {
      "textbookBase": [
        "RNA 结构与降解",
        "基因表达调控",
        "肝脏蛋白分泌"
      ],
      "researchFrontier": [
        "RNAi 药物设计",
        "脂质递送免疫反应控制",
        "肝外组织递送探索"
      ],
      "industryApplication": [
        "ONPATTRO 罕见病治疗",
        "RNAi 药物平台",
        "核酸递送制剂开发"
      ]
    },
    "references": [
      {
        "title": "FDA: New Class of Drugs Fulfills Promise of RNA-based Medicine",
        "url": "https://www.fda.gov/drugs/spotlight-cder-science/new-class-drugs-fulfills-promise-rna-based-medicine",
        "type": "FDA"
      },
      {
        "title": "DailyMed: ONPATTRO patisiran injection, lipid complex",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=e87ec36f-b4b4-49d4-aea4-d4ffb09b0970",
        "type": "Other"
      },
      {
        "title": "Patisiran, an RNAi Therapeutic, for Hereditary Transthyretin Amyloidosis",
        "url": "https://pubmed.ncbi.nlm.nih.gov/29972753/",
        "type": "PubMed"
      }
    ],
    "sourceUrls": [
      "https://www.fda.gov/drugs/spotlight-cder-science/new-class-drugs-fulfills-promise-rna-based-medicine",
      "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=e87ec36f-b4b4-49d4-aea4-d4ffb09b0970",
      "https://pubmed.ncbi.nlm.nih.gov/29972753/"
    ]
  },
  {
    "id": "case-026",
    "title": "Guardant360 CDx 液体活检",
    "subtitle": "从 ctDNA 检测到肿瘤伴随诊断",
    "category": "分子诊断与检测平台",
    "realProductOrTechnology": "Guardant360 CDx，blood-based companion diagnostic",
    "relatedKnowledgePoints": [
      "ctDNA",
      "液体活检",
      "NGS",
      "伴随诊断",
      "肿瘤突变",
      "检测灵敏度"
    ],
    "industryDirection": "液体活检 / NGS / 肿瘤精准诊断",
    "coreProblem": "如何利用血液中的循环肿瘤 DNA 信息，为晚期肿瘤患者提供更便捷的基因变异检测线索？",
    "researchFoundation": "肿瘤细胞死亡、凋亡或坏死过程中可释放 DNA 片段进入血液，形成循环肿瘤 DNA。液体活检通过采血、游离 DNA 提取、靶向测序和生物信息分析，识别 EGFR、KRAS、ERBB2 等与治疗相关的变异。与组织活检相比，血液检测创伤较小、可重复采样，但 ctDNA 含量受肿瘤负荷、转移部位、治疗状态和样本质量影响，阴性结果不能简单等同于没有突变。该案例适合训练学生理解检测灵敏度、特异性、伴随诊断适应证和报告解释边界。",
    "applicationValue": "该案例把分子诊断从组织样本扩展到血液样本，适合展示 NGS、生物标志物和临床决策之间的连接。",
    "requiredAbilities": [
      "分子诊断理解能力",
      "NGS 结果解读能力",
      "检测局限判断能力",
      "伴随诊断证据分析能力"
    ],
    "recommendedKeywords": [
      "Guardant360 CDx",
      "liquid biopsy",
      "ctDNA",
      "companion diagnostic",
      "NGS",
      "sotorasib",
      "KRAS G12C"
    ],
    "linkedResearchTask": "ctDNA 液体活检结果解释边界分析",
    "evidenceLevel": "高",
    "sourceType": "监管文件",
    "background": "FDA 近期批准设备页面显示 Guardant360 CDx 可帮助识别特定非小细胞肺癌患者是否可能从相关 FDA 批准治疗中获益。NCI 也将 FDA 批准的血液检测作为可帮助指导癌症治疗的案例进行介绍。",
    "applicationScenario": "用于肿瘤基因检测、靶向药匹配、治疗过程中动态监测和精准医学教学。",
    "displayFocus": "血液样本—cfDNA/ctDNA 提取—NGS 检测—变异注释—治疗匹配流程。",
    "migrationPath": {
      "textbookBase": [
        "DNA 突变",
        "PCR 与测序",
        "肿瘤异质性"
      ],
      "researchFrontier": [
        "ctDNA 低频变异检测",
        "液体活检动态监测",
        "伴随诊断验证"
      ],
      "industryApplication": [
        "Guardant360 CDx",
        "靶向药用药匹配",
        "血液 NGS 检测报告"
      ]
    },
    "references": [
      {
        "title": "FDA: Guardant360 CDx P200010/S008",
        "url": "https://www.fda.gov/medical-devices/recently-approved-devices/guardant360-cdx-p200010s008",
        "type": "FDA"
      },
      {
        "title": "NCI: FDA Approves Blood Tests That Can Help Guide Cancer Treatment",
        "url": "https://www.cancer.gov/news-events/cancer-currents-blog/2020/fda-guardant-360-foundation-one-cancer-liquid-biopsy",
        "type": "NCI"
      },
      {
        "title": "Clinical validation of Guardant360 CDx as a blood-based companion diagnostic for sotorasib",
        "url": "https://pubmed.ncbi.nlm.nih.gov/34838325/",
        "type": "PubMed"
      }
    ],
    "sourceUrls": [
      "https://www.fda.gov/medical-devices/recently-approved-devices/guardant360-cdx-p200010s008",
      "https://www.cancer.gov/news-events/cancer-currents-blog/2020/fda-guardant-360-foundation-one-cancer-liquid-biopsy",
      "https://pubmed.ncbi.nlm.nih.gov/34838325/"
    ]
  },
  {
    "id": "case-027",
    "title": "BLINCYTO 双特异性 T 细胞连接器",
    "subtitle": "从 CD19/CD3 双靶结合到免疫细胞重定向",
    "category": "抗体药物与肿瘤免疫治疗",
    "realProductOrTechnology": "Blinatumomab / BLINCYTO，CD19-directed CD3 T-cell engager",
    "relatedKnowledgePoints": [
      "双特异性抗体",
      "CD19",
      "CD3",
      "T 细胞活化",
      "免疫突触",
      "白血病"
    ],
    "industryDirection": "双特异性抗体 / 肿瘤免疫治疗",
    "coreProblem": "如何用一个双特异性分子把 T 细胞和肿瘤 B 细胞拉近，从而重定向免疫杀伤？",
    "researchFoundation": "普通单抗通常识别一个主要靶点，而双特异性 T 细胞连接器同时拥有两个结合界面：一端识别肿瘤细胞表面抗原 CD19，另一端识别 T 细胞 CD3 复合体。这样的空间连接可以在不依赖传统抗原呈递的情况下形成类似免疫突触的接触，启动 T 细胞杀伤相关过程。该案例适合与 CAR-T 对比：两者都利用 T 细胞杀伤肿瘤，但 CAR-T 需要工程化细胞制备，blinatumomab 则是可给药的蛋白药物，治疗流程、半衰期、给药方式和安全性管理均不同。",
    "applicationValue": "该案例可以展示抗体药物从单靶阻断走向免疫细胞重定向的设计思路，也能帮助学生比较 CAR-T、单抗和双抗的产业路径。",
    "requiredAbilities": [
      "免疫机制解释能力",
      "抗体结构理解能力",
      "治疗路线比较能力",
      "风险管理判断能力"
    ],
    "recommendedKeywords": [
      "blinatumomab",
      "Blincyto",
      "bispecific T-cell engager",
      "BiTE",
      "CD19",
      "CD3",
      "acute lymphoblastic leukemia"
    ],
    "linkedResearchTask": "双特异性 T 细胞连接器作用机制比较",
    "evidenceLevel": "高",
    "sourceType": "监管文件",
    "background": "NCI 药物信息页面说明 blinatumomab 通过同时结合 T 细胞上的 CD3 和 B 细胞上的 CD19，使 T 细胞更有效地杀伤白血病细胞，并将其归类为 bispecific T-cell engager。",
    "applicationScenario": "用于急性淋巴细胞白血病免疫治疗、双抗药物设计、T 细胞重定向和免疫治疗毒性管理教学。",
    "displayFocus": "CD19 肿瘤细胞—BLINCYTO—CD3 T 细胞空间连接与杀伤流程。",
    "migrationPath": {
      "textbookBase": [
        "T 细胞活化",
        "抗原抗体识别",
        "免疫突触"
      ],
      "researchFrontier": [
        "T 细胞连接器设计",
        "双抗给药与半衰期优化",
        "免疫毒性管理"
      ],
      "industryApplication": [
        "BLINCYTO 白血病治疗",
        "CD3 双抗平台",
        "CAR-T 与双抗路线比较"
      ]
    },
    "references": [
      {
        "title": "NCI Drug Information: Blinatumomab",
        "url": "https://www.cancer.gov/about-cancer/treatment/drugs/blinatumomab",
        "type": "NCI"
      },
      {
        "title": "FDA Label: BLINCYTO blinatumomab",
        "url": "https://www.accessdata.fda.gov/drugsatfda_docs/label/2021/125557s020lbl.pdf",
        "type": "Label"
      }
    ],
    "sourceUrls": [
      "https://www.cancer.gov/about-cancer/treatment/drugs/blinatumomab",
      "https://www.accessdata.fda.gov/drugsatfda_docs/label/2021/125557s020lbl.pdf"
    ]
  },
  {
    "id": "case-028",
    "title": "LANTIDRA 胰岛细胞治疗",
    "subtitle": "从胰岛细胞移植到 1 型糖尿病再生医学",
    "category": "细胞与基因治疗",
    "realProductOrTechnology": "Donislecel-jujn / LANTIDRA，allogeneic pancreatic islet cellular therapy",
    "relatedKnowledgePoints": [
      "胰岛细胞",
      "β 细胞",
      "胰岛素分泌",
      "异体细胞治疗",
      "免疫抑制",
      "1 型糖尿病"
    ],
    "industryDirection": "细胞治疗 / 再生医学 / 代谢疾病",
    "coreProblem": "如何通过供体胰岛细胞补充胰岛素分泌功能，同时管理移植相关免疫和安全风险？",
    "researchFoundation": "1 型糖尿病与胰岛 β 细胞功能缺失密切相关，患者需要依赖外源胰岛素维持血糖。胰岛细胞治疗的思路是把具有胰岛素分泌能力的供体胰岛细胞制备成细胞治疗产品，经特定路径输入体内，使其感应葡萄糖并释放胰岛素。与小分子或蛋白药物不同，细胞治疗的关键变量包括细胞来源、活性、纯度、移植部位、免疫排斥、免疫抑制和长期随访。该案例适合讨论再生医学的机会与边界：补充活细胞功能可能带来新的治疗路径，但也伴随供体来源、免疫管理和适用人群筛选等限制。",
    "applicationValue": "该案例将细胞生物学、内分泌调控和再生医学监管连接起来，适合展示非肿瘤细胞治疗的产业化形态。",
    "requiredAbilities": [
      "细胞功能解释能力",
      "移植免疫分析能力",
      "再生医学边界判断能力",
      "监管资料阅读能力"
    ],
    "recommendedKeywords": [
      "Lantidra",
      "donislecel",
      "pancreatic islet",
      "cellular therapy",
      "type 1 diabetes",
      "allogeneic"
    ],
    "linkedResearchTask": "胰岛细胞治疗机制与免疫风险分析",
    "evidenceLevel": "高",
    "sourceType": "监管文件",
    "background": "FDA 新闻稿说明 LANTIDRA 是由已故供体胰腺细胞制成的首个异体胰岛细胞治疗，用于特定 1 型糖尿病患者。FDA 产品页也列出其 proper name 为 donislecel-jujn。",
    "applicationScenario": "用于 1 型糖尿病、细胞治疗、再生医学、移植免疫和产品质量控制教学。",
    "displayFocus": "供体胰岛细胞制备—移植—葡萄糖感应—胰岛素分泌—免疫管理流程。",
    "migrationPath": {
      "textbookBase": [
        "胰岛素分泌",
        "细胞移植",
        "免疫排斥"
      ],
      "researchFrontier": [
        "胰岛细胞制备与质量控制",
        "免疫保护策略",
        "干细胞来源胰岛样细胞"
      ],
      "industryApplication": [
        "LANTIDRA 胰岛细胞治疗",
        "再生医学产品监管",
        "糖尿病细胞治疗路线"
      ]
    },
    "references": [
      {
        "title": "FDA Approves First Cellular Therapy to Treat Patients with Type 1 Diabetes",
        "url": "https://www.fda.gov/news-events/press-announcements/fda-approves-first-cellular-therapy-treat-patients-type-1-diabetes",
        "type": "FDA"
      },
      {
        "title": "FDA Product Page: LANTIDRA",
        "url": "https://www.fda.gov/vaccines-blood-biologics/lantidra",
        "type": "FDA"
      },
      {
        "title": "FDA Package Insert: LANTIDRA",
        "url": "https://www.fda.gov/media/169920/download",
        "type": "FDA"
      }
    ],
    "sourceUrls": [
      "https://www.fda.gov/news-events/press-announcements/fda-approves-first-cellular-therapy-treat-patients-type-1-diabetes",
      "https://www.fda.gov/vaccines-blood-biologics/lantidra",
      "https://www.fda.gov/media/169920/download"
    ]
  },
  {
    "id": "case-029",
    "title": "Impossible Foods 大豆血红蛋白精准发酵",
    "subtitle": "从工程酵母到植物基食品风味分子",
    "category": "食品发酵与营养健康",
    "realProductOrTechnology": "Soy leghemoglobin preparation from Pichia pastoris，Impossible Foods GRN 737",
    "relatedKnowledgePoints": [
      "精准发酵",
      "Pichia pastoris",
      "重组蛋白表达",
      "血红素蛋白",
      "食品安全",
      "GRAS"
    ],
    "industryDirection": "精准发酵 / 替代蛋白 / 食品生物制造",
    "coreProblem": "如何用工程化微生物生产植物基食品中的关键风味相关蛋白，并完成食品安全证据说明？",
    "researchFoundation": "大豆血红蛋白是一类含血红素的植物蛋白，可参与产生类似肉类烹调风味的感官特征。Impossible Foods 的案例使用 Pichia pastoris 作为表达宿主，通过发酵生产目标蛋白制备物，再用于植物基肉类替代品。该案例适合解释精准发酵不是简单“发酵食品”，而是把目标基因表达、发酵放大、蛋白纯化、杂质控制、过敏原和安全性评估组合成食品原料产业化流程。教学中应保守表述其用途与安全资料来源，避免把风味改善扩大为未经证实的健康效果。",
    "applicationValue": "该案例能把微生物表达系统从药品和酶制剂拓展到食品原料，展示合成生物制造进入消费食品的路径。",
    "requiredAbilities": [
      "重组表达机制解释能力",
      "发酵工艺分析能力",
      "食品安全证据判断能力",
      "产业边界表达能力"
    ],
    "recommendedKeywords": [
      "Impossible Foods",
      "soy leghemoglobin",
      "Pichia pastoris",
      "precision fermentation",
      "heme protein",
      "GRAS Notice 737"
    ],
    "linkedResearchTask": "精准发酵食品蛋白安全性证据梳理",
    "evidenceLevel": "高",
    "sourceType": "监管文件",
    "background": "FDA GRAS Notice GRN 737 页面显示该通知对象为 Impossible Foods 的 soy leghemoglobin preparation from a strain of Pichia pastoris，用于优化 ground beef analogue products 的风味。",
    "applicationScenario": "用于替代蛋白、植物基食品、精准发酵、食品安全评价和消费者接受度讨论。",
    "displayFocus": "目标蛋白设计—工程酵母发酵—蛋白制备—食品应用—安全资料说明流程。",
    "migrationPath": {
      "textbookBase": [
        "重组蛋白表达",
        "微生物发酵",
        "蛋白纯化"
      ],
      "researchFrontier": [
        "精准发酵食品原料",
        "食品蛋白安全性评价",
        "替代蛋白风味设计"
      ],
      "industryApplication": [
        "Impossible Foods soy leghemoglobin",
        "植物基肉类风味原料",
        "GRAS 资料说明"
      ]
    },
    "references": [
      {
        "title": "FDA GRAS Notice GRN No. 737: Soy leghemoglobin preparation from Pichia pastoris",
        "url": "https://www.hfpappexternal.fda.gov/scripts/fdcc/index.cfm?id=737&set=GrASNotices",
        "type": "FDA"
      },
      {
        "title": "FDA Letter: GRAS Notice No. GRN 000737",
        "url": "https://www.fda.gov/media/116243/download",
        "type": "FDA"
      },
      {
        "title": "FDA GRN 737 releasable information",
        "url": "https://www.fda.gov/media/124351/download",
        "type": "FDA"
      }
    ],
    "sourceUrls": [
      "https://www.hfpappexternal.fda.gov/scripts/fdcc/index.cfm?id=737&set=GrASNotices",
      "https://www.fda.gov/media/116243/download",
      "https://www.fda.gov/media/124351/download"
    ]
  },
  {
    "id": "case-030",
    "title": "REBYOTA 微生物群活体治疗产品",
    "subtitle": "从肠道菌群恢复到复发性 CDI 预防",
    "category": "工业生物制造与合成生物学",
    "realProductOrTechnology": "Fecal microbiota, live-jslm / REBYOTA",
    "relatedKnowledgePoints": [
      "肠道菌群",
      "Clostridioides difficile",
      "微生态恢复",
      "活体生物制品",
      "供体筛查",
      "抗生素后菌群失衡"
    ],
    "industryDirection": "微生物组治疗 / 活体生物制品",
    "coreProblem": "如何把健康供体来源的微生物群制备为标准化产品，用于降低复发性艰难梭菌感染风险？",
    "researchFoundation": "抗生素治疗可能破坏肠道菌群结构，使艰难梭菌获得扩增机会并导致复发。微生物群治疗产品的思路是通过经过筛查、制备和质控的供体来源微生物群，帮助恢复肠道微生态多样性和竞争性屏障。与传统小分子药物不同，活体微生物制品涉及供体筛查、病原体风险控制、批次一致性、储存运输和给药方式等特殊问题。教学中可以用该案例讨论“生态系统作为治疗对象”的新范式，同时明确 REBYOTA 的适用边界是预防复发而不是替代急性感染抗生素治疗。",
    "applicationValue": "该案例帮助学生理解微生物组不只是研究热点，也已形成标准化生物制品和监管路径，适合展示微生态治疗的产业边界。",
    "requiredAbilities": [
      "微生态机制解释能力",
      "感染复发路径分析能力",
      "生物制品风险判断能力",
      "监管资料阅读能力"
    ],
    "recommendedKeywords": [
      "Rebyota",
      "fecal microbiota",
      "live biotherapeutic",
      "Clostridioides difficile",
      "microbiome therapy",
      "recurrent CDI"
    ],
    "linkedResearchTask": "微生物组治疗产品适用边界分析",
    "evidenceLevel": "高",
    "sourceType": "监管文件",
    "background": "FDA REBYOTA 产品页显示 REBYOTA 的 proper name 为 fecal microbiota, live-jslm，适用于 18 岁及以上人群在抗生素治疗复发性 CDI 后预防复发。FDA fecal microbiota products 页面也将其列为 FDA 批准的粪菌微生物群产品。",
    "applicationScenario": "用于微生物组治疗、感染复发预防、活体生物制品监管、供体筛查和肠道生态教学。",
    "displayFocus": "供体筛查—微生物群制备—给药—肠道生态恢复—复发风险管理流程。",
    "migrationPath": {
      "textbookBase": [
        "肠道菌群",
        "微生物竞争",
        "抗生素选择压力"
      ],
      "researchFrontier": [
        "微生物组治疗",
        "供体筛查与病原风险控制",
        "活体生物制品质控"
      ],
      "industryApplication": [
        "REBYOTA 复发性 CDI 预防",
        "粪菌微生物群产品",
        "微生态药物开发"
      ]
    },
    "references": [
      {
        "title": "FDA Product Page: REBYOTA",
        "url": "https://www.fda.gov/vaccines-blood-biologics/vaccines/rebyota",
        "type": "FDA"
      },
      {
        "title": "FDA: Fecal Microbiota Products",
        "url": "https://www.fda.gov/vaccines-blood-biologics/fecal-microbiota-products",
        "type": "FDA"
      }
    ],
    "sourceUrls": [
      "https://www.fda.gov/vaccines-blood-biologics/vaccines/rebyota",
      "https://www.fda.gov/vaccines-blood-biologics/fecal-microbiota-products"
    ]
  },
  {
    "id": "case-031",
    "title": "Bt 作物与昆虫抗性管理",
    "subtitle": "从 Bacillus thuringiensis 蛋白到农业生物技术",
    "category": "农业与动物水产生物技术",
    "realProductOrTechnology": "Bt corn / Bt cotton plant-incorporated protectants",
    "relatedKnowledgePoints": [
      "Bt 蛋白",
      "昆虫肠道受体",
      "抗性管理",
      "庇护所策略",
      "农业生态风险"
    ],
    "industryDirection": "转基因作物 / 生物防治 / 抗性治理",
    "coreProblem": "如何在利用 Bt 蛋白降低虫害压力的同时，延缓靶标害虫抗性并管理生态风险？",
    "researchFoundation": "Bt 蛋白来源于 Bacillus thuringiensis，特定 Cry 蛋白在昆虫肠道中与受体结合并影响肠道上皮完整性。产业化应用需要把分子机制、田间防效、抗性演化和生态风险放在同一证据框架下讨论。",
    "applicationValue": "补足农业生物技术方向，展示基础微生物毒素机制如何转化为作物抗虫性状。",
    "requiredAbilities": [
      "农业场景证据判断能力",
      "抗性演化分析能力",
      "生态风险讨论能力"
    ],
    "recommendedKeywords": [
      "Bt crop",
      "Bacillus thuringiensis",
      "plant-incorporated protectant",
      "resistance management"
    ],
    "linkedResearchTask": "Bt 作物抗性管理证据分析",
    "evidenceLevel": "高",
    "sourceType": "监管文件",
    "background": "美国 EPA 将 Bt 作物中的植物内置保护剂作为农业生物技术监管对象之一，可用于教学讨论转基因性状、靶标害虫控制和抗性管理边界。",
    "applicationScenario": "用于农业生物技术、转基因作物、抗性管理和生态风险教学。",
    "displayFocus": "Bt 蛋白表达—昆虫摄食—受体作用—田间防控—抗性管理流程。",
    "migrationPath": {
      "textbookBase": [
        "微生物毒素",
        "昆虫生理",
        "遗传工程"
      ],
      "researchFrontier": [
        "抗性演化监测",
        "庇护所策略",
        "生态风险评估"
      ],
      "industryApplication": [
        "Bt 玉米",
        "Bt 棉花",
        "作物抗虫性状管理"
      ]
    },
    "references": [
      {
        "title": "EPA: Plant-Incorporated Protectants",
        "url": "https://www.epa.gov/regulation-biotechnology-under-tsca-and-fifra/plant-incorporated-protectants",
        "type": "Other"
      }
    ],
    "sourceUrls": [
      "https://www.epa.gov/regulation-biotechnology-under-tsca-and-fifra/plant-incorporated-protectants"
    ]
  },
  {
    "id": "case-032",
    "title": "AquAdvantage Salmon 水产生物技术",
    "subtitle": "从生长调控基因到转基因动物食品监管",
    "category": "农业与动物水产生物技术",
    "realProductOrTechnology": "AquAdvantage Salmon",
    "relatedKnowledgePoints": [
      "生长激素调控",
      "转基因动物",
      "水产养殖",
      "食品安全评价",
      "生态隔离"
    ],
    "industryDirection": "转基因动物 / 水产养殖 / 食品监管",
    "coreProblem": "如何评价转基因水产动物的生产优势、食品安全性和生态管理边界？",
    "researchFoundation": "该案例把生长调控、转基因构建、养殖系统和监管审评连接起来。教学中应避免夸大生产表现，只基于公开监管资料讨论评价维度。",
    "applicationValue": "补足动物与水产生物技术方向，展示动物生物技术不同于医药产品的证据结构。",
    "requiredAbilities": [
      "监管资料阅读能力",
      "生态风险判断能力",
      "动物生物技术机制解释能力"
    ],
    "recommendedKeywords": [
      "AquAdvantage Salmon",
      "genetically engineered animal",
      "aquaculture biotechnology",
      "FDA"
    ],
    "linkedResearchTask": "转基因水产动物监管证据边界分析",
    "evidenceLevel": "高",
    "sourceType": "监管文件",
    "background": "FDA AquAdvantage Salmon 页面记录了该转基因三文鱼的监管背景，适合讨论动物生物技术产品如何进入食品监管和环境风险讨论。",
    "applicationScenario": "用于动物生物技术、水产育种、食品安全评价和生态风险管理教学。",
    "displayFocus": "基因构建—生长调控—养殖系统—食品评价—生态边界流程。",
    "migrationPath": {
      "textbookBase": [
        "基因表达调控",
        "动物生长生理",
        "遗传工程"
      ],
      "researchFrontier": [
        "转基因动物审评",
        "封闭养殖系统",
        "生态风险建模"
      ],
      "industryApplication": [
        "AquAdvantage Salmon",
        "水产养殖效率",
        "动物食品生物技术"
      ]
    },
    "references": [
      {
        "title": "FDA: AquAdvantage Salmon",
        "url": "https://www.fda.gov/animal-veterinary/animals-intentional-genomic-alterations/aquadvantage-salmon",
        "type": "FDA"
      }
    ],
    "sourceUrls": [
      "https://www.fda.gov/animal-veterinary/animals-intentional-genomic-alterations/aquadvantage-salmon"
    ]
  },
  {
    "id": "case-033",
    "title": "工业酶在洗涤剂中的应用",
    "subtitle": "从酶工程到低温洗涤和绿色制造",
    "category": "工业生物制造与合成生物学",
    "realProductOrTechnology": "Detergent enzymes",
    "relatedKnowledgePoints": [
      "蛋白酶",
      "淀粉酶",
      "脂肪酶",
      "酶稳定性",
      "配方兼容性"
    ],
    "industryDirection": "工业酶 / 洗涤剂 / 绿色制造",
    "coreProblem": "如何通过酶工程和配方优化，让工业酶在洗涤剂复杂环境中保持活性和稳定性？",
    "researchFoundation": "工业酶需要在表面活性剂、氧化剂、不同 pH 和温度条件下保持功能。蛋白质工程可围绕热稳定性、底物识别、抗氧化和配方兼容性进行优化。",
    "applicationValue": "补足非医药蛋白工程案例，展示酶工程在日化产业中的真实应用。",
    "requiredAbilities": [
      "酶结构功能分析能力",
      "工业条件约束建模能力",
      "绿色制造评价能力"
    ],
    "recommendedKeywords": [
      "detergent enzymes",
      "protease",
      "amylase",
      "enzyme stability",
      "protein engineering"
    ],
    "linkedResearchTask": "洗涤剂酶稳定性优化方案设计",
    "evidenceLevel": "中",
    "sourceType": "产业报告",
    "background": "Novonesis 等工业酶企业公开介绍洗涤剂酶在低温洗涤和去污中的应用，可用于讨论酶工程与消费品产业连接。",
    "applicationScenario": "用于工业酶工程、绿色制造、消费品配方和蛋白质稳定性教学。",
    "displayFocus": "底物污渍—酶催化—配方环境—稳定性优化—低温洗涤流程。",
    "migrationPath": {
      "textbookBase": [
        "酶催化",
        "蛋白质结构",
        "环境因素影响酶活"
      ],
      "researchFrontier": [
        "定向进化",
        "酶稳定性设计",
        "配方兼容性筛选"
      ],
      "industryApplication": [
        "洗涤剂酶",
        "低温洗涤",
        "绿色日化产品"
      ]
    },
    "references": [
      {
        "title": "Novonesis: Detergents solutions",
        "url": "https://www.novonesis.com/en/solutions/household-care/detergents",
        "type": "Other"
      }
    ],
    "sourceUrls": [
      "https://www.novonesis.com/en/solutions/household-care/detergents"
    ]
  },
  {
    "id": "case-034",
    "title": "废水监测与公共卫生预警",
    "subtitle": "从环境样本到群体感染趋势判断",
    "category": "环境与海洋生物技术",
    "realProductOrTechnology": "Wastewater-based disease surveillance",
    "relatedKnowledgePoints": [
      "qPCR",
      "环境样本",
      "病毒 RNA",
      "群体监测",
      "公共卫生预警"
    ],
    "industryDirection": "废水流行病学 / 分子检测 / 公共卫生监测",
    "coreProblem": "如何从复杂废水样本中的核酸信号推断社区层面的病原体传播趋势？",
    "researchFoundation": "废水样本包含来自社区的混合生物信号，需要采样、浓缩、核酸提取、定量检测和趋势解释。教学中应强调它反映群体趋势，不等同于个体诊断。",
    "applicationValue": "补足环境生物技术案例，展示分子检测从临床走向社区尺度监测。",
    "requiredAbilities": [
      "环境样本分析能力",
      "检测数据解释能力",
      "公共卫生证据边界判断能力"
    ],
    "recommendedKeywords": [
      "wastewater surveillance",
      "qPCR",
      "SARS-CoV-2",
      "public health",
      "environmental monitoring"
    ],
    "linkedResearchTask": "废水监测数据证据边界分析",
    "evidenceLevel": "高",
    "sourceType": "监管文件",
    "background": "CDC National Wastewater Surveillance System 公开介绍废水监测在公共卫生中的用途，适合讨论环境生物技术和分子检测的真实场景。",
    "applicationScenario": "用于环境生物监测、感染趋势预警、分子检测和公共卫生数据解释教学。",
    "displayFocus": "采样—浓缩—核酸检测—趋势分析—公共卫生响应流程。",
    "migrationPath": {
      "textbookBase": [
        "核酸检测",
        "环境微生物",
        "流行病学"
      ],
      "researchFrontier": [
        "废水流行病学",
        "病原体趋势监测",
        "多靶标检测"
      ],
      "industryApplication": [
        "城市废水监测",
        "公共卫生预警",
        "环境检测服务"
      ]
    },
    "references": [
      {
        "title": "CDC: National Wastewater Surveillance System",
        "url": "https://www.cdc.gov/nwss/",
        "type": "Other"
      }
    ],
    "sourceUrls": [
      "https://www.cdc.gov/nwss/"
    ]
  },
  {
    "id": "case-035",
    "title": "AlphaFold DB 蛋白结构智能研发平台",
    "subtitle": "从蛋白质结构预测到研发工具平台",
    "category": "蛋白质工程与智能研发平台",
    "realProductOrTechnology": "AlphaFold Protein Structure Database",
    "relatedKnowledgePoints": [
      "蛋白质结构",
      "深度学习",
      "结构数据库",
      "置信度",
      "功能假设"
    ],
    "industryDirection": "AI 蛋白结构预测 / 数据库 / 智能研发",
    "coreProblem": "如何把 AI 预测蛋白结构用于科研假设生成，同时识别预测结果的适用边界？",
    "researchFoundation": "结构预测可以帮助提出结构功能假设、定位保守区域和辅助实验设计，但预测结构不等同于实验测定结构，仍需要结合置信度、复合物状态和功能实验解释。",
    "applicationValue": "补足智能研发平台方向，展示 AI 与结构生物学结合的研发入口。",
    "requiredAbilities": [
      "结构数据解读能力",
      "AI 工具边界判断能力",
      "科研假设生成能力"
    ],
    "recommendedKeywords": [
      "AlphaFold",
      "protein structure prediction",
      "EMBL-EBI",
      "pLDDT",
      "bioinformatics"
    ],
    "linkedResearchTask": "AlphaFold 结构预测结果边界分析",
    "evidenceLevel": "高",
    "sourceType": "产业报告",
    "background": "AlphaFold Protein Structure Database 由 EMBL-EBI 等公开维护，提供大量蛋白结构预测结果，适合讨论 AI 工具如何辅助生物研发。",
    "applicationScenario": "用于生物信息学、蛋白质工程、药物研发前期分析和科研工具平台教学。",
    "displayFocus": "序列输入—结构预测—置信度阅读—功能假设—实验验证流程。",
    "migrationPath": {
      "textbookBase": [
        "蛋白质一级结构",
        "三维结构",
        "结构功能关系"
      ],
      "researchFrontier": [
        "深度学习结构预测",
        "结构数据库",
        "蛋白设计辅助"
      ],
      "industryApplication": [
        "AlphaFold DB",
        "药物研发前期分析",
        "蛋白工程靶点筛选"
      ]
    },
    "references": [
      {
        "title": "AlphaFold Protein Structure Database",
        "url": "https://alphafold.ebi.ac.uk/",
        "type": "Other"
      }
    ],
    "sourceUrls": [
      "https://alphafold.ebi.ac.uk/"
    ]
  },
  {
    "id": "case-036",
    "title": "UPSIDE Foods 培养细胞食品",
    "subtitle": "从动物细胞培养到新型食品安全评价",
    "category": "食品发酵与营养健康",
    "realProductOrTechnology": "Cultured chicken cell material",
    "relatedKnowledgePoints": [
      "动物细胞培养",
      "培养基",
      "食品安全评价",
      "规模化生产",
      "替代蛋白"
    ],
    "industryDirection": "细胞培养食品 / 新食品评价 / 替代蛋白",
    "coreProblem": "如何评价由培养动物细胞制成食品原料的生产过程、安全性和产业化边界？",
    "researchFoundation": "培养细胞食品涉及细胞系、培养基、扩增、收获和食品安全评价。教学中应区分“可作为食品安全咨询案例”与具体营养、成本或市场表现结论。",
    "applicationValue": "补足食品生物技术方向，展示细胞培养技术从生物医学工具走向食品产业的证据结构。",
    "requiredAbilities": [
      "细胞培养流程分析能力",
      "食品安全资料阅读能力",
      "产业化边界判断能力"
    ],
    "recommendedKeywords": [
      "cultivated meat",
      "cultured cells",
      "UPSIDE Foods",
      "food safety",
      "alternative protein"
    ],
    "linkedResearchTask": "培养细胞食品安全评价路径分析",
    "evidenceLevel": "高",
    "sourceType": "监管文件",
    "background": "FDA 完成 UPSIDE Foods 培养鸡细胞材料上市前咨询，公开资料可用于讨论培养细胞食品的安全评价和边界。",
    "applicationScenario": "用于新食品、细胞培养、替代蛋白、食品安全评价和产业化放大教学。",
    "displayFocus": "细胞系—培养扩增—收获加工—安全评价—食品应用流程。",
    "migrationPath": {
      "textbookBase": [
        "动物细胞培养",
        "培养基",
        "食品安全"
      ],
      "researchFrontier": [
        "细胞农业",
        "规模化培养",
        "新食品评价"
      ],
      "industryApplication": [
        "培养鸡细胞材料",
        "替代蛋白食品",
        "新食品产业化"
      ]
    },
    "references": [
      {
        "title": "FDA: Human Food Made with Cultured Animal Cells",
        "url": "https://www.fda.gov/food/food-ingredients-packaging/human-food-made-cultured-animal-cells",
        "type": "FDA"
      }
    ],
    "sourceUrls": [
      "https://www.fda.gov/food/food-ingredients-packaging/human-food-made-cultured-animal-cells"
    ]
  }
];

export const industryDirections: IndustryDirection[] = [
  { id: "drug-rnd", name: "药物研发", description: "靶点发现、先导化合物优化到临床前研究" },
  { id: "cell-therapy", name: "细胞治疗", description: "CAR-T、干细胞治疗与基因修饰细胞" },
  { id: "enzyme-eng", name: "酶工程", description: "工业酶设计、定向进化与催化优化" },
  { id: "synbio-mfg", name: "合成生物制造", description: "代谢通路设计与高价值产物生物合成" },
  { id: "mol-dx", name: "分子诊断", description: "液体活检、NGS检测与精准诊断" },
  { id: "vaccine-rnd", name: "疫苗研发", description: "抗原设计、递送系统与免疫评估" },
  { id: "ferment-eng", name: "发酵工程", description: "工业发酵过程优化与放大" },
  { id: "biopharma", name: "生物制药", description: "重组蛋白、抗体药物与生物类似药" },
];

export const abilityMappings: AbilityMapping[] = [
  { id: "lit-search", name: "文献检索能力", description: "高效检索PubMed、Web of Science等数据库，筛选高质量文献证据", progress: 75 },
  { id: "mech-explain", name: "机制解释能力", description: "从分子层面解释生物学现象，建立因果机制链条", progress: 68 },
  { id: "exp-design", name: "实验设计能力", description: "设计合理的对照实验，选择适当的检测方法和技术路线", progress: 72 },
  { id: "data-analysis", name: "数据分析能力", description: "处理高通量数据，进行统计分析和可视化呈现", progress: 65 },
  { id: "evidence-judge", name: "证据判断能力", description: "评估文献证据等级，识别研究局限性与偏倚风险", progress: 70 },
  { id: "industry-transfer", name: "产业迁移能力", description: "将基础研究发现转化为产业应用场景，理解技术转化路径", progress: 60 },
];

export const knowledgeTripleMap = {
  basic: [
    "细胞凋亡与caspase家族",
    "线粒体途径与信号转导",
    "基因表达调控",
    "蛋白质结构与酶动力学",
    "代谢通路与免疫应答",
  ],
  frontier: [
    "肿瘤耐药与免疫检查点治疗",
    "基因编辑精准修复",
    "酶定向进化与合成基因回路",
    "液体活检与mRNA疫苗平台",
    "蛋白质理性设计与单细胞组学",
  ],
  application: [
    "抗肿瘤药物筛选与CAR-T制备",
    "工业酶制剂与高价值产物合成",
    "肿瘤早筛试剂盒开发",
    "广谱疫苗与发酵工艺放大",
    "分子诊断POCT与基因治疗",
  ],
};

const quickTags = [
  "细胞凋亡",
  "CRISPR",
  "蛋白质工程",
  "合成生物学",
  "分子诊断",
  "细胞治疗",
  "酶工程",
];

function buildMockAnswer(query: string): IndustryAnswer {
  const lower = query.toLowerCase();

  if (lower.includes("凋亡") || lower.includes("apoptosis")) {
    return {
      query,
      relatedKnowledgePoints: ["细胞凋亡通路", "caspase家族蛋白酶", "线粒体外膜通透化（MOMP）", "Bcl-2家族蛋白调控", "p53介导的凋亡信号"],
      researchFrontiers: ["肿瘤选择性凋亡诱导策略", "凋亡与免疫原性细胞死亡（ICD）的交叉", "BH3 profiling指导精准用药", "凋亡抵抗机制与耐药逆转", "坏死性凋亡与焦亡的调控网络"],
      industryApplications: ["BCL-2抑制剂（Venetoclax）用于血液肿瘤", "IAP拮抗剂（SMAC mimetics）临床试验", "基于凋亡标志物的伴随诊断试剂开发", "凋亡成像探针用于药效评估"],
      abilityDirections: ["机制解释能力", "实验设计能力", "证据判断能力"],
      recommendedKeywords: ["apoptosis", "BH3 mimetics", "MOMP", "caspase activation", "venetoclax", "drug resistance", "BH3 profiling"],
      researchTasks: ["BH3 profiling实验设计与数据分析", "凋亡通路文献系统回顾", "凋亡诱导药物筛选方案设计"],
    };
  }

  if (lower.includes("crispr") || lower.includes("基因编辑")) {
    return {
      query,
      relatedKnowledgePoints: ["CRISPR-Cas9系统结构", "sgRNA设计与PAM序列", "DNA双链断裂修复（NHEJ/HDR）", "碱基编辑器与先导编辑", "脱靶效应与安全性评估"],
      researchFrontiers: ["先导编辑（Prime Editing）精准修复", "表观基因组编辑（CRISPRoff/on）", "CRISPR筛选用于功能基因组学", "体内递送系统（LNP/AAV）优化", "CRISPR诊断（SHERLOCK/DETECTR）"],
      industryApplications: ["CRISPR编辑CAR-T（CTX001等）", "体内基因编辑治疗（Intellia NTLA-2001）", "农业基因编辑育种", "CRISPR诊断试剂盒"],
      abilityDirections: ["文献检索能力", "实验设计能力", "证据判断能力"],
      recommendedKeywords: ["CRISPR-Cas9", "sgRNA design", "HDR", "prime editing", "off-target", "gene therapy", "base editor"],
      researchTasks: ["sgRNA靶点设计与脱靶预测", "CRISPR筛选数据分析", "基因编辑效率评估方法比较"],
    };
  }

  if (lower.includes("蛋白质") || lower.includes("酶") || lower.includes("protein")) {
    return {
      query,
      relatedKnowledgePoints: ["蛋白质一级到四级结构", "酶动力学（Km, kcat, Vmax）", "蛋白质折叠热力学", "活性位点与催化机制", "翻译后修饰"],
      researchFrontiers: ["AI驱动蛋白质设计（AlphaFold/RFdiffusion）", "非天然氨基酸引入与功能拓展", "多酶级联催化系统", "无细胞蛋白合成系统", "蛋白质相分离与功能调控"],
      industryApplications: ["工业酶制剂（洗涤剂/纺织/食品）", "固定化酶催化手性药物合成", "蛋白类药物设计与优化", "诊断用酶开发"],
      abilityDirections: ["机制解释能力", "数据分析能力", "产业迁移能力"],
      recommendedKeywords: ["protein engineering", "directed evolution", "enzyme kinetics", "AlphaFold", "catalytic mechanism", "thermostability"],
      researchTasks: ["酶热稳定性突变设计与活性预测", "同源建模与分子对接分析", "定向进化文库设计与筛选策略"],
    };
  }

  if (lower.includes("合成生物学") || lower.includes("synbio")) {
    return {
      query,
      relatedKnowledgePoints: ["中心法则与基因表达调控", "操纵子模型与转录调控", "代谢通路与限速酶", "质粒与基因表达载体", "底盘微生物生理学"],
      researchFrontiers: ["基因回路设计与正交化", "无细胞合成生物学", "人工染色体与最小基因组", "机器学习辅助代谢通路优化", "合成微生物群落"],
      industryApplications: ["微生物合成天然产物（青蒿素/大麻素）", "合成生物材料（PHA/蛛丝蛋白）", "生物燃料与绿色化学品", "合成细胞传感器"],
      abilityDirections: ["实验设计能力", "数据分析能力", "产业迁移能力"],
      recommendedKeywords: ["synthetic biology", "DBTL cycle", "metabolic engineering", "genome-scale model", "biosensor", "cell factory"],
      researchTasks: ["代谢通路瓶颈分析与靶点预测", "启动子文库构建策略设计", "基因组规模代谢模型（GEM）应用"],
    };
  }

  if (lower.includes("分子诊断") || lower.includes("诊断")) {
    return {
      query,
      relatedKnowledgePoints: ["核酸分子杂交原理", "PCR与qPCR技术", "NGS测序技术流程", "生物标志物概念与分类", "探针设计与信号放大"],
      researchFrontiers: ["单分子测序与甲基化检测", "外泌体与液体活检新技术", "CRISPR诊断平台", "多组学联合诊断", "AI辅助影像与分子诊断融合"],
      industryApplications: ["肿瘤早筛（ctDNA甲基化）", "伴随诊断（CDx）试剂开发", "感染性疾病快速诊断", "无创产前筛查（NIPT）"],
      abilityDirections: ["文献检索能力", "证据判断能力", "数据分析能力"],
      recommendedKeywords: ["liquid biopsy", "ctDNA", "NGS", "digital PCR", "biomarker", "companion diagnostics", "early detection"],
      researchTasks: ["肿瘤突变负荷（TMB）计算方法评估", "液体活检灵敏度与特异性分析", "NGS数据分析流程搭建"],
    };
  }

  if (lower.includes("细胞治疗") || lower.includes("car-t")) {
    return {
      query,
      relatedKnowledgePoints: ["T细胞受体结构与信号", "免疫突触形成", "CAR结构域设计", "细胞因子信号通路", "免疫排斥与GVHD"],
      researchFrontiers: ["通用型CAR-T（UCAR-T）", "CAR-NK与CAR-M", "体内CAR-T生成技术", "合成生物学调控开关", "实体瘤CAR-T突破"],
      industryApplications: ["CD19 CAR-T（Kymriah/Yescarta）上市", "BCMA CAR-T治疗多发性骨髓瘤", "TCR-T个性化治疗实体瘤", "CAR-T自动化生产设备"],
      abilityDirections: ["机制解释能力", "实验设计能力", "证据判断能力"],
      recommendedKeywords: ["CAR-T", "immunotherapy", "chimeric antigen receptor", "cytokine release syndrome", "solid tumor", "allogeneic"],
      researchTasks: ["CAR结构域功能分析与优化", "CAR-T杀伤活性评估实验设计", "免疫治疗耐药机制文献综述"],
    };
  }

  return {
    query,
    relatedKnowledgePoints: ["分子生物学中心法则", "信号转导通路", "基因表达调控", "蛋白质结构与功能", "代谢与能量转换"],
    researchFrontiers: ["多组学整合分析", "AI驱动的生物学发现", "单细胞技术前沿", "基因编辑新工具", "合成生物学新范式"],
    industryApplications: ["精准医疗诊断与治疗", "生物制造与绿色化学", "创新药物研发管线", "农业生物技术改良"],
    abilityDirections: ["文献检索能力", "机制解释能力", "产业迁移能力"],
    recommendedKeywords: ["life sciences", "biomanufacturing", "drug discovery", "precision medicine", "biotechnology"],
    researchTasks: ["科研文献检索与系统综述", "实验方案设计与可行性评估", "产业技术路线图分析"],
  };
}

export function getMockAnswer(query: string): IndustryAnswer {
  const answer = buildMockAnswer(query.trim());

  const lower = query.toLowerCase();
  const matched: MatchCase[] = industryCases
    .filter((c) => {
      return (
        c.title.toLowerCase().includes(lower) ||
        c.industryDirection.toLowerCase().includes(lower) ||
        c.relatedKnowledgePoints.some((k) => k.toLowerCase().includes(lower)) ||
        c.recommendedKeywords.some((k) => k.toLowerCase().includes(lower))
      );
    })
    .slice(0, 3)
    .map((c) => ({
      id: c.id,
      title: c.title,
      reason: `匹配相关知识点：${c.relatedKnowledgePoints.slice(0, 2).join("、")}`,
    }));

  const structuredAnswer = [
    `核心问题：围绕「${query}」，先明确它对应的生命科学机制、可验证假设和可能的产业应用场景。`,
    `背景分析：可从${answer.relatedKnowledgePoints.slice(0, 3).join("、") || "相关基础知识"}入手，连接到${answer.industryApplications.slice(0, 2).join("、") || "真实产业应用"}。`,
    `相关知识点：${answer.relatedKnowledgePoints.slice(0, 5).join("、") || "分子机制、实验设计、证据判断和产业转化路径"}。`,
    `推荐下一步：优先阅读匹配案例，整理关键词，再进入科研实战生成训练任务。`,
  ].join(" ");

  return {
    ...answer,
    answer: structuredAnswer,
    matchedCases: matched,
    requiredAbilities: answer.abilityDirections,
    nextTasks: answer.researchTasks,
    sourceScope: matched.length > 0 ? "based_on_local_cases" : "extended_reasoning",
    disclaimer: "本回答基于当前产业案例库自动生成，用于课程学习和科研训练，不构成医疗或临床建议。",
  };
}
