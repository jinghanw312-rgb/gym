import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function askFitnessQuestion(question: string, history: { role: 'user' | 'assistant', content: string }[] = []) {
  try {
    const contents = history.map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.content }]
    }));

    contents.push({
      role: 'user',
      parts: [{ text: question }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: contents,
      config: {
        systemInstruction: "你是一位專業的運動與健身教練。請用繁體中文回答使用者的運動相關問題。你的回答應該專業、具備科學依據，且鼓勵使用者保持健康的運動習慣。如果問題與運動、健身、飲食健康不相關，請禮貌地告知使用者你只能回答運動相關的問題。",
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("無法連接到 AI 教練，請稍後再試。");
  }
}
