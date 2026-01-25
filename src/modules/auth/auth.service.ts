import { AuthRepository } from './auth.repository.js'
import type { SignUpDto, SignInDto, AuthResponse, UserResponse } from './auth.dto.js'
import { HTTPException } from 'hono/http-exception'
import { generateToken } from '../../utils/jwt.js'

export class AuthService {
  private repository: AuthRepository

  constructor() {
    this.repository = new AuthRepository()
  }

  async signUp(dto: SignUpDto): Promise<AuthResponse> {
    const { data, error } = await this.repository.signUp(dto)

    if(error || !data.user) {
      throw new HTTPException(400, { 
        message: error?.message || 'User registration failed' 
      })
    }

    const accessToken = await generateToken(data.user.id, data.user.email!)

    return {
      message: 'User registered successfully',
      access_token: accessToken,
      user: {
        id: data.user.id,
        email: data.user.email || '',
        displayName: data.user.user_metadata?.display_name
      },
    }
  }

  async signIn(dto: SignInDto): Promise<AuthResponse> {
    const { data, error } = await this.repository.signIn(dto)
    if (error || !data.user) {
      throw new HTTPException(400, { 
        message: error?.message || 'Authentication failed' 
      })
    }
    const accessToken = await generateToken(data.user.id, data.user.email!)
    return {
      message: 'Signed in successfully',
      access_token: accessToken,
      user: {
        id: data.user.id,
        email: data.user.email!,
        displayName: data.user.user_metadata?.display_name
      },
    }
  }

  async getUserById(userId: string): Promise<UserResponse> {
    const { data, error } = await this.repository.getUserById(userId)

    if (error || !data.user) {
      throw new Error('User not found')
    }

    return {
        id: data.user.id,
        email: data.user.email!,
        displayName: data.user.user_metadata?.display_name,
        isVerified: data.user.user_metadata.email_verified,
      
    }
  }
}

