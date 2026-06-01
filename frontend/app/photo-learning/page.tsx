"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Camera,
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

export default function PhotoLearningPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState("");
  const [ocrEngine, setOcrEngine] = useState("");
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [statusText, setStatusText] = useState("等待上传图片或文档");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PhotoLearningAnalysis | null>(null);

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
    setOcrText("");
    setOcrEngine("");
    setResult(null);
    setError(null);
    setStatusText("文件已就绪，可以先做 OCR，再做 LLM 解析");
  };

  const handleClear = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setUploadedFile(null);
    setPreviewUrl(null);
    setOcrText("");
    setOcrEngine("");
    setResult(null);
    setError(null);
    setStatusText("等待上传图片或文档");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleStartOcr = async () => {
    if (!uploadedFile) return;

    setIsRecognizing(true);
    setError(null);
    setStatusText("正在调用后端真实 OCR");

    try {
      const form = new FormData();
      form.append("file", uploadedFile);

      const response = await fetch(`${PHOTO_PIPELINE_BACKEND}/api/photo-learning/ocr`, {
        method: "POST",
        body: form,
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({ detail: "OCR 失败" }));
        throw new Error(payload.detail || "OCR 失败");
      }

      const payload = (await response.json()) as {
        text: string;
        engine: string;
        char_count: number;
      };

      setOcrText(payload.text);
      setOcrEngine(payload.engine);
      setStatusText(`OCR 完成，识别到 ${payload.char_count} 字`);
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "OCR 失败";
      setError(message);
      setStatusText("OCR 失败");
    } finally {
      setIsRecognizing(false);
    }
  };

  const handleAnalyze = async () => {
    if (!ocrText.trim()) return;

    setIsAnalyzing(true);
    setError(null);
    setStatusText("正在调用后端真实 LLM 解析 OCR 文本");

    try {
      const response = await fetch(`${PHOTO_PIPELINE_BACKEND}/api/photo-learning/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: ocrText }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({ detail: "LLM 解析失败" }));
        throw new Error(payload.detail || "LLM 解析失败");
      }

      const payload = (await response.json()) as PhotoLearningAnalysis;
      setResult({ ...payload, ocr_engine: ocrEngine || payload.ocr_engine });
      setStatusText("OCR 后端 LLM 解析完成");
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "LLM 解析失败";
      setError(message);
      setStatusText("LLM 解析失败");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const quizQuestions = result ? toQuizQuestions(result.questions) : [];

  const handleStartQuiz = () => {
    if (quizQuestions.length === 0) {
      window.alert("当前结果中没有可直接进入测验的题目。请继续在下方查看完整解析。");
      return;
    }

    localStorage.setItem("quizData", JSON.stringify({ questions: quizQuestions }));
    router.push("/explore/quiz");
  };

  return (
    <div className="min-h-screen pt-[var(--nav-height)] px-6 md:px-10 pb-20">
      <div className="max-w-6xl mx-auto pt-8 md:pt-16">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-electric/8 text-accent-electric text-[11px] font-semibold font-body mb-5">
            <ScanLine className="w-3 h-3" />
            真实 OCR + 后端真实 LLM 解析
          </div>
          <h1 className="font-display font-extrabold text-brand-ink leading-[1.1] tracking-[-0.03em] mb-3" style={{ fontSize: "clamp(28px, 4vw, 48px)" }}>
            拍照学练
          </h1>
          <p className="text-brand-muted text-base md:text-lg font-body max-w-2xl mx-auto">
            图片先走真实 OCR，得到文本后再直连后端 `photo_learning/analyze`，输出关键词、知识匹配、学习建议和题目。
          </p>
        </div>

        <div className="max-w-3xl mx-auto mb-8">
          <div className="glass-card rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-accent-electric/10 flex items-center justify-center">
                <Camera className="w-5 h-5 text-accent-electric" />
              </div>
              <div>
                <h2 className="font-display font-bold text-sm text-brand-ink">上传教材图片或文档</h2>
                <p className="text-xs text-brand-muted font-body">支持 JPG、PNG、PDF、DOCX、TXT、MD</p>
              </div>
            </div>

            <div className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${uploadedFile ? "border-accent-electric/30 bg-accent-electric/5" : "border-brand-faint/20 hover:border-accent-electric/20 bg-white/30"}`}>
              {previewUrl ? (
                <div>
                  <img src={previewUrl} alt="Uploaded" className="max-h-64 mx-auto rounded-xl shadow-md mb-3" />
                  <p className="text-xs text-brand-muted font-body mb-2 break-all">{uploadedFile?.name}</p>
                  <button onClick={handleClear} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-accent-rose/10 text-accent-rose text-xs font-medium hover:bg-accent-rose/20 transition-colors cursor-pointer">
                    <X className="w-3 h-3" /> 移除
                  </button>
                </div>
              ) : uploadedFile ? (
                <div>
                  <FileText className="w-10 h-10 text-accent-electric mx-auto mb-3" />
                  <p className="text-sm text-brand-muted font-body mb-1 break-all">{uploadedFile.name}</p>
                  <p className="text-xs text-brand-faint font-body">文件已就绪</p>
                </div>
              ) : (
                <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer">
                  <ImageIcon className="w-10 h-10 text-brand-faint/40 mx-auto mb-3" />
                  <p className="text-sm text-brand-muted font-body mb-1">点击上传图片、PDF 或 DOCX</p>
                  <p className="text-xs text-brand-faint font-body">先 OCR，再进入后端 LLM 解析</p>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept={ACCEPTED_TYPES} onChange={handleFileChange} className="hidden" />
            </div>

            <div className="flex flex-wrap gap-3 mt-5">
              <button onClick={handleStartOcr} disabled={!uploadedFile || isRecognizing}
                className="btn-hero cursor-pointer inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {isRecognizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ScanLine className="w-4 h-4" />}
                {isRecognizing ? "OCR 识别中" : "开始真实 OCR"}
              </button>
              <button onClick={handleAnalyze} disabled={!ocrText.trim() || isAnalyzing}
                className="btn-hero-secondary cursor-pointer inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {isAnalyzing ? "LLM 解析中" : "开始后端 LLM 解析"}
              </button>
              <button onClick={handleClear}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 border border-black/5 text-brand-ink hover:bg-white transition-all cursor-pointer">
                <X className="w-4 h-4" /> 清空
              </button>
            </div>

            <p className="text-xs text-brand-faint font-body mt-4">{statusText}</p>
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
          </div>
        </div>

        {ocrText && (
          <div className="max-w-3xl mx-auto mb-8">
            <div className="glass-card rounded-2xl p-6 md:p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-accent-amber" />
                  <h2 className="font-display font-bold text-sm text-brand-ink">OCR 文本</h2>
                </div>
                <span className="text-xs text-brand-faint font-body">
                  {ocrText.length} 字符{ocrEngine ? ` · ${ocrEngine}` : ""}
                </span>
              </div>
              <textarea
                value={ocrText}
                onChange={(event) => setOcrText(event.target.value)}
                rows={10}
                className="w-full rounded-xl bg-white/40 border border-black/5 p-4 text-sm font-body text-brand-ink outline-none focus:border-accent-electric/20 transition-all resize-y min-h-[180px]"
              />
            </div>
          </div>
        )}

        {result && (
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="glass-card rounded-2xl p-6 md:p-8">
              <div className="flex items-center gap-2 mb-5">
                <BookOpen className="w-5 h-5 text-accent-electric" />
                <h2 className="font-display font-bold text-sm text-brand-ink">LLM 解析结果</h2>
              </div>

              <div className="p-4 rounded-xl bg-accent-electric/5 border border-accent-electric/10 mb-5">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-accent-electric shrink-0 mt-0.5" />
                  <p className="text-sm text-brand-ink font-body leading-relaxed whitespace-pre-wrap">{result.summary}</p>
                </div>
                {result.domain && <p className="text-xs text-accent-electric mt-3">领域判断：{result.domain}</p>}
              </div>

              <div className="mb-5">
                <p className="text-xs font-semibold text-brand-faint uppercase tracking-wider mb-2">识别关键词</p>
                <div className="flex flex-wrap gap-1.5">
                  {result.extracted_keywords.map((keyword) => (
                    <span key={keyword} className="px-2.5 py-1 rounded-full text-xs font-medium bg-accent-electric/10 text-accent-electric font-body">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              {Array.isArray(result.learning_suggestions) && result.learning_suggestions.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs font-semibold text-brand-faint uppercase tracking-wider mb-2">学习建议</p>
                  <div className="space-y-2">
                    {result.learning_suggestions.map((tip, index) => (
                      <div key={`${tip}-${index}`} className="p-3 rounded-xl bg-white/50 border border-black/5 text-sm text-brand-muted leading-relaxed">
                        {tip}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.matched_concepts.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs font-semibold text-brand-faint uppercase tracking-wider mb-2">知识点匹配</p>
                  <div className="space-y-2">
                    {result.matched_concepts.map((concept) => (
                      <div key={concept.id} className="flex items-start gap-2 p-3 rounded-xl bg-white/40 border border-black/5">
                        <GraduationCap className="w-4 h-4 text-accent-electric shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-brand-ink">{concept.name}</p>
                          {concept.definition && <p className="text-xs text-brand-muted mt-1">{concept.definition}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.matched_papers.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs font-semibold text-brand-faint uppercase tracking-wider mb-2">关联文献</p>
                  <div className="space-y-2">
                    {result.matched_papers.map((paper) => (
                      <div key={paper.id} className="p-3 rounded-xl bg-white/40 border border-black/5">
                        <p className="text-sm font-semibold text-brand-ink">{paper.title_zh || paper.title}</p>
                        {paper.direction && <p className="text-xs text-accent-electric mt-1">{paper.direction}</p>}
                        {paper.core_problem && <p className="text-xs text-brand-muted mt-2 leading-relaxed">{paper.core_problem}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="glass-card rounded-2xl p-6 md:p-8">
              <div className="flex items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-2">
                  <Microscope className="w-5 h-5 text-accent-amber" />
                  <h2 className="font-display font-bold text-sm text-brand-ink">自动题目</h2>
                </div>
                <button onClick={handleStartQuiz} disabled={quizQuestions.length === 0}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-ink text-white disabled:opacity-50 disabled:cursor-not-allowed">
                  <FileQuestion className="w-4 h-4" /> 进入测验
                </button>
              </div>

              <div className="space-y-4">
                {result.questions.map((question) => {
                  const options = toDisplayOptions(question.options);
                  return (
                    <div key={question.id} className="rounded-xl border border-black/5 bg-white/40 overflow-hidden p-4">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-accent-electric/10 text-accent-electric">
                        {getQuestionTypeLabel(question.type)}
                      </span>
                      <p className="text-sm text-brand-ink font-body leading-relaxed mt-2">{question.question}</p>
                      {options.length > 0 && (
                        <div className="mt-3 space-y-1">
                          {options.map((option) => (
                            <p key={option} className="text-sm text-brand-muted">{option}</p>
                          ))}
                        </div>
                      )}
                      <div className="mt-3 text-sm text-brand-ink"><span className="font-semibold">答案：</span>{question.answer}</div>
                      <div className="mt-2 text-sm text-brand-muted leading-relaxed"><span className="font-semibold text-brand-ink">解析：</span>{question.explanation}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="text-center pb-4">
              <Link href="/explore" className="inline-flex items-center gap-2 text-sm text-accent-electric hover:text-brand-ink transition-colors">
                打开知识探索
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
