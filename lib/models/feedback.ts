import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    department: { type: String, required: true },
    concern: { type: String, required: true },
    possibleSolution: { type: String, required: true },
    validity: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
    },
    submittedBy: { type: String, default: null },
    assignedTo: { type: String, default: null },
    status: {
      type: String,
      enum: ["Open", "Resolved", "Pending", "Overdue"],
      default: "Open",
      required: true,
    },
    likes: { type: [String], default: [] }, // Array of usernames who liked
    dislikes: { type: [String], default: [] }, // Array of usernames who disliked
    comments: {
      type: [{ username: String, comment: String, createdAt: Date }],
      default: [],
    },
    approved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Feedback =
  mongoose.models.Feedback || mongoose.model("Feedback", feedbackSchema);
