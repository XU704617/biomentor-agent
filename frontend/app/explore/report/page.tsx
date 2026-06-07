"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Target,
  TrendingUp,
  FileText,
  Download,
  RotateCcw,
  BookOpen,
  AlertCircle,
  Award,
} from "lucide-react";
import Link from "next/link";

import { isQuizAnswerCorrect } from "@/lib/quiz-answer";

interface Question {
  id: number;
  type: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
}

interface QuizResult {
  questions: Question[];
  correctCount: number;
  score: number;
  totalQuestions: number;
}

export default function ReportPage() {
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "wrong" | "suggestions">("overview");
  const [persistentWrongQuestions, setPersistentWrongQuestions] = useState<Question[]>([]);

  useEffect(() => {
    const storedResult = localStorage.getItem("quizResult");
    if (storedResult) {
      const data = JSON.parse(storedResult);
        setQuizResult({
          ...data,
          questions: data.questions.map((q: Question) => ({
            ...q,
            isCorrect: isQuizAnswerCorrect(q),
          })),
        });
    }

    const storedWrongQuestions = localStorage.getItem("wrongQuestions");
    if (storedWrongQuestions) {
      setPersistentWrongQuestions(JSON.parse(storedWrongQuestions));
    }
  }, []);

  if (!quizResult) {
    return (
      <div className="min-h-screen pt-[var(--nav-height)] px-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-accent-amber/10 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-accent-amber" />
          </div>
          <h3 className="font-display font-bold text-brand-ink mb-2">暂无学习报告</h3>
          <p className="text-brand-muted font-body mb-4">请先完成练习题</p>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-ink text-white font-medium font-body hover:bg-brand-ink/90 transition-all"
          >
            返回探索页面
          </Link>
        </div>
      </div>
    );
  }

  const wrongQuestions = quizResult.questions.filter((q) => !q.isCorrect);

  const BIOL_KEYWORDS = [
    "微生物", "发酵", "酶", "HACCP", "食品安全", "食品添加剂", "淀粉", 
    "乳酸菌", "酵母菌", "灭菌", "消毒", "食品工程", "蛋白质", "碳水化合物",
    "DNA", "RNA", "基因", "细胞", "CRISPR", "代谢", "免疫", "细胞凋亡", 
    "干细胞", "疫苗", "抗体", "抗原", "转录", "翻译", "复制", "修复",
    "生态系统", "食物链", "食物网", "能量传递", "营养级", "生物富集",
    "生态金字塔", "生物多样性", "种群", "群落", "生态位", "演替",
    "上皮组织", "结缔组织", "肌肉组织", "神经组织", "细胞连接",
    "细胞膜", "细胞核", "细胞器", "线粒体", "叶绿体", "核糖体"
  ];

  const extractKeywordsFromQuestion = (text: string): string[] => {
    const found: string[] = [];
    const lowerText = text.toLowerCase();
    BIOL_KEYWORDS.forEach(kw => {
      if (lowerText.includes(kw.toLowerCase())) {
        found.push(kw);
      }
    });
    return found.length > 0 ? found.slice(0, 2) : ["综合知识"];
  };

  const getWeakPoints = () => {
    const keywordAnalysis: Record<string, { correct: number; total: number; explanations: string[] }> = {};
    
    quizResult.questions.forEach((q) => {
      const keywords = extractKeywordsFromQuestion(q.question + " " + q.explanation);
      keywords.forEach(keyword => {
        if (!keywordAnalysis[keyword]) {
          keywordAnalysis[keyword] = { correct: 0, total: 0, explanations: [] };
        }
        keywordAnalysis[keyword].total++;
        if (q.isCorrect) {
          keywordAnalysis[keyword].correct++;
        }
        if (!q.isCorrect && q.explanation) {
          keywordAnalysis[keyword].explanations.push(q.explanation);
        }
      });
    });

    return Object.entries(keywordAnalysis).map(([keyword, data], index) => {
      const accuracy = Math.round((data.correct / data.total) * 100);
      let suggestion = "";
      if (accuracy === 100) {
        suggestion = `"${keyword}"知识点掌握良好，建议继续巩固并拓展相关知识。`;
      } else if (accuracy >= 60) {
        suggestion = `建议加强"${keyword}"相关知识点的练习，参考解析理解易错点。`;
      } else {
        const sampleExplanation = data.explanations.length > 0 
          ? data.explanations[0].substring(0, 60) + "..." 
          : "";
        suggestion = `需要重点复习"${keyword}"知识点。${sampleExplanation}`;
      }
      return {
        id: index + 1,
        title: keyword,
        accuracy: accuracy,
        suggestion: suggestion,
      };
    }).sort((a, b) => a.accuracy - b.accuracy);
  };

  const weakPoints = getWeakPoints();

  const generateStudySuggestions = () => {
    const suggestions: string[] = [];
    
    if (wrongQuestions.length === 0) {
      suggestions.push("【错误知识点】无。【错误原因分析】本次测验全部正确，知识掌握良好。【针对性训练方法】建议进行更高级别的练习，尝试将所学知识应用到实际问题中，构建完整的知识体系。");
    } else {
      const weakTopics = weakPoints.filter(p => p.accuracy < 70);
      
      weakTopics.slice(0, 3).forEach((point) => {
        const wrongQs = quizResult.questions.filter(q => 
          !q.isCorrect && (q.question.includes(point.title) || q.explanation?.includes(point.title))
        );
        
        let errorReason = "概念理解不清晰";
        let trainingMethod = "反复阅读教材相关章节，制作概念卡片";
        
        if (point.title.includes("组织") || point.title.includes("细胞")) {
          errorReason = "组织结构复杂，容易混淆不同组织类型的特征和功能";
          trainingMethod = "绘制各类组织的结构示意图，对比分析不同组织的形态特征和功能差异，进行分类练习";
        } else if (point.title.includes("生态") || point.title.includes("食物")) {
          errorReason = "生态关系抽象，难以建立系统性理解";
          trainingMethod = "构建生态系统模型，模拟物质循环和能量流动过程，通过案例分析加深理解";
        } else if (point.title.includes("DNA") || point.title.includes("复制")) {
          errorReason = "分子机制复杂，步骤较多容易混淆";
          trainingMethod = "分步绘制DNA复制流程图，标注关键酶和步骤，通过动画视频辅助理解";
        }
        
        suggestions.push(`【错误知识点】${point.title}（正确率${point.accuracy}%）。【错误原因分析】${errorReason}，可能对核心概念理解不透彻或与相似概念混淆。【针对性训练方法】${trainingMethod}，结合错题解析进行针对性练习。`);
      });
      
      if (weakTopics.length === 0) {
        const sampleWrong = wrongQuestions[0];
        const keywords = extractKeywordsFromQuestion(sampleWrong.question);
        suggestions.push(`【错误知识点】${keywords.join("、")}。【错误原因分析】对题目涉及的核心概念理解不准确，未能正确应用相关知识解决问题。【针对性训练方法】仔细阅读题目解析，理解正确答案的推导过程，寻找同类题目进行强化练习。`);
      }
      
      suggestions.push("【错误知识点】知识综合应用。【错误原因分析】多个知识点关联时容易出现逻辑断层，知识体系不够完整。【针对性训练方法】制作思维导图将相关知识点串联起来，定期进行综合性练习，提升知识整合能力。");
    }
    
    return suggestions;
  };

  const studySuggestions = generateStudySuggestions();

  return (
    <div className="min-h-screen pt-[var(--nav-height)] px-6 md:px-10 pb-20">
      <section className="max-w-4xl mx-auto pt-8 md:pt-16">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/explore/quiz"
            className="flex items-center gap-2 text-brand-muted hover:text-brand-ink transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-body">返回</span>
          </Link>
        </div>

        <div className="glass-card rounded-2xl p-8 mb-6">
          <div className="text-center mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent-electric to-accent-cyan flex items-center justify-center mx-auto mb-4">
              <Award className="w-12 h-12 text-white" />
            </div>
            <h1 className="font-display text-2xl font-bold text-brand-ink mb-2">学习报告</h1>
            <p className="text-brand-muted font-body">DNA复制机制 - 章节测试</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white/40 text-center">
              <div className="text-3xl font-display font-bold text-accent-electric mb-1">
                {quizResult.score}
              </div>
              <div className="text-xs text-brand-muted font-body">总分</div>
            </div>
            <div className="p-4 rounded-xl bg-white/40 text-center">
              <div className="text-3xl font-display font-bold text-accent-cyan mb-1">
                {Math.round((quizResult.correctCount / quizResult.totalQuestions) * 100)}%
              </div>
              <div className="text-xs text-brand-muted font-body">正确率</div>
            </div>
            <div className="p-4 rounded-xl bg-white/40 text-center">
              <div className="text-3xl font-display font-bold text-accent-amber mb-1">
                {quizResult.totalQuestions - quizResult.correctCount}
              </div>
              <div className="text-xs text-brand-muted font-body">错题数</div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-6 p-1 rounded-xl bg-white/40 w-fit">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-lg text-sm font-medium font-body transition-all cursor-pointer ${
              activeTab === "overview"
                ? "bg-brand-ink text-white"
                : "text-brand-muted hover:text-brand-ink"
            }`}
          >
            成绩概览
          </button>
          <button
            onClick={() => setActiveTab("wrong")}
            className={`px-4 py-2 rounded-lg text-sm font-medium font-body transition-all cursor-pointer ${
              activeTab === "wrong"
                ? "bg-brand-ink text-white"
                : "text-brand-muted hover:text-brand-ink"
            }`}
          >
            错题集
          </button>
          <button
            onClick={() => setActiveTab("suggestions")}
            className={`px-4 py-2 rounded-lg text-sm font-medium font-body transition-all cursor-pointer ${
              activeTab === "suggestions"
                ? "bg-brand-ink text-white"
                : "text-brand-muted hover:text-brand-ink"
            }`}
          >
            学习建议
          </button>
        </div>

        {activeTab === "overview" && (
          <div className="glass-card rounded-2xl p-6 mb-6">
            <h3 className="font-display font-bold text-brand-ink mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-accent-electric" />
              知识点掌握情况
            </h3>
            <div className="space-y-4">
              {weakPoints.map((point) => (
                <div key={point.id} className="p-4 rounded-xl bg-white/40">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-brand-ink">{point.title}</span>
                    <span
                      className={`text-sm font-bold ${
                        point.accuracy >= 60 ? "text-accent-cyan" : point.accuracy >= 40 ? "text-accent-amber" : "text-accent-rose"
                      }`}
                    >
                      {point.accuracy}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-black/5 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        point.accuracy >= 60 ? "bg-accent-cyan" : point.accuracy >= 40 ? "bg-accent-amber" : "bg-accent-rose"
                      }`}
                      style={{ width: `${point.accuracy}%` }}
                    />
                  </div>
                  <p className="text-xs text-brand-muted font-body mt-2">{point.suggestion}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "wrong" && (
          <div className="glass-card rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-brand-ink flex items-center gap-2">
                <XCircle className="w-5 h-5 text-accent-rose" />
                错题集
              </h3>
              <button
                onClick={() => {
                  localStorage.removeItem("wrongQuestions");
                  setPersistentWrongQuestions([]);
                }}
                className="text-xs text-brand-muted hover:text-accent-rose transition-colors cursor-pointer"
              >
                清空错题
              </button>
            </div>
            {persistentWrongQuestions.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-accent-cyan/50 mx-auto mb-4" />
                <p className="text-brand-muted font-body">太棒了！没有错题</p>
              </div>
            ) : (
              <div className="space-y-4">
                {persistentWrongQuestions.map((q, index) => (
                  <div key={`${q.id}-${index}`} className="p-4 rounded-xl bg-accent-rose/5 border border-accent-rose/20">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="badge badge-rose">{q.type === "choice" ? "选择题" : q.type === "judge" ? "判断题" : "填空题"}</span>
                      <XCircle className="w-4 h-4 text-accent-rose" />
                    </div>
                    <p className="text-sm font-body text-brand-ink mb-3">{q.question}</p>
                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <span className="text-brand-muted">你的答案：</span>
                        <span className="text-accent-rose font-medium">
                          {q.type === "judge" ? (q.userAnswer === "true" ? "正确" : "错误") : q.userAnswer}
                        </span>
                      </div>
                      <div>
                        <span className="text-brand-muted">正确答案：</span>
                        <span className="text-accent-cyan font-medium">
                          {q.type === "judge" ? (q.correctAnswer === "true" ? "正确" : "错误") : q.correctAnswer}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-brand-muted mt-2">
                      <span className="font-medium text-brand-ink">解析：</span>
                      {q.explanation}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "suggestions" && (
          <div className="glass-card rounded-2xl p-6 mb-6">
            <h3 className="font-display font-bold text-brand-ink mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent-electric" />
              AI 学习建议
            </h3>
            <div className="space-y-4">
              {studySuggestions.map((suggestion, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-white/40">
                  <div className="w-6 h-6 rounded-lg bg-accent-electric/10 flex items-center justify-center text-accent-electric text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <p className="text-sm font-body text-brand-muted">{suggestion}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <Link
            href="/explore"
            className="flex-1 h-12 rounded-xl glass-card text-brand-ink font-medium font-body hover:bg-white/80 transition-all duration-200 flex items-center justify-center"
          >
            返回首页
          </Link>
          <Link
            href="/explore/quiz"
            className="flex-1 h-12 rounded-xl bg-brand-ink text-white font-medium font-body hover:bg-brand-ink/90 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            重新练习
          </Link>
        </div>
      </section>
    </div>
  );
}

