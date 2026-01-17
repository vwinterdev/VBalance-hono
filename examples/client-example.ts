/**
 * Пример клиентского кода для работы с VBalance API
 * 
 * Этот файл демонстрирует как клиент должен работать с API.
 * Клиент НЕ ЗНАЕТ о Supabase - он работает только с вашим API.
 */

const API_URL = 'http://localhost:8787'

// ============================================
// 1. Типы данных
// ============================================

interface SignUpRequest {
  email: string
  password: string
}

interface SignInRequest {
  email: string
  password: string
}

interface AuthResponse {
  message: string
  access_token: string
  user: {
    id: string
    email: string
  }
}

interface UserResponse {
  user: {
    id: string
    email: string
    created_at: string
  }
}

interface ErrorResponse {
  error: string
}

// ============================================
// 2. API клиент
// ============================================

class VBalanceAPI {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    // Загружаем токен из localStorage при инициализации
    this.token = localStorage.getItem('access_token')
  }

  /**
   * Регистрация нового пользователя
   */
  async signup(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${this.baseURL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error((data as ErrorResponse).error || 'Signup failed')
    }

    // Сохраняем токен
    this.setToken(data.access_token)

    return data
  }

  /**
   * Вход пользователя
   */
  async signin(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${this.baseURL}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error((data as ErrorResponse).error || 'Signin failed')
    }

    // Сохраняем токен
    this.setToken(data.access_token)

    return data
  }

  /**
   * Получить информацию о текущем пользователе
   */
  async getMe(): Promise<UserResponse> {
    return this.authenticatedRequest('/auth/me')
  }

  /**
   * Получить профиль
   */
  async getProfile(): Promise<any> {
    return this.authenticatedRequest('/profile')
  }

  /**
   * Выход из системы
   */
  logout(): void {
    this.removeToken()
  }

  /**
   * Проверить, авторизован ли пользователь
   */
  isAuthenticated(): boolean {
    return this.token !== null
  }

  /**
   * Получить токен
   */
  getToken(): string | null {
    return this.token
  }

  // ============================================
  // Приватные методы
  // ============================================

  /**
   * Сохранить токен
   */
  private setToken(token: string): void {
    this.token = token
    localStorage.setItem('access_token', token)
  }

  /**
   * Удалить токен
   */
  private removeToken(): void {
    this.token = null
    localStorage.removeItem('access_token')
  }

  /**
   * Выполнить аутентифицированный запрос
   */
  private async authenticatedRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    if (!this.token) {
      throw new Error('Not authenticated. Please sign in first.')
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${this.token}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      // Если токен истек, удаляем его
      if (response.status === 401) {
        this.removeToken()
      }
      throw new Error((data as ErrorResponse).error || 'Request failed')
    }

    return data
  }
}

// ============================================
// 3. Примеры использования
// ============================================

// Создаем экземпляр API клиента
const api = new VBalanceAPI(API_URL)

// Пример 1: Регистрация
async function exampleSignup() {
  try {
    const result = await api.signup('newuser@example.com', 'password123')
    console.log('Registered successfully:', result)
    console.log('Token:', result.access_token)
    console.log('User:', result.user)
  } catch (error) {
    console.error('Signup failed:', error)
  }
}

// Пример 2: Вход
async function exampleSignin() {
  try {
    const result = await api.signin('user@example.com', 'password123')
    console.log('Signed in successfully:', result)
    console.log('Token:', result.access_token)
  } catch (error) {
    console.error('Signin failed:', error)
  }
}

// Пример 3: Получить текущего пользователя
async function exampleGetMe() {
  try {
    const user = await api.getMe()
    console.log('Current user:', user)
  } catch (error) {
    console.error('Failed to get user:', error)
  }
}

// Пример 4: Получить профиль
async function exampleGetProfile() {
  try {
    const profile = await api.getProfile()
    console.log('Profile:', profile)
  } catch (error) {
    console.error('Failed to get profile:', error)
  }
}

// Пример 5: Выход
function exampleLogout() {
  api.logout()
  console.log('Logged out successfully')
}

// ============================================
// 4. React Hook пример
// ============================================

// import { useState, useEffect } from 'react'

/**
 * React Hook для работы с авторизацией
 */
/* 
function useAuth() {
  const [user, setUser] = useState<UserResponse['user'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Создаем API клиент
  const api = new VBalanceAPI(API_URL)

  // Проверяем авторизацию при монтировании
  useEffect(() => {
    const checkAuth = async () => {
      if (api.isAuthenticated()) {
        try {
          const response = await api.getMe()
          setUser(response.user)
        } catch (err) {
          setError((err as Error).message)
          api.logout()
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  const signup = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.signup(email, password)
      setUser(response.user)
      return response
    } catch (err) {
      setError((err as Error).message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signin = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.signin(email, password)
      setUser(response.user)
      return response
    } catch (err) {
      setError((err as Error).message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    api.logout()
    setUser(null)
  }

  return {
    user,
    loading,
    error,
    signup,
    signin,
    logout,
    isAuthenticated: api.isAuthenticated(),
  }
}
*/

// ============================================
// 5. Vue Composable пример
// ============================================

/**
 * Vue Composable для работы с авторизацией
 */
/*
import { ref, onMounted } from 'vue'

function useAuth() {
  const user = ref(null)
  const loading = ref(true)
  const error = ref(null)

  const api = new VBalanceAPI(API_URL)

  const checkAuth = async () => {
    if (api.isAuthenticated()) {
      try {
        const response = await api.getMe()
        user.value = response.user
      } catch (err) {
        error.value = err.message
        api.logout()
      }
    }
    loading.value = false
  }

  const signup = async (email: string, password: string) => {
    try {
      loading.value = true
      error.value = null
      const response = await api.signup(email, password)
      user.value = response.user
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const signin = async (email: string, password: string) => {
    try {
      loading.value = true
      error.value = null
      const response = await api.signin(email, password)
      user.value = response.user
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    api.logout()
    user.value = null
  }

  onMounted(checkAuth)

  return {
    user,
    loading,
    error,
    signup,
    signin,
    logout,
    isAuthenticated: api.isAuthenticated(),
  }
}
*/

// ============================================
// 6. Экспорт для использования
// ============================================

export { VBalanceAPI, type AuthResponse, type UserResponse, type ErrorResponse }



