import mongoose from 'mongoose';

const TicketSchema = new mongoose.Schema(
  {
    orgId: { type: String, required: true, index: true },

    title: { type: String, required: true },
    description: { type: String, required: true },

    assignee: {
      type: { type: String, enum: ['person', 'team'], required: true },
      id:   { type: String, required: true }, // principalId o teamId externo
      name: { type: String }
    },

    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium', index: true },
    category: { type: String },

    status:   { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open', index: true },

    createdBy: { type: String, required: true },
    watchers:  [{ type: String, index: true }]
  },
  { timestamps: true }
);

TicketSchema.index({ orgId: 1, 'assignee.type': 1, 'assignee.id': 1, status: 1 });
TicketSchema.index({ orgId: 1, title: 'text', description: 'text' });

export const Ticket = mongoose.model('Ticket', TicketSchema);
