import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.routes'
import leadRoutes from './routes/lead.routes'
import clienteRoutes from './routes/cliente.routes'
import oportunidadRoutes from './routes/oportunidad.routes' 

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Brooks CRM API running' })
})


// Rutas
app.use('/api/auth', authRoutes)
app.use('/api/leads', leadRoutes)
app.use('/api/clientes', clienteRoutes)
app.use('/api/oportunidades', oportunidadRoutes)

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})

export default app