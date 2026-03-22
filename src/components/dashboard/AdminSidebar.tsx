import { useDispatch, useSelector } from 'react-redux'
import { NavLink } from 'react-router-dom'
import { signOut } from '../../redux/action/authAction'
import type { AppDispatch, RootState } from '../../redux/store'

const menuItems = [
  { label: 'Overview', to: '/dashboard' },
  { label: 'All Users', to: '/dashboard/users' },
  { label: 'All Videos', to: '/dashboard/videos' },
  { label: 'Activity Logs', to: '/dashboard/activity-logs' },
  { label: 'Settings', to: '/dashboard/settings' },
]

const normalizeRole = (role: string | undefined) =>
  (role ?? '').trim().toLowerCase().replace(/[_\s-]+/g, '')

function AdminSidebar() {
  const dispatch = useDispatch<AppDispatch>()
  const user = useSelector((state: RootState) => state.auth.user)

  if (!user) {
    return null
  }

  const isSuperadmin = normalizeRole(user.role) === 'superadmin'
  const visibleMenuItems = menuItems.filter(
    (item) => item.to !== '/dashboard/users' || isSuperadmin,
  )

  return (
    <aside className="modern-scrollbar glass-panel lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:overflow-y-auto">
      <div className="flex h-full flex-col justify-between gap-8 px-6 py-7">
        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-3">
              <img
                alt="HDTV Bharat logo"
                className="h-auto w-40 object-contain"
                src="https://hdtvbharat.com/images/hdtv_bharat_logo.png"
              />          
            </div>
            <h1 className="mt-3 text-3xl font-semibold text-white">Dashboard</h1>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Fixed navigation for every admin workspace section with quick access to operations.
            </p>
          </div>

          <div className="rounded-[26px] border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Signed in as</p>
            <p className="mt-4 text-xl font-semibold text-white">{user.name}</p>
            <p className="mt-2 text-sm text-slate-300">{user.email}</p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs uppercase tracking-[0.22em]">
              <span className="rounded-full border border-brand-cyan/30 bg-brand-cyan/10 px-3 py-2 text-brand-cyan">
                {user.role}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-slate-300">
                {user.company}
              </span>
            </div>
          </div>

          <nav className="space-y-3 text-sm text-slate-300">
            {visibleMenuItems.map((item) => (
              <NavLink
                key={item.to}
                className={({ isActive }) =>
                  [
                    'block rounded-2xl border px-4 py-3 transition',
                    isActive
                      ? 'border-brand-cyan/25 bg-brand-cyan/10 text-white'
                      : 'border-white/10 bg-white/5 hover:border-white/20 hover:text-white',
                  ].join(' ')
                }
                end={item.to === '/dashboard'}
                to={item.to}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <button
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-rose-300/40 hover:bg-rose-400/10"
          onClick={() => dispatch(signOut())}
          type="button"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}

export default AdminSidebar