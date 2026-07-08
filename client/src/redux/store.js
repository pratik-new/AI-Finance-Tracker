import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import transactionReducer from './slices/transactionSlice'
import budgetReducer from './slices/budgetSlice'
import insightReducer from './slices/insightSlice'

// configure the redux store with the following reducers:
//   auth         → authReducer
//   transactions → transactionReducer
//   budget       → budgetReducer
//   insights     → insightReducer

const store = configureStore({
  reducer: {
    auth: authReducer,
    transactions: transactionReducer,
    budget: budgetReducer,
    insights: insightReducer,
  },
})

export default store