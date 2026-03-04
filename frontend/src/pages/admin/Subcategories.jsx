import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { FaPlus, FaEdit, FaTrash, FaArrowLeft, FaList } from 'react-icons/fa'

export default function Subcategories() {
  const { categoryId } = useParams()
  const [category, setCategory] = useState(null)
  const [subcategories, setSubcategories] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingSubcategory, setEditingSubcategory] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true
  })
  
  useEffect(() => {
    loadData()
  }, [categoryId])
  
  async function loadData() {
    try {
      const [catResponse, subResponse] = await Promise.all([
        api.get('/admin/categories'),
        api.get(`/admin/categories/${categoryId}/subcategories`)
      ])
      
      const cat = catResponse.data.find(c => c.id === parseInt(categoryId))
      setCategory(cat)
      setSubcategories(subResponse.data)
    } catch (error) {
      toast.error('Erro ao carregar dados')
    }
  }
  
  function openModal(subcategory = null) {
    if (subcategory) {
      setEditingSubcategory(subcategory)
      setFormData({
        name: subcategory.name,
        description: subcategory.description || '',
        is_active: subcategory.is_active !== false
      })
    } else {
      setEditingSubcategory(null)
      setFormData({
        name: '',
        description: '',
        is_active: true
      })
    }
    setShowModal(true)
  }
  
  async function handleSubmit(e) {
    e.preventDefault()
    
    try {
      if (editingSubcategory) {
        await api.put(`/admin/subcategories/${editingSubcategory.id}`, formData)
        toast.success('Subcategoria atualizada com sucesso!')
      } else {
        await api.post(`/admin/categories/${categoryId}/subcategories`, formData)
        toast.success('Subcategoria criada com sucesso!')
      }
      
      setShowModal(false)
      loadData()
    } catch (error) {
      toast.error('Erro ao salvar subcategoria')
    }
  }
  
  async function deleteSubcategory(id) {
    if (confirm('Tem certeza que deseja excluir esta subcategoria? Todos os itens também serão excluídos.')) {
      try {
        await api.delete(`/admin/subcategories/${id}`)
        toast.success('Subcategoria excluída com sucesso!')
        loadData()
      } catch (error) {
        toast.error('Erro ao excluir subcategoria')
      }
    }
  }
  
  return (
    <AdminLayout>
      <div>
        <div className="flex items-center gap-4 mb-6">
          <Link
            to="/admin/categories"
            className="p-2 hover:bg-gray-100 rounded"
          >
            <FaArrowLeft />
          </Link>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">
              Subcategorias de {category?.name}
            </h2>
          </div>
          <button
            onClick={() => openModal()}
            className="admin-button flex items-center gap-2"
          >
            <FaPlus /> Nova Subcategoria
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow">
          {subcategories.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Nenhuma subcategoria cadastrada
            </div>
          ) : (
            <div className="divide-y">
              {subcategories.map(subcategory => (
                <div 
                  key={subcategory.id} 
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => openModal(subcategory)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{subcategory.name}</h3>
                      {subcategory.description && (
                        <p className="text-sm text-gray-600 line-clamp-1">{subcategory.description}</p>
                      )}
                      {!subcategory.is_active && (
                        <span className="text-xs text-red-600">Inativa</span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <Link
                        to={`/admin/subcategories/${subcategory.id}/items`}
                        className="p-2 text-gray-600 hover:text-primary"
                        title="Gerenciar itens"
                      >
                        <FaList />
                      </Link>
                      <button
                        onClick={() => openModal(subcategory)}
                        className="p-2 text-gray-600 hover:text-primary"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => deleteSubcategory(subcategory.id)}
                        className="p-2 text-gray-600 hover:text-red-600"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-lg">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {editingSubcategory ? 'Editar Subcategoria' : 'Nova Subcategoria'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome *
                  </label>
                  <input
                    type="text"
                    required
                    className="admin-input"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    className="admin-input"
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    />
                    <span className="text-sm">Subcategoria ativa</span>
                  </label>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <button type="submit" className="admin-button flex-1">
                    {editingSubcategory ? 'Salvar' : 'Criar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="admin-button-secondary flex-1"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}