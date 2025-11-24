import express from 'express'
import morgan from 'morgan'
import helmet from 'helmet'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import swaggerUi from 'swagger-ui-express'

import ticketsRouter from './modules/CrearTicket/router.js'
import areasRouter from './modules/CrearArea/router.js'
import routes from './modules/index.js'
import notFound from './middlewares/notFound.js'
import errorHandler from './middlewares/errorHandler.js'
import filesRouter from './modules/Files/router.js'
import teamsRouter from './modules/teams/router.js'
import NotificationsRouter from './modules/Notifications/router.js'
import messagesRouter from './modules/Messages/router.js'

// importar middleware de autenticación
import { authMiddleware } from './config/jwt.js'

// importar limitador de peticiones y opciones de CORS
import { apiLimiter } from './config/rateLimit.js'
import { buildCors } from './config/corsOptions.js'

// __dirname para ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// cargar swagger_output.json
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

  // Usa la versión personalizada de CORS según CORS_ORIGIN
  app.use(buildCors())
  app.use(helmet())
  app.use(express.json())
  app.use(morgan('dev'))

  // Documentación Swagger (fuera del prefijo protegido)
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerFile))

  // Log de diagnóstico
  app.use((req, _res, next) => {
    console.log('➡️', req.method, req.originalUrl)
    next()
  })

  // ===============================
  //   ⭐ PREFIJO GLOBAL /tikets ⭐
  // ===============================
  const API_PREFIX = '/tikets'

  // Proteger todas las rutas bajo el prefijo /tikets con autenticación y rate‑limit
  app.use(API_PREFIX, authMiddleware, apiLimiter)

  // ===============================
  //   ⭐ RUTAS CARGADAS EN ARRAY ⭐
  // ===============================
  const rutas = [
    ['messages', messagesRouter],
    ['tickets', ticketsRouter],
    ['notifications', NotificationsRouter],
    ['areas', areasRouter],
    ['files', filesRouter],
    ['teams', teamsRouter],
  ]

  rutas.forEach(([nombre, router]) => {
    app.use(`${API_PREFIX}/${nombre}`, router)
  })

  // Rutas agrupadas (index.js)
  app.use(API_PREFIX, routes)

  // middlewares de error
  app.use(notFound)
  app.use(errorHandler)

  return app
}

export default { createApp }
