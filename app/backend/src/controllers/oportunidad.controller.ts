import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.middleware'
import * as oportunidadService from '../services/oportunidad.service'

export const crearOportunidad = async (req: AuthRequest, res: Response) => {
  try {
    const { leadId, clienteId, tipo, prioridad } = req.body
    if (!leadId || !clienteId) {
      return res.status(400).json({ error: 'leadId y clienteId son obligatorios' })
    }
    const oportunidad = await oportunidadService.crearOportunidad({
      leadId,
      clienteId,
      usuarioId: req.usuario!.id,
      tipo,
      prioridad
    })
    res.status(201).json(oportunidad)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}

export const obtenerPipeline = async (req: AuthRequest, res: Response) => {
  try {
    const oportunidades = await oportunidadService.obtenerPipeline()
    res.json(oportunidades)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const obtenerOportunidadPorId = async (req: AuthRequest, res: Response) => {
  try {
    const oportunidad = await oportunidadService.obtenerOportunidadPorId(req.params.id as string)
    if (!oportunidad) return res.status(404).json({ error: 'Oportunidad no encontrada' })
    res.json(oportunidad)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const avanzarEstado = async (req: AuthRequest, res: Response) => {
  try {
    const { estado, motivoPerdida } = req.body
    if (!estado) return res.status(400).json({ error: 'estado es obligatorio' })
    const oportunidad = await oportunidadService.avanzarEstado(
      req.params.id as string,
      estado,
      motivoPerdida
    )
    res.json(oportunidad)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}

export const registrarInteraccion = async (req: AuthRequest, res: Response) => {
  try {
    const { comentario, fechaProximoContacto } = req.body
    if (!comentario) return res.status(400).json({ error: 'comentario es obligatorio' })
    const interaccion = await oportunidadService.registrarInteraccion({
      oportunidadId: req.params.id as string,
      usuarioId: req.usuario!.id,
      comentario,
      fechaProximoContacto: fechaProximoContacto ? new Date(fechaProximoContacto) : undefined
    })
    res.status(201).json(interaccion)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}