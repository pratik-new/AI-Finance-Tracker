import API from './api'

export const getTransactions = (params) => API.get('/transactions', { params })
export const createTransaction = (data) => API.post('/transactions', data)
export const updateTransaction = (id, data) => API.put(`/transactions/${id}`, data)
export const deleteTransaction = (id) => API.delete(`/transactions/${id}`)
