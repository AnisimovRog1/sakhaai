// Единая инициализация Google GenAI
// Vertex AI mode (Google Cloud $300 кредиты) или AI Studio fallback

import { GoogleGenAI } from '@google/genai';

const credJson = process.env.GOOGLE_CREDENTIALS_JSON;

let ai: GoogleGenAI;

if (credJson) {
  // Vertex AI — credentials напрямую в SDK, $300 кредиты Google Cloud
  try {
    const credentials = JSON.parse(credJson);
    ai = new GoogleGenAI({
      vertexai: true,
      project: credentials.project_id,
      location: process.env.GCP_LOCATION || 'us-central1',
      googleAuthOptions: { credentials },
    });
    console.log(`[genai] Vertex AI mode: project=${credentials.project_id}`);
  } catch (e: any) {
    console.error('[genai] Ошибка парсинга GOOGLE_CREDENTIALS_JSON:', e.message);
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    console.log('[genai] Fallback на AI Studio (API key)');
  }
} else {
  // Fallback — AI Studio
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  console.log('[genai] AI Studio mode (API key)');
}

export { ai };
