import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchTransactions,
  removeTransactionById,
  saveTransaction
} from '../redux/slices/transactionSlice'
import {
  categories,
  formatCurrency,
  formatDate,
  paymentMethods
} from '../utils/format'

const emptyForm = {
  type: 'expense',
  title: '',
  amount: '',
  category: 'Food',
  paymentMethod: 'upi',
  description: '',
  transactionDate: new Date().toISOString().slice(0, 10)
}

function Transactions() {
  const dispatch = useDispatch()

  const {
    transactions,
    pagination,
    loading,
    error
  } = useSelector(state => state.transactions)

  const [filters, setFilters] = useState({
    search: '',
    type: '',
    category: '',
    sort: 'latest',
    page: 1
  })

  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState('')

  const query = useMemo(
    () => ({
      ...filters,
      limit: 10
    }),
    [filters]
  )

  useEffect(() => {
    dispatch(fetchTransactions(query))
  }, [dispatch, query])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const openEdit = item => {
    setEditingId(item._id)

    setForm({
      type: item.type,
      title: item.title,
      amount: item.amount,
      category: item.category,
      paymentMethod: item.paymentMethod || 'upi',
      description: item.description || '',
      transactionDate:
        item.transactionDate?.slice(0, 10) ||
        new Date().toISOString().slice(0, 10)
    })

    setShowForm(true)
  }

  const submitForm = async e => {
    e.preventDefault()

    try {
      await dispatch(
        saveTransaction({
          id: editingId,
          data: form
        })
      ).unwrap()

      setShowForm(false)
      setForm(emptyForm)
      setEditingId(null)

      dispatch(fetchTransactions(query))

      setMessage(
        editingId
          ? 'Transaction updated successfully.'
          : 'Transaction added successfully.'
      )

      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage(err)
    }
  }

  const deleteItem = async item => {
    const confirmDelete = window.confirm(
      'Delete this transaction?'
    )

    if (!confirmDelete) return

    try {
      await dispatch(
        removeTransactionById(item._id)
      ).unwrap()

      dispatch(fetchTransactions(query))

      setMessage('Transaction deleted successfully.')

      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage(err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Transactions
          </h1>

          <p className="text-gray-500">
            Manage your income and expenses.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white"
        >
          Add Transaction
        </button>
      </div>

      <section className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-5">
          <input
            type="text"
            placeholder="Search..."
            value={filters.search}
            onChange={e =>
              setFilters({
                ...filters,
                search: e.target.value,
                page: 1
              })
            }
            className="rounded border p-2"
          />

          <select
            value={filters.type}
            onChange={e =>
              setFilters({
                ...filters,
                type: e.target.value,
                page: 1
              })
            }
            className="rounded border p-2"
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <select
            value={filters.category}
            onChange={e =>
              setFilters({
                ...filters,
                category: e.target.value,
                page: 1
              })
            }
            className="rounded border p-2"
          >
            <option value="">All Categories</option>

            {categories.map(category => (
              <option
                key={category}
                value={category}
              >
                {category}
              </option>
            ))}
          </select>

          <select
            value={filters.sort}
            onChange={e =>
              setFilters({
                ...filters,
                sort: e.target.value
              })
            }
            className="rounded border p-2"
          >
            <option value="latest">
              Latest
            </option>
            <option value="oldest">
              Oldest
            </option>
            <option value="amount_desc">
              Amount High-Low
            </option>
            <option value="amount_asc">
              Amount Low-High
            </option>
          </select>

          <button
            onClick={() =>
              setFilters({
                search: '',
                type: '',
                category: '',
                sort: 'latest',
                page: 1
              })
            }
            className="rounded bg-gray-200 px-3 py-2"
          >
            Reset
          </button>
        </div>
      </section>

      {(error || message) && (
        <div
          className={`rounded-lg p-4 ${
            error
              ? 'bg-red-100 text-red-700'
              : 'bg-green-100 text-green-700'
          }`}
        >
          {error || message}
        </div>
      )}

      <section className="overflow-hidden rounded-lg border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-3">Title</th>
                <th className="p-3">Type</th>
                <th className="p-3">Category</th>
                <th className="p-3">Date</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="p-4 text-center"
                  >
                    Loading...
                  </td>
                </tr>
              ) : transactions.length ? (
                transactions.map(item => (
                  <tr key={item._id}>
                    <td className="p-3">
                      {item.title}
                    </td>

                    <td className="p-3 capitalize">
                      {item.type}
                    </td>

                    <td className="p-3">
                      {item.category}
                    </td>

                    <td className="p-3">
                      {formatDate(
                        item.transactionDate
                      )}
                    </td>

                    <td className="p-3">
                      {item.paymentMethod}
                    </td>

                    <td
                      className={`p-3 font-medium ${
                        item.type === 'income'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {formatCurrency(item.amount)}
                    </td>

                    <td className="p-3 space-x-2">
                      <button
                        onClick={() =>
                          openEdit(item)
                        }
                        className="rounded bg-yellow-500 px-2 py-1 text-white"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          deleteItem(item)
                        }
                        className="rounded bg-red-600 px-2 py-1 text-white"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="p-4 text-center"
                  >
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t px-4 py-3 text-sm">
          <span>
            Page {pagination.page || 1} of{' '}
            {pagination.pages || 1}
          </span>

          <div className="space-x-2">
            <button
              disabled={
                (pagination.page || 1) <= 1
              }
              onClick={() =>
                setFilters({
                  ...filters,
                  page: filters.page - 1
                })
              }
              className="rounded border px-3 py-1"
            >
              Previous
            </button>

            <button
              disabled={
                (pagination.page || 1) >=
                (pagination.pages || 1)
              }
              onClick={() =>
                setFilters({
                  ...filters,
                  page: filters.page + 1
                })
              }
              className="rounded border px-3 py-1"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editingId
                  ? 'Edit Transaction'
                  : 'Add Transaction'}
              </h2>

              <button
                onClick={() =>
                  setShowForm(false)
                }
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={submitForm}
              className="space-y-4"
            >
              <select
                value={form.type}
                onChange={e =>
                  setForm({
                    ...form,
                    type: e.target.value
                  })
                }
                className="w-full rounded border p-2"
              >
                <option value="income">
                  Income
                </option>
                <option value="expense">
                  Expense
                </option>
              </select>

              <input
                type="text"
                placeholder="Title"
                value={form.title}
                onChange={e =>
                  setForm({
                    ...form,
                    title: e.target.value
                  })
                }
                className="w-full rounded border p-2"
                required
              />

              <input
                type="number"
                placeholder="Amount"
                value={form.amount}
                onChange={e =>
                  setForm({
                    ...form,
                    amount: e.target.value
                  })
                }
                className="w-full rounded border p-2"
                required
              />

              <select
                value={form.category}
                onChange={e =>
                  setForm({
                    ...form,
                    category: e.target.value
                  })
                }
                className="w-full rounded border p-2"
              >
                {categories.map(category => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                ))}
              </select>

              <select
                value={form.paymentMethod}
                onChange={e =>
                  setForm({
                    ...form,
                    paymentMethod:
                      e.target.value
                  })
                }
                className="w-full rounded border p-2"
              >
                {paymentMethods.map(method => (
                  <option
                    key={method}
                    value={method}
                  >
                    {method}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={form.transactionDate}
                onChange={e =>
                  setForm({
                    ...form,
                    transactionDate:
                      e.target.value
                  })
                }
                className="w-full rounded border p-2"
              />

              <textarea
                rows="3"
                placeholder="Description"
                value={form.description}
                onChange={e =>
                  setForm({
                    ...form,
                    description:
                      e.target.value
                  })
                }
                className="w-full rounded border p-2"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 py-3 text-white"
              >
                {loading
                  ? 'Saving...'
                  : 'Save Transaction'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Transactions