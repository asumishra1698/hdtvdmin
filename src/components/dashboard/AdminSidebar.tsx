import { useDispatch, useSelector } from 'react-redux'
import { NavLink } from 'react-router-dom'
import { signOut } from '../../redux/action/authAction'
import type { AppDispatch, RootState } from '../../redux/store'

const iconClassName = 'h-5 w-5 shrink-0'

const OverviewIcon = () => (
  <svg
    aria-hidden="true"
    className={iconClassName}
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.8"
    viewBox="0 0 24 24"
  >
    <path d="M3 12.5 12 4l9 8.5" />
    <path d="M5.5 10.5V20h13V10.5" />
    <path d="M9.5 20v-5h5v5" />
  </svg>
)

const UsersIcon = () => (
  <svg
    aria-hidden="true"
    className={iconClassName}
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.8"
    viewBox="0 0 24 24"
  >
    <path d="M16.5 19.5v-1a4 4 0 0 0-4-4h-5a4 4 0 0 0-4 4v1" />
    <circle cx="10" cy="7.5" r="3.5" />
    <path d="M17 11a3 3 0 1 0 0-6" />
    <path d="M20.5 19.5v-1a4 4 0 0 0-3-3.87" />
  </svg>
)

const VideosIcon = () => (
  <svg
    aria-hidden="true"
    className={iconClassName}
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.8"
    viewBox="0 0 24 24"
  >
    <rect x="3.5" y="5" width="17" height="14" rx="2.5" />
    <path d="m10 9 5 3-5 3V9Z" />
  </svg>
)

const ActivityLogsIcon = () => (
  <svg
    aria-hidden="true"
    className={iconClassName}
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.8"
    viewBox="0 0 24 24"
  >
    <path d="M12 6v6l4 2" />
    <circle cx="12" cy="12" r="8.5" />
  </svg>
)

const SettingsIcon = () => (
  <svg
    aria-hidden="true"
    className={iconClassName}
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.8"
    viewBox="0 0 24 24"
  >
    <path d="M12 8.75a3.25 3.25 0 1 0 0 6.5 3.25 3.25 0 0 0 0-6.5Z" />
    <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 0 1-2.83 2.83l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.92V20a2 2 0 0 1-4 0v-.14a1 1 0 0 0-.67-.95 1 1 0 0 0-1.03.23l-.1.1a2 2 0 0 1-2.83-2.83l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.92-.6H4a2 2 0 0 1 0-4h.14a1 1 0 0 0 .95-.67 1 1 0 0 0-.23-1.03l-.1-.1a2 2 0 0 1 2.83-2.83l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.92V4a2 2 0 0 1 4 0v.14a1 1 0 0 0 .67.95 1 1 0 0 0 1.03-.23l.1-.1a2 2 0 0 1 2.83 2.83l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .92.6H20a2 2 0 0 1 0 4h-.14a1 1 0 0 0-.95.67 1 1 0 0 0 .23 1.03l.1.1" />
  </svg>
)

const menuItems = [
  { label: 'Overview', to: '/dashboard', icon: <OverviewIcon /> },
  { label: 'All Users', to: '/dashboard/users', icon: <UsersIcon /> },
  { label: 'All Videos', to: '/dashboard/videos', icon: <VideosIcon /> },
  { label: 'Activity Logs', to: '/dashboard/activity-logs', icon: <ActivityLogsIcon /> },
  { label: 'Settings', to: '/dashboard/settings', icon: <SettingsIcon /> },
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
                src="https://hdtvbharat.com/hdtv_bharat_logo.png"
              />
            </div>
            <h1 className="mt-3 text-3xl font-semibold text-white">Dashboard</h1>
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
                    'group flex items-center gap-3 rounded-2xl border px-4 py-3 transition',
                    isActive
                      ? 'border-brand-cyan/25 bg-brand-cyan/10 text-white'
                      : 'border-white/10 bg-white/5 hover:border-white/20 hover:text-white',
                  ].join(' ')
                }
                end={item.to === '/dashboard'}
                to={item.to}
              >
                <span className="text-slate-400 transition group-hover:text-white">{item.icon}</span>
                <span>{item.label}</span>
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