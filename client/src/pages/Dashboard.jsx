import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import SummaryCard from '../components/dashboard/SummaryCard'
import { getDashboardSummary } from '../services/dashboardService'
import { formatCurrency, formatDate } from '../utils/format'

const COLORS = ['#2563eb', '#059669', '#f59e0b', '#dc2626', '#7c3aed', '#0891b2']

function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getDashboardSummary()
      .then((response) => setSummary(response.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Unable to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return<div className="text-slate-600">Loading dashboard...</div>
  if (error) return<div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-700">{error}</div>

  const trend = summary.monthlyTrend || []
  const categories = summary.categoryBreakdown || []
  const incomeExpense = trend.map((item) => ({ month: item.month, Income: item.income, Expense: item.expense }))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
        <p className="mt-1 text-sm text-slate-500">Your financial snapshot, trends, and recent activity.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total Income" value={formatCurrency(summary.totalIncome)} tone="green" />
        <SummaryCard label="Total Expense" value={formatCurrency(summary.totalExpense)} tone="red" />
        <SummaryCard label="Remaining Budget" value={formatCurrency(summary.budgetRemaining)} tone="blue" />
        <SummaryCard label="Savings" value={formatCurrency(summary.savings)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-lg border bg-white p-5 shadow-sm xl:col-span-2">
          <h3 className="font-semibold text-slate-900">Monthly Spending Trend</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Line type="monotone" dataKey="expense" stroke="#dc2626" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-lg border bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900">Category Distribution</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categories} dataKey="amount" nameKey="category" innerRadius={55} outerRadius={95}>
                  {categories.map((entry, index) => (
                    <Cell key={entry.category} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-lg border bg-white p-5 shadow-sm xl:col-span-2">
          <h3 className="font-semibold text-slate-900">Income vs Expense</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incomeExpense}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="Income" fill="#059669" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expense" fill="#dc2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-lg border bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900">Recent Transactions</h3>
          <div className="mt-4 space-y-3">
            {summary.recentTransactions?.length ? summary.recentTransactions.map((item) => (
              <div key={item._id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium text-slate-900">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.category} • {formatDate(item.transactionDate)}</p>
                </div>
                <p className={item.type === 'income' ? 'font-semibold text-emerald-600' : 'font-semibold text-rose-600'}>
                  {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                </p>
              </div>
            )) :<p className="text-sm text-slate-500">No transactions yet.</p>}
          </div>
        </section>
      </div>
    </div>
  )
}

export default Dashboard