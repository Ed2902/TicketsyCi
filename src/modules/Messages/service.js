// src/modules/Messages/service.js
import mongoose from 'mongoose';           // 👈 IMPORTANTE
import { TicketMessage } from "./Model.js";

export async function listByTicket({ orgId, ticketId, limit = 50, page = 1 }) {
  const q = {};

  if (orgId) q.orgId = orgId;

  if (ticketId) {
    // Si en Mongo está como ObjectId (por la captura que me mostraste)
    if (mongoose.Types.ObjectId.isValid(ticketId)) {
      q.ticketId = new mongoose.Types.ObjectId(ticketId);
    } else {
      // fallback por si algún día lo guardas como string
      q.ticketId = ticketId;
    }
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [rows, total] = await Promise.all([
    TicketMessage.find(q)
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    TicketMessage.countDocuments(q),
  ]);

  return { total, page: Number(page), limit: Number(limit), rows };
}

export async function listAll({ orgId, limit = 50, page = 1 }) {
  const q = {};
  if (orgId) q.orgId = orgId;

  const skip = (Number(page) - 1) * Number(limit);
  const [rows, total] = await Promise.all([
    TicketMessage.find(q)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    TicketMessage.countDocuments(q),
  ]);

  return { total, page: Number(page), limit: Number(limit), rows };
}

export async function detail({ orgId, id }) {
  const q = { _id: id };
  if (orgId) q.orgId = orgId;
  return TicketMessage.findOne(q).lean();
}

export async function create({
  orgId,
  ticketId,
  sender,
  message,
  attachments = [],
}) {
  return TicketMessage.create({
    orgId,
    ticketId,
    sender,
    message,
    attachments,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

export async function patch({ orgId, id, payload }) {
  const q = { _id: id };
  if (orgId) q.orgId = orgId;
  payload.updatedAt = new Date();
  return TicketMessage.findOneAndUpdate(
    q,
    { $set: payload },
    { new: true, upsert: false }
  ).lean();
}

export async function remove({ orgId, id }) {
  const q = { _id: id };
  if (orgId) q.orgId = orgId;
  const r = await TicketMessage.deleteOne(q);
  return r.deletedCount > 0;
}
