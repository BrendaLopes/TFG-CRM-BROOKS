import { Router } from 'express'
import { verificarToken } from '../middleware/auth.middleware'
import {
  crearSolicitud, generarCotizacion, ajustarPrecio, obtenerCotizacion,
  crearResiduo, obtenerResiduos, crearTarifa, obtenerTarifas
} from '../controllers/cotizacion.controller'

const router = Router()
router.use(verificarToken)

// Catálogo
router.post('/residuos', crearResiduo)
router.get('/residuos', obtenerResiduos)
router.post('/tarifas', crearTarifa)
router.get('/tarifas', obtenerTarifas)

// Solicitud y cotización
router.post('/solicitudes', crearSolicitud)
router.post('/solicitudes/:id/cotizar', generarCotizacion)
router.get('/:id', obtenerCotizacion)
router.patch('/:id/items/:itemId/precio', ajustarPrecio)

export default router