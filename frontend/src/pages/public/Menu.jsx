import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CategoryIcon } from '../../components/Icons'
import LanguageSelector from '../../components/LanguageSelector'
import { useLanguage } from '../../i18n'
import api from '../../services/api'
import { FaTimes, FaClock } from 'react-icons/fa'

const DAYS_PT = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
const DAYS_ORDER = [1, 2, 3, 4, 5, 6, 0]

function RestaurantFooter({ hours, primaryColor }) {
  const now = new Date()
  const brazilOffset = -3 * 60
  const brazilNow = new Date(now.getTime() + (now.getTimezoneOffset() + brazilOffset) * 60000)
  const todayDow = brazilNow.getDay()

  const byDay = {}
  for (const h of hours) {
    if (!byDay[h.day_of_week]) byDay[h.day_of_week] = []
    byDay[h.day_of_week].push(h)
  }

  function getSlots(dow) {
    const rows = byDay[dow]
    if (!rows || rows.length === 0) return null
    if (rows.find(r => r.is_closed)) return 'closed'
    const slots = rows.filter(r => r.open_time && r.close_time)
      .map(r => `${r.open_time.slice(0, 5)} – ${r.close_time.slice(0, 5)}`)
    return slots.length ? slots : 'open'
  }

  const accent = primaryColor || '#8B6914'

  return (
    <footer style={{ backgroundColor: '#000' }}>
      <div className="container mx-auto px-6 py-10 max-w-md">

        <div className="flex items-center gap-2 mb-6">
          <FaClock style={{ color: '#aaa', fontSize: '0.85rem' }} />
          <span style={{ color: '#aaa', fontWeight: 300, letterSpacing: '0.08em', fontSize: '0.75rem', textTransform: 'uppercase' }}>
            Horário de Funcionamento
          </span>
        </div>

        <div>
          {DAYS_ORDER.map(dow => {
            const isToday = dow === todayDow
            const slots = getSlots(dow)
            const isClosed = slots === 'closed'
            const isOpenAllDay = slots === 'open'
            const slotList = Array.isArray(slots) ? slots : []

            return (
              <div
                key={dow}
                className="flex justify-between py-3"
                style={{
                  borderBottom: '1px solid #1a1a1a',
                  ...(isToday ? { borderLeft: `2px solid ${accent}`, paddingLeft: '12px', marginLeft: '-12px' } : {})
                }}
              >
                <span style={{ color: isToday ? '#fff' : '#666', fontWeight: 300, fontSize: '0.875rem' }}>
                  {isToday ? <><span style={{ color: '#fff', fontWeight: 400 }}>Hoje</span> · {DAYS_PT[dow]}</> : DAYS_PT[dow]}
                </span>

                <div className="flex flex-col items-end gap-0.5">
                  {isClosed && (
                    <span style={{ color: '#444', fontWeight: 300, fontSize: '0.875rem' }}>Fechado</span>
                  )}
                  {isOpenAllDay && (
                    <span style={{ color: isToday ? '#fff' : '#666', fontWeight: 300, fontSize: '0.875rem' }}>Aberto</span>
                  )}
                  {slotList.map((s, i) => (
                    <span key={i} style={{ color: isToday ? '#fff' : '#888', fontWeight: 300, fontSize: '0.875rem', fontVariantNumeric: 'tabular-nums' }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </footer>
  )
}

export default function PublicMenu() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { t, tField } = useLanguage()
  const [restaurant, setRestaurant] = useState(null)
  const [categories, setCategories] = useState([])
  const [restaurantHours, setRestaurantHours] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadMenu() }, [slug])

  async function loadMenu() {
    try {
      const response = await api.get(`/menu/${slug}`)
      setRestaurant(response.data.restaurant)
      setCategories(response.data.categories)
      setRestaurantHours(response.data.restaurantHours || [])
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
    <div className="min-h-screen bg-white flex flex-col">
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
          <div className="w-full">
            <img src={restaurant.banner_url} alt="Banner" className="w-full h-auto block" />
          </div>
        ) : (
          <div className="bg-black h-[120px] md:h-[180px] flex items-center overflow-hidden relative">
            <div className="w-1/2 flex items-center justify-center px-8">
              <h1 className="text-white font-cursive text-[1.6rem] md:text-[2.5rem] text-center md:whitespace-nowrap">
                {tField(restaurant, 'welcome_message')}
              </h1>
            </div>
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
      <main className="flex-1 container mx-auto px-4 py-8">
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
                <CategoryIcon icon={category.icon} className="w-12 h-12 flex-shrink-0 text-black" />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-serif font-bold text-xl text-black">
                        {tField(category, 'name')}
                      </h3>
                      {tField(category, 'description') && (
                        <p className="mt-1 text-black-600 text-sm whitespace-pre-line">
                          {tField(category, 'description')}
                        </p>
                      )}
                    </div>
                    {!category.isOpen && (
                      <span className="closed-badge ml-4">
                        {t('closed')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {tField(restaurant, 'service_fee_text') && (
          <p className="mt-12 text-center text-gray-500 text-sm">
            {tField(restaurant, 'service_fee_text')}
          </p>
        )}
      </main>

      {/* Footer: horários de funcionamento */}
      {restaurantHours.length > 0 && (
        <RestaurantFooter hours={restaurantHours} primaryColor={restaurant.primary_color} />
      )}
    </div>
  )
}
