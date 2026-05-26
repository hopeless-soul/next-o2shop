// No cart resource exists in the current API. This file is a typed stub.
// Fill in when the backend exposes cart endpoints.

export type CartItem = {
  id: string
  variantId: string
  productId: string
  productName: string
  variantSku: string
  quantity: number
  unitPrice: number
  total: number
}

export type Cart = {
  id: string
  items: CartItem[]
  subtotal: number
  currency: string
}

export async function getCart(): Promise<Cart> {
  throw new Error('Cart API not yet available')
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function addCartItem(variantId: string, quantity: number): Promise<Cart> {
  throw new Error('Cart API not yet available')
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function updateCartItem(itemId: string, quantity: number): Promise<Cart> {
  throw new Error('Cart API not yet available')
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function removeCartItem(itemId: string): Promise<void> {
  throw new Error('Cart API not yet available')
}
