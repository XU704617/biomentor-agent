"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  Building2,
  Search,
  FlaskConical,
  Dna,
  Syringe,
  Leaf,
  Beaker,
  Microscope,
  Filter,
  ChevronRight,
} from "lucide-react";

type Category =
  | "全部"
  | "生物合成"
  | "基因治疗"
  | "CAR-T"
  | "代谢工程"
  | "抗体药物";

const categories: Category[] = [
  "全部",
  "生物合成",
  "基因治疗",
  "CAR-T",
  "代谢工程",
  "抗体药物",
];

interface CaseStudy {
  title: string;
  organization: string;
  tags: string[];
  description: string;
  category: Category;
  icon: React.ReactNode;
}

const caseStudies: CaseStudy[] = [
  {
    title: "青蒿素生物合成",
    organization: "中科院植物生理生态研究所 / Amyris",
    tags: ["合成生物学", "代谢工程", "酵母表达"],
    description:
      "通过工程化酵母菌株实现青蒿酸的高效合成，替代传统植物提取路线，将青蒿素生产成本降低90%以上，是全球合成生物学产业化的里程碑案例。",
    category: "生物合成",
    icon: <FlaskConical className="w-5 h-5" />,
  },
  {
    title: "CAR-T 细胞治疗",
    organization: "Novartis / 复星凯特 / 药明巨诺",
    tags: ["CAR-T", "免疫治疗", "基因工程"],
    description:
      "嵌合抗原受体T细胞（CAR-T）疗法通过基因工程改造患者自身T细胞，使其精准识别并杀伤肿瘤细胞，在血液肿瘤治疗中取得突破性疗效。",
    category: "CAR-T",
    icon: <Dna className="w-5 h-5" />,
  },
  {
    title: "mRNA 疫苗技术平台",
    organization: "BioNTech / Moderna / 艾博生物",
    tags: ["mRNA", "疫苗", "脂质纳米颗粒"],
    description:
      "基于mRNA的疫苗技术平台，利用脂质纳米颗粒（LNP）递送系统将编码抗原的mRNA送入细胞，实现快速、可扩展的疫苗开发与生产。",
    category: "基因治疗",
    icon: <Syringe className="w-5 h-5" />,
  },
  {
    title: "基因编辑作物育种",
    organization: "中国农业科学院 / Corteva / 隆平高科",
    tags: ["CRISPR", "作物育种", "基因编辑"],
    description:
      "利用CRISPR-Cas9等基因编辑工具对作物进行精准性状改良，包括抗旱、抗病、高产等性状，推动现代精准育种产业化进程。",
    category: "代谢工程",
    icon: <Leaf className="w-5 h-5" />,
  },
  {
    title: "PHA 生物可降解塑料",
    organization: "蓝晶微生物 / Danimer Scientific",
    tags: ["PHA", "生物合成", "可降解材料"],
    description:
      "利用微生物发酵生产聚羟基脂肪酸酯（PHA）生物可降解塑料，实现从石油基塑料到生物基可降解材料的绿色转型。",
    category: "生物合成",
    icon: <Beaker className="w-5 h-5" />,
  },
  {
    title: "胰岛素工程菌生产",
    organization: "Novo Nordisk / 通化东宝 / 甘李药业",
    tags: ["重组蛋白", "大肠杆菌", "生物制药"],
    description:
      "通过重组DNA技术在大肠杆菌或酵母中表达人胰岛素，替代传统动物提取工艺，实现大规模、高纯度的胰岛素工业化生产。",
    category: "抗体药物",
    icon: <Microscope className="w-5 h-5" />,
  },
];

export default function CasesPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("全部");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = caseStudies.filter((c) => {
    const matchCategory =
      activeCategory === "全部" || c.category === activeCategory;
    const matchSearch =
      !searchQuery.trim() ||
      c.title.includes(searchQuery.trim()) ||
      c.tags.some((t) => t.includes(searchQuery.trim())) ||
      c.organization.includes(searchQuery.trim()) ||
      c.description.includes(searchQuery.trim());
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen pt-[var(--nav-height)] px-6 md:px-10 pb-20">
      <div className="max-w-6xl mx-auto pt-8 md:pt-16">
        <div className="text-center mb-10">
          <h1
            className="font-display font-extrabold text-brand-ink leading-[1.1] tracking-[-0.03em] mb-3"
            style={{ fontSize: "clamp(28px, 4vw, 48px)" }}
          >
            产业案例库
          </h1>
          <p className="text-brand-muted text-base md:text-lg font-body max-w-xl mx-auto">
            汇集生物技术产业前沿案例，涵盖生物合成、基因治疗、抗体药物等热门赛道
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium font-body transition-all duration-200 cursor-pointer ${
                  activeCategory === cat
                    ? "bg-brand-ink text-white shadow-lg shadow-brand-ink/10"
                    : "glass-card text-brand-muted hover:text-brand-ink hover:border-accent-electric/20"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索案例..."
              className="w-full h-10 pl-10 pr-4 rounded-xl glass-card text-sm font-body text-brand-ink placeholder:text-brand-muted/50 outline-none focus:border-accent-electric/20 transition-all duration-200"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Filter className="w-12 h-12 text-brand-muted/30 mx-auto mb-4" />
            <p className="text-brand-muted font-body">未找到匹配的案例</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((cs, i) => (
              <div
                key={i}
                className="glass-card rounded-2xl p-6 flex flex-col group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-ink/5 flex items-center justify-center group-hover:bg-accent-electric/10 transition-colors">
                    {cs.icon}
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-brand-muted group-hover:text-accent-electric transition-colors opacity-0 group-hover:opacity-100" />
                </div>

                <h3 className="font-display text-lg font-bold text-brand-ink mb-2 group-hover:text-accent-electric transition-colors">
                  {cs.title}
                </h3>

                <div className="flex items-center gap-1.5 mb-3">
                  <Building2 className="w-3.5 h-3.5 text-brand-muted shrink-0" />
                  <span className="text-xs text-brand-muted font-body truncate">
                    {cs.organization}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {cs.tags.map((tag, j) => (
                    <span key={j} className="badge badge-electric">
                      {tag}
                    </span>
                  ))}
                </div>

                <p className="text-sm text-brand-muted font-body leading-relaxed flex-1 mb-4">
                  {cs.description}
                </p>

                <div className="flex items-center gap-1 text-sm font-medium text-brand-muted group-hover:text-accent-electric transition-colors pt-3 border-t border-black/5">
                  <span>查看详情</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
