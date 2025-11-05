import mongoose from 'mongoose';

const { Schema } = mongoose;
const ObjectId = Schema.Types.ObjectId;

const SenderSchema = new Schema(
  {
    principalId: { type: String, required: true, index: true },
    name:        { type: String },
    email:       { type: String }
  },
  { _id: false }
);

const AttachmentSchema = new Schema(
  {
    fileId: { type: ObjectId, ref: 'File' },   // si ya manejas files
    name:   { type: String },
    mime:   { type: String },
    size:   { type: Number }
  },
  { _id: false }
);

const TicketMessageSchema = new Schema(
  {
    orgId:    { type: String, required: true, index: true }, // 'fastway' | 'metalharvest' | 'greenway'
    ticketId: { type: ObjectId, required: true, index: true },
    sender:   { type: SenderSchema, required: true },
    message:  { type: String, required: true },
    attachments: { type: [AttachmentSchema], default: [] },
    createdAt: { type: Date, default: () => new Date(), index: true },
    updatedAt: { type: Date, default: () => new Date() }
  },
  {
    collection: 'ticketMessages',
    versionKey: false
  }
);

// Índices típicos
TicketMessageSchema.index({ orgId: 1, ticketId: 1, createdAt: -1 });

export const TicketMessage =
  mongoose.models.TicketMessage || mongoose.model('TicketMessage', TicketMessageSchema);
