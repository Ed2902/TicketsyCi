// src/modules/CrearArea/services.js
import e from 'express';
import { Area } from './model.js';

export async function createArea({ orgId, createdBy, payload }) {
  return Area.create({
    orgId,
    createdBy,
    name: payload.name,
    description: payload.description ?? ''
  });
}

export async function listAreas({ orgId, onlyActive }) {
  const filter = { orgId };
  if (typeof onlyActive === 'boolean') {
    filter.active = onlyActive;
  }
  return Area.find(filter).sort({ name: 1 }).lean();
}

export async function getAreaById({ orgId, id }) {
  return Area.findOne({ _id: id, orgId }).lean();
}

export async function updateArea({ orgId, id, payload }) {
  return Area.findOneAndUpdate(
    { _id: id, orgId },
    { $set: payload },
    { new: true }
  ).lean();
}

export async function softDeleteArea({ orgId, id }) {
  return Area.findOneAndUpdate(
    { _id: id, orgId },
    { $set: { active: false } },
    { new: true }
  ).lean();
}


  
export async function allAreas({ orgId } = {}) {
  const filter = {};
  if (orgId) filter.orgId = orgId;
  return Area.find(filter).lean();
}

