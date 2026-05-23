import prisma from '../lib/prisma'

export const crearLead = async (datos: {
  usuarioId: string
  nombreEmpresa: string
  canalEntrada: 'TELEFONO' | 'WHATSAPP' | 'WEB' | 'INDICACION'
  origen?: string
  descripcionInicial?: string
  clienteId?: string
}) => {
  // Verificar duplicado por nombre de empresa
  const existente = await prisma.lead.findFirst({
    where: { nombreEmpresa: { contains: datos.nombreEmpresa, mode: 'insensitive' } }
  })

  const lead = await prisma.lead.create({ data: datos })

  return { lead, posibleDuplicado: !!existente }
}

export const obtenerLeads = async () => {
  return prisma.lead.findMany({
    include: { usuario: { select: { nombre: true } }, cliente: true },
    orderBy: { fechaCreacion: 'desc' }
  })
}

export const obtenerLeadPorId = async (id: string) => {
  return prisma.lead.findUnique({
    where: { id },
    include: { usuario: { select: { nombre: true } }, cliente: true, oportunidad: true }
  })
}

export const actualizarLead = async (id: string, datos: Partial<{
  nombreEmpresa: string
  canalEntrada: 'TELEFONO' | 'WHATSAPP' | 'WEB' | 'INDICACION'
  origen: string
  descripcionInicial: string
  clienteId: string
}>) => {
  return prisma.lead.update({ where: { id }, data: datos })
}