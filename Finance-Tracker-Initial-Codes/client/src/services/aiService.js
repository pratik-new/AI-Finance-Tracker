import API from './api'

export const generateInsights = () => API.post('/ai/insights')
export const predictSpending = () => API.post('/ai/predict')
