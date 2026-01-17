import { Hono } from 'hono'
import { getSupabaseClient } from './config/supabase.config.js'

// Импорт модулей
import authRoutes from './modules/auth/auth.routes.js'
import profileRoutes from './modules/profile/profile.routes.js'
import uploadRoutes from './modules/upload/upload.routes.js'
import { cors } from 'hono/cors'
import categoryRoutes from './modules/category/category.routes.js'
import transactionsRoutes from './modules/transactions/transactions.routes.js'
const app = new Hono()

// Инициализируем Supabase клиент при старте
getSupabaseClient()

app.use('*', cors({
    origin:  process.env.CLIENT || 'http://localhost:5173',
    allowMethods: ['POST', 'GET', 'OPTIONS', 'DELETE'],
    maxAge: 600,
    credentials: true,
}))

// Подключаем модули с префиксами
app.route('/auth', authRoutes)
app.route('/profile', profileRoutes)
app.route('/category', categoryRoutes)
app.route('/upload', uploadRoutes)
app.route('/transactions', transactionsRoutes)
// Главная страница с документацией API
app.get('/', (c) => {
  return c.json({
    name: 'VBalance API',
    version: '1.0.0',
    description: 'Secure backend API with JWT authentication',
    endpoints: {
      auth: {
        signup: 'POST /auth/signup - Register new user (returns JWT token)',
        signin: 'POST /auth/signin - Sign in user (returns JWT token)',
        me: 'GET /auth/me - Get current user info (requires: Authorization: Bearer <token>)',
      },
      profile: {
        get: 'GET /profile - Get user profile (requires authentication)',
      },
      upload: {
        image: 'POST /upload/image - Upload image (requires authentication, multipart/form-data)',
        delete: 'DELETE /upload/image - Delete image (requires authentication)',
        list: 'GET /upload/images - List user images (requires authentication)',
      },
    },
    authentication: {
      type: 'JWT Bearer Token',
      header: 'Authorization: Bearer <your_token>',
      howToUse: [
        '1. Register or sign in to get access_token',
        '2. Include token in Authorization header for protected routes',
        '3. Example: Authorization: Bearer eyJhbGciOiJIUzI1NiIs...',
      ],
    },
  })
})

export default app