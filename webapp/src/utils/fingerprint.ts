/**
 * Device Fingerprint — собираем уникальный ID устройства
 * Техники: canvas, WebGL, audio, screen/hardware, headless detection
 * Источники: FingerprintJS (MIT), IEEE arXiv:2411.12045, OWASP
 */

async function sha256(str: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// 1. Canvas fingerprint
function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('UraanxAI-fp-2026', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('antifraud', 4, 35);
    return canvas.toDataURL();
  } catch { return ''; }
}

// 2. WebGL fingerprint
function getWebGLFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return '';
    const g = gl as WebGLRenderingContext;
    const debugInfo = g.getExtension('WEBGL_debug_renderer_info');
    const vendor = debugInfo ? g.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : '';
    const renderer = debugInfo ? g.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';
    return `${vendor}|${renderer}`;
  } catch { return ''; }
}

// 3. Audio fingerprint
function getAudioFingerprint(): Promise<string> {
  return new Promise((resolve) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) { resolve(''); return; }
      const ctx = new AudioCtx();
      const oscillator = ctx.createOscillator();
      const analyser = ctx.createAnalyser();
      const gain = ctx.createGain();
      const compressor = ctx.createDynamicsCompressor();

      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(10000, ctx.currentTime);
      compressor.threshold.setValueAtTime(-50, ctx.currentTime);
      compressor.knee.setValueAtTime(40, ctx.currentTime);
      compressor.ratio.setValueAtTime(12, ctx.currentTime);
      compressor.attack.setValueAtTime(0, ctx.currentTime);
      compressor.release.setValueAtTime(0.25, ctx.currentTime);

      oscillator.connect(compressor);
      compressor.connect(analyser);
      analyser.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.value = 0; // mute

      oscillator.start(0);

      setTimeout(() => {
        try {
          const data = new Float32Array(analyser.frequencyBinCount);
          analyser.getFloatFrequencyData(data);
          oscillator.stop();
          ctx.close();
          // Take a slice of the frequency data
          const sample = data.slice(0, 30).join(',');
          resolve(sample);
        } catch { resolve(''); }
      }, 100);
    } catch { resolve(''); }
  });
}

// 4. Screen/Hardware fingerprint
function getHardwareFingerprint(): string {
  return [
    screen.width,
    screen.height,
    screen.colorDepth,
    window.devicePixelRatio,
    navigator.hardwareConcurrency || 0,
    (navigator as any).deviceMemory || 0,
    navigator.maxTouchPoints || 0,
    navigator.platform,
    navigator.language,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  ].join('|');
}

// 5. Headless browser detection
export function detectHeadless(): Record<string, boolean> {
  return {
    webdriver: !!(navigator as any).webdriver,
    noPlugins: navigator.plugins?.length === 0,
    noLanguages: !navigator.languages || navigator.languages.length === 0,
    phantomjs: !!(window as any).__phantomas || !!(window as any)._phantom,
    selenium: !!(document as any).__selenium_unwrapped || !!(document as any).__webdriver_evaluate,
    noChrome: typeof (window as any).chrome === 'undefined' && /Chrome/.test(navigator.userAgent),
  };
}

// Собираем всё в один fingerprint
export async function getDeviceFingerprint(): Promise<{
  deviceId: string;
  headless: Record<string, boolean>;
  components: Record<string, string>;
}> {
  const canvas = getCanvasFingerprint();
  const webgl = getWebGLFingerprint();
  const audio = await getAudioFingerprint();
  const hardware = getHardwareFingerprint();
  const headless = detectHeadless();

  const components = { canvas, webgl, audio, hardware };
  const raw = `${canvas}|${webgl}|${audio}|${hardware}`;
  const deviceId = await sha256(raw);

  return { deviceId, headless, components };
}
