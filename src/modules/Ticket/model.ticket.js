// src/modules/Ticket/model.ticket.js
import mongoose from 'mongoose'

const { Schema } = mongoose

const AttachmentSchema = new Schema(
  {
    fileId: { type: String, required: true, trim: true },
    name: { type: String, default: '', trim: true },
    url: { type: String, default: '', trim: true },
    mime: { type: String, default: '', trim: true },
    size: { type: Number, default: 0 },
    uploadedBy: { type: String, default: '', trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
)

const OperacionSchema = new Schema(
  {
    cliente: { type: String, required: true, trim: true },
    lote: { type: String, default: '', trim: true },
    producto: { type: String, default: '', trim: true },
    servicios_adicionales: [{ type: String, trim: true }],
    apoyo_ids: [{ type: String, trim: true }],
  },
  { _id: false }
)

const AsignadoASchema = new Schema(
  {
    tipo: { type: String, enum: ['area', 'team', 'personal'], required: true },
    id: { type: Schema.Types.Mixed, required: true },
  },
  { _id: false }
)

// ✅ Historial de estados para trazabilidad
const EstadoHistorialSchema = new Schema(
  {
    estado_id: { type: Schema.Types.ObjectId, required: true, index: true },
    nota: { type: String, default: '', trim: true },
    changedBy: { type: String, required: true, trim: true }, // id_personal
    changedAt: { type: Date, default: Date.now, index: true },
  },
  { _id: false }
)

const TicketSchema = new Schema(
  {
    // ✅ orgId EXTERNO (string)
    orgId: { type: String, required: true, trim: true, index: true },

    // ✅ Código autoincrementable por tipo (OP_0001 / TK_0001 / PY_0001)
    code: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    codePrefix: { type: String, required: true, trim: true, index: true }, // OP_, TK_, PY_
    codeSeq: { type: Number, required: true, index: true }, // 1,2,3,... (no se reinicia)

    tipo: {
      type: String,
      enum: ['tarea', 'proyecto', 'operacion'],
      required: true,
      index: true,
    },

    titulo: { type: String, required: true, trim: true },
    descripcion: { type: String, required: true, trim: true },

    categoria_id: { type: Schema.Types.ObjectId, required: true, index: true },
    prioridad_id: { type: Schema.Types.ObjectId, required: true, index: true },
    estado_id: { type: Schema.Types.ObjectId, required: true, index: true },

    // ✅ Nuevo: trazabilidad
    estado_historial: { type: [EstadoHistorialSchema], default: [] },

    asignado_a: { type: AsignadoASchema, required: false, default: null },

    creado_por: { type: String, required: true, trim: true, index: true },
    watchers: [{ type: String, trim: true, index: true }],

    adjuntos: { type: [AttachmentSchema], default: [] },

    operacion: { type: OperacionSchema, default: undefined },

    chatId: { type: Schema.Types.ObjectId, default: null, index: true },

    activo: { type: Boolean, default: true, index: true },

    createdBy: { type: String, required: true, trim: true },
    updatedBy: { type: String, required: true, trim: true },
  },
  { timestamps: true }
)

TicketSchema.index({ 'asignado_a.tipo': 1, 'asignado_a.id': 1 })
TicketSchema.index({ orgId: 1, tipo: 1, estado_id: 1 })
TicketSchema.index({ orgId: 1, tipo: 1, prioridad_id: 1 })
TicketSchema.index({ tipo: 1, codeSeq: -1 })

export const Ticket = mongoose.model('Ticket', TicketSchema, 'tickets')
