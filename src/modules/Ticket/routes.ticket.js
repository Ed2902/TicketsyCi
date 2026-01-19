// routes.ticket.js
import { Router } from 'express'
import * as TicketController from './controller.ticket.js'
import {
  validateListTickets,
  validateListAssignedTickets,
  validateTicketIdParam,
  validateCreateTicket,
  validatePutTicket,
  validatePatchState, // ✅ nuevo
  validatePatchAssign,
  validateDeleteAssign,
  validatePatchAddRemoveIds,
  validatePatchServicios,
  validatePatchAttachments,
} from './validator.ticket.js'

const router = Router()

router.get('/', validateListTickets, TicketController.list)
router.post('/', validateCreateTicket, TicketController.create)
router.get('/mine', validateListTickets, TicketController.mine)

router.get('/assigned', validateListAssignedTickets, TicketController.assigned)

router.get('/count', TicketController.count)
router.get('/:id', validateTicketIdParam, TicketController.getById)

router.put(
  '/:id',
  validateTicketIdParam,
  validatePutTicket,
  TicketController.put
)

// ✅ NUEVO: cambio de estado con trazabilidad (recomendado)
router.patch(
  '/:id/state',
  validateTicketIdParam,
  validatePatchState,
  TicketController.patchState
)

router.patch(
  '/:id/assign',
  validateTicketIdParam,
  validatePatchAssign,
  TicketController.patchAssign
)
router.delete(
  '/:id/assign',
  validateTicketIdParam,
  validateDeleteAssign,
  TicketController.deleteAssign
)

router.patch(
  '/:id/watchers',
  validateTicketIdParam,
  validatePatchAddRemoveIds,
  TicketController.patchWatchers
)

router.patch(
  '/:id/operacion/servicios',
  validateTicketIdParam,
  validatePatchServicios,
  TicketController.patchServicios
)
router.patch(
  '/:id/operacion/apoyo',
  validateTicketIdParam,
  validatePatchAddRemoveIds,
  TicketController.patchApoyo
)

router.patch(
  '/:id/attachments',
  validateTicketIdParam,
  validatePatchAttachments,
  TicketController.patchAttachments
)

router.patch(
  '/:id/deactivate',
  validateTicketIdParam,
  validateDeleteAssign,
  TicketController.deactivate
)

export default router
