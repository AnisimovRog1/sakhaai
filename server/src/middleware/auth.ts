import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Расширяем стандартный тип Request — добавляем поле userId
declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

// Этот middleware проверяет JWT токен в каждом защищённом запросе.
// Middleware — это функция, которая запускается ДО обработчика роута.
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Нет токена авторизации' });
    return;
  }

  const token = header.slice(7); // убираем "Bearer "

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
    req.userId = payload.userId;
    next(); // всё ок — передаём управление дальше
  } catch {
    res.status(401).json({ error: 'Токен недействителен или истёк' });
  }
}
