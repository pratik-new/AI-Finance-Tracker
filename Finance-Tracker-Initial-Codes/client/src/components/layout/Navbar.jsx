import { useSelector } from 'react-redux'

function Navbar() {
  const { user } = useSelector(state => state.auth)

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="px-6 py-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Finance Dashboard</h2>
        <div className="flex items-center gap-4">
          {user && (
            <div className="text-right">
              <p className="font-medium text-gray-800">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar