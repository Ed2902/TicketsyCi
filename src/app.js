import express from 'express'
import morgan from 'morgan'
import helmet from 'helmet'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import swaggerUi from 'swagger-ui-express'
import webpush from "web-push"
import ticketsRouter from './modules/CrearTicket/router.js'
import areasRouter from './modules/CrearArea/router.js'
import routes from './modules/index.js'
import notFound from './middlewares/notFound.js'
import errorHandler from './middlewares/errorHandler.js'
import filesRouter from './modules/Files/router.js'
import teamsRouter from './modules/teams/router.js'
import NotificationsRouter from './modules/Notifications/router.js'
import messagesRouter from './modules/Messages/router.js'
import pushRouter from './alertas/push.routes.js'

// importar middleware de autenticación
import { authMiddleware } from './config/jwt.js'

// __dirname para ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


// Configuración inidial de notificaciones, esto es el web-push edwin 

webpush.setVapidDetails(
  "mailto:soporte@tusistema.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

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

app.use(
  cors({
    origin: 'http://localhost:5173', // tu frontend
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-org-id',
      'x-principal-id',
    ],
  })
)
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

  // Proteger todas las rutas bajo el prefijo /tikets
  app.use(API_PREFIX, authMiddleware)

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
    ['push', pushRouter]
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
