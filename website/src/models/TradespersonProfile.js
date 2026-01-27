import mongoose, { Schema, models, model } from 'mongoose';

const TradespersonProfileSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    companyName: {
      type: String,
      required: true,
    },

    skills: [String],

    serviceAreas: [String],

    credits: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const TradespersonProfile =
  models.TradespersonProfile ||
  model('TradespersonProfile', TradespersonProfileSchema);
