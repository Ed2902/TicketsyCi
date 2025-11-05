
import { Notification } from './model.js';

export async function list({ orgId, principalId, type, read, limit = 20, page = 1 }) {
  const q = {};
  if (orgId) q.orgId = orgId;
  if (principalId) q.principalId = principalId;
  if (type) q.type = type;
  if (typeof read === 'boolean') q.read = read;

  const skip = (Number(page) - 1) * Number(limit);
  const [rows, total] = await Promise.all([
    Notification.find(q).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
    Notification.countDocuments(q)
  ]);

  return { total, page: Number(page), limit: Number(limit), rows };
}

export async function listAll({ orgId, principalId, type, read, limit = 50, page = 1 }) {
  // Igual que list, pero no exige principalId (dejas filtros opcionales)
  return list({ orgId, principalId, type, read, limit, page });
}

export async function detail({ orgId, id }) {
  const q = { _id: id };
  if (orgId) q.orgId = orgId;
  return Notification.findOne(q).lean();
}

export async function create({ orgId, principalId, type, payload = {}, read = false }) {
  return Notification.create({ orgId, principalId, type, payload, read, createdAt: new Date() });
}

export async function markRead({ orgId, id, read = true }) {
  const q = { _id: id };
  if (orgId) q.orgId = orgId;
  return Notification.findOneAndUpdate(q, { $set: { read } }, { new: true, upsert: false }).lean();
}

export async function markAllRead({ orgId, principalId, read = true }) {
  const q = {};
  if (orgId) q.orgId = orgId;
  if (principalId) q.principalId = principalId;
  const r = await Notification.updateMany(q, { $set: { read } });
  return { ok: true, matched: r.matchedCount ?? r.n, modified: r.modifiedCount ?? r.nModified };
}

export async function remove({ orgId, id }) {
  const q = { _id: id };
  if (orgId) q.orgId = orgId;
  const r = await Notification.deleteOne(q);
  return r.deletedCount > 0;
}
