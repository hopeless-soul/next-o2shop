'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/admin/ui/select'
import FormCard from '@/components/admin/FormCard'
import { createUserAction } from './actions'

const inputCls =
  'h-9 px-2.5 rounded-[4px] border border-[var(--admin-border-input)] bg-[var(--admin-bg)] text-[14px] text-[var(--admin-text-primary)] outline-none focus:border-[var(--admin-ring)] focus:ring-2 focus:ring-[var(--admin-ring)]/30 w-full'
const labelCls = 'block text-[12px] font-medium text-[var(--admin-text-secondary)] mb-1'

export default function CreateUserClient() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [role, setRole] = useState<'regular' | 'admin'>('regular')
  const [isActive, setIsActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await createUserAction({
        email,
        password,
        displayName: displayName || undefined,
        avatarUrl: avatarUrl || undefined,
        role,
        isActive,
      })
      router.push('/admin/users')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <FormCard title="Account">
        <div className="space-y-3 mt-3">
          <div>
            <label className={labelCls}>Email <span className="text-[var(--admin-destructive)]">*</span></label>
            <input
              required
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={inputCls}
              placeholder="user@example.com"
              autoComplete="off"
            />
          </div>
          <div>
            <label className={labelCls}>Password <span className="text-[var(--admin-destructive)]">*</span></label>
            <input
              required
              type="password"
              minLength={8}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={inputCls}
              placeholder="Min. 8 characters"
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className={labelCls}>Confirm Password <span className="text-[var(--admin-destructive)]">*</span></label>
            <input
              required
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className={inputCls}
              placeholder="Re-enter password"
              autoComplete="new-password"
            />
          </div>
        </div>
      </FormCard>

      <FormCard title="Profile">
        <div className="space-y-3 mt-3">
          <div>
            <label className={labelCls}>Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className={inputCls}
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <label className={labelCls}>Avatar URL</label>
            <input
              type="url"
              value={avatarUrl}
              onChange={e => setAvatarUrl(e.target.value)}
              className={inputCls}
              placeholder="https://example.com/avatar.jpg"
            />
          </div>
        </div>
      </FormCard>

      <FormCard title="Permissions">
        <div className="space-y-4 mt-3">
          <div>
            <label className={labelCls}>Role</label>
            <Select value={role} onValueChange={val => setRole(val as 'regular' | 'admin')}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="regular">Regular</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={isActive} onCheckedChange={setIsActive} />
            <span className="text-[14px] text-[var(--admin-text-primary)]">
              {isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </FormCard>

      {error && (
        <p className="text-[13px] text-[var(--admin-destructive)]">{error}</p>
      )}

      <div className="flex items-center justify-end gap-3 pt-2">
        <Link
          href="/admin/users"
          className="h-9 px-4 flex items-center rounded-[4px] text-[14px] font-medium text-[var(--admin-text-secondary)] border border-[var(--admin-border)] hover:bg-[var(--admin-sidebar-bg)] transition-colors duration-150"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 h-9 px-5 rounded-[4px] text-[14px] font-medium bg-[var(--admin-primary)] text-[var(--admin-text-on-dark)] hover:bg-[var(--admin-primary-hover)] transition-colors duration-150 disabled:opacity-70"
        >
          {saving && <Loader2 className="size-4 animate-spin" />}
          Create User
        </button>
      </div>
    </form>
  )
}
