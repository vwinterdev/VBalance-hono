import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

export const signUpSchema = z.object({
  email: z
    .string({ error: 'Email is required' })
    .email('Invalid email format')
    .toLowerCase()
    .trim(),
  password: z
    .string({ error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters long')
    .max(100, 'Password is too long'),
  display_name: z
    .string()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name is too long')
})

export const signInSchema = z.object({
  email: z
    .string({ error: 'Email is required' })
    .email('Invalid email format')
    .toLowerCase()
    .trim(),
  password: z
    .string({ error: 'Password is required' })
    .min(1, 'Password is required')
})


export const signUpValidation = zValidator('json', signUpSchema)
export const signInValidation = zValidator('json', signInSchema)