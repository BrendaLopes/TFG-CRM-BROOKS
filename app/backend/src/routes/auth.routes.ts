import { Router } from 'express'
import { loginController, registrarController } from '../controllers/auth.controller'

const router = Router()

router.post('/login', loginController)
router.post('/registrar', registrarController)

export default router