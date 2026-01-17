import { Hono } from 'hono'
import { authMiddleware, getCurrentUserId } from '../../middleware/auth.middleware.js'
import { UploadService } from './upload.service.js'

const uploadRoutes = new Hono()

/**
 * POST /upload/image - Загрузка изображения
 * Защищенный endpoint, требует JWT токен
 */
uploadRoutes.post('/image', authMiddleware(), async (c) => {
  try {
    const userId = getCurrentUserId(c)
    
    // Получаем файл из formData
    const body = await c.req.parseBody()
    const file = body['file']

    if (!file || !(file instanceof File)) {
      return c.json({ error: 'File is required' }, 400)
    }

    // Опциональные параметры
    const bucket = body['bucket']?.toString()
    const folder = body['folder']?.toString()

    const uploadService = new UploadService()
    const result = await uploadService.uploadFile({
      file,
      userId,
      bucket,
      folder,
    })

    return c.json(result, 201)
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400)
  }
})

/**
 * DELETE /upload/image - Удаление изображения
 * Защищенный endpoint, требует JWT токен
 */
uploadRoutes.delete('/image', authMiddleware(), async (c) => {
  try {
    const body = await c.req.json()
    const { path, bucket } = body

    if (!path) {
      return c.json({ error: 'File path is required' }, 400)
    }

    const uploadService = new UploadService()
    const result = await uploadService.deleteFile({ path, bucket })

    return c.json(result)
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400)
  }
})

/**
 * GET /upload/images - Получить список изображений пользователя
 * Защищенный endpoint, требует JWT токен
 */
uploadRoutes.get('/images', authMiddleware(), async (c) => {
  try {
    const userId = getCurrentUserId(c)
    const bucket = c.req.query('bucket')
    const folder = c.req.query('folder')

    const uploadService = new UploadService()
    const result = await uploadService.getUserFiles(userId, bucket, folder)

    return c.json(result)
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400)
  }
})

export default uploadRoutes


