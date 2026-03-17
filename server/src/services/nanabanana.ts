// Сервис генерации изображений через NanaBanana API
// Документация: https://nanabanana.ai (API ключ нужен отдельно)

export type ImageGenResult = {
  imageUrl: string;
};

export async function generateImage(prompt: string): Promise<ImageGenResult> {
  const apiKey = process.env.NANABANANA_API_KEY;
  if (!apiKey) throw new Error('NANABANANA_API_KEY не задан');

  const response = await fetch('https://api.nanabanana.ai/v1/generate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      width: 1024,
      height: 1024,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({})) as { message?: string };
    throw new Error(err.message ?? 'Ошибка NanaBanana API');
  }

  const data = await response.json() as { url?: string; image_url?: string };
  return { imageUrl: data.url ?? data.image_url ?? '' };
}
