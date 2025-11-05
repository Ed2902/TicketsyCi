// src/modules/Files/services.js
import { File } from './model.js';
import { Ticket } from '../CrearTicket/model.js';

export async function createFile({ orgId, ticketId, ownerPrincipalId, payload }) {
  // 1. guardamos el file
  const fileDoc = await File.create({
    orgId,
    ticketId,
    ownerPrincipalId,
    name: payload.name,
    mimeType: payload.mimeType,
    size: payload.size,
    storage: payload.storage || {}
  });

  // 2. si venía ticketId, actualizamos attachmentsCount del ticket
  if (ticketId) {
    await Ticket.findOneAndUpdate(
      { _id: ticketId, orgId },
      { $inc: { attachmentsCount: 1 } },
      { new: true }
    ).lean();
  }

  return fileDoc;
}

export async function listFilesByTicket({ orgId, ticketId }) {
  return File.find({ orgId, ticketId }).sort({ createdAt: -1 }).lean();
}

export async function allFiles({ orgId, limit = 100, page = 1 } = {}) {
  const q = {};
  if (orgId) q.orgId = orgId;

  const cursor = File.find(q)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const [rows, total] = await Promise.all([
    cursor,
    File.countDocuments(q),
  ]);

  return { rows, total, page, limit };
}