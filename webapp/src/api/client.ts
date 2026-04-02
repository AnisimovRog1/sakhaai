const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

// Токен хранится в памяти (не в localStorage — безопаснее для Mini App)
let token: string | null = null;

export function setToken(t: string) {
  token = t;
}

// Базовая функция для запросов к серверу (таймаут 2 мин — все запросы теперь быстрые)
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 1_800_000); // 30 мин (avatar может занимать долго)

  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { ...headers, ...options?.headers },
      signal: controller.signal,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Ошибка сервера' }));
      throw new Error(err.error ?? 'Ошибка сервера');
    }

    return res.json();
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      throw new Error('Превышено время ожидания. Попробуйте ещё раз.');
    }
    throw e;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Тип ответа async-генерации
export type AsyncGenResult = {
  taskId: string;
  async: true;
  creditsLeft: number;
  cost: number;
  requestId?: string; // для backward compat motion-control
};

export type TaskStatus = {
  taskId: string;
  type: string;
  status: 'pending' | 'processing' | 'succeed' | 'failed';
  resultUrl?: string;
  errorMsg?: string;
  cost?: number;
  createdAt?: string;
};

// ── Auth ──────────────────────────────
export const api = {
  auth: (initData: string, referralCode?: string, timezoneOffset?: number) =>
    request<{ token: string; user: import('../types').User }>('/auth', {
      method: 'POST',
      body: JSON.stringify({ initData, referralCode, timezoneOffset }),
    }),

  // ── Чаты ────────────────────────────
  getChats: () =>
    request<import('../types').Chat[]>('/chats'),

  createChat: (title?: string) =>
    request<import('../types').Chat>('/chats', {
      method: 'POST',
      body: JSON.stringify({ title }),
    }),

  deleteChat: (id: number) =>
    request<{ success: boolean }>(`/chats/${id}`, { method: 'DELETE' }),

  // ── Сообщения ───────────────────────
  getMessages: (chatId: number) =>
    request<import('../types').Message[]>(`/chats/${chatId}/messages`),

  sendMessage: (chatId: number, message: string) =>
    request<import('../types').Message & { creditsLeft: number }>(`/chats/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),

  getBalance: () =>
    request<{ credits: number }>('/balance'),

  getTransactions: (limit = 20) =>
    request<Array<{ id: number; type: string; amount: number; description: string; created_at: string; icon: string; label: string; isDebit: boolean }>>(`/balance/transactions?limit=${limit}`),

  // ── Генерация изображений ────────────
  generateImage: (params: {
    prompt: string;
    model?: string;
    refImages?: string[];
    aspectRatio?: string;
    resolution?: string;
    count?: number;
  }) =>
    request<{ imageUrl: string; imageUrls?: string[]; creditsLeft: number; cost: number; requested?: number; generated?: number; refunded?: number }>('/image/generate', {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  // ── Генерация видео (все async) ──────
  generateVideo: (params: {
    prompt: string;
    model?: string;
    duration?: number;
    mode?: string;
    aspectRatio?: string;
    generateAudio?: boolean;
    startImageUrl?: string;
  }) =>
    request<AsyncGenResult>('/video/generate', {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  generateMotion: (params: {
    imageUrl: string;
    videoUrl?: string;
    characterOrientation?: 'video' | 'image';
    prompt?: string;
    duration?: number;
    model?: string;
    mode?: string;
  }) =>
    request<AsyncGenResult>('/video/motion', {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  generateAvatar: (params: {
    imageUrl: string;
    text: string;
    voiceId: string;
    voiceSpeed?: number;
    emotion?: string;
    avatarPrompt?: string;
  }) =>
    request<{ videoUrl: string; creditsLeft: number; cost: number }>('/video/avatar', {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  // ── Статус задач ───────────────────
  checkTaskStatus: (taskId: string) =>
    request<TaskStatus>(`/video/task-status/${taskId}`),

  getTasks: () =>
    request<Array<{
      task_id: string;
      type: string;
      status: string;
      result_url?: string;
      error_msg?: string;
      prompt?: string;
      cost: number;
      created_at: string;
    }>>('/video/tasks'),

  // Legacy motion-status (backward compat)
  checkMotionStatus: (requestId: string) =>
    request<{ status: string; videoUrl?: string; errorMsg?: string }>(`/video/motion-status/${requestId}`),

  // ── TTS ────────────────────────────
  generateTTS: (text: string, voiceId: string, voiceSpeed?: number) =>
    request<{ audioUrl: string }>('/video/tts', {
      method: 'POST',
      body: JSON.stringify({ text, voiceId, voiceSpeed }),
    }),

  previewVoice: (text: string, voiceId: string, voiceSpeed?: number) =>
    request<{ audioUrl: string }>('/video/tts-preview', {
      method: 'POST',
      body: JSON.stringify({ text, voiceId, voiceSpeed }),
    }),

  // ── Рефералы ────────────────────────────
  getReferralStats: () =>
    request<import('../types').ReferralStats & { rewards: Array<{ package: string; credits: number; label: string }> }>('/referral/stats'),

  getReferralFriends: () =>
    request<import('../types').ReferralFriend[]>('/referral/friends'),

  // ── История генераций ──────────────────
  getGenerations: (type?: string, limit = 20, offset = 0) =>
    request<Array<{ id: number; type: string; prompt: string | null; resultUrl: string; cost: number; createdAt: string }>>(`/generations?${new URLSearchParams({ ...(type ? { type } : {}), limit: String(limit), offset: String(offset) })}`),

  deleteGeneration: (id: number) =>
    request<{ success: boolean }>(`/generations/${id}`, { method: 'DELETE' }),

  // ── Оплата ────────────────────────────
  createPayment: (pkg: string) =>
    request<{ orderId: string; paymentUrl: string | null; message?: string }>('/payment/create', {
      method: 'POST',
      body: JSON.stringify({ package: pkg }),
    }),

  // ── Курс валют ────────────────────────
  getExchangeRate: () =>
    request<{ rate: number; baseRate: number; multiplier: number; updatedAt: string | null }>('/exchange-rate'),
};
