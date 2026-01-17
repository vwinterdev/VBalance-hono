import { Hono } from 'hono'
import { authMiddleware, getCurrentUserId } from '../../middleware/auth.middleware.js'
import { AuthService } from './auth.service.js'
import type { SignUpDto, SignInDto } from './auth.dto.js'

const authRoutes = new Hono()


authRoutes.post('/signup', async (c) => {
  try {
    const body = await c.req.json<SignUpDto>()
    const { email, password } = body

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400)
    }

    if (password.length < 6) {
      return c.json({ error: 'Password must be at least 6 characters long' }, 400)
    }
    const dto: SignUpDto = { email, password }

    const authService = new AuthService()

    const result = await authService.signUp(dto)
    
    return c.json(result)
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400)
  }
})

authRoutes.post('/signin', async (c) => {
  try {
    const body = await c.req.json<SignInDto>()
    const { email, password } = body

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400)
    }

    const authService = new AuthService()
    
    const dto: SignInDto = { email, password }
   
    const result = await authService.signIn(dto)
    console.log(result)
    return c.json(result)
  } catch (error) {
    if((error as Error).message === 'Email not confirmed') {
      return c.json({ error: 'Email not confirmed' }, 409)
    }
    return c.json({ error: (error as Error).message }, 400)
  }
})

/**
 * GET /auth/me - Получить информацию о текущем пользователе
 * Защищенный endpoint, требует JWT токен в заголовке Authorization
 */
authRoutes.get('/me', authMiddleware(), async (c) => {
  try {
    const userId = getCurrentUserId(c)
    
    const authService = new AuthService()
    
    const result = await authService.getUserById(userId)
    
    if(!result.user.isVerified) {
      return c.json({ error: 'User is not verified' }, 409)
    }

    return c.json(result)
  } catch (error) {
    return c.json({ error: (error as Error).message }, 401)
  }
})

export default authRoutes

