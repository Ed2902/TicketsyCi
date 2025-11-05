// src/modules/CrearArea/controller.js
import {
  createArea,
  listAreas,
  getAreaById,
  updateArea,
  softDeleteArea,
  allAreas
} from './services.js';
import { ORG_ENUM } from '../CrearTicket/model.js';
  // función para resolver orgId desde headers, query o body
function resolveOrgId(req) {
  const raw = (
    req.header('x-org-id') ||
    req.query?.orgId ||
    req.body?.orgId ||
    ''
  ).toString().trim().toLowerCase();

  if (!raw) {
    return { error: 'Falta x-org-id u orgId' };
  }

  if (!ORG_ENUM.includes(raw)) {
    return {
      error: `orgId inválido. Use uno de: ${ORG_ENUM.join(', ')}`
    };
  }

  return { value: raw };
}
// para crear area
export async function create(req, res, next) {
  try {
    const org = resolveOrgId(req);
    if (org.error) {
      return res.status(400).json({ error: true, message: org.error });
    }

    const createdBy = req.header('x-principal-id') || null;
    const body = req.validated?.body || req.body;

    const area = await createArea({
      orgId: org.value,
      createdBy,
      payload: body
    });

    return res.status(201).json(area);
  } catch (e) {
    // índice único orgId+name
    if (e?.code === 11000) {
      return res.status(409).json({
        error: true,
        message: 'Ya existe un área con ese nombre en esta organización'
      });
    }
    next(e);
  }
}

// para listar areas
export async function list(req, res, next) {
  try {
    const org = resolveOrgId(req);
    if (org.error) {
      return res.status(400).json({ error: true, message: org.error });
    }

    const onlyActive = req.validated?.query?.active ?? undefined;
    const rows = await listAreas({ orgId: org.value, onlyActive });
    res.json(rows);
  } catch (e) {
    next(e);
  }
}
// para traer detalle de area
export async function detail(req, res, next) {
  try {
    const org = resolveOrgId(req);
    if (org.error) {
      return res.status(400).json({ error: true, message: org.error });
    }

    const id = req.validated?.params?.id || req.params?.id;
    const doc = await getAreaById({ orgId: org.value, id });

    if (!doc) {
      return res.status(404).json({ error: true, message: 'Área no encontrada' });
    }

    res.json(doc);
  } catch (e) {
    next(e);
  }
}

// para actualizar area
export async function patch(req, res, next) {
  try {
    const org = resolveOrgId(req);
    if (org.error) {
      return res.status(400).json({ error: true, message: org.error });
    }

    const id = req.validated?.params?.id || req.params?.id;
    const body = req.validated?.body || req.body;

    const doc = await updateArea({ orgId: org.value, id, payload: body });
    if (!doc) {
      return res.status(404).json({ error: true, message: 'Área no encontrada' });
    }

    res.json(doc);
  } catch (e) {
    next(e);
  }
}
// para eliminar area 
export async function remove(req, res, next) {
  try {
    const org = resolveOrgId(req);
    if (org.error) {
      return res.status(400).json({ error: true, message: org.error });
    }

    const id = req.validated?.params?.id || req.params?.id;
    const doc = await softDeleteArea({ orgId: org.value, id });

    if (!doc) {
      return res.status(404).json({ error: true, message: 'Área no encontrada' });
    }

    res.json({ ok: true, id: doc._id, active: doc.active });
  } catch (e) {
    next(e);
  }
}
//  para traer todas las areas 
export async function all(req, res, next) {
  try {
    const orgId =
      req.validated?.headers?.['x-org-id'] ||
      req.validated?.query?.orgId ||
      undefined;
    const rows = await allAreas({ orgId });
    res.json(rows);
  } catch (e) {
    next(e);
  }
}