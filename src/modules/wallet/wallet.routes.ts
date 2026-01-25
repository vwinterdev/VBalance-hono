import { Hono } from 'hono'
import { WalletService } from './wallet.service.js'
import { authMiddleware, getCurrentUserId } from '../../middleware/auth.middleware.js'
import { createWalletValidation, updateWalletValidation } from './wallet.pipe.js'
import type { CreateWalletDto, UpdateWalletDto } from './wallet.dto.js'
import { HTTPException } from 'hono/http-exception'

const walletRoutes = new Hono()

/**
 * GET /wallet/all - Получить все кошельки пользователя
 */
walletRoutes.get('/all', authMiddleware(), async (c) => {
  const userId = getCurrentUserId(c)
  const walletService = new WalletService()
  const wallets = await walletService.getUserWallets(userId)
  
  return c.json(wallets)
})

/**
 * GET /wallet/:id - Получить конкретный кошелек
 */
walletRoutes.get('/:id', authMiddleware(), async (c) => {
  const userId = getCurrentUserId(c)
  const walletId = parseInt(c.req.param('id'))
  
  if (isNaN(walletId)) {
    throw new HTTPException(400, { message: 'Invalid wallet ID' })
  }
  
  const walletService = new WalletService()
  const wallet = await walletService.getWalletById(walletId, userId)
  
  return c.json(wallet)
})

/**
 * POST /wallet/create - Создать новый кошелек
 */
walletRoutes.post('/create', authMiddleware(), createWalletValidation, async (c) => {
  const userId = getCurrentUserId(c)
  const body: CreateWalletDto = c.req.valid('json')
  
  const walletService = new WalletService()
  const result = await walletService.createWallet(body, userId)
  
  return c.json(result, 201)
})

/**
 * PUT /wallet/:id - Обновить кошелек (только owner)
 */
walletRoutes.put('/:id', authMiddleware(), updateWalletValidation, async (c) => {
  const userId = getCurrentUserId(c)
  const walletId = parseInt(c.req.param('id'))
  const body: UpdateWalletDto = c.req.valid('json')
  
  if (isNaN(walletId)) {
    throw new HTTPException(400, { message: 'Invalid wallet ID' })
  }
  
  const walletService = new WalletService()
  const result = await walletService.updateWallet(walletId, body, userId)
  
  return c.json(result)
})

/**
 * DELETE /wallet/:id - Удалить кошелек (только owner)
 */
walletRoutes.delete('/:id', authMiddleware(), async (c) => {
  const userId = getCurrentUserId(c)
  const walletId = parseInt(c.req.param('id'))
  
  if (isNaN(walletId)) {
    throw new HTTPException(400, { message: 'Invalid wallet ID' })
  }
  
  const walletService = new WalletService()
  const result = await walletService.deleteWallet(walletId, userId)
  
  return c.json(result)
})

export default walletRoutes
