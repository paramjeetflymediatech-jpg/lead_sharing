import mongoose from "mongoose";

const JobSchema = new mongoose.Schema(
  {
    homeowner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      required: true,
    },

    description: { type: String, required: true },

    location: {
      postcode: { type: String, required: true },
      city: String,
    },

    startTime: {
      type: String,
      enum: [
        "URGENT",
        "WITHIN_2_DAYS",
        "WITHIN_2_WEEKS",
        "WITHIN_2_MONTHS",
        "FLEXIBLE",
      ],
      required: true,
    },

    jobStage: {
      type: String,
      enum: ["READY_TO_HIRE", "PLANNING", "INSURANCE"],
      required: true,
    },

    ownership: {
      type: String,
      enum: ["OWNER", "LANDLORD", "AUTHORIZED", "BUYING"],
      required: true,
    },

    budgetMin: Number,
    budgetMax: Number,

    media: [
      {
        url: String,
        type: { type: String, enum: ["IMAGE", "VIDEO"] },
      },
    ],

    status: {
      type: String,
      enum: ["OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
      default: "OPEN",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Job || mongoose.model("Job", JobSchema);
