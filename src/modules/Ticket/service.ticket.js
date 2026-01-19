// src/modules/Ticket/service.ticket.js
import mongoose from 'mongoose'
import { Ticket } from './model.ticket.js'
import { TicketCounter } from './model.ticketCounter.js'

// Para resolver miembros por asignación
import { Area } from '../areas/model.area.js'
import { Team } from '../teams/model.team.js'

// Chats (ticket -> chat auto)
import {
  ensureTicketChat,
  syncTicketChat,
  buildTicketParticipants,
} from '../chats/service.chat.js'

// Notifications
import { dispatchNotifications } from '../notifications/service.notification.js'

function parsePaging({ page, limit }) {
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100)
  const safePage = Math.max(Number(page) || 1, 1)
  const skip = (safePage - 1) * safeLimit
  return { safePage, safeLimit, skip }
}

function uniqTrim(arr) {
  return [...new Set(arr.map(x => String(x).trim()))].filter(Boolean)
}

function buildFilters(q) {
  const filter = {}

  if (q.activo !== undefined) filter.activo = String(q.activo) === 'true'
  if (q.orgId) filter.orgId = String(q.orgId).trim()
  if (q.tipo) filter.tipo = q.tipo

  // catalogos son ObjectId (esto está bien)
  if (q.estado_id) filter.estado_id = new mongoose.Types.ObjectId(q.estado_id)
  if (q.prioridad_id)
    filter.prioridad_id = new mongoose.Types.ObjectId(q.prioridad_id)
  if (q.categoria_id)
    filter.categoria_id = new mongoose.Types.ObjectId(q.categoria_id)

  /**
   * ✅ IMPORTANTE:
   * asignado_a.id para team/area se guarda como STRING (validator lo exige como string)
   * por eso NO se debe comparar contra ObjectId(q.area_id/q.team_id).
   */
  if (q.area_id) {
    filter['asignado_a.tipo'] = 'area'
    filter['asignado_a.id'] = String(q.area_id).trim()
  }

  if (q.team_id) {
    filter['asignado_a.tipo'] = 'team'
    filter['asignado_a.id'] = String(q.team_id).trim()
  }

  // Este filtro global lo mantengo igual (tu comportamiento actual)
  if (q.id_personal) {
    const pid = String(q.id_personal).trim()
    filter.$or = [
      { creado_por: pid },
      { watchers: pid },
      { 'asignado_a.tipo': 'personal', 'asignado_a.id': pid },
      { 'operacion.apoyo_ids': pid },
    ]
  }

  if (q.search && String(q.search).trim()) {
    const s = String(q.search).trim()
    filter.$and = filter.$and || []
    filter.$and.push({
      $or: [
        { titulo: { $regex: s, $options: 'i' } },
        { descripcion: { $regex: s, $options: 'i' } },
        { 'operacion.cliente': { $regex: s, $options: 'i' } },
        { 'operacion.producto': { $regex: s, $options: 'i' } },
        { 'operacion.lote': { $regex: s, $options: 'i' } },
        { code: { $regex: s, $options: 'i' } },
      ],
    })
  }

  return filter
}

/**
 * Auto-increment por tipo
 */
const TYPE_PREFIX = { operacion: 'OP_', tarea: 'TK_', proyecto: 'PY_' }

async function nextTicketCodeByTipo(tipo) {
  const prefix = TYPE_PREFIX[tipo]
  if (!prefix) {
    const err = new Error('Tipo de ticket inválido para generar código.')
    err.status = 400
    throw err
  }

  const key = `ticket:${tipo}`
  const row = await TicketCounter.findOneAndUpdate(
    { key },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  ).lean()

  const seq = Number(row.seq) || 1
  const code = `${prefix}${String(seq).padStart(4, '0')}`
  return { code, codePrefix: prefix, codeSeq: seq }
}

/**
 * Helpers: resolver participantes del ticket
 */
async function resolveAssignedPersonals(asignado_a) {
  if (!asignado_a) return []

  const { tipo, id } = asignado_a

  if (tipo === 'personal') return id ? [String(id).trim()] : []

  if (tipo === 'team') {
    if (!id) return []
    const team = await Team.findById(id).lean()
    if (!team) return []
    return uniqTrim(team.personal_ids || [])
  }

  if (tipo === 'area') {
    if (!id) return []
    const area = await Area.findById(id).lean()
    if (!area) return []
    return uniqTrim(area.personal_ids || [])
  }

  return []
}

async function computeTicketParticipants(ticketDoc) {
  const creado_por = ticketDoc.creado_por
  const watchers = ticketDoc.watchers || []
  const asignado_a = ticketDoc.asignado_a || null
  const apoyo_ids = ticketDoc.operacion?.apoyo_ids || []
  const assignedPersonals = await resolveAssignedPersonals(asignado_a)

  return buildTicketParticipants({
    creado_por,
    watchers,
    assignedPersonals,
    apoyo_ids,
  })
}

function ticketTarget(ticketId) {
  return {
    type: 'ticket',
    params: { ticketId: String(ticketId) },
    url: `/tickets/${String(ticketId)}`,
  }
}

export async function createTicket(payload) {
  const watchers = payload.watchers ? uniqTrim(payload.watchers) : []
  const adjuntos = payload.adjuntos ?? []
  const actor = String(payload.creado_por).trim()

  const { code, codePrefix, codeSeq } = await nextTicketCodeByTipo(payload.tipo)

  const base = {
    orgId: String(payload.orgId).trim(),

    code,
    codePrefix,
    codeSeq,

    tipo: payload.tipo,
    titulo: payload.titulo.trim(),
    descripcion: payload.descripcion.trim(),
    categoria_id: payload.categoria_id,
    prioridad_id: payload.prioridad_id,
    estado_id: payload.estado_id,

    // ✅ inicializa historial
    estado_historial: [
      {
        estado_id: payload.estado_id,
        nota: (payload.nota_estado || '').trim(),
        changedBy: actor,
        changedAt: new Date(),
      },
    ],

    asignado_a: payload.asignado_a ? { ...payload.asignado_a } : null,
    creado_por: actor,
    watchers,
    adjuntos,
    activo: true,
    createdBy: actor,
    updatedBy: actor,
  }

  if (payload.tipo === 'operacion') {
    base.operacion = {
      cliente: payload.operacion.cliente.trim(),
      lote: (payload.operacion.lote ?? '').trim(),
      producto: (payload.operacion.producto ?? '').trim(),
      servicios_adicionales: uniqTrim(
        payload.operacion.servicios_adicionales ?? []
      ),
      apoyo_ids: uniqTrim(payload.operacion.apoyo_ids ?? []),
    }
  }

  const doc = await Ticket.create(base)
  const ticket = doc.toObject()

  const participants = await computeTicketParticipants(ticket)
  const chat = await ensureTicketChat({
    ticketId: ticket._id,
    participants,
    actor_id_personal: actor,
  })

  await Ticket.findByIdAndUpdate(ticket._id, {
    $set: { chatId: chat._id },
  }).lean()

  await dispatchNotifications({
    actor_id_personal: actor,
    to_ids: participants,
    type: 'ticket.created',
    title: 'Nuevo ticket',
    body: `Se creó el ticket ${ticket.code}.`,
    target: ticketTarget(ticket._id),
    meta: {
      ticketId: String(ticket._id),
      tipo: ticket.tipo,
      code: ticket.code,
    },
  })

  return { ...ticket, chatId: chat._id }
}

export async function listTickets(query) {
  const { safePage, safeLimit, skip } = parsePaging(query)
  const filter = buildFilters(query)

  const [items, total] = await Promise.all([
    Ticket.find(filter)
      .sort({ $natural: -1 })
      .skip(skip)
      .limit(safeLimit)
      .lean(),
    Ticket.countDocuments(filter),
  ])

  return {
    items,
    meta: {
      total,
      page: safePage,
      limit: safeLimit,
      pages: Math.ceil(total / safeLimit) || 1,
    },
  }
}

export async function getTicketById(id) {
  const doc = await Ticket.findById(id).lean()
  if (!doc) {
    const err = new Error('Ticket no encontrado.')
    err.status = 404
    throw err
  }
  return doc
}

// ✅ NUEVO: PATCH estado dedicado (trazabilidad)
export async function patchState(id, { id_personal, estado_id, nota }) {
  const actor = String(id_personal).trim()
  const now = new Date()

  const before = await Ticket.findById(id).lean()
  if (!before) {
    const err = new Error('Ticket no encontrado.')
    err.status = 404
    throw err
  }

  // si no cambia, devuelve igual sin duplicar historial
  if (String(before.estado_id) === String(estado_id)) return before

  const updated = await Ticket.findByIdAndUpdate(
    id,
    {
      $set: { estado_id, updatedBy: actor },
      $push: {
        estado_historial: {
          estado_id,
          nota: (nota || '').trim(),
          changedBy: actor,
          changedAt: now,
        },
      },
    },
    { new: true }
  ).lean()

  const participants = await computeTicketParticipants(updated)
  await dispatchNotifications({
    actor_id_personal: actor,
    to_ids: participants,
    type: 'ticket.state_changed',
    title: 'Estado actualizado',
    body: `Se cambió el estado del ticket ${updated.code}.`,
    target: ticketTarget(updated._id),
    meta: {
      ticketId: String(updated._id),
      code: updated.code,
      estado_id: String(estado_id),
    },
  })

  return updated
}

export async function updateTicketPut(id, patch) {
  const actor = String(patch.id_personal).trim()

  const before = await Ticket.findById(id).lean()
  if (!before) {
    const err = new Error('Ticket no encontrado.')
    err.status = 404
    throw err
  }

  const update = { updatedBy: actor }
  const push = {}

  if (patch.orgId !== undefined) update.orgId = String(patch.orgId).trim()
  if (patch.tipo !== undefined) update.tipo = patch.tipo
  if (patch.titulo !== undefined) update.titulo = patch.titulo.trim()
  if (patch.descripcion !== undefined)
    update.descripcion = patch.descripcion.trim()

  if (patch.categoria_id !== undefined) update.categoria_id = patch.categoria_id
  if (patch.prioridad_id !== undefined) update.prioridad_id = patch.prioridad_id

  // ✅ si cambia estado por PUT, registra historial
  if (patch.estado_id !== undefined) {
    update.estado_id = patch.estado_id
    if (String(before.estado_id) !== String(patch.estado_id)) {
      push.estado_historial = {
        estado_id: patch.estado_id,
        nota: (patch.nota_estado || '').trim(),
        changedBy: actor,
        changedAt: new Date(),
      }
    }
  }

  if (patch.asignado_a !== undefined) update.asignado_a = patch.asignado_a
  if (patch.watchers !== undefined) update.watchers = uniqTrim(patch.watchers)
  if (patch.adjuntos !== undefined) update.adjuntos = patch.adjuntos
  if (patch.activo !== undefined) update.activo = patch.activo

  if ((patch.tipo ?? undefined) === 'operacion') {
    if (patch.operacion !== undefined) {
      update.operacion = {
        cliente: patch.operacion.cliente.trim(),
        lote: (patch.operacion.lote ?? '').trim(),
        producto: (patch.operacion.producto ?? '').trim(),
        servicios_adicionales: uniqTrim(
          patch.operacion.servicios_adicionales ?? []
        ),
        apoyo_ids: uniqTrim(patch.operacion.apoyo_ids ?? []),
      }
    }
  } else if (patch.tipo !== undefined && patch.tipo !== 'operacion') {
    update.operacion = undefined
  }

  const mongoUpdate = { $set: update }
  if (push.estado_historial)
    mongoUpdate.$push = { estado_historial: push.estado_historial }

  const updated = await Ticket.findByIdAndUpdate(id, mongoUpdate, {
    new: true,
    runValidators: true,
  }).lean()

  const affectsParticipants =
    patch.asignado_a !== undefined ||
    patch.watchers !== undefined ||
    (patch.operacion && patch.operacion.apoyo_ids !== undefined)

  if (affectsParticipants) {
    const participants = await computeTicketParticipants(updated)
    await syncTicketChat({
      ticketId: updated._id,
      participants,
      actor_id_personal: actor,
    })
  }

  return updated
}

// ---- resto igual (sin tocar) ----
export async function patchAssign(id, { id_personal, asignado_a }) {
  const actor = String(id_personal).trim()

  const updated = await Ticket.findByIdAndUpdate(
    id,
    { updatedBy: actor, asignado_a },
    { new: true }
  ).lean()

  if (!updated) {
    const err = new Error('Ticket no encontrado.')
    err.status = 404
    throw err
  }

  const participants = await computeTicketParticipants(updated)
  await syncTicketChat({
    ticketId: updated._id,
    participants,
    actor_id_personal: actor,
  })

  return updated
}

export async function deleteAssign(id, { id_personal }) {
  const actor = String(id_personal).trim()

  const updated = await Ticket.findByIdAndUpdate(
    id,
    { updatedBy: actor, asignado_a: null },
    { new: true }
  ).lean()

  if (!updated) {
    const err = new Error('Ticket no encontrado.')
    err.status = 404
    throw err
  }

  const participants = await computeTicketParticipants(updated)
  await syncTicketChat({
    ticketId: updated._id,
    participants,
    actor_id_personal: actor,
  })

  return updated
}

export async function patchWatchers(
  id,
  { id_personal, add = [], remove = [] }
) {
  const actor = String(id_personal).trim()
  const addU = uniqTrim(add)
  const removeU = uniqTrim(remove)

  const update = { $set: { updatedBy: actor } }
  if (addU.length) update.$addToSet = { watchers: { $each: addU } }
  if (removeU.length) update.$pull = { watchers: { $in: removeU } }

  const updated = await Ticket.findByIdAndUpdate(id, update, {
    new: true,
  }).lean()
  if (!updated) {
    const err = new Error('Ticket no encontrado.')
    err.status = 404
    throw err
  }

  const participants = await computeTicketParticipants(updated)
  await syncTicketChat({
    ticketId: updated._id,
    participants,
    actor_id_personal: actor,
  })

  return updated
}

export async function patchOperacionServicios(
  id,
  { id_personal, add = [], remove = [] }
) {
  const update = { $set: { updatedBy: String(id_personal).trim() } }

  if (add.length)
    update.$addToSet = {
      'operacion.servicios_adicionales': { $each: uniqTrim(add) },
    }
  if (remove.length)
    update.$pull = {
      'operacion.servicios_adicionales': { $in: uniqTrim(remove) },
    }

  const updated = await Ticket.findByIdAndUpdate(id, update, {
    new: true,
  }).lean()
  if (!updated) {
    const err = new Error('Ticket no encontrado.')
    err.status = 404
    throw err
  }
  return updated
}

export async function patchOperacionApoyo(
  id,
  { id_personal, add = [], remove = [] }
) {
  const actor = String(id_personal).trim()

  const update = { $set: { updatedBy: actor } }
  if (add.length)
    update.$addToSet = { 'operacion.apoyo_ids': { $each: uniqTrim(add) } }
  if (remove.length)
    update.$pull = { 'operacion.apoyo_ids': { $in: uniqTrim(remove) } }

  const updated = await Ticket.findByIdAndUpdate(id, update, {
    new: true,
  }).lean()
  if (!updated) {
    const err = new Error('Ticket no encontrado.')
    err.status = 404
    throw err
  }

  const participants = await computeTicketParticipants(updated)
  await syncTicketChat({
    ticketId: updated._id,
    participants,
    actor_id_personal: actor,
  })

  return updated
}

export async function patchAttachments(
  id,
  { id_personal, add = [], remove = [] }
) {
  const update = { $set: { updatedBy: String(id_personal).trim() } }

  if (Array.isArray(add) && add.length)
    update.$addToSet = { adjuntos: { $each: add } }
  if (Array.isArray(remove) && remove.length)
    update.$pull = { adjuntos: { fileId: { $in: uniqTrim(remove) } } }

  const updated = await Ticket.findByIdAndUpdate(id, update, {
    new: true,
  }).lean()
  if (!updated) {
    const err = new Error('Ticket no encontrado.')
    err.status = 404
    throw err
  }
  return updated
}

export async function deactivateTicket(id, { id_personal }) {
  const updated = await Ticket.findByIdAndUpdate(
    id,
    { $set: { activo: false, updatedBy: String(id_personal).trim() } },
    { new: true }
  ).lean()

  if (!updated) {
    const err = new Error('Ticket no encontrado.')
    err.status = 404
    throw err
  }
  return updated
}

export async function listMine({
  id_personal,
  scope = 'assigned,watching,created',
  ...query
}) {
  const pid = String(id_personal).trim()
  const scopes = new Set(
    String(scope)
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
  )

  const or = []
  if (scopes.has('assigned'))
    or.push({ 'asignado_a.tipo': 'personal', 'asignado_a.id': pid })
  if (scopes.has('watching')) or.push({ watchers: pid })
  if (scopes.has('created')) or.push({ creado_por: pid })

  const filter = buildFilters(query)
  filter.$and = filter.$and || []
  filter.$and.push({ $or: or.length ? or : [{ watchers: pid }] })

  const { safePage, safeLimit, skip } = parsePaging(query)

  const [items, total] = await Promise.all([
    Ticket.find(filter)
      .sort({ $natural: -1 })
      .skip(skip)
      .limit(safeLimit)
      .lean(),
    Ticket.countDocuments(filter),
  ])

  return {
    items,
    meta: {
      total,
      page: safePage,
      limit: safeLimit,
      pages: Math.ceil(total / safeLimit) || 1,
    },
  }
}

export async function listAssignedToPersonal({ id_personal, ...query }) {
  const pid = String(id_personal).trim()
  if (!pid) {
    const err = new Error('id_personal es requerido.')
    err.status = 400
    throw err
  }

  // 1) Descubrir memberships (teams/areas donde está pid)
  const [teams, areas] = await Promise.all([
    Team.find({ personal_ids: pid }).select({ _id: 1 }).lean(),
    Area.find({ personal_ids: pid }).select({ _id: 1 }).lean(),
  ])

  const teamIds = (teams || []).map(t => String(t._id))
  const areaIds = (areas || []).map(a => String(a._id))

  // 2) Construir filtro base (sin id_personal para no activar el $or global de buildFilters)
  const { safePage, safeLimit, skip } = parsePaging(query)
  const filter = buildFilters(query)

  const assignedOr = [{ 'asignado_a.tipo': 'personal', 'asignado_a.id': pid }]
  if (teamIds.length)
    assignedOr.push({
      'asignado_a.tipo': 'team',
      'asignado_a.id': { $in: teamIds },
    })
  if (areaIds.length)
    assignedOr.push({
      'asignado_a.tipo': 'area',
      'asignado_a.id': { $in: areaIds },
    })

  filter.$and = filter.$and || []
  filter.$and.push({ $or: assignedOr })

  const [itemsRaw, total] = await Promise.all([
    Ticket.find(filter)
      .sort({ $natural: -1 })
      .skip(skip)
      .limit(safeLimit)
      .lean(),
    Ticket.countDocuments(filter),
  ])

  // 3) Enriquecer: assignedMembers por ticket (sin romper los campos del ticket)
  const teamIdsInTickets = uniqTrim(
    itemsRaw
      .filter(
        t => t.asignado_a && t.asignado_a.tipo === 'team' && t.asignado_a.id
      )
      .map(t => t.asignado_a.id)
  )
  const areaIdsInTickets = uniqTrim(
    itemsRaw
      .filter(
        t => t.asignado_a && t.asignado_a.tipo === 'area' && t.asignado_a.id
      )
      .map(t => t.asignado_a.id)
  )

  const [teamsDocs, areasDocs] = await Promise.all([
    teamIdsInTickets.length
      ? Team.find({ _id: { $in: teamIdsInTickets } })
          .select({ personal_ids: 1 })
          .lean()
      : [],
    areaIdsInTickets.length
      ? Area.find({ _id: { $in: areaIdsInTickets } })
          .select({ personal_ids: 1 })
          .lean()
      : [],
  ])

  const teamMembersById = new Map(
    (teamsDocs || []).map(t => [String(t._id), uniqTrim(t.personal_ids || [])])
  )
  const areaMembersById = new Map(
    (areasDocs || []).map(a => [String(a._id), uniqTrim(a.personal_ids || [])])
  )

  const items = itemsRaw.map(t => {
    const asignado = t.asignado_a || null
    let assignedMembers = []

    if (asignado?.tipo === 'personal') {
      assignedMembers = asignado.id ? [String(asignado.id).trim()] : []
    } else if (asignado?.tipo === 'team') {
      assignedMembers = teamMembersById.get(String(asignado.id)) || []
    } else if (asignado?.tipo === 'area') {
      assignedMembers = areaMembersById.get(String(asignado.id)) || []
    }

    return { ...t, assignedMembers }
  })

  return {
    items,
    meta: {
      total,
      page: safePage,
      limit: safeLimit,
      pages: Math.ceil(total / safeLimit) || 1,
    },
  }
}

export async function countTickets(query) {
  const filter = buildFilters(query)
  const total = await Ticket.countDocuments(filter)

  const byTipo = await Ticket.aggregate([
    { $match: filter },
    { $group: { _id: '$tipo', total: { $sum: 1 } } },
  ])

  return { total, byTipo }
}
