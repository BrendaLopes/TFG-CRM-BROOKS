import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../lib/prisma'

export const login = async (email: string, password: string) => {
  const usuario = await prisma.usuario.findUnique({ where: { email } })
  if (!usuario) throw new Error('Credenciales inválidas')
  if (!usuario.activo) throw new Error('Usuario inactivo')

  const valid = await bcrypt.compare(password, usuario.password)
  if (!valid) throw new Error('Credenciales inválidas')

  const token = jwt.sign(
    { id: usuario.id, rol: usuario.rol },
    process.env.JWT_SECRET!,
    { expiresIn: '8h' }
  )

  return {
    token,
    usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol }
  }
}

export const crearUsuario = async (datos: {
  nombre: string
  email: string
  password: string
  rol: 'CAPTACION' | 'COMERCIAL' | 'ADMINISTRADOR'
}) => {
  const hash = await bcrypt.hash(datos.password, 10)
  return prisma.usuario.create({
    data: { ...datos, password: hash }
  })
}