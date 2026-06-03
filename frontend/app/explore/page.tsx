"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Upload, FileText, X, Loader2, Send, User, Bot,
  BookOpen, Lightbulb, Sparkles, FileQuestion, ChevronRight,
  Microscope, Camera, ScanLine, ImageIcon, GraduationCap,
} from "lucide-react";
import {
  PHOTO_PIPELINE_BACKEND,
  type PhotoLearningAnalysis,
  toDisplayOptions,
  toQuizQuestions,
} from "@/lib/photoLearningPipeline";

const ACCEPTED_TYPES = "image/*,application/pdf,.docx,text/plain,.md";

interface Message { role: "user" | "ai"; content: string; }

interface KnowledgePoint { id: number; title: string; content: string; }
interface StudyTip { id: number; title: string; content: string; }
interface SummaryData { knowledgePoints: KnowledgePoint[]; keywords: string[]; studyTips: StudyTip[]; ocrEngine?: string; }

function getQuestionTypeLabel(type: string): string {
  if (type === "choice") return "选择题";
  if (type === "truefalse") return "判断题";
  if (type === "short_answer") return "简答题";
  if (type === "research") return "科研拓展题";
  if (type === "industry") return "产业联系题";
  return type;
}

export default function ExplorePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState("等待上传文件");
  const [backendResult, setBackendResult] = useState<PhotoLearningAnalysis | null>(null);
  const [frontendSummary, setFrontendSummary] = useState<SummaryData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "你好，我是 BioMentor AI 导师。上传教材文件，系统会智能分析知识点。" },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  useEffect(() => { 
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); 
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [messages, previewUrl]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setUploadedFile(file);
    setPreviewUrl(file.type.startsWith("image/") ? URL.createObjectURL(file) : null);
    setBackendResult(null);
    setFrontendSummary(null);
    setError(null);
    setStatusText("文件已就绪，等待开始解析");
    setMessages((prev) => [...prev, { role: "ai", content: `已选择文件：${file.name}。点击"开始解析"进行分析。` }]);
  };

  const handleClear = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setUploadedFile(null);
    setPreviewUrl(null);
    setBackendResult(null);
    setFrontendSummary(null);
    setError(null);
    setStatusText("等待上传文件");
    setMessages((prev) => [...prev, { role: "ai", content: "文件已清空，请重新上传。" }]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAnalyze = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    setError(null);

    const isPDF = uploadedFile.type === "application/pdf";

    try {
      if (isPDF) {
        setStatusText("正在提取 PDF 文本并调用 DeepSeek 分析…");
        setMessages((prev) => [...prev, { role: "ai", content: "正在提取 PDF 文本，并交给 DeepSeek 分析知识点…" }]);

        const base64Data = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(uploadedFile);
        });

        setStatusText("DeepSeek API 正在分析 PDF 内容…");
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: base64Data, fileName: uploadedFile.name }),
        });

        console.log("[Explore PDF] API响应状态码:", response.status);
        const responseText = await response.text();
        console.log("[Explore PDF] API响应内容:", responseText.substring(0, 500));

        let result;
        try {
          result = JSON.parse(responseText);
        } catch (jsonError) {
          throw new Error(`JSON解析失败: ${responseText.substring(0, 200)}`);
        }

        if (result.success) {
          const data = result.data;
          console.log("[Explore PDF] 解析结果:", data);
          
          setFrontendSummary({ 
            knowledgePoints: data.knowledgePoints || [],
            keywords: data.keywords || data.keyword || [],
            studyTips: data.studyTips || data.learningSuggestions || [],
            ocrEngine: "PDF 文本提取 + DeepSeek"
          });
          setStatusText("PDF 分析完成（文本提取 + DeepSeek）");
          setMessages((prev) => [...prev, {
            role: "ai",
            content: `PDF解析完成！已提取 ${data.knowledgePoints?.length || 0} 个核心知识点和 ${(data.keywords || data.keyword || []).length || 0} 个关键词。`,
          }]);
        } else {
          throw new Error(result.error || "PDF分析失败");
        }
      } else {
        setStatusText("正在上传文件并调用后端真实 OCR…");
        setMessages((prev) => [...prev, { role: "ai", content: `正在调用后端真实 OCR + LLM 解析…` }]);

        const form = new FormData();
        form.append("file", uploadedFile);

        const response = await fetch(`${PHOTO_PIPELINE_BACKEND}/api/photo-learning/full-pipeline`, {
          method: "POST",
          body: form,
        });

        console.log("[Explore Backend] API响应状态码:", response.status);
        const responseText = await response.text();
        console.log("[Explore Backend] API响应内容:", responseText.substring(0, 500));

        if (!response.ok) {
          let payload;
          try {
            payload = JSON.parse(responseText);
          } catch {
            throw new Error(`后端处理失败: ${responseText.substring(0, 200)}`);
          }
          throw new Error(payload.detail || "后端处理失败");
        }

        setStatusText("OCR 已完成，正在整理后端 LLM 解析结果");
        let payload;
        try {
          payload = JSON.parse(responseText) as PhotoLearningAnalysis;
        } catch (jsonError) {
          throw new Error(`JSON解析失败: ${responseText.substring(0, 200)}`);
        }
        
        setBackendResult(payload);
        setStatusText(`真实 OCR + 后端 LLM 解析完成 (${payload.ocr_engine || "Backend"})`);
        setMessages((prev) => [...prev, {
          role: "ai",
          content: `解析完成！已提取 ${payload.extracted_keywords?.length || 0} 个关键词和 ${payload.questions?.length || 0} 个题目。`,
        }]);
      }
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "处理失败";
      setError(message);
      setStatusText("处理失败");
      setMessages((prev) => [...prev, { role: "ai", content: `抱歉，处理失败：${message}` }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || isChatLoading) return;
    const userMsg: Message = { role: "user", content: chatInput.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsChatLoading(true);

    try {
      let contextText = "暂无教材内容";
      
      if (frontendSummary) {
        contextText = frontendSummary.knowledgePoints.map((kp) => `${kp.title}: ${kp.content}`).join("\n");
      } else if (backendResult) {
        contextText = backendResult.summary || backendResult.raw_text || "暂无教材内容";
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: chatInput.trim(), context: contextText }),
      });

      console.log("[Explore Chat] API响应状态码:", response.status);
      const responseText = await response.text();
      console.log("[Explore Chat] API响应内容:", responseText.substring(0, 500));

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (jsonError) {
        throw new Error(`JSON解析失败: ${responseText.substring(0, 200)}`);
      }

      setMessages((prev) => [...prev, { role: "ai", content: result.success ? result.message : "抱歉，回答失败。" }]);
    } catch (error) {
      console.error("聊天失败:", error);
      setMessages((prev) => [...prev, { role: "ai", content: `抱歉，${error instanceof Error ? error.message : "网络错误"}` }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if ((!frontendSummary && !backendResult) || isGeneratingQuiz) return;
    setIsGeneratingQuiz(true);

    try {
      let contentText = "";
      
      if (frontendSummary) {
        contentText = frontendSummary.knowledgePoints.map((kp) => `${kp.title}: ${kp.content}`).join("\n")
          + "\n\n关键词: " + (frontendSummary.keywords || []).join(", ");
      } else if (backendResult) {
        contentText = backendResult.summary || backendResult.raw_text || "";
      }

      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: contentText }),
      });

      console.log("[Explore Quiz] API响应状态码:", response.status);
      const responseText = await response.text();
      console.log("[Explore Quiz] API响应内容:", responseText.substring(0, 500));

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (jsonError) {
        throw new Error(`JSON解析失败: ${responseText.substring(0, 200)}`);
      }

      if (result.success) {
        localStorage.setItem("quizData", JSON.stringify(result.data));
        router.push("/explore/quiz");
      } else {
        throw new Error(result.error || "生成练习题失败");
      }
    } catch (error) {
      console.error("生成练习题失败:", error);
      alert(`生成练习题失败: ${error instanceof Error ? error.message : "未知错误"}`);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleStartQuiz = () => {
    if (!backendResult || backendResult.questions.length === 0) {
      window.alert("当前结果中没有可直接进入测验的题目。请先完成解析。");
      return;
    }
    const quizQuestions = toQuizQuestions(backendResult.questions);
    localStorage.setItem("quizData", JSON.stringify({ questions: quizQuestions }));
    router.push("/explore/quiz");
  };

  const hasSummary = frontendSummary || backendResult;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[calc(var(--nav-height)+2rem)] pb-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-electric/8 text-accent-electric text-[11px] font-semibold font-body mb-4">
            <ScanLine className="w-3 h-3" />
            智能解析：PDF 文本提取 + DeepSeek，其他文件后端 OCR
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">知识探索中心</h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            上传教材文件，PDF 会先提取可复制文本再调用 DeepSeek 分析，图片/DOCX/文本将走后端真实 OCR + LLM 解析。
          </p>
        </div>

        {/* 文件上传区域 - 上方 */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-500" />
              <h2 className="font-semibold text-gray-800">上传教材</h2>
              <span className="text-sm text-gray-500">支持图片、PDF、DOCX、文本</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className={`w-4 h-4 ${isProcessing ? "animate-spin text-blue-500" : "text-gray-400"}`} />
              <span>{statusText}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6">
            <div
              className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer bg-white/50"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_TYPES}
                className="hidden"
                onChange={handleFileChange}
              />
              {previewUrl ? (
                <div>
                  <img src={previewUrl} alt="preview" className="max-h-48 mx-auto rounded-xl shadow-md mb-3" />
                  <p className="text-sm text-gray-700 font-medium break-all">{uploadedFile?.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {uploadedFile?.type === "application/pdf" 
                      ? "PDF 将提取文本后调用 DeepSeek 分析"
                      : "图片将先走后端 OCR，再走后端 LLM 解析"}
                  </p>
                </div>
              ) : uploadedFile ? (
                <div>
                  <FileText className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                  <p className="text-sm text-gray-700 font-medium break-all">{uploadedFile.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatFileSize(uploadedFile.size)}</p>
                </div>
              ) : (
                <div>
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-700 font-medium">点击或拖拽上传图片、PDF、DOCX 或文本</p>
                  <p className="text-xs text-gray-500 mt-1">PDF 文本提取 + DeepSeek，其他文件走后端 OCR</p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <h3 className="font-medium text-gray-800 mb-2">处理链路说明</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li><strong>PDF</strong>：提取可复制文本后调用 DeepSeek 分析</li>
                  <li><strong>图片</strong>：后端 EasyOCR 本地识别</li>
                  <li><strong>DOCX</strong>：后端 python-docx 提取文本</li>
                  <li><strong>文本</strong>：后端 LLM 管线统一解析</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAnalyze}
                  disabled={!uploadedFile || isProcessing}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {isProcessing ? "处理中" : "开始解析"}
                </button>
                <button
                  onClick={handleClear}
                  disabled={isProcessing && !uploadedFile}
                  className="px-5 py-3 rounded-xl bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {error && (
                <p className="text-sm text-red-600 p-3 bg-red-50 rounded-xl">{error}</p>
              )}
            </div>
          </div>
        </div>

        {/* 拍照学练入口 */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-accent-electric" />
              <span className="text-gray-600">或使用拍照学练（高级模式）</span>
            </div>
            <Link href="/photo-learning" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-electric text-white text-sm hover:bg-brand-ink transition-colors">
              <ScanLine className="w-4 h-4" />
              开始拍照学练
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 下方：知识总结（左）+ AI聊天（右） */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
          {/* 知识总结 */}
          <div className="glass-card rounded-2xl p-6 h-[600px] overflow-y-auto">
            <div className="flex items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-500" />
                <h2 className="font-semibold text-gray-800">知识总结</h2>
              </div>
              {(frontendSummary?.ocrEngine || backendResult?.ocr_engine) && (
                <span className="text-xs text-gray-500">
                  OCR: {frontendSummary?.ocrEngine || backendResult?.ocr_engine}
                  {backendResult?.ocr_char_count ? ` · ${backendResult.ocr_char_count} 字` : ""}
                </span>
              )}
            </div>

            {frontendSummary ? (
              <div className="space-y-6">
                {/* 核心知识点 */}
                <div className="p-4 bg-white/70 rounded-xl border border-gray-100">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                    <Sparkles className="w-5 h-5 text-yellow-500" /> 核心知识点
                  </h3>
                  <ul className="space-y-3">
                    {frontendSummary.knowledgePoints.map((point, index) => (
                      <li key={point.id || index} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{point.title}</p>
                          <p className="text-gray-600 text-sm mt-1 leading-relaxed">{point.content}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 重点关键词 */}
                {(frontendSummary.keywords && frontendSummary.keywords.length > 0) && (
                  <div className="p-4 bg-white/70 rounded-xl border border-gray-100">
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                      <Microscope className="w-5 h-5 text-indigo-600" /> 重点关键词
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {frontendSummary.keywords.map((keyword, index) => (
                        <span key={index} className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-100 text-indigo-700 rounded-full text-sm font-medium border border-indigo-200">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 学习建议 */}
                {(frontendSummary.studyTips && frontendSummary.studyTips.length > 0) && (
                  <div className="p-4 bg-white/70 rounded-xl border border-gray-100">
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                      <Lightbulb className="w-5 h-5 text-orange-500" /> 学习建议
                    </h3>
                    <ul className="space-y-3">
                      {frontendSummary.studyTips.map((tip, index) => (
                        <li key={tip.id || index} className="flex items-start gap-3 p-3 bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg">
                          <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Lightbulb className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800">{tip.title}</p>
                            <p className="text-gray-600 text-sm mt-1 leading-relaxed">{tip.content}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 关键词为空提示 */}
                {(!frontendSummary.keywords || frontendSummary.keywords.length === 0) && (
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-sm text-gray-500 text-center">暂无关键词数据</p>
                  </div>
                )}

                {/* 学习建议为空提示 */}
                {(!frontendSummary.studyTips || frontendSummary.studyTips.length === 0) && (
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-sm text-gray-500 text-center">暂无学习建议数据</p>
                  </div>
                )}
              </div>
            ) : backendResult ? (
              <div className="space-y-6">
                <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-5">
                  <p className="text-sm text-gray-700 leading-7 whitespace-pre-wrap">{backendResult.summary}</p>
                  {backendResult.domain && <p className="text-xs text-blue-700 mt-3">领域判断：{backendResult.domain}</p>}
                </div>

                <div className="p-4 bg-white/70 rounded-xl border border-gray-100">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-3">
                    <Microscope className="w-5 h-5 text-indigo-600" /> 重点关键词
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {backendResult.extracted_keywords.map((keyword) => (
                      <span key={keyword} className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-100 text-indigo-700 rounded-full text-sm font-medium border border-indigo-200">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>

                {Array.isArray(backendResult.learning_suggestions) && backendResult.learning_suggestions.length > 0 && (
                  <div className="p-4 bg-white/70 rounded-xl border border-gray-100">
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-3">
                      <Lightbulb className="w-5 h-5 text-orange-500" /> 学习建议
                    </h3>
                    <div className="space-y-3">
                      {backendResult.learning_suggestions.map((tip, index) => (
                        <div key={`${tip}-${index}`} className="p-3 bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg text-sm text-gray-700 leading-7">
                          {tip}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {backendResult.matched_concepts.length > 0 && (
                  <div className="p-4 bg-white/70 rounded-xl border border-gray-100">
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-3">
                      <GraduationCap className="w-5 h-5 text-blue-600" /> 匹配知识点
                    </h3>
                    <div className="space-y-3">
                      {backendResult.matched_concepts.map((concept) => (
                        <div key={concept.id} className="p-3 rounded-lg bg-gray-50">
                          <p className="font-medium text-gray-800">{concept.name}</p>
                          {concept.category && <p className="text-xs text-blue-700 mt-1">{concept.category}</p>}
                          {concept.definition && <p className="text-sm text-gray-600 mt-2 leading-6">{concept.definition}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {backendResult.matched_papers.length > 0 && (
                  <div className="p-4 bg-white/70 rounded-xl border border-gray-100">
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-3">
                      <FileText className="w-5 h-5 text-indigo-600" /> 关联文献
                    </h3>
                    <div className="space-y-3">
                      {backendResult.matched_papers.map((paper) => (
                        <div key={paper.id} className="p-3 rounded-lg bg-gray-50">
                          <p className="font-medium text-gray-800">{paper.title_zh || paper.title}</p>
                          {paper.direction && <p className="text-xs text-blue-700 mt-1">{paper.direction}</p>}
                          {paper.core_problem && <p className="text-sm text-gray-600 mt-2 leading-6">{paper.core_problem}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-4 bg-white/70 rounded-xl border border-gray-100">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                      <FileQuestion className="w-5 h-5 text-blue-600" /> 自动题目
                    </h3>
                    <button
                      onClick={handleStartQuiz}
                      disabled={backendResult.questions.length === 0}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-ink text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      进入测验
                    </button>
                  </div>
                  <div className="space-y-3">
                    {backendResult.questions.map((question) => {
                      const options = toDisplayOptions(question.options);
                      return (
                        <div key={question.id} className="p-3 rounded-lg bg-gray-50">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                              {getQuestionTypeLabel(question.type)}
                            </span>
                          </div>
                          <p className="font-medium text-gray-800 leading-6">{question.question}</p>
                          {options.length > 0 && (
                            <div className="mt-3 space-y-1">
                              {options.map((option) => (
                                <p key={option} className="text-sm text-gray-600">{option}</p>
                              ))}
                            </div>
                          )}
                          <p className="text-sm text-gray-700 mt-3"><span className="font-medium">答案：</span>{question.answer}</p>
                          <p className="text-sm text-gray-600 mt-2 leading-6"><span className="font-medium text-gray-700">解析：</span>{question.explanation}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-4 bg-white/70 rounded-xl border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">OCR 文本</h3>
                  <textarea
                    value={backendResult.raw_text}
                    readOnly
                    rows={10}
                    className="w-full rounded-xl border border-gray-200 bg-white/80 p-4 text-sm text-gray-700 outline-none resize-y"
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <BookOpen className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-500 max-w-md">
                  上传教材文件后，系统将自动分析知识点并生成学习建议。
                  您也可以直接向 AI 导师提问学习问题。
                </p>
              </div>
            )}
          </div>

          {/* AI 聊天 */}
          <div className="glass-card rounded-2xl p-5 flex flex-col h-[600px]">
            <div className="flex items-center gap-2 mb-4">
              <Bot className="w-5 h-5 text-blue-500" />
              <h2 className="font-semibold text-gray-800">AI 导师</h2>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "user" ? "bg-blue-500 text-white" : "bg-gradient-to-br from-indigo-500 to-purple-500 text-white"}`}>
                    {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.role === "user" ? "bg-blue-500 text-white rounded-tr-sm" : "bg-white/80 text-gray-800 rounded-tl-sm shadow-sm"}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center"><Bot className="w-4 h-4 text-white" /></div>
                  <div className="bg-white/80 px-4 py-2 rounded-2xl rounded-tl-sm"><Loader2 className="w-4 h-4 animate-spin text-gray-400" /></div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200/50">
              <div className="flex gap-2">
                <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                  placeholder="向AI导师提问…" disabled={isChatLoading}
                  className="flex-1 px-4 py-2.5 bg-white/80 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                <button onClick={handleSendChat} disabled={!chatInput.trim() || isChatLoading}
                  className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all disabled:opacity-50">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 生成练习题按钮 */}
        {hasSummary && !isProcessing && (
          <div className="mt-6 text-center">
            <button onClick={handleGenerateQuiz} disabled={isGeneratingQuiz}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white rounded-2xl font-semibold text-lg hover:from-indigo-700 hover:via-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50">
              {isGeneratingQuiz ? <><Loader2 className="w-5 h-5 animate-spin" /> 生成中…</> : <><FileQuestion className="w-6 h-6" /> 一键生成练习题 <ChevronRight className="w-5 h-5" /></>}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
