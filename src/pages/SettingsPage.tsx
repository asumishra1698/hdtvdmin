import useDocumentTitle from '../hooks/useDocumentTitle'

const settingGroups = [
  { title: 'Security', description: 'Manage session timeout, password rotation, and 2FA enforcement.' },
  { title: 'Playback defaults', description: 'Configure default stream quality, publishing windows, and alerts.' },
  { title: 'Notifications', description: 'Choose how operators receive approvals, failures, and review reminders.' },
]

function SettingsPage() {
  useDocumentTitle('Settings')

  return (
    <>
      <header className="glass-panel px-6 py-6 sm:px-8">
        <p className="text-sm uppercase tracking-[0.35em] text-brand-amber">Workspace controls</p>
        <h2 className="mt-3 text-3xl font-semibold text-white">Settings</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
          Configure platform behavior, notification rules, and security defaults.
        </p>
      </header>

      <section className="grid gap-5 lg:grid-cols-3">
        {settingGroups.map((group) => (
          <article key={group.title} className="glass-panel p-6">
            <h3 className="text-xl font-semibold text-white">{group.title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">{group.description}</p>
          </article>
        ))}
      </section>
    </>
  )
}

export default SettingsPage