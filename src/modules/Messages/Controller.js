import * as Service from './service.js';
export async function listByTicket(req, res, next) {
  try {
    const p = req.validated.params;
    const q = req.validated.query ?? {};
    const orgId = q.orgId ?? req.headers['x-org-id']; // opcional
    const out = await Service.listByTicket({
      orgId,
      ticketId: p.ticketId,
      limit: q.limit,
      page: q.page
    });
    res.json(out);
  } catch (e) { next(e); }
}

export async function listAll(req, res, next) {
  try {
    const q = req.validated.query ?? {};
    const out = await Service.listAll({
      orgId: q.orgId,
      limit: q.limit,
      page: q.page
    });
    res.json(out);
  } catch (e) { next(e); }
}

export async function detail(req, res, next) {
  try {
    const orgId = req.headers['x-org-id'] ?? undefined;
    const id = req.validated.params.id;
    const doc = await Service.detail({ orgId, id });
    if (!doc) return res.status(404).json({ error: true, message: 'Mensaje no encontrado' });
    res.json(doc);
  } catch (e) { next(e); }
}

export async function create(req, res, next) {
  try {
    const b = req.validated.body;
    const doc = await Service.create({
      orgId: b.orgId,
      ticketId: b.ticketId,
      sender: b.sender,
      message: b.message,
      attachments: b.attachments
    });
    res.status(201).json(doc);
  } catch (e) { next(e); }
}

export async function patch(req, res, next) {
  try {
    const orgId = req.headers['x-org-id'] ?? undefined;
    const id = req.validated.params.id;
    const body = req.validated.body;
    const doc = await Service.patch({ orgId, id, payload: body });
    if (!doc) return res.status(404).json({ error: true, message: 'Mensaje no encontrado' });
    res.json(doc);
  } catch (e) { next(e); }
}

export async function remove(req, res, next) {
  try {
    const orgId = req.headers['x-org-id'] ?? undefined;
    const id = req.validated.params.id;
    const ok = await Service.remove({ orgId, id });
    if (!ok) return res.status(404).json({ error: true, message: 'Mensaje no encontrado' });
    res.json({ ok: true, id });
  } catch (e) { next(e); }
}
