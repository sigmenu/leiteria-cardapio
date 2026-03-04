import { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { FaSave, FaImage } from 'react-icons/fa'

export default function Settings() {
  const [loading, setLoading] = useState(false)
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [bannerFile, setBannerFile] = useState(null)
  const [bannerPreview, setBannerPreview] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    banner_mode: 'split',
    welcome_message: '',
    welcome_message_en: '',
    welcome_message_es: '',
    service_fee_text: '',
    service_fee_text_en: '',
    service_fee_text_es: '',
    primary_color: '#8B6914',
    secondary_color: '#000000'
  })
  
  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    try {
      console.log('🔍 Carregando configurações...')
      const response = await api.get('/admin/settings')
      const settings = response.data
      
      console.log('📦 Dados recebidos do backend:', settings)
      
      setFormData({
        name: settings.name || '',
        slug: settings.slug || '',
        banner_mode: settings.banner_mode || 'split',
        welcome_message: settings.welcome_message || 'Seja bem-vindo!',
        welcome_message_en: settings.welcome_message_en || 'Welcome!',
        welcome_message_es: settings.welcome_message_es || '¡Bienvenido!',
        service_fee_text: settings.service_fee_text || 'Taxa de serviço opcional e adicional: 10%.',
        service_fee_text_en: settings.service_fee_text_en || 'Optional service fee: 10%.',
        service_fee_text_es: settings.service_fee_text_es || 'Tasa de servicio opcional: 10%.',
        primary_color: settings.primary_color || '#8B6914',
        secondary_color: settings.secondary_color || '#000000'
      })
      setLogoPreview(settings.logo_url)
      setBannerPreview(settings.banner_url)
      console.log('✅ Estados atualizados com sucesso')
    } catch (error) {
      console.error('❌ Erro ao carregar configurações:', error)
      console.error('Response:', error.response?.data)
      console.error('Status:', error.response?.status)
    }
  }
  
  function handleLogoChange(e) {
    const file = e.target.files[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }
  
  function handleBannerChange(e) {
    const file = e.target.files[0]
    if (file) {
      setBannerFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setBannerPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }
  
  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    
    const submitData = new FormData()
    submitData.append('name', formData.name)
    submitData.append('slug', formData.slug)
    submitData.append('banner_mode', formData.banner_mode)
    submitData.append('welcome_message', formData.welcome_message)
    submitData.append('welcome_message_en', formData.welcome_message_en)
    submitData.append('welcome_message_es', formData.welcome_message_es)
    submitData.append('service_fee_text', formData.service_fee_text)
    submitData.append('service_fee_text_en', formData.service_fee_text_en)
    submitData.append('service_fee_text_es', formData.service_fee_text_es)
    submitData.append('primary_color', formData.primary_color)
    submitData.append('secondary_color', formData.secondary_color)
    
    if (logoFile) {
      submitData.append('logo', logoFile)
    }
    
    if (bannerFile) {
      submitData.append('banner', bannerFile)
    }
    
    try {
      await api.put('/admin/settings', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success('Configurações salvas com sucesso!')
      
      // Reload settings
      await loadSettings()
    } catch (error) {
      toast.error('Erro ao salvar configurações')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <AdminLayout>
      <div className="max-w-4xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Configurações do Restaurante</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Informações Básicas</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Restaurante
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
                  Slug (URL do cardápio)
                </label>
                <div className="flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    /menu/
                  </span>
                  <input
                    type="text"
                    required
                    pattern="[a-z0-9\\-]+"
                    className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Banner Mode */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Modo do Banner</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="banner_mode"
                      value="split"
                      checked={formData.banner_mode === 'split'}
                      onChange={(e) => setFormData({...formData, banner_mode: e.target.value})}
                      className="mr-2"
                    />
                    Banner dividido (frase de boas-vindas + arte decorativa)
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="banner_mode"
                      value="full"
                      checked={formData.banner_mode === 'full'}
                      onChange={(e) => setFormData({...formData, banner_mode: e.target.value})}
                      className="mr-2"
                    />
                    Banner inteiriço (imagem única de ponta a ponta)
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          {/* Images */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Imagens</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo do Restaurante
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="admin-input mb-2"
                />
                {logoPreview && (
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-32 h-32 object-cover rounded-full"
                  />
                )}
              </div>
              
              {formData.banner_mode === 'full' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Banner do Cardápio
                    <span className="text-sm text-gray-500 block">
                      Recomendado: 1400x300px, a frase de boas-vindas deve fazer parte da imagem
                    </span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerChange}
                    className="admin-input mb-2"
                  />
                  {bannerPreview && (
                    <img
                      src={bannerPreview}
                      alt="Banner preview"
                      className="w-full h-32 object-cover rounded"
                    />
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Messages */}
          {formData.banner_mode === 'split' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Mensagens de Boas-vindas</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Português
                  </label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.welcome_message}
                    onChange={(e) => setFormData({...formData, welcome_message: e.target.value})}
                    placeholder="Seja bem-vindo!"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    English
                  </label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.welcome_message_en}
                    onChange={(e) => setFormData({...formData, welcome_message_en: e.target.value})}
                    placeholder="Welcome!"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Español
                  </label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.welcome_message_es}
                    onChange={(e) => setFormData({...formData, welcome_message_es: e.target.value})}
                    placeholder="¡Bienvenido!"
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Service Fee */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Taxa de Serviço</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Português
                </label>
                <input
                  type="text"
                  className="admin-input"
                  value={formData.service_fee_text}
                  onChange={(e) => setFormData({...formData, service_fee_text: e.target.value})}
                  placeholder="Taxa de serviço opcional e adicional: 10%."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  English
                </label>
                <input
                  type="text"
                  className="admin-input"
                  value={formData.service_fee_text_en}
                  onChange={(e) => setFormData({...formData, service_fee_text_en: e.target.value})}
                  placeholder="Optional service fee: 10%."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Español
                </label>
                <input
                  type="text"
                  className="admin-input"
                  value={formData.service_fee_text_es}
                  onChange={(e) => setFormData({...formData, service_fee_text_es: e.target.value})}
                  placeholder="Tasa de servicio opcional: 10%."
                />
              </div>
            </div>
          </div>
          
          {/* Colors */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Cores do Tema</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cor Primária
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                    value={formData.primary_color}
                    onChange={(e) => setFormData({...formData, primary_color: e.target.value})}
                  />
                  <input
                    type="text"
                    className="admin-input flex-1"
                    value={formData.primary_color}
                    onChange={(e) => setFormData({...formData, primary_color: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cor Secundária
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                    value={formData.secondary_color}
                    onChange={(e) => setFormData({...formData, secondary_color: e.target.value})}
                  />
                  <input
                    type="text"
                    className="admin-input flex-1"
                    value={formData.secondary_color}
                    onChange={(e) => setFormData({...formData, secondary_color: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="admin-button flex items-center gap-2 px-6"
            >
              <FaSave />
              {loading ? 'Salvando...' : 'Salvar Configurações'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}