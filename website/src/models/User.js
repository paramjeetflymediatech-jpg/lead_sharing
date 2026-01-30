import mongoose, { Schema, models, model } from 'mongoose';

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: {
      type: String,
      enum: ['HOMEOWNER', 'TRADESPERSON', 'ADMIN'],
      default: 'HOMEOWNER',
      required: true,
    },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
  },
  { timestamps: true }
);

export const User = models.User || model('User', UserSchema);
