// Единая инициализация Google GenAI (Vertex AI)
// Используется всеми сервисами: чат, картинки, названия чатов

import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';

// На Railway: credentials через env переменную GOOGLE_CREDENTIALS_JSON
// Локально: файл server/service-account.json
function setupCredentials() {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) return; // уже настроено

  const credJson = process.env.GOOGLE_CREDENTIALS_JSON;
  if (credJson) {
    const tmpPath = '/tmp/gcp-credentials.json';
    fs.writeFileSync(tmpPath, credJson);
    process.env.GOOGLE_APPLICATION_CREDENTIALS = tmpPath;
    return;
  }

  // Локальный файл
  const localPath = path.resolve(__dirname, '../../service-account.json');
  if (fs.existsSync(localPath)) {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = localPath;
    return;
  }

  console.warn('[genai] Нет credentials для Vertex AI — fallback на API key');
}

setupCredentials();

const PROJECT_ID = process.env.GCP_PROJECT_ID || 'gen-lang-client-0553306129';
const LOCATION = process.env.GCP_LOCATION || 'us-central1';

// Если есть credentials для Vertex AI — используем их, иначе fallback на API key
const hasVertexCredentials = !!process.env.GOOGLE_APPLICATION_CREDENTIALS;

export const ai: GoogleGenAI = hasVertexCredentials
  ? new GoogleGenAI({ vertexai: true, project: PROJECT_ID, location: LOCATION })
  : new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

if (hasVertexCredentials) {
  console.log(`[genai] Vertex AI mode: project=${PROJECT_ID}, location=${LOCATION}`);
} else {
  console.log('[genai] AI Studio mode (API key)');
}
