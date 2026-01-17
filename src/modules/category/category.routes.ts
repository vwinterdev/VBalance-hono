import { Hono } from "hono";
import { authMiddleware, getCurrentUserId } from "../../middleware/auth.middleware.js";
import { CategoryService } from "./category.service.js";

const categoryRoutes = new Hono()

categoryRoutes.get('/all', authMiddleware(), async (c) => {
  try {
    const userId = getCurrentUserId(c)
    const categoryService = new CategoryService()
    const result = await categoryService.getCategories({ userUUID: userId })
    return c.json({
      list: result.categories
    })
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400)
  }
})

categoryRoutes.post('/create', authMiddleware(), async (c) => {
  try {
    const userId = getCurrentUserId(c)
    const categoryService = new CategoryService()
    const body = await c.req.json<{ name: string, color: string, secondColor: string, icon: string }>()
    const result = await categoryService.createCategory([{ name: body.name, userId: userId, color: body.color, secondColor: body.secondColor, icon: body.icon }])
    return c.json({
      result: result
    })
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400)
  }
})

export default categoryRoutes