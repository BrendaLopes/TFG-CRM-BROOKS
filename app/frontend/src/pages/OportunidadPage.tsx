import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Modal from '../components/Modal'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const ESTADOS_LABELS: Record<string, string> = {
  LEAD: 'Lead',
  CUALIFICADA: 'Qualificada',
  EN_ENTREVISTA_TECNICA: 'Entrevista Técnica',
  PROPUESTA_EN_ELABORACION: 'Elaboração',
  PROPUESTA_ENVIADA: 'Prop. Enviada',
  EN_NEGOCIACION: 'Negociação',
  GANADA: 'Ganha',
  PERDIDA: 'Perdida',
  NO_VIABLE: 'Não Viável',
}

const ESTADOS_ORDEN = [
  'LEAD', 'CUALIFICADA', 'EN_ENTREVISTA_TECNICA',
  'PROPUESTA_EN_ELABORACION', 'PROPUESTA_ENVIADA',
  'EN_NEGOCIACION', 'GANADA'
]

export default function OportunidadPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const [oportunidad, setOportunidad] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [modalInteraccion, setModalInteraccion] = useState(false)
  const [comentario, setComentario] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const cargar = () => {
    api.get(`/oportunidades/${id}`).then((res) => {
      setOportunidad(res.data)
      setLoading(false)
    })
  }

  useEffect(() => { cargar() }, [id])

  const handleRegistrarInteraccion = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post(`/oportunidades/${id}/interacciones`, { comentario })
      setComentario('')
      setModalInteraccion(false)
      cargar()
    } finally {
      setSubmitting(false)
    }
  }

  const handleAvanzarEstado = async (nuevoEstado: string) => {
    await api.patch(`/oportunidades/${id}/estado`, { estado: nuevoEstado })
    cargar()
  }

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-64 text-gray-400">Carregando...</div>
    </Layout>
  )

  const op = oportunidad
  const estadoActualIdx = ESTADOS_ORDEN.indexOf(op.estado)
  const proximoEstado = ESTADOS_ORDEN[estadoActualIdx + 1]

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-4 text-sm">
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-gray-600">
            Pipeline
          </button>
          <span className="text-gray-300">›</span>
          <span className="text-gray-700 font-medium">
            {op.cliente?.nombre || op.lead?.nombreEmpresa}
          </span>
        </div>

        {/* Progress bar de estados */}
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 mb-4">
          <div className="flex items-center gap-1">
            {ESTADOS_ORDEN.map((estado, idx) => {
              const activo = estado === op.estado
              const pasado = idx < estadoActualIdx
              return (
                <div key={estado} className="flex items-center flex-1">
                  <div className={`flex-1 text-center py-1.5 px-1 rounded text-xs font-medium transition-all ${
                    activo ? 'bg-[#b61b24] text-white' :
                    pasado ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {ESTADOS_LABELS[estado]}
                  </div>
                  {idx < ESTADOS_ORDEN.length - 1 && (
                    <div className={`w-3 h-0.5 ${pasado || activo ? 'bg-red-300' : 'bg-gray-200'}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">

          {/* Columna principal */}
          <div className="col-span-2 space-y-4">

            {/* Datos del cliente */}
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Dados do cliente</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-400">Empresa</p>
                  <p className="font-medium text-gray-800">{op.cliente?.nombre || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">CNPJ/CPF</p>
                  <p className="text-gray-700">{op.cliente?.documentoFiscal || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Contato</p>
                  <p className="text-gray-700">{op.cliente?.contactos?.[0]?.nombre || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Telefone</p>
                  <p className="text-gray-700">{op.cliente?.contactos?.[0]?.telefono || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Canal entrada</p>
                  <p className="text-gray-700">{op.lead?.canalEntrada || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Responsável</p>
                  <p className="text-gray-700">{op.usuario?.nombre || '—'}</p>
                </div>
              </div>
            </div>

            {/* Datos del servicio */}
            {op.solicitudServicio && (
              <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
                <h2 className="text-sm font-semibold text-gray-700 mb-4">Dados do serviço</h2>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-400">Tipo de serviço</p>
                    <p className="text-gray-700">{op.solicitudServicio.tipoServicio}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Frequência</p>
                    <p className="text-gray-700">{op.solicitudServicio.frecuenciaServicio}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-400">Endereço de coleta</p>
                    <p className="text-gray-700">{op.solicitudServicio.direccionServicio}</p>
                  </div>
                  {op.solicitudServicio.observaciones && (
                    <div className="col-span-2">
                      <p className="text-xs text-gray-400">Observações</p>
                      <p className="text-gray-700">{op.solicitudServicio.observaciones}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Historial */}
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-700">Histórico de interações</h2>
                <button
                  onClick={() => setModalInteraccion(true)}
                  className="text-xs text-[#b61b24] hover:underline"
                >
                  + Registrar interação
                </button>
              </div>

              {op.historial?.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">Sem interações registradas</p>
              ) : (
                <div className="space-y-3">
                  {op.historial?.map((h: any) => (
                    <div key={h.id} className="flex gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#b61b24] mt-1.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-700">{h.comentario}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {h.usuario?.nombre} · {new Date(h.fecha).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Columna lateral — acciones */}
          <div className="space-y-4">

            {/* Resumen financiero */}
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Resumo financeiro</h2>
              {op.solicitudServicio?.cotizacion ? (
                <div>
                  <p className="text-xs text-gray-400">Valor estimado</p>
                  <p className="text-xl font-bold text-gray-800 mt-1">
                    R$ {Number(op.solicitudServicio.cotizacion.totalFinal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    <span className="text-xs text-gray-400 font-normal">/mês</span>
                  </p>
                  {op.propuestas?.[0] && (
                    <p className="text-xs text-gray-500 mt-1">
                      Proposta {op.propuestas[0].numeroPropuesta} · v{op.propuestas[0].version}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-400">Sem cotização</p>
              )}
            </div>

            {/* Acciones */}
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Ações</h2>
              <div className="space-y-2">
                {proximoEstado && !['GANADA', 'PERDIDA'].includes(op.estado) && (
                  <button
                    onClick={() => handleAvanzarEstado(proximoEstado)}
                    className="w-full bg-[#b61b24] text-white rounded py-2 text-sm font-medium hover:bg-[#9a1720]"
                  >
                    Avançar → {ESTADOS_LABELS[proximoEstado]}
                  </button>
                )}
                <button
                  onClick={() => setModalInteraccion(true)}
                  className="w-full border border-gray-300 text-gray-600 rounded py-2 text-sm hover:bg-gray-50"
                >
                  Registrar interação
                </button>
                {!['GANADA', 'PERDIDA', 'NO_VIABLE'].includes(op.estado) && (
                  <button
                    onClick={() => handleAvanzarEstado('PERDIDA')}
                    className="w-full border border-red-200 text-red-600 rounded py-2 text-sm hover:bg-red-50"
                  >
                    Registrar como perdida
                  </button>
                )}
              </div>
            </div>

            {/* Propuestas */}
            {op.propuestas?.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
                <h2 className="text-sm font-semibold text-gray-700 mb-3">Propostas</h2>
                {op.propuestas.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-700">{p.numeroPropuesta}</p>
                      <p className="text-xs text-gray-400">v{p.version} · {p.estado}</p>
                    </div>
                    <button
                      onClick={() => window.open(`/api/propuestas/${p.id}/pdf`, '_blank')}
                      className="text-xs text-[#b61b24] hover:underline"
                    >
                      PDF
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Orden de servicio */}
            {op.ordenServicio && (
              <div className="bg-green-50 rounded-lg border border-green-200 p-5">
                <h2 className="text-sm font-semibold text-green-800 mb-2">✓ Ordem de Serviço gerada</h2>
                <button
                  onClick={() => window.open(`/api/propuestas/ordenes/${op.ordenServicio.id}/pdf`, '_blank')}
                  className="text-xs text-green-700 hover:underline"
                >
                  Baixar OS em PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal interacción */}
      {modalInteraccion && (
        <Modal titulo="Registrar interação" onClose={() => setModalInteraccion(false)} ancho="max-w-lg">
          <form onSubmit={handleRegistrarInteraccion} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Comentário *</label>
              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                rows={4}
                required
                placeholder="Descreva a interação com o cliente..."
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#b61b24] resize-none"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setModalInteraccion(false)}
                className="border border-gray-300 text-gray-600 px-4 py-2 rounded text-sm hover:bg-gray-50">
                Cancelar
              </button>
              <button type="submit" disabled={submitting}
                className="bg-[#b61b24] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#9a1720] disabled:opacity-50">
                {submitting ? 'Salvando...' : 'Registrar'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </Layout>
  )
}