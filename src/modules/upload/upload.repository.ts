import supabase from '../../config/supabase.config.js'
import type { UploadFileDto, DeleteFileDto } from './upload.dto.js'

export class UploadRepository {
  private readonly DEFAULT_BUCKET = 'image'

  /**
   * Загрузка файла в Supabase Storage
   */
  async uploadFile(dto: UploadFileDto) {
    const bucket = dto.bucket || this.DEFAULT_BUCKET
    const folder = dto.folder || 'users'
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(7)
    
    // Формируем путь к файлу: folder/userId/timestamp-random.ext
    const fileExt = dto.file instanceof File ? dto.file.name.split('.').pop() : 'jpg'
    const filePath = `${folder}/${dto.userId}/${timestamp}-${randomString}.${fileExt}`

    // Конвертируем File/Blob в ArrayBuffer для загрузки
    const arrayBuffer = await dto.file.arrayBuffer()
    const fileBuffer = new Uint8Array(arrayBuffer)

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, fileBuffer, {
        contentType: dto.file.type || 'image/jpeg',
        upsert: false,
      })

    if (error) {
      throw new Error(`Upload failed: ${error.message}`)
    }

    return data
  }

  /**
   * Получение публичного URL файла
   */
  getPublicUrl(path: string, bucket?: string) {
    const bucketName = bucket || this.DEFAULT_BUCKET
    
    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(path)

    return data.publicUrl
  }

  /**
   * Удаление файла из Storage
   */
  async deleteFile(dto: DeleteFileDto) {
    const bucket = dto.bucket || this.DEFAULT_BUCKET

    const { data, error } = await supabase.storage
      .from(bucket)
      .remove([dto.path])

    if (error) {
      throw new Error(`Delete failed: ${error.message}`)
    }

    return data
  }

  /**
   * Получение списка файлов пользователя
   */
  async listUserFiles(userId: string, bucket?: string, folder?: string) {
    const bucketName = bucket || this.DEFAULT_BUCKET
    const folderPath = folder ? `${folder}/${userId}` : `users/${userId}`

    const { data, error } = await supabase.storage
      .from(bucketName)
      .list(folderPath, {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' }
      })

    if (error) {
      throw new Error(`List files failed: ${error.message}`)
    }

    return data
  }
}

