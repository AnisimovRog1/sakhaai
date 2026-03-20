const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

// Токен хранится в памяти (не в localStorage — безопаснее для Mini App)
let token: string | null = null;

export function setToken(t: string) {
  token = t;
}

// Базовая функция для запросов к серверу
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...headers, ...options?.headers },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Ошибка сервера' }));
    throw new Error(err.error ?? 'Ошибка сервера');
  }

  return res.json();
}

// ── Auth ──────────────────────────────
export const api = {
  auth: (initData: string, referralCode?: string) =>
    request<{ token: string; user: import('../types').User }>('/auth', {
      method: 'POST',
      body: JSON.stringify({ initData, referralCode }),
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
  generateImage: (prompt: string) =>
    request<{ imageUrl: string; creditsLeft: number; cost: number }>('/image/generate', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    }),

  // ── Генерация видео ──────────────────
  generateVideo: (prompt: string) =>
    request<{ videoUrl: string; creditsLeft: number; cost: number }>('/video/generate', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    }),

  generateMotion: (imageUrl: string, prompt?: string) =>
    request<{ videoUrl: string; creditsLeft: number; cost: number }>('/video/motion', {
      method: 'POST',
      body: JSON.stringify({ imageUrl, prompt }),
    }),

  generateAvatar: (imageUrl: string, text: string) =>
    request<{ videoUrl: string; creditsLeft: number; cost: number }>('/video/avatar', {
      method: 'POST',
      body: JSON.stringify({ imageUrl, text }),
    }),

  // ── Рефералы ────────────────────────────
  getReferralStats: () =>
    request<import('../types').ReferralStats & { rewards: Array<{ package: string; credits: number; label: string }> }>('/referral/stats'),

  getReferralFriends: () =>
    request<import('../types').ReferralFriend[]>('/referral/friends'),

  // ── История генераций ──────────────────
  getGenerations: (type?: string, limit = 20, offset = 0) =>
    request<Array<{ id: number; type: string; prompt: string | null; resultUrl: string; cost: number; createdAt: string }>>(`/generations?${new URLSearchParams({ ...(type ? { type } : {}), limit: String(limit), offset: String(offset) })}`),

  // ── Оплата ────────────────────────────
  createPayment: (pkg: string) =>
    request<{ orderId: string; paymentUrl: string | null; message?: string }>('/payment/create', {
      method: 'POST',
      body: JSON.stringify({ package: pkg }),
    }),
};
