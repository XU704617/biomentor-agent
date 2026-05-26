export interface KpiData {
  label: string;
  value: number;
  unit: string;
  change: number;
  icon: string;
  color: "primary" | "accent" | "purple" | "warning";
}

export interface QuizItem {
  id: string;
  title: string;
  course: string;
  status: "published" | "draft" | "grading" | "completed";
  studentCount: number;
  avgScore?: number;
  createdAt: string;
  dueDate: string;
}

export interface WeakPoint {
  topic: string;
  accuracy: number;
  studentCount: number;
  trend: "up" | "down" | "stable";
}

export interface StudentTask {
  id: string;
  title: string;
  course: string;
  type: "quiz" | "reading" | "practice" | "case-study";
  dueDate: string;
  status: "pending" | "completed" | "overdue";
}

export interface ScoreRecord {
  id: string;
  quizTitle: string;
  score: number;
  totalScore: number;
  date: string;
  rank?: string;
}

export interface KnowledgeGap {
  topic: string;
  mastery: number;
  level: "weak" | "moderate" | "strong";
}

export interface MaterialItem {
  id: string;
  title: string;
  type: "pdf" | "video" | "ppt" | "link";
  course: string;
  chapter: string;
  size: string;
  uploadedAt: string;
  downloads: number;
}

export interface QuestionItem {
  id: string;
  content: string;
  type: "single" | "multiple" | "judge" | "essay";
  difficulty: 1 | 2 | 3 | 4 | 5;
  course: string;
  chapter: string;
  tags: string[];
  createdAt: string;
}

export interface ClassData {
  id: string;
  name: string;
  studentCount: number;
  avgScore: number;
  completionRate: number;
  topics: { name: string; avgAccuracy: number }[];
}

export const teacherKpis: KpiData[] = [
  { label: "课程数", value: 8, unit: "门", change: 12.5, icon: "BookOpen", color: "primary" },
  { label: "资料数", value: 156, unit: "份", change: 8.3, icon: "FileText", color: "accent" },
  { label: "题库总数", value: 2340, unit: "题", change: 15.2, icon: "Database", color: "purple" },
  { label: "待审题目", value: 47, unit: "题", change: -5.1, icon: "Clock", color: "warning" },
];

export const recentQuizzes: QuizItem[] = [
  {
    id: "qz-001",
    title: "基因工程原理 - 第三章测验",
    course: "基因工程",
    status: "published",
    studentCount: 45,
    avgScore: 78.5,
    createdAt: "2025-05-20",
    dueDate: "2025-05-30",
  },
  {
    id: "qz-002",
    title: "发酵工程 - 期中考试",
    course: "发酵工程",
    status: "grading",
    studentCount: 52,
    avgScore: 72.3,
    createdAt: "2025-05-18",
    dueDate: "2025-05-25",
  },
  {
    id: "qz-003",
    title: "代谢工程 - 随堂测验",
    course: "代谢工程",
    status: "completed",
    studentCount: 38,
    avgScore: 85.1,
    createdAt: "2025-05-15",
    dueDate: "2025-05-20",
  },
  {
    id: "qz-004",
    title: "合成生物学 - 单元测试",
    course: "合成生物学",
    status: "draft",
    studentCount: 0,
    createdAt: "2025-05-22",
    dueDate: "2025-06-05",
  },
];

export const classWeakPoints: WeakPoint[] = [
  { topic: "CRISPR-Cas9 工作原理", accuracy: 58, studentCount: 32, trend: "up" },
  { topic: "质粒载体的选择与构建", accuracy: 62, studentCount: 28, trend: "stable" },
  { topic: "代谢通路调控机制", accuracy: 55, studentCount: 35, trend: "down" },
  { topic: "发酵工艺参数优化", accuracy: 65, studentCount: 24, trend: "up" },
  { topic: "蛋白质表达系统", accuracy: 60, studentCount: 30, trend: "stable" },
];

export const studentTasks: StudentTask[] = [
  {
    id: "t-001",
    title: "基因工程原理 - 第三章测验",
    course: "基因工程",
    type: "quiz",
    dueDate: "2025-05-30",
    status: "pending",
  },
  {
    id: "t-002",
    title: "CRISPR技术文献阅读",
    course: "合成生物学",
    type: "reading",
    dueDate: "2025-05-28",
    status: "pending",
  },
  {
    id: "t-003",
    title: "代谢通路设计练习",
    course: "代谢工程",
    type: "practice",
    dueDate: "2025-05-26",
    status: "pending",
  },
  {
    id: "t-004",
    title: "工程菌构建案例分析",
    course: "合成生物学",
    type: "case-study",
    dueDate: "2025-05-24",
    status: "overdue",
  },
];

export const studentScores: ScoreRecord[] = [
  { id: "s-001", quizTitle: "基因工程原理 - 第二章测验", score: 92, totalScore: 100, date: "2025-05-10", rank: "3/45" },
  { id: "s-002", quizTitle: "发酵工程 - 单元测试", score: 85, totalScore: 100, date: "2025-05-05", rank: "8/52" },
  { id: "s-003", quizTitle: "代谢工程 - 随堂测验", score: 78, totalScore: 100, date: "2025-04-28", rank: "15/38" },
  { id: "s-004", quizTitle: "合成生物学 - 基础测试", score: 88, totalScore: 100, date: "2025-04-20", rank: "6/50" },
];

export const knowledgeGaps: KnowledgeGap[] = [
  { topic: "CRISPR-Cas9 工作原理", mastery: 45, level: "weak" },
  { topic: "质粒载体的选择与构建", mastery: 55, level: "weak" },
  { topic: "代谢通路调控机制", mastery: 60, level: "moderate" },
  { topic: "发酵工艺参数优化", mastery: 70, level: "moderate" },
  { topic: "蛋白质表达系统", mastery: 75, level: "moderate" },
  { topic: "基因编辑工具比较", mastery: 82, level: "strong" },
];

export const materials: MaterialItem[] = [
  { id: "m-001", title: "基因工程原理 - 第三章课件", type: "ppt", course: "基因工程", chapter: "第三章", size: "12.5 MB", uploadedAt: "2025-05-15", downloads: 128 },
  { id: "m-002", title: "CRISPR技术综述文献", type: "pdf", course: "合成生物学", chapter: "第二章", size: "3.2 MB", uploadedAt: "2025-05-14", downloads: 96 },
  { id: "m-003", title: "发酵工艺实验操作视频", type: "video", course: "发酵工程", chapter: "第四章", size: "256 MB", uploadedAt: "2025-05-13", downloads: 75 },
  { id: "m-004", title: "代谢网络分析参考链接", type: "link", course: "代谢工程", chapter: "第五章", size: "-", uploadedAt: "2025-05-12", downloads: 42 },
  { id: "m-005", title: "蛋白质结构预测教程", type: "pdf", course: "蛋白质工程", chapter: "第六章", size: "8.7 MB", uploadedAt: "2025-05-11", downloads: 63 },
  { id: "m-006", title: "合成生物学标准元件库", type: "pdf", course: "合成生物学", chapter: "第三章", size: "15.1 MB", uploadedAt: "2025-05-10", downloads: 110 },
];

export const questionBank: QuestionItem[] = [
  { id: "q-001", content: "CRISPR-Cas9 系统中，Cas9 蛋白的功能是什么？", type: "single", difficulty: 2, course: "基因工程", chapter: "第三章", tags: ["CRISPR", "Cas9", "基因编辑"], createdAt: "2025-05-01" },
  { id: "q-002", content: "下列关于质粒载体的说法，正确的有哪些？", type: "multiple", difficulty: 3, course: "基因工程", chapter: "第二章", tags: ["质粒", "载体"], createdAt: "2025-05-02" },
  { id: "q-003", content: "限制性内切酶只能切割外源DNA。", type: "judge", difficulty: 1, course: "基因工程", chapter: "第一章", tags: ["限制酶"], createdAt: "2025-05-03" },
  { id: "q-004", content: "请简述发酵过程中溶氧浓度对菌体生长的影响。", type: "essay", difficulty: 4, course: "发酵工程", chapter: "第四章", tags: ["发酵", "溶氧"], createdAt: "2025-05-04" },
  { id: "q-005", content: "代谢工程中，敲除竞争途径的目的是什么？", type: "single", difficulty: 3, course: "代谢工程", chapter: "第五章", tags: ["代谢", "基因敲除"], createdAt: "2025-05-05" },
];

export const classAnalysisData: ClassData[] = [
  {
    id: "c-001",
    name: "生物工程 2024 级 A班",
    studentCount: 45,
    avgScore: 78.5,
    completionRate: 92.3,
    topics: [
      { name: "基因编辑", avgAccuracy: 72 },
      { name: "质粒构建", avgAccuracy: 68 },
      { name: "代谢调控", avgAccuracy: 65 },
      { name: "发酵工艺", avgAccuracy: 80 },
      { name: "蛋白质工程", avgAccuracy: 75 },
    ],
  },
  {
    id: "c-002",
    name: "生物工程 2024 级 B班",
    studentCount: 42,
    avgScore: 81.2,
    completionRate: 88.7,
    topics: [
      { name: "基因编辑", avgAccuracy: 75 },
      { name: "质粒构建", avgAccuracy: 72 },
      { name: "代谢调控", avgAccuracy: 70 },
      { name: "发酵工艺", avgAccuracy: 82 },
      { name: "蛋白质工程", avgAccuracy: 78 },
    ],
  },
];

export const knowledgeMapNodes = [
  { id: "km-01", label: "基因工程基础", x: 400, y: 80, category: "core" },
  { id: "km-02", label: "限制性内切酶", x: 200, y: 180, category: "basic" },
  { id: "km-03", label: "质粒载体构建", x: 600, y: 180, category: "basic" },
  { id: "km-04", label: "CRISPR-Cas9", x: 100, y: 320, category: "advanced" },
  { id: "km-05", label: "基因编辑工具", x: 350, y: 320, category: "advanced" },
  { id: "km-06", label: "表达系统", x: 600, y: 320, category: "advanced" },
  { id: "km-07", label: "代谢工程", x: 400, y: 450, category: "core" },
  { id: "km-08", label: "代谢通路设计", x: 200, y: 550, category: "advanced" },
  { id: "km-09", label: "发酵工艺优化", x: 600, y: 550, category: "advanced" },
  { id: "km-10", label: "合成生物学", x: 400, y: 650, category: "core" },
];

export const knowledgeMapEdges = [
  { from: "km-01", to: "km-02" },
  { from: "km-01", to: "km-03" },
  { from: "km-02", to: "km-04" },
  { from: "km-03", to: "km-05" },
  { from: "km-03", to: "km-06" },
  { from: "km-05", to: "km-07" },
  { from: "km-06", to: "km-07" },
  { from: "km-07", to: "km-08" },
  { from: "km-07", to: "km-09" },
  { from: "km-08", to: "km-10" },
  { from: "km-09", to: "km-10" },
];

export const caseStudies = [
  {
    id: "cs-001",
    title: "利用CRISPR-Cas9构建高产工程菌",
    summary: "本研究通过CRISPR-Cas9基因编辑技术，对大肠杆菌的代谢通路进行改造，成功构建了一株高产白藜芦醇的工程菌。",
    tags: ["CRISPR", "代谢工程", "工程菌"],
    difficulty: 4,
    publishDate: "2025-03-15",
  },
  {
    id: "cs-002",
    title: "合成生物学在生物燃料生产中的应用",
    summary: "探索利用合成生物学方法，设计并构建能够高效转化生物质为生物燃料的微生物细胞工厂。",
    tags: ["合成生物学", "生物燃料", "代谢通路"],
    difficulty: 5,
    publishDate: "2025-04-02",
  },
  {
    id: "cs-003",
    title: "发酵工艺放大中的关键参数控制",
    summary: "分析从实验室规模到工业生产规模发酵过程中的关键参数变化规律及优化策略。",
    tags: ["发酵工程", "工艺放大", "参数优化"],
    difficulty: 3,
    publishDate: "2025-04-20",
  },
];

export const wrongQuestions = [
  {
    id: "wq-001",
    content: "CRISPR-Cas9 系统中，tracrRNA 的主要功能是？",
    correctAnswer: "引导 crRNA 与 Cas9 蛋白结合",
    myAnswer: "识别目标 DNA 序列",
    course: "基因工程",
    chapter: "第三章",
    wrongCount: 3,
    lastWrongDate: "2025-05-20",
  },
  {
    id: "wq-002",
    content: "在发酵过程中，次级代谢产物通常在哪个时期大量合成？",
    correctAnswer: "稳定期",
    myAnswer: "对数生长期",
    course: "发酵工程",
    chapter: "第五章",
    wrongCount: 2,
    lastWrongDate: "2025-05-18",
  },
  {
    id: "wq-003",
    content: "下列关于代谢通量分析的说法，错误的是？",
    correctAnswer: "无需考虑辅因子平衡",
    myAnswer: "基于化学计量学模型",
    course: "代谢工程",
    chapter: "第四章",
    wrongCount: 1,
    lastWrongDate: "2025-05-15",
  },
];
