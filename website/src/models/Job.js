import mongoose, { Schema, models, model } from 'mongoose';

const JobSchema = new Schema(
  {
    homeowner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    budgetMin: { type: Number },
    budgetMax: { type: Number },
    status: {
      type: String,
      enum: ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'OPEN',
    },
  },
  { timestamps: true }
);

export const Job = models.Job || model('Job', JobSchema);
