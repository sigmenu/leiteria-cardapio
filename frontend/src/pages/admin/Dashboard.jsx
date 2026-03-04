import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import AdminLayout from '../../components/AdminLayout'
import api from '../../services/api'
import { FaPlus, FaList, FaExternalLinkAlt } from 'react-icons/fa'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    categories: 0,
    subcategories: 0,
    items: 0
  })
  
  useEffect(() => {
    loadStats()
  }, [])
  
  async function loadStats() {
    try {
      const response = await api.get('/admin/categories')
      setStats(prev => ({ ...prev, categories: response.data.length }))
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }
  
  return (
    <AdminLayout>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Categorias</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.categories}</p>
              </div>
              <FaList className="w-8 h-8 text-primary opacity-50" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Subcategorias</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.subcategories}</p>
              </div>
              <FaList className="w-8 h-8 text-primary opacity-50" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Itens</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.items}</p>
              </div>
              <FaList className="w-8 h-8 text-primary opacity-50" />
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/admin/categories"
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FaList className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium text-gray-900">Gerenciar Categorias</p>
                <p className="text-sm text-gray-600">Adicione e organize suas categorias</p>
              </div>
            </Link>
            
            <Link
              to="/admin/settings"
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FaPlus className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium text-gray-900">Configurações</p>
                <p className="text-sm text-gray-600">Personalize seu restaurante</p>
              </div>
            </Link>
            
            <a
              href={`/menu/${user?.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FaExternalLinkAlt className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium text-gray-900">Ver Cardápio Público</p>
                <p className="text-sm text-gray-600">Visualize como seus clientes veem</p>
              </div>
            </a>
            
            <div className="p-4 border rounded-lg bg-gray-50">
              <p className="text-sm text-gray-600 mb-1">Link do seu cardápio:</p>
              <p className="font-mono text-sm text-primary break-all">
                {window.location.origin}/menu/{user?.slug}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}