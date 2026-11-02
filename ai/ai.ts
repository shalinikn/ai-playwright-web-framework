import path from 'path';
import dotenv from 'dotenv';

// Settings and API keys live in config/.env
dotenv.config({ path: path.join(__dirname, '../config/.env') });

// Which AI to use: "ollama" (free, runs on your computer) or "gemini" (needs GEMINI_API_KEY).
const PROVIDER = process.env.AI_PROVIDER || 'ollama';

// Sends a prompt to the chosen AI and returns the text answer.
export async function askAI(prompt: string): Promise<string> {
  return PROVIDER === 'gemini' ? askGemini(prompt) : askOllama(prompt);
}

async function askOllama(prompt: string): Promise<string> {
  const url = process.env.OLLAMA_URL || 'http://localhost:11434';
  const model = process.env.OLLAMA_MODEL || 'qwen2.5-coder:3b';

  const response = await fetch(`${url}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, prompt, stream: false }),
    signal: AbortSignal.timeout(120_000),
  });
  if (!response.ok) throw new Error(`Ollama error ${response.status}: ${await response.text()}`);

  const data = await response.json();
  return data.response.trim();
}

// Retries up to 3 times when Gemini is busy (HTTP 503).
async function askGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
  if (!apiKey) throw new Error('GEMINI_API_KEY is missing in .env');

  let response!: Response;
  for (let attempt = 1; attempt <= 3; attempt++) {
    response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      signal: AbortSignal.timeout(30_000),
    });
    if (response.status !== 503) break;
    await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
  }
  if (!response.ok) throw new Error(`Gemini error ${response.status}: ${await response.text()}`);

  const data = await response.json();
  return data.candidates[0].content.parts[0].text.trim();
}
