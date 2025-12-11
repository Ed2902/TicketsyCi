import * as Service from './service.js'
import * as TicketService from '../CrearTicket/services.js'
import { notifyTicketNewMessageToParticipants } from '../Notifications/notifyEvents.js'

export async function listByTicket(req, res, next) {
  try {
    const p = req.validated.params
    const q = req.validated.query ?? {}
    const orgId = q.orgId ?? req.headers['x-org-id'] 

    const out = await Service.listByTicket({
      orgId,
      ticketId: p.ticketId,
      limit: q.limit,
      page: q.page,
    })
   res.json(out)
  } catch (e) {
    next(e)
  }
}

export async function listAll(req, res, next) {
  try {
    const q = req.validated.query ?? {}
    const out = await Service.listAll({
      orgId: q.orgId,
      limit: q.limit,
      page: q.page,
    })
    res.json(out)
  } catch (e) {
    next(e)
  }
}

export async function detail(req, res, next) {
  try {
    const orgId = req.headers['x-org-id'] ?? undefined
    const id = req.validated.params.id
    const doc = await Service.detail({ orgId, id })
    if (!doc)
      return res
        .status(404)
        .json({ error: true, message: 'Mensaje no encontrado' })
    res.json(doc)
  } catch (e) {
    next(e)
  }
}

export async function create(req, res, next) {
  try {
    const b = req.validated.body

    // 1) Resolver orgId (body manda, si no, header)
    const orgId = b.orgId ?? req.headers['x-org-id']
    if (!orgId) {
      return res
        .status(400)
        .json({ error: true, message: 'orgId requerido para crear mensaje' })
    }

    // 2) Crear mensaje en Mongo
    const doc = await Service.create({
      orgId,
      ticketId: b.ticketId,
      sender: b.sender,
      message: b.message,
      attachments: b.attachments,
    })

    // 3) Intentar notificar a participantes del ticket (no rompe la API si falla)
    try {
      // Traer el ticket completo
      const ticket = await TicketService.detail({
        orgId,
        id: b.ticketId,
      })

      if (!ticket) {
        console.warn(
          '⚠️ No se encontró ticket para notificación de nuevo mensaje:',
          b.ticketId
        )
      } else {
        const actorId =
          b.sender?.id ??
          b.sender?.principalId ??
          b.sender?.userId ??
          b.sender?.usuario_id ??
          null

        const actorName =
          b.sender?.name ||
          b.sender?.displayName ||
          b.sender?.username ||
          b.sender?.nombre ||
          (actorId ? `Usuario ${actorId}` : 'Usuario')

        await notifyTicketNewMessageToParticipants({
          orgId,
          ticket,
          message: b.message,
          actor: {
            id: actorId,
            name: actorName,
          },
        })
      }
    } catch (errNotif) {
      console.error(
        '⚠️ Error enviando notificaciones de nuevo mensaje:',
        errNotif
      )
      // Importante: NO hacemos return error; la creación del mensaje ya fue exitosa
    }

    // 4) Respuesta normal de la API
    res.status(201).json(doc)
  } catch (e) {
    next(e)
  }
}

export async function patch(req, res, next) {
  try {
    const orgId = req.headers['x-org-id'] ?? undefined
    const id = req.validated.params.id
    const body = req.validated.body
    const doc = await Service.patch({ orgId, id, payload: body })
    if (!doc)
      return res
        .status(404)
        .json({ error: true, message: 'Mensaje no encontrado' })
    res.json(doc)
  } catch (e) {
    next(e)
  }
}

export async function remove(req, res, next) {
  try {
    const orgId = req.headers['x-org-id'] ?? undefined
    const id = req.validated.params.id
    const ok = await Service.remove({ orgId, id })
    if (!ok)
      return res
        .status(404)
        .json({ error: true, message: 'Mensaje no encontrado' })
    res.json({ ok: true, id })
  } catch (e) {
    next(e)
  }
}