import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { FaPlus, FaEdit, FaTrash, FaGripVertical, FaFolder } from 'react-icons/fa'
import { CategoryIcon } from '../../components/Icons'

const DAYS = [
  { dow: 1, label: 'Segunda-feira' },
  { dow: 2, label: 'Terça-feira'   },
  { dow: 3, label: 'Quarta-feira'  },
  { dow: 4, label: 'Quinta-feira'  },
  { dow: 5, label: 'Sexta-feira'   },
  { dow: 6, label: 'Sábado'        },
  { dow: 0, label: 'Domingo'       },
]

function buildDefaultDayHours() {
  return DAYS.map(d => ({ day_of_week: d.dow, open_time: '', close_time: '', is_closed: false }))
}

function DayScheduleEditor({ value, onChange }) {
  function getDay(dow) {
    return value.find(d => d.day_of_week === dow) || { day_of_week: dow, open_time: '', close_time: '', is_closed: false }
  }

  function updateDay(dow, updates) {
    const next = value.map(d => d.day_of_week === dow ? { ...d, ...updates } : d)
    onChange(next)
  }

  function copyDown(fromDow) {
    const source = getDay(fromDow)
    const next = value.map(d => d.day_of_week === fromDow ? d : { ...d, open_time: source.open_time, close_time: source.close_time, is_closed: source.is_closed })
    onChange(next)
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Horários por Dia</label>
      <div className="border rounded-lg divide-y text-sm">
        {DAYS.map(({ dow, label }, idx) => {
          const day = getDay(dow)
          return (
            <div key={dow} className="px-3 py-2.5 flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="w-32 font-medium text-gray-700 shrink-0">{label}</span>

              <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                <div
                  onClick={() => updateDay(dow, { is_closed: !day.is_closed })}
                  className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${day.is_closed ? 'bg-red-400' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${day.is_closed ? 'translate-x-4' : ''}`} />
                </div>
                <span className={`text-xs ${day.is_closed ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                  {day.is_closed ? 'Fechado' : 'Aberto'}
                </span>
              </label>

              {!day.is_closed && (
                <>
                  <input
                    type="time"
                    value={day.open_time || ''}
                    onChange={e => updateDay(dow, { open_time: e.target.value })}
                    className="admin-input py-1 w-28 shrink-0"
                  />
                  <span className="text-gray-400 shrink-0">até</span>
                  <input
                    type="time"
                    value={day.close_time || ''}
                    onChange={e => updateDay(dow, { close_time: e.target.value })}
                    className="admin-input py-1 w-28 shrink-0"
                  />
                </>
              )}

              {idx < DAYS.length - 1 && !day.is_closed && (
                <button
                  type="button"
                  onClick={() => copyDown(dow)}
                  className="text-xs text-blue-500 hover:underline shrink-0"
                >
                  Aplicar aos demais
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [showMaint, setShowMaint] = useState(false)
  const [maintPassword, setMaintPassword] = useState('')
  const [maintResult, setMaintResult] = useState(null)
  const [maintLoading, setMaintLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'utensils',
    exclude_holidays: false,
    is_active: true,
  })
  const [dayHours, setDayHours] = useState(buildDefaultDayHours)

  useEffect(() => { loadCategories() }, [])

  async function loadCategories() {
    try {
      const response = await api.get('/admin/categories')
      setCategories(response.data)
    } catch {
      toast.error('Erro ao carregar categorias')
    }
  }

  async function openModal(category = null) {
    if (category) {
      setEditingCategory(category)
      setFormData({
        name: category.name,
        description: category.description || '',
        icon: category.icon || 'utensils',
        exclude_holidays: category.exclude_holidays || false,
        is_active: category.is_active !== false,
      })
      try {
        const res = await api.get(`/admin/categories/${category.id}/hours`)
        if (res.data.length > 0) {
          const loaded = buildDefaultDayHours().map(d => {
            const found = res.data.find(h => h.day_of_week === d.day_of_week)
            if (!found) return d
            return {
              day_of_week: d.day_of_week,
              open_time: found.open_time ? found.open_time.slice(0, 5) : '',
              close_time: found.close_time ? found.close_time.slice(0, 5) : '',
              is_closed: !!found.is_closed,
            }
          })
          setDayHours(loaded)
        } else {
          setDayHours(buildDefaultDayHours())
        }
      } catch {
        setDayHours(buildDefaultDayHours())
      }
    } else {
      setEditingCategory(null)
      setFormData({ name: '', description: '', icon: 'utensils', exclude_holidays: false, is_active: true })
      setDayHours(buildDefaultDayHours())
    }
    setShowModal(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      let categoryId
      if (editingCategory) {
        await api.put(`/admin/categories/${editingCategory.id}`, formData)
        categoryId = editingCategory.id
      } else {
        const res = await api.post('/admin/categories', formData)
        categoryId = res.data.id
      }
      await api.put(`/admin/categories/${categoryId}/hours`, { hours: dayHours })
      toast.success(editingCategory ? 'Categoria atualizada!' : 'Categoria criada!')
      setShowModal(false)
      loadCategories()
    } catch {
      toast.error('Erro ao salvar categoria')
    }
  }

  async function runMigration() {
    setMaintLoading(true)
    setMaintResult(null)
    try {
      const res = await api.post('/admin/migrate-uploads', { password: maintPassword })
      setMaintResult({ ok: true, data: res.data })
    } catch (err) {
      setMaintResult({ ok: false, msg: err.response?.data?.error || 'Erro' })
    } finally {
      setMaintLoading(false)
      setMaintPassword('')
    }
  }

  async function deleteCategory(id) {
    if (confirm('Tem certeza que deseja excluir esta categoria? Todas as subcategorias e itens também serão excluídos.')) {
      try {
        await api.delete(`/admin/categories/${id}`)
        toast.success('Categoria excluída com sucesso!')
        loadCategories()
      } catch {
        toast.error('Erro ao excluir categoria')
      }
    }
  }

  function summarizeDayHours(category) {
    const dh = category.day_hours
    if (dh && dh.length > 0) {
      const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
      const open = dh.filter(d => !d.is_closed && d.open_time)
      const closed = dh.filter(d => d.is_closed)
      if (open.length === 0 && closed.length > 0) return 'Todos os dias: Fechado'
      if (open.length === 0) return null
      // Get unique time slots
      const slots = [...new Set(open.map(d => `${d.open_time.slice(0,5)}–${d.close_time.slice(0,5)}`))]
      const dayList = open.map(d => DAY_NAMES[d.day_of_week]).join(', ')
      return slots.length === 1 ? `${dayList}: ${slots[0]}` : `${open.length} dias configurados`
    }
    // Legacy fallback — só mostra se tiver hora real (não 00:00)
    if (category.opening_time && category.opening_time !== '00:00:00') {
      return `${category.opening_time.slice(0, 5)} – ${category.closing_time?.slice(0, 5)}`
    }
    return null
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
          <button onClick={() => openModal()} className="admin-button flex items-center gap-2">
            <FaPlus /> Nova Categoria
          </button>
        </div>

        <div className="bg-white rounded-lg shadow relative">
          {categories.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Nenhuma categoria cadastrada</div>
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
                        {summarizeDayHours(category) && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {summarizeDayHours(category)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <Link to={`/admin/categories/${category.id}/subcategories`} className="p-2 text-gray-600 hover:text-primary" title="Gerenciar subcategorias">
                        <FaFolder />
                      </Link>
                      <button onClick={() => openModal(category)} className="p-2 text-gray-600 hover:text-primary">
                        <FaEdit />
                      </button>
                      <button onClick={() => deleteCategory(category.id)} className="p-2 text-gray-600 hover:text-red-600">
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Botão de manutenção oculto — canto inferior direito */}
          <span
            onClick={() => { setShowMaint(true); setMaintResult(null); setMaintPassword('') }}
            className="absolute bottom-1 right-2 text-gray-200 hover:text-gray-300 cursor-default select-none text-xs"
            title=""
          >·</span>
        </div>
      </div>

      {/* Modal de manutenção */}
      {showMaint && (
        <div className="modal-overlay" onClick={() => setShowMaint(false)}>
          <div className="modal-content max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="p-6 space-y-4">
              <h3 className="font-semibold text-gray-800">Manutenção</h3>

              {!maintResult ? (
                <>
                  <p className="text-sm text-gray-600">
                    Move arquivos de <code className="bg-gray-100 px-1 rounded">uploads/</code> para{' '}
                    <code className="bg-gray-100 px-1 rounded">backend/uploads/</code>.
                  </p>
                  <input
                    type="password"
                    placeholder="Senha"
                    autoFocus
                    className="admin-input"
                    value={maintPassword}
                    onChange={e => setMaintPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && runMigration()}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={runMigration}
                      disabled={maintLoading || !maintPassword}
                      className="admin-button flex-1"
                    >
                      {maintLoading ? 'Executando...' : 'Executar'}
                    </button>
                    <button onClick={() => setShowMaint(false)} className="admin-button-secondary flex-1">
                      Cancelar
                    </button>
                  </div>
                </>
              ) : maintResult.ok ? (
                <>
                  <p className="text-sm text-green-700 font-medium">
                    ✓ {maintResult.data.total} arquivo(s) movido(s)
                  </p>
                  {maintResult.data.moved.length > 0 && (
                    <ul className="text-xs text-gray-500 max-h-40 overflow-y-auto space-y-0.5">
                      {maintResult.data.moved.map(f => <li key={f}>{f}</li>)}
                    </ul>
                  )}
                  {maintResult.data.skipped.length > 0 && (
                    <p className="text-xs text-orange-500">{maintResult.data.skipped.length} não movido(s)</p>
                  )}
                  <button onClick={() => setShowMaint(false)} className="admin-button w-full">Fechar</button>
                </>
              ) : (
                <>
                  <p className="text-sm text-red-600">{maintResult.msg}</p>
                  <button onClick={() => setMaintResult(null)} className="admin-button-secondary w-full">Tentar novamente</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '640px' }}>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                  <input
                    type="text"
                    required
                    className="admin-input"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    className="admin-input"
                    rows="2"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ícone</label>
                  <div className="grid grid-cols-6 gap-2">
                    {iconOptions.map(icon => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon })}
                        className={`p-3 rounded border ${formData.icon === icon ? 'border-primary bg-primary bg-opacity-10' : 'border-gray-300 hover:border-gray-400'}`}
                      >
                        <CategoryIcon icon={icon} className="w-6 h-6 mx-auto" />
                      </button>
                    ))}
                  </div>
                </div>

                <DayScheduleEditor value={dayHours} onChange={setDayHours} />

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.exclude_holidays}
                      onChange={e => setFormData({ ...formData, exclude_holidays: e.target.checked })}
                    />
                    <span className="text-sm">Exceto feriados</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                    />
                    <span className="text-sm">Categoria ativa</span>
                  </label>
                </div>

                <div className="flex gap-2 pt-4">
                  <button type="submit" className="admin-button flex-1">
                    {editingCategory ? 'Salvar' : 'Criar'}
                  </button>
                  <button type="button" onClick={() => setShowModal(false)} className="admin-button-secondary flex-1">
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
