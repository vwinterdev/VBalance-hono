import type { Context, MiddlewareHandler } from 'hono'
import { verify } from 'hono/jwt'
import { JWT_CONFIG } from '../config/jwt.config.js'

declare module 'hono' {
  interface ContextVariableMap {
    userId: string
    userEmail: string
  }
}

/**
 * Middleware для защиты роутов с помощью JWT
 * Проверяет наличие и валидность Bearer токена в заголовке Authorization
 */
export const authMiddleware = (): MiddlewareHandler => {
  return async (c, next) => {
    const authHeader = c.req.header('Authorization')

    if (!authHeader) {
      return c.json({ error: 'Authorization header is required' }, 401)
    }

    if (!authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Invalid authorization format. Use: Bearer <token>' }, 401)
    }

    const token = authHeader.substring(7) // Убираем "Bearer "

    try {
      // Проверяем токен
      const payload = await verify(token, JWT_CONFIG.secret, JWT_CONFIG.algorithm)

      // Сохраняем данные пользователя в контекст
      c.set('userId', payload.sub as string)
      c.set('userEmail', payload.email as string)

      await next()
    } catch (error) {
      return c.json({ error: 'Invalid or expired token' }, 401)
    }
  }
}

/**
 * Получить ID текущего пользователя из контекста
 */
export const getCurrentUserId = (c: Context): string => {
  return c.get('userId')
}
