import prisma from '../lib/prisma'

export const crearOportunidad = async (datos: {
  leadId: string
  clienteId: string
  usuarioId: string
  tipo?: 'RECORRENTE' | 'PONTUAL'
  prioridad?: 'ALTA' | 'MEDIA' | 'BAJA'
}) => {
  return prisma.oportunidad.create({
    data: { ...datos, estado: 'LEAD' },
    include: { lead: true, cliente: true, usuario: { select: { nombre: true } } }
  })
}

export const obtenerPipeline = async () => {
  return prisma.oportunidad.findMany({
    include: {
      lead: true,
      cliente: true,
      usuario: { select: { nombre: true } },
      propuestas: { orderBy: { version: 'desc' }, take: 1 }
    },
    orderBy: { fechaCreacion: 'desc' }
  })
}

export const obtenerOportunidadPorId = async (id: string) => {
  return prisma.oportunidad.findUnique({
    where: { id },
    include: {
      lead: true,
      cliente: { include: { contactos: true } },
      usuario: { select: { nombre: true } },
      historial: { orderBy: { fecha: 'desc' } },
      solicitudServicio: { include: { items: { include: { residuo: true } } } },
      propuestas: { orderBy: { version: 'desc' } },
      ordenServicio: true
    }
  })
}

export const avanzarEstado = async (
  id: string,
  estado: string,
  motivoPerdida?: string
) => {
  return prisma.oportunidad.update({
    where: { id },
    data: {
      estado: estado as any,
      motivoPerdida: motivoPerdida || null,
      fechaCierre: ['GANADA', 'PERDIDA', 'NO_VIABLE'].includes(estado)
        ? new Date()
        : null
    }
  })
}

export const registrarInteraccion = async (datos: {
  oportunidadId: string
  usuarioId: string
  comentario: string
  fechaProximoContacto?: Date
}) => {
  return prisma.historialSeguimiento.create({ data: datos })
}