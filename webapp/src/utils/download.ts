/**
 * Скачивание медиа — работает на iOS, Android, Desktop.
 *
 * Android Telegram WebView: tg.downloadFile() принимает ТОЛЬКО https:// URL.
 * data: URL (base64 от Gemini) → загружаем на сервер → получаем https → downloadFile.
 *
 * Порядок:
 * 1. tg.downloadFile() с https URL (Android + iOS + Desktop Telegram)
 * 2. navigator.share() (мобильные браузеры)
 * 3. a.download с blob (десктоп)
 * 4. window.open fallback
 */

const API_BASE = import.meta.env.VITE_API_URL || '';

export async function downloadMedia(url: string, fileName: string): Promise<'ok' | 'share' | 'fallback'> {
  const tg = (window as any).Telegram?.WebApp;
  const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // === Layer 1: Telegram.WebApp.downloadFile() (ТОЛЬКО https URL) ===
  if (tg?.downloadFile) {
    try {
      let httpsUrl: string;

      if (url.startsWith('data:')) {
        // base64 → загрузить на сервер → получить https URL
        const resp = await fetch(API_BASE + '/api/tmp-save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataUrl: url, fileName }),
        });
        if (resp.ok) {
          const data = await resp.json();
          httpsUrl = data.url;
        } else {
          httpsUrl = '';
        }
      } else if (url.startsWith('http')) {
        // Внешний URL → proxy чтобы гарантировать Content-Disposition header
        httpsUrl = API_BASE + '/download?url=' + encodeURIComponent(url) + '&name=' + encodeURIComponent(fileName);
      } else {
        httpsUrl = '';
      }

      if (httpsUrl && httpsUrl.startsWith('https')) {
        tg.downloadFile({ url: httpsUrl, file_name: fileName }, function() {});
        return 'ok';
      }
    } catch {
      // fallthrough к другим методам
    }
  }

  // === Layer 2: Получить blob ===
  let blob: Blob | null = null;
  try {
    if (url.startsWith('data:')) {
      const resp = await fetch(url);
      blob = await resp.blob();
    } else {
      // Попробовать напрямую, потом через proxy
      try {
        const resp = await fetch(url);
        if (resp.ok) blob = await resp.blob();
      } catch {}
      if (!blob) {
        try {
          const proxyUrl = API_BASE + '/download?url=' + encodeURIComponent(url) + '&name=' + encodeURIComponent(fileName);
          const resp = await fetch(proxyUrl);
          if (resp.ok) blob = await resp.blob();
        } catch {}
      }
    }
  } catch {}

  if (!blob) {
    window.open(url, '_blank');
    return 'fallback';
  }

  // === Layer 3: navigator.share (мобильные) ===
  if (isMobile && navigator.share && navigator.canShare) {
    try {
      const file = new File([blob], fileName, { type: blob.type });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: fileName });
        return 'share';
      }
    } catch (e: any) {
      if (e?.name === 'AbortError') return 'share';
    }
  }

  // === Layer 4: a.download (десктоп + некоторые мобильные) ===
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
  } catch {}

  window.open(url, '_blank');
  return 'fallback';
}
