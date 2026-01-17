import { Hono } from "hono";

import { authMiddleware, getCurrentUserId } from "../../middleware/auth.middleware.js";

import { TransactionsService } from "./transactions.service.js";

const transactionsRoutes = new Hono()

transactionsRoutes.get('/list', authMiddleware(), async (c) => {
    try {
      const userId = getCurrentUserId(c)
      const month = c.req.query('month') ? parseInt(c.req.query('month')!) : undefined
      const year = c.req.query('year') ? parseInt(c.req.query('year')!) : undefined
      
      const transactionsService = new TransactionsService()
      const transactions = await transactionsService.getTransactions({ userId, month, year })

      return c.json({ list: transactions })
    } catch (error) {
      return c.json({ error: (error as Error).message }, 400)
    }
  })

transactionsRoutes.post('/create', authMiddleware(), async (c) => {
    try {
      const userId = getCurrentUserId(c)
      const transactionsService = new TransactionsService()
      const body = await c.req.json<{ balance: number, categoryId: string }>()

      const result = await transactionsService.createTransaction({ userId, balance: body.balance, categoryId: body.categoryId })

      return c.json(result)
    } catch (error) {
      return c.json({ error: (error as Error).message }, 400)
    }
  })

export default transactionsRoutes