// src/modules/Ticket/controller.ticket.js
import * as TicketService from './service.ticket.js'

export async function create(req, res) {
  try {
    const ticket = await TicketService.createTicket(req.body)
    return res.status(201).json({ ok: true, ticket })
  } catch (e) {
    return res
      .status(e.status || 500)
      .json({ ok: false, error: e.message || 'Error creando ticket' })
  }
}

export async function list(req, res) {
  try {
    const data = await TicketService.listTickets(req.query)
    return res.json({ ok: true, ...data })
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: e.message || 'Error listando tickets' })
  }
}

export async function getById(req, res) {
  try {
    const ticket = await TicketService.getTicketById(req.params.id)
    return res.json({ ok: true, ticket })
  } catch (e) {
    return res
      .status(e.status || 500)
      .json({ ok: false, error: e.message || 'Error consultando ticket' })
  }
}

export async function put(req, res) {
  try {
    const ticket = await TicketService.updateTicketPut(req.params.id, req.body)
    return res.json({ ok: true, ticket })
  } catch (e) {
    return res
      .status(e.status || 500)
      .json({ ok: false, error: e.message || 'Error actualizando ticket' })
  }
}

// ✅ NUEVO: cambiar estado con trazabilidad
export async function patchState(req, res) {
  try {
    const ticket = await TicketService.patchState(req.params.id, req.body)
    return res.json({ ok: true, ticket })
  } catch (e) {
    return res
      .status(e.status || 500)
      .json({ ok: false, error: e.message || 'Error cambiando estado' })
  }
}

export async function patchAssign(req, res) {
  try {
    const ticket = await TicketService.patchAssign(req.params.id, req.body)
    return res.json({ ok: true, ticket })
  } catch (e) {
    return res
      .status(e.status || 500)
      .json({ ok: false, error: e.message || 'Error asignando ticket' })
  }
}

export async function deleteAssign(req, res) {
  try {
    const ticket = await TicketService.deleteAssign(req.params.id, req.body)
    return res.json({ ok: true, ticket })
  } catch (e) {
    return res
      .status(e.status || 500)
      .json({ ok: false, error: e.message || 'Error quitando asignación' })
  }
}

export async function patchWatchers(req, res) {
  try {
    const ticket = await TicketService.patchWatchers(req.params.id, req.body)
    return res.json({ ok: true, ticket })
  } catch (e) {
    return res
      .status(e.status || 500)
      .json({ ok: false, error: e.message || 'Error actualizando watchers' })
  }
}

export async function patchServicios(req, res) {
  try {
    const ticket = await TicketService.patchOperacionServicios(
      req.params.id,
      req.body
    )
    return res.json({ ok: true, ticket })
  } catch (e) {
    return res
      .status(e.status || 500)
      .json({ ok: false, error: e.message || 'Error actualizando servicios' })
  }
}

export async function patchApoyo(req, res) {
  try {
    const ticket = await TicketService.patchOperacionApoyo(
      req.params.id,
      req.body
    )
    return res.json({ ok: true, ticket })
  } catch (e) {
    return res
      .status(e.status || 500)
      .json({ ok: false, error: e.message || 'Error actualizando apoyo' })
  }
}

export async function patchAttachments(req, res) {
  try {
    const ticket = await TicketService.patchAttachments(req.params.id, req.body)
    return res.json({ ok: true, ticket })
  } catch (e) {
    return res
      .status(e.status || 500)
      .json({ ok: false, error: e.message || 'Error actualizando adjuntos' })
  }
}

export async function deactivate(req, res) {
  try {
    const ticket = await TicketService.deactivateTicket(req.params.id, req.body)
    return res.json({ ok: true, ticket })
  } catch (e) {
    return res
      .status(e.status || 500)
      .json({ ok: false, error: e.message || 'Error desactivando ticket' })
  }
}

export async function mine(req, res) {
  try {
    const { id_personal, scope } = req.query
    const data = await TicketService.listMine({
      ...req.query,
      id_personal,
      scope,
    })
    return res.json({ ok: true, ...data })
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: e.message || 'Error listando mine' })
  }
}

export async function assigned(req, res) {
  try {
    const { id_personal } = req.query
    const data = await TicketService.listAssignedToPersonal({
      ...req.query,
      id_personal,
    })
    return res.json({ ok: true, ...data })
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: e.message || 'Error listando assigned' })
  }
}

export async function count(req, res) {
  try {
    const data = await TicketService.countTickets(req.query)
    return res.json({ ok: true, ...data })
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: e.message || 'Error contando tickets' })
  }
}
