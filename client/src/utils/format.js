export const formatCurrency = (value = 0) =>
  `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

export const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'

export const categories = [
  'Salary',
  'Freelance',
  'Food',
  'Rent',
  'Transport',
  'Shopping',
  'Entertainment',
  'Bills',
  'Healthcare',
  'Education',
  'Investments',
  'Other'
]

export const paymentMethods = ['cash', 'card', 'bank_transfer', 'upi', 'wallet', 'other']
