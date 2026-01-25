export interface SignUpDto {
  email: string
  password: string
  display_name: string
}

export interface SignInDto {
  email: string
  password: string
}

/**
 * Ответ при успешной авторизации
 * Клиент получает только access_token и базовую информацию
 */
export interface AuthResponse {
  message: string
  access_token: string
  user: {
    id: string
    email: string
    displayName: string
  }
}

export interface ErrorResponse {
  error: string
}

/**
 * Ответ с информацией о текущем пользователе
 */
export interface UserResponse {
  
    id: string
    email: string
    displayName: string
    isVerified: boolean
  
}
