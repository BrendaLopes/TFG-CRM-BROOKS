import prisma from '../lib/prisma'

export const generarOrdenServicio = async (oportunidadId: string) => {
  const oportunidad = await prisma.oportunidad.findUnique({
    where: { id: oportunidadId },
    include: {
      cliente: true,
      solicitudServicio: true,
      propuestas: { orderBy: { version: 'desc' }, take: 1 }
    }
  })
  if (!oportunidad) throw new Error('Oportunidad no encontrada')
  if (!oportunidad.solicitudServicio) throw new Error('Sin solicitud de servicio')

  const solicitud = oportunidad.solicitudServicio

  return prisma.ordenServicio.create({
    data: {
      oportunidadId,
      tipoServicio: solicitud.tipoServicio,
      documentoFiscal: oportunidad.cliente.documentoFiscal,
      frecuenciaServicio: solicitud.frecuenciaServicio,
      direccionServicio: solicitud.direccionServicio,
      observaciones: solicitud.observaciones,
      unidadeOperacional: 'Filial Palhoça'
    },
    include: {
      oportunidad: {
        include: {
          cliente: true,
          propuestas: { orderBy: { version: 'desc' }, take: 1 }
        }
      }
    }
  })
}

export const obtenerOrdenServicio = async (id: string) => {
  return prisma.ordenServicio.findUnique({
    where: { id },
    include: {
      oportunidad: { include: { cliente: true, propuestas: true } }
    }
  })
}