import mongoose from 'mongoose'
import { Ticket } from './model.js'
import { Counter } from '../_shared/Counter.js'
import { notifyTicketAssignedToPerson,
  notifyTicketAssignedToGroup
 } from '../Notifications/notifyEvents.js'
/* ============================================================
   🔹 HELPERS PARA COLECCIONES
   ============================================================ */
function categoriesCol() {
  return mongoose.connection.collection('ticket_categories')
}

function prioritiesCol() {
  return mongoose.connection.collection('ticket_priorities')
}

function statusesCol() {
  return mongoose.connection.collection('ticket_statuses')
}

// 👇 Ajusta el nombre de la colección si tu colección de usuarios se llama distinto
function usersCol() {
  return mongoose.connection.collection('users')
}

function ticketMessagesCol() {
  return mongoose.connection.collection('ticketMessages')
}

// 👇 NUEVO: colección de notificaciones
function ticketNotificationsCol() {
  // cambia 'notifications' si tu colección se llama distinto
  return mongoose.connection.collection('notifications')
}

/* ============================================================
   🔹 FUNCIONES PARA META DE TICKETS
   ============================================================ */

export async function listCategories({ orgId }) {
  const filter = {}
  if (orgId) filter.orgId = orgId

  const docs = await categoriesCol().find(filter).sort({ name: 1 }).toArray()
  return docs
}

export async function listPriorities({ orgId }) {
  const filter = {}
  if (orgId) filter.orgId = orgId

  const docs = await prioritiesCol().find(filter).sort({ name: 1 }).toArray()
  return docs
}

export async function listStatuses({ orgId }) {
  const filter = {}
  if (orgId) filter.orgId = orgId

  const docs = await statusesCol().find(filter).sort({ name: 1 }).toArray()
  return docs
}

export async function listUsers({ orgId }) {
  const filter = {}
  if (orgId) filter.orgId = orgId

  const docs = await usersCol().find(filter).sort({ name: 1 }).toArray()
  return docs
}

/* ============================================================
   🔹 LIST, DETAIL, CREATE, UPDATE, REMOVE, ALL
   ============================================================ */

async function nextTicketNumber(orgId) {
  const doc = await Counter.findOneAndUpdate(
    { orgId, name: 'ticket' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  )

  return doc.seq
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
  const filter = {}
  if (orgId) filter.orgId = orgId
  if (statusId) filter.statusId = statusId
  if (priorityId) filter.priorityId = priorityId
  if (categoryId) filter.categoryId = categoryId
  if (q) filter.$text = { $search: q }

  const skip = (page - 1) * limit

  const [rows, total] = await Promise.all([
    Ticket.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Ticket.countDocuments(filter),
  ])

  return {
    rows,
    total,
    page,
    limit,
    pages: Math.max(1, Math.ceil(total / limit)),
  }
}

export function detail({ orgId, id }) {
  if (!mongoose.isValidObjectId(id)) return null
  const filter = { _id: id }
  if (orgId) filter.orgId = orgId
  return Ticket.findOne(filter)
}

export async function create({ orgId, principal, payload }) {
  const {
    title,
    description,
    categoryId,
    priorityId,
    statusId,
    reporter,
    assignee,
    watchers = [],
    attachmentsCount = 0,
    tags = [],
    custom = {},
    dueAt = null,
  } = payload

  const must = {
    title,
    description,
    categoryId,
    priorityId,
    statusId,
    reporter,
    assignee,
  }
  for (const [k, v] of Object.entries(must)) {
    if (v === undefined || v === null || v === '') {
      const e = new Error(`Campo requerido faltante: ${k}`)
      e.status = 400
      throw e
    }
  }

  // 🔢 Generar code numérico único por org
  const code = await nextTicketNumber(orgId)

  const doc = await Ticket.create({
    orgId,
    code, // 👈 aquí queda 1, 2, 3...
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
  })

  return doc
}

export function update({ orgId, id, payload }) {
  if (!mongoose.isValidObjectId(id)) return null
  const filter = { _id: id }
  if (orgId) filter.orgId = orgId

  // No permitimos cambiar orgId o code desde update
  const { orgId: _o, code: _c, ...rest } = payload || {}

  return Ticket.findOneAndUpdate(
    filter,
    { $set: rest, $currentDate: { updatedAt: true } },
    { new: true }
  )
}

export async function remove({ orgId, id }) {
  if (!mongoose.isValidObjectId(id)) return false
  const filter = { _id: id }
  if (orgId) filter.orgId = orgId
  const r = await Ticket.deleteOne(filter)
  return r.acknowledged && r.deletedCount === 1
}

export async function all({ orgId }) {
  const filter = {}
  if (orgId) filter.orgId = orgId
  return Ticket.find(filter).lean()
}

/* ============================================================
   🔹 createTicketPackage (full: ticket + mensaje + notificaciones)
   ============================================================ */

export async function createTicketPackage({
  orgId,
  principalId,
  ticketData,
  firstMessageBody,
  uploadedFiles = [],
}) {
  console.log("🧩 createTicketPackage() llamado con:", {
    orgId,
    principalId,
    title: ticketData?.title,
    description: ticketData?.description,
    assigneeType: ticketData?.assigneeType,
    assigneeId: ticketData?.assigneeId,
    assigneeGroup: ticketData?.assigneeGroup,
    firstMessageBody,
    uploadedFilesLen: uploadedFiles.length,
  });

  const {
    title,
    description,
    categoryId,
    priorityId,
    statusId,
    assigneeType,
    assigneeId,
    assigneeGroup = [],
    // opcional: si en algún punto le pasas el nombre del actor
    actorName,
  } = ticketData || {};

  // 👉 Consideramos que es GRUPO si viene un array con al menos 1 id
  const isGroup =
    Array.isArray(assigneeGroup) && assigneeGroup.filter(Boolean).length > 0;

  // Normalizamos ids del grupo (únicos, strings, sin vacíos)
  const normalizedGroupIds = isGroup
    ? Array.from(
        new Set(
          assigneeGroup
            .filter(Boolean)
            .map((v) => String(v).trim())
            .filter((v) => v.length > 0)
        )
      )
    : [];

  if (isGroup && normalizedGroupIds.length === 0) {
    throw new Error(
      'Debe enviar al menos un integrante válido en assigneeGroup para asignar a un grupo.'
    );
  }

  let assignee;

  if (isGroup) {
    // 🔹 MODO GRUPO: usamos members, no id
    assignee = {
      type: "group",
      // id no es requerido cuando type === "group"
      members: normalizedGroupIds.map((id) => ({
        id, // luego si quieres puedes resolver name/email
      })),
    };
  } else {
    // 🔹 MODO PERSONA/TEAM: se mantiene casi igual
    const normalizedType =
      assigneeType === "team"
        ? "team"
        : "person"; // por defecto 'person'

    assignee = {
      type: normalizedType,
      id: assigneeId || principalId, // 👈 fallback al creador
      // members queda vacío
    };
  }

  const generatedCode = ticketData.code ?? (await nextTicketNumber(orgId));

  const ticketDoc = await Ticket.create({
    code: generatedCode,
    orgId,
    title,
    description,
    categoryId,
    priorityId,
    statusId,
    reporter: {
      id: principalId,
    },
    assignee, // 👈 persona o grupo
  });

  const ticket =
    typeof ticketDoc.toObject === "function" ? ticketDoc.toObject() : ticketDoc;

  console.log("🎫 Ticket creado:", {
    _id: ticket._id,
    code: ticket.code,
    title: ticket.title,
    assignee,
  });

  // === Mensaje inicial (opcional) ===
  const rawMessage = (firstMessageBody ?? ticketData.description ?? "").trim();

  console.log("💬 rawMessage calculado:", rawMessage);

  let message = null;

  if (rawMessage) {
    const now = new Date();

    console.log(
      "💾 Insertando mensaje en ticketMessages para ticket:",
      ticket._id
    );

    const insertResult = await ticketMessagesCol().insertOne({
      orgId,
      ticketId: ticket._id,
      sender: {
        id: principalId,
        type: "requester",
      },
      message: rawMessage,
      attachments: [],
      createdAt: now,
      updatedAt: now,
    });

    console.log("✅ Mensaje insertado con _id:", insertResult.insertedId);

    message = {
      _id: insertResult.insertedId,
      orgId,
      ticketId: ticket._id,
      sender: {
        id: principalId,
        type: "requester",
      },
      message: rawMessage,
      attachments: [],
      createdAt: now,
      updatedAt: now,
    };
  } else {
    console.log("⚠️ No se creó mensaje porque rawMessage está vacío");
  }

  // === Archivos (placeholder) ===
  const files = (uploadedFiles || []).map((f) => ({
    originalName: f.originalname,
    mimeType: f.mimetype,
    size: f.size,
    ticketId: ticket._id,
  }));

  /* ============================================================
     🔔 NOTIFICACIONES MODERNAS (persona / grupo)
     - Usan Notification + WebPush vía notifyEvents.js
     ============================================================ */

  // Actor = quien crea el ticket
  const actor = {
    id: principalId,
    name: actorName || `Usuario ${principalId}`, // luego podemos pasar nombre real
  };

  // Persona
  if (!isGroup) {
    const toId = assignee.id; // ya tiene fallback al principalId arriba
    if (toId) {
      console.log("🔔 Notificación: ticket_assigned_person =>", toId);
      await notifyTicketAssignedToPerson({
        orgId,
        assigneeId: toId,
        ticket,
        actor,
      });
    } else {
      console.log("ℹ️ No hay assigneeId para notificar (modo persona).");
    }
  }

  // Grupo
  if (isGroup && normalizedGroupIds.length > 0) {
    console.log(
      "🔔 Notificaciones para grupo (miembros):",
      normalizedGroupIds
    );
    await notifyTicketAssignedToGroup({
      orgId,
      memberIds: normalizedGroupIds,
      ticket,
      actor,
    });
  }

  // Ya no devolvemos las viejas "notifications" porque ahora
  // se guardan en la colección notifications del módulo nuevo
  return { ticket, message, files };
}