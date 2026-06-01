"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  ChevronRight,
  FileQuestion,
  FileText,
  GraduationCap,
  ImageIcon,
  Lightbulb,
  Loader2,
  Microscope,
  ScanLine,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import {
  PHOTO_PIPELINE_BACKEND,
  type PhotoLearningAnalysis,
  toDisplayOptions,
  toQuizQuestions,
} from "@/lib/photoLearningPipeline";

const ACCEPTED_TYPES = "image/*,application/pdf,.docx,text/plain,.md";

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
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState("等待上传文件");
  const [result, setResult] = useState<PhotoLearningAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setUploadedFile(file);
    setPreviewUrl(file.type.startsWith("image/") ? URL.createObjectURL(file) : null);
    setResult(null);
    setError(null);
    setStatusText("文件已就绪，等待开始解析");
  };

  const handleClear = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setUploadedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    setStatusText("等待上传文件");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAnalyze = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    setError(null);
    setStatusText("正在上传文件并调用后端真实 OCR");

    try {
      const form = new FormData();
      form.append("file", uploadedFile);

      const response = await fetch(`${PHOTO_PIPELINE_BACKEND}/api/photo-learning/full-pipeline`, {
        method: "POST",
        body: form,
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({ detail: "知识探索处理失败" }));
        throw new Error(payload.detail || "知识探索处理失败");
      }

      setStatusText("OCR 已完成，正在整理后端 LLM 解析结果");
      const payload = (await response.json()) as PhotoLearningAnalysis;
      setResult(payload);
      setStatusText("真实 OCR + 后端 LLM 解析完成");
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "知识探索处理失败";
      setError(message);
      setStatusText("处理失败");
    } finally {
      setIsProcessing(false);
    }
  };

  const quizQuestions = result ? toQuizQuestions(result.questions) : [];

  const handleStartQuiz = () => {
    if (quizQuestions.length === 0) {
      window.alert("当前结果中没有可直接进入测验的题目。请先完成解析，或改用拍照学练查看完整题型。");
      return;
    }

    localStorage.setItem("quizData", JSON.stringify({ questions: quizQuestions }));
    router.push("/explore/quiz");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[calc(var(--nav-height)+2rem)] pb-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-electric/8 text-accent-electric text-[11px] font-semibold font-body mb-4">
            <ScanLine className="w-3 h-3" />
            真实图片 OCR + 后端真实 LLM 解析
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">知识探索中心</h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            上传教材图片、PDF、DOCX 或文本文件，页面会直接调用后端 `photo_learning` 全链路，完成真实 OCR、关键词提取、知识匹配和题目生成。
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[420px_minmax(0,1fr)] gap-6">
          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Upload className="w-5 h-5 text-blue-500" />
                <h2 className="font-semibold text-gray-800">上传教材</h2>
              </div>
              <div
                className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-blue-400 transition-colors cursor-pointer bg-white/50"
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
                    <img src={previewUrl} alt="preview" className="max-h-64 mx-auto rounded-xl shadow-md mb-3" />
                    <p className="text-sm text-gray-700 font-medium break-all">{uploadedFile?.name}</p>
                    <p className="text-xs text-gray-500 mt-1">图片将先走后端 OCR，再走后端 LLM 解析。</p>
                  </div>
                ) : uploadedFile ? (
                  <div>
                    <FileText className="w-10 h-10 text-blue-500 mx-auto mb-3" />
                    <p className="text-sm text-gray-700 font-medium break-all">{uploadedFile.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{Math.round(uploadedFile.size / 1024)} KB</p>
                  </div>
                ) : (
                  <div>
                    <ImageIcon className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-700 font-medium">点击上传图片、PDF、DOCX 或文本</p>
                    <p className="text-xs text-gray-500 mt-1">支持图片 OCR，不再只限 PDF / DOCX</p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3 mt-5">
                <button
                  onClick={handleAnalyze}
                  disabled={!uploadedFile || isProcessing}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {isProcessing ? "处理中" : "开始真实解析"}
                </button>
                <button
                  onClick={handleClear}
                  disabled={isProcessing && !uploadedFile}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 transition-all"
                >
                  <X className="w-4 h-4" />
                  清空
                </button>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <Loader2 className={`w-4 h-4 ${isProcessing ? "animate-spin text-blue-500" : "text-gray-400"}`} />
                <h2 className="font-semibold text-gray-800">处理状态</h2>
              </div>
              <p className="text-sm text-gray-700">{statusText}</p>
              {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
              <p className="text-xs text-gray-500 mt-3">
                后端地址：{PHOTO_PIPELINE_BACKEND}
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-blue-500" />
                <h2 className="font-semibold text-gray-800">链路说明</h2>
              </div>
              <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
                <li>图片：后端 EasyOCR 本地识别</li>
                <li>PDF：后端 PyMuPDF 提取文本</li>
                <li>DOCX：后端 python-docx 提取文本</li>
                <li>解析：统一走后端 `photo_learning` 的真实 LLM 管线</li>
              </ul>
              <Link href="/photo-learning" className="inline-flex items-center gap-1 text-sm text-blue-600 mt-4 hover:text-blue-700">
                打开拍照学练
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-6 md:p-8">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-500" />
                  <h2 className="font-semibold text-gray-800">解析结果</h2>
                </div>
                {result?.ocr_engine && (
                  <span className="text-xs text-gray-500">
                    OCR: {result.ocr_engine}
                    {typeof result.ocr_char_count === "number" ? ` · ${result.ocr_char_count} 字` : ""}
                  </span>
                )}
              </div>

              {result ? (
                <div className="space-y-6">
                  <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-5">
                    <p className="text-sm text-gray-700 leading-7 whitespace-pre-wrap">{result.summary}</p>
                    {result.domain && <p className="text-xs text-blue-700 mt-3">领域判断：{result.domain}</p>}
                  </div>

                  <div>
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-3">
                      <Microscope className="w-5 h-5 text-indigo-600" /> 重点关键词
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {result.extracted_keywords.map((keyword) => (
                        <span key={keyword} className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-100 text-indigo-700 rounded-full text-sm font-medium border border-indigo-200">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>

                  {Array.isArray(result.learning_suggestions) && result.learning_suggestions.length > 0 && (
                    <div>
                      <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-3">
                        <Lightbulb className="w-5 h-5 text-orange-500" /> 学习建议
                      </h3>
                      <div className="space-y-3">
                        {result.learning_suggestions.map((tip, index) => (
                          <div key={`${tip}-${index}`} className="p-4 rounded-xl bg-white/70 border border-gray-100 text-sm text-gray-700 leading-7">
                            {tip}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.matched_concepts.length > 0 && (
                    <div>
                      <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-3">
                        <GraduationCap className="w-5 h-5 text-blue-600" /> 匹配知识点
                      </h3>
                      <div className="space-y-3">
                        {result.matched_concepts.map((concept) => (
                          <div key={concept.id} className="p-4 rounded-xl bg-white/70 border border-gray-100">
                            <p className="font-medium text-gray-800">{concept.name}</p>
                            {concept.category && <p className="text-xs text-blue-700 mt-1">{concept.category}</p>}
                            {concept.definition && <p className="text-sm text-gray-600 mt-2 leading-6">{concept.definition}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.matched_papers.length > 0 && (
                    <div>
                      <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-3">
                        <FileText className="w-5 h-5 text-indigo-600" /> 关联文献
                      </h3>
                      <div className="space-y-3">
                        {result.matched_papers.map((paper) => (
                          <div key={paper.id} className="p-4 rounded-xl bg-white/70 border border-gray-100">
                            <p className="font-medium text-gray-800">{paper.title_zh || paper.title}</p>
                            {paper.direction && <p className="text-xs text-blue-700 mt-1">{paper.direction}</p>}
                            {paper.core_problem && <p className="text-sm text-gray-600 mt-2 leading-6">{paper.core_problem}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                        <FileQuestion className="w-5 h-5 text-blue-600" /> 自动题目
                      </h3>
                      <button
                        onClick={handleStartQuiz}
                        disabled={quizQuestions.length === 0}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-ink text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        进入测验
                      </button>
                    </div>
                    <div className="space-y-3">
                      {result.questions.map((question) => {
                        const options = toDisplayOptions(question.options);
                        return (
                          <div key={question.id} className="p-4 rounded-xl bg-white/70 border border-gray-100">
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

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">OCR 文本</h3>
                    <textarea
                      value={result.raw_text}
                      readOnly
                      rows={12}
                      className="w-full rounded-2xl border border-gray-200 bg-white/80 p-4 text-sm text-gray-700 outline-none resize-y"
                    />
                  </div>
                </div>
              ) : (
                <div className="min-h-[480px] flex flex-col items-center justify-center text-gray-400">
                  <BookOpen className="w-16 h-16 mb-4 opacity-50" />
                  <p className="text-center max-w-md">
                    上传文件后，这里会展示后端真实 OCR 与后端真实 LLM 的完整解析结果。
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
