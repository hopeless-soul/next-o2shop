import { Plus_Jakarta_Sans } from 'next/font/google'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { AdminFontProvider } from '@/components/admin/AdminFontProvider'
import { getMe } from '@/lib/api/auth'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-admin',
})

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getMe().catch(() => redirect('/login'))

  return (
    <div
      className={`${plusJakartaSans.variable} flex min-h-screen`}
      style={{ fontFamily: 'var(--font-admin)', background: 'var(--admin-bg)' }}
    >
      <AdminFontProvider fontVariable={plusJakartaSans.variable} />
      <AdminSidebar user={user} />
      <main
        className="flex-1 min-h-screen"
        style={{
          marginLeft: 'var(--admin-sidebar-width)',
          padding: 'var(--admin-content-py) var(--admin-content-px)',
          background: 'var(--admin-bg)',
        }}
      >
        {children}
      </main>
    </div>
  )
}
