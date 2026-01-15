import mongoose, { Schema, models, model } from 'mongoose';

const LeadSchema = new Schema(
  {
    job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    tradesperson: { type: Schema.Types.ObjectId, ref: 'TradespersonProfile', required: true },
    message: { type: String, required: true },
    priceEstimate: { type: Number },
    isUnlocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Lead = models.Lead || model('Lead', LeadSchema);
