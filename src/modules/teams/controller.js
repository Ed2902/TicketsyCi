import {
  createTeam,
  listTeams,
  getTeamById,
  updateTeam,
  softDeleteTeam
} from './services.js';

export async function create(req, res, next) {
  try {
    // primero miro headers, si no, body
    const orgId =
      req.header('x-org-id') ||
      req.validated?.headers?.['x-org-id'] ||
      req.validated?.body?.orgId;

    if (!orgId) {
      return res
        .status(400)
        .json({ error: true, message: 'Falta orgId en header o body' });
    }

    const body = req.validated?.body || req.body;

    const doc = await createTeam({ orgId, payload: body });
    res.status(201).json(doc);
  } catch (e) {
    // si se repite el nombre
    if (e?.code === 11000) {
      return res
        .status(409)
        .json({ error: true, message: 'Ya existe un equipo con ese nombre' });
    }
    next(e);
  }
}

export async function list(req, res, next) {
  try {
    const orgId =
      req.header('x-org-id') || req.validated?.headers?.['x-org-id'];
    const onlyActive = req.validated?.query?.active ?? undefined;

    const rows = await listTeams({ orgId, onlyActive });
    res.json(rows);
  } catch (e) {
    next(e);
  }
}

export async function detail(req, res, next) {
  try {
    const orgId =
      req.header('x-org-id') || req.validated?.headers?.['x-org-id'];
    const id = req.validated?.params?.id || req.params?.id;

    const doc = await getTeamById({ orgId, id });
    if (!doc)
      return res
        .status(404)
        .json({ error: true, message: 'Team no encontrado' });

    res.json(doc);
  } catch (e) {
    next(e);
  }
}

export async function patch(req, res, next) {
  try {
    const orgId =
      req.header('x-org-id') || req.validated?.headers?.['x-org-id'];
    const id = req.validated?.params?.id || req.params?.id;
    const body = req.validated?.body || req.body;

    const doc = await updateTeam({ orgId, id, payload: body });
    if (!doc)
      return res
        .status(404)
        .json({ error: true, message: 'Team no encontrado' });

    res.json(doc);
  } catch (e) {
    next(e);
  }
}

export async function remove(req, res, next) {
  try {
    const orgId =
      req.header('x-org-id') || req.validated?.headers?.['x-org-id'];
    const id = req.validated?.params?.id || req.params?.id;

    const doc = await softDeleteTeam({ orgId, id });
    if (!doc)
      return res
        .status(404)
        .json({ error: true, message: 'Team no encontrado' });

    res.json({ ok: true, id: doc._id, active: doc.active });
  } catch (e) {
    next(e);
  }
}

export async function all(req, res, next) {
  try {
    const orgId =
      req.validated?.headers?.['x-org-id'] ||
      req.validated?.query?.orgId ||
      undefined;
    const rows = await allTeams({ orgId });
    res.json(rows);
  } catch (e) {
    next(e);
  }
}