import prisma from '../lib/prisma'
import { buscarTarifa } from './catalogo.service'

export const crearSolicitudServicio = async (datos: {
  oportunidadId: string
  tipoServicio: string
  frecuenciaServicio: string
  direccionServicio: string
  restriccionesHorario?: string
  observaciones?: string
  requiereFichaSeguridad?: boolean
  accesoVehiculo?: boolean
  items: Array<{
    residuoId: string
    cantidadEstimada: number
    unidadMedida: 'KG' | 'M3' | 'UNIDAD' | 'CONTENEDOR'
    acondicionamiento?: string
    descripcionDetallada?: string
  }>
}) => {
  const { items, ...datosSolicitud } = datos
  return prisma.solicitudServicio.create({
    data: {
      ...datosSolicitud,
      items: { create: items }
    },
    include: { items: { include: { residuo: true } } }
  })
}

export const generarCotizacion = async (solicitudId: string) => {
  // Obtener solicitud con items
  const solicitud = await prisma.solicitudServicio.findUnique({
    where: { id: solicitudId },
    include: { items: { include: { residuo: true } } }
  })
  if (!solicitud) throw new Error('Solicitud no encontrada')

    // Si ya existe cotización para esta solicitud → borrarla antes de regenerar
    const cotizacionExistente = await prisma.cotizacion.findUnique({
      where: { solicitudId },
     include: { items: true }
    })
    if (cotizacionExistente) {
        await prisma.itemCotizacion.deleteMany({ where: { cotizacionId: cotizacionExistente.id } })
        await prisma.cotizacion.delete({ where: { id: cotizacionExistente.id } })
    }

  // Calcular items de cotización
  const itemsCotizacion = []
  let totalSugerido = 0

  for (const item of solicitud.items) {
    const tarifa = await buscarTarifa(
      item.residuoId,
      'DESTINO_PADRAO',
      item.unidadMedida
    )

    if (tarifa) {
      const cantidad = Number(item.cantidadEstimada)
      const franquicia = Number(tarifa.franquiciaMinima)
      const precioUnitario = Number(tarifa.precioUnitario)

      let subtotal = precioUnitario * cantidad

      // Aplica excedente si supera franquicia mínima
      if (franquicia > 0 && cantidad > franquicia && tarifa.precioExcedente) {
        const excedente = cantidad - franquicia
        subtotal = precioUnitario * franquicia + Number(tarifa.precioExcedente) * excedente
      }

      totalSugerido += subtotal

      itemsCotizacion.push({
        tarifaBaseId: tarifa.id,
        itemServicioId: item.id,
        descripcion: item.residuo.nombre,
        cantidad: item.cantidadEstimada,
        unidad: item.unidadMedida,
        precioSugerido: precioUnitario,
        precioFinal: precioUnitario,
        subtotal,
        franquicia,
        ajusteManual: false
      })
    } else {
      // Sin tarifa — marca como pendiente de precio manual
      itemsCotizacion.push({
        tarifaBaseId: null,
        itemServicioId: item.id,
        descripcion: item.residuo.nombre,
        cantidad: item.cantidadEstimada,
        unidad: item.unidadMedida,
        precioSugerido: 0,
        precioFinal: 0,
        subtotal: 0,
        franquicia: 0,
        ajusteManual: true,
        justificacionAjuste: 'Sin tarifa base configurada — precio manual requerido'
      })
    }
  }

  // Crear cotización con items
  const cotizacion = await prisma.cotizacion.create({
    data: {
      solicitudId,
      totalSugerido,
      totalFinal: totalSugerido,
      items: { create: itemsCotizacion }
    },
    include: { items: { include: { tarifaBase: true } } }
  })

  // Avanzar estado oportunidad
  await prisma.oportunidad.update({
    where: { id: solicitud.oportunidadId },
    data: { estado: 'PROPUESTA_EN_ELABORACION' }
  })

  return cotizacion
}

export const ajustarPrecioItem = async (
  itemId: string,
  precioFinal: number,
  justificacion: string
) => {
  const item = await prisma.itemCotizacion.update({
    where: { id: itemId },
    data: {
      precioFinal,
      ajusteManual: true,
      justificacionAjuste: justificacion,
      subtotal: precioFinal
    }
  })

  // Recalcular total de la cotización
  const todosItems = await prisma.itemCotizacion.findMany({
    where: { cotizacionId: item.cotizacionId }
  })
  const nuevoTotal = todosItems.reduce((sum, i) => sum + Number(i.subtotal), 0)

  await prisma.cotizacion.update({
    where: { id: item.cotizacionId },
    data: { totalFinal: nuevoTotal }
  })

  return item
}

export const obtenerCotizacion = async (id: string) => {
  return prisma.cotizacion.findUnique({
    where: { id },
    include: {
      items: { include: { tarifaBase: true, itemServicio: { include: { residuo: true } } } },
      solicitud: true
    }
  })
}

export const actualizarSolicitudServicio = async (id: string, datos: {
  tipoServicio?: string
  frecuenciaServicio?: string
  direccionServicio?: string
  restriccionesHorario?: string
  observaciones?: string
  items?: Array<{
    residuoId: string
    cantidadEstimada: number
    unidadMedida: string
    descripcionDetallada?: string
  }>
}) => {
  const { items, ...datosSolicitud } = datos

  // Actualizar datos básicos
  await prisma.solicitudServicio.update({
    where: { id },
    data: datosSolicitud
  })

  // Si hay items → borrar los anteriores y crear los nuevos
  if (items) {
    await prisma.itemServicioSolicitado.deleteMany({ where: { solicitudId: id } })
    await prisma.itemServicioSolicitado.createMany({
      data: items.map(i => ({ ...i, solicitudId: id, unidadMedida: i.unidadMedida as any }))
    })
  }

  return prisma.solicitudServicio.findUnique({
    where: { id },
    include: { items: { include: { residuo: true } } }
  })
}