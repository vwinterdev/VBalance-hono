import type { SupabaseClient } from '@supabase/supabase-js'
import { sign } from 'hono/jwt'
import { AuthRepository } from './auth.repository.js'
import { JWT_CONFIG } from '../../config/jwt.config.js'
import type { SignUpDto, SignInDto, AuthResponse, UserResponse } from './auth.dto.js'

/**
 * Service - бизнес-логика авторизации
 * Использует Supabase внутри, но возвращает собственные JWT токены
 */
export class AuthService {
  private repository: AuthRepository

  constructor() {
    this.repository = new AuthRepository()
  }

  /**
   * Генерирует JWT токен для пользователя
   */
  private async generateToken(userId: string, email: string): Promise<string> {
    const payload = {
      sub: userId,
      email: email,
      iss: JWT_CONFIG.issuer,
      exp: Math.floor(Date.now() / 1000) + JWT_CONFIG.expiresIn,
      iat: Math.floor(Date.now() / 1000),
    }

    return await sign(payload, JWT_CONFIG.secret, JWT_CONFIG.algorithm)
  }

  async signUp(dto: SignUpDto): Promise<AuthResponse> {
    const { data, error } = await this.repository.signUp(dto)

    if (error) {
      throw new Error(error.message)
    }

    if (!data.user) {
      throw new Error('User registration failed')
    }

    const accessToken = await this.generateToken(data.user.id, data.user.email!)

    return {
      message: 'User registered successfully',
      access_token: accessToken,
      user: {
        id: data.user.id,
        email: data.user.email || '',
      },
    }
  }

  async signIn(dto: SignInDto): Promise<AuthResponse> {
    const { data, error } = await this.repository.signIn(dto)

    if (error) {
      throw new Error(error.message)
    }

    if (!data.user) {
      throw new Error('Authentication failed')
    }

    // Генерируем собственный JWT токен
    const accessToken = await this.generateToken(data.user.id, data.user.email!)

    return {
      message: 'Signed in successfully',
      access_token: accessToken,
      user: {
        id: data.user.id,
        email: data.user.email!,
      },
    }
  }

  /**
   * Получить информацию о пользователе по ID
   */
  async getUserById(userId: string): Promise<UserResponse> {
    const { data, error } = await this.repository.getUserById(userId)

    if (error || !data.user) {
      throw new Error('User not found')
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email!,
        created_at: data.user.created_at,
        isVerified: data.user.user_metadata.email_verified,
      },
    }
  }
}

