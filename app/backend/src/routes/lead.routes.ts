import { Router } from 'express'
import { verificarToken } from '../middleware/auth.middleware'
import { crearLead, obtenerLeads, obtenerLeadPorId, actualizarLead } from '../controllers/lead.controller'

const router = Router()

router.use(verificarToken)

router.post('/', crearLead)
router.get('/', obtenerLeads)
router.get('/:id', obtenerLeadPorId)
router.put('/:id', actualizarLead)

export default router