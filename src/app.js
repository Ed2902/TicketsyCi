// src/app.js
import express from 'express'
import morgan from 'morgan'
import helmet from 'helmet'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import routes from './modules/index.js'
import areasRouter from './modules/CrearArea/router.js'
import notFound from './middlewares/notFound.js'
import errorHandler from './middlewares/errorHandler.js'

// Swagger UI (sirve /docs)
import swaggerUi from 'swagger-ui-express'
import { Ticket } from './modules/CrearTicket/model.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let swaggerFile = {}
try {
  const p = path.join(__dirname, 'swagger_output.json')
  if (fs.existsSync(p)) {
    const raw = fs.readFileSync(p, 'utf8')
    swaggerFile = JSON.parse(raw)
  } else {
    console.warn('⚠️  Falta swagger_output.json. Ejecuta: npm run swagger')
  }
} catch {
  console.warn('⚠️  No se pudo cargar swagger_output.json. Ejecuta: npm run swagger')
}

export function createApp() {
  const app = express()

  // 🧩 MIDDLEWARES BÁSICOS
  app.use(cors())
  app.use(helmet())
  app.use(express.json())
  app.use(morgan('dev'))

  // Documentación Swagger
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerFile))

  // Prefijos de API
  app.use('/api', routes)            // otros módulos que agrupes en index.js
  app.use('/api/areas', areasRouter) // módulo de Áreas

  // === Endpoint para CREAR Ticket ===
  app.post('/api/tickets', async (req, res, next) => {
    try {
      const { title, description, priority, category, assignee } = req.body || {}

      const orgId = req.header('x-org-id') || 'impresistem'
      const createdBy = req.header('x-principal-id') || 'usr_luis_puentes'

      if (!title || !description) {
        return res.status(400).json({
          error: true,
          message: 'Campos requeridos: title y description'
        })
      }

      // Fallback si no viene assignee
      const finalAssignee = assignee && assignee.type && assignee.id
        ? assignee
        : { type: 'person', id: createdBy, name: undefined }

      const ticket = await Ticket.create({
        orgId,
        title,
        description,
        priority,
        category,
        assignee: finalAssignee,
        createdBy
      })

      return res.status(201).json(ticket)
    } catch (error) {
      console.error('❌ Error creando ticket:', error)
      next(error)
    }
  })

  // 404 y errores
  app.use(notFound)
  app.use(errorHandler)

  return app
}

export default { createApp }
