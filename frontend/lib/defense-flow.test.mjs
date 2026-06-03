import test from "node:test";
import assert from "node:assert/strict";

import {
  buildDefenseBriefFromText,
  buildDefensePromptMessages,
  extractPlainTextFromOfficeXml,
  generateLocalDefenseQuestion,
  generateLocalDefenseReport,
  normalizeDefenseBrief,
} from "./defense-flow.mjs";
import { extractUploadedFileTextFromBuffer } from "./defense-file-text.mjs";

const sourceText = `
题目：基于 CRISPR-Cas9 的胃癌相关基因调控研究
背景：胃癌发生与 TP53、EGFR 和细胞周期调控异常有关。
科学问题：如何利用 CRISPR-Cas9 验证候选基因对胃癌细胞增殖的影响？
方法：设计 sgRNA，构建表达载体，进行细胞转染、测序验证和增殖实验。
创新点：把基因编辑与通路图谱结合，形成可解释的机制链。
`;

test("builds an editable Defense Brief from pasted research text", () => {
  const brief = buildDefenseBriefFromText({
    sourceType: "manual",
    sourceLabel: "手动粘贴",
    text: sourceText,
  });

  assert.match(brief.title, /CRISPR|胃癌|基因/);
  assert.equal(brief.mode, "proposal");
  assert.match(brief.background, /胃癌|TP53|EGFR/);
  assert.match(brief.researchQuestion, /CRISPR|候选基因|增殖/);
  assert.ok(brief.methods.length >= 3);
  assert.ok(brief.keywords.includes("CRISPR-Cas9"));
  assert.ok(brief.relatedTools.some((tool) => tool.href === "/tools/protein" || tool.href === "/tools/sequence"));
});

test("normalizes partial AI Defense Brief JSON without losing required arrays", () => {
  const brief = normalizeDefenseBrief(
    {
      title: "AlphaFold 辅助蛋白突变解释",
      mode: "paper_defense",
      background: "利用结构预测解释突变效应。",
      methods: "结构比对、保守性分析",
    },
    { sourceType: "knowledge_map", sourceLabel: "结构生物学节点", text: "AlphaFold structure mutation" },
  );

  assert.equal(brief.mode, "paper_defense");
  assert.deepEqual(brief.methods, ["结构比对", "保守性分析"]);
  assert.ok(Array.isArray(brief.objectives));
  assert.ok(brief.sourceRefs[0].label.includes("结构生物学"));
});

test("extracts visible text from Office XML parts used by DOCX and PPTX", () => {
  const xml = `
    <w:document><w:t>研究背景</w:t><w:t>实验设计</w:t></w:document>
    <a:t>答辩问题</a:t>
  `;

  assert.equal(extractPlainTextFromOfficeXml(xml), "研究背景 实验设计 答辩问题");
});

test("extracts visible text from uploaded PDF buffers", async () => {
  const pdfBase64 =
    "JVBERi0xLjMKJZOMi54gUmVwb3J0TGFiIEdlbmVyYXRlZCBQREYgZG9jdW1lbnQgKG9wZW5zb3VyY2UpCjEgMCBvYmoKPDwKL0YxIDIgMCBSCj4+CmVuZG9iagoyIDAgb2JqCjw8Ci9CYXNlRm9udCAvSGVsdmV0aWNhIC9FbmNvZGluZyAvV2luQW5zaUVuY29kaW5nIC9OYW1lIC9GMSAvU3VidHlwZSAvVHlwZTEgL1R5cGUgL0ZvbnQKPj4KZW5kb2JqCjMgMCBvYmoKPDwKL0NvbnRlbnRzIDcgMCBSIC9NZWRpYUJveCBbIDAgMCA1OTUuMjc1NiA4NDEuODg5OCBdIC9QYXJlbnQgNiAwIFIgL1Jlc291cmNlcyA8PAovRm9udCAxIDAgUiAvUHJvY1NldCBbIC9QREYgL1RleHQgL0ltYWdlQiAvSW1hZ2VDIC9JbWFnZUkgXQo+PiAvUm90YXRlIDAgL1RyYW5zIDw8Cgo+PiAKICAvVHlwZSAvUGFnZQo+PgplbmRvYmoKNCAwIG9iago8PAovUGFnZU1vZGUgL1VzZU5vbmUgL1BhZ2VzIDYgMCBSIC9UeXBlIC9DYXRhbG9nCj4+CmVuZG9iago1IDAgb2JqCjw8Ci9BdXRob3IgKGFub255bW91cykgL0NyZWF0aW9uRGF0ZSAoRDoyMDI2MDYwMzE5MDYxNiswOCcwMCcpIC9DcmVhdG9yIChhbm9ueW1vdXMpIC9LZXl3b3JkcyAoKSAvTW9kRGF0ZSAoRDoyMDI2MDYwMzE5MDYxNiswOCcwMCcpIC9Qcm9kdWNlciAoUmVwb3J0TGFiIFBERiBMaWJyYXJ5IC0gXChvcGVuc291cmNlXCkpIAogIC9TdWJqZWN0ICh1bnNwZWNpZmllZCkgL1RpdGxlICh1bnRpdGxlZCkgL1RyYXBwZWQgL0ZhbHNlCj4+CmVuZG9iago2IDAgb2JqCjw8Ci9Db3VudCAxIC9LaWRzIFsgMyAwIFIgXSAvVHlwZSAvUGFnZXMKPj4KZW5kb2JqCjcgMCBvYmoKPDwKL0xlbmd0aCA0NjEKPj4Kc3RyZWFtCjEgMCAwIDEgMCAwIGNtICBCVCAvRjEgMTIgVGYgMTQuNCBUTCBFVApCVCAvRjEgMTIgVGYgMTQuNCBUTCBFVApCVCAxIDAgMCAxIDcyIDc4MCBUbSAoVGl0bGU6IENSSVNQUiBQcmltZSBFZGl0aW5nIFNlbWluYXIpIFRqIFQqIEVUCkJUIDEgMCAwIDEgNzIgNzU4IFRtIChCYWNrZ3JvdW5kOiBQcmltZSBlZGl0aW5nIHVzZXMgQ2FzOSBuaWNrYXNlIGZ1c2VkIHRvIHJldmVyc2UgdHJhbnNjcmlwdGFzZS4pIFRqIFQqIEVUCkJUIDEgMCAwIDEgNzIgNzM2IFRtIChSZXNlYXJjaCBxdWVzdGlvbjogSG93IGRvZXMgcGVnUk5BIGRlc2lnbiBhZmZlY3QgZWRpdGluZyBlZmZpY2llbmN5IGFuZCBvZmYtdGFyZ2V0IHJpc2s/KSBUaiBUKiBFVApCVCAxIDAgMCAxIDcyIDcxNCBUbSAoTWV0aG9kOiBDb21wYXJlIFBCUyBhbmQgUlRUIGxlbmd0aHMsIHRoZW4gdmFsaWRhdGUgYnkgc2VxdWVuY2luZy4pIFRqIFQqIEVUCiAKZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAgOAowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwNjEgMDAwMDAgbiAKMDAwMDAwMDA5MiAwMDAwMCBuIAowMDAwMDAwMTk5IDAwMDAwIG4gCjAwMDAwMDA0MDIgMDAwMDAgbiAKMDAwMDAwMDQ3MCAwMDAwMCBuIAowMDAwMDAwNzMxIDAwMDAwIG4gCjAwMDAwMDA3OTAgMDAwMDAgbiAKdHJhaWxlcgo8PAovSUQgCls8ZGU4MDUzNjFjY2Q4MzQwNzE0MDRhOWE1OThjZGQ5OWE+PGRlODA1MzYxY2NkODM0MDcxNDA0YTlhNTk4Y2RkOTlhPl0KJSBSZXBvcnRMYWIgZ2VuZXJhdGVkIFBERiBkb2N1bWVudCAtLSBkaWdlc3QgKG9wZW5zb3VyY2UpCgovSW5mbyA1IDAgUgovUm9vdCA0IDAgUgovU2l6ZSA4Cj4+CnN0YXJ0eHJlZgoxMzAxCiUlRU9GCg==";
  const text = await extractUploadedFileTextFromBuffer(
    "seminar-upload-test.pdf",
    Buffer.from(pdfBase64, "base64"),
  );

  assert.match(text, /CRISPR Prime Editing Seminar/);
  assert.match(text, /pegRNA design/);
});

test("extracts readable PDF text when the parser rejects a malformed xref", async () => {
  const minimalPdf = Buffer.from(
    `%PDF-1.3
1 0 obj
<< /Length 132 >>
stream
BT
/F1 12 Tf
72 720 Td
(Title: Parser Fallback Seminar) Tj
T*
(Background: Visible text can still be recovered.) Tj
ET
endstream
endobj
trailer
<< /Root 1 0 R >>
%%EOF`,
    "latin1",
  );

  const text = await extractUploadedFileTextFromBuffer("malformed-upload.pdf", minimalPdf);

  assert.match(text, /Parser Fallback Seminar/);
  assert.match(text, /Visible text can still be recovered/);
});

test("defense prompts, local questions and reports follow the agreed first-version scope", () => {
  const brief = buildDefenseBriefFromText({
    sourceType: "manual",
    sourceLabel: "手动粘贴",
    text: sourceText,
  });
  const messages = buildDefensePromptMessages({
    action: "next_question",
    brief,
    difficulty: "challenge",
    turnLimit: 5,
    transcript: [{ role: "student", content: "我会从科学问题和技术路线展开。" }],
  });

  assert.match(messages[0].content, /严格评审/);
  assert.match(messages[1].content, /不要显示逐轮评分/);

  const question = generateLocalDefenseQuestion({ brief, difficulty: "standard", turnIndex: 2 });
  assert.match(question.question, /方法|证据|风险|局限|创新/);
  assert.ok(question.committeeRole);

  const report = generateLocalDefenseReport({
    brief,
    transcript: [
      { role: "committee", content: question.question },
      { role: "student", content: "我会用测序和细胞增殖实验验证，并设置阴性对照。" },
    ],
  });
  assert.ok(report.totalScore >= 60);
  assert.equal(report.dimensions.length, 6);
  assert.ok(report.moduleRecommendations.length >= 2);
});
