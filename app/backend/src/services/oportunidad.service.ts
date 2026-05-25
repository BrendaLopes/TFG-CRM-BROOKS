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
  responsavel?: string
  contacto?: { nombre?: string; telefone?: string; email?: string }
  notasQualificacao?: string
  criteriosViabilidade?: string
}) => {
  const ops: Promise<any>[] = []

  // Actualizar lead (nombre, canal)
  if (datos.nombre || datos.canal) {
    const oportunidad = await prisma.oportunidad.findUnique({
      where: { id }, select: { leadId: true }
    })
    if (oportunidad?.leadId) {
      ops.push(prisma.lead.update({
        where: { id: oportunidad.leadId },
        data: {
          ...(datos.nombre && { nombreEmpresa: datos.nombre }),
          ...(datos.canal && { canalEntrada: datos.canal as any }),
        }
      }))
    }
  }

  // Actualizar cliente (empresa)
  if (datos.empresa) {
    const oportunidad = await prisma.oportunidad.findUnique({
      where: { id }, select: { clienteId: true }
    })
    if (oportunidad?.clienteId) {
      ops.push(prisma.cliente.update({
        where: { id: oportunidad.clienteId },
        data: { nombre: datos.empresa }
      }))
    }
  }

  // Actualizar contacto principal
  if (datos.contacto) {
    const oportunidad = await prisma.oportunidad.findUnique({
      where: { id }, select: { clienteId: true }
    })
    if (oportunidad?.clienteId) {
      const contactoExistente = await prisma.contacto.findFirst({
        where: { clienteId: oportunidad.clienteId }
      })
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

  // Actualizar oportunidad (notas, criterios)
  const dataOp: any = {}
  if (datos.notasQualificacao !== undefined) dataOp.notasQualificacao = datos.notasQualificacao
  if (datos.criteriosViabilidade !== undefined) dataOp.criteriosViabilidade = datos.criteriosViabilidade

  if (Object.keys(dataOp).length > 0) {
    ops.push(prisma.oportunidad.update({ where: { id }, data: dataOp }))
  }

  await Promise.all(ops)

  // Devolver oportunidad actualizada completa
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
