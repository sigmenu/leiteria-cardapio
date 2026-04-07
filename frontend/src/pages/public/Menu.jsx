import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CategoryIcon } from '../../components/Icons'
import LanguageSelector from '../../components/LanguageSelector'
import { useLanguage } from '../../i18n'
import api from '../../services/api'
import { FaTimes } from 'react-icons/fa'

export default function PublicMenu() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { t, tField } = useLanguage()
  const [restaurant, setRestaurant] = useState(null)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    loadMenu()
  }, [slug])
  
  async function loadMenu() {
    try {
      const response = await api.get(`/menu/${slug}`)
      setRestaurant(response.data.restaurant)
      setCategories(response.data.categories)
      document.title = response.data.restaurant.name
    } catch (error) {
      console.error('Error loading menu:', error)
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="ml-4 text-gray-600">{t('loading')}</p>
      </div>
    )
  }
  
  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">{t('restaurant_not_found')}</h1>
          <p className="mt-2 text-gray-600">{t('check_link')}</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-black">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {restaurant.logo_url ? (
              <img 
                src={restaurant.logo_url} 
                alt={restaurant.name}
                className="h-16 w-16 rounded-full bg-white object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center">
                <span className="text-black font-bold text-xl">{restaurant.name[0]}</span>
              </div>
            )}
            <span className="text-white font-serif font-bold text-lg md:text-xl tracking-wide">
              {restaurant.name}
            </span>
          </div>
          
          <LanguageSelector />
        </div>
        
        {/* Banner */}
        {restaurant.banner_mode === 'full' && restaurant.banner_url ? (
          // Modo 1: Banner Inteiriço (imagem única)
          <div className="w-full h-[140px] md:h-[180px] overflow-hidden">
            <img 
              src={restaurant.banner_url} 
              alt="Banner" 
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          // Modo 2: Banner Dividido (texto + arte) — padrão
          <div className="bg-black h-[120px] md:h-[180px] flex items-center overflow-hidden relative">
            <div className="w-1/2 flex items-center justify-center px-8">
              <h1 className="text-white font-cursive text-[1.6rem] md:text-[2.5rem] text-center md:whitespace-nowrap">
                {tField(restaurant, 'welcome_message')}
              </h1>
            </div>
            
            {/* Decorative pattern */}
            <div className="w-1/2 relative overflow-hidden">
              <div className="absolute inset-0 grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-4 p-4 md:p-6 opacity-30">
                {[...Array(12)].map((_, i) => (
                  <div 
                    key={i}
                    className="w-6 h-6 md:w-8 md:h-8 rounded-full border-2"
                    style={{ borderColor: restaurant.primary_color || '#8B6914' }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </header>
      
      {/* Categories Grid */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {categories.map(category => (
            <div
              key={category.id}
              onClick={() => navigate(`/menu/${slug}/category/${category.id}`)}
              className={`p-4 md:p-6 cursor-pointer transition-all hover:bg-gray-50 rounded-lg border-b border-gray-100 md:border-b-0 ${
                !category.isOpen ? 'opacity-75' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <CategoryIcon 
                  icon={category.icon} 
                  className="w-12 h-12 flex-shrink-0 text-black"
                />
                
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-serif font-bold text-xl text-black">
                        {tField(category, 'name')}
                      </h3>
                      {tField(category, 'description') && (
                        <p className="mt-1 text-gray-600 text-sm whitespace-pre-line">
                          {tField(category, 'description')}
                        </p>
                      )}
                    </div>
                    
                    {!category.isOpen && (
                      <span className="closed-badge ml-4">
                        <FaTimes className="w-3 h-3" />
                        {t('closed')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Footer */}
        {tField(restaurant, 'service_fee_text') && (
          <footer className="mt-16 text-center text-gray-600 text-sm">
            <p>{tField(restaurant, 'service_fee_text')}</p>
          </footer>
        )}
      </main>
    </div>
  )
}