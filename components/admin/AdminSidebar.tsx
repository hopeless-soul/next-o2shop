'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Tag,
  Layers,
  Star,
  Truck,
  LogOut,
  type LucideIcon,
} from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { logout } from '@/lib/api/auth-client'

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  exact?: boolean
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'MANAGE',
    items: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
      { label: 'Products', href: '/admin/products', icon: Package },
      { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
      { label: 'Users', href: '/admin/users', icon: Users },
    ],
  },
  {
    label: 'CATALOG',
    items: [
      { label: 'Categories', href: '/admin/categories', icon: Tag },
      { label: 'Collections', href: '/admin/collections', icon: Layers },
    ],
  },
  {
    label: 'CONTENT',
    items: [
      { label: 'Reviews', href: '/admin/reviews', icon: Star },
      { label: 'Shipping', href: '/admin/shipping', icon: Truck },
    ],
  },
]

export interface AdminSidebarUser {
  email: string
  avatarUrl?: string | null
}

interface AdminSidebarProps {
  user: AdminSidebarUser
}

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href
    return pathname === href || pathname.startsWith(href + '/')
  }

  async function handleLogout() {
    await logout()
    router.push('/login')
  }

  const initials = user.email.slice(0, 2).toUpperCase()

  return (
    <aside className="fixed top-0 left-0 h-screen w-[240px] bg-[var(--admin-sidebar-bg)] border-r border-[var(--admin-sidebar-border)] overflow-y-auto flex flex-col z-40">
      {/* Logo zone — 48px height */}
      <div className="flex items-center h-12 px-4 shrink-0">
        <Link href="/admin" className="flex items-end gap-2 mt-4 hover:opacity-80 transition-opacity">
          <Image
            src="/logo.svg"
            width={33}
            height={44}
            alt="o2shop admin"
            priority
            className="object-contain"
          />
          <span 
            className="font-sans uppercase leading-tight"
                style={{
                  fontSize: "2rem",
                  letterSpacing: "0.84px",
                  color: "var(--color-foreground-strong)",
                  textTransform: "capitalize",
                  WebkitTextStroke: '1.4px var(--color-foreground-strong)'
                }}
          >
            Admin
          </span>
        </Link>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 py-2">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-4 pt-4 pb-1 text-[11px] font-semibold tracking-[0.08em] uppercase text-[var(--admin-text-muted)]">
              {group.label}
            </p>
            {group.items.map((item) => {
              const active = isActive(item.href, item.exact)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    'flex items-center gap-3 mx-2 px-3 h-8 rounded-[4px] text-[14px] font-medium transition-colors duration-150 ease mb-1',
                    active
                      ? 'bg-[var(--admin-primary)] text-white'
                      : 'text-[var(--admin-text-secondary)] hover:bg-[#e5e7eb]',
                  ].join(' ')}
                >
                  <Icon className="size-4 shrink-0" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Bottom user strip */}
      <div className="shrink-0 border-t border-[var(--admin-border)] p-3 flex items-center gap-2">
        <Avatar className="size-8 shrink-0">
          {user.avatarUrl ? (
            <AvatarImage src={user.avatarUrl} alt={user.email} />
          ) : null}
          <AvatarFallback className="text-xs bg-[var(--admin-border)] text-[var(--admin-text-secondary)]">
            {initials}
          </AvatarFallback>
        </Avatar>

        <span
          className="flex-1 min-w-0 text-[13px] text-[var(--admin-text-secondary)] truncate"
          style={{ maxWidth: '140px' }}
        >
          {user.email}
        </span>

        <button
          type="button"
          onClick={handleLogout}
          title="Log out"
          className="shrink-0 text-[var(--admin-text-muted)] hover:text-[var(--admin-text-secondary)] transition-colors duration-100 ease"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </aside>
  )
}
