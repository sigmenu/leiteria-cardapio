import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { FaPlus, FaEdit, FaTrash, FaGripVertical, FaFolder } from 'react-icons/fa'
import { CategoryIcon } from '../../components/Icons'

function WeekdaySelector({ value, onChange }) {
  const days = [
    { key: 'seg', label: 'Segunda' },
    { key: 'ter', label: 'Terça' },
    { key: 'qua', label: 'Quarta' },
    { key: 'qui', label: 'Quinta' },
    { key: 'sex', label: 'Sexta' },
    { key: 'sab', label: 'Sábado' },
    { key: 'dom', label: 'Domingo' },
  ];

  const selected = value === 'todos' 
    ? days.map(d => d.key) 
    : (value || '').split(',').filter(Boolean);

  const toggle = (key) => {
    const newSelected = selected.includes(key)
      ? selected.filter(d => d !== key)
      : [...selected, key];
    
    if (newSelected.length === 7) {
      onChange('todos');
    } else {
      onChange(newSelected.join(','));
    }
  };

  const selectAll = () => onChange('todos');
  const clearAll = () => onChange('');

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Dias Disponíveis
      </label>
      
      <div className="flex gap-2 mb-3">
        <button 
          type="button" 
          onClick={selectAll} 
          className="text-xs text-blue-600 hover:underline"
        >
          Selecionar todos
        </button>
        <span className="text-gray-300">|</span>
        <button 
          type="button" 
          onClick={clearAll} 
          className="text-xs text-blue-600 hover:underline"
        >
          Limpar todos
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        {days.map(day => (
          <label key={day.key} className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={selected.includes(day.key)}
              onChange={() => toggle(day.key)}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm">{day.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'utensils',
    opening_time: '',
    closing_time: '',
    available_days: '',
    exclude_holidays: false,
    is_active: true
  })
  
  useEffect(() => {
    loadCategories()
  }, [])
  
  async function loadCategories() {
    try {
      const response = await api.get('/admin/categories')
      setCategories(response.data)
    } catch (error) {
      toast.error('Erro ao carregar categorias')
    }
  }
  
  function openModal(category = null) {
    if (category) {
      setEditingCategory(category)
      setFormData({
        name: category.name,
        description: category.description || '',
        icon: category.icon || 'utensils',
        opening_time: category.opening_time || '',
        closing_time: category.closing_time || '',
        available_days: category.available_days || '',
        exclude_holidays: category.exclude_holidays || false,
        is_active: category.is_active !== false
      })
    } else {
      setEditingCategory(null)
      setFormData({
        name: '',
        description: '',
        icon: 'utensils',
        opening_time: '',
        closing_time: '',
        available_days: '',
        exclude_holidays: false,
        is_active: true
      })
    }
    setShowModal(true)
  }
  
  async function handleSubmit(e) {
    e.preventDefault()
    
    try {
      if (editingCategory) {
        await api.put(`/admin/categories/${editingCategory.id}`, formData)
        toast.success('Categoria atualizada com sucesso!')
      } else {
        await api.post('/admin/categories', formData)
        toast.success('Categoria criada com sucesso!')
      }
      
      setShowModal(false)
      loadCategories()
    } catch (error) {
      toast.error('Erro ao salvar categoria')
    }
  }
  
  async function deleteCategory(id) {
    if (confirm('Tem certeza que deseja excluir esta categoria? Todas as subcategorias e itens também serão excluídos.')) {
      try {
        await api.delete(`/admin/categories/${id}`)
        toast.success('Categoria excluída com sucesso!')
        loadCategories()
      } catch (error) {
        toast.error('Erro ao excluir categoria')
      }
    }
  }
  
  const iconOptions = [
    'percent', 'utensils', 'meat', 'coffee', 'cocktail', 'wine',
    'kitchen', 'chef', 'cook', 'bar', 'restaurant', 'food', 'menu'
  ]
  
  return (
    <AdminLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Categorias</h2>
          <button
            onClick={() => openModal()}
            className="admin-button flex items-center gap-2"
          >
            <FaPlus /> Nova Categoria
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow">
          {categories.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Nenhuma categoria cadastrada
            </div>
          ) : (
            <div className="divide-y">
              {categories.map(category => (
                <div 
                  key={category.id} 
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => openModal(category)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <FaGripVertical className="text-gray-400 cursor-move" />
                      <CategoryIcon icon={category.icon} className="w-8 h-8 text-primary" />
                      <div>
                        <h3 className="font-semibold text-gray-900">{category.name}</h3>
                        {category.description && (
                          <p className="text-sm text-gray-600 line-clamp-1">{category.description}</p>
                        )}
                        {category.opening_time && (
                          <p className="text-xs text-gray-500 mt-1">
                            {category.opening_time} - {category.closing_time}
                            {category.available_days && ` (${category.available_days})`}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <Link
                        to={`/admin/categories/${category.id}/subcategories`}
                        className="p-2 text-gray-600 hover:text-primary"
                        title="Gerenciar subcategorias"
                      >
                        <FaFolder />
                      </Link>
                      <button
                        onClick={() => openModal(category)}
                        className="p-2 text-gray-600 hover:text-primary"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => deleteCategory(category.id)}
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
                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
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
                    rows="2"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ícone
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {iconOptions.map(icon => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setFormData({...formData, icon})}
                        className={`p-3 rounded border ${
                          formData.icon === icon
                            ? 'border-primary bg-primary bg-opacity-10'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <CategoryIcon icon={icon} className="w-6 h-6 mx-auto" />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Horário de Abertura
                    </label>
                    <input
                      type="time"
                      className="admin-input"
                      value={formData.opening_time}
                      onChange={(e) => setFormData({...formData, opening_time: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Horário de Fechamento
                    </label>
                    <input
                      type="time"
                      className="admin-input"
                      value={formData.closing_time}
                      onChange={(e) => setFormData({...formData, closing_time: e.target.value})}
                    />
                  </div>
                </div>
                
                <WeekdaySelector
                  value={formData.available_days}
                  onChange={(value) => setFormData({...formData, available_days: value})}
                />
                
                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={formData.exclude_holidays}
                      onChange={(e) => setFormData({...formData, exclude_holidays: e.target.checked})}
                    />
                    <span className="text-sm">Exceto feriados</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    />
                    <span className="text-sm">Categoria ativa</span>
                  </label>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <button type="submit" className="admin-button flex-1">
                    {editingCategory ? 'Salvar' : 'Criar'}
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