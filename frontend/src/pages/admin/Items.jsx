import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { FaPlus, FaEdit, FaTrash, FaArrowLeft, FaImage, FaTimes } from 'react-icons/fa'

export default function Items() {
  const { subcategoryId } = useParams()
  const navigate = useNavigate()
  const [subcategory, setSubcategory] = useState(null)
  const [items, setItems] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true,
    has_options: false,
    prices: [{ label: '', original_price: '', price: '', sort_order: 0 }]
  })
  
  useEffect(() => {
    loadData()
  }, [subcategoryId])
  
  async function loadData() {
    try {
      const response = await api.get(`/admin/subcategories/${subcategoryId}/items`)
      setItems(response.data)
      
      // Get subcategory info from first item or make separate request
      if (response.data.length > 0) {
        setSubcategory({ id: subcategoryId })
      }
    } catch (error) {
      toast.error('Erro ao carregar itens')
    }
  }
  
  function openModal(item = null) {
    if (item) {
      setEditingItem(item)
      setFormData({
        name: item.name,
        description: item.description || '',
        is_active: item.is_active !== false,
        has_options: item.has_options === 1 || item.has_options === true,
        prices: item.prices.length > 0 ? item.prices : [{ label: '', original_price: '', price: '', sort_order: 0 }]
      })
      setImagePreview(item.image_url)
    } else {
      setEditingItem(null)
      setFormData({
        name: '',
        description: '',
        is_active: true,
        has_options: false,
        prices: [{ label: '', original_price: '', price: '', sort_order: 0 }]
      })
      setImagePreview(null)
    }
    setImageFile(null)
    setShowModal(true)
  }
  
  function handleImageChange(e) {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }
  
  function addPrice() {
    setFormData({
      ...formData,
      prices: [...formData.prices, { label: '', original_price: '', price: '', sort_order: formData.prices.length }]
    })
  }
  
  function removePrice(index) {
    setFormData({
      ...formData,
      prices: formData.prices.filter((_, i) => i !== index)
    })
  }
  
  function updatePrice(index, field, value) {
    const newPrices = [...formData.prices]
    newPrices[index][field] = value
    setFormData({ ...formData, prices: newPrices })
  }
  
  async function handleSubmit(e) {
    e.preventDefault()
    
    const submitData = new FormData()
    submitData.append('name', formData.name)
    submitData.append('description', formData.description)
    submitData.append('is_active', formData.is_active)
    submitData.append('has_options', formData.has_options)
    submitData.append('prices', JSON.stringify(formData.prices.filter(p => p.price)))
    
    if (imageFile) {
      submitData.append('image', imageFile)
    }
    
    try {
      if (editingItem) {
        await api.put(`/admin/items/${editingItem.id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast.success('Item atualizado com sucesso!')
      } else {
        await api.post(`/admin/subcategories/${subcategoryId}/items`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast.success('Item criado com sucesso!')
      }
      
      setShowModal(false)
      loadData()
    } catch (error) {
      toast.error('Erro ao salvar item')
    }
  }
  
  async function deleteItem(id) {
    if (confirm('Tem certeza que deseja excluir este item?')) {
      try {
        await api.delete(`/admin/items/${id}`)
        toast.success('Item excluído com sucesso!')
        loadData()
      } catch (error) {
        toast.error('Erro ao excluir item')
      }
    }
  }
  
  function formatPrice(price) {
    return `R$ ${parseFloat(price || 0).toFixed(2).replace('.', ',')}`
  }
  
  return (
    <AdminLayout>
      <div>
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <FaArrowLeft />
          </button>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">Itens</h2>
          </div>
          <button
            onClick={() => openModal()}
            className="admin-button flex items-center gap-2"
          >
            <FaPlus /> Novo Item
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow">
          {items.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Nenhum item cadastrado
            </div>
          ) : (
            <div className="divide-y">
              {items.map(item => (
                <div 
                  key={item.id} 
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => openModal(item)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        {item.description && (
                          <p className="text-sm text-gray-600 line-clamp-1">{item.description}</p>
                        )}
                        <div className="text-sm text-gray-500 mt-1">
                          {item.prices.map((price, idx) => (
                            <span key={idx}>
                              {price.label && `${price.label}: `}
                              {formatPrice(price.price)}
                              {idx < item.prices.length - 1 && ' | '}
                            </span>
                          ))}
                        </div>
                        {!item.is_active && (
                          <span className="text-xs text-red-600">Inativo</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openModal(item)}
                        className="p-2 text-gray-600 hover:text-primary"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => deleteItem(item.id)}
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
          <div className="modal-content max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {editingItem ? 'Editar Item' : 'Novo Item'}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Imagem
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="admin-input"
                  />
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="mt-2 w-32 h-32 object-cover rounded"
                    />
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preços
                  </label>
                  {formData.prices.map((price, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Variação (opcional)"
                        className="admin-input flex-1"
                        value={price.label}
                        onChange={(e) => updatePrice(index, 'label', e.target.value)}
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Preço original"
                        className="admin-input w-32"
                        value={price.original_price}
                        onChange={(e) => updatePrice(index, 'original_price', e.target.value)}
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Preço *"
                        required
                        className="admin-input w-32"
                        value={price.price}
                        onChange={(e) => updatePrice(index, 'price', e.target.value)}
                      />
                      {formData.prices.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePrice(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <FaTimes />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addPrice}
                    className="text-sm text-primary hover:text-primary-dark"
                  >
                    + Adicionar variação de preço
                  </button>
                </div>
                
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={formData.has_options}
                      onChange={(e) => setFormData({...formData, has_options: e.target.checked})}
                    />
                    <span className="text-sm">Item com opcionais (mostra "Escolha uma Opção" no cardápio ao invés dos preços)</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    />
                    <span className="text-sm">Item ativo</span>
                  </label>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <button type="submit" className="admin-button flex-1">
                    {editingItem ? 'Salvar' : 'Criar'}
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