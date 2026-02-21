import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { updateUserAttributes, updatePassword, signOut } from 'aws-amplify/auth'
import { useUser } from '@/context/UserContext'
import { getMe, updateMe, deleteMe } from '@/lib/api'

function passwordStrength(pwd: string): { level: number; label: string; color: string } {
  if (!pwd) return { level: 0, label: '', color: '#6B7280' }
  let score = 0
  if (pwd.length >= 8) score++
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++
  if (/\d/.test(pwd)) score++
  if (/[^a-zA-Z0-9]/.test(pwd)) score++
  if (score <= 1) return { level: 1, label: 'Weak', color: '#EF4444' }
  if (score === 2) return { level: 2, label: 'Fair', color: '#F59E0B' }
  if (score === 3) return { level: 3, label: 'Good', color: '#22C55E' }
  return { level: 4, label: 'Strong', color: '#1A1A1A' }
}

export function SettingsPage() {
  const navigate = useNavigate()
  const { user, refreshUser } = useUser()
  const [fullName, setFullName] = useState('')
  const [storeUrl, setStoreUrl] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [profileError, setProfileError] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleteExpanded, setDeleteExpanded] = useState(false)
  const [deleteDeleting, setDeleteDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    if (user) {
      setFullName(user.name ?? '')
    }
  }, [user])

  useEffect(() => {
    let cancelled = false
    getMe().then((m) => {
      if (!cancelled) setStoreUrl(m.store_url ?? '')
    }).catch(() => {})
    return () => { cancelled = true }
  }, [])

  const strength = passwordStrength(newPassword)
  const passwordsMatch = newPassword && newPassword === confirmPassword
  const canUpdatePassword =
    currentPassword && newPassword.length >= 8 && passwordsMatch

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileError('')
    setProfileSaving(true)
    setProfileSaved(false)
    try {
      const attrs: Record<string, string> = {}
      if (fullName.trim()) attrs.name = fullName.trim()
      if (storeUrl.trim() !== undefined) attrs['custom:store_url'] = storeUrl.trim()
      if (Object.keys(attrs).length) {
        await updateUserAttributes({ userAttributes: attrs })
      }
      await updateMe({ name: fullName.trim(), store_url: storeUrl.trim() || undefined })
      await refreshUser()
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 2000)
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setProfileSaving(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess(false)
    setPasswordSaving(true)
    try {
      await updatePassword({
        oldPassword: currentPassword,
        newPassword,
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordSuccess(true)
    } catch (err) {
      setPasswordError(
          err instanceof Error && (err.message.includes('incorrect') || err.message.includes('Invalid'))
            ? 'Current password is incorrect.'
            : err instanceof Error
            ? err.message
            : 'Failed to update password'
        )
    } finally {
      setPasswordSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return
    setDeleteError('')
    setDeleteDeleting(true)
    try {
      await deleteMe()
      await signOut()
      navigate('/', { replace: true, state: { message: 'Your account has been deleted.' } })
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete account')
    } finally {
      setDeleteDeleting(false)
    }
  }

  return (
    <div className="p-8 bg-[#F5F5F5] min-h-[calc(100vh-64px)]">
      <div className="max-w-[640px]">
        <h2 className="font-bold text-[22px] text-[#1A1A1A]">Account Settings</h2>
        <p className="mt-1 text-[14px] text-[#6B7280]">
          Manage your profile and account.
        </p>

        {/* Profile card */}
        <div className="mt-6 bg-white border border-[#E5E7EB] rounded-lg p-8 mb-4">
          <h3 className="font-semibold text-base text-[#1A1A1A]">Profile</h3>
          <form onSubmit={handleSaveProfile} className="mt-4 space-y-4">
            <div>
              <label className="block font-medium text-[13px] text-[#1A1A1A] mb-1.5">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border border-[#E5E7EB] rounded-lg px-3.5 py-3 text-base focus:border-[#1A1A1A] focus:outline-none transition-all duration-200"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block font-medium text-[13px] text-[#1A1A1A] mb-1.5">Email</label>
              <input
                type="email"
                value={user?.email ?? ''}
                readOnly
                className="w-full border border-[#E5E7EB] rounded-lg px-3.5 py-3 text-base text-[#6B7280] bg-[#FAFAFA]"
              />
              <p className="mt-1 text-[14px] text-[#6B7280]">Email cannot be changed.</p>
            </div>
            <div>
              <label className="block font-medium text-[13px] text-[#1A1A1A] mb-1.5">Store URL</label>
              <input
                type="url"
                value={storeUrl}
                onChange={(e) => setStoreUrl(e.target.value)}
                className="w-full border border-[#E5E7EB] rounded-lg px-3.5 py-3 text-base focus:border-[#1A1A1A] focus:outline-none transition-all duration-200"
                placeholder="https://yourstore.com"
              />
            </div>
            {profileError && <p className="text-[13px] text-[#EF4444]">{profileError}</p>}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={profileSaving}
                className="border border-[#E5E7EB] bg-white text-[#1A1A1A] font-semibold text-[14px] px-5 py-2.5 rounded-lg hover:bg-[#FAFAFA] disabled:opacity-60"
              >
                {profileSaving ? 'Saving...' : profileSaved ? 'Saved ✓' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Password card */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-8 mb-4">
          <h3 className="font-semibold text-base text-[#1A1A1A]">Password</h3>
          <form onSubmit={handleUpdatePassword} className="mt-4 space-y-4">
            <div>
              <label className="block font-medium text-[13px] text-[#1A1A1A] mb-1.5">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full border border-[#E5E7EB] rounded-lg px-3.5 py-3 text-base focus:border-[#1A1A1A] focus:outline-none transition-all duration-200"
                placeholder="Enter current password"
              />
            </div>
            <div>
              <label className="block font-medium text-[13px] text-[#1A1A1A] mb-1.5">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-[#E5E7EB] rounded-lg px-3.5 py-3 text-base focus:border-[#1A1A1A] focus:outline-none transition-all duration-200"
                placeholder="Enter new password"
              />
              {newPassword && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex flex-1 h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-full flex-1 first:rounded-l last:rounded-r ${
                          i <= strength.level
                            ? i === 1
                              ? 'bg-[#EF4444]'
                              : i === 2
                              ? 'bg-[#F59E0B]'
                              : i === 3
                              ? 'bg-[#22C55E]'
                              : 'bg-[#1A1A1A]'
                            : 'bg-transparent'
                        }`}
                      />
                    ))}
                  </div>
                  <span
                    className={`text-[14px] font-medium ${
                      strength.level === 1
                        ? 'text-[#EF4444]'
                        : strength.level === 2
                        ? 'text-[#F59E0B]'
                        : strength.level === 3
                        ? 'text-[#22C55E]'
                        : strength.level === 4
                        ? 'text-[#1A1A1A]'
                        : 'text-[#6B7280]'
                    }`}
                  >
                    {strength.label}
                  </span>
                </div>
              )}
            </div>
            <div>
              <label className="block font-medium text-[13px] text-[#1A1A1A] mb-1.5">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-[#E5E7EB] rounded-lg px-3.5 py-3 text-base focus:border-[#1A1A1A] focus:outline-none transition-all duration-200"
                placeholder="Confirm new password"
              />
            </div>
            {passwordError && <p className="text-[13px] text-[#EF4444]">{passwordError}</p>}
            {passwordSuccess && <p className="text-[13px] text-[#22C55E]">Password updated.</p>}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!canUpdatePassword || passwordSaving}
                className="border border-[#E5E7EB] bg-white text-[#1A1A1A] font-semibold text-[14px] px-5 py-2.5 rounded-lg hover:bg-[#FAFAFA] disabled:opacity-50"
              >
                Update Password
              </button>
            </div>
          </form>
        </div>

        {/* Danger zone */}
        <div className="bg-white border border-[#EF4444] rounded-lg p-8">
          <h3 className="font-semibold text-base text-[#EF4444]">Danger Zone</h3>
          <p className="mt-3 text-[14px] text-[#6B7280]">
            Permanently delete your account and all your characters. This cannot be undone.
          </p>
          {!deleteExpanded ? (
            <button
              type="button"
              className="mt-4 border border-[#EF4444] bg-white text-[#EF4444] font-semibold text-[14px] py-2.5 px-5 rounded-lg hover:bg-[#FEF2F2] transition-all duration-200"
              onClick={() => setDeleteExpanded(true)}
            >
              Delete My Account
            </button>
          ) : (
            <div className="mt-4 p-4 bg-[#FEF2F2] rounded-lg mt-3">
              <p className="text-[14px] text-[#1A1A1A] font-medium mb-2">Type DELETE to confirm:</p>
              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="DELETE"
                className="w-full border border-[#FECACA] rounded-lg px-3.5 py-2.5 text-base mb-3"
              />
              {deleteError && <p className="text-[13px] text-[#EF4444] mb-2">{deleteError}</p>}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirm !== 'DELETE' || deleteDeleting}
                  className="bg-[#EF4444] text-white font-semibold text-[14px] px-5 py-2.5 rounded-lg disabled:opacity-50"
                >
                  {deleteDeleting ? 'Deleting...' : 'Confirm Delete'}
                </button>
                <button
                  type="button"
                  onClick={() => { setDeleteExpanded(false); setDeleteConfirm(''); setDeleteError('') }}
                  className="border border-[#E5E7EB] bg-white text-[#1A1A1A] font-medium text-[14px] px-5 py-2.5 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
