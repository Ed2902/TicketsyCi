import mongoose from 'mongoose';

const { Schema } = mongoose;

const NotificationSchema = new Schema(
  {
    orgId:        { type: String, required: true, index: true },        
    principalId:  { type: String, required: true, index: true },        
    type:         { type: String, required: true },                     
    payload:      { type: Schema.Types.Mixed, default: {} },              
    read:         { type: Boolean, default: false, index: true },
    createdAt:    { type: Date, default: () => new Date(), index: true }
  },
  {
    collection: 'notifications',
    versionKey: false
  }
);

// Índices de consulta típicos
NotificationSchema.index({ orgId: 1, principalId: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ orgId: 1, type: 1, createdAt: -1 });

export const Notification =
  mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
