import type { SignUpDto, SignInDto } from './auth.dto.js'
import supabase from '../../config/supabase.config.js'

export class AuthRepository {

  async signUp(dto: SignUpDto) {
    return await supabase.auth.signUp({
      email: dto.email,
      password: dto.password,
    })
  }

  async signIn(dto: SignInDto) {
    return await supabase.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    })
  }

  async getUserById(userId: string) {
    return await supabase.auth.admin.getUserById(userId)
  }

}
