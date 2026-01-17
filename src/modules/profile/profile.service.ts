import type { CreateProfileDto, GetProfileByUserUUIDDto } from './profile.dto.js'
import type { ProfileResponse } from './profile.dto.js'
import { ProfileRepository } from './profile.repository.js'

export class ProfileService {
    private repository: ProfileRepository

    constructor() {
      this.repository = new ProfileRepository()
    }

    async getProfileByUserUUID(dto: GetProfileByUserUUIDDto): Promise<ProfileResponse> {
        return await this.repository.getProfileByUserUUID(dto)
    }

    async createProfile(dto: CreateProfileDto) {
        return await this.repository.createProfile(dto)
    }
}