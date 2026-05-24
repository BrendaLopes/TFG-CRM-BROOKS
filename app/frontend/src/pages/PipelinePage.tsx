import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'

const ESTADOS = [
  { key: 'LEAD', label: 'Lead', color: 'bg-gray-400' },
  { key: 'CUALIFICADA', label: 'Qualificada', color: 'bg-blue-400' },
  { key: 'EN_ENTREVISTA_TECNICA', label: 'Entrevista Técnica', color: 'bg-yellow-400' },
  { key: 'PROPUESTA_EN_ELABORACION', label: 'Elaboração', color: 'bg-orange-400' },
  { key: 'PROPUESTA_ENVIADA', label: 'Prop. Enviada', color: 'bg-purple-400' },
  { key: 'EN_NEGOCIACION', label: 'Negociação', color: 'bg-pink-400' },
  { key: 'GANADA', label: 'Ganha', color: 'bg-green-500' },
  { key: 'PERDIDA', label: 'Perdida', color: 'bg-red-500' },
]

interface Oportunidad {
  id: string
  estado: string
  tipo: string
  prioridad: string
  lead: { nombreEmpresa: string; canalEntrada: string }
  cliente: { nombre: string }
  usuario: { nombre: string }
  propuestas: any[]
}

export default function PipelinePage() {
  const [oportunidades, setOportunidades] = useState<Oportunidad[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/oportunidades').then((res) => {
      setOportunidades(res.data)
      setLoading(false)
    })
  }, [])

  const porEstado = (estado: string) =>
    oportunidades.filter((o) => o.estado === estado)

  const totalActivas = oportunidades.filter(
    (o) => !['GANADA', 'PERDIDA', 'NO_VIABLE'].includes(o.estado)
  ).length

  const totalGanadas = oportunidades.filter((o) => o.estado === 'GANADA').length

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-64 text-gray-400">Carregando...</div>
    </Layout>
  )

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Pipeline comercial</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {totalActivas} ativas · {totalGanadas} ganhas
          </p>
        </div>
        <button className="bg-[#b61b24] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#9a1720] transition-colors">
          + Nova oportunidade
        </button>
      </div>

      {/* Kanban */}
      <div className="flex gap-3 overflow-x-auto pb-4">
        {ESTADOS.map((estado) => {
          const items = porEstado(estado.key)
          return (
            <div key={estado.key} className="flex-shrink-0 w-56">
              {/* Cabecera columna */}
              <div className="flex items-center gap-2 mb-2 px-1">
                <div className={`w-2 h-2 rounded-full ${estado.color}`} />
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  {estado.label}
                </span>
                <span className="ml-auto text-xs text-gray-400 bg-gray-200 rounded-full px-2 py-0.5">
                  {items.length}
                </span>
              </div>

              {/* Tarjetas */}
              <div className="space-y-2">
                {items.map((op) => (
                  <div
                    key={op.id}
                    className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-[#b61b24]/20 transition-all"
                  >
                    <p className="text-sm font-semibold text-gray-800 leading-tight">
                      {op.cliente?.nombre || op.lead?.nombreEmpresa}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{op.tipo || '—'}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-400">{op.usuario?.nombre}</span>
                      {op.prioridad === 'ALTA' && (
                        <span className="text-xs bg-red-50 text-red-600 px-1.5 py-0.5 rounded">
                          Alta
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {items.length === 0 && (
                  <div className="text-center py-6 text-xs text-gray-300 border-2 border-dashed border-gray-100 rounded-lg">
                    Sem oportunidades
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </Layout>
  )
}