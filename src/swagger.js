import swaggerAutogen from 'swagger-autogen'

const doc = {
  info: {
    title: 'TicketsyCi API',
    description: 'Documentación TicketsyCi',
    version: '1.0.0',
  },

  host: 'localhost:4000',
  basePath: '/tikets',

  schemes: ['http'],
  consumes: ['application/json'],
  produces: ['application/json'],

  // ======================================================
  // ⭐ ESQUEMA DE SEGURIDAD PARA JWT
  // ======================================================
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
      description: 'Introduce un token JWT en formato Bearer <token>',
    },
  },
  // Aplica el esquema a todos los endpoints
  security: [
    {
      bearerAuth: [],
    },
  ],

  // ======================================================
  // ⭐ DEFINICIONES COMPLETAS (MODELOS Swagger)
  // ======================================================
  definitions: {
    Area: {
      _id: 'string',
      orgId: { type: 'string', enum: ['fastway', 'metalharvest', 'greenway'] },
      name: 'string',
      description: 'string',
      active: true,
      createdBy: 'string',
      createdAt: '2025-01-01T12:00:00Z',
      updatedAt: '2025-01-01T12:00:00Z',
    },

    Ticket: {
      _id: 'string',
      orgId: { type: 'string', enum: ['fastway', 'metalharvest', 'greenway'] },
      code: 'string',
      title: 'string',
      description: 'string',

      categoryId: 'string',
      priorityId: 'string',
      statusId: 'string',

      reporter: {
        id: 'string',
        name: 'string',
        email: 'string',
      },

      assignee: {
        type: { type: 'string', enum: ['person', 'team'] },
        id: 'string',
        name: 'string',
      },

      watchers: ['string'],
      attachmentsCount: 0,
      tags: ['string'],
      custom: {},
      dueAt: '2025-01-01T14:00:00Z',
      createdAt: '2025-01-01T12:00:00Z',
      updatedAt: '2025-01-01T12:00:00Z',
    },

    File: {
      _id: 'string',
      orgId: 'string',
      ticketId: 'string',
      ownerPrincipalId: 'string',
      name: 'string',
      mimeType: 'image/png',
      size: 12345,

      storage: {
        provider: 'local',
        path: 'string',
      },

      createdAt: '2025-01-01T12:00:00Z',
      updatedAt: '2025-01-01T12:00:00Z',
    },

    TicketMessage: {
      _id: 'string',
      orgId: 'string',
      ticketId: 'string',

      sender: {
        principalId: 'string',
        name: 'string',
        email: 'string',
      },

      message: 'string',

      attachments: [
        {
          fileId: 'string',
          name: 'string',
          mime: 'string',
          size: 1234,
        },
      ],

      createdAt: '2025-01-01T12:00:00Z',
      updatedAt: '2025-01-01T12:00:00Z',
    },

    Notification: {
      _id: 'string',
      orgId: 'string',
      principalId: 'string',
      type: 'string',
      payload: {},
      read: false,
      createdAt: '2025-01-01T12:00:00Z',
    },

    Team: {
      _id: 'string',

      orgId: { type: 'string', enum: ['Fastway', 'metalharvest', 'greenway'] },

      name: 'string',
      description: 'string',

      members: [
        {
          principalId: 'string',
          email: 'string',
        },
      ],

      active: true,

      createdAt: '2025-01-01T12:00:00Z',
      updatedAt: '2025-01-01T12:00:00Z',
    },
  },
}

// ======================================================
// Archivos donde Swagger buscará rutas reales
// ======================================================
const outputFile = './src/swagger_output.json'

const endpointsFiles = [
  './src/app.js',
  './src/modules/Messages/router.js',
  './src/modules/CrearTicket/router.js',
  './src/modules/Notifications/router.js',
  './src/modules/Files/router.js',
  './src/modules/CrearArea/router.js',
  './src/modules/teams/router.js',
]

const swaggerAutogenInstance = swaggerAutogen()

swaggerAutogenInstance(outputFile, endpointsFiles, doc).then(() => {
  console.log('✅ Swagger generado en src/swagger_output.json')
})
