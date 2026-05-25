import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.middleware'
import * as cotizacionService from '../services/cotizacion.service'
import * as catalogoService from '../services/catalogo.service'

export const crearSolicitud = async (req: AuthRequest, res: Response) => {
  try {
    const solicitud = await cotizacionService.crearSolicitudServicio(req.body)
    res.status(201).json(solicitud)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}

export const generarCotizacion = async (req: AuthRequest, res: Response) => {
  try {
    const cotizacion = await cotizacionService.generarCotizacion(req.params.id as string)
    res.status(201).json(cotizacion)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}

export const ajustarPrecio = async (req: AuthRequest, res: Response) => {
  try {
    const { precioFinal, justificacion } = req.body
    if (!precioFinal || !justificacion) {
      return res.status(400).json({ error: 'precioFinal y justificacion son obligatorios' })
    }
    const item = await cotizacionService.ajustarPrecioItem(
      req.params.itemId as string,
      precioFinal,
      justificacion
    )
    res.json(item)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}

export const obtenerCotizacion = async (req: AuthRequest, res: Response) => {
  try {
    const cotizacion = await cotizacionService.obtenerCotizacion(req.params.id as string)
    if (!cotizacion) return res.status(404).json({ error: 'Cotización no encontrada' })
    res.json(cotizacion)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const crearResiduo = async (req: AuthRequest, res: Response) => {
  try {
    const residuo = await catalogoService.crearResiduo(req.body)
    res.status(201).json(residuo)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}

export const obtenerResiduos = async (req: AuthRequest, res: Response) => {
  try {
    const residuos = await catalogoService.obtenerResiduos()
    res.json(residuos)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const crearTarifa = async (req: AuthRequest, res: Response) => {
  try {
    const tarifa = await catalogoService.crearTarifaBase(req.body)
    res.status(201).json(tarifa)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}

export const obtenerTarifas = async (req: AuthRequest, res: Response) => {
  try {
    const tarifas = await catalogoService.obtenerTarifas()
    res.json(tarifas)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const actualizarSolicitud = async (req: AuthRequest, res: Response) => {
  try {
    const solicitud = await cotizacionService.actualizarSolicitudServicio(
      req.params.id as string,
      req.body
    )
    res.json(solicitud)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}