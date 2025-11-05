// librerias 
import express from 'express'
import morgan from 'morgan'
import helmet from 'helmet'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import swaggerUi from 'swagger-ui-express'


// importar modulos para llamar rutas jeje 
import ticketsRouter from './modules/CrearTicket/router.js'
import areasRouter from './modules/CrearArea/router.js'
import routes from './modules/index.js'
import notFound from './middlewares/notFound.js'
import errorHandler from './middlewares/errorHandler.js'
import filesRouter from './modules/Files/router.js'
import teamsRouter from './modules/teams/router.js'
import NotificationsRouter from './modules/Notifications/router.js'
import messagesRouter from './modules/Messages/router.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let swaggerFile = {}
try {
  const p = path.join(__dirname, 'swagger_output.json')
  if (fs.existsSync(p)) swaggerFile = JSON.parse(fs.readFileSync(p, 'utf8'))
  else console.warn('⚠️  Falta swagger_output.json. Ejecuta: npm run swagger')
} catch { console.warn('⚠️  No se pudo cargar swagger_output.json.') }

export function createApp() {
  const app = express()

  app.use(cors())
  app.use(helmet())
  app.use(express.json())
  app.use(morgan('dev'))

  // log de diagnóstico


  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerFile))
  app.use((req, _res, next) => { console.log('➡️', req.method, req.originalUrl); next() })
  
  // mensajes
  app.use('/api/messages', messagesRouter);

  //  Rutas para crear ticket 
  app.use('/api/tickets', ticketsRouter);

  //notificaciones
  app.use('/api/notifications', NotificationsRouter);

  // Ruta para crear area 
  app.use('/api/areas', areasRouter);

  // ruta pra meter files
  app.use('/api/files', filesRouter);

  // api para los equipos- crear equipos
  app.use('/api/teams', teamsRouter);

  app.use('/api', routes);

  app.use(notFound)
  app.use(errorHandler)

  return app
}

export default { createApp }
