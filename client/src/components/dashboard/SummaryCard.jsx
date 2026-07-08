function SummaryCard({ label, value, tone = 'slate' }) {
  const tones = {
    slate: 'border-slate-200 bg-white text-slate-900',
    green: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    red: 'border-rose-200 bg-rose-50 text-rose-900',
    blue: 'border-sky-200 bg-sky-50 text-sky-900'
  }

  return (
    <div className={`rounded-lg border p-5 shadow-sm ${tones[tone]}`}>
      <p className="text-sm font-medium opacity-70">{label}</p>
      <p className="mt-3 text-2xl font-bold">{value}</p>
    </div>
  )
}

export default SummaryCard
