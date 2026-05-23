import { Router } from 'express'
import { verificarToken } from '../middleware/auth.middleware'
import { crearCliente, obtenerClientes, obtenerClientePorId, actualizarCliente, crearContacto } from '../controllers/cliente.controller'

const router = Router()
router.use(verificarToken)

router.post('/', crearCliente)
router.get('/', obtenerClientes)
router.get('/:id', obtenerClientePorId)
router.put('/:id', actualizarCliente)
router.post('/:id/contactos', crearContacto)

export default router