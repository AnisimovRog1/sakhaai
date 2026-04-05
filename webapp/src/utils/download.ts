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

  // Layer 2: navigator.share с файлом — iOS Safari, Android Chrome
  // Сохраняет прямо в галерею через "Save Image" / "Save Video"
  if (navigator.share && navigator.canShare) {
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

  // Layer 3: Blob URL + <a download> — desktop browsers
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
  } catch {
    // Абсолютный fallback — открыть в новой вкладке
    window.open(url, '_blank');
    return 'fallback';
  }
}
