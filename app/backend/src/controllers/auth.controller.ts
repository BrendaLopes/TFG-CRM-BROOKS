import { Request, Response } from 'express'
import * as authService from '../services/auth.service'

export const loginController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email y password requeridos' })
    const result = await authService.login(email, password)
    res.json(result)
  } catch (error: any) {
    res.status(401).json({ error: error.message })
  }
}

export const registrarController = async (req: Request, res: Response) => {
  try {
    const { nombre, email, password, rol } = req.body
    const usuario = await authService.crearUsuario({ nombre, email, password, rol })
    res.status(201).json({ id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}