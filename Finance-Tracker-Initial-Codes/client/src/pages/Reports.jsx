import { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { downloadMonthlyReport, getMonthlyReport } from '../services/reportService'
import { formatCurrency, formatDate } from '../utils/format'

function Reports() {
  const now = new Date()
  const [period, setPeriod] = useState({ month: now.getMonth() + 1, year: now.getFullYear() })
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const params = useMemo(() => period, [period])

  useEffect(() => {
    setLoading(true)
    getMonthlyReport(params)
      .then((response) => setReport(response.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Unable to load report'))
      .finally(() => setLoading(false))
  }, [params])

  const exportPdf = async () => {
    const response = await downloadMonthlyReport(params)
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `finance-report-${period.year}-${String(period.month).padStart(2, '0')}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Reports</h2>
          <p className="mt-1 text-sm text-slate-500">Review monthly trends, category analytics, and export a PDF report.</p>
        </div>
        <button onClick={exportPdf} className="rounded-lg bg-primary px-4 py-2 font-semibold text-white">Export PDF</button>
      </div>

      <section className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-3">
          <select value={period.month} onChange={(e) => setPeriod({ ...period, month: Number(e.target.value) })} className="rounded-lg border px-3 py-2">
            {Array.from({ length: 12 }, (_, index) => (
              <option key={index + 1} value={index + 1}>{new Date(2024, index, 1).toLocaleString('en-IN', { month: 'long' })}</option>
            ))}
          </select>
          <input type="number" value={period.year} onChange={(e) => setPeriod({ ...period, year: Number(e.target.value) })} className="rounded-lg border px-3 py-2" />
        </div>
      </section>

      {loading &&<p className="text-slate-500">Loading report...</p>}
      {error &&<div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}

      {report && !loading && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Income</p><p className="text-2xl font-bold text-emerald-600">{formatCurrency(report.totalIncome)}</p></div>
            <div className="rounded-lg border bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Expense</p><p className="text-2xl font-bold text-rose-600">{formatCurrency(report.totalExpense)}</p></div>
            <div className="rounded-lg border bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Savings</p><p className="text-2xl font-bold text-slate-900">{formatCurrency(report.savings)}</p></div>
            <div className="rounded-lg border bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Remaining</p><p className="text-2xl font-bold text-sky-700">{formatCurrency(report.budgetRemaining)}</p></div>
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <section className="rounded-lg border bg-white p-5 shadow-sm xl:col-span-2">
              <h3 className="font-semibold text-slate-900">Category Analytics</h3>
              <div className="mt-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={report.categoryBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Bar dataKey="amount" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="rounded-lg border bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-slate-900">Transactions</h3>
              <div className="mt-4 max-h-72 space-y-3 overflow-auto">
                {report.transactions.length ? report.transactions.map((item) => (
                  <div key={item._id} className="rounded-lg border p-3">
                    <div className="flex justify-between">
                      <p className="font-medium text-slate-900">{item.title}</p>
                      <p className={item.type === 'income' ? 'font-semibold text-emerald-600' : 'font-semibold text-rose-600'}>{formatCurrency(item.amount)}</p>
                    </div>
                    <p className="text-xs text-slate-500">{item.category} • {formatDate(item.transactionDate)}</p>
                  </div>
                )) :<p className="text-sm text-slate-500">No transactions for this period.</p>}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  )
}

export default Reports