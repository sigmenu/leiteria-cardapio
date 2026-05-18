import { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { FaPlus, FaTrash, FaSave } from 'react-icons/fa'

const DAYS = [
  { dow: 1, label: 'Segunda-feira', short: 'Seg' },
  { dow: 2, label: 'Terça-feira',   short: 'Ter' },
  { dow: 3, label: 'Quarta-feira',  short: 'Qua' },
  { dow: 4, label: 'Quinta-feira',  short: 'Qui' },
  { dow: 5, label: 'Sexta-feira',   short: 'Sex' },
  { dow: 6, label: 'Sábado',        short: 'Sáb' },
  { dow: 0, label: 'Domingo',       short: 'Dom' },
]

function buildInitialState() {
  const state = {}
  for (const d of DAYS) {
    state[d.dow] = { is_closed: false, slots: [{ open_time: '', close_time: '' }] }
  }
  return state
}

function hoursFromRows(rows) {
  const state = buildInitialState()
  for (const d of DAYS) {
    const dayRows = rows.filter(r => r.day_of_week === d.dow)
    if (dayRows.length === 0) continue
    const closedRow = dayRows.find(r => r.is_closed)
    if (closedRow) {
      state[d.dow] = { is_closed: true, slots: [] }
    } else {
      state[d.dow] = {
        is_closed: false,
        slots: dayRows.map(r => ({
          open_time: r.open_time ? r.open_time.slice(0, 5) : '',
          close_time: r.close_time ? r.close_time.slice(0, 5) : '',
        })),
      }
    }
  }
  return state
}

function hoursToRows(state) {
  const rows = []
  for (const d of DAYS) {
    const day = state[d.dow]
    if (day.is_closed) {
      rows.push({ day_of_week: d.dow, open_time: null, close_time: null, is_closed: true, sort_order: 0 })
    } else {
      day.slots.forEach((slot, i) => {
        rows.push({
          day_of_week: d.dow,
          open_time: slot.open_time || null,
          close_time: slot.close_time || null,
          is_closed: false,
          sort_order: i,
        })
      })
    }
  }
  return rows
}

export default function Hours() {
  const [hours, setHours] = useState(buildInitialState)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/admin/hours')
      .then(res => {
        if (res.data.length > 0) setHours(hoursFromRows(res.data))
      })
      .catch(() => toast.error('Erro ao carregar horários'))
  }, [])

  function setDay(dow, updates) {
    setHours(prev => ({ ...prev, [dow]: { ...prev[dow], ...updates } }))
  }

  function updateSlot(dow, idx, field, value) {
    setHours(prev => {
      const slots = prev[dow].slots.map((s, i) => i === idx ? { ...s, [field]: value } : s)
      return { ...prev, [dow]: { ...prev[dow], slots } }
    })
  }

  function addSlot(dow) {
    setHours(prev => {
      const slots = [...prev[dow].slots, { open_time: '', close_time: '' }]
      return { ...prev, [dow]: { ...prev[dow], slots } }
    })
  }

  function removeSlot(dow, idx) {
    setHours(prev => {
      const slots = prev[dow].slots.filter((_, i) => i !== idx)
      return { ...prev, [dow]: { ...prev[dow], slots: slots.length ? slots : [{ open_time: '', close_time: '' }] } }
    })
  }

  async function handleSave() {
    setSaving(true)
    try {
      await api.put('/admin/hours', { hours: hoursToRows(hours) })
      toast.success('Horários salvos com sucesso!')
    } catch {
      toast.error('Erro ao salvar horários')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Horários de Funcionamento</h2>
            <p className="text-sm text-gray-500 mt-1">Esses horários aparecem no rodapé do cardápio público.</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="admin-button flex items-center gap-2"
          >
            <FaSave />
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow divide-y">
          {DAYS.map(({ dow, label }) => {
            const day = hours[dow]
            return (
              <div key={dow} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-800 w-36">{label}</span>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <div
                      onClick={() => setDay(dow, { is_closed: !day.is_closed })}
                      className={`relative w-10 h-5 rounded-full transition-colors ${day.is_closed ? 'bg-red-400' : 'bg-gray-300'}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${day.is_closed ? 'translate-x-5' : ''}`} />
                    </div>
                    <span className={`text-sm font-medium ${day.is_closed ? 'text-red-500' : 'text-gray-400'}`}>
                      {day.is_closed ? 'Fechado' : 'Aberto'}
                    </span>
                  </label>
                </div>

                {!day.is_closed && (
                  <div className="ml-36 space-y-2">
                    {day.slots.map((slot, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="time"
                          value={slot.open_time}
                          onChange={e => updateSlot(dow, idx, 'open_time', e.target.value)}
                          className="admin-input py-1 text-sm w-28"
                        />
                        <span className="text-gray-400 text-sm">até</span>
                        <input
                          type="time"
                          value={slot.close_time}
                          onChange={e => updateSlot(dow, idx, 'close_time', e.target.value)}
                          className="admin-input py-1 text-sm w-28"
                        />
                        {day.slots.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSlot(dow, idx)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <FaTrash className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                    {day.slots.length < 3 && (
                      <button
                        type="button"
                        onClick={() => addSlot(dow)}
                        className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                      >
                        <FaPlus className="w-2.5 h-2.5" /> Adicionar faixa
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </AdminLayout>
  )
}
