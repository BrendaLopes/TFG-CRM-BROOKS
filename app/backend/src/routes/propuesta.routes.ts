import { Router } from 'express'
import { verificarToken } from '../middleware/auth.middleware'
import {
  crearPropuesta, actualizarPropuesta, enviarPropuesta, obtenerPropuesta,
  exportarPropuestaPDF, cerrarOportunidad, exportarOrdenServicioPDF
} from '../controllers/propuesta.controller'

const router = Router()
router.use(verificarToken)

// Rutas fijas primero — antes de /:id
router.patch('/oportunidades/:id/cerrar', cerrarOportunidad)
router.get('/ordenes/:id/pdf', exportarOrdenServicioPDF)

// Rutas con parámetro
router.post('/', crearPropuesta)
router.get('/:id', obtenerPropuesta)
router.patch('/:id/enviar', enviarPropuesta)
router.patch('/:id', actualizarPropuesta)
router.get('/:id/pdf', exportarPropuestaPDF)

export default router