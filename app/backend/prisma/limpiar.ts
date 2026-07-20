import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  await prisma.itemCotizacion.deleteMany({})
  await prisma.propuesta.deleteMany({})
  await prisma.cotizacion.deleteMany({})
  await prisma.itemServicioSolicitado.deleteMany({})
  await prisma.solicitudServicio.deleteMany({})
  await prisma.historialSeguimiento.deleteMany({})
  await prisma.ordenServicio.deleteMany({})
  await prisma.oportunidad.deleteMany({})
  await prisma.lead.deleteMany({})
  await prisma.contacto.deleteMany({})
  await prisma.cliente.deleteMany({})
  console.log('✅ Limpieza completa — todo borrado excepto usuarios')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
