import useDocumentTitle from '../hooks/useDocumentTitle'

const logs = [
  'Admin account permissions updated for the content review team.',
  'Video approval workflow edited for weekend sports packages.',
  'User session revoked after suspicious device login detection.',
  'Settings export completed successfully for compliance archive.',
]

function ActivityLogsPage() {
  useDocumentTitle('Activity Logs')

  return (
    <>
      <header className="glass-panel px-6 py-6 sm:px-8">
        <p className="text-sm uppercase tracking-[0.35em] text-brand-cyan">Audit trail</p>
        <h2 className="mt-3 text-3xl font-semibold text-white">Activity logs</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
          Review important actions completed by operators, publishers, and admins.
        </p>
      </header>

      <section className="glass-panel px-6 py-6">
        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log} className="rounded-[22px] border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-300">
              {log}
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

export default ActivityLogsPage