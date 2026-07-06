import { listAddresses } from "@/lib/api/addresses-server"
import { getMe } from "@/lib/api/auth"
import type { SavedAddress } from "@/lib/types"
import InformationClient from "./InformationClient"

export default async function InformationPage() {
  let addresses: SavedAddress[] = []
  try {
    addresses = await listAddresses()
  } catch {
    // unauthenticated or fetch error — render without saved addresses
  }

  let accountEmail: string | null = null
  try {
    accountEmail = (await getMe()).email
  } catch {
    // unauthenticated — no account email to prefill
  }

  return <InformationClient addresses={addresses} accountEmail={accountEmail} />
}
