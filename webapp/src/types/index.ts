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

// Экраны приложения
export type Screen =
  | { name: 'home' }
  | { name: 'chatList' }
  | { name: 'chat'; chatId: number; chatTitle: string }
  | { name: 'imageGen' }
  | { name: 'videoGen' }
  | { name: 'settings' };
