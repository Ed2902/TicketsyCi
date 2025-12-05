// src/modules/Catalogos/services.js
import {
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from './model.js'

// ========== CATEGORÍAS ==========

export async function listCategories(orgId) {
  return TicketCategory.find({ orgId }).sort({ name: 1 }).lean()
}

export async function createCategory(data) {
  const doc = new TicketCategory(data)
  return doc.save()
}

export async function updateCategory(id, data) {
  return TicketCategory.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).lean()
}

export async function deleteCategory(id) {
  return TicketCategory.findByIdAndDelete(id).lean()
}

// ========== PRIORIDADES ==========

export async function listPriorities(orgId) {
  return TicketPriority.find({ orgId }).sort({ weight: 1 }).lean()
}

export async function createPriority(data) {
  const doc = new TicketPriority(data)
  return doc.save()
}

export async function updatePriority(id, data) {
  return TicketPriority.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).lean()
}

export async function deletePriority(id) {
  return TicketPriority.findByIdAndDelete(id).lean()
}

// ========== ESTADOS ==========

export async function listStatuses(orgId) {
  return TicketStatus.find({ orgId }).sort({ order: 1 }).lean()
}

export async function createStatus(data) {
  const doc = new TicketStatus(data)
  return doc.save()
}

export async function updateStatus(id, data) {
  return TicketStatus.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).lean()
}

export async function deleteStatus(id) {
  return TicketStatus.findByIdAndDelete(id).lean()
}
