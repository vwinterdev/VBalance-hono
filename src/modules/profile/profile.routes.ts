import { Hono } from "hono";
import { ProfileService } from "./profile.service.js";
import { authMiddleware, getCurrentUserId } from "../../middleware/auth.middleware.js";
import type { CreateProfileDto } from "./profile.dto.js";

const profileRoutes = new Hono()


/**
 * GET /profile/:userUUID - Получить профиль пользователя по UUID (для администраторов)
 * Защищенный endpoint, требует JWT токен
 */
profileRoutes.get('/me', authMiddleware(), async (c) => {
  try {
    const userId = getCurrentUserId(c)
    const profileService = new ProfileService()
    console.log(userId)
    const result = await profileService.getProfileByUserUUID({ userUUID: userId })
    return c.json(result)
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400)
  }
})

profileRoutes.post('/create', authMiddleware(), async (c) => {
  try {
    const userId = getCurrentUserId(c)
    const profileService = new ProfileService()
    const body = await c.req.json<Omit<CreateProfileDto, 'id'>>()

    const result = await profileService.createProfile({ 
      id: userId, 
      firstName: body.firstName, 
      lastName: body.lastName, 
      avatarPath: body.avatarPath || '' 
    })

    return c.json(result)
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400)
  }
})

export default profileRoutes