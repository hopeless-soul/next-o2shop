import clientApi from './client'

export type LoginPayload = { email: string; password: string }
export type RegisterPayload = { email: string; password: string }

export async function login(payload: LoginPayload): Promise<void> {
  await clientApi.post('/auth/login', payload)
}

export async function register(payload: RegisterPayload): Promise<void> {
  await clientApi.post('/auth/register', payload)
}

export async function logout(): Promise<void> {
  await clientApi.delete('/auth/logout')
}
