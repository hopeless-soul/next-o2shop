import clientApi, { setClientToken, clearClientToken } from './client'

export type LoginPayload = { email: string; password: string }
export type RegisterPayload = { email: string; password: string }

export async function login(payload: LoginPayload): Promise<void> {
  const res = await clientApi.post<{ access_token: string }>('/auth/login', payload)
  setClientToken(res.data.access_token)
}

export async function register(payload: RegisterPayload): Promise<void> {
  const res = await clientApi.post<{ access_token: string }>('/auth/register', payload)
  setClientToken(res.data.access_token)
}

export async function logout(): Promise<void> {
  clearClientToken()
  await clientApi.delete('/auth/logout')
}

export async function refreshTokens(): Promise<void> {
  await clientApi.post('/auth/refresh')
}
