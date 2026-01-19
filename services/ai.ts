import OpenAI from "openai";

export async function summarizeDifferences(content1: string, content2: string): Promise<string> {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL,
    dangerouslyAllowBrowser: true
  });

  const prompt = `
    我有两个版本的文本内容（可能是 Markdown、代码或纯文本）。
    
    版本 1 (前 5000 字符):
    ---
    ${content1.slice(0, 5000)}
    ---
    
    版本 2 (前 5000 字符):
    ---
    ${content2.slice(0, 5000)}
    ---
    
    请分析并总结这两个版本之间的关键差异。
    1. 总结主要的变更点。
    2. 列出重要的新增、删除或逻辑修改。
    3. 如果是代码，请简述功能上的变化；如果是文档，请简述内容上的更新。
    
    请使用简体中文，并以清晰的列表形式输出。
  `;

  try {
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
    const completion = await client.chat.completions.create({
      model,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "你是一位专业的内容审核与代码审查专家。请清晰、准确、简洁地总结两个文本版本之间的差异。必须使用简体中文回答。"
        },
        { role: "user", content: prompt }
      ]
    });

    return completion.choices[0]?.message?.content ?? "暂无总结内容。";
  } catch (error) {
    console.error("AI summary error:", error);
    return "生成 AI 总结时出错。";
  }
}

export function getModelName(): string {
  return process.env.OPENAI_MODEL || "gpt-4o-mini";
}
