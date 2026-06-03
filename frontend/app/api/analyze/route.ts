import { NextRequest, NextResponse } from "next/server";
import { resolveDeepSeekConfig } from "@/lib/deepseek-client.mjs";
import { extractUploadedFileTextFromBuffer } from "@/lib/defense-file-text.mjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const content = body.content || "";
    const fileName = body.fileName || "";

    console.log("[Analyze API] 请求开始");
    console.log("[Analyze API] fileName:", fileName);
    console.log("[Analyze API] content类型:", content.substring(0, 50));
    console.log("[Analyze API] 请求体大小:", JSON.stringify(body).length, "bytes");

    if (!content) {
      return NextResponse.json({ success: false, error: "请提供教材内容" }, { status: 400 });
    }

    const { apiKey, baseUrl, model } = resolveDeepSeekConfig();
    if (!apiKey) {
      return NextResponse.json({ success: false, error: "AI 服务未配置" }, { status: 503 });
    }

    let subject = "生物学";
    
    if (fileName) {
      if (fileName.includes("运动") || fileName.includes("物理") || fileName.includes("力学")) {
        subject = "物理学";
      } else if (fileName.includes("化学") || fileName.includes("反应")) {
        subject = "化学";
      } else if (fileName.includes("数学") || fileName.includes("方程")) {
        subject = "数学";
      } else if (fileName.includes("生物") || fileName.includes("细胞")) {
        subject = "生物学";
      }
    }

    let textContent = "";

    if (content.startsWith("data:image/")) {
      const prompt = `请分析以下图片内容，假设这是${subject}教材内容，描述图片中的文字信息并总结核心知识点：

图片已上传，内容待分析。

请按照以下格式输出：
1. 知识点标题：详细内容描述
2. 知识点标题：详细内容描述
...

关键词：关键词1, 关键词2, 关键词3...

学习建议：
- 建议内容1
- 建议内容2
- 建议内容3`;

      const response = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content: `你是一个专业的${subject}知识导师，擅长分析教材内容、总结教材要点、提取核心知识点。`,
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 2000,
          temperature: 0.7,
        }),
      });

      console.log("[Analyze API] DeepSeek响应状态码:", response.status);
      console.log("[Analyze API] DeepSeek响应Content-Type:", response.headers.get("content-type"));

      if (!response.ok) {
        const responseText = await response.text();
        console.error("[Analyze API] DeepSeek API请求失败:", response.status, "-", responseText.substring(0, 500));
        throw new Error(`DeepSeek API请求失败 [${response.status}]: ${responseText.substring(0, 200)}`);
      }

      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        const responseText = await response.text();
        console.error("[Analyze API] JSON解析失败，响应内容:", responseText.substring(0, 500));
        throw new Error(`JSON解析失败: ${responseText.substring(0, 200)}`);
      }

      textContent = result.choices[0].message.content;
    } else if (content.startsWith("data:application/pdf;base64,")) {
      const pdfBase64 = content.split(",")[1];
      const maxPdfSize = 10 * 1024 * 1024;
      const pdfBytes = Buffer.from(pdfBase64, "base64");
      
      if (pdfBytes.length > maxPdfSize) {
        return NextResponse.json({ success: false, error: "PDF文件过大，请上传小于10MB的文件" }, { status: 400 });
      }

      const pdfText = (await extractUploadedFileTextFromBuffer(fileName || "uploaded.pdf", pdfBytes)).trim();
      if (!pdfText) {
        return NextResponse.json(
          { success: false, error: "PDF 文本提取失败，请尝试上传可复制文字的 PDF，或改为粘贴正文。" },
          { status: 422 },
        );
      }

      const prompt = `请分析以下PDF文件的内容，假设这是${subject}教材内容，文件名为：${fileName || "未知"}。

PDF正文摘录：
${pdfText.length > 6000 ? pdfText.substring(0, 6000) + "..." : pdfText}

请按照以下严格的结构化格式输出：

【核心知识点】
请从内容中提炼5-10个独立的核心知识点。**必须拆分成多个独立知识点，不允许把所有内容放进一个知识点中**。每个知识点聚焦一个核心概念，内容长度控制在50-150字。

输出格式（**严格按照此格式，每个知识点占一行**）：
核心知识点：
1. 知识点名称：知识点的详细解释，包括定义、特征、机制或功能等
2. 知识点名称：知识点的详细解释，包括定义、特征、机制或功能等
3. 知识点名称：知识点的详细解释，包括定义、特征、机制或功能等
4. 知识点名称：知识点的详细解释，包括定义、特征、机制或功能等
5. 知识点名称：知识点的详细解释，包括定义、特征、机制或功能等
6. 知识点名称：知识点的详细解释，包括定义、特征、机制或功能等

【重点概念】
提取内容中最关键的8-12个专业术语和核心概念，用中文逗号分隔，不要添加其他符号

【学习建议】
作为一名经验丰富的${subject}教师，请根据以上教材内容，针对可能的常见错误，提供3-4条个性化学习建议。每条建议必须包含：
- 可能的错误知识点：指出学生容易出错的具体知识点
- 错误原因分析：分析学生可能在该知识点上出错的原因
- 针对性训练方法：提供具体、可操作的练习方法和学习策略

输出格式：
学习建议：
1. 错误知识点：具体知识点名称。错误原因分析：详细分析学生可能出错的原因。针对性训练方法：提供具体的练习方法和学习策略。
2. 错误知识点：具体知识点名称。错误原因分析：详细分析学生可能出错的原因。针对性训练方法：提供具体的练习方法和学习策略。
3. 错误知识点：具体知识点名称。错误原因分析：详细分析学生可能出错的原因。针对性训练方法：提供具体的练习方法和学习策略。

重要规则：
1. 【核心知识点】部分必须输出5-10个独立知识点，**绝对不允许**把所有内容合并成一个知识点
2. 每个知识点的标题（冒号前）必须简洁明确，是该知识点的核心名称
3. 每个知识点的解释（冒号后）必须详细，50-150字，内容充实
4. 使用专业、严谨的学术语言
5. 不要提及"高中"、"中学生"、"大学生"等词汇
6. 不要使用任何Markdown格式（如**加粗**、#标题、列表符号等）
7. 必须输出【核心知识点】【重点概念】【学习建议】三个部分，每个部分都不能为空

请直接分析PDF内容并按上述格式输出。`;

      console.log("[Analyze API] PDF处理 - 调用DeepSeek API");
      const response = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content: `你是一位专业的${subject}大学课程导师，擅长深入分析专业教材内容，提取核心知识点，提供适合大学生的专业学习建议。请使用专业、严谨的学术语言，不要提及高中或中学生相关内容。`,
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 2000,
          temperature: 0.7,
        }),
      });

      console.log("[Analyze API] PDF处理 - DeepSeek响应状态码:", response.status);
      console.log("[Analyze API] PDF处理 - DeepSeek响应Content-Type:", response.headers.get("content-type"));

      if (!response.ok) {
        const responseText = await response.text();
        console.error("[Analyze API] PDF处理 - DeepSeek API请求失败:", response.status, "-", responseText.substring(0, 500));
        throw new Error(`DeepSeek API请求失败 [${response.status}]: ${responseText.substring(0, 200)}`);
      }

      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        const responseText = await response.text();
        console.error("[Analyze API] PDF处理 - JSON解析失败，响应内容:", responseText.substring(0, 500));
        throw new Error(`JSON解析失败: ${responseText.substring(0, 200)}`);
      }

      textContent = result.choices[0].message.content.replace(/\*\*/g, "");
    } else {
      const prompt = `请深度分析以下${subject}教材内容，提供系统化、模块化的知识总结：

${content.length > 5000 ? content.substring(0, 5000) + "..." : content}

请按照以下严格的结构化格式输出：

【核心知识点】
请从内容中提炼5-10个独立的核心知识点。**必须拆分成多个独立知识点，不允许把所有内容放进一个知识点中**。每个知识点聚焦一个核心概念，内容长度控制在50-150字。

输出格式（**严格按照此格式，每个知识点占一行**）：
核心知识点：
1. 知识点名称：知识点的详细解释，包括定义、特征、机制或功能等
2. 知识点名称：知识点的详细解释，包括定义、特征、机制或功能等
3. 知识点名称：知识点的详细解释，包括定义、特征、机制或功能等
4. 知识点名称：知识点的详细解释，包括定义、特征、机制或功能等
5. 知识点名称：知识点的详细解释，包括定义、特征、机制或功能等
6. 知识点名称：知识点的详细解释，包括定义、特征、机制或功能等

【重点概念】
提取内容中最关键的8-12个专业术语和核心概念，用中文逗号分隔，不要添加其他符号

【学习建议】
作为一名经验丰富的${subject}教师，请根据以上教材内容，针对可能的常见错误，提供3-4条个性化学习建议。每条建议必须包含：
- 可能的错误知识点：指出学生容易出错的具体知识点
- 错误原因分析：分析学生可能在该知识点上出错的原因
- 针对性训练方法：提供具体、可操作的练习方法和学习策略

输出格式：
学习建议：
1. 错误知识点：具体知识点名称。错误原因分析：详细分析学生可能出错的原因。针对性训练方法：提供具体的练习方法和学习策略。
2. 错误知识点：具体知识点名称。错误原因分析：详细分析学生可能出错的原因。针对性训练方法：提供具体的练习方法和学习策略。
3. 错误知识点：具体知识点名称。错误原因分析：详细分析学生可能出错的原因。针对性训练方法：提供具体的练习方法和学习策略。

重要规则：
1. 【核心知识点】部分必须输出5-10个独立知识点，**绝对不允许**把所有内容合并成一个知识点
2. 每个知识点的标题（冒号前）必须简洁明确，是该知识点的核心名称
3. 每个知识点的解释（冒号后）必须详细，50-150字，内容充实
4. 使用专业、严谨的学术语言
5. 不要提及"高中"、"中学生"、"大学生"等词汇
6. 不要使用任何Markdown格式（如**加粗**、#标题、列表符号等）
7. 必须输出【核心知识点】【重点概念】【学习建议】三个部分，每个部分都不能为空`;

      console.log("[Analyze API] 文本处理 - 调用DeepSeek API");
      const response = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content: `你是一位专业的${subject}大学课程导师，擅长深入分析专业教材内容，提取核心知识点，提供适合大学生的专业学习建议。请使用专业、严谨的学术语言，不要提及高中或中学生相关内容。`,
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 2000,
          temperature: 0.7,
        }),
      });

      console.log("[Analyze API] 文本处理 - DeepSeek响应状态码:", response.status);
      console.log("[Analyze API] 文本处理 - DeepSeek响应Content-Type:", response.headers.get("content-type"));

      if (!response.ok) {
        const responseText = await response.text();
        console.error("[Analyze API] 文本处理 - DeepSeek API请求失败:", response.status, "-", responseText.substring(0, 500));
        throw new Error(`DeepSeek API请求失败 [${response.status}]: ${responseText.substring(0, 200)}`);
      }

      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        const responseText = await response.text();
        console.error("[Analyze API] 文本处理 - JSON解析失败，响应内容:", responseText.substring(0, 500));
        throw new Error(`JSON解析失败: ${responseText.substring(0, 200)}`);
      }

      textContent = result.choices[0].message.content.replace(/\*\*/g, "");
    }

    const knowledgePoints: { id: number; title: string; content: string }[] = [];
    const keywords: string[] = [];
    const studyTips: { id: number; title: string; content: string }[] = [];

    console.log("[Analyze API] 原始响应内容:", textContent.substring(0, 1000));

    const corePointsMatch = textContent.match(/(?:【核心知识点】|核心知识点：)\s*(.+?)(?=\s*(?:【重点概念】|重点概念：)|\s*(?:【学习建议】|学习建议：)|$)/is);
    const keywordMatch = textContent.match(/(?:【重点概念】|重点概念：)\s*(.+?)(?=\s*(?:【学习建议】|学习建议：)|$)/is);
    const tipMatch = textContent.match(/(?:【学习建议】|学习建议：)\s*(.+)/is);

    console.log("[Analyze API] 匹配结果:", {
      corePointsMatch: corePointsMatch ? "找到" : "未找到",
      keywordMatch: keywordMatch ? "找到" : "未找到",
      tipMatch: tipMatch ? "找到" : "未找到",
    });

    let pointId = 1;
    if (corePointsMatch) {
      const pointsText = corePointsMatch[1].trim().replace(/^核心知识点：\s*/, "");
      
      console.log("[Analyze API] 核心知识点文本:", pointsText.substring(0, 500));
      
      const lines = pointsText.split(/\n|(?=\d+[\.\-、])/).filter(line => {
        const trimmed = line.trim();
        return trimmed.length > 10 && trimmed.match(/^\d+[\.\-、]/);
      });

      console.log("[Analyze API] 找到的知识点行数:", lines.length);

      lines.forEach(line => {
        const trimmed = line.trim();
        const colonIndex = trimmed.indexOf("：");
        const colonIndexEn = trimmed.indexOf(":");
        const actualIndex = colonIndex > 0 ? colonIndex : (colonIndexEn > 0 ? colonIndexEn : -1);

        if (actualIndex > 0) {
          const titlePart = trimmed.substring(0, actualIndex).replace(/^\d+[\.\-、]\s*/, "").trim();
          const contentPart = trimmed.substring(actualIndex + 1).trim();
          
          if (titlePart && contentPart && contentPart.length > 10) {
            knowledgePoints.push({
              id: pointId++,
              title: titlePart,
              content: contentPart,
            });
          }
        }
      });

      if (knowledgePoints.length === 0) {
        const pointRegex = /(\d+)[\.\-、]\s*([^：:]+?)[：:]\s*(.+?)(?=\s*\d+[\.\-、]\s*[^：:]|$)/gs;
        let match;
        while ((match = pointRegex.exec(pointsText)) !== null) {
          const title = match[2].trim();
          const content = match[3].trim();
          if (title && content && content.length > 10) {
            knowledgePoints.push({
              id: pointId++,
              title: title,
              content: content,
            });
          }
        }
      }

      console.log("[Analyze API] 解析出的知识点数量:", knowledgePoints.length);
    }

    if (keywordMatch) {
      const keywordText = keywordMatch[1].trim();
      const keywordParts = keywordText.split(/[，,、\s]+/).map(k => k.trim()).filter(k => k.length > 1);
      keywords.push(...keywordParts.slice(0, 15));
    }

    if (tipMatch) {
      let tipText = tipMatch[1].trim();
      const tipRegex = /(\d+)[\.\-、]\s*(.+?)(?=\s*\d+[\.\-、]\s*|$)/gs;
      const tipTitles = ["深度理解", "学习方法", "易错辨析", "拓展延伸", "复习策略", "实践应用"];
      let match;
      let tipIndex = 0;
      
      while ((match = tipRegex.exec(tipText)) !== null) {
        const content = match[2].trim();
        if (content.length > 10) {
          studyTips.push({
            id: tipIndex + 1,
            title: tipTitles[tipIndex % tipTitles.length],
            content: content,
          });
          tipIndex++;
        }
      }

      if (studyTips.length === 0) {
        const lines = tipText.split(/\n/).filter(line => line.trim().length > 10);
        lines.forEach((line, i) => {
          const cleaned = line.trim().replace(/^\d+[\.\-、]\s*/, "").replace(/^[-•●★]\s*/, "");
          if (cleaned.length > 10) {
            studyTips.push({
              id: i + 1,
              title: tipTitles[i % tipTitles.length],
              content: cleaned,
            });
          }
        });
      }
    }

    if (knowledgePoints.length === 0) {
      knowledgePoints.push({
        id: 1,
        title: "核心知识点",
        content: textContent.substring(0, 500) + "...",
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        knowledgePoints,
        keywords,
        studyTips,
        rawResponse: textContent,
      },
    });
  } catch (error) {
    console.error("Analyze API error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}


