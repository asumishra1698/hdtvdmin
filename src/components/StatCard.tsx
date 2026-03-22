interface StatCardProps {
  label: string
  value: string
  delta: string
  tone: 'cyan' | 'amber' | 'emerald' | 'rose'
}

const toneClasses: Record<StatCardProps['tone'], string> = {
  cyan: 'text-brand-cyan',
  amber: 'text-brand-amber',
  emerald: 'text-emerald-300',
  rose: 'text-rose-300',
}

function StatCard({ delta, label, tone, value }: StatCardProps) {
  return (
    <article className="metric-card">
      <p className="text-sm text-slate-400">{label}</p>
      <div className="mt-4 flex items-end justify-between gap-4">
        <p className="text-3xl font-semibold text-white">{value}</p>
        <span className={`text-xs font-semibold uppercase tracking-[0.28em] ${toneClasses[tone]}`}>
          {delta}
        </span>
      </div>
    </article>
  )
}

export default StatCard