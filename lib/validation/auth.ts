import { z } from 'zod'

/* Login ──────────────────────────────────────────────────────────────────── */

export const loginSchema = z.object({
  email: z.email('Enter a valid email').trim().min(1, 'Required'),
  password: z.string().min(1, 'Required'),
})

export type LoginFormValues = z.infer<typeof loginSchema>

/* Register ───────────────────────────────────────────────────────────────── */

export const registerSchema = z
  .object({
    email: z.email('Enter a valid email').trim().min(1, 'Required'),
    password: z.string().min(8, 'Min. 8 characters'),
    confirmPassword: z.string().min(1, 'Required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type RegisterFormValues = z.infer<typeof registerSchema>
