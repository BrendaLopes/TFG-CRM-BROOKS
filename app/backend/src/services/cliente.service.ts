import prisma from '../lib/prisma'

export const crearCliente = async (datos: {
  nombre: string
  documentoFiscal: string
  numeroRegistroSilc?: string
  segmento?: string
  direccion?: string
}) => {
  return prisma.cliente.create({ data: datos })
}

export const obtenerClientes = async () => {
  return prisma.cliente.findMany({
    include: { contactos: true },
    orderBy: { nombre: 'asc' }
  })
}

export const obtenerClientePorId = async (id: string) => {
  return prisma.cliente.findUnique({
    where: { id },
    include: { contactos: true, oportunidades: true }
  })
}

export const actualizarCliente = async (id: string, datos: Partial<{
  nombre: string
  documentoFiscal: string
  numeroRegistroSilc: string
  segmento: string
  direccion: string
}>) => {
  return prisma.cliente.update({ where: { id }, data: datos })
}

export const crearContacto = async (datos: {
  clienteId: string
  nombre: string
  cargo?: string
  telefono?: string
  email?: string
}) => {
  return prisma.contacto.create({ data: datos })
}