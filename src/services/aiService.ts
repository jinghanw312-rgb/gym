import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function askFitnessQuestion(question: string, history: { role: 'user' | 'assistant', content: string }[] = [], language: string = '繁體中文') {
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
        systemInstruction: `你是一位專業的運動與健身教練。請用${language}回答使用者的運動相關問題。你的回答應該專業、具備科學依據，且鼓勵使用者保持健康的運動習慣。如果問題與運動、健身、飲食健康不相關，請禮貌地告知使用者你只能回答運動相關的問題。`,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("無法連接到 AI 教練，請稍後再試。");
  }
}

export async function generateWorkout(goal: string, equipment: string[], level: string, language: string = '繁體中文') {
  try {
    const prompt = `請為我設計一份健身菜單。
目標：${goal}
可用器材：${equipment.join(', ')}
程度：${level}
請用${language}回答，格式請包含：
1. 暖身 (Warm-up)
2. 正式訓練 (Main Workout) - 每項動作包含組數、次數。
3. 收操 (Cool-down)`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: `你是一位專業的私人健身教練，擅長根據使用者需求設計科學化的訓練課表。你的回覆應該結構清晰，且一律使用${language}回答。`,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Workout Error:", error);
    throw new Error("生成課表失敗，請稍後再試。");
  }
}
