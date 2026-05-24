import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.middleware'
import * as propuestaService from '../services/propuesta.service'
import * as ordenService from '../services/ordenservicio.service'
import { generarPDFPropuesta, generarPDFOrdenServicio } from '../services/pdf.service'

export const crearPropuesta = async (req: AuthRequest, res: Response) => {
  try {
    const { cotizacionId } = req.body
    if (!cotizacionId) return res.status(400).json({ error: 'cotizacionId requerido' })
    const propuesta = await propuestaService.generarPropuesta(cotizacionId, req.usuario!.id)
    res.status(201).json(propuesta)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}

export const enviarPropuesta = async (req: AuthRequest, res: Response) => {
  try {
    const propuesta = await propuestaService.enviarPropuesta(req.params.id as string)
    res.json(propuesta)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}

export const obtenerPropuesta = async (req: AuthRequest, res: Response) => {
  try {
    const propuesta = await propuestaService.obtenerPropuesta(req.params.id as string)
    if (!propuesta) return res.status(404).json({ error: 'Propuesta no encontrada' })
    res.json(propuesta)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const exportarPropuestaPDF = async (req: AuthRequest, res: Response) => {
  try {
    const propuesta = await propuestaService.obtenerPropuesta(req.params.id as string)
    if (!propuesta) return res.status(404).json({ error: 'Propuesta no encontrada' })
    const pdf = await generarPDFPropuesta(propuesta)
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="proposta-${propuesta.numeroPropuesta}.pdf"`)
    res.send(pdf)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const cerrarOportunidad = async (req: AuthRequest, res: Response) => {
  try {
    const { estado, motivoPerdida } = req.body
    const oportunidadId = req.params.id as string

    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()

    await prisma.oportunidad.update({
      where: { id: oportunidadId },
      data: {
        estado,
        motivoPerdida: motivoPerdida || null,
        fechaCierre: new Date()
      }
    })

    if (estado === 'GANADA') {
      const orden = await ordenService.generarOrdenServicio(oportunidadId)
      return res.json({ mensaje: 'Oportunidad cerrada como ganada', ordenServicio: orden })
    }

    res.json({ mensaje: `Oportunidad cerrada como ${estado}` })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}

export const exportarOrdenServicioPDF = async (req: AuthRequest, res: Response) => {
  try {
    const orden = await ordenService.obtenerOrdenServicio(req.params.id as string)
    if (!orden) return res.status(404).json({ error: 'Orden no encontrada' })
    const pdf = await generarPDFOrdenServicio(orden)
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="ordem-servico-${orden.id.slice(0, 8)}.pdf"`)
    res.send(pdf)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}