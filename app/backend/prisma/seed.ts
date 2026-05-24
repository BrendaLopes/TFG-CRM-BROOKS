import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  // Usuario comercial adicional
  const hash = await bcrypt.hash('brooks123', 10)
  
  const andre = await prisma.usuario.upsert({
    where: { email: 'andre@brookscrm.com' },
    update: {},
    create: {
      nombre: 'André Toro',
      email: 'andre@brookscrm.com',
      password: hash,
      rol: 'COMERCIAL'
    }
  })

  const ana = await prisma.usuario.findUnique({ where: { email: 'ana@brookscrm.com' } })
  if (!ana) throw new Error('Usuario Ana no encontrado — ejecuta el registro primero')

  // Clientes
  const clientes = await Promise.all([
    prisma.cliente.create({ data: { nombre: 'Supermercados Rede Sul Ltda', documentoFiscal: '45.678.901/0001-23', segmento: 'Alimentício', direccion: 'Av. Beira Mar Norte, 1200 — Florianópolis/SC' } }),
    prisma.cliente.create({ data: { nombre: 'Ind. Plásticos Norte S.A.', documentoFiscal: '23.456.789/0001-11', segmento: 'Industrial', direccion: 'Rua das Indústrias, 500 — São José/SC' } }),
    prisma.cliente.create({ data: { nombre: 'Gráfica Impressão Total', documentoFiscal: '34.567.890/0001-44', segmento: 'Gráfico', direccion: 'Rua Joinville, 300 — Palhoça/SC' } }),
    prisma.cliente.create({ data: { nombre: 'Farmacêutica Horizonte', documentoFiscal: '56.789.012/0001-55', segmento: 'Farmacêutico', direccion: 'Av. Industrial, 800 — Biguaçu/SC' } }),
    prisma.cliente.create({ data: { nombre: 'Construtora Delta', documentoFiscal: '67.890.123/0001-66', segmento: 'Construção', direccion: 'Rua das Obras, 150 — Florianópolis/SC' } }),
    prisma.cliente.create({ data: { nombre: 'Auto Peças Rápido', documentoFiscal: '78.901.234/0001-77', segmento: 'Automotivo', direccion: 'BR-101, km 205 — Palhoça/SC' } }),
    prisma.cliente.create({ data: { nombre: 'OC Mecânica Faria', documentoFiscal: '89.012.345/0001-88', segmento: 'Automotivo', direccion: 'Rua Mecânica, 42 — São José/SC' } }),
    prisma.cliente.create({ data: { nombre: 'Distribuidora Orquídea', documentoFiscal: '90.123.456/0001-99', segmento: 'Distribuição', direccion: 'Av. Central, 600 — Palhoça/SC' } }),
  ])

  // Leads y oportunidades en distintos estados
  const casos = [
    { cliente: clientes[0], estado: 'CUALIFICADA', prioridad: 'ALTA', tipo: 'RECORRENTE', usuario: ana },
    { cliente: clientes[1], estado: 'CUALIFICADA', prioridad: 'MEDIA', tipo: 'RECORRENTE', usuario: andre },
    { cliente: clientes[2], estado: 'PROPUESTA_EN_ELABORACION', prioridad: 'ALTA', tipo: 'RECORRENTE', usuario: ana },
    { cliente: clientes[3], estado: 'PROPUESTA_EN_ELABORACION', prioridad: 'MEDIA', tipo: 'PONTUAL', usuario: andre },
    { cliente: clientes[4], estado: 'PROPUESTA_ENVIADA', prioridad: 'ALTA', tipo: 'RECORRENTE', usuario: ana },
    { cliente: clientes[5], estado: 'EN_NEGOCIACION', prioridad: 'ALTA', tipo: 'RECORRENTE', usuario: andre },
    { cliente: clientes[6], estado: 'LEAD', prioridad: 'BAJA', tipo: 'PONTUAL', usuario: ana },
    { cliente: clientes[7], estado: 'PERDIDA', prioridad: 'MEDIA', tipo: 'RECORRENTE', usuario: andre },
  ]

  for (const caso of casos) {
    const lead = await prisma.lead.create({
      data: {
        usuarioId: caso.usuario.id,
        clienteId: caso.cliente.id,
        nombreEmpresa: caso.cliente.nombre,
        canalEntrada: ['WHATSAPP', 'TELEFONO', 'WEB', 'INDICACION'][Math.floor(Math.random() * 4)] as any,
        descripcionInicial: 'Lead gerado via seed de dados de teste'
      }
    })

    await prisma.oportunidad.create({
      data: {
        leadId: lead.id,
        clienteId: caso.cliente.id,
        usuarioId: caso.usuario.id,
        estado: caso.estado as any,
        tipo: caso.tipo as any,
        prioridad: caso.prioridad as any,
        motivoPerdida: caso.estado === 'PERDIDA' ? 'Preço acima do mercado' : null,
        fechaCierre: caso.estado === 'PERDIDA' ? new Date() : null
      }
    })
  }

  console.log('✅ Seed completado — 8 oportunidades creadas en distintos estados')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())