import mongoose from "mongoose";

const moodSchema = new mongoose.Schema(
  {
    mood: {
      type: String,
      enum: ["good", "bad", "fair"],
      default: "fair",
      required: true,
    },
    userId: { type: String, required: true }, // Changed from username to userId
    department: { type: String, required: true },
  },
  { timestamps: true }
);

export const Mood = mongoose.models.Mood || mongoose.model("Mood", moodSchema);
