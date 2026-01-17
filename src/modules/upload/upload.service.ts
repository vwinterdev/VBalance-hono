import { UploadRepository } from './upload.repository.js'
import type { UploadFileDto, UploadResponse, DeleteFileDto, DeleteResponse } from './upload.dto.js'

export class UploadService {
  private repository: UploadRepository

  constructor() {
    this.repository = new UploadRepository()
  }

  async uploadFile(dto: UploadFileDto): Promise<UploadResponse> {
    // Валидация размера файла (максимум 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (dto.file.size > maxSize) {
      throw new Error('File size exceeds 5MB limit')
    }

    // Валидация типа файла
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(dto.file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, WEBP and GIF are allowed')
    }

    const uploadData = await this.repository.uploadFile(dto)
    const publicUrl = this.repository.getPublicUrl(uploadData.path, dto.bucket)

    return {
      message: 'File uploaded successfully',
      url: publicUrl,
      path: uploadData.path,
    }
  }

  /**
   * Удаление файла
   */
  async deleteFile(dto: DeleteFileDto): Promise<DeleteResponse> {
    await this.repository.deleteFile(dto)

    return {
      message: 'File deleted successfully',
    }
  }

  /**
   * Получение списка файлов пользователя
   */
  async getUserFiles(userId: string, bucket?: string, folder?: string) {
    const files = await this.repository.listUserFiles(userId, bucket, folder)

    // Добавляем публичные URL к каждому файлу
    const filesWithUrls = files.map(file => {
      const folderPath = folder ? `${folder}/${userId}` : `users/${userId}`
      const fullPath = `${folderPath}/${file.name}`
      const publicUrl = this.repository.getPublicUrl(fullPath, bucket)

      return {
        name: file.name,
        path: fullPath,
        url: publicUrl,
        createdAt: file.created_at,
        size: file.metadata?.size,
      }
    })

    return {
      files: filesWithUrls,
      total: filesWithUrls.length,
    }
  }
}

