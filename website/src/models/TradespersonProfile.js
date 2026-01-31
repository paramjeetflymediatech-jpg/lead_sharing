// models/TradespersonProfile.js
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
      trim: true,
    },
    profileImage: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    postcode: {
      type: String,
      default: "",
      trim: true,
    },
    skills: [{
      type: String,
      trim: true,
    }],
    serviceAreas: [{
      type: String,
      trim: true,
    }],
    credits: {
      type: Number,
      default: 5,
      min: 0,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Auto-update updatedAt on save


export const TradespersonProfile =
  models.TradespersonProfile ||
  model('TradespersonProfile', TradespersonProfileSchema);