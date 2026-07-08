import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { logout } from '../../redux/slices/authSlice'

function Sidebar() {
  const location = useLocation()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const navItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Transactions', path: '/transactions' },
    { label: 'Budget', path: '/budget' },
    { label: 'Insights', path: '/insights' },
    { label: 'Reports', path: '/reports' },
    { label: 'Profile', path: '/profile' }
  ]

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <aside className="w-64 bg-primary text-white h-screen flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold">FinTrack</h1>
        <p className="text-sm text-gray-400">AI Finance Tracker</p>
      </div>

      <nav className="flex-1 p-4">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`block px-4 py-2 rounded-lg mb-2 transition-colors${
              isActive(item.path)
                ? 'bg-secondary text-white'
                : 'hover:bg-gray-700'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>
    </aside>
  )
}

export default Sidebar