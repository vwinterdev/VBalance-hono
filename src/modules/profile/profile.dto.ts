export interface GetProfileByUserUUIDDto {
  userUUID: string
}

export interface ProfileResponse {
  id: string
  firstName: string
  lastName: string
  balance: number
  user: {
    id: string
    email?: string
    createdAt: string
    isVerified: boolean
  }
}

export interface CreateProfileDto {
  id: string
  firstName: string
  lastName: string
  avatarPath: string
  balance?: number
}