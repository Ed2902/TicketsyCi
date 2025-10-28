import { Ticket } from './model.js';

export async function createTicket({ orgId, principalId, payload }) {
  const doc = await Ticket.create({
    orgId,
    title:       payload.title,
    description: payload.description,
    assignee:    payload.assignee,
    priority:    payload.priority ?? 'medium',
    category:    payload.category,
    status:      'open',
    createdBy:   principalId,
    watchers:    payload.watchers?.length ? payload.watchers : [principalId]
  });

  return doc;
}
