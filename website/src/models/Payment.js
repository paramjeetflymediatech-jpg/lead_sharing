import mongoose, { Schema, models, model } from 'mongoose';

const PaymentSchema = new Schema(
  {
    tradesperson: { type: Schema.Types.ObjectId, ref: 'TradespersonProfile', required: true },
    amountPence: { type: Number, required: true },
    creditsPurchased: { type: Number, required: true },
    stripeSessionId: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED'],
      default: 'PENDING',
    },
  },
  { timestamps: true }
);

export const Payment = models.Payment || model('Payment', PaymentSchema);
