import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import Modal from '../components/Modal'
import api from '../services/api'

const ESTADOS_LABELS: Record<string, string> = {
  LEAD: 'Lead',
  CUALIFICADA: 'Qualificada',
  EN_RECOGIDA_DE_DATOS: 'Recogida datos',
  PROPUESTA_EN_ELABORACION: 'Elaboração',
  PROPUESTA_ENVIADA: 'Prop. Enviada',
  EN_NEGOCIACION: 'Negociação',
  GANADA: 'Ganha',
  PERDIDA: 'Perdida',
  NO_VIABLE: 'Não Viável',
}

const ESTADOS_ORDEN = [
  'LEAD', 'CUALIFICADA', 'EN_RECOGIDA_DE_DATOS',
  'PROPUESTA_EN_ELABORACION', 'PROPUESTA_ENVIADA',
  'EN_NEGOCIACION', 'GANADA'
]

type SeccionEdicion = null | 'basicos' | 'contacto' | 'cualificacion'

export default function OportunidadPage() {
  const { id } = useParams()
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [oportunidad, setOportunidad] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [modalInteraccion, setModalInteraccion] = useState(false)
  const [comentario, setComentario] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [modalPropuesta, setModalPropuesta] = useState<any>(null)
  const [formPropuesta, setFormPropuesta] = useState({
    condicionesPago: 'Prazo de faturamento 30 dias',
    validadeDias: 5,
    nombreFirmante: '',
    cargoFirmante: 'Departamento Comercial',
    observaciones: '',
  })
  const [guardandoPropuesta, setGuardandoPropuesta] = useState(false)
  const [modalCierre, setModalCierre] = useState<'GANADA' | 'PERDIDA' | null>(null)
  const [motivoCierre, setMotivoCierre] = useState('')
  const [cerrandoOportunidad, setCerrandoOportunidad] = useState(false)

  // ── Edición inline ──────────────────────────────────────────────────────────
  const [editandoSeccion, setEditandoSeccion] = useState<SeccionEdicion>(null)
  const [guardando, setGuardando] = useState(false)
  const [feedbackSeccion, setFeedbackSeccion] = useState<{
    seccion: 'basicos' | 'contacto' | 'cualificacion'
    tipo: 'ok' | 'error'
    texto: string
  } | null>(null)

  const [formBasicos, setFormBasicos] = useState({
    nombre: '', empresa: '', canal: '', responsavel: '',
  })
  const [formContacto, setFormContacto] = useState({
    nombre: '', telefone: '', email: '',
  })
  const [formCualificacion, setFormCualificacion] = useState({
    viabilidade: 'viable' as 'viable' | 'no_viable',
    prioridad: 'MEDIA',
    motivoNoViable: '',
  })
  // ────────────────────────────────────────────────────────────────────────────

  // ── Cotización ───────────────────────────────────────────────────────────────
  const [residuos, setResiduos] = useState<any[]>([])
  const [editandoServicio, setEditandoServicio] = useState(false)
  const [formServicio, setFormServicio] = useState({
    tipoServicio: 'COLETA_PROGRAMADA',
    frecuenciaServicio: 'SEMANAL',
    direccionServicio: '',
    observaciones: '',
    restriccionesHorario: '',
  })
  const [itemsServicio, setItemsServicio] = useState([
    { residuoId: '', cantidadEstimada: '', unidadMedida: 'KG', descripcionDetallada: '' },
  ])
  const [guardandoServicio, setGuardandoServicio] = useState(false)
  const [errorServicio, setErrorServicio] = useState<string | null>(null)
  const [generandoCotizacion, setGenerandoCotizacion] = useState(false)
  const [errorCotizacion, setErrorCotizacion] = useState<string | null>(null)
  const [ajustesItems, setAjustesItems] = useState<Record<string, {
    precioFinal: string
    justificacion: string
    guardando: boolean
    feedback: { tipo: 'ok' | 'error'; texto: string } | null
  }>>({})
  const [generandoPropuesta, setGenerandoPropuesta] = useState(false)
  // ────────────────────────────────────────────────────────────────────────────

  const cargar = () => {
    api.get(`/oportunidades/${id}`)
      .then((res) => {
        setOportunidad(res.data)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
        setError('No se pudo cargar la oportunidad')
      })
  }

  useEffect(() => { cargar() }, [id])

  useEffect(() => {
    api.get('/cotizaciones/residuos').then((res) => setResiduos(res.data)).catch(() => {})
  }, [])

  useEffect(() => {
    const items = oportunidad?.solicitudServicio?.cotizacion?.items
    if (!items) return
    setAjustesItems((prev) => {
      const next: typeof prev = {}
      items.forEach((item: any) => {
        next[item.id] = prev[item.id] ?? {
          precioFinal: String(item.precioFinal ?? item.precioSugerido ?? ''),
          justificacion: item.justificacion || '',
          guardando: false,
          feedback: null,
        }
      })
      return next
    })
  }, [oportunidad])

  const handleRegistrarInteraccion = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post(`/oportunidades/${id}/interacciones`, { comentario })
      setComentario('')
      setModalInteraccion(false)
      cargar()
    } catch {
      alert('Error al registrar la interacción. Intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAvanzarEstado = async (nuevoEstado: string) => {
    try {
      await api.patch(`/oportunidades/${id}/estado`, { estado: nuevoEstado })
      cargar()
    } catch {
      alert('Error al avanzar estado. Intenta de nuevo.')
    }
  }
  const handleCerrarOportunidad = async () => {
    if (modalCierre === 'PERDIDA' && !motivoCierre.trim()) {
        alert('El motivo de pérdida es obligatorio.')
        return
    }
    setCerrandoOportunidad(true)
    try {
        await api.patch(`/propuestas/oportunidades/${id}/cerrar`, {
        estado: modalCierre,
        motivoPerdida: modalCierre === 'PERDIDA' ? motivoCierre : undefined,
        })
        setModalCierre(null)
        setMotivoCierre('')
        cargar()
    } catch {
        alert('Error al cerrar la oportunidad. Intenta de nuevo.')
    } finally {
        setCerrandoOportunidad(false)
    }
    }

  // ── Handlers de edición inline ──────────────────────────────────────────────

  const iniciarEdicion = (seccion: 'basicos' | 'contacto' | 'cualificacion') => {
    const op = oportunidad
    if (seccion === 'basicos') {
      setFormBasicos({
        nombre: op.lead?.nombreEmpresa || '',
        empresa: op.cliente?.nombre || '',
        canal: op.lead?.canalEntrada || '',
        responsavel: op.usuario?.nombre || '',
      })
    } else if (seccion === 'contacto') {
      setFormContacto({
        nombre: op.cliente?.contactos?.[0]?.nombre || '',
        telefone: op.cliente?.contactos?.[0]?.telefono || '',
        email: op.cliente?.contactos?.[0]?.email || '',
      })
    } else if (seccion === 'cualificacion') {
      setFormCualificacion({
        viabilidade: op.estado === 'NO_VIABLE' ? 'no_viable' : 'viable',
        prioridad: op.prioridad || 'MEDIA',
        motivoNoViable: op.motivoNoViable || '',
      })
    }
    setEditandoSeccion(seccion)
    setFeedbackSeccion(null)
  }

  const cancelarEdicion = () => {
    setEditandoSeccion(null)
    setFeedbackSeccion(null)
  }

  const guardarSeccion = async (seccion: 'basicos' | 'contacto' | 'cualificacion') => {
    setGuardando(true)
    setFeedbackSeccion(null)
    try {
      let payload: Record<string, any> = {}

      if (seccion === 'basicos') {
        payload = {
          nombre: formBasicos.nombre,
          empresa: formBasicos.empresa,
          canal: formBasicos.canal,
        }
      } else if (seccion === 'contacto') {
        payload = { contacto: { ...formContacto } }
      } else if (seccion === 'cualificacion') {
        // Validar motivo si no viable
        if (formCualificacion.viabilidade === 'no_viable' && !formCualificacion.motivoNoViable.trim()) {
          setFeedbackSeccion({ seccion, tipo: 'error', texto: 'El motivo de descarte es obligatorio.' })
          setGuardando(false)
          return
        }

        // Actualizar prioridad / motivoNoViable
        payload = {
          ...(formCualificacion.viabilidade === 'viable' && { prioridad: formCualificacion.prioridad }),
          ...(formCualificacion.viabilidade === 'no_viable' && { motivoNoViable: formCualificacion.motivoNoViable }),
        }

        // Cambiar estado según decisión
        const nuevoEstado = formCualificacion.viabilidade === 'no_viable' ? 'NO_VIABLE' : 'CUALIFICADA'
        const estadoActual = oportunidad.estado
        if (estadoActual === 'LEAD' || formCualificacion.viabilidade === 'no_viable') {
          await api.patch(`/oportunidades/${id}/estado`, {
            estado: nuevoEstado,
            ...(formCualificacion.viabilidade === 'no_viable' && {
              motivoPerdida: formCualificacion.motivoNoViable
            }),
          })
        }
      }

      await api.patch(`/oportunidades/${id}`, payload)

      // Recargar para reflejar cambios de estado y datos
      cargar()

      setEditandoSeccion(null)
      setFeedbackSeccion({ seccion, tipo: 'ok', texto: '✓ Guardado' })
      setTimeout(() => setFeedbackSeccion(null), 3000)
    } catch {
      setFeedbackSeccion({ seccion, tipo: 'error', texto: 'Error al guardar. Intenta de nuevo.' })
    } finally {
      setGuardando(false)
    }
  }

  // ── Cotización handlers ─────────────────────────────────────────────────────

  const agregarItemServicio = () =>
    setItemsServicio((prev) => [
      ...prev,
      { residuoId: '', cantidadEstimada: '', unidadMedida: 'KG', descripcionDetallada: '' },
    ])

  const eliminarItemServicio = (idx: number) =>
    setItemsServicio((prev) => prev.filter((_, i) => i !== idx))

  const actualizarItemServicio = (idx: number, campo: string, valor: string) =>
    setItemsServicio((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [campo]: valor } : item))
    )

  const iniciarEdicionServicio = () => {
    const ss = oportunidad?.solicitudServicio
    setFormServicio({
      tipoServicio: ss?.tipoServicio || 'COLETA_PROGRAMADA',
      frecuenciaServicio: ss?.frecuenciaServicio || 'SEMANAL',
      direccionServicio: ss?.direccionServicio || '',
      observaciones: ss?.observaciones || '',
      restriccionesHorario: ss?.restriccionesHorario || '',
    })
    setItemsServicio(
      ss?.items?.map((i: any) => ({
        residuoId: i.residuoId || '',
        cantidadEstimada: String(i.cantidadEstimada || ''),
        unidadMedida: i.unidadMedida || 'KG',
        descripcionDetallada: i.descripcionDetallada || '',
      })) ?? [{ residuoId: '', cantidadEstimada: '', unidadMedida: 'KG', descripcionDetallada: '' }]
    )
    setEditandoServicio(true)
    setErrorServicio(null)
  }

const handleGuardarServicio = async () => {
  if (!formServicio.direccionServicio.trim()) {
    setErrorServicio('O endereço de coleta é obrigatório.')
    return
  }
  if (itemsServicio.some((i) => !i.residuoId)) {
    setErrorServicio('Todos os ítems precisam ter um resíduo selecionado.')
    return
  }
  setGuardandoServicio(true)
  setErrorServicio(null)
  try {
    const solicitudExistente = oportunidad?.solicitudServicio?.id

    if (solicitudExistente) {
      // Actualizar solicitud existente
      await api.put(`/cotizaciones/solicitudes/${solicitudExistente}`, {
        ...formServicio,
        items: itemsServicio.map((i) => ({
          ...i,
          cantidadEstimada: Number(i.cantidadEstimada),
        })),
      })
    } else {
      // Crear nueva solicitud
      await api.post('/cotizaciones/solicitudes', {
        oportunidadId: id,
        ...formServicio,
        items: itemsServicio.map((i) => ({
          ...i,
          cantidadEstimada: Number(i.cantidadEstimada),
        })),
      })
      await api.patch(`/oportunidades/${id}/estado`, { estado: 'PROPUESTA_EN_ELABORACION' })
    }

    cargar()
    setEditandoServicio(false)
  } catch {
    setErrorServicio('Error al guardar. Intenta de nuevo.')
  } finally {
    setGuardandoServicio(false)
  }
}

  const handleGenerarCotizacion = async () => {
    const solicitudId = oportunidad?.solicitudServicio?.id
    if (!solicitudId) return
    setGenerandoCotizacion(true)
    setErrorCotizacion(null)
    try {
      await api.post(`/cotizaciones/solicitudes/${solicitudId}/cotizar`)
      cargar()
    } catch {
      setErrorCotizacion('Error al generar la cotización. Intenta de nuevo.')
    } finally {
      setGenerandoCotizacion(false)
    }
  }

  const handleGuardarAjusteItem = async (cotizacionId: string, itemId: string) => {
    const ajuste = ajustesItems[itemId]
    if (!ajuste) return
    const item = oportunidad?.solicitudServicio?.cotizacion?.items?.find((i: any) => i.id === itemId)
    if (Number(ajuste.precioFinal) !== Number(item?.precioSugerido) && !ajuste.justificacion.trim()) {
      setAjustesItems((prev) => ({
        ...prev,
        [itemId]: { ...prev[itemId], feedback: { tipo: 'error', texto: 'La justificación es obligatoria al modificar el precio.' } },
      }))
      return
    }
    setAjustesItems((prev) => ({ ...prev, [itemId]: { ...prev[itemId], guardando: true, feedback: null } }))
    try {
      await api.patch(`/cotizaciones/${cotizacionId}/items/${itemId}/precio`, {
        precioFinal: Number(ajuste.precioFinal),
        justificacion: ajuste.justificacion,
      })
      setAjustesItems((prev) => ({
        ...prev,
        [itemId]: { ...prev[itemId], guardando: false, feedback: { tipo: 'ok', texto: '✓ Guardado' } },
      }))
      cargar()
    } catch {
      setAjustesItems((prev) => ({
        ...prev,
        [itemId]: { ...prev[itemId], guardando: false, feedback: { tipo: 'error', texto: 'Error al guardar' } },
      }))
    }
  }

    const handleGenerarPropuesta = async () => {
    // Abrir modal con datos prellenados del usuario logado
    setFormPropuesta({
        condicionesPago: 'Prazo de faturamento 30 dias',
        validadeDias: 5,
        nombreFirmante: usuario?.nombre || '',
        cargoFirmante: 'Departamento Comercial',
        observaciones: '',
    })
    setModalPropuesta({ id: null, numeroPropuesta: 'Nova proposta' })
    }

  // ────────────────────────────────────────────────────────────────────────────

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-64 text-gray-400">Carregando...</div>
    </Layout>
  )

  if (error) return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-64 gap-2">
        <p className="text-red-600 font-medium">{error}</p>
        <button onClick={() => navigate('/')} className="text-sm text-gray-500 hover:underline">
          Voltar ao Pipeline
        </button>
      </div>
    </Layout>
  )

  const op = oportunidad
  const estadoActualIdx = ESTADOS_ORDEN.indexOf(op.estado)
  const proximoEstado = ESTADOS_ORDEN[estadoActualIdx + 1]

  const cotizacion = op.solicitudServicio?.cotizacion
  const totalSugerido = cotizacion?.items?.reduce(
    (s: number, i: any) => s + Number(i.precioSugerido || 0), 0
  ) ?? 0
  const totalFinalLocal = cotizacion?.items?.reduce(
    (s: number, i: any) => s + Number(ajustesItems[i.id]?.precioFinal ?? i.precioFinal ?? i.precioSugerido ?? 0), 0
  ) ?? 0

  const claseInput = 'w-full border border-blue-300 bg-blue-50/30 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-blue-400'
  const claseLabel = 'block text-xs text-gray-400 mb-1'

  const CabeceraSeccion = ({
    titulo,
    seccion,
  }: {
    titulo: string
    seccion: 'basicos' | 'contacto' | 'cualificacion'
  }) => (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-sm font-semibold text-gray-700">{titulo}</h2>
      <div className="flex items-center gap-3">
        {feedbackSeccion?.seccion === seccion && editandoSeccion !== seccion && (
          <span className="text-xs text-green-600">{feedbackSeccion.texto}</span>
        )}
        {editandoSeccion !== seccion && (
          <button
            onClick={() => iniciarEdicion(seccion)}
            disabled={editandoSeccion !== null}
            className="text-xs text-gray-400 hover:text-gray-600 disabled:text-gray-200 disabled:cursor-default transition-colors"
          >
            Editar
          </button>
        )}
      </div>
    </div>
  )

  const BotonesGuardarCancelar = ({
    seccion,
  }: {
    seccion: 'basicos' | 'contacto' | 'cualificacion'
  }) => (
    <div className="flex gap-2 mt-3">
      <button
        onClick={() => guardarSeccion(seccion)}
        disabled={guardando}
        className="bg-[#b61b24] text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-[#9a1720] disabled:opacity-50 transition-colors"
      >
        {guardando ? 'Guardando...' : 'Guardar'}
      </button>
      <button
        onClick={cancelarEdicion}
        className="border border-gray-300 text-gray-600 px-3 py-1.5 rounded text-xs hover:bg-gray-50 transition-colors"
      >
        Cancelar
      </button>
    </div>
  )

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">

        {/* Volver */}
        <button
          onClick={() => navigate('/')}
          className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1 mb-4"
        >
          ← Volver al pipeline
        </button>

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

            {/* ── SECCIÓN 1: Dados básicos ─────────────────────────────────── */}
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
              <CabeceraSeccion titulo="Dados básicos" seccion="basicos" />

              {editandoSeccion === 'basicos' ? (
                <div className="bg-blue-50/20 rounded-lg p-3 border border-blue-100">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={claseLabel}>Nome</label>
                      <input
                        value={formBasicos.nombre}
                        onChange={(e) => setFormBasicos({ ...formBasicos, nombre: e.target.value })}
                        className={claseInput}
                      />
                    </div>
                    <div>
                      <label className={claseLabel}>Empresa</label>
                      <input
                        value={formBasicos.empresa}
                        onChange={(e) => setFormBasicos({ ...formBasicos, empresa: e.target.value })}
                        className={claseInput}
                      />
                    </div>
                    <div>
                      <label className={claseLabel}>Canal de entrada</label>
                      <select
                        value={formBasicos.canal}
                        onChange={(e) => setFormBasicos({ ...formBasicos, canal: e.target.value })}
                        className={claseInput}
                      >
                        <option value="WHATSAPP">WhatsApp</option>
                        <option value="TELEFONE">Telefone</option>
                        <option value="WEB">Formulário web</option>
                        <option value="INDICACAO">Indicação</option>
                      </select>
                    </div>
                    <div>
                      <label className={claseLabel}>Responsável</label>
                      <input
                        value={formBasicos.responsavel}
                        onChange={(e) => setFormBasicos({ ...formBasicos, responsavel: e.target.value })}
                        className={claseInput}
                      />
                    </div>
                  </div>
                  {feedbackSeccion?.seccion === 'basicos' && feedbackSeccion.tipo === 'error' && (
                    <p className="text-xs text-red-600 mt-2">{feedbackSeccion.texto}</p>
                  )}
                  <BotonesGuardarCancelar seccion="basicos" />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-400">Nome</p>
                    <p className="font-medium text-gray-800">{op.lead?.nombreEmpresa || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Empresa</p>
                    <p className="text-gray-700">{op.cliente?.nombre || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Canal entrada</p>
                    <p className="text-gray-700">{op.lead?.canalEntrada || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Responsável</p>
                    <p className="text-gray-700">{op.usuario?.nombre || '—'}</p>
                  </div>
                  {op.cliente?.documentoFiscal && (
                    <div className="col-span-2">
                      <p className="text-xs text-gray-400">CNPJ/CPF</p>
                      <p className="text-gray-700">{op.cliente.documentoFiscal}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── SECCIÓN 2: Contacto ──────────────────────────────────────── */}
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
              <CabeceraSeccion titulo="Contacto" seccion="contacto" />

              {editandoSeccion === 'contacto' ? (
                <div className="bg-blue-50/20 rounded-lg p-3 border border-blue-100">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className={claseLabel}>Nome do contato</label>
                      <input
                        value={formContacto.nombre}
                        onChange={(e) => setFormContacto({ ...formContacto, nombre: e.target.value })}
                        className={claseInput}
                      />
                    </div>
                    <div>
                      <label className={claseLabel}>Telefone</label>
                      <input
                        value={formContacto.telefone}
                        onChange={(e) => setFormContacto({ ...formContacto, telefone: e.target.value })}
                        className={claseInput}
                      />
                    </div>
                    <div>
                      <label className={claseLabel}>E-mail</label>
                      <input
                        type="email"
                        value={formContacto.email}
                        onChange={(e) => setFormContacto({ ...formContacto, email: e.target.value })}
                        className={claseInput}
                      />
                    </div>
                  </div>
                  {feedbackSeccion?.seccion === 'contacto' && feedbackSeccion.tipo === 'error' && (
                    <p className="text-xs text-red-600 mt-2">{feedbackSeccion.texto}</p>
                  )}
                  <BotonesGuardarCancelar seccion="contacto" />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-400">Nome</p>
                    <p className="text-gray-700">{op.cliente?.contactos?.[0]?.nombre || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Telefone</p>
                    <p className="text-gray-700">{op.cliente?.contactos?.[0]?.telefono || '—'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-400">E-mail</p>
                    <p className="text-gray-700">{op.cliente?.contactos?.[0]?.email || '—'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* ── SECCIÓN 3: Qualificação ──────────────────────────────────── */}
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
              <CabeceraSeccion titulo="Qualificação" seccion="cualificacion" />

              {editandoSeccion === 'cualificacion' ? (
                <div className="bg-blue-50/20 rounded-lg p-3 border border-blue-100 space-y-4">

                  {/* Viabilidade */}
                  <div>
                    <label className={claseLabel}>Viabilidade</label>
                    <div className="flex gap-6 mt-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="viabilidade"
                          value="viable"
                          checked={formCualificacion.viabilidade === 'viable'}
                          onChange={() => setFormCualificacion({
                            ...formCualificacion,
                            viabilidade: 'viable',
                            motivoNoViable: ''
                          })}
                          className="accent-[#b61b24]"
                        />
                        <span className="text-sm text-gray-700">Viable</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="viabilidade"
                          value="no_viable"
                          checked={formCualificacion.viabilidade === 'no_viable'}
                          onChange={() => setFormCualificacion({
                            ...formCualificacion,
                            viabilidade: 'no_viable'
                          })}
                          className="accent-[#b61b24]"
                        />
                        <span className="text-sm text-gray-700">No viable</span>
                      </label>
                    </div>
                  </div>

                  {/* Prioridade — solo si viable */}
                  {formCualificacion.viabilidade === 'viable' && (
                    <div>
                      <label className={claseLabel}>Prioridade</label>
                      <select
                        value={formCualificacion.prioridad}
                        onChange={(e) => setFormCualificacion({
                          ...formCualificacion,
                          prioridad: e.target.value
                        })}
                        className={claseInput}
                      >
                        <option value="ALTA">Alta</option>
                        <option value="MEDIA">Média</option>
                        <option value="BAJA">Baixa</option>
                      </select>
                    </div>
                  )}

                  {/* Motivo — solo si no viable */}
                  {formCualificacion.viabilidade === 'no_viable' && (
                    <div>
                      <label className={claseLabel}>Motivo de descarte *</label>
                      <textarea
                        value={formCualificacion.motivoNoViable}
                        onChange={(e) => setFormCualificacion({
                          ...formCualificacion,
                          motivoNoViable: e.target.value
                        })}
                        rows={3}
                        placeholder="Descreva por que este lead não é viável..."
                        className={`${claseInput} resize-none`}
                      />
                    </div>
                  )}

                  {feedbackSeccion?.seccion === 'cualificacion' && feedbackSeccion.tipo === 'error' && (
                    <p className="text-xs text-red-600">{feedbackSeccion.texto}</p>
                  )}
                  <BotonesGuardarCancelar seccion="cualificacion" />
                </div>
              ) : (
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      op.estado === 'NO_VIABLE'
                        ? 'bg-gray-100 text-gray-600'
                        : op.estado === 'LEAD'
                        ? 'bg-yellow-50 text-yellow-600'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {op.estado === 'NO_VIABLE' ? 'No viable'
                        : op.estado === 'LEAD' ? 'Pendente de qualificação'
                        : 'Viable'}
                    </span>
                    {op.prioridad && op.estado !== 'NO_VIABLE' && (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        op.prioridad === 'ALTA' ? 'bg-red-100 text-red-700' :
                        op.prioridad === 'MEDIA' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {op.prioridad}
                      </span>
                    )}
                  </div>
                  {op.motivoNoViable && (
                    <div>
                      <p className="text-xs text-gray-400">Motivo de descarte</p>
                      <p className="text-gray-700 mt-0.5">{op.motivoNoViable}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── SECCIÓN A: Datos del servicio (solo en EN_RECOGIDA_DE_DATOS) ── */}
            {['EN_RECOGIDA_DE_DATOS', 'PROPUESTA_EN_ELABORACION', 'PROPUESTA_ENVIADA', 'EN_NEGOCIACION', 'GANADA', 'PERDIDA'].includes(op.estado) && (
              <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-gray-700">Dados do serviço</h2>
                  {op.solicitudServicio && !editandoServicio && (
                    <button
                      onClick={iniciarEdicionServicio}
                      className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      Editar
                    </button>
                  )}
                </div>

                {op.solicitudServicio && !editandoServicio ? (
                  /* Modo lectura */
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className={claseLabel}>Tipo de serviço</p>
                      <p className="text-gray-700">{op.solicitudServicio.tipoServicio}</p>
                    </div>
                    <div>
                      <p className={claseLabel}>Frequência</p>
                      <p className="text-gray-700">{op.solicitudServicio.frecuenciaServicio}</p>
                    </div>
                    <div className="col-span-2">
                      <p className={claseLabel}>Endereço de coleta</p>
                      <p className="text-gray-700">{op.solicitudServicio.direccionServicio}</p>
                    </div>
                    {op.solicitudServicio.observaciones && (
                      <div className="col-span-2">
                        <p className={claseLabel}>Observações</p>
                        <p className="text-gray-700">{op.solicitudServicio.observaciones}</p>
                      </div>
                    )}
                    {op.solicitudServicio.items?.length > 0 && (
                      <div className="col-span-2 mt-1">
                        <p className={claseLabel + ' mb-2'}>Resíduos</p>
                        <div className="space-y-1">
                          {op.solicitudServicio.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex gap-2 text-xs text-gray-600 bg-gray-50 rounded px-3 py-1.5">
                              <span className="font-medium">
                                {residuos.find((r) => r.id === item.residuoId)?.nombre || item.residuoId}
                              </span>
                              <span className="text-gray-300">·</span>
                              <span>{item.cantidadEstimada} {item.unidadMedida}</span>
                              {item.descripcionDetallada && (
                                <span className="text-gray-400">— {item.descripcionDetallada}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Modo formulario */
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={claseLabel}>Tipo de serviço *</label>
                        <select
                          value={formServicio.tipoServicio}
                          onChange={(e) => setFormServicio({ ...formServicio, tipoServicio: e.target.value })}
                          className={claseInput}
                        >
                          <option value="COLETA_PROGRAMADA">Coleta Programada</option>
                          <option value="COLETA_AVULSA">Coleta Avulsa</option>
                          <option value="GERENCIAMENTO">Gerenciamento</option>
                          <option value="LOGISTICA_REVERSA">Logística Reversa</option>
                        </select>
                      </div>
                      <div>
                        <label className={claseLabel}>Frequência *</label>
                        <select
                          value={formServicio.frecuenciaServicio}
                          onChange={(e) => setFormServicio({ ...formServicio, frecuenciaServicio: e.target.value })}
                          className={claseInput}
                        >
                          <option value="SEMANAL">Semanal</option>
                          <option value="QUINZENAL">Quinzenal</option>
                          <option value="MENSAL">Mensal</option>
                          <option value="BIMESTRAL">Bimestral</option>
                          <option value="SOB_DEMANDA">Sob demanda</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className={claseLabel}>Endereço de coleta *</label>
                        <input
                          value={formServicio.direccionServicio}
                          onChange={(e) => setFormServicio({ ...formServicio, direccionServicio: e.target.value })}
                          placeholder="Rua, número, bairro, cidade..."
                          className={claseInput}
                        />
                      </div>
                      <div className="col-span-2">
                        <label className={claseLabel}>Observações</label>
                        <textarea
                          value={formServicio.observaciones}
                          onChange={(e) => setFormServicio({ ...formServicio, observaciones: e.target.value })}
                          rows={2}
                          className={`${claseInput} resize-none`}
                        />
                      </div>
                      <div className="col-span-2">
                        <label className={claseLabel}>Restrições de horário</label>
                        <input
                          value={formServicio.restriccionesHorario}
                          onChange={(e) => setFormServicio({ ...formServicio, restriccionesHorario: e.target.value })}
                          placeholder="Ex: somente 08h–18h, segunda a sexta"
                          className={claseInput}
                        />
                      </div>
                    </div>

                    {/* Ítems de resíduos */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-gray-600">Resíduos do serviço</p>
                        <button
                          type="button"
                          onClick={agregarItemServicio}
                          className="text-xs text-[#b61b24] hover:underline"
                        >
                          + Adicionar resíduo
                        </button>
                      </div>
                      <div className="space-y-2">
                        {itemsServicio.map((item, idx) => (
                          <div key={idx} className="grid grid-cols-12 gap-2 items-end bg-gray-50 rounded p-2">
                            <div className="col-span-4">
                              <label className={claseLabel}>Resíduo *</label>
                              <select
                                value={item.residuoId}
                                onChange={(e) => actualizarItemServicio(idx, 'residuoId', e.target.value)}
                                className={claseInput}
                              >
                                <option value="">Selecionar...</option>
                                {residuos.map((r: any) => (
                                  <option key={r.id} value={r.id}>{r.nombre}</option>
                                ))}
                              </select>
                            </div>
                            <div className="col-span-2">
                              <label className={claseLabel}>Qtd.</label>
                              <input
                                type="number"
                                min="0"
                                value={item.cantidadEstimada}
                                onChange={(e) => actualizarItemServicio(idx, 'cantidadEstimada', e.target.value)}
                                className={claseInput}
                              />
                            </div>
                            <div className="col-span-2">
                              <label className={claseLabel}>Unidade</label>
                              <select
                                value={item.unidadMedida}
                                onChange={(e) => actualizarItemServicio(idx, 'unidadMedida', e.target.value)}
                                className={claseInput}
                              >
                                <option value="KG">kg</option>
                                <option value="M3">m³</option>
                                <option value="UNIDAD">und.</option>
                                <option value="CONTENEDOR">cont.</option>
                              </select>
                            </div>
                            <div className="col-span-3">
                              <label className={claseLabel}>Descrição</label>
                              <input
                                value={item.descripcionDetallada}
                                onChange={(e) => actualizarItemServicio(idx, 'descripcionDetallada', e.target.value)}
                                className={claseInput}
                              />
                            </div>
                            <div className="col-span-1 flex justify-center pb-1">
                              {itemsServicio.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => eliminarItemServicio(idx)}
                                  className="text-gray-300 hover:text-red-500 text-xl leading-none transition-colors"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {errorServicio && <p className="text-xs text-red-600">{errorServicio}</p>}

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={handleGuardarServicio}
                        disabled={guardandoServicio}
                        className="bg-[#b61b24] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#9a1720] disabled:opacity-50 transition-colors"
                      >
                        {guardandoServicio ? 'Guardando...' : 'Guardar e avançar →'}
                      </button>
                      {op.solicitudServicio && (
                        <button
                          onClick={() => setEditandoServicio(false)}
                          className="border border-gray-300 text-gray-600 px-4 py-2 rounded text-sm hover:bg-gray-50 transition-colors"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── SECCIÓN B: Cotización (solo en PROPUESTA_EN_ELABORACION) ── */}
            {op.estado === 'PROPUESTA_EN_ELABORACION' && op.solicitudServicio && (
              <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
                <h2 className="text-sm font-semibold text-gray-700 mb-4">Cotização</h2>

                {!cotizacion ? (
                  <div>
                    <p className="text-sm text-gray-500 mb-3">Nenhuma cotização gerada ainda.</p>
                    <button
                      onClick={handleGenerarCotizacion}
                      disabled={generandoCotizacion}
                      className="bg-[#b61b24] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#9a1720] disabled:opacity-50 flex items-center gap-2 transition-colors"
                    >
                      {generandoCotizacion && (
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                      )}
                      {generandoCotizacion ? 'Calculando...' : 'Gerar cotização'}
                    </button>
                    {errorCotizacion && <p className="text-xs text-red-600 mt-2">{errorCotizacion}</p>}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Tabla de ítems */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-100">
                            <th className="text-xs font-medium text-gray-500 text-left pb-2">Resíduo</th>
                            <th className="text-xs font-medium text-gray-500 text-right pb-2">Qtd.</th>
                            <th className="text-xs font-medium text-gray-500 text-left pb-2 pl-3">Unid.</th>
                            <th className="text-xs font-medium text-gray-500 text-right pb-2">Preço sug.</th>
                            <th className="text-xs font-medium text-gray-500 text-right pb-2 pl-3">Preço final</th>
                            <th className="text-xs font-medium text-gray-500 text-left pb-2 pl-3">Ajuste</th>
                            <th className="pb-2 w-16" />
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {cotizacion.items?.map((item: any) => {
                            const ajuste = ajustesItems[item.id]
                            const precioModificado = ajuste
                              ? Number(ajuste.precioFinal) !== Number(item.precioSugerido)
                              : false
                            return (
                              <tr key={item.id}>
                                <td className="py-2.5 text-gray-700 pr-3">{item.descripcion}</td>
                                <td className="py-2.5 text-right text-gray-600">{Number(item.cantidad).toLocaleString('pt-BR')}</td>
                                <td className="py-2.5 text-gray-500 pl-3">{item.unidad}</td>
                                <td className="py-2.5 text-right text-gray-400 tabular-nums">
                                  R$ {Number(item.precioSugerido).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="py-2.5 pl-3">
                                  <input
                                    type="number"
                                    value={ajuste?.precioFinal ?? ''}
                                    onChange={(e) =>
                                      setAjustesItems((prev) => ({
                                        ...prev,
                                        [item.id]: { ...prev[item.id], precioFinal: e.target.value },
                                      }))
                                    }
                                    className="w-24 border border-blue-300 bg-blue-50/30 rounded px-2 py-1 text-sm text-right focus:outline-none focus:border-blue-400"
                                  />
                                </td>
                                <td className="py-2.5 pl-3">
                                  {precioModificado && (
                                    <input
                                      value={ajuste?.justificacion ?? ''}
                                      onChange={(e) =>
                                        setAjustesItems((prev) => ({
                                          ...prev,
                                          [item.id]: { ...prev[item.id], justificacion: e.target.value },
                                        }))
                                      }
                                      placeholder="Justificação *"
                                      className="w-full border border-orange-200 bg-orange-50/30 rounded px-2 py-1 text-xs focus:outline-none focus:border-orange-300"
                                    />
                                  )}
                                  {ajuste?.feedback && (
                                    <p className={`text-xs mt-0.5 ${ajuste.feedback.tipo === 'ok' ? 'text-green-600' : 'text-red-600'}`}>
                                      {ajuste.feedback.texto}
                                    </p>
                                  )}
                                </td>
                                <td className="py-2.5 text-right">
                                  <button
                                    onClick={() => handleGuardarAjusteItem(cotizacion.id, item.id)}
                                    disabled={ajuste?.guardando}
                                    className="text-xs text-[#b61b24] hover:underline disabled:opacity-50"
                                  >
                                    {ajuste?.guardando ? '...' : 'Guardar'}
                                  </button>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Totales */}
                    <div className="flex justify-end gap-8 pt-3 border-t border-gray-100">
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Total sugerido</p>
                        <p className="text-sm text-gray-600 tabular-nums">
                          R$ {totalSugerido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Total final</p>
                        <p className="text-sm font-semibold text-gray-800 tabular-nums">
                          R$ {totalFinalLocal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>

                    {/* Generar propuesta */}
                    {!op.propuestas?.length && (
                      <div className="pt-2 border-t border-gray-100">
                        <button
                          onClick={handleGenerarPropuesta}
                          disabled={generandoPropuesta}
                          className="bg-[#b61b24] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#9a1720] disabled:opacity-50 transition-colors"
                        >
                          {generandoPropuesta ? 'Gerando proposta...' : 'Gerar proposta'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Dados do serviço — solo en estados posteriores a EN_RECOGIDA_DE_DATOS */}
            {op.solicitudServicio && op.estado !== 'EN_RECOGIDA_DE_DATOS' && op.estado !== 'PROPUESTA_EN_ELABORACION' && (
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

              {(!op.historial || op.historial.length === 0) ? (
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

          {/* Columna lateral */}
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
                {proximoEstado && !['GANADA', 'PERDIDA', 'NO_VIABLE'].includes(op.estado) && (
                <button
                    onClick={() => handleAvanzarEstado(proximoEstado)}
                    className="w-full bg-[#b61b24] text-white rounded py-2 text-sm font-medium hover:bg-[#9a1720]"
                >
                    Avançar → {ESTADOS_LABELS[proximoEstado]}
                </button>
                )}
                {!['GANADA', 'PERDIDA', 'NO_VIABLE'].includes(op.estado) && (
                <button
                    onClick={() => setModalCierre('GANADA')}
                    className="w-full bg-green-600 text-white rounded py-2 text-sm font-medium hover:bg-green-700"
                >
                    ✓ Fechar como Ganha
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
                    onClick={() => { setMotivoCierre(''); setModalCierre('PERDIDA') }}
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
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-gray-700">Propostas</h2>
                    {!['GANADA', 'PERDIDA', 'NO_VIABLE'].includes(op.estado) && 
                    op.solicitudServicio?.cotizacion && (
                        <button
                        onClick={() => {
                            setFormPropuesta({
                            condicionesPago: 'Prazo de faturamento 30 dias',
                            validadeDias: 5,
                            nombreFirmante: usuario?.nombre || '',
                            cargoFirmante: 'Departamento Comercial',
                            observaciones: '',
                            })
                            setModalPropuesta({ id: null, numeroPropuesta: 'Nova versão' })
                        }}
                        className="text-xs text-[#b61b24] hover:underline"
                        >
                        + Nova versão
                        </button>
                    )}
                </div>
                {op.propuestas.map((p: any) => (
                <div key={p.id} className="py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-700">{p.numeroPropuesta}</p>
                        <p className="text-xs text-gray-400">v{p.version} · {p.estado}</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                        onClick={() => {
                            setFormPropuesta({
                            condicionesPago: p.condicionesPago || 'Prazo de faturamento 30 dias',
                            validadeDias: p.validadeDias || 5,
                            nombreFirmante: p.nombreFirmante || '',
                            cargoFirmante: p.cargoFirmante || '',
                            observaciones: p.observaciones || '',
                            })
                            setModalPropuesta(p)
                        }}
                        className="text-xs text-gray-400 hover:text-gray-600"
                        >
                        Editar
                        </button>
                        <button
                        onClick={async () => {
                            try {
                            const res = await api.get(`/propuestas/${p.id}/pdf`, { responseType: 'blob' })
                            const url = URL.createObjectURL(res.data)
                            window.open(url, '_blank')
                            } catch {
                            alert('Error al generar el PDF')
                            }
                        }}
                        className="text-xs text-[#b61b24] hover:underline"
                        >
                        PDF
                        </button>
                    </div>
                    </div>
                </div>
                ))}
            </div>
            )}

            {/* Orden de servicio */}
            {op.ordenServicio && (
              <div className="bg-green-50 rounded-lg border border-green-200 p-5">
                <h2 className="text-sm font-semibold text-green-800 mb-2">✓ Ordem de Serviço gerada</h2>
                <button
                  onClick={async () => {
                  try {
                    const res = await api.get(`/propuestas/ordenes/${op.ordenServicio.id}/pdf`, { responseType: 'blob' })
                    const url = URL.createObjectURL(res.data)
                    window.open(url, '_blank')
                  } catch {
                    alert('Error al generar el PDF')
                  }
                }}
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
      {modalCierre && (
        <Modal
            titulo={modalCierre === 'GANADA' ? '✓ Fechar como Ganha' : 'Registrar como Perdida'}
            onClose={() => setModalCierre(null)}
            ancho="max-w-md"
        >
            <div className="space-y-4">
            {modalCierre === 'GANADA' ? (
                <div className="bg-green-50 border border-green-200 rounded p-3">
                <p className="text-sm text-green-800">
                    Ao confirmar, a oportunidade será fechada como <strong>Ganha</strong>
                    e uma Ordem de Serviço será gerada automaticamente.
                </p>
                </div>
            ) : (
                <div className="space-y-3">
                <div className="bg-red-50 border border-red-200 rounded p-3">
                    <p className="text-sm text-red-800">
                    Informe o motivo pelo qual esta oportunidade foi perdida.
                    </p>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                    Motivo da perda *
                    </label>
                    <textarea
                    value={motivoCierre}
                    onChange={(e) => setMotivoCierre(e.target.value)}
                    rows={3}
                    placeholder="Ex: Preço acima do mercado, cliente escolheu concorrente..."
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#b61b24] resize-none"
                    />
                </div>
                </div>
            )}
            <div className="flex justify-end gap-3">
                <button
                onClick={() => setModalCierre(null)}
                className="border border-gray-300 text-gray-600 px-4 py-2 rounded text-sm hover:bg-gray-50"
                >
                Cancelar
                </button>
                <button
                onClick={handleCerrarOportunidad}
                disabled={cerrandoOportunidad}
                className={`px-4 py-2 rounded text-sm font-medium text-white disabled:opacity-50 ${
                    modalCierre === 'GANADA'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-[#b61b24] hover:bg-[#9a1720]'
                }`}
                >
                {cerrandoOportunidad
                    ? 'Processando...'
                    : modalCierre === 'GANADA'
                    ? 'Confirmar e gerar OS'
                    : 'Registrar perda'
                }
                </button>
            </div>
            </div>
        </Modal>
        )}
      {modalPropuesta && (
        <Modal 
            titulo={`Editar ${modalPropuesta.numeroPropuesta}`} 
            onClose={() => setModalPropuesta(null)} 
            ancho="max-w-lg"
        >
            <div className="space-y-4">
            <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                Condições de pagamento
                </label>
                <input
                value={formPropuesta.condicionesPago}
                onChange={(e) => setFormPropuesta({ ...formPropuesta, condicionesPago: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#b61b24]"
                />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                Validade (dias)
                </label>
                <input
                type="number"
                value={formPropuesta.validadeDias}
                onChange={(e) => setFormPropuesta({ ...formPropuesta, validadeDias: Number(e.target.value) })}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#b61b24]"
                />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                    Nome do firmante
                </label>
                <input
                    value={formPropuesta.nombreFirmante}
                    onChange={(e) => setFormPropuesta({ ...formPropuesta, nombreFirmante: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#b61b24]"
                />
                </div>
                <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                    Cargo
                </label>
                <input
                    value={formPropuesta.cargoFirmante}
                    onChange={(e) => setFormPropuesta({ ...formPropuesta, cargoFirmante: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#b61b24]"
                />
                </div>
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                Observações
                </label>
                <textarea
                value={formPropuesta.observaciones}
                onChange={(e) => setFormPropuesta({ ...formPropuesta, observaciones: e.target.value })}
                rows={3}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#b61b24] resize-none"
                />
            </div>
            <div className="flex justify-end gap-3">
                <button
                onClick={() => setModalPropuesta(null)}
                className="border border-gray-300 text-gray-600 px-4 py-2 rounded text-sm hover:bg-gray-50"
                >
                Cancelar
                </button>
                <button
                disabled={guardandoPropuesta}
                onClick={async () => {
                    setGuardandoPropuesta(true)
                    try {
                        if (modalPropuesta.id === null) {
                        // Crear propuesta nueva
                        const cotizacionId = oportunidad?.solicitudServicio?.cotizacion?.id
                        const res = await api.post('/propuestas', { cotizacionId })
                        // Actualizar con los datos del formulario
                        await api.patch(`/propuestas/${res.data.id}`, formPropuesta)
                        } else {
                        // Editar propuesta existente
                        await api.patch(`/propuestas/${modalPropuesta.id}`, formPropuesta)
                        }
                        setModalPropuesta(null)
                        cargar()
                    } catch {
                        alert('Error al guardar. Intenta de nuevo.')
                    } finally {
                        setGuardandoPropuesta(false)
                    }
                }}
                className="bg-[#b61b24] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#9a1720] disabled:opacity-50"
                >
                {guardandoPropuesta ? 'Guardando...' : 'Guardar'}
                </button>
            </div>
            </div>
        </Modal>
        )}
    </Layout>
  )
}