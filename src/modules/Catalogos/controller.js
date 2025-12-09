// src/modules/Catalogos/controller.js
import { getOrgAndPrincipal } from '../_shared/orgPrincipal.js'
import * as services from './services.js'

/* ============================
   📂 CATEGORÍAS
   ============================ */

export async function listCategories(req, res, next) {
  try {
    const { orgId } = getOrgAndPrincipal(req) // 👈 sale de token o headers
    const rows = await services.listCategories(orgId)
    // Puedes devolver directo el array; tu parseListAxios lo soporta
    return res.json(rows)
  } catch (err) {
    next(err)
  }
}

export async function createCategory(req, res, next) {
  try {
    const { orgId, principalId } = getOrgAndPrincipal(req)
    const payload = {
      ...req.body,
      orgId,
      createdBy: principalId,
    }
    const created = await services.createCategory(payload)
    return res.status(201).json(created)
  } catch (err) {
    next(err)
  }
}

export async function detailCategory(req, res, next) {
  try {
    const { orgId } = getOrgAndPrincipal(req)
    const { id } = req.params
    const rows = await services.listCategories(orgId)
    const found = rows.find((r) => String(r._id) === String(id))

    if (!found) {
      return res
        .status(404)
        .json({ ok: false, message: 'Categoría no encontrada' })
    }

    return res.json(found)
  } catch (err) {
    next(err)
  }
}

export async function updateCategory(req, res, next) {
  try {
    const { orgId, principalId } = getOrgAndPrincipal(req)
    const { id } = req.params
    const payload = {
      ...req.body,
      orgId,
      updatedBy: principalId,
    }
    const updated = await services.updateCategory(id, payload)
    return res.json(updated)
  } catch (err) {
    next(err)
  }
}

export async function removeCategory(req, res, next) {
  try {
    const { orgId, principalId } = getOrgAndPrincipal(req)
    const { id } = req.params
    await services.deleteCategory(id, { orgId, principalId })
    return res.json({ ok: true })
  } catch (err) {
    next(err)
  }
}

/* ============================
   🚥 PRIORIDADES
   ============================ */

export async function listPriorities(req, res, next) {
  try {
    const { orgId } = getOrgAndPrincipal(req)
    const rows = await services.listPriorities(orgId)
    return res.json(rows)
  } catch (err) {
    next(err)
  }
}

export async function createPriority(req, res, next) {
  try {
    const { orgId, principalId } = getOrgAndPrincipal(req)
    const payload = {
      ...req.body,
      orgId,
      createdBy: principalId,
    }
    const created = await services.createPriority(payload)
    return res.status(201).json(created)
  } catch (err) {
    next(err)
  }
}

export async function detailPriority(req, res, next) {
  try {
    const { orgId } = getOrgAndPrincipal(req)
    const { id } = req.params
    const rows = await services.listPriorities(orgId)
    const found = rows.find((r) => String(r._id) === String(id))

    if (!found) {
      return res
        .status(404)
        .json({ ok: false, message: 'Prioridad no encontrada' })
    }

    return res.json(found)
  } catch (err) {
    next(err)
  }
}

export async function updatePriority(req, res, next) {
  try {
    const { orgId, principalId } = getOrgAndPrincipal(req)
    const { id } = req.params
    const payload = {
      ...req.body,
      orgId,
      updatedBy: principalId,
    }
    const updated = await services.updatePriority(id, payload)
    return res.json(updated)
  } catch (err) {
    next(err)
  }
}

export async function removePriority(req, res, next) {
  try {
    const { orgId, principalId } = getOrgAndPrincipal(req)
    const { id } = req.params
    await services.deletePriority(id, { orgId, principalId })
    return res.json({ ok: true })
  } catch (err) {
    next(err)
  }
}

/* ============================
   📊 ESTADOS
   ============================ */

export async function listStatuses(req, res, next) {
  try {
    const { orgId } = getOrgAndPrincipal(req)
    const rows = await services.listStatuses(orgId)
    return res.json(rows)
  } catch (err) {
    next(err)
  }
}

export async function createStatus(req, res, next) {
  try {
    const { orgId, principalId } = getOrgAndPrincipal(req)
    const payload = {
      ...req.body,
      orgId,
      createdBy: principalId,
    }
    const created = await services.createStatus(payload)
    return res.status(201).json(created)
  } catch (err) {
    next(err)
  }
}

export async function detailStatus(req, res, next) {
  try {
    const { orgId } = getOrgAndPrincipal(req)
    const { id } = req.params
    const rows = await services.listStatuses(orgId)
    const found = rows.find((r) => String(r._id) === String(id))

    if (!found) {
      return res
        .status(404)
        .json({ ok: false, message: 'Estado no encontrado' })
    }

    return res.json(found)
  } catch (err) {
    next(err)
  }
}

export async function updateStatus(req, res, next) {
  try {
    const { orgId, principalId } = getOrgAndPrincipal(req)
    const { id } = req.params
    const payload = {
      ...req.body,
      orgId,
      updatedBy: principalId,
    }
    const updated = await services.updateStatus(id, payload)
    return res.json(updated)
  } catch (err) {
    next(err)
  }
}

export async function removeStatus(req, res, next) {
  try {
    const { orgId, principalId } = getOrgAndPrincipal(req)
    const { id } = req.params
    await services.deleteStatus(id, { orgId, principalId })
    return res.json({ ok: true })
  } catch (err) {
    next(err)
  }
}
