import { z } from 'zod'

export const addressSchema = z.object({
  firstName: z.string().trim().min(1, 'Required'),
  lastName: z.string().trim().min(1, 'Required'),
  company: z.string().optional(),
  address1: z.string().trim().min(1, 'Required'),
  address2: z.string().optional(),
  city: z.string().trim().min(1, 'Required'),
  country: z.string().trim().min(1, 'Required'),
  province: z.string().trim().min(1, 'Required'),
  postalCode: z.string().trim().min(1, 'Required'),
  phone: z.string().trim().min(1, 'Required'),
})
