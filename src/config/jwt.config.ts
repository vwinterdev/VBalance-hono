// JWT конфигурация
export const JWT_CONFIG = {
  // Секретный ключ для подписи токенов (в production использовать переменную окружения)
  secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  
  // Алгоритм подписи
  algorithm: 'HS256' as const,
  
  // Время жизни токена (в секундах)
  expiresIn: 60 * 60 * 24 * 7, // 7 дней
  
  // Издатель токена
  issuer: 'vbalance-api',
}



