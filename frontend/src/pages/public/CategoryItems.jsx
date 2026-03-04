import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLanguage } from '../../i18n'
import api from '../../services/api'
import { FaArrowLeft, FaTimes } from 'react-icons/fa'

export default function CategoryItems() {
  const { slug, categoryId } = useParams()
  const navigate = useNavigate()
  const { t, tField } = useLanguage()
  const [category, setCategory] = useState(null)
  const [subcategories, setSubcategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState(null)
  const [lightboxImage, setLightboxImage] = useState(null)
  
  useEffect(() => {
    loadCategoryItems()
  }, [slug, categoryId])
  
  async function loadCategoryItems() {
    try {
      const response = await api.get(`/menu/${slug}/category/${categoryId}`)
      setCategory(response.data.category)
      setSubcategories(response.data.subcategories)
      
      // Debug: verificar se as imagens estão vindo da API
      console.log('Dados recebidos da API:', response.data.subcategories);
      response.data.subcategories.forEach(sub => {
        sub.items.forEach(item => {
          if (item.image_url) {
            console.log(`Item ${item.name} tem imagem: ${item.image_url}`);
          }
        });
      });
    } catch (error) {
      console.error('Error loading category items:', error)
    } finally {
      setLoading(false)
    }
  }
  
  async function loadItemDetails(itemId) {
    try {
      const response = await api.get(`/menu/${slug}/item/${itemId}`)
      setSelectedItem(response.data)
    } catch (error) {
      console.error('Error loading item details:', error)
    }
  }
  
  function formatPrice(price) {
    return `R$ ${parseFloat(price).toFixed(2).replace('.', ',')}`
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/menu/${slug}`)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FaArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-serif font-bold text-2xl">{tField(category, 'name')}</h1>
          </div>
        </div>
      </header>
      
      {/* Subcategories and Items */}
      <main className="container mx-auto px-4 py-8">
        {subcategories.map(subcategory => (
          <div key={subcategory.id} className="mb-12">
            <div className="mb-6">
              <h2 className="font-serif font-bold text-xl">{tField(subcategory, 'name')}</h2>
              {tField(subcategory, 'description') && (
                <p className="text-gray-600 mt-1 whitespace-pre-line">{tField(subcategory, 'description')}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {subcategory.items.map(item => (
                <div
                  key={item.id}
                  onClick={() => loadItemDetails(item.id)}
                  className="bg-white border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <h3 className="font-serif font-semibold text-primary text-lg">
                        {tField(item, 'name')}
                      </h3>
                      {tField(item, 'description') && (
                        <p className="text-gray-600 text-sm mt-1 line-clamp-2">{tField(item, 'description')}</p>
                      )}
                      
                      {item.has_options ? (
                        <button className="mt-3 bg-black text-white text-sm px-4 py-1.5 rounded-full">
                          {t('choose_option')}
                        </button>
                      ) : (
                        <div className="mt-3 space-y-1">
                          {item.prices.map((price, idx) => (
                            <div key={idx} className="flex items-baseline justify-between">
                              <span className="text-sm text-gray-700">
                                {tField(price, 'label') && <span>{tField(price, 'label')}, </span>}
                                {price.original_price && (
                                  <span className="line-through text-gray-400">
                                    {formatPrice(price.original_price)}
                                  </span>
                                )}
                                {price.original_price && ` ${t('for')}`}
                              </span>
                              <span className="font-bold text-primary ml-2">
                                {formatPrice(price.price)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={tField(item, 'name')}
                        className="w-24 h-24 object-cover rounded-lg"
                        onError={(e) => {
                          console.error('Erro ao carregar imagem:', item.image_url);
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>
      
      {/* Item Modal */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            {/* Close button */}
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 left-4 z-10 bg-white rounded-full p-2 shadow-lg"
            >
              <FaTimes className="w-4 h-4" />
            </button>
            
            {/* Item image */}
            {selectedItem.image_url && (
              <img
                src={selectedItem.image_url}
                alt={tField(selectedItem, 'name')}
                onClick={() => setLightboxImage(selectedItem.image_url)}
                className="w-full h-64 object-cover cursor-pointer"
                onError={(e) => {
                  console.error('Erro ao carregar imagem no modal:', selectedItem.image_url);
                  e.target.style.display = 'none';
                }}
              />
            )}
            
            {/* Item details */}
            <div className="p-6">
              <h2 className="font-serif font-bold text-2xl">{tField(selectedItem, 'name')}</h2>
              {tField(selectedItem, 'description') && (
                <p className="text-gray-600 mt-2 whitespace-pre-line">{tField(selectedItem, 'description')}</p>
              )}
              
              <div className="mt-6 space-y-2">
                {selectedItem.prices.map((price, idx) => (
                  <div key={idx} className="flex items-baseline justify-between py-2 border-b">
                    <span className="text-gray-700">
                      {tField(price, 'label') && <span className="font-medium">{tField(price, 'label')}</span>}
                      {price.original_price && (
                        <>
                          {tField(price, 'label') && ', '}
                          <span className="line-through text-gray-400">
                            {formatPrice(price.original_price)}
                          </span>
                          {` ${t('for')}`}
                        </>
                      )}
                    </span>
                    <span className="font-bold text-primary text-xl">
                      {formatPrice(price.price)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Lightbox */}
      {lightboxImage && (
        <div className="lightbox-overlay" onClick={() => setLightboxImage(null)}>
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-3"
          >
            <FaTimes className="w-6 h-6" />
          </button>
          <img
            src={lightboxImage}
            alt={t('enlarged_image')}
            className="max-w-full max-h-full object-contain"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}