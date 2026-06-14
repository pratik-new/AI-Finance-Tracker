import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { updateProfileThunk } from '../redux/slices/authSlice'
import { changePassword, getAccountStats } from '../services/authService'
import { formatCurrency } from '../utils/format'

function Profile() {
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)
  const [profile, setProfile] = useState({ name: '', email: '' })
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' })
  const [stats, setStats] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) setProfile({ name: user.name, email: user.email })
    getAccountStats().then((response) => setStats(response.data.data))
  }, [user])

  const saveProfile = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')
    try {
      await dispatch(updateProfileThunk(profile)).unwrap()
      setMessage('Profile updated.')
    } catch (err) {
      setError(err || 'Unable to update profile.')
    }
  }

  const savePassword = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')
    try {
      await changePassword(passwords)
      setPasswords({ currentPassword: '', newPassword: '' })
      setMessage('Password changed.')
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to change password.')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Profile</h2>
        <p className="mt-1 text-sm text-slate-500">Manage your account details and review finance activity.</p>
      </div>

      {message &&<div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{message}</div>}
      {error &&<div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-lg border bg-white p-5 shadow-sm xl:col-span-2">
          <h3 className="font-semibold text-slate-900">User Details</h3>
          <form onSubmit={saveProfile} className="mt-4 grid gap-4 md:grid-cols-2">
            <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="rounded-lg border px-3 py-2" placeholder="Name" required />
            <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="rounded-lg border px-3 py-2" placeholder="Email" required />
            <button className="rounded-lg bg-primary px-4 py-2 font-semibold text-white md:w-max">Save Profile</button>
          </form>

          <h3 className="mt-8 font-semibold text-slate-900">Change Password</h3>
          <form onSubmit={savePassword} className="mt-4 grid gap-4 md:grid-cols-2">
            <input type="password" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} className="rounded-lg border px-3 py-2" placeholder="Current password" required />
            <input type="password" minLength="6" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} className="rounded-lg border px-3 py-2" placeholder="New password" required />
            <button className="rounded-lg bg-secondary px-4 py-2 font-semibold text-white md:w-max">Change Password</button>
          </form>
        </section>

        <section className="rounded-lg border bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900">Account Statistics</h3>
          <div className="mt-4 space-y-4">
            <div><p className="text-sm text-slate-500">Transactions</p><p className="text-2xl font-bold">{stats?.transactionCount || 0}</p></div>
            <div><p className="text-sm text-slate-500">Income</p><p className="text-xl font-bold text-emerald-600">{formatCurrency(stats?.totalIncome)}</p></div>
            <div><p className="text-sm text-slate-500">Expenses</p><p className="text-xl font-bold text-rose-600">{formatCurrency(stats?.totalExpense)}</p></div>
            <div><p className="text-sm text-slate-500">Savings</p><p className="text-xl font-bold text-slate-900">{formatCurrency(stats?.savings)}</p></div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Profile