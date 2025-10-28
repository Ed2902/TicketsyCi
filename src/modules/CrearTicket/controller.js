import { createTicket } from './services.js';

export async function create(req, res, next) {
  try {
    // auth via headers o middleware (soporta ambos)
    const orgIdHeader = req.header('x-org-id');
    const principalIdHeader = req.header('x-principal-id');
    const orgId = req.auth?.orgId || orgIdHeader || 'impresistem';
    const principalId = req.auth?.principalId || principalIdHeader || 'usr_luis_puentes';

    const body = req.validated?.body || req.body;

    const result = await createTicket({
      orgId: body.orgId || orgId,
      principalId,
      payload: body
    });

    return res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}
