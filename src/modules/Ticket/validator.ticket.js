// src/modules/Ticket/validator.ticket.js
import mongoose from 'mongoose'

const isObjectId = v => mongoose.Types.ObjectId.isValid(v)

function isValidIdPersonal(v) {
  return typeof v === 'string' && v.trim().length > 0 && v.trim().length <= 80
}

function isValidOrgIdString(v) {
  return typeof v === 'string' && v.trim().length > 0 && v.trim().length <= 120
}

function uniqTrim(arr) {
  return [...new Set(arr.map(x => String(x).trim()))].filter(Boolean)
}

function validateAsignadoA(asignado_a, errors) {
  if (!asignado_a || typeof asignado_a !== 'object') {
    errors.push('asignado_a es requerido.')
    return
  }
  const { tipo, id } = asignado_a

  if (!['area', 'team', 'personal'].includes(tipo)) {
    errors.push('asignado_a.tipo debe ser area | team | personal.')
    return
  }

  if (tipo === 'personal') {
    if (!isValidIdPersonal(id))
      errors.push(
        'asignado_a.id debe ser id_personal (string) cuando tipo=personal.'
      )
  } else {
    if (typeof id !== 'string' || !isObjectId(id)) {
      errors.push(
        'asignado_a.id debe ser ObjectId (string) cuando tipo=area|team.'
      )
    }
  }
}

function validateAttachmentsArray(adjuntos, errors) {
  if (!Array.isArray(adjuntos)) {
    errors.push('adjuntos debe ser un array.')
    return
  }
  const seen = new Set()
  for (const a of adjuntos) {
    if (!a || typeof a !== 'object') {
      errors.push('Cada adjunto debe ser un objeto.')
      break
    }
    if (!a.fileId || typeof a.fileId !== 'string' || !a.fileId.trim()) {
      errors.push('Cada adjunto requiere fileId (string).')
      break
    }
    const key = a.fileId.trim()
    if (seen.has(key)) {
      errors.push('adjuntos no puede tener fileId duplicados.')
      break
    }
    seen.add(key)
  }
}

function validateNotaEstado(nota, errors) {
  if (nota === undefined) return
  if (typeof nota !== 'string') errors.push('nota_estado debe ser string.')
  else if (nota.trim().length > 500)
    errors.push('nota_estado máximo 500 caracteres.')
}

export function validateListTickets(req, res, next) {
  const errors = []
  const { page, limit } = req.query

  if (page === undefined) errors.push('page (query) es requerido.')
  if (limit === undefined) errors.push('limit (query) es requerido.')

  const p = Number(page)
  const l = Number(limit)

  if (!Number.isInteger(p) || p < 1) errors.push('page debe ser entero >= 1.')
  if (!Number.isInteger(l) || l < 1) errors.push('limit debe ser entero >= 1.')
  if (Number.isInteger(l) && l > 100)
    errors.push('limit no puede ser mayor a 100.')

  const {
    tipo,
    estado_id,
    prioridad_id,
    categoria_id,
    orgId,
    area_id,
    team_id,
  } = req.query

  if (
    tipo !== undefined &&
    !['tarea', 'proyecto', 'operacion'].includes(String(tipo))
  ) {
    errors.push('tipo (query) inválido.')
  }

  for (const [k, v] of Object.entries({
    estado_id,
    prioridad_id,
    categoria_id,
  })) {
    if (v !== undefined && !isObjectId(v))
      errors.push(`${k} (query) debe ser ObjectId válido.`)
  }

  if (orgId !== undefined && !isValidOrgIdString(String(orgId)))
    errors.push('orgId (query) debe ser string válido.')

  if (area_id !== undefined && !isObjectId(area_id))
    errors.push('area_id (query) debe ser ObjectId válido.')
  if (team_id !== undefined && !isObjectId(team_id))
    errors.push('team_id (query) debe ser ObjectId válido.')

  if (
    req.query.activo !== undefined &&
    !['true', 'false'].includes(String(req.query.activo))
  ) {
    errors.push('activo (query) debe ser true o false.')
  }

  if (errors.length) return res.status(400).json({ ok: false, errors })
  next()
}

export function validateListAssignedTickets(req, res, next) {
  const errors = []
  const { id_personal, page, limit } = req.query

  if (!id_personal || !isValidIdPersonal(String(id_personal))) {
    errors.push(
      'id_personal (query) es requerido y debe ser id_personal válido.'
    )
  }

  // page/limit opcionales (si no vienen, el service usa defaults)
  if (page !== undefined) {
    const p = Number(page)
    if (!Number.isInteger(p) || p < 1) errors.push('page debe ser entero >= 1.')
  }
  if (limit !== undefined) {
    const l = Number(limit)
    if (!Number.isInteger(l) || l < 1)
      errors.push('limit debe ser entero >= 1.')
    if (Number.isInteger(l) && l > 100)
      errors.push('limit no puede ser mayor a 100.')
  }

  if (errors.length) return res.status(400).json({ ok: false, errors })
  next()
}

export function validateTicketIdParam(req, res, next) {
  const { id } = req.params
  if (!isObjectId(id))
    return res.status(400).json({ ok: false, error: 'id inválido' })
  next()
}

export function validateCreateTicket(req, res, next) {
  const errors = []
  const {
    orgId,
    tipo,
    titulo,
    descripcion,
    categoria_id,
    prioridad_id,
    estado_id,
    asignado_a,
    creado_por,
    watchers,
    adjuntos,
    operacion,
    nota_estado, // ✅ opcional (nota inicial)
  } = req.body

  if (!orgId || !isValidOrgIdString(orgId))
    errors.push('orgId es requerido y debe ser string válido.')

  if (!tipo || !['tarea', 'proyecto', 'operacion'].includes(tipo))
    errors.push('tipo es requerido (tarea|proyecto|operacion).')

  if (!titulo || typeof titulo !== 'string' || !titulo.trim())
    errors.push('titulo es requerido.')
  if (!descripcion || typeof descripcion !== 'string' || !descripcion.trim())
    errors.push('descripcion es requerido.')

  if (!categoria_id || !isObjectId(categoria_id))
    errors.push('categoria_id es requerido y debe ser ObjectId válido.')
  if (!prioridad_id || !isObjectId(prioridad_id))
    errors.push('prioridad_id es requerido y debe ser ObjectId válido.')
  if (!estado_id || !isObjectId(estado_id))
    errors.push('estado_id es requerido y debe ser ObjectId válido.')

  if (!creado_por || !isValidIdPersonal(creado_por))
    errors.push('creado_por es requerido y debe ser id_personal (string).')

  validateAsignadoA(asignado_a, errors)
  validateNotaEstado(nota_estado, errors)

  if (watchers !== undefined) {
    if (!Array.isArray(watchers)) errors.push('watchers debe ser un array.')
    else {
      const u = uniqTrim(watchers)
      if (u.length !== watchers.length)
        errors.push('watchers no puede tener duplicados.')
      if (u.some(x => !isValidIdPersonal(x)))
        errors.push('Cada watcher debe ser id_personal válido (string).')
    }
  }

  if (adjuntos !== undefined) validateAttachmentsArray(adjuntos, errors)

  if (tipo === 'operacion') {
    if (!operacion || typeof operacion !== 'object')
      errors.push('operacion es requerida cuando tipo=operacion.')
    else {
      if (
        !operacion.cliente ||
        typeof operacion.cliente !== 'string' ||
        !operacion.cliente.trim()
      ) {
        errors.push(
          'operacion.cliente es requerido (texto) cuando tipo=operacion.'
        )
      }
      if (operacion.servicios_adicionales !== undefined) {
        if (!Array.isArray(operacion.servicios_adicionales))
          errors.push('operacion.servicios_adicionales debe ser array.')
      }
      if (operacion.apoyo_ids !== undefined) {
        if (!Array.isArray(operacion.apoyo_ids))
          errors.push('operacion.apoyo_ids debe ser array.')
        else if (
          uniqTrim(operacion.apoyo_ids).some(x => !isValidIdPersonal(x))
        ) {
          errors.push('operacion.apoyo_ids debe contener id_personal válidos.')
        }
      }
    }
  }

  if (errors.length) return res.status(400).json({ ok: false, errors })
  next()
}

export function validatePutTicket(req, res, next) {
  const errors = []
  const {
    titulo,
    descripcion,
    categoria_id,
    prioridad_id,
    estado_id,
    tipo,
    orgId,
    asignado_a,
    watchers,
    adjuntos,
    operacion,
    id_personal,
    activo,
    nota_estado, // ✅ opcional (si cambias estado por PUT)
  } = req.body

  if (!id_personal || !isValidIdPersonal(id_personal))
    errors.push('id_personal (actor) es requerido.')

  if (orgId !== undefined && !isValidOrgIdString(String(orgId)))
    errors.push('orgId debe ser string válido.')

  if (tipo !== undefined && !['tarea', 'proyecto', 'operacion'].includes(tipo))
    errors.push('tipo inválido.')

  if (titulo !== undefined && (typeof titulo !== 'string' || !titulo.trim()))
    errors.push('titulo debe ser string no vacío.')
  if (
    descripcion !== undefined &&
    (typeof descripcion !== 'string' || !descripcion.trim())
  )
    errors.push('descripcion debe ser string no vacío.')

  for (const [k, v] of Object.entries({
    categoria_id,
    prioridad_id,
    estado_id,
  })) {
    if (v !== undefined && !isObjectId(v))
      errors.push(`${k} debe ser ObjectId válido.`)
  }

  if (asignado_a !== undefined && asignado_a !== null)
    validateAsignadoA(asignado_a, errors)

  if (watchers !== undefined) {
    if (!Array.isArray(watchers)) errors.push('watchers debe ser array.')
    else {
      const u = uniqTrim(watchers)
      if (u.length !== watchers.length)
        errors.push('watchers no puede tener duplicados.')
    }
  }

  if (adjuntos !== undefined) validateAttachmentsArray(adjuntos, errors)

  if (tipo === 'operacion' && operacion !== undefined) {
    if (!operacion || typeof operacion !== 'object')
      errors.push('operacion debe ser objeto.')
    else if (
      !operacion.cliente ||
      typeof operacion.cliente !== 'string' ||
      !operacion.cliente.trim()
    ) {
      errors.push('operacion.cliente es requerido cuando tipo=operacion.')
    }
  }

  if (activo !== undefined && typeof activo !== 'boolean')
    errors.push('activo debe ser boolean.')

  validateNotaEstado(nota_estado, errors)

  if (errors.length) return res.status(400).json({ ok: false, errors })
  next()
}

// ✅ NUEVO: PATCH estado dedicado
export function validatePatchState(req, res, next) {
  const errors = []
  const { id_personal, estado_id, nota } = req.body

  if (!id_personal || !isValidIdPersonal(id_personal))
    errors.push('id_personal (actor) es requerido.')

  if (!estado_id || !isObjectId(estado_id))
    errors.push('estado_id es requerido y debe ser ObjectId válido.')

  if (nota !== undefined) {
    if (typeof nota !== 'string') errors.push('nota debe ser string.')
    else if (nota.trim().length > 500)
      errors.push('nota máximo 500 caracteres.')
  }

  if (errors.length) return res.status(400).json({ ok: false, errors })
  next()
}

export function validatePatchAssign(req, res, next) {
  const errors = []
  const { id_personal, asignado_a } = req.body

  if (!id_personal || !isValidIdPersonal(id_personal))
    errors.push('id_personal (actor) es requerido.')
  if (asignado_a === undefined || asignado_a === null)
    errors.push('asignado_a es requerido.')
  else validateAsignadoA(asignado_a, errors)

  if (errors.length) return res.status(400).json({ ok: false, errors })
  next()
}

export function validateDeleteAssign(req, res, next) {
  const { id_personal } = req.body
  if (!id_personal || !isValidIdPersonal(id_personal)) {
    return res
      .status(400)
      .json({ ok: false, error: 'id_personal (actor) es requerido.' })
  }
  next()
}

export function validatePatchAddRemoveIds(req, res, next) {
  const errors = []
  const { id_personal, add, remove } = req.body

  if (!id_personal || !isValidIdPersonal(id_personal))
    errors.push('id_personal (actor) es requerido.')

  if (add !== undefined && !Array.isArray(add))
    errors.push('add debe ser array.')
  if (remove !== undefined && !Array.isArray(remove))
    errors.push('remove debe ser array.')

  if (Array.isArray(add) && add.some(x => !isValidIdPersonal(x)))
    errors.push('add contiene id_personal inválidos.')
  if (Array.isArray(remove) && remove.some(x => !isValidIdPersonal(x)))
    errors.push('remove contiene id_personal inválidos.')

  if (errors.length) return res.status(400).json({ ok: false, errors })
  next()
}

export function validatePatchServicios(req, res, next) {
  const errors = []
  const { id_personal, add, remove } = req.body

  if (!id_personal || !isValidIdPersonal(id_personal))
    errors.push('id_personal (actor) es requerido.')
  if (add !== undefined && !Array.isArray(add))
    errors.push('add debe ser array.')
  if (remove !== undefined && !Array.isArray(remove))
    errors.push('remove debe ser array.')

  const isValidText = v =>
    typeof v === 'string' && v.trim().length > 0 && v.trim().length <= 120

  if (Array.isArray(add) && add.some(x => !isValidText(x)))
    errors.push('add contiene servicios inválidos (string).')
  if (Array.isArray(remove) && remove.some(x => !isValidText(x)))
    errors.push('remove contiene servicios inválidos (string).')

  if (errors.length) return res.status(400).json({ ok: false, errors })
  next()
}

export function validatePatchAttachments(req, res, next) {
  const errors = []
  const { id_personal, add, remove } = req.body

  if (!id_personal || !isValidIdPersonal(id_personal))
    errors.push('id_personal (actor) es requerido.')

  if (add !== undefined) {
    if (!Array.isArray(add)) errors.push('add debe ser array de adjuntos.')
    else validateAttachmentsArray(add, errors)
  }

  if (remove !== undefined) {
    if (!Array.isArray(remove)) errors.push('remove debe ser array de fileId.')
    else if (remove.some(x => typeof x !== 'string' || !x.trim()))
      errors.push('remove debe contener fileId strings no vacíos.')
  }

  if (errors.length) return res.status(400).json({ ok: false, errors })
  next()
}
