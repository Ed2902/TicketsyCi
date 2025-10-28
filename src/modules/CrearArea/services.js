import mongoose from 'mongoose';
import { Area } from '../CrearArea/model.js';

export function createArea({ orgId, createdBy, payload }) {
  return Area.create({
    orgId,
    createdBy,
    name: payload.name,
    description: payload.description
  });
}

export function listAreas({ orgId, onlyActive }) {
  const q = { orgId };
  if (typeof onlyActive === 'boolean') q.active = onlyActive;
  return Area.find(q).sort({ name: 1 });
}

export function getAreaById({ orgId, id }) {
  return Area.findOne({ _id: new mongoose.Types.ObjectId(id), orgId });
}

export function updateArea({ orgId, id, payload }) {
  return Area.findOneAndUpdate(
    { _id: new mongoose.Types.ObjectId(id), orgId },
    { $set: payload },
    { new: true }
  );
}

// Borrado suave: active=false (mejor para histórico)
export function softDeleteArea({ orgId, id }) {
  return Area.findOneAndUpdate(
    { _id: new mongoose.Types.ObjectId(id), orgId },
    { $set: { active: false } },
    { new: true }
  );
}

// Si necesitas borrado duro:
// export function hardDeleteArea({ orgId, id }) {
//   return Area.deleteOne({ _id: new mongoose.Types.ObjectId(id), orgId });
// }
