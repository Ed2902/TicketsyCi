const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const cors = require('cors')

const routes = require('./modules')
const { notFound } = require('./middlewares/notFound.js')
const { errorHandler } = require('./middlewares/errorHandler')

// Swagger UI (sirve /docs)
const swaggerUi = require('swagger-ui-express')
let swaggerFile = {}
try {
  swaggerFile = require('./swagger_output.json')
} catch {
  console.warn('⚠️  Falta swagger_output.json. Ejecuta: npm run swagger')
}

function createApp() {
  const app = express()

  app.use(cors())
  app.use(helmet())
  app.use(express.json())
  app.use(morgan('dev'))

  // Documentación
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerFile))

  // Prefijo REAL de la API
  app.use('/ticket', routes)

  // 404 y errores
  app.use(notFound)
  app.use(errorHandler)

  return app
}

module.exports = { createApp }
