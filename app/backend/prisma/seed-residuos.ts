import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const residuos = [
    { codigoInterno: 'RS-001', codigoIbama: '20 01 99', nombre: 'Resíduo Comum', grupo: 'RESÍDUO COMUM', clase: 'CLASE_IIA' },
    { codigoInterno: 'RS-002', codigoIbama: '13 02 01', nombre: 'Óleo Lubrificante Usado', grupo: 'RESÍDUO DE ÓLEO', clase: 'CLASE_I' },
    { codigoInterno: 'RS-003', codigoIbama: '20 01 21', nombre: 'Lâmpada Fluorescente', grupo: 'LÂMPADAS FLUORESCENTES', clase: 'CLASE_I' },
    { codigoInterno: 'RS-004', codigoIbama: '15 01 02', nombre: 'Embalagens Plásticas', grupo: 'RECICLÁVEIS', clase: 'CLASE_IIB' },
    { codigoInterno: 'RS-005', codigoIbama: '16 06 01', nombre: 'Baterias Automotivas', grupo: 'PILHAS E BATERIAS', clase: 'CLASE_I' },
    { codigoInterno: 'RS-006', codigoIbama: '20 01 40', nombre: 'Sucata de Ferro', grupo: 'RECICLÁVEIS', clase: 'CLASE_IIB' },
    { codigoInterno: 'RS-007', codigoIbama: '19 08 12', nombre: 'Lodo de ETE Biológico', grupo: 'LODO', clase: 'CLASE_IIA' },
    { codigoInterno: 'RS-008', codigoIbama: '15 01 01', nombre: 'Papelão', grupo: 'RECICLÁVEIS', clase: 'CLASE_IIA' },
  ]

  for (const r of residuos) {
    const existente = await prisma.residuo.findFirst({
      where: { codigoInterno: r.codigoInterno }
    })
    if (existente) {
      console.log(`Ya existe: ${r.nombre}`)
      continue
    }

    const residuo = await prisma.residuo.create({
      data: { ...r, clase: r.clase as any }
    })

    await prisma.tarifaBase.create({
      data: {
        residuoId: residuo.id,
        categoria: r.grupo,
        destinoFinal: 'DESTINO_PADRAO',
        unidadMedida: 'KG',
        precioUnitario: Math.random() * 2 + 0.5,
        franquiciaMinima: 100,
        precioExcedente: Math.random() * 1.5 + 0.3,
      }
    })
    console.log(`✅ ${r.nombre}`)
  }

  console.log('✅ Seed completado')
}

main().catch(console.error).finally(() => prisma.$disconnect())
