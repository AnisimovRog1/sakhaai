/**
 * Скачивание медиа в галерею — работает на iOS, Android, Desktop.
 *
 * Стратегия:
 * - data: URL (base64 от Gemini) → серверный proxy /download (работает везде)
 * - https URL (Kling CDN) → tg.downloadFile() → share → proxy fallback
 * - Desktop → a.download / proxy
 */

const API_BASE = import.meta.env.VITE_API_URL || '';

export async function downloadMedia(url: string, fileName: string): Promise<'ok' | 'share' | 'fallback'> {
  const tg = (window as any).Telegram?.WebApp;
  const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // === data: URL (base64 изображения из Gemini) ===
  // Telegram API НЕ поддерживает data: URL → всегда через proxy
  if (url.startsWith('data:')) {
    return downloadViaProxy(url, fileName);
  }

  // === Внешний https URL (Kling CDN видео/аватары) ===

  // Layer 1: Telegram Mini App downloadFile (https URLs only)
  if (tg?.downloadFile) {
    try {
      tg.downloadFile({ url, file_name: fileName });
      return 'ok';
    } catch { /* fallthrough */ }
  }

  // Layer 2: fetch blob → share (мобильный) или a.download (десктоп)
  let blob: Blob | null = null;
  try {
    const resp = await fetch(url);
    if (resp.ok) blob = await resp.blob();
  } catch { /* CORS блокирует — пойдём на proxy */ }

  if (blob) {
    // Мобильный: navigator.share
    if (isMobile && navigator.share && navigator.canShare) {
      try {
        const file = new File([blob], fileName, { type: blob.type });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: fileName });
          return 'share';
        }
      } catch (e: any) {
        if (e?.name === 'AbortError') return 'share';
        // fallthrough
      }
    }

    // Десктоп: a.download
    if (!isMobile) {
      try {
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
        return 'ok';
      } catch { /* fallthrough */ }
    }
  }

  // Layer 3: серверный proxy — последний fallback (работает ВСЕГДА)
  return downloadViaProxy(url, fileName);
}

/** Скачивание через серверный proxy /download — обходит CORS, поддерживает data: URL */
function downloadViaProxy(url: string, fileName: string): 'ok' {
  const proxyUrl = `${API_BASE}/download?url=${encodeURIComponent(url)}&name=${encodeURIComponent(fileName)}`;
  window.location.href = proxyUrl;
  return 'ok';
}
