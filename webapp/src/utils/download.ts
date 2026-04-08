/**
 * Скачивание медиа в галерею — работает на iOS, Android, Desktop.
 * 3-слойный fallback:
 * 1. Telegram.WebApp.downloadFile() — прямое скачивание в галерею
 * 2. navigator.share({files}) — iOS/Android share sheet → "Сохранить в фото"
 * 3. Blob download / data URL — desktop fallback
 */
export async function downloadMedia(url: string, fileName: string): Promise<'ok' | 'share' | 'fallback'> {
  // Layer 1: Telegram Mini App API (Android + iOS 8.0+)
  const tg = (window as any).Telegram?.WebApp;
  if (tg?.downloadFile) {
    try {
      tg.downloadFile({ url, file_name: fileName });
      return 'ok';
    } catch { /* fallthrough */ }
  }

  // Fetch blob для Layer 2 и 3
  let blob: Blob;
  try {
    const resp = await fetch(url);
    blob = await resp.blob();
  } catch {
    // Если fetch не работает (CORS) — попробуем через share URL напрямую
    window.open(url, '_blank');
    return 'fallback';
  }

  // Layer 2: navigator.share с файлом — ТОЛЬКО мобильные (iOS Safari, Android Chrome)
  // На десктопе (macOS) share sheet бесполезен — сразу Layer 3
  const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (isMobile && navigator.share && navigator.canShare) {
    try {
      const file = new File([blob], fileName, { type: blob.type });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: fileName,
        });
        return 'share';
      }
    } catch (e: any) {
      // AbortError = юзер закрыл share sheet, это нормально
      if (e?.name === 'AbortError') return 'share';
      // Другие ошибки — fallthrough к Layer 3
    }
  }

  // Layer 3: Server proxy download — работает на ВСЕХ платформах (обход CORS)
  // Сервер fetch'ит файл и отдаёт с Content-Disposition: attachment
  try {
    const proxyUrl = `/download?url=${encodeURIComponent(url)}&name=${encodeURIComponent(fileName)}`;
    window.open(proxyUrl, '_self');
    return 'ok';
  } catch {
    window.open(url, '_blank');
    return 'fallback';
  }
}
