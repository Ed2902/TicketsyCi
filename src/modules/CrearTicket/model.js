// src/modules/CrearTicket/model.js
import mongoose from 'mongoose';

const { Schema } = mongoose;
const ObjectId = Schema.Types.ObjectId;


export const ORG_ENUM = ['fastway', 'metalharvest', 'greenway'];

const PersonRefSchema = new Schema({
  id:   { type: String, required: true },
  name: { type: String },
  email:{ type: String }
}, { _id: false });

const AssigneeSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['person', 'team', 'group'], // 👈 ahora también permite 'group'
      required: true,
    },
    // id:
    //  - requerido para 'person' y 'team'
    //  - NO requerido para 'group'
    id: {
      type: String,
      required: function () {
        return this.type === 'person' || this.type === 'team'
      },
    },
    name: { type: String },

    // 👇 nuevo: cuando es grupo, aquí van las personas
    members: {
      type: [PersonRefSchema], // reutilizas { id, name, email }
      default: [],
    },
  },
  { _id: false }
)

const TicketSchema = new Schema({
  // 🔒 orgId restringido por enum
  orgId: { type: String, enum: ORG_ENUM, required: true, index: true },

  code:    { type: String, required: true }, 
  title:   { type: String, required: true },
  description: { type: String, required: true },

  categoryId: { type: ObjectId, required: true, index: true },
  priorityId: { type: ObjectId, required: true, index: true },
  statusId:   { type: ObjectId, required: true, index: true },

  reporter:   { type: PersonRefSchema, required: true },
  assignee:   { type: AssigneeSchema,  required: true },

  watchers:         { type: [String], default: [], index: true },
  attachmentsCount: { type: Number, default: 0 },
  tags:             { type: [String], default: [] },

  custom: { type: Schema.Types.Mixed, default: {} },
  dueAt:  { type: Date, default: null }
}, {
  timestamps: true,
  collection: 'tickets'
});

// Único por organización
TicketSchema.index({ orgId: 1, code: 1 }, { unique: true });

// Búsquedas típicas
TicketSchema.index({ orgId: 1, statusId: 1, priorityId: 1, categoryId: 1 });
TicketSchema.index({ orgId: 1, title: 'text', description: 'text', tags: 'text' });

export const Ticket = mongoose.models.Ticket || mongoose.model('Ticket', TicketSchema);
 