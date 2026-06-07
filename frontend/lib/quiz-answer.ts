export interface QuizAnswerLike {
  type?: string;
  userAnswer?: string | null;
  correctAnswer?: string | null;
}

function normalizeText(value: string | null | undefined) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();
}

function normalizeBoolean(value: string | null | undefined) {
  const normalized = normalizeText(value);
  if (["TRUE", "T", "YES", "Y", "1", "正确", "对"].includes(normalized)) return "TRUE";
  if (["FALSE", "F", "NO", "N", "0", "错误", "错"].includes(normalized)) return "FALSE";
  return normalized;
}

function extractChoiceLabel(value: string | null | undefined) {
  const normalized = normalizeText(value);
  const matched = normalized.match(/^([A-D])(?:[\.\):、\s]|$)/);
  return matched ? matched[1] : "";
}

function stripChoiceLabel(value: string | null | undefined) {
  return normalizeText(value).replace(/^([A-D])(?:[\.\):、\s]+|$)/, "").trim();
}

export function isQuizAnswerCorrect(question: QuizAnswerLike) {
  const userAnswer = String(question?.userAnswer || "").trim();
  const correctAnswer = String(question?.correctAnswer || "").trim();
  if (!userAnswer || !correctAnswer) return false;

  if (question?.type === "judge") {
    return normalizeBoolean(userAnswer) === normalizeBoolean(correctAnswer);
  }

  if (question?.type === "choice") {
    const userLabel = extractChoiceLabel(userAnswer);
    const correctLabel = extractChoiceLabel(correctAnswer);
    if (userLabel && correctLabel) return userLabel === correctLabel;
    if (userLabel && normalizeText(correctAnswer) === userLabel) return true;
    if (correctLabel && normalizeText(userAnswer) === correctLabel) return true;

    const userText = stripChoiceLabel(userAnswer);
    const correctText = stripChoiceLabel(correctAnswer);
    if (userText && correctText) return userText === correctText;
  }

  return normalizeText(userAnswer) === normalizeText(correctAnswer);
}
