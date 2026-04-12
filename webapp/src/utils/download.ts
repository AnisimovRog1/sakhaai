/**
 * Скачивание медиа — работает на iOS, Android, Desktop.
 *
 * Android Telegram WebView: tg.downloadFile() принимает ТОЛЬКО https URL.
 * Требует Bot API 8.0+, headers: Content-Disposition + Access-Control-Allow-Origin.
 *
 * Порядок:
 * 1. tg.downloadFile() с HTTPS URL (Android + iOS 8.0+)
 * 2. tg.openLink() — открыть во внешнем браузере (старый Telegram)
 * 3. navigator.share() (мобильные)
 * 4. a.download с blob (десктоп)
 */

const API_BASE = import.meta.env.VITE_API_URL || '';

export async function downloadMedia(url: string, fileName: string): Promise<'ok' | 'share' | 'fallback'> {
  const tg = (window as any).Telegram?.WebApp;
  const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // === Layer 1: Telegram.WebApp.downloadFile() (Bot API 8.0+, ТОЛЬКО https) ===
  if (tg?.downloadFile && tg?.isVersionAtLeast?.('8.0')) {
    try {
      const httpsUrl = await getHttpsUrl(url, fileName);
      if (httpsUrl) {
        console.log('[download] tg.downloadFile:', httpsUrl);
        const accepted = await new Promise<boolean>((resolve) => {
          tg.downloadFile({ url: httpsUrl, file_name: fileName }, (ok: boolean) => {
            console.log('[download] accepted:', ok);
            resolve(ok);
          });
          // Timeout — если callback не вызвался за 5 сек
          setTimeout(() => resolve(false), 5000);
        });
        if (accepted) return 'ok';
      }
    } catch (e) {
      console.error('[download] downloadFile error:', e);
    }
  }

  // === Layer 2: tg.openLink — открыть во внешнем браузере (старый Telegram / fallback) ===
  if (isMobile && tg?.openLink) {
    try {
      const httpsUrl = await getHttpsUrl(url, fileName);
      if (httpsUrl) {
        tg.openLink(httpsUrl, { try_instant_view: false });
        return 'ok';
      }
    } catch {}
  }

  // === Layer 3: Blob → share / a.download ===
  let blob: Blob | null = null;
  try {
    if (url.startsWith('data:')) {
      blob = await (await fetch(url)).blob();
    } else {
      try { blob = await (await fetch(url)).blob(); } catch {}
      if (!blob) {
        try {
          const proxyUrl = API_BASE + '/download?url=' + encodeURIComponent(url) + '&name=' + encodeURIComponent(fileName);
          blob = await (await fetch(proxyUrl)).blob();
        } catch {}
      }
    }
  } catch {}

  if (blob) {
    // Share (мобильный)
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
    // a.download
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
  }

  window.open(url, '_blank');
  return 'fallback';
}

/** Получить HTTPS URL для файла (data: URL → загрузить на сервер) */
async function getHttpsUrl(url: string, fileName: string): Promise<string | null> {
  if (url.startsWith('https://')) {
    // Внешний URL → proxy с правильными headers
    return API_BASE + '/download?url=' + encodeURIComponent(url) + '&name=' + encodeURIComponent(fileName);
  }
  if (url.startsWith('data:')) {
    // base64 → сохранить на сервер → получить HTTPS URL
    try {
      const resp = await fetch(API_BASE + '/api/tmp-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUrl: url, fileName }),
      });
      if (resp.ok) {
        const data = await resp.json();
        return data.url;
      }
    } catch {}
  }
  return null;
}
