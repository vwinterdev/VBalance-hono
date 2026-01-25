import { Hono } from "hono";
import { authMiddleware, getCurrentUserId } from "../../middleware/auth.middleware.js";
import { CategoryService } from "./category.service.js";

const categoryRoutes = new Hono()

categoryRoutes.get('/all', authMiddleware(), async (c) => {
  try {
    const userId = getCurrentUserId(c)
    const walletId = c.req.query('walletId') ? parseInt(c.req.query('walletId')!) : undefined
    const categoryService = new CategoryService()
    const result = await categoryService.getCategories({ userId, walletId })
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
    const body = await c.req.json<{ name: string, color: string, secondColor?: string, second_color?: string, icon: string, type: 'incomes' | 'expenses' | 'mixed', walletId: number }>()
    
    if (!body.walletId) {
      return c.json({ error: 'walletId is required' }, 400)
    }
    
    // Поддерживаем оба варианта: secondColor (camelCase) и second_color (snake_case)
    const secondColor = body.secondColor || body.second_color || body.color
    
    const result = await categoryService.createCategory([{ 
      name: body.name, 
      walletId: body.walletId, 
      color: body.color, 
      secondColor: secondColor, 
      icon: body.icon,
      type: body.type
    }], userId)
    return c.json({
      result: result
    })
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400)
  }
})

export default categoryRoutes