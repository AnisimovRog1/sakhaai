/**
 * Скачивание медиа в галерею — работает на iOS, Android, Desktop.
 *
 * Стратегия:
 * - data: URL (base64 от Gemini) → blob → share/a.download
 * - https URL (Kling CDN) → tg.downloadFile() → fetch blob → share/a.download → proxy
 * - Старый Android без share → скрытый iframe на proxy
 */

const API_BASE = import.meta.env.VITE_API_URL || '';

export async function downloadMedia(url: string, fileName: string): Promise<'ok' | 'share' | 'fallback'> {
  const tg = (window as any).Telegram?.WebApp;
  const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // === Layer 1: Telegram Mini App downloadFile (только https URL) ===
  if (tg?.downloadFile && url.startsWith('http')) {
    try {
      tg.downloadFile({ url, file_name: fileName });
      return 'ok';
    } catch { /* fallthrough */ }
  }

  // === Layer 2: Получить blob (из data: URL или fetch) ===
  let blob: Blob | null = null;

  if (url.startsWith('data:')) {
    // data: URL → декодировать base64 в blob локально (без сервера)
    try {
      const resp = await fetch(url);
      blob = await resp.blob();
    } catch { /* fallthrough */ }
  } else {
    // Внешний URL → попробовать fetch напрямую
    try {
      const resp = await fetch(url);
      if (resp.ok) blob = await resp.blob();
    } catch { /* CORS — попробуем через proxy */ }

    // Если CORS заблокировал → fetch через серверный proxy
    if (!blob) {
      try {
        const proxyUrl = `${API_BASE}/download?url=${encodeURIComponent(url)}&name=${encodeURIComponent(fileName)}`;
        const resp = await fetch(proxyUrl);
        if (resp.ok) blob = await resp.blob();
      } catch { /* fallthrough */ }
    }
  }

  if (!blob) {
    // Совсем крайний случай — открыть URL напрямую
    window.open(url, '_blank');
    return 'fallback';
  }

  // === Layer 3: Сохранить blob ===

  // 3a: navigator.share — мобильные (iOS + Android)
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

  // 3b: a.download — работает на десктопе и Android Chrome
  try {
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
    return 'ok';
  } catch { /* fallthrough */ }

  // 3c: Последний fallback — скрытый iframe для download
  if (!url.startsWith('data:')) {
    try {
      const proxyUrl = `${API_BASE}/download?url=${encodeURIComponent(url)}&name=${encodeURIComponent(fileName)}`;
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = proxyUrl;
      document.body.appendChild(iframe);
      setTimeout(() => document.body.removeChild(iframe), 10000);
      return 'ok';
    } catch { /* fallthrough */ }
  }

  window.open(url, '_blank');
  return 'fallback';
}
