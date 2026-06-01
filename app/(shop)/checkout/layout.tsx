// app/(shop)/checkout/layout.tsx
import { CheckoutProvider } from "@/lib/checkout/CheckoutContext"
import CheckoutShell from "./CheckoutShell"

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CheckoutProvider>
      <CheckoutShell>{children}</CheckoutShell>
    </CheckoutProvider>
  )
}
