export type User = {
  id: number;
  username: string | null;
  firstName: string;
  credits: number;
  languageCode: 'ru' | 'sah';
};

export type Chat = {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
};

export type Message = {
  id: number;
  role: 'user' | 'model';
  content: string;
  created_at: string;
};

// Реферальная статистика
export type ReferralStats = {
  total: number;
  paid: number;
  held: number;
  pending: number;
  totalEarned: number;
  thisMonth: number;
  monthlyLimit: number;
};

// Один реферал (друг)
export type ReferralFriend = {
  id: number;
  status: 'pending' | 'held' | 'paid' | 'rejected';
  package: string | null;
  rewardCredits: number;
  createdAt: string;
  username: string | null;
  firstName: string;
};

// Экраны приложения
export type Screen =
  | { name: 'home' }
  | { name: 'chatList' }
  | { name: 'chat'; chatId: number; chatTitle: string }
  | { name: 'imageGen' }
  | { name: 'videoGen' }
  | { name: 'friends' }
  | { name: 'settings' };
