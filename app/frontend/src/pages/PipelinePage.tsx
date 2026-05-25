import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import Modal from '../components/Modal'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

const ESTADOS = [
  { key: 'LEAD', label: 'Lead', color: 'bg-gray-400' },
  { key: 'CUALIFICADA', label: 'Qualificada', color: 'bg-blue-400' },
  { key: 'EN_RECOGIDA_DE_DATOS', label: 'Recogida datos', color: 'bg-yellow-400' },
  { key: 'PROPUESTA_EN_ELABORACION', label: 'Elaboração', color: 'bg-orange-400' },
  { key: 'PROPUESTA_ENVIADA', label: 'Prop. Enviada', color: 'bg-purple-400' },
  { key: 'EN_NEGOCIACION', label: 'Negociação', color: 'bg-pink-400' },
  { key: 'GANADA', label: 'Ganha', color: 'bg-green-500' },
  { key: 'PERDIDA', label: 'Perdida', color: 'bg-red-500' },
  { key: 'NO_VIABLE', label: 'No Viable', color: 'bg-gray-600' },
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

// ─── Drag & Drop ─────────────────────────────────────────────────────────────

const ESTADOS_FINALES = ['GANADA', 'PERDIDA', 'NO_VIABLE']

const TRANSICIONES_VALIDAS: Record<string, string[]> = {
  LEAD: ['CUALIFICADA', 'NO_VIABLE'],
  CUALIFICADA: ['EN_RECOGIDA_DE_DATOS'],
  EN_RECOGIDA_DE_DATOS: ['PROPUESTA_EN_ELABORACION', 'NO_VIABLE'],
  PROPUESTA_EN_ELABORACION: ['PROPUESTA_ENVIADA'],
  PROPUESTA_ENVIADA: ['EN_NEGOCIACION', 'GANADA', 'PERDIDA'],
  EN_NEGOCIACION: ['PROPUESTA_ENVIADA', 'GANADA', 'PERDIDA'],
}

const esTransicionValida = (desde: string, hasta: string): boolean =>
  TRANSICIONES_VALIDAS[desde]?.includes(hasta) ?? false

// ─────────────────────────────────────────────────────────────────────────────

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

function TarjetaDraggable({
  op,
  onNavigate,
}: {
  op: Oportunidad
  onNavigate: () => void
}) {
  const esFinal = ESTADOS_FINALES.includes(op.estado)
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: op.id,
    disabled: esFinal,
    data: { estado: op.estado },
  })

  const style: React.CSSProperties = {
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    opacity: isDragging ? 0.4 : 1,
    cursor: esFinal ? 'default' : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-[#b61b24]/20 transition-all"
      onClick={onNavigate}
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
  )
}

function ColumnaDroppable({
  estado,
  activeEstado,
  children,
}: {
  estado: string
  activeEstado: string | null
  children: React.ReactNode
}) {
  const { setNodeRef, isOver } = useDroppable({ id: estado })

  const arrastrandoSobre = isOver && activeEstado !== null && activeEstado !== estado
  const valida = activeEstado ? esTransicionValida(activeEstado, estado) : false

  const bordeClase = arrastrandoSobre
    ? valida
      ? 'border-blue-400 bg-blue-50/40'
      : 'border-red-300 bg-red-50/40'
    : 'border-transparent'

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[80px] rounded-lg border-2 p-1 transition-colors duration-150 ${bordeClase}`}
    >
      {children}
    </div>
  )
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

  // ─── Drag & Drop ───────────────────────────────────────────────────────────
  const [activeId, setActiveId] = useState<string | null>(null)
  const [mensajeError, setMensajeError] = useState<string | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )
  // ──────────────────────────────────────────────────────────────────────────

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

  const activeOp = activeId ? (oportunidades.find((o) => o.id === activeId) ?? null) : null
  const activeEstado = activeOp?.estado ?? null

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

  // ─── Drag & Drop handlers ─────────────────────────────────────────────────

  const handleDragStart = (e: DragStartEvent) => {
    setActiveId(e.active.id as string)
  }

  const handleDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e
    setActiveId(null)

    if (!over) return

    const op = oportunidades.find((o) => o.id === active.id)
    if (!op) return

    const origen = op.estado
    const destino = over.id as string

    if (origen === destino) return

    if (!esTransicionValida(origen, destino)) {
      setMensajeError('Transición no permitida')
      setTimeout(() => setMensajeError(null), 2000)
      return
    }

    // Actualización optimista local — sin recargar la página
    setOportunidades((prev) =>
      prev.map((o) => (o.id === op.id ? { ...o, estado: destino } : o))
    )

    try {
      await api.patch(`/oportunidades/${op.id}/estado`, { estado: destino })
    } catch {
      // Snap back si el PATCH falla
      setOportunidades((prev) =>
        prev.map((o) => (o.id === op.id ? { ...o, estado: origen } : o))
      )
      alert('Error al actualizar el estado. Intenta de nuevo.')
    }
  }

  // ─────────────────────────────────────────────────────────────────────────

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

      {/* Toast — transición no permitida */}
      {mensajeError && (
        <div className="fixed top-4 right-4 z-50 bg-red-600 text-white px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium">
          ⚠️ {mensajeError}
        </div>
      )}

      {/* Kanban */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
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
                <ColumnaDroppable estado={estado.key} activeEstado={activeEstado}>
                  <div className="space-y-2">
                    {items.map((op) => (
                      <TarjetaDraggable
                        key={op.id}
                        op={op}
                        onNavigate={() => navigate(`/oportunidades/${op.id}`)}
                      />
                    ))}
                    {items.length === 0 && (
                      <div className="text-center py-6 text-xs text-gray-300 border-2 border-dashed border-gray-100 rounded-lg">
                        Sem oportunidades
                      </div>
                    )}
                  </div>
                </ColumnaDroppable>
              </div>
            )
          })}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeOp ? (
            <div className="bg-white rounded-lg p-3 shadow-xl border border-[#b61b24]/30 rotate-1 w-56">
              <p className="text-sm font-semibold text-gray-800 leading-tight">
                {activeOp.cliente?.nombre || activeOp.lead?.nombreEmpresa}
              </p>
              <p className="text-xs text-gray-400 mt-1">{activeOp.tipo || '—'}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-400">{activeOp.usuario?.nombre}</span>
                {activeOp.prioridad === 'ALTA' && (
                  <span className="text-xs bg-red-50 text-red-600 px-1.5 py-0.5 rounded">Alta</span>
                )}
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

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
                    try {
                      await api.post('/leads', { ...form, force: true })
                      setModalLead(false)
                      setDuplicado(false)
                      setForm(FORM_INICIAL)
                      cargarPipeline()
                    } catch {
                      setError('Erro ao confirmar registro. Tente novamente.')
                    } finally {
                      setSubmitting(false)
                    }
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