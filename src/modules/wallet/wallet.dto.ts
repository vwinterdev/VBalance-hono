import { z } from 'zod'

export const createWalletSchema = z.object({
  name: z
    .string({ error: 'Name is required' })
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name is too long')
    .trim(),
  currency: z
    .string()
    .length(3, 'Currency must be 3 characters (e.g., RUB, USD)')
    .toUpperCase()
    .default('RUB'),
  icon: z
    .string()
    .max(10)
    .default('💰'),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color')
    .default('#4CAF50')
})

export const updateWalletSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name is too long')
    .trim()
    .optional(),
  currency: z
    .string()
    .length(3, 'Currency must be 3 characters')
    .toUpperCase()
    .optional(),
  icon: z
    .string()
    .max(10)
    .optional(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color')
    .optional()
})

export type CreateWalletDto = z.infer<typeof createWalletSchema>
export type UpdateWalletDto = z.infer<typeof updateWalletSchema>

export type WalletRole = 'owner' | 'editor' | 'viewer'

export interface WalletResponse {
  id: number
  name: string
  balance: number
  currency: string
  icon: string
  color: string
  role: WalletRole
  createdAt: string
}

export interface CreateWalletResponse {
  message: string
  walletId: number
}
