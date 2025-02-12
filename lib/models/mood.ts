import mongoose from "mongoose";

const moodSchema = new mongoose.Schema(
  {
    mood: {
      type: String,
      enum: ["good", "bad", "fair"],
      default: "fair",
      required: true,
    },
    username: { type: String, required: true },
  },
  { timestamps: true }
);

export const Mood = mongoose.models.Mood || mongoose.model("Mood", moodSchema);
