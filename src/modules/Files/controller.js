// src/modules/Files/controller.js
import * as Service from './services.js';

export async function create(req, res, next) {
  try {
    const orgId = req.header('x-org-id') || req.validated?.headers?.['x-org-id'];
    const principal = req.header('x-principal-id') || req.validated?.headers?.['x-principal-id'] || 'system';

    const { ticketId, name, mimeType, size, storage } = req.validated.body;

    const doc = await Service.createFile({
      orgId,
      ticketId,
      ownerPrincipalId: principal,
      payload: { name, mimeType, size, storage }
    });

    res.status(201).json(doc);
  } catch (e) {
    next(e);
  }
}

export async function listByTicket(req, res, next) {
  try {
    const orgId = req.header('x-org-id') || req.validated?.headers?.['x-org-id'];
    const ticketId = req.validated.params.ticketId;

    const rows = await Service.listFilesByTicket({ orgId, ticketId });
    res.json(rows);
  } catch (e) {
    next(e);
  }
}
export async function all(req, res, next) {
  try {
    const orgId = req.validated?.query?.orgId || undefined;
    const { limit, page } = req.validated?.query || {};
    const result = await Service.allFiles({ orgId, limit, page });
    res.json(result);
  } catch (e) { next(e); }
}