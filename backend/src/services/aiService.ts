import OpenAI from "openai";

const key = process.env.OPENAI_API_KEY || "";
const client = key ? new OpenAI({ apiKey: key }) : null;

export const chat = async (prompt: string) => {
  if (!client) {
    return {
      reply: `OpenAI API key not configured. Received prompt: ${prompt}`,
    };
  }

  try {
    // Use the modern OpenAI SDK chat completions interface
    // We use `any` to avoid strict type issues across SDK versions.
    const res: any = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 400,
    });

    const content = res?.choices?.[0]?.message?.content || "";
    return { reply: content };
  } catch (err: any) {
    console.error("OpenAI error", err?.response?.data || err.message || err);
    return { error: "OpenAI request failed" };
  }
};
