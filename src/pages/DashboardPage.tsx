import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import StatCard from '../components/StatCard'
import useDocumentTitle from '../hooks/useDocumentTitle'
import type { RootState } from '../redux/store'

const releaseQueue = [
  {
    title: 'Regional partner access review',
    owner: 'Access Control',
    status: 'Needs approval',
  },
  {
    title: 'Ad inventory sync for Sports feed',
    owner: 'Revenue Ops',
    status: 'In progress',
  },
  {
    title: 'Weekend playout schedule audit',
    owner: 'Broadcast Ops',
    status: 'Ready to ship',
  },
]

const recentEvents = [
  'A new reseller account was provisioned in the West region.',
  'Playback monitoring alerts dropped below threshold after the latest patch.',
  'Two new admin seats were requested by the programming team.',
]

const teamPresence = [
  { name: 'Scheduling', load: '06 live tasks', tone: 'bg-emerald-400' },
  { name: 'Revenue', load: '03 approvals', tone: 'bg-brand-amber' },
  { name: 'Security', load: '01 incident review', tone: 'bg-brand-cyan' },
]

const getIstGreeting = (date: Date) => {
  const hourInIst = Number(
    new Intl.DateTimeFormat('en-IN', {
      hour: 'numeric',
      hour12: false,
      timeZone: 'Asia/Kolkata',
    }).format(date),
  )

  if (hourInIst >= 5 && hourInIst < 12) {
    return 'Good morning'
  }

  if (hourInIst >= 12 && hourInIst < 17) {
    return 'Good afternoon'
  }

  if (hourInIst >= 17 && hourInIst < 21) {
    return 'Good evening'
  }

  return 'Good night'
}

function DashboardPage() {
  useDocumentTitle('Dashboard')

  const user = useSelector((state: RootState) => state.auth.user)
  const [greeting, setGreeting] = useState(() => getIstGreeting(new Date()))

  useEffect(() => {
    const updateGreeting = () => {
      setGreeting(getIstGreeting(new Date()))
    }

    updateGreeting()

    const intervalId = window.setInterval(updateGreeting, 60_000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])

  if (!user) {
    return null
  }

  return (
    <>
      <header className="glass-panel px-6 py-6 sm:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-brand-amber">Control center</p>
            <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
              {greeting}, {user.name.split(' ')[0]}.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              HDTV Bharat runs smarter every day.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Response time</p>
              <p className="mt-3 text-2xl font-semibold text-white">148 ms</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Open incidents</p>
              <p className="mt-3 text-2xl font-semibold text-white">02</p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Monthly sign-ins" value="18.4K" delta="+8.2%" tone="cyan" />
        <StatCard label="Active operators" value="342" delta="+18" tone="emerald" />
        <StatCard label="Pending invites" value="12" delta="03 urgent" tone="amber" />
        <StatCard label="Blocked attempts" value="07" delta="watchlist" tone="rose" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="glass-panel px-6 py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-brand-cyan">Approval queue</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">Priority actions</h3>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.22em] text-slate-300">
              3 items
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {releaseQueue.map((item) => (
              <article key={item.title} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-white">{item.title}</h4>
                    <p className="mt-2 text-sm text-slate-400">Owner: {item.owner}</p>
                  </div>
                  <span className="rounded-full border border-brand-amber/25 bg-brand-amber/10 px-3 py-2 text-xs uppercase tracking-[0.24em] text-brand-amber">
                    {item.status}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-5">
          <div className="glass-panel px-6 py-6">
            <p className="text-sm uppercase tracking-[0.32em] text-brand-amber">Live feed</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Recent activity</h3>
            <div className="mt-6 space-y-4">
              {recentEvents.map((event) => (
                <div key={event} className="flex gap-3 rounded-[22px] border border-white/10 bg-white/5 p-4">
                  <div className="mt-1 h-2.5 w-2.5 rounded-full bg-brand-cyan" />
                  <p className="text-sm leading-6 text-slate-300">{event}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel px-6 py-6">
            <p className="text-sm uppercase tracking-[0.32em] text-brand-cyan">Teams online</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Current workload</h3>
            <div className="mt-6 space-y-4">
              {teamPresence.map((team) => (
                <div key={team.name} className="flex items-center justify-between rounded-[22px] border border-white/10 bg-white/5 px-4 py-4">
                  <div className="flex items-center gap-3">
                    <span className={`h-3 w-3 rounded-full ${team.tone}`} />
                    <div>
                      <p className="font-medium text-white">{team.name}</p>
                      <p className="text-sm text-slate-400">{team.load}</p>
                    </div>
                  </div>
                  <span className="text-xs uppercase tracking-[0.24em] text-slate-400">Active</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default DashboardPage