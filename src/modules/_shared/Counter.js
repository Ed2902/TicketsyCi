import e from 'express';
import mongoose from 'mongoose';
const { Schema } = mongoose;

const CounterSchema = new Schema({
  orgId: { type: String, required: true, index: true },
  name:  { type: String, required: true }, 
  seq:   { type: Number, default: 0 }
}, {
  collection: 'counters'
});

CounterSchema.index({ orgId: 1, name: 1 }, { unique: true });

export const Counter = mongoose.models.Counter || mongoose.model('Counter', CounterSchema);
export default Counter;
