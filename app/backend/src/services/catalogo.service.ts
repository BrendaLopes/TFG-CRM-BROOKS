import prisma from '../lib/prisma'

export const crearResiduo = async (datos: {
  codigoInterno: string
  codigoIbama?: string
  nombre: string
  grupo?: string
  clase: 'CLASE_I' | 'CLASE_IIA' | 'CLASE_IIB'
}) => {
  return prisma.residuo.create({ data: datos })
}

export const obtenerResiduos = async () => {
  return prisma.residuo.findMany({
    where: { activo: true },
    include: { tarifasBase: { where: { activa: true } } },
    orderBy: { nombre: 'asc' }
  })
}

export const crearTarifaBase = async (datos: {
  residuoId: string
  categoria: string
  destinoFinal: string
  unidadMedida: 'KG' | 'M3' | 'UNIDAD' | 'CONTENEDOR'
  precioUnitario: number
  franquiciaMinima?: number
  precioExcedente?: number
}) => {
  return prisma.tarifaBase.create({ data: datos })
}

export const obtenerTarifas = async () => {
  return prisma.tarifaBase.findMany({
    where: { activa: true },
    include: { residuo: true },
    orderBy: { residuo: { nombre: 'asc' } }
  })
}

export const buscarTarifa = async (
  residuoId: string,
  destinoFinal: string,
  unidadMedida: string
) => {
  return prisma.tarifaBase.findFirst({
    where: { residuoId, destinoFinal, unidadMedida: unidadMedida as any, activa: true }
  })
}