import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import Modal from '../components/Modal'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

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

const FORM_INICIAL = {
  nombreEmpresa: '',
  canalEntrada: 'WHATSAPP',
  descripcionInicial: '',
  contactoNombre: '',
  contactoTelefono: '',
  contactoEmail: '',
  municipio: '',
}

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
  const { usuario } = useAuth()
  const [oportunidades, setOportunidades] = useState<Oportunidad[]>([])
  const [loading, setLoading] = useState(true)
  const [modalLead, setModalLead] = useState(false)
  const [duplicado, setDuplicado] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState(FORM_INICIAL)
  const navigate = useNavigate()

  const cargarPipeline = () => {
    api.get('/oportunidades').then((res) => {
      setOportunidades(res.data)
      setLoading(false)
    })
  }

  useEffect(() => { cargarPipeline() }, [])

  const porEstado = (estado: string) =>
    oportunidades.filter((o) => o.estado === estado)

  const totalActivas = oportunidades.filter(
    (o) => !['GANADA', 'PERDIDA', 'NO_VIABLE'].includes(o.estado)
  ).length

  const totalGanadas = oportunidades.filter((o) => o.estado === 'GANADA').length

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const res = await api.post('/leads', form)
      if (res.data.posibleDuplicado) {
        setDuplicado(true)
        setSubmitting(false)
        return
      }
      setModalLead(false)
      setForm(FORM_INICIAL)
      setDuplicado(false)
      cargarPipeline()
    } catch {
      setError('Erro ao registrar lead.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCerrarModal = () => {
    setModalLead(false)
    setDuplicado(false)
    setError('')
    setForm(FORM_INICIAL)
  }

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-64 text-gray-400">Carregando...</div>
    </Layout>
  )

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Pipeline comercial</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {totalActivas} ativas · {totalGanadas} ganhas
          </p>
        </div>
        <button
          onClick={() => setModalLead(true)}
          className="bg-[#b61b24] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#9a1720] transition-colors"
        >
          + Nova oportunidade
        </button>
      </div>

      {/* Kanban */}
      <div className="flex gap-3 overflow-x-auto pb-4">
        {ESTADOS.map((estado) => {
          const items = porEstado(estado.key)
          return (
            <div key={estado.key} className="flex-shrink-0 w-56">
              <div className="flex items-center gap-2 mb-2 px-1">
                <div className={`w-2 h-2 rounded-full ${estado.color}`} />
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  {estado.label}
                </span>
                <span className="ml-auto text-xs text-gray-400 bg-gray-200 rounded-full px-2 py-0.5">
                  {items.length}
                </span>
              </div>
              <div className="space-y-2">
                {items.map((op) => (
                  <div
                    key={op.id}
                    className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-[#b61b24]/20 transition-all"
                    onClick={() => navigate(`/oportunidades/${op.id}`)}
                  >
                    <p className="text-sm font-semibold text-gray-800 leading-tight">
                      {op.cliente?.nombre || op.lead?.nombreEmpresa}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{op.tipo || '—'}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-400">{op.usuario?.nombre}</span>
                      {op.prioridad === 'ALTA' && (
                        <span className="text-xs bg-red-50 text-red-600 px-1.5 py-0.5 rounded">Alta</span>
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

      {/* Modal registro de lead */}
      {modalLead && (
        <Modal titulo="Registrar novo lead" onClose={handleCerrarModal}>
          <p className="text-sm text-gray-500 mb-5">
            Preencha os dados do contato e a origem da entrada.
          </p>

          {duplicado && (
            <div className="mb-5 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm font-medium text-yellow-800 mb-1">⚠️ Possível duplicado detectado</p>
              <p className="text-sm text-yellow-700 mb-3">
                Já existe um registro com nome similar. Deseja continuar mesmo assim?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    setSubmitting(true)
                    await api.post('/leads', form)
                    setModalLead(false)
                    setDuplicado(false)
                    setForm(FORM_INICIAL)
                    cargarPipeline()
                    setSubmitting(false)
                  }}
                  className="bg-yellow-600 text-white px-4 py-1.5 rounded text-sm hover:bg-yellow-700"
                >
                  Sim, registrar mesmo assim
                </button>
                <button onClick={() => setDuplicado(false)}
                  className="border border-gray-300 px-4 py-1.5 rounded text-sm hover:bg-gray-50">
                  Cancelar
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmitLead} className="space-y-4">

            {/* Sección 1 — Empresa */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Dados da empresa
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nome da empresa *</label>
                  <input name="nombreEmpresa" value={form.nombreEmpresa} onChange={handleChange} required
                    placeholder="Ex: Metalúrgica Souza Ltda."
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#b61b24]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Município</label>
                  <input name="municipio" value={form.municipio} onChange={handleChange}
                    placeholder="Ex: Palhoça"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#b61b24]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Canal de entrada *</label>
                  <select name="canalEntrada" value={form.canalEntrada} onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#b61b24]">
                    <option value="WHATSAPP">WhatsApp</option>
                    <option value="TELEFONO">Telefone</option>
                    <option value="WEB">Formulário web</option>
                    <option value="INDICACION">Indicação</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Sección 2 — Contacto */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Dados do contato
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nome do contato</label>
                  <input name="contactoNombre" value={form.contactoNombre} onChange={handleChange}
                    placeholder="Ex: João Silva"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#b61b24]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Telefone</label>
                  <input name="contactoTelefono" value={form.contactoTelefono} onChange={handleChange}
                    placeholder="(48) 9 0000-0000"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#b61b24]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">E-mail</label>
                  <input name="contactoEmail" value={form.contactoEmail} onChange={handleChange}
                    placeholder="contato@empresa.com.br"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#b61b24]" />
                </div>
              </div>
            </div>

            {/* Sección 3 — Demanda */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Descrição da demanda
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Responsável</label>
                  <input value={usuario?.nombre || ''} disabled
                    className="w-full border border-gray-200 rounded px-3 py-2 text-sm bg-gray-50 text-gray-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Observações iniciais</label>
                  <textarea name="descripcionInicial" value={form.descripcionInicial} onChange={handleChange}
                    rows={3} placeholder="Descreva brevemente o que o cliente precisa..."
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#b61b24] resize-none" />
                </div>
              </div>
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={handleCerrarModal}
                className="border border-gray-300 text-gray-600 px-6 py-2 rounded text-sm hover:bg-gray-50">
                Cancelar
              </button>
              <button type="submit" disabled={submitting}
                className="bg-[#b61b24] text-white px-6 py-2 rounded text-sm font-medium hover:bg-[#9a1720] disabled:opacity-50">
                {submitting ? 'Registrando...' : 'Registrar lead'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </Layout>
  )
}