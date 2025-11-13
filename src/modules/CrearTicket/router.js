import { Router } from 'express'
import { validate } from '../../middlewares/validate.js'
import {
  listSchema,
  idParamSchema,
  createTicketSchema,
  updateTicketSchema,
  listAllTicketsSchema,
} from './validator.js'
import * as Controller from './controller.js'

const router = Router()

/* 
  ======================================================
    ⭐ Montado en /tikets/tickets
    ⇒ Los paths Swagger deben comenzar con /tickets/...
  ======================================================
*/

// Listar tickets (con filtros)
router.get(
  '/',
  /*
    #swagger.tags = ['Tickets']
    #swagger.description = 'Listar tickets con filtros'
    #swagger.path = '/tickets'
  */
  validate(listSchema),
  Controller.list
)

// Listar TODOS los tickets
router.get(
  '/all',
  /*
    #swagger.tags = ['Tickets']
    #swagger.description = 'Lista todos los tickets'
    #swagger.path = '/tickets/all'
  */
  validate(listAllTicketsSchema),
  Controller.all
)

// Detalle de ticket por ID
router.get(
  '/:id',
  /*
    #swagger.tags = ['Tickets']
    #swagger.description = 'Detalle de ticket por ID'
    #swagger.path = '/tickets/{id}'
  */
  validate(idParamSchema),
  Controller.detail
)

// Crear ticket
router.post(
  '/',
  /*
    #swagger.tags = ['Tickets']
    #swagger.description = 'Crear un ticket nuevo'
    #swagger.path = '/tickets'
  */
  validate(createTicketSchema),
  Controller.create
)

// Actualizar ticket
router.patch(
  '/:id',
  /*
    #swagger.tags = ['Tickets']
    #swagger.description = 'Actualizar un ticket'
    #swagger.path = '/tickets/{id}'
  */
  validate(updateTicketSchema),
  Controller.update
)

// Eliminar ticket
router.delete(
  '/:id',
  /*
    #swagger.tags = ['Tickets']
    #swagger.description = 'Eliminar un ticket'
    #swagger.path = '/tickets/{id}'
  */
  validate(idParamSchema),
  Controller.remove
)

// Health Check
router.get(
  '/health/ping',
  /*
    #swagger.tags = ['Health']
    #swagger.description = 'Health check del módulo Tickets'
    #swagger.path = '/tickets/health/ping'
  */
  (_req, res) => {
    res.json({ ok: true, module: 'CrearTicket', ts: new Date().toISOString() })
  }
)

export default router
