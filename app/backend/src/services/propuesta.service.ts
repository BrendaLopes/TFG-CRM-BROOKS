import prisma from '../lib/prisma'

export const generarPropuesta = async (cotizacionId: string, usuarioId: string) => {
  const cotizacion = await prisma.cotizacion.findUnique({
    where: { id: cotizacionId },
    include: {
      solicitud: { include: { oportunidad: { include: { cliente: true } } } },
      items: { include: { tarifaBase: true } }
    }
  })
  if (!cotizacion) throw new Error('Cotización no encontrada')

  const oportunidad = cotizacion.solicitud.oportunidad
  const contadorPropuestas = await prisma.propuesta.count({
    where: { oportunidadId: oportunidad.id }
  })
  const version = contadorPropuestas + 1
  const numero = `PB${String(version).padStart(4, '0')}/${new Date().getFullYear().toString().slice(2)}`

  return prisma.propuesta.create({
    data: {
      oportunidadId: oportunidad.id,
      cotizacionId,
      usuarioId,
      numeroPropuesta: numero,
      version,
      estado: 'BORRADOR',
      condicionesPago: 'Prazo de faturamento 30 dias',
      validadeDias: 5
    },
    include: {
      oportunidad: { include: { cliente: { include: { contactos: true } } } },
      cotizacion: { include: { items: { include: { tarifaBase: true } } } },
      usuario: { select: { nombre: true, email: true } }
    }
  })
}

export const enviarPropuesta = async (propuestaId: string) => {
  const propuesta = await prisma.propuesta.update({
    where: { id: propuestaId },
    data: { estado: 'ENVIADA', fechaEnvio: new Date() }
  })
  await prisma.oportunidad.update({
    where: { id: propuesta.oportunidadId },
    data: { estado: 'PROPUESTA_ENVIADA' }
  })
  return propuesta
}

export const obtenerPropuesta = async (id: string) => {
  return prisma.propuesta.findUnique({
    where: { id },
    include: {
      oportunidad: { 
        include: { 
          cliente: { include: { contactos: true } } 
        } 
      },
      cotizacion: {
        include: {
          items: { 
            include: { 
              tarifaBase: { include: { residuo: true } } 
            } 
          },
          solicitud: true
        }
      },
      usuario: { select: { nombre: true, email: true } }
    }
  })
}

export const listarPropuestas = async (oportunidadId: string) => {
  return prisma.propuesta.findMany({
    where: { oportunidadId },
    orderBy: { version: 'desc' }
  })
}