import {
  createArea,
  listAreas,
  getAreaById,
  updateArea,
  softDeleteArea
} from '../CrearArea/services.js';
  // CrearArea Controller

export async function create(req, res, next) {
  try {
    const orgId = req.header('x-org-id') || req.body?.orgId || 'impresistem';
    const createdBy = req.header('x-principal-id') || req.body?.createdBy || 'usr_luis_puentes';
    const body = req.validated?.body || req.body;

    const area = await createArea({ orgId, createdBy, payload: body });
    return res.status(201).json(area);
  } catch (e) {
    // Manejo de duplicados (índice único orgId+name)
    if (e?.code === 11000) {
      return res.status(409).json({ error: true, message: 'Ya existe un área con ese nombre en esta organización' });
    }
    next(e);
  }
}
  // Listar áreas
export async function list(req, res, next) {
  try {
    const orgId = req.header('x-org-id') || 'impresistem';
    const onlyActive = req.validated?.query?.active ?? undefined; // true/false o undefined
    const rows = await listAreas({ orgId, onlyActive });
    res.json(rows);
  } catch (e) {
    next(e);
  }
}
 // Detalle de área por ID
export async function detail(req, res, next) {
  try {
    const orgId = req.header('x-org-id') || 'impresistem';
    const id = req.validated?.params?.id || req.params?.id;
    const doc = await getAreaById({ orgId, id });
    if (!doc) return res.status(404).json({ error: true, message: 'Área no encontrada' });
    res.json(doc);
  } catch (e) {
    next(e);
  }
}
 // Actualizar área por ID
export async function patch(req, res, next) {
  try {
    const orgId = req.header('x-org-id') || 'impresistem';
    const id = req.validated?.params?.id || req.params?.id;
    const body = req.validated?.body || req.body;
    const doc = await updateArea({ orgId, id, payload: body });
    if (!doc) return res.status(404).json({ error: true, message: 'Área no encontrada' });
    res.json(doc);
  } catch (e) {
  
    next(e);
  }
}
// Borrado suave de área por ID
export async function remove(req, res, next) {
  try {
    const orgId = req.header('x-org-id') || 'impresistem';
    const id = req.validated?.params?.id || req.params?.id;
    const doc = await softDeleteArea({ orgId, id });
    if (!doc) return res.status(404).json({ error: true, message: 'Área no encontrada' });
    res.json({ ok: true, id: doc._id, active: doc.active });
  } catch (e) {
    next(e);
  }
}
