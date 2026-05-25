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
export const actualizarOportunidad = async (id: string, datos: {
  nombre?: string
  empresa?: string
  canal?: string
  contacto?: { nombre?: string; telefone?: string; email?: string }
  prioridad?: 'ALTA' | 'MEDIA' | 'BAJA'
  motivoNoViable?: string
}) => {
  const ops: Promise<any>[] = []

  if (datos.nombre || datos.canal) {
    const op = await prisma.oportunidad.findUnique({ where: { id }, select: { leadId: true } })
    if (op?.leadId) {
      ops.push(prisma.lead.update({
        where: { id: op.leadId },
        data: {
          ...(datos.nombre && { nombreEmpresa: datos.nombre }),
          ...(datos.canal && { canalEntrada: datos.canal as any }),
        }
      }))
    }
  }

  if (datos.empresa) {
    const op = await prisma.oportunidad.findUnique({ where: { id }, select: { clienteId: true } })
    if (op?.clienteId) {
      ops.push(prisma.cliente.update({ where: { id: op.clienteId }, data: { nombre: datos.empresa } }))
    }
  }

  if (datos.contacto) {
    const op = await prisma.oportunidad.findUnique({ where: { id }, select: { clienteId: true } })
    if (op?.clienteId) {
      const contactoExistente = await prisma.contacto.findFirst({ where: { clienteId: op.clienteId } })
      if (contactoExistente) {
        ops.push(prisma.contacto.update({
          where: { id: contactoExistente.id },
          data: {
            ...(datos.contacto.nombre && { nombre: datos.contacto.nombre }),
            ...(datos.contacto.telefone && { telefono: datos.contacto.telefone }),
            ...(datos.contacto.email && { email: datos.contacto.email }),
          }
        }))
      }
    }
  }

  const dataOp: any = {}
  if (datos.prioridad) dataOp.prioridad = datos.prioridad
  if (datos.motivoNoViable !== undefined) dataOp.motivoNoViable = datos.motivoNoViable
  if (Object.keys(dataOp).length > 0) {
    ops.push(prisma.oportunidad.update({ where: { id }, data: dataOp }))
  }

  await Promise.all(ops)

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
