'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import AdminBadge, { roleVariant } from '@/components/admin/AdminBadge'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import type { AdminUser } from '@/lib/api/admin/admin-users'
import { updateUserAction, deleteUserAction } from './actions'
import { formatDate } from '@/lib/admin/formatters'

const labelCls = 'block text-[12px] font-medium text-[var(--admin-text-secondary)] mb-1'
const inputCls =
  'h-9 px-2.5 rounded-[4px] border border-[var(--admin-border-input)] bg-[var(--admin-bg)] text-[14px] text-[var(--admin-text-primary)] outline-none focus:border-[var(--admin-ring)] focus:ring-2 focus:ring-[var(--admin-ring)]/30 w-full'

export default function UserEditClient({ user }: { user: AdminUser }) {
  const router = useRouter()

  // Profile
  const [email, setEmail] = useState(user.email)
  const [displayName, setDisplayName] = useState(user.displayName ?? '')
  const [password, setPassword] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileSuccess, setProfileSuccess] = useState(false)

  // Permissions
  const [role, setRole] = useState<'regular' | 'admin'>(user.role)
  const [isActive, setIsActive] = useState(user.isActive)
  const [resetTokens, setResetTokens] = useState(false)
  const [permSaving, setPermSaving] = useState(false)
  const [permError, setPermError] = useState<string | null>(null)
  const [permSuccess, setPermSuccess] = useState(false)

  const [deleteOpen, setDeleteOpen] = useState(false)

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault()
    setProfileSaving(true)
    setProfileError(null)
    setProfileSuccess(false)
    try {
      await updateUserAction(user.id, {
        email: email !== user.email ? email : undefined,
        displayName: displayName !== (user.displayName ?? '') ? displayName || undefined : undefined,
        password: password || undefined,
      })
      setPassword('')
      setProfileSuccess(true)
      setTimeout(() => setProfileSuccess(false), 3000)
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Failed to save changes.')
    } finally {
      setProfileSaving(false)
    }
  }

  async function handlePermSave(e: React.FormEvent) {
    e.preventDefault()
    setPermSaving(true)
    setPermError(null)
    setPermSuccess(false)
    try {
      await updateUserAction(user.id, {
        role,
        isActive,
        ...(resetTokens ? { resetTokenVersion: true } : {}),
      })
      setResetTokens(false)
      setPermSuccess(true)
      setTimeout(() => setPermSuccess(false), 3000)
    } catch (err) {
      setPermError(err instanceof Error ? err.message : 'Failed to save changes.')
    } finally {
      setPermSaving(false)
    }
  }

  async function handleDelete() {
    await deleteUserAction(user.id)
    router.push('/admin/users')
  }

  const isDeleted = user.deletedAt !== null

  return (
    <div className="space-y-4 max-w-2xl">
      {/* ── Account Info (read-only metadata) ── */}
      <FormCard title="Account Info">
        <div className="space-y-4 mt-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className={labelCls}>Member Since</p>
              <p className="text-[14px] text-[var(--admin-text-secondary)]">{formatDate(user.createdAt)}</p>
            </div>
            <div>
              <p className={labelCls}>Status</p>
              <div className="flex gap-2 flex-wrap">
                {isDeleted ? (
                  <AdminBadge variant="error" label="Deleted" />
                ) : user.isActive ? (
                  <AdminBadge variant="success" label="Active" />
                ) : (
                  <AdminBadge variant="warning" label="Inactive" />
                )}
                {user.googleLinked && (
                  <AdminBadge variant="info" label="Google" />
                )}
              </div>
            </div>
          </div>
        </div>
      </FormCard>

      {/* ── Profile (editable) ── */}
      <form onSubmit={handleProfileSave}>
        <FormCard title="Profile">
          <div className="space-y-3 mt-3">
            <div>
              <label className={labelCls}>Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={inputCls}
                autoComplete="off"
              />
            </div>
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
              <label className={labelCls}>New Password</label>
              <input
                type="password"
                minLength={8}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={inputCls}
                placeholder="Leave blank to keep current password"
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-[var(--admin-border)] flex items-center justify-between gap-3">
            <div className="text-[13px]">
              {profileError && <span className="text-[var(--admin-destructive)]">{profileError}</span>}
              {profileSuccess && <span className="text-[var(--admin-status-success-fg)]">Profile updated.</span>}
            </div>
            <button
              type="submit"
              disabled={profileSaving}
              className="flex items-center gap-2 h-9 px-5 rounded-[4px] text-[14px] font-medium bg-[var(--admin-primary)] text-[var(--admin-text-on-dark)] hover:bg-[var(--admin-primary-hover)] transition-colors duration-150 disabled:opacity-70"
            >
              {profileSaving && <Loader2 className="size-4 animate-spin" />}
              Save Profile
            </button>
          </div>
        </FormCard>
      </form>

      {/* ── Permissions (editable) ── */}
      <form onSubmit={handlePermSave}>
        <FormCard title="Permissions">
          <div className="space-y-5 mt-3">
            <div>
              <label className={labelCls}>Role</label>
              <Select value={role} onValueChange={val => setRole(val as 'regular' | 'admin')}>
                <SelectTrigger className="w-48">
                  <SelectValue>
                    <span className="flex items-center gap-2">
                      <AdminBadge variant={roleVariant[role] ?? 'neutral'} label={role} />
                    </span>
                  </SelectValue>
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

            <div className="flex items-start gap-3 pt-1">
              <input
                id="resetTokens"
                type="checkbox"
                checked={resetTokens}
                onChange={e => setResetTokens(e.target.checked)}
                className="mt-0.5 size-4 rounded-[3px] border border-[var(--admin-border-input)] accent-[var(--admin-primary)] cursor-pointer"
              />
              <div>
                <label htmlFor="resetTokens" className="text-[14px] text-[var(--admin-text-primary)] cursor-pointer select-none">
                  Invalidate all sessions
                </label>
                <p className="text-[12px] text-[var(--admin-text-muted)] mt-0.5">
                  Forces this user to log in again on all devices. One-time action — resets after saving.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-[var(--admin-border)] flex items-center justify-between gap-3">
            <div className="text-[13px]">
              {permError && <span className="text-[var(--admin-destructive)]">{permError}</span>}
              {permSuccess && <span className="text-[var(--admin-status-success-fg)]">Permissions updated.</span>}
            </div>
            <button
              type="submit"
              disabled={permSaving}
              className="flex items-center gap-2 h-9 px-5 rounded-[4px] text-[14px] font-medium bg-[var(--admin-primary)] text-[var(--admin-text-on-dark)] hover:bg-[var(--admin-primary-hover)] transition-colors duration-150 disabled:opacity-70"
            >
              {permSaving && <Loader2 className="size-4 animate-spin" />}
              Save Permissions
            </button>
          </div>
        </FormCard>
      </form>

      {/* ── Danger Zone ── */}
      {!isDeleted && (
        <FormCard title="Danger Zone">
          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="text-[14px] text-[var(--admin-text-primary)]">Delete this user</p>
              <p className="text-[12px] text-[var(--admin-text-muted)] mt-0.5">
                Soft-deletes the account. The user can no longer log in.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className="h-9 px-4 rounded-[4px] text-[14px] font-medium border border-[var(--admin-destructive)] text-[var(--admin-destructive)] hover:bg-[var(--admin-status-error-bg)] transition-colors duration-150"
            >
              Delete User
            </button>
          </div>
        </FormCard>
      )}

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={open => { if (!open) setDeleteOpen(false) }}
        title="Delete User"
        description={`Delete ${user.displayName ?? user.email}? They will no longer be able to log in.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  )
}
