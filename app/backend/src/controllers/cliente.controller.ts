import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.middleware'
import * as clienteService from '../services/cliente.service'

export const crearCliente = async (req: AuthRequest, res: Response) => {
  try {
    const cliente = await clienteService.crearCliente(req.body)
    res.status(201).json(cliente)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}

export const obtenerClientes = async (req: AuthRequest, res: Response) => {
  try {
    const clientes = await clienteService.obtenerClientes()
    res.json(clientes)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const obtenerClientePorId = async (req: AuthRequest, res: Response) => {
  try {
    const cliente = await clienteService.obtenerClientePorId(req.params.id as string)
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' })
    res.json(cliente)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const actualizarCliente = async (req: AuthRequest, res: Response) => {
  try {
    const cliente = await clienteService.actualizarCliente(req.params.id as string, req.body)
    res.json(cliente)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}

export const crearContacto = async (req: AuthRequest, res: Response) => {
  try {
    const contacto = await clienteService.crearContacto({
      clienteId: req.params.id as string,
      ...req.body
    })
    res.status(201).json(contacto)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}