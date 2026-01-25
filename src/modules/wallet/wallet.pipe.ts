import { zValidator } from '@hono/zod-validator'
import { createWalletSchema, updateWalletSchema } from './wallet.dto.js'

export const createWalletValidation = zValidator('json', createWalletSchema)
export const updateWalletValidation = zValidator('json', updateWalletSchema)
