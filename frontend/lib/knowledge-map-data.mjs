export const featuredDisciplineIds = [
  "molecular-biology",
  "cell-biology",
  "structural-biology",
  "synthetic-biology",
  "bioinformatics",
];

export const knowledgeDimensions = [
  { id: "bio-category", label: "生物大类", accent: "#2563eb", short: "分类" },
  { id: "fundamentals", label: "基础知识", accent: "#0ea5e9", short: "基础" },
  { id: "frontier", label: "科研前沿", accent: "#8b5cf6", short: "前沿" },
  { id: "industry", label: "产业应用", accent: "#f59e0b", short: "应用" },
  { id: "literature", label: "代表文献", accent: "#10b981", short: "文献" },
  { id: "tasks", label: "学习任务", accent: "#e11d48", short: "任务" },
];

const links = {
  explore: { label: "进入知识探索", href: "/explore" },
  research: { label: "进入科研实战", href: "/research" },
  cases: { label: "查看产业案例", href: "/cases" },
  seminar: { label: "进入学术研讨", href: "/seminar" },
  protein: { label: "打开蛋白结构工具", href: "/tools/protein" },
  plasmid: { label: "打开质粒图谱工具", href: "/tools/plasmid" },
  sequence: { label: "打开序列分析工具", href: "/tools/sequence" },
  pathway: { label: "打开通路图谱工具", href: "/tools/pathway" },
};

function node(id, label, summary, keyPoints, importance, nextStep, moduleLinks = []) {
  return {
    id,
    label,
    summary,
    keyPoints,
    importance,
    nextStep,
    moduleLinks,
  };
}

function dimension(id, children) {
  const meta = knowledgeDimensions.find((item) => item.id === id);
  return {
    ...meta,
    summary: `${meta.label}帮助你从不同角度理解当前学科。`,
    children,
  };
}

function discipline({
  id,
  label,
  group,
  summary,
  featured = false,
  color,
  x,
  y,
  related,
  dimensions,
}) {
  return {
    id,
    label,
    group,
    summary,
    featured,
    color,
    x,
    y,
    related,
    dimensions,
  };
}

export const knowledgeDisciplines = [
  discipline({
    id: "molecular-biology",
    label: "分子生物学",
    group: "核心基础",
    color: "#2563eb",
    x: 46,
    y: 44,
    featured: true,
    related: ["genomics", "biochemistry", "synthetic-biology", "structural-biology", "cell-biology"],
    summary: "研究遗传信息如何在 DNA、RNA 与蛋白质之间传递、表达和调控。",
    dimensions: [
      dimension("bio-category", [
        node("genetic-information", "遗传信息", "理解遗传信息如何编码生命过程。", ["DNA 序列", "基因", "遗传密码"], "这是理解表达、突变与工程改造的入口。", "继续学习中心法则。", [links.explore, links.sequence]),
        node("gene-expression", "基因表达", "关注基因如何被转录、翻译并形成可执行功能。", ["转录", "翻译", "表达水平"], "连接分子机制与细胞表型。", "观察启动子和表达载体。", [links.plasmid]),
        node("molecular-regulation", "分子调控", "解释细胞如何通过调控元件控制信息流。", ["启动子", "转录因子", "表观遗传"], "决定同一基因在不同环境下的表达差异。", "进入基因表达调控节点。", [links.research]),
      ]),
      dimension("fundamentals", [
        node("dna", "DNA", "DNA 是遗传信息的主要载体，由碱基序列编码可遗传信息。", ["双螺旋", "互补配对", "复制"], "后续序列分析、克隆和基因编辑都从 DNA 开始。", "使用序列分析工具检查一段 DNA。", [links.sequence]),
        node("rna", "RNA", "RNA 连接基因信息与蛋白表达，也参与调控和催化。", ["mRNA", "tRNA", "rRNA", "非编码 RNA"], "RNA 是理解转录、翻译和 RNA 疗法的关键。", "比较 DNA 转录为 RNA 的变化。", [links.sequence]),
        node("protein-basic", "蛋白质", "蛋白质执行催化、结构、运输和信号等生命功能。", ["氨基酸", "折叠", "功能域"], "分子生物学最终常落到蛋白功能解释。", "查看一个蛋白质三维结构。", [links.protein]),
        node("central-dogma", "中心法则", "遗传信息通常从 DNA 流向 RNA，再流向蛋白质。", ["复制", "转录", "翻译"], "它是分子生物学最核心的信息流框架。", "用自己的话画出信息流。", [links.explore]),
      ]),
      dimension("frontier", [
        node("single-cell-omics", "单细胞组学", "在单细胞尺度解析基因表达和细胞异质性。", ["scRNA-seq", "细胞亚群", "轨迹分析"], "帮助研究复杂组织中不同细胞状态。", "思考单细胞数据如何回答机制问题。", [links.research, links.seminar]),
        node("epigenetic-control", "表观遗传调控", "研究不改变 DNA 序列却改变表达状态的调控。", ["甲基化", "组蛋白修饰", "染色质"], "解释同一基因组如何产生不同细胞类型。", "对比遗传突变与表观调控。", [links.research]),
        node("rna-therapy", "RNA 疗法", "利用 mRNA、siRNA 等分子进行治疗干预。", ["mRNA 疫苗", "siRNA", "递送系统"], "体现分子机制向医学产业的转化。", "连接产业应用中的分子诊断。", [links.cases]),
        node("crispr-editing", "CRISPR 基因编辑", "通过向导 RNA 和 Cas 蛋白实现靶向编辑。", ["sgRNA", "Cas9", "PAM"], "把分子识别转化为可设计的基因操作。", "查看 Cas9 结构或设计编辑任务。", [links.protein, links.research]),
      ]),
      dimension("industry", [
        node("molecular-diagnostics", "分子诊断", "通过核酸或蛋白标志物检测疾病和生物状态。", ["PCR", "测序", "探针"], "是基础分子机制最直接的产业落地。", "分析一个检测方案需要哪些序列信息。", [links.sequence, links.cases]),
        node("gene-testing", "基因检测", "利用测序和变异分析评估遗传风险或分型。", ["变异", "panel", "报告解读"], "连接遗传学、医学和数据分析。", "进入生物信息学学习路径。", [links.cases]),
        node("drug-target", "药物靶点发现", "从分子通路和表达差异中寻找可干预靶点。", ["靶点", "通路", "验证"], "是科研前沿与药物产业之间的桥梁。", "学习通路调控与结构生物学。", [links.pathway, links.research]),
        node("bio-manufacturing", "生物制造", "利用分子调控和工程菌生产目标产物。", ["表达系统", "细胞工厂", "发酵"], "体现分子生物学向工程应用的延伸。", "进入合成生物学分支。", [links.plasmid, links.cases]),
      ]),
      dimension("literature", [
        node("dna-helix-paper", "DNA 双螺旋经典论文", "理解 DNA 结构如何解释复制和遗传。", ["结构模型", "互补配对", "遗传机制"], "经典结构发现塑造了现代分子生物学。", "阅读时关注模型如何支撑机制。", [links.seminar]),
        node("central-dogma-literature", "中心法则相关文献", "追溯信息流概念的提出和发展。", ["DNA", "RNA", "蛋白质"], "帮助形成分子机制的整体框架。", "尝试用图表达论文观点。", [links.seminar]),
        node("crispr-review", "CRISPR 技术综述", "梳理 CRISPR 从发现到工程化应用的路径。", ["基因编辑", "脱靶", "递送"], "适合连接基础概念和前沿应用。", "比较不同编辑技术。", [links.research, links.seminar]),
      ]),
      dimension("tasks", [
        node("task-explain-dogma", "解释中心法则", "用一张图说明 DNA、RNA、蛋白质之间的信息流。", ["概念表达", "机制连接"], "训练把零散概念组织成框架。", "完成后尝试加入调控节点。", [links.explore]),
        node("task-sequence-analysis", "分析一段 DNA 序列", "检查 GC 含量、ORF 和酶切位点。", ["GC%", "ORF", "酶切位点"], "把基础知识转化为可操作分析。", "打开序列分析工具。", [links.sequence]),
        node("task-protein-query", "查询一个蛋白结构", "从序列或蛋白名称进入结构观察。", ["结构域", "活性位点", "功能"], "连接分子信息与三维功能。", "打开蛋白结构工具。", [links.protein]),
        node("task-expression-design", "设计表达实验", "选择启动子、载体和检测方式。", ["表达载体", "诱导", "验证"], "训练从知识走向实验设计。", "进入科研实战模块。", [links.plasmid, links.research]),
      ]),
    ],
  }),
  discipline({
    id: "cell-biology",
    label: "细胞生物学",
    group: "核心基础",
    color: "#0ea5e9",
    x: 54,
    y: 34,
    featured: true,
    related: ["molecular-biology", "immunology", "developmental-biology", "neuroscience", "bioinformatics"],
    summary: "研究细胞结构、细胞器、信号通路、周期和命运决定。",
    dimensions: [
      dimension("bio-category", [
        node("cell-structure", "细胞结构", "从细胞膜、细胞核到细胞器理解细胞组织方式。", ["细胞膜", "细胞核", "细胞器"], "结构是理解功能和疾病的基础。", "继续学习细胞器分工。", [links.explore]),
        node("cell-signaling", "细胞信号", "细胞通过受体和通路感知环境并响应。", ["受体", "磷酸化", "级联反应"], "连接外部刺激与基因表达、代谢和命运。", "查看通路图谱。", [links.pathway]),
        node("cell-fate", "细胞命运", "细胞可以增殖、分化、衰老或死亡。", ["分化", "凋亡", "细胞周期"], "解释发育、免疫和肿瘤等现象。", "展开细胞周期节点。", [links.pathway]),
      ]),
      dimension("fundamentals", [
        node("membrane", "细胞膜", "细胞膜隔离内外环境并承担转运和信号接收。", ["磷脂双层", "膜蛋白", "转运"], "是信号通路和药物作用的入口之一。", "比较不同跨膜受体。", [links.explore]),
        node("organelle", "细胞器", "细胞器分工完成能量、合成、降解等过程。", ["线粒体", "内质网", "高尔基体"], "帮助理解细胞功能的空间组织。", "分析线粒体与凋亡关系。", [links.pathway]),
        node("cell-cycle", "细胞周期", "细胞周期由 Cyclin/CDK 和检查点控制。", ["G1/S", "Cyclin", "CDK", "p53"], "是癌症、发育和 DNA 损伤响应的重要框架。", "打开细胞周期通路。", [links.pathway]),
        node("apoptosis", "细胞凋亡", "凋亡是受控的程序性细胞死亡。", ["Caspase", "Bax", "Bcl-2"], "帮助理解组织稳态和疾病发生。", "比较凋亡与坏死。", [links.pathway]),
      ]),
      dimension("frontier", [
        node("organoid", "类器官", "用体外培养模拟组织结构与功能。", ["干细胞", "三维培养", "疾病模型"], "是药物筛选和个体化医学的重要模型。", "思考类器官能回答什么问题。", [links.research, links.cases]),
        node("spatial-omics", "空间组学", "在组织空间中解析细胞类型和分子表达。", ["空间转录组", "组织结构", "细胞邻域"], "弥补传统组学丢失空间信息的问题。", "连接生物信息学分支。", [links.research]),
        node("live-cell-imaging", "活细胞成像", "动态观察细胞过程和分子行为。", ["荧光标记", "时间序列", "动态过程"], "把静态结构变成可观察的生命过程。", "设计一个成像观察任务。", [links.research]),
      ]),
      dimension("industry", [
        node("cell-therapy", "细胞治疗", "利用改造或扩增细胞治疗疾病。", ["CAR-T", "干细胞", "质量控制"], "细胞生物学直接进入临床转化。", "查看产业案例。", [links.cases]),
        node("drug-screening", "药物筛选", "利用细胞模型评估药物效果和毒性。", ["表型筛选", "高通量", "毒性"], "连接细胞模型、成像和数据分析。", "进入科研实战设计筛选流程。", [links.research]),
        node("cell-culture-bioprocess", "细胞培养工艺", "通过培养条件控制细胞生长和产物表达。", ["培养基", "反应器", "质控"], "支撑疫苗、抗体和细胞产品生产。", "查看产业应用案例。", [links.cases]),
      ]),
      dimension("literature", [
        node("cell-cycle-literature", "细胞周期经典研究", "理解检查点和周期调控的关键证据。", ["Cyclin", "CDK", "检查点"], "经典研究帮助建立调控网络思维。", "阅读时关注实验如何证明因果关系。", [links.seminar]),
        node("apoptosis-literature", "凋亡机制文献", "梳理 Caspase 和线粒体途径的发现。", ["Caspase", "线粒体", "死亡信号"], "适合理解细胞命运调控。", "尝试画出凋亡通路。", [links.pathway, links.seminar]),
        node("organoid-review", "类器官综述", "总结类器官模型的构建、应用和局限。", ["模型", "疾病", "药筛"], "帮助理解前沿模型如何服务产业。", "连接产业应用节点。", [links.cases]),
      ]),
      dimension("tasks", [
        node("task-cell-cycle-map", "绘制细胞周期检查点", "画出 DNA 损伤后 p53-p21 如何影响 G1/S。", ["p53", "p21", "CDK"], "训练通路因果链分析。", "打开通路工具。", [links.pathway]),
        node("task-apoptosis-compare", "比较凋亡与坏死", "从机制、形态和生理意义对比两种死亡方式。", ["Caspase", "炎症", "膜完整性"], "建立细胞命运分类能力。", "进入知识探索。", [links.explore]),
        node("task-cell-experiment", "设计细胞实验", "为一个药物处理实验设计对照、指标和结果解释。", ["对照", "读数", "重复"], "训练科研设计能力。", "进入科研实战。", [links.research]),
      ]),
    ],
  }),
  discipline({
    id: "genomics",
    label: "遗传学与基因组学",
    group: "核心基础",
    color: "#6366f1",
    x: 40,
    y: 58,
    related: ["molecular-biology", "bioinformatics", "ecology-evolution", "synthetic-biology"],
    summary: "研究遗传变异、基因组结构、遗传规律和群体差异。",
    dimensions: standardDimensions({
      categories: ["经典遗传", "基因组结构", "群体遗传"],
      fundamentals: ["孟德尔遗传", "突变与变异", "连锁与重组"],
      frontier: ["长读长测序", "泛基因组", "单细胞基因组"],
      industry: ["遗传筛查", "精准医疗", "育种设计"],
      literature: ["孟德尔遗传经典", "人类基因组计划", "GWAS 综述"],
      tasks: ["解释遗传分离比", "标注一个变异", "解读基因检测报告"],
    }, [links.sequence, links.research, links.cases]),
  }),
  discipline({
    id: "biochemistry",
    label: "生物化学",
    group: "核心基础",
    color: "#0891b2",
    x: 57,
    y: 57,
    related: ["molecular-biology", "structural-biology", "microbiology", "synthetic-biology"],
    summary: "研究生命分子的结构、代谢反应、酶催化和能量转换。",
    dimensions: standardDimensions({
      categories: ["生物分子", "代谢网络", "酶与能量"],
      fundamentals: ["氨基酸", "酶动力学", "糖酵解", "ATP"],
      frontier: ["代谢组学", "酶工程", "化学生物学"],
      industry: ["酶催化", "发酵生产", "代谢工程"],
      literature: ["酶动力学经典", "代谢通路综述", "酶工程论文"],
      tasks: ["计算酶反应趋势", "解释代谢瓶颈", "设计酶催化应用"],
    }, [links.protein, links.pathway, links.cases]),
  }),
  discipline({
    id: "structural-biology",
    label: "结构生物学",
    group: "结构与数据",
    color: "#7c3aed",
    x: 65,
    y: 48,
    featured: true,
    related: ["biochemistry", "molecular-biology", "bioinformatics", "synthetic-biology"],
    summary: "从三维结构理解蛋白质、核酸和复合物的功能机制。",
    dimensions: [
      dimension("bio-category", [
        node("protein-structure-category", "蛋白质结构", "研究蛋白质如何折叠并形成特定功能。", ["折叠", "结构域", "活性位点"], "蛋白结构直接决定功能与药物结合。", "进入基础结构层级。", [links.protein]),
        node("nucleic-acid-structure", "核酸结构", "关注 DNA/RNA 的空间构象和相互作用。", ["双螺旋", "RNA 结构", "复合物"], "帮助理解调控、识别和编辑。", "连接分子生物学。", [links.sequence]),
        node("macromolecular-complex", "大分子复合物", "研究蛋白、核酸或小分子的组装体系。", ["复合物", "相互作用", "构象"], "许多生命功能由复合物而非单个分子完成。", "观察一个复合物结构。", [links.protein]),
      ]),
      dimension("fundamentals", [
        node("primary-structure", "一级结构", "氨基酸序列是蛋白结构和功能的基础。", ["氨基酸", "序列", "突变"], "序列变化可能改变折叠和功能。", "对比突变前后序列。", [links.sequence, links.protein]),
        node("secondary-structure", "二级结构", "α 螺旋、β 折叠和 loop 构成局部结构。", ["α helix", "β sheet", "loop"], "帮助识别蛋白局部稳定结构。", "在结构工具中观察二级结构。", [links.protein]),
        node("tertiary-structure", "三级结构", "描述整条多肽链的空间折叠。", ["疏水核心", "构象", "折叠"], "三级结构决定结合、催化与稳定性。", "查看 GFP 或 Cas9 结构。", [links.protein]),
        node("active-site", "活性位点", "直接参与底物结合或催化的区域。", ["底物", "催化残基", "保守性"], "是解释酶功能和药物设计的关键。", "尝试识别活性位点。", [links.protein]),
      ]),
      dimension("frontier", [
        node("alphafold", "AlphaFold", "利用深度学习预测蛋白质三维结构。", ["蛋白结构预测", "深度学习", "结构生物学前沿"], "它显著降低了获得结构假设的门槛，但仍需要实验验证。", "打开蛋白结构工具观察结构。", [links.protein, links.research]),
        node("cryo-em", "冷冻电镜", "在低温下解析大分子复合物结构。", ["单颗粒", "分辨率", "复合物"], "适合研究传统晶体学难以处理的大体系。", "比较冷冻电镜和晶体学。", [links.seminar]),
        node("protein-design-ai", "AI 蛋白设计", "用计算模型设计新结构或新功能蛋白。", ["生成模型", "功能设计", "稳定性"], "连接结构生物学和合成生物学产业应用。", "进入合成生物学分支。", [links.protein, links.research]),
        node("dynamic-conformation", "动态构象", "研究分子在不同状态之间的构象变化。", ["构象变化", "分子动力学", "功能状态"], "静态结构不足以解释所有功能。", "思考构象变化如何影响活性。", [links.research]),
      ]),
      dimension("industry", [
        node("structure-drug-discovery", "结构辅助药物发现", "利用结构信息设计或优化小分子药物。", ["结合口袋", "虚拟筛选", "亲和力"], "是结构生物学最重要的产业出口之一。", "结合产业案例理解靶点设计。", [links.cases, links.protein]),
        node("enzyme-engineering", "酶工程", "通过结构和突变优化酶性能。", ["活性位点", "稳定性", "定向进化"], "支撑绿色制造和生物催化。", "设计一个突变优化任务。", [links.protein, links.cases]),
        node("antibody-design", "抗体设计", "基于抗原-抗体结构优化结合能力。", ["CDR", "亲和力", "特异性"], "广泛用于生物药研发。", "进入科研实战。", [links.research, links.cases]),
      ]),
      dimension("literature", [
        node("protein-folding-review", "蛋白折叠综述", "理解从序列到结构的问题演化。", ["折叠问题", "能量景观", "预测"], "帮助连接基础和 AI 结构预测。", "阅读时关注问题如何被定义。", [links.seminar]),
        node("alphafold-paper", "AlphaFold 关键论文", "理解深度学习如何改变结构预测。", ["训练数据", "预测精度", "局限"], "是结构生物学与 AI 交叉的代表文献。", "用科研助手模式拆解论文。", [links.seminar, links.research]),
        node("cryo-em-review", "冷冻电镜综述", "梳理冷冻电镜技术流程和应用边界。", ["样品制备", "图像重构", "分辨率"], "适合认识实验结构解析路径。", "比较预测结构与实验结构。", [links.seminar]),
      ]),
      dimension("tasks", [
        node("task-view-protein", "查看一个蛋白结构", "搜索 GFP、Cas9 或血红蛋白并观察结构域。", ["结构域", "链", "二级结构"], "把三维结构从概念变成可观察对象。", "打开蛋白结构工具。", [links.protein]),
        node("task-active-site", "判断活性位点", "根据结构和保守区域推测功能位置。", ["保守残基", "口袋", "底物"], "训练结构-功能推理。", "尝试解释一个突变影响。", [links.protein, links.research]),
        node("task-alphafold-limits", "讨论 AlphaFold 局限", "说明预测结构在哪些场景需要实验验证。", ["动态构象", "复合物", "实验验证"], "避免把 AI 预测当成绝对答案。", "切换科研助手模式提问。", [links.seminar]),
      ]),
    ],
  }),
  discipline({
    id: "microbiology",
    label: "微生物学",
    group: "生命系统",
    color: "#14b8a6",
    x: 30,
    y: 38,
    related: ["biochemistry", "synthetic-biology", "ecology-evolution", "immunology"],
    summary: "研究细菌、真菌、病毒等微生物的结构、代谢、生态和应用。",
    dimensions: standardDimensions({
      categories: ["细菌", "真菌", "病毒"],
      fundamentals: ["微生物生长", "代谢类型", "遗传交换"],
      frontier: ["微生物组", "噬菌体疗法", "极端微生物"],
      industry: ["发酵工程", "益生菌", "生物修复"],
      literature: ["微生物组综述", "噬菌体经典研究", "发酵工程案例"],
      tasks: ["设计培养条件", "比较细菌与病毒", "分析微生物产业案例"],
    }, [links.cases, links.research]),
  }),
  discipline({
    id: "immunology",
    label: "免疫学",
    group: "生命系统",
    color: "#f43f5e",
    x: 25,
    y: 50,
    related: ["cell-biology", "microbiology", "molecular-biology", "genomics"],
    summary: "研究免疫系统如何识别、应答和记忆外来或异常信号。",
    dimensions: standardDimensions({
      categories: ["天然免疫", "适应性免疫", "免疫记忆"],
      fundamentals: ["抗原", "抗体", "T 细胞", "炎症"],
      frontier: ["CAR-T", "肿瘤免疫", "mRNA 疫苗"],
      industry: ["疫苗", "抗体药", "细胞治疗"],
      literature: ["抗体发现史", "CAR-T 综述", "疫苗技术论文"],
      tasks: ["画出免疫应答流程", "解释抗体特异性", "分析 CAR-T 案例"],
    }, [links.pathway, links.cases, links.research]),
  }),
  discipline({
    id: "neuroscience",
    label: "神经生物学",
    group: "生命系统",
    color: "#a855f7",
    x: 33,
    y: 25,
    related: ["cell-biology", "developmental-biology", "bioinformatics"],
    summary: "研究神经元、神经环路、感觉、行为和脑疾病机制。",
    dimensions: standardDimensions({
      categories: ["神经元", "突触", "神经环路"],
      fundamentals: ["动作电位", "神经递质", "突触可塑性"],
      frontier: ["脑机接口", "类脑模型", "神经单细胞图谱"],
      industry: ["神经药物", "脑机接口", "神经诊断"],
      literature: ["突触可塑性经典", "神经环路综述", "脑机接口进展"],
      tasks: ["解释动作电位", "比较兴奋性与抑制性突触", "设计神经疾病讨论题"],
    }, [links.research, links.seminar]),
  }),
  discipline({
    id: "developmental-biology",
    label: "发育生物学",
    group: "生命系统",
    color: "#fb7185",
    x: 70,
    y: 32,
    related: ["cell-biology", "genomics", "neuroscience", "ecology-evolution"],
    summary: "研究从受精卵到复杂个体的细胞分化、形态发生和调控网络。",
    dimensions: standardDimensions({
      categories: ["胚胎发育", "细胞分化", "形态发生"],
      fundamentals: ["干细胞", "发育信号", "基因调控网络"],
      frontier: ["类胚胎模型", "空间发育图谱", "再生医学"],
      industry: ["干细胞治疗", "发育毒理", "再生医学"],
      literature: ["发育调控经典", "干细胞综述", "类胚胎模型论文"],
      tasks: ["解释细胞分化", "画出发育信号路径", "讨论再生医学应用"],
    }, [links.pathway, links.research, links.cases]),
  }),
  discipline({
    id: "ecology-evolution",
    label: "生态学与进化生物学",
    group: "生命系统",
    color: "#22c55e",
    x: 76,
    y: 50,
    related: ["genomics", "microbiology", "developmental-biology", "bioinformatics"],
    summary: "研究生物多样性、种群变化、生态系统相互作用和进化机制。",
    dimensions: standardDimensions({
      categories: ["种群", "群落", "生态系统"],
      fundamentals: ["自然选择", "遗传漂变", "生态位"],
      frontier: ["环境 DNA", "全球变化生物学", "宏基因组生态"],
      industry: ["生态监测", "农业生态", "生物多样性保护"],
      literature: ["达尔文经典", "现代综合进化论", "eDNA 综述"],
      tasks: ["解释自然选择", "分析一个生态网络", "设计 eDNA 监测方案"],
    }, [links.cases, links.research]),
  }),
  discipline({
    id: "bioinformatics",
    label: "生物信息学",
    group: "结构与数据",
    color: "#0f766e",
    x: 62,
    y: 68,
    featured: true,
    related: ["genomics", "structural-biology", "cell-biology", "molecular-biology", "synthetic-biology"],
    summary: "用算法、统计和 AI 分析序列、结构、组学和通路数据。",
    dimensions: [
      dimension("bio-category", [
        node("sequence-data", "序列数据", "处理 DNA、RNA 和蛋白质序列。", ["FASTA", "比对", "注释"], "是多数生物信息分析的入口。", "打开序列分析工具。", [links.sequence]),
        node("omics-data", "组学数据", "处理转录组、蛋白组、代谢组等大规模数据。", ["表达矩阵", "差异分析", "聚类"], "帮助从整体层面理解生命系统。", "学习单细胞组学。", [links.research]),
        node("network-data", "网络数据", "用图结构表达通路、互作和调控关系。", ["节点", "边", "网络拓扑"], "连接知识图谱和通路工具。", "查看通路图谱。", [links.pathway]),
      ]),
      dimension("fundamentals", [
        node("alignment", "序列比对", "比较序列相似性、突变和保守区域。", ["identity", "coverage", "E-value"], "是推断功能和同源关系的基础。", "比较两个序列片段。", [links.sequence]),
        node("annotation", "功能注释", "为序列或基因赋予可能功能。", ["数据库", "同源", "domain"], "把数据转化为可解释知识。", "关联蛋白结构域。", [links.protein]),
        node("differential-expression", "差异表达", "找出不同条件下表达变化的基因。", ["fold change", "p-value", "FDR"], "常用于发现机制和靶点。", "进入科研实战。", [links.research]),
        node("pathway-enrichment", "通路富集", "判断变化基因是否集中在特定通路。", ["富集", "通路", "背景集"], "把基因列表提升到机制层面。", "打开通路工具。", [links.pathway]),
      ]),
      dimension("frontier", [
        node("ai-for-biology", "AI for Biology", "用机器学习处理序列、结构和组学问题。", ["表示学习", "生成模型", "多模态"], "是当前生物信息学的重要增长点。", "比较 AlphaFold 和序列模型。", [links.research]),
        node("single-cell-analysis", "单细胞分析", "从单细胞数据识别细胞类型和状态。", ["降维", "聚类", "轨迹"], "连接细胞生物学和组学前沿。", "学习空间组学。", [links.research]),
        node("multi-omics", "多组学整合", "整合不同层次数据解释复杂机制。", ["转录组", "蛋白组", "代谢组"], "更接近真实生物系统。", "设计一个多组学问题。", [links.research]),
      ]),
      dimension("industry", [
        node("precision-medicine", "精准医学", "用数据分析辅助分型、诊断和治疗选择。", ["变异", "表达", "分型"], "体现生物信息学在医疗中的价值。", "查看产业案例。", [links.cases]),
        node("digital-biology-platform", "数字生物平台", "把实验数据、算法和自动化连接起来。", ["数据库", "工作流", "自动化"], "支撑 AI 辅助研发。", "进入科研实战。", [links.research]),
        node("agri-genomics", "农业基因组", "用基因组数据辅助育种和性状改良。", ["标记", "选择", "群体"], "连接基础遗传学与产业育种。", "查看农业生物案例。", [links.cases]),
      ]),
      dimension("literature", [
        node("blast-literature", "BLAST 相关文献", "理解序列相似性搜索的基本思想。", ["局部比对", "得分", "E-value"], "是经典生物信息工具的代表。", "用序列工具理解比对概念。", [links.sequence, links.seminar]),
        node("single-cell-review", "单细胞分析综述", "梳理单细胞数据分析流程和局限。", ["质控", "聚类", "注释"], "适合理解组学分析管线。", "进入科研助手模式提问。", [links.seminar]),
        node("ai-biology-review", "AI 生物学综述", "总结机器学习在序列、结构和药物中的应用。", ["模型", "数据", "泛化"], "帮助理解 AI 与生命科学的交叉。", "连接结构生物学和合成生物学。", [links.research, links.seminar]),
      ]),
      dimension("tasks", [
        node("task-sequence-quality", "检查序列质量", "判断序列类型、长度、GC 含量和异常字符。", ["DNA/RNA/Protein", "GC%", "异常字符"], "把数据分析变成第一步操作。", "打开序列分析工具。", [links.sequence]),
        node("task-enrichment-story", "解释通路富集结果", "从基因列表推断可能受影响的通路。", ["富集", "通路", "机制"], "训练从数据到机制的表达。", "打开通路工具。", [links.pathway]),
        node("task-ai-analysis-plan", "设计 AI 分析流程", "为一个生物问题选择数据、模型和验证方式。", ["数据", "模型", "验证"], "训练科研工程思维。", "进入科研实战。", [links.research]),
      ]),
    ],
  }),
  discipline({
    id: "synthetic-biology",
    label: "合成生物学",
    group: "工程交叉",
    color: "#f97316",
    x: 48,
    y: 74,
    featured: true,
    related: ["molecular-biology", "microbiology", "bioinformatics", "biochemistry", "structural-biology"],
    summary: "用工程化思想设计、构建和优化生物系统。",
    dimensions: [
      dimension("bio-category", [
        node("biological-parts", "生物元件", "启动子、RBS、终止子等可组合功能单元。", ["元件", "标准化", "组合"], "是构建基因线路和表达系统的基础。", "学习质粒载体。", [links.plasmid]),
        node("genetic-circuit", "基因线路", "通过调控元件组成可计算或响应的表达网络。", ["反馈", "开关", "振荡器"], "体现工程设计思想。", "设计一个简单线路。", [links.research]),
        node("cell-factory", "细胞工厂", "改造微生物或细胞生产目标产物。", ["底盘", "代谢通路", "发酵"], "是合成生物学产业应用核心。", "查看产业案例。", [links.cases]),
      ]),
      dimension("fundamentals", [
        node("plasmid-vector", "质粒载体", "常用于克隆和表达的环状 DNA 载体。", ["ori", "筛选标记", "MCS"], "连接序列设计、表达系统和实验验证。", "打开质粒图谱工具。", [links.plasmid]),
        node("promoter", "启动子", "控制下游基因转录起始和表达强度。", ["组成型", "诱导型", "宿主兼容"], "决定表达系统是否按预期工作。", "比较 T7 与 lac 启动子。", [links.plasmid]),
        node("terminator", "终止子", "帮助转录正确结束并减少读穿。", ["转录终止", "稳定性", "表达单元"], "完整表达盒不可缺少。", "查看质粒上的表达盒。", [links.plasmid]),
        node("chassis-cell", "底盘细胞", "承载工程系统的宿主细胞。", ["E. coli", "酵母", "哺乳细胞"], "底盘决定表达、代谢和放大条件。", "比较不同底盘适用场景。", [links.cases]),
      ]),
      dimension("frontier", [
        node("bio-design-automation", "自动化生物设计", "用软件、机器人和数据闭环加速设计-构建-测试。", ["DBTL", "自动化", "数据闭环"], "提升工程生物系统迭代效率。", "设计 DBTL 流程。", [links.research]),
        node("cell-free-system", "无细胞系统", "在细胞外进行转录翻译和生物合成。", ["体外表达", "快速验证", "模块化"], "适合快速原型和生物安全场景。", "比较细胞内与无细胞表达。", [links.research]),
        node("biosafety-design", "生物安全设计", "通过遗传防护和控制机制降低风险。", ["kill switch", "依赖性", "封闭系统"], "工程化生命系统必须考虑安全边界。", "提出一个安全控制策略。", [links.seminar]),
      ]),
      dimension("industry", [
        node("industrial-fermentation", "工业发酵", "用微生物生产食品、药物或化学品。", ["发酵罐", "培养基", "放大"], "是合成生物制造的重要载体。", "查看发酵案例。", [links.cases]),
        node("biomaterials", "生物材料", "用细胞或酶生产可持续材料。", ["PHA", "蛋白材料", "可降解"], "体现绿色制造潜力。", "进入产业案例。", [links.cases]),
        node("therapeutic-production", "药物生产", "通过工程细胞生产蛋白药物或代谢产物。", ["重组蛋白", "抗体", "代谢产物"], "连接表达系统、纯化和质控。", "设计表达验证任务。", [links.plasmid, links.research]),
      ]),
      dimension("literature", [
        node("toggle-switch-paper", "基因开关经典论文", "理解合成基因线路如何被工程化设计。", ["开关", "反馈", "建模"], "是合成生物学思想的代表。", "关注设计逻辑和验证实验。", [links.seminar]),
        node("cell-factory-review", "细胞工厂综述", "梳理从代谢工程到产业生产的流程。", ["代谢通路", "优化", "放大"], "帮助理解产业转化链条。", "连接产业应用节点。", [links.cases, links.seminar]),
        node("dbtl-review", "DBTL 循环综述", "总结设计-构建-测试-学习闭环方法。", ["设计", "构建", "测试", "学习"], "适合把合成生物学与 AI 研发结合。", "进入科研实战。", [links.research]),
      ]),
      dimension("tasks", [
        node("task-plasmid-map", "阅读质粒图谱", "指出 ori、抗性基因、启动子和插入位点。", ["ori", "抗性", "启动子"], "训练载体理解能力。", "打开质粒图谱工具。", [links.plasmid]),
        node("task-expression-cassette", "设计表达盒", "选择启动子、RBS、目标基因和终止子。", ["表达元件", "组合", "宿主"], "把元件知识组合成工程方案。", "进入科研实战。", [links.research, links.sequence]),
        node("task-cell-factory", "构思细胞工厂", "为一个目标产物选择底盘和优化路径。", ["底盘", "代谢", "验证"], "连接产业应用和实验设计。", "查看产业案例。", [links.cases]),
      ]),
    ],
  }),
];

function standardDimensions(spec, moduleLinks) {
  const mk = (label, idx, dimensionId) => node(
    slug(`${dimensionId}-${label}`),
    label,
    `${label}是该学科中需要理解的关键主题。`,
    [label, "核心概念", "应用联系"],
    "帮助建立学科整体框架，并连接后续学习与应用。",
    "继续展开相关节点并尝试完成一个学习任务。",
    moduleLinks.slice(0, Math.min(2, moduleLinks.length)),
  );

  return [
    dimension("bio-category", spec.categories.map((label, idx) => mk(label, idx, "category"))),
    dimension("fundamentals", spec.fundamentals.map((label, idx) => mk(label, idx, "fundamental"))),
    dimension("frontier", spec.frontier.map((label, idx) => mk(label, idx, "frontier"))),
    dimension("industry", spec.industry.map((label, idx) => mk(label, idx, "industry"))),
    dimension("literature", spec.literature.map((label, idx) => mk(label, idx, "literature"))),
    dimension("tasks", spec.tasks.map((label, idx) => mk(label, idx, "task"))),
  ];
}

function slug(value) {
  return value
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\p{Letter}\p{Number}-]+/gu, "")
    .replace(/^-+|-+$/g, "");
}

export function getDisciplineById(id) {
  const found = knowledgeDisciplines.find((discipline) => discipline.id === id);
  if (!found) throw new Error(`Unknown discipline: ${id}`);
  return found;
}

export function findKnowledgeNode(disciplineId, nodeId) {
  const discipline = getDisciplineById(disciplineId);
  if (discipline.id === nodeId) return discipline;
  for (const dimension of discipline.dimensions) {
    if (dimension.id === nodeId) return dimension;
    const child = dimension.children.find((item) => item.id === nodeId);
    if (child) return child;
  }
  return undefined;
}

export function getKnowledgePath(disciplineId, nodeId) {
  const discipline = getDisciplineById(disciplineId);
  if (nodeId === discipline.id) return [{ id: discipline.id, label: discipline.label, type: "discipline" }];
  for (const dimension of discipline.dimensions) {
    if (dimension.id === nodeId) {
      return [
        { id: discipline.id, label: discipline.label, type: "discipline" },
        { id: dimension.id, label: dimension.label, type: "dimension" },
      ];
    }
    const child = dimension.children.find((item) => item.id === nodeId);
    if (child) {
      return [
        { id: discipline.id, label: discipline.label, type: "discipline" },
        { id: dimension.id, label: dimension.label, type: "dimension" },
        { id: child.id, label: child.label, type: "node" },
      ];
    }
  }
  return [];
}

export function getGalaxyEdges() {
  const seen = new Set();
  const edges = [];
  for (const discipline of knowledgeDisciplines) {
    for (const target of discipline.related || []) {
      const key = [discipline.id, target].sort().join("--");
      if (!seen.has(key)) {
        seen.add(key);
        edges.push({ from: discipline.id, to: target });
      }
    }
  }
  return edges;
}

export function getDimensionById(id) {
  const found = knowledgeDimensions.find((dimension) => dimension.id === id);
  if (!found) throw new Error(`Unknown dimension: ${id}`);
  return found;
}
