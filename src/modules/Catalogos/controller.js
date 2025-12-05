// src/modules/Catalogos/controller.js
import * as services from './services.js'

// Helper para obtener orgId
function getOrgId(req) {
  if (req.body?.orgId) return req.body.orgId
  if (req.query?.orgId) return req.query.orgId
  if (req.user?.orgId) return req.user.orgId
  return null
}

/* ============================
   📂 CATEGORÍAS
   ============================ */

export async function listCategories(req, res, next) {
  try {
    const orgId = getOrgId(req)
    if (!orgId) {
      return res.status(400).json({
        ok: false,
        message: 'orgId es requerido',
      })
    }
    const rows = await services.listCategories(orgId)
    res.json(rows)
  } catch (err) {
    next(err)
  }
}

export async function createCategory(req, res, next) {
  try {
    const orgId = getOrgId(req)
    if (!orgId) {
      return res.status(400).json({
        ok: false,
        message: 'orgId es requerido',
      })
    }
    const payload = { ...req.body, orgId }
    const created = await services.createCategory(payload)
    res.status(201).json(created)
  } catch (err) {
    next(err)
  }
}

export async function detailCategory(req, res, next) {
  try {
    const { id } = req.params
    const rows = await services.listCategories(getOrgId(req))
    const found = rows.find((r) => String(r._id) === String(id))
    if (!found) {
      return res.status(404).json({ ok: false, message: 'Categoría no encontrada' })
    }
    res.json(found)
  } catch (err) {
    next(err)
  }
}

export async function updateCategory(req, res, next) {
  try {
    const { id } = req.params
    const updated = await services.updateCategory(id, req.body)
    res.json(updated)
  } catch (err) {
    next(err)
  }
}

export async function removeCategory(req, res, next) {
  try {
    const { id } = req.params
    await services.deleteCategory(id)
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
}

/* ============================
   🚥 PRIORIDADES
   ============================ */

export async function listPriorities(req, res, next) {
  try {
    const orgId = getOrgId(req)
    if (!orgId) {
      return res.status(400).json({
        ok: false,
        message: 'orgId es requerido',
      })
    }
    const rows = await services.listPriorities(orgId)
    res.json(rows)
  } catch (err) {
    next(err)
  }
}

export async function createPriority(req, res, next) {
  try {
    const orgId = getOrgId(req)
    if (!orgId) {
      return res.status(400).json({
        ok: false,
        message: 'orgId es requerido',
      })
    }
    const payload = { ...req.body, orgId }
    const created = await services.createPriority(payload)
    res.status(201).json(created)
  } catch (err) {
    next(err)
  }
}

export async function detailPriority(req, res, next) {
  try {
    const { id } = req.params
    const rows = await services.listPriorities(getOrgId(req))
    const found = rows.find((r) => String(r._id) === String(id))
    if (!found) {
      return res.status(404).json({ ok: false, message: 'Prioridad no encontrada' })
    }
    res.json(found)
  } catch (err) {
    next(err)
  }
}

export async function updatePriority(req, res, next) {
  try {
    const { id } = req.params
    const updated = await services.updatePriority(id, req.body)
    res.json(updated)
  } catch (err) {
    next(err)
  }
}

export async function removePriority(req, res, next) {
  try {
    const { id } = req.params
    await services.deletePriority(id)
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
}

/* ============================
   📊 ESTADOS
   ============================ */

export async function listStatuses(req, res, next) {
  try {
    const orgId = getOrgId(req)
    if (!orgId) {
      return res.status(400).json({
        ok: false,
        message: 'orgId es requerido',
      })
    }
    const rows = await services.listStatuses(orgId)
    res.json(rows)
  } catch (err) {
    next(err)
  }
}

export async function createStatus(req, res, next) {
  try {
    const orgId = getOrgId(req)
    if (!orgId) {
      return res.status(400).json({
        ok: false,
        message: 'orgId es requerido',
      })
    }
    const payload = { ...req.body, orgId }
    const created = await services.createStatus(payload)
    res.status(201).json(created)
  } catch (err) {
    next(err)
  }
}

export async function detailStatus(req, res, next) {
  try {
    const { id } = req.params
    const rows = await services.listStatuses(getOrgId(req))
    const found = rows.find((r) => String(r._id) === String(id))
    if (!found) {
      return res.status(404).json({ ok: false, message: 'Estado no encontrado' })
    }
    res.json(found)
  } catch (err) {
    next(err)
  }
}

export async function updateStatus(req, res, next) {
  try {
    const { id } = req.params
    const updated = await services.updateStatus(id, req.body)
    res.json(updated)
  } catch (err) {
    next(err)
  }
}

export async function removeStatus(req, res, next) {
  try {
    const { id } = req.params
    await services.deleteStatus(id)
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
}
