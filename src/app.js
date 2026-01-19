// src/app.js
import express from 'express'
import morgan from 'morgan'
import helmet from 'helmet'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import swaggerUi from 'swagger-ui-express'

// Routers (solo lo trabajado)
import areasRouter from './modules/areas/routes.area.js'
import catalogRouter from './modules/Catalogos/routes.catalog.js'
import teamsRouter from './modules/teams/routes.team.js'
import ticketsRouter from './modules/Ticket/routes.ticket.js'
import chatsRouter from './modules/chats/routes.chat.js'
import notificationsRouter from './modules/notifications/routes.notification.js' // ✅ NUEVO

// Middlewares
import notFound from './middlewares/notFound.js'
import errorHandler from './middlewares/errorHandler.js'

// 🔹 Registrar modelos
import './modules/areas/model.area.js'
import './modules/teams/model.team.js'
import './modules/Catalogos/model.catalog.js'
import './modules/Ticket/model.ticket.js'
import './modules/chats/model.conversation.js'
import './modules/chats/model.message.js'
import './modules/notifications/model.notification.js'
import './modules/notifications/model.pushSubscription.js'

// Auth / CORS
import { authMiddleware } from './config/jwt.js'
import { buildCors } from './config/corsOptions.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ===============================
//   Swagger
// ===============================
let swaggerFile = {}
try {
  const p = path.join(__dirname, 'swagger_output.json')
  if (fs.existsSync(p)) {
    swaggerFile = JSON.parse(fs.readFileSync(p, 'utf8'))
  } else {
    console.warn('⚠️  Falta swagger_output.json. Ejecuta: npm run swagger')
  }
} catch {
  console.warn('⚠️  No se pudo cargar swagger_output.json.')
}

export function createApp() {
  const app = express()

  // ✅ SOLO ESTO: desactivar ETag global (evita 304)
  app.set('etag', false)

  // Middlewares base
  app.use(buildCors())
  app.use(helmet())
  app.use(express.json())
  app.use(morgan('dev'))

  // ✅ Servir uploads (para abrir adjuntos desde el front)
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

  // Swagger (SIN auth)
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerFile))

  // Prefijo global
  const API_PREFIX = '/tikets'

  // ✅ SOLO ESTO: no-cache para la API (evita caches intermedios)
  app.use(API_PREFIX, (req, res, next) => {
    res.setHeader(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate'
    )
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '0')
    res.setHeader('Surrogate-Control', 'no-store')
    next()
  })

  // Auth global
  app.use(API_PREFIX, authMiddleware)

  // Rutas trabajadas (en array)
  const rutas = [
    ['areas', areasRouter],
    ['catalog', catalogRouter],
    ['teams', teamsRouter],
    ['tickets', ticketsRouter],
    ['chats', chatsRouter],
    ['notifications', notificationsRouter],
  ]

  rutas.forEach(([nombre, router]) => {
    app.use(`${API_PREFIX}/${nombre}`, router)
  })

  // Errores
  app.use(notFound)
  app.use(errorHandler)

  return app
}

export default { createApp }
