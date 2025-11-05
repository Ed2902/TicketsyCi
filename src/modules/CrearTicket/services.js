import mongoose from 'mongoose';
import { Ticket } from './model.js';
import { Counter } from '../_shared/Counter.js';

const pad = (n, width=4) => String(n).padStart(width, '0');

async function nextTicketCode(orgId) {
  const doc = await Counter.findOneAndUpdate(
    { orgId, name: 'ticket' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `TCK-${pad(doc.seq)}`;
}

export async function list({ orgId, q, statusId, priorityId, categoryId, limit = 50, page = 1 }) {
  const filter = {};
  if (orgId)      filter.orgId = orgId;
  if (statusId)   filter.statusId = statusId;
  if (priorityId) filter.priorityId = priorityId;
  if (categoryId) filter.categoryId = categoryId;
  if (q)          filter.$text = { $search: q };

  const skip = (page - 1) * limit;

  const [rows, total] = await Promise.all([
    Ticket.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Ticket.countDocuments(filter)
  ]);

  return { rows, total, page, limit, pages: Math.max(1, Math.ceil(total / limit)) };
}

export function detail({ orgId, id }) {
  if (!mongoose.isValidObjectId(id)) return null;
  const filter = { _id: id };
  if (orgId) filter.orgId = orgId;
  return Ticket.findOne(filter);
}

export async function create({ orgId, principal, payload }) {
  // Campos obligatorios según tu formato
  const {
    title, description,
    categoryId, priorityId, statusId,
    // objetos:
    reporter, assignee,
    // opcionales:
    watchers = [], attachmentsCount = 0, tags = [],
    custom = {}, dueAt = null
  } = payload;

  // Validaciones mínimas (además del validador Zod)
  const must = { title, description, categoryId, priorityId, statusId, reporter, assignee };
  for (const [k, v] of Object.entries(must)) {
    if (v === undefined || v === null || v === '') {
      const e = new Error(`Campo requerido faltante: ${k}`);
      e.status = 400;
      throw e;
    }
  }

  // Generar code único por org
  const code = await nextTicketCode(orgId);

  const doc = await Ticket.create({
    orgId,
    code,
    
    title,
    description,
    categoryId,
    priorityId,
    statusId,
    reporter,
    assignee,
    watchers,
    attachmentsCount,
    tags,
    custom,
    dueAt
  });

  return doc;
}

export function update({ orgId, id, payload }) {
  if (!mongoose.isValidObjectId(id)) return null;
  const filter = { _id: id };
  if (orgId) filter.orgId = orgId;

  // No permitimos cambiar orgId o code desde update
  const { orgId: _o, code: _c, ...rest } = payload || {};

  return Ticket.findOneAndUpdate(
    filter,
    { $set: rest, $currentDate: { updatedAt: true } },
    { new: true }
  );
}

// para eliminar 
export async function remove({ orgId, id }) {
  if (!mongoose.isValidObjectId(id)) return false;
  const filter = { _id: id };
  if (orgId) filter.orgId = orgId;
  const r = await Ticket.deleteOne(filter);
  return r.acknowledged && r.deletedCount === 1;
}


export async function all({ orgId }) {
  const filter = {};
  if (orgId) filter.orgId = orgId;
  return Ticket.find(filter).lean();
}
