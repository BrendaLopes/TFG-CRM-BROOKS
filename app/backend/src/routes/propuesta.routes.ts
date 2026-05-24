import { Router } from 'express'
import { verificarToken } from '../middleware/auth.middleware'
import {
  crearPropuesta, enviarPropuesta, obtenerPropuesta,
  exportarPropuestaPDF, cerrarOportunidad, exportarOrdenServicioPDF
} from '../controllers/propuesta.controller'

const router = Router()
router.use(verificarToken)

router.post('/', crearPropuesta)
router.get('/:id', obtenerPropuesta)
router.patch('/:id/enviar', enviarPropuesta)
router.get('/:id/pdf', exportarPropuestaPDF)
router.patch('/oportunidades/:id/cerrar', cerrarOportunidad)
router.get('/ordenes/:id/pdf', exportarOrdenServicioPDF)

export default router