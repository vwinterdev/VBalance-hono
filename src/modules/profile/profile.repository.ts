import type { CreateProfileDto, GetProfileByUserUUIDDto, ProfileResponse } from './profile.dto.js'
import supabase from '../../config/supabase.config.js'

export class ProfileRepository {

  async getProfileByUserUUID(dto: GetProfileByUserUUIDDto): Promise<ProfileResponse> {
    const { data: profile, error: profileError } = await supabase.from('profile').select("*").eq('id', dto.userUUID).single()
    console.log(profile)
    if (profileError) {
      throw new Error(profileError.message)
    }

    // Используем service role для получения информации о пользователе
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(dto.userUUID)
    console.log(user)
    if (userError || !user.user) {
      throw new Error('User not found')
    }

    return {
      id: profile.id,
      firstName: profile.first_name,
      lastName: profile.last_name,
      balance: profile.balance || 0,
      user: {
        id: user.user.id,
        email: user.user.email!,
        createdAt: user.user.created_at,
        isVerified: user.user.email_confirmed_at !== null,
      },
    }
  }

  async createProfile(dto: CreateProfileDto) {
    const { error } = await supabase.from('profile').insert({
      id: dto.id,
      first_name: dto.firstName,
      last_name: dto.lastName,
      avatar_path: dto.avatarPath,
    })
    if (error) throw new Error(error.message)
    return {
      code: 201,
      message: 'Profile created successfully'
    }
  }
}

