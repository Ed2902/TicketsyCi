// src/modules/Teams/services.js
import { Team } from './model.js';

export async function createTeam({ orgId, payload }) {
  const doc = await Team.create({
    orgId,
    name: payload.name,
    description: payload.description,
    members: payload.members || []
  });
  return doc.toObject();
}

export async function listTeams({ orgId, onlyActive }) {
  const where = {};
  if (orgId) where.orgId = orgId;
  if (typeof onlyActive === 'boolean') where.active = onlyActive;

  return Team.find(where).sort({ name: 1 }).lean();
}

export async function getTeamById({ orgId, id }) {
  return Team.findOne({ _id: id, orgId }).lean();
}

export async function updateTeam({ orgId, id, payload }) {
  return Team.findOneAndUpdate(
    { _id: id, orgId },
    { $set: payload },
    { new: true }
  ).lean();
}

export async function softDeleteTeam({ orgId, id }) {
  return Team.findOneAndUpdate(
    { _id: id, orgId },
    { $set: { active: false } },
    { new: true }
  ).lean();
}

export async function allTeams({ orgId } = {}) {
  const filter = {};
  if (orgId) filter.orgId = orgId;
  return Team.find(filter).lean();
}