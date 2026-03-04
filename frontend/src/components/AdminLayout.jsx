import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  FaHome, 
  FaList, 
  FaCog, 
  FaSignOutAlt,
  FaExternalLinkAlt
} from 'react-icons/fa'

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  function handleLogout() {
    logout()
    navigate('/admin/login')
  }
  
  const menuItems = [
    { path: '/admin', icon: FaHome, label: 'Dashboard' },
    { path: '/admin/categories', icon: FaList, label: 'Categorias' },
    { path: '/admin/settings', icon: FaCog, label: 'Configurações' }
  ]
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl font-semibold text-gray-900">
              {user?.name || 'Painel Administrativo'}
            </h1>
            
            <div className="flex items-center gap-4">
              <a
                href={`/menu/${user?.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:text-primary-dark flex items-center gap-1"
              >
                Ver cardápio
                <FaExternalLinkAlt className="w-3 h-3" />
              </a>
              
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2"
              >
                <FaSignOutAlt />
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white h-[calc(100vh-65px)] border-r">
          <div className="p-4">
            <ul className="space-y-2">
              {menuItems.map(item => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      location.pathname === item.path
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
        
        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}