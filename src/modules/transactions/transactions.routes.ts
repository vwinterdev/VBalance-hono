import { Hono } from "hono";

import { authMiddleware, getCurrentUserId } from "../../middleware/auth.middleware.js";

import { TransactionsService } from "./transactions.service.js";

const transactionsRoutes = new Hono()

transactionsRoutes.get('/list', authMiddleware(), async (c) => {
    try {
      const userId = getCurrentUserId(c)
      const walletId = c.req.query('walletId') ? parseInt(c.req.query('walletId')!) : undefined
      const month = c.req.query('month') ? parseInt(c.req.query('month')!) : undefined
      const year = c.req.query('year') ? parseInt(c.req.query('year')!) : undefined
      
      const transactionsService = new TransactionsService()
      const transactions = await transactionsService.getTransactions({ userId, walletId, month, year })

      return c.json({ list: transactions })
    } catch (error) {
      return c.json({ error: (error as Error).message }, 400)
    }
  })

transactionsRoutes.post('/create', authMiddleware(), async (c) => {
    try {
      const userId = getCurrentUserId(c)
      const transactionsService = new TransactionsService()
      const body = await c.req.json<{ balance: number, categoryId: string, walletId: number }>()

      if (!body.walletId) {
        return c.json({ error: 'walletId is required' }, 400)
      }

      const result = await transactionsService.createTransaction({ 
        userId, 
        balance: body.balance, 
        categoryId: body.categoryId,
        walletId: body.walletId
      })

      // Обрабатываем категорию (может быть массивом или объектом)
      const category = result.category ? (Array.isArray(result.category) ? result.category[0] : result.category) : null

      // Конвертируем type в isPositive для совместимости с фронтендом
      return c.json({
        id: result.id.toString(),
        balance: parseFloat(result.balance),
        categoryId: result.category_id.toString(),
        isPositive: result.type === 'income',
        createdAt: result.created_at,
        category: category ? {
          id: category.id.toString(),
          name: category.name,
          icon: category.icon,
          color: category.color,
          secondColor: category.second_color,
          type: category.type
        } : undefined
      })
    } catch (error) {
      return c.json({ error: (error as Error).message }, 400)
    }
  })

export default transactionsRoutes