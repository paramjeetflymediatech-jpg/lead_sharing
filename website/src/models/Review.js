import mongoose, { Schema, models, model } from 'mongoose';

const ReviewSchema = new Schema(
  {
    job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    homeowner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tradesperson: { type: Schema.Types.ObjectId, ref: 'TradespersonProfile', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

export const Review = models.Review || model('Review', ReviewSchema);
