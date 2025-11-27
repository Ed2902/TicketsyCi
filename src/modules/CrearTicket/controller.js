import * as Service from './services.js'
import { ORG_ENUM } from './model.js'

// helper: normaliza y valida orgId
function resolveOrgId(req) {
  const raw = (
    req.header('x-org-id') ||
    req.query?.orgId ||
    req.body?.orgId ||
    ''
  )
    .toString()
    .trim()
    .toLowerCase()

  if (!raw) return { error: 'Falta x-org-id u orgId' }

  if (!ORG_ENUM.includes(raw)) {
    return { error: `orgId inválido. Use uno de: ${ORG_ENUM.join(', ')}` }
  }

  return { value: raw }
}

// helper: obtiene principal (reporter.id)
function resolvePrincipal(req, body) {
  const principal = req.header('x-principal-id') || body?.reporter?.id || ''
  if (!principal) return { error: 'Falta x-principal-id o body.reporter.id' }
  return { value: principal }
}

/* ============================================================
   META: categorías, prioridades, estados, usuarios
   Endpoints:
   - GET /tikets/tickets/categories
   - GET /tikets/tickets/priorities
   - GET /tikets/tickets/statuses
   - GET /tikets/tickets/users
   ============================================================ */

export async function listCategories(req, res, next) {
  try {
    const org = resolveOrgId(req)
    if (org.error) {
      return res.status(400).json({ error: true, message: org.error })
    }

    const data = await Service.listCategories({ orgId: org.value })
    return res.json(data)
  } catch (err) {
    next(err)
  }
}

export async function listPriorities(req, res, next) {
  try {
    const org = resolveOrgId(req)
    if (org.error) {
      return res.status(400).json({ error: true, message: org.error })
    }

    const data = await Service.listPriorities({ orgId: org.value })
    return res.json(data)
  } catch (err) {
    next(err)
  }
}

export async function listStatuses(req, res, next) {
  try {
    const org = resolveOrgId(req)
    if (org.error) {
      return res.status(400).json({ error: true, message: org.error })
    }

    const data = await Service.listStatuses({ orgId: org.value })
    return res.json(data)
  } catch (err) {
    next(err)
  }
}

export async function listUsers(req, res, next) {
  try {
    const org = resolveOrgId(req)
    if (org.error) {
      return res.status(400).json({ error: true, message: org.error })
    }

    const data = await Service.listUsers({ orgId: org.value })
    return res.json(data)
  } catch (err) {
    next(err)
  }
}

/* ============================================================
   LISTAR / DETALLE / CRUD DE TICKETS
   ============================================================ */

export async function list(req, res, next) {
  try {
    const org = resolveOrgId(req)
    if (org.error)
      return res.status(400).json({ error: true, message: org.error })

    const { q, statusId, priorityId, categoryId, limit, page } = req.query || {}
    const result = await Service.list({
      orgId: org.value,
      q,
      statusId,
      priorityId,
      categoryId,
      limit,
      page,
    })
    res.json(result)
  } catch (e) {
    next(e)
  }
}

export async function detail(req, res, next) {
  try {
    const org = resolveOrgId(req)
    if (org.error)
      return res.status(400).json({ error: true, message: org.error })

    const id = req.params?.id
    const doc = await Service.detail({ orgId: org.value, id })
    if (!doc)
      return res
        .status(404)
        .json({ error: true, message: 'Ticket no encontrado' })
    res.json(doc)
  } catch (e) {
    next(e)
  }
}

export async function create(req, res, next) {
  try {
    const body = req.body || {}

    const org = resolveOrgId(req)
    if (org.error)
      return res.status(400).json({ error: true, message: org.error })

    const principalR = resolvePrincipal(req, body)
    if (principalR.error)
      return res
        .status(400)
        .json({ error: true, message: principalR.error })

    // si no vino reporter, al menos setea el id
    if (!body.reporter) body.reporter = { id: principalR.value }

    const doc = await Service.create({
      orgId: org.value,
      principal: principalR.value,
      payload: body,
    })
    res.status(201).json(doc)
  } catch (e) {
    next(e)
  }
}

export async function update(req, res, next) {
  try {
    const org = resolveOrgId(req)
    if (org.error)
      return res.status(400).json({ error: true, message: org.error })

    const id = req.params?.id
    const body = req.body || {}
    const doc = await Service.update({ orgId: org.value, id, payload: body })
    if (!doc)
      return res
        .status(404)
        .json({ error: true, message: 'Ticket no encontrado' })
    res.json(doc)
  } catch (e) {
    next(e)
  }
}

export async function remove(req, res, next) {
  try {
    const org = resolveOrgId(req)
    if (org.error)
      return res.status(400).json({ error: true, message: org.error })

    const id = req.params?.id
    const ok = await Service.remove({ orgId: org.value, id })
    if (!ok)
      return res
        .status(404)
        .json({ error: true, message: 'Ticket no encontrado' })
    res.json({ ok: true, id })
  } catch (e) {
    next(e)
  }
}

export async function all(req, res, next) {
  try {
    // si viene en header o query, lo uso, si no, saco todo
    const orgId =
      req.validated?.headers?.['x-org-id'] ||
      req.validated?.query?.orgId ||
      undefined

    const rows = await Service.all({ orgId })
    return res.json(rows)
  } catch (e) {
    next(e)
  }
}

/* ============================================================
   CREAR TICKET COMPLETO (ticket + mensaje + archivos + notif)
   Endpoint: POST /tikets/tickets/full
   ============================================================ */

export async function createFull(req, res, next) {
  try {
    const body = req.body || {}

    const org = resolveOrgId(req)
    if (org.error)
      return res.status(400).json({ error: true, message: org.error })

    const principalR = resolvePrincipal(req, body)
    if (principalR.error)
      return res
        .status(400)
        .json({ error: true, message: principalR.error })

    const {
      title,
      description,
      categoryId,
      priorityId,
      statusId,
      assigneeType,
      assigneeId,
      firstMessageBody,
    } = body

    const uploadedFiles = req.files || []

    const result = await Service.createTicketPackage({
      orgId: org.value,
      principalId: principalR.value,
      ticketData: {
        title,
        description,
        categoryId,
        priorityId,
        statusId,
        assigneeType,
        assigneeId,
      },
      firstMessageBody,
      uploadedFiles,
    })

    return res.status(201).json(result)
  } catch (err) {
    next(err)
  }
}
