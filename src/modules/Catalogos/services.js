import {
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from './model.js'

/* =========================================
   🟦 CATEGORÍAS
   ========================================= */

export async function listCategories(orgId) {
  return TicketCategory.find({ orgId }).sort({ name: 1 }).lean()
}

export async function createCategory(data) {
  const doc = new TicketCategory({
    orgId: data.orgId,
    name: data.name,
    description: data.description,
    color: data.color,          
    active: data.active,
    createdBy: data.createdBy,
  })
  return doc.save()
}

export async function updateCategory(id, data) {
  const update = {}

  if (data.name !== undefined) update.name = data.name
  if (data.description !== undefined) update.description = data.description
  if (data.color !== undefined) update.color = data.color      //  clave
  if (data.active !== undefined) update.active = data.active
  if (data.updatedBy !== undefined) update.updatedBy = data.updatedBy

  return TicketCategory.findOneAndUpdate(
    { _id: id, orgId: data.orgId },    //  respeta organización
    { $set: update },
    { new: true, runValidators: true }
  ).lean()
}

export async function deleteCategory(id, meta = {}) {
  return TicketCategory.findOneAndDelete({
    _id: id,
    orgId: meta.orgId,
  }).lean()
}

/* =========================================
    PRIORIDADES
   ========================================= */

export async function listPriorities(orgId) {
  return TicketPriority.find({ orgId }).sort({ weight: 1 }).lean()
}

export async function createPriority(data) {
  const doc = new TicketPriority({
    orgId: data.orgId,
    name: data.name,
    description: data.description,
    color: data.color,          
    weight: data.weight,
    active: data.active,
    createdBy: data.createdBy,
  })
  return doc.save()
}

export async function updatePriority(id, data) {
  const update = {}

  if (data.name !== undefined) update.name = data.name
  if (data.description !== undefined) update.description = data.description
  if (data.color !== undefined) update.color = data.color    
  if (data.weight !== undefined) update.weight = data.weight
  if (data.active !== undefined) update.active = data.active
  if (data.updatedBy !== undefined) update.updatedBy = data.updatedBy

  return TicketPriority.findOneAndUpdate(
    { _id: id, orgId: data.orgId },
    { $set: update },
    { new: true, runValidators: true }
  ).lean()
}

export async function deletePriority(id, meta = {}) {
  return TicketPriority.findOneAndDelete({
    _id: id,
    orgId: meta.orgId,
  }).lean()
}

/* =========================================
    ESTADOS
   ========================================= */

export async function listStatuses(orgId) {
  return TicketStatus.find({ orgId }).sort({ order: 1 }).lean()
}

export async function createStatus(data) {
  const doc = new TicketStatus({
    orgId: data.orgId,
    name: data.name,
    description: data.description,
    color: data.color,           
    order: data.order,
    isClosed: data.isClosed,
    active: data.active,
    createdBy: data.createdBy,
  })
  return doc.save()
}

export async function updateStatus(id, data) {
  const update = {}

  if (data.name !== undefined) update.name = data.name
  if (data.description !== undefined) update.description = data.description
  if (data.color !== undefined) update.color = data.color       // 👈 aquí también
  if (data.order !== undefined) update.order = data.order
  if (data.isClosed !== undefined) update.isClosed = data.isClosed
  if (data.active !== undefined) update.active = data.active
  if (data.updatedBy !== undefined) update.updatedBy = data.updatedBy

  return TicketStatus.findOneAndUpdate(
    { _id: id, orgId: data.orgId },
    { $set: update },
    { new: true, runValidators: true }
  ).lean()
}

export async function deleteStatus(id, meta = {}) {
  return TicketStatus.findOneAndDelete({
    _id: id,
    orgId: meta.orgId,
  }).lean()
}
