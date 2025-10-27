const swaggerAutogen = require('swagger-autogen')()

const doc = {
  info: {
    title: 'TicketsyCi API',
    description: 'Documentación TicketsyCi',
    version: '1.0.0',
  },
  host: 'localhost:4000',
  schemes: ['http'],
  consumes: ['application/json'],
  produces: ['application/json'],
}

const outputFile = './swagger_output.json'
const endpointsFiles = ['./src/app.js']

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  console.log('✅ Swagger generado')
})
