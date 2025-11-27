import mongoose from 'mongoose';
import { Ticket } from './model.js';
import { Counter } from '../_shared/Counter.js';

const pad = (n, width = 4) => String(n).padStart(width, '0');

/* ============================================================
   🔹 HELPERS PARA COLECCIONES DE METADATOS
   ============================================================ */
function categoriesCol() {
  return mongoose.connection.collection('ticket_categories');
}

function prioritiesCol() {
  return mongoose.connection.collection('ticket_priorities');
}

function statusesCol() {
  return mongoose.connection.collection('ticket_statuses');
}

// 👇 Ajusta el nombre de la colección si tu colección de usuarios se llama distinto
function usersCol() {
  return mongoose.connection.collection('users');
}

/* ============================================================
   🔹 FUNCIONES PARA META DE TICKETS
   Usadas por:
   - GET /tikets/tickets/categories
   - GET /tikets/tickets/priorities
   - GET /tikets/tickets/statuses
   - GET /tikets/tickets/users
   ============================================================ */

export async function listCategories({ orgId }) {
  const filter = {};
  if (orgId) filter.orgId = orgId;

  const docs = await categoriesCol()
    .find({})
    .sort({ name: 1 })
    .toArray();

  // devolvemos tal cual; si quieres normalizar, aquí es el lugar
  return docs;
}

export async function listPriorities({ orgId }) {
  const filter = {};
  if (orgId) filter.orgId = orgId;

  const docs = await prioritiesCol()
    .find({})
    .sort({ name: 1 })
    .toArray();

  return docs;
}

export async function listStatuses({ orgId }) {
  const filter = {};
  if (orgId) filter.orgId = orgId;

  const docs = await statusesCol()
    .find({})
    .sort({ name: 1 })
    .toArray();

  return docs;
}

export async function listUsers({ orgId }) {
  const filter = {};
  if (orgId) filter.orgId = orgId;

  const docs = await usersCol()
    .find({})
    .sort({ name: 1 })
    .toArray();

  return docs;
}

/* ============================================================
   🔹 LO QUE YA TENÍAS: LIST, DETAIL, CREATE, UPDATE, REMOVE...
   ============================================================ */

async function nextTicketCode(orgId) {
  const doc = await Counter.findOneAndUpdate(
    { orgId, name: 'ticket' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `TCK-${pad(doc.seq)}`;
}

export async function list({
  orgId,
  q,
  statusId,
  priorityId,
  categoryId,
  limit = 50,
  page = 1,
}) {
  const filter = {};
  if (orgId) filter.orgId = orgId;
  if (statusId) filter.statusId = statusId;
  if (priorityId) filter.priorityId = priorityId;
  if (categoryId) filter.categoryId = categoryId;
  if (q) filter.$text = { $search: q };

  const skip = (page - 1) * limit;

  const [rows, total] = await Promise.all([
    Ticket.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Ticket.countDocuments(filter),
  ]);

  return {
    rows,
    total,
    page,
    limit,
    pages: Math.max(1, Math.ceil(total / limit)),
  };
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
    title,
    description,
    categoryId,
    priorityId,
    statusId,
    // objetos:
    reporter,
    assignee,
    // opcionales:
    watchers = [],
    attachmentsCount = 0,
    tags = [],
    custom = {},
    dueAt = null,
  } = payload;

  // Validaciones mínimas (además del validador Zod)
  const must = {
    title,
    description,
    categoryId,
    priorityId,
    statusId,
    reporter,
    assignee,
  };
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
    dueAt,
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

// src/modules/CrearTicket/services.js
export async function createTicketPackage({
  orgId,
  principalId,
  ticketData,
  firstMessageBody,
  uploadedFiles = [],
}) {
  // 1) Generamos un code si no viene en ticketData
  const generatedCode =
    ticketData.code || `TCK-${orgId}-${Date.now()}`; // puedes cambiar el formato si quieres

  // 2) Crear el ticket directamente con el modelo Ticket
  const ticketDoc = await Ticket.create({
    code: generatedCode, // 👈 aquí usamos siempre un code
    orgId,
    title: ticketData.title,
    description: ticketData.description,
    categoryId: ticketData.categoryId,
    priorityId: ticketData.priorityId,
    statusId: ticketData.statusId,

    reporter: {
      id: principalId,
    },
    assignee: {
      id: ticketData.assigneeId,
      type: ticketData.assigneeType,
    },
  });

  const ticket =
    typeof ticketDoc.toObject === 'function' ? ticketDoc.toObject() : ticketDoc;

  // 3) Mensaje inicial (todavía simulado)
  const message = firstMessageBody
    ? {
        body: firstMessageBody,
        senderId: principalId,
        ticketId: ticket._id,
      }
    : null;

  // 4) Archivos (simulados de momento)
  const files = (uploadedFiles || []).map((f) => ({
    originalName: f.originalname,
    mimeType: f.mimetype,
    size: f.size,
    ticketId: ticket._id,
  }));

  // 5) Notificación (simulada)
  const notification = ticketData.assigneeId
    ? {
        to: ticketData.assigneeId,
        text: `Tienes un nuevo ticket: ${ticket.title}`,
        ticketId: ticket._id,
      }
    : null;

  return { ticket, message, files, notification };
}
