import API from './api'

export const getBudget = () => API.get('/budget')
export const setBudget = (data) => API.post('/budget', data)
export const updateBudget = (data) => API.put('/budget', data)
