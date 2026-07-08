import API from './api'

export const getMonthlyReport = (params) => API.get('/reports/monthly', { params })
export const downloadMonthlyReport = (params) => API.get('/reports/monthly', {
  params: { ...params, format: 'pdf' },
  responseType: 'blob'
})
