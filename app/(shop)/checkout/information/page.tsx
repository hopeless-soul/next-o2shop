import { listAddresses } from "@/lib/api/addresses-server"
import type { SavedAddress } from "@/lib/types"
import InformationClient from "./InformationClient"

export default async function InformationPage() {
  let addresses: SavedAddress[] = []
  try {
    addresses = await listAddresses()
  } catch {
    // unauthenticated or fetch error — render without saved addresses
  }
  return <InformationClient addresses={addresses} />
}
