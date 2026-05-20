export async function askFitnessQuestion(
  question: string, 
  history: { role: 'user' | 'assistant', content: string }[] = [], 
  language: string = '繁體中文'
) {
  try {
    const response = await fetch('/api/ask-fitness', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question, history, language }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error("askFitnessQuestion client error:", error);
    throw new Error("無法連接到 AI 教練，請稍後再試。");
  }
}

export async function generateWorkout(
  goal: string, 
  equipment: string[], 
  level: string, 
  language: string = '繁體中文'
) {
  try {
    const response = await fetch('/api/generate-workout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ goal, equipment, level, language }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error("generateWorkout client error:", error);
    throw new Error("生成課表失敗，請稍後再試。");
  }
}
