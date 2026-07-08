import { useEffect } from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import './App.css'

// Pages
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Budget from './pages/Budget'
import Insights from './pages/Insights'
import Reports from './pages/Reports'
import Profile from './pages/Profile'

// Layout
import Layout from './components/layout/Layout'

// Redux
import { useDispatch, useSelector } from 'react-redux'
import { refreshUser } from './redux/slices/authSlice'

function ProtectedRoute() {
  const { isAuthenticated } = useSelector(state => state.auth)

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (token) {
      dispatch(refreshUser())
    }
  }, [dispatch])

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/profile" element={<Profile />} />

          {/* default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>

      {/* fallback route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App