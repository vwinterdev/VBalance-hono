import { Hono } from 'hono'
import { authMiddleware, getCurrentUserId } from '../../middleware/auth.middleware.js'
import { AuthService } from './auth.service.js'
import type { SignUpDto, SignInDto } from './auth.dto.js'
import { signUpValidation, signInValidation } from './auth.pipe.js'
import { AuthPresenter } from './auth.presenter.js'
import { HTTPException } from 'hono/http-exception'

const authRoutes = new Hono()

authRoutes.post('/signup', signUpValidation, async (c) => {
  const authService = new AuthService()
  try {
    const body: SignUpDto = c.req.valid('json')
    const result = await authService.signUp(body)
    const present = AuthPresenter.presentAuthResponse(result)
    return c.json(present)
  } catch (error) {
    throw new HTTPException(400)
  }
})

authRoutes.post('/signin', signInValidation, async (c) => {
  const authService = new AuthService()
  try {
    const body: SignInDto = c.req.valid('json')
    const result = await authService.signIn(body)
    const present = AuthPresenter.presentAuthResponse(result)
    return c.json(present)
  } catch (error) {
    if((error as Error).message === 'Email not confirmed') {
      return c.json({ error: 'Email not confirmed' }, 409)
    }
    return c.json({ error: (error as Error).message }, 400)
  }
})

authRoutes.get('/me', authMiddleware(), async (c) => {
  try {
    const userId = getCurrentUserId(c)
    const authService = new AuthService()
    const result = await authService.getUserById(userId)
    const present = AuthPresenter.presentUser(result)
    return c.json(present)
  } catch (error) {  
    throw new HTTPException(400, { 
      message: (error as Error).message 
    })
  }
})

export default authRoutes

