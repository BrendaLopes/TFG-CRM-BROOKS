import { Router } from 'express'
import { verificarToken } from '../middleware/auth.middleware'
import { crearOportunidad, obtenerPipeline, obtenerOportunidadPorId, avanzarEstado, registrarInteraccion } from '../controllers/oportunidad.controller'

const router = Router()
router.use(verificarToken)

router.post('/', crearOportunidad)
router.get('/', obtenerPipeline)
router.get('/:id', obtenerOportunidadPorId)
router.patch('/:id/estado', avanzarEstado)
router.post('/:id/interacciones', registrarInteraccion)

export default router