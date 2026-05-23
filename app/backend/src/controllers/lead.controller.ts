import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.middleware'
import * as leadService from '../services/lead.service'

export const crearLead = async (req: AuthRequest, res: Response) => {
  try {
    const { nombreEmpresa, canalEntrada, origen, descripcionInicial, clienteId } = req.body
    if (!nombreEmpresa || !canalEntrada) {
      return res.status(400).json({ error: 'nombreEmpresa y canalEntrada son obligatorios' })
    }
    const result = await leadService.crearLead({
      usuarioId: req.usuario!.id,
      nombreEmpresa,
      canalEntrada,
      origen,
      descripcionInicial,
      clienteId
    })
    res.status(201).json(result)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}

export const obtenerLeads = async (req: AuthRequest, res: Response) => {
  try {
    const leads = await leadService.obtenerLeads()
    res.json(leads)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const obtenerLeadPorId = async (req: AuthRequest, res: Response) => {
  try {
    const lead = await leadService.obtenerLeadPorId(req.params.id as string)
    if (!lead) return res.status(404).json({ error: 'Lead no encontrado' })
    res.json(lead)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const actualizarLead = async (req: AuthRequest, res: Response) => {
  try {
    const lead = await leadService.actualizarLead(req.params.id as string, req.body)
    res.json(lead)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}