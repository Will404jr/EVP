import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    department: { type: String, required: true },
    concern: { type: String, required: true },
    possibleSolution: { type: String, required: false },
    submittedBy: { type: String, default: null }, // Now stores Azure AD user ID
    assignedTo: { type: String, default: null }, // Now stores Azure AD user ID
    likes: { type: [String], default: [] }, // Array of user IDs who liked
    dislikes: { type: [String], default: [] }, // Array of user IDs who disliked
    comments: {
      type: [{ userId: String, comment: String, createdAt: Date }], // Changed username to userId
      default: [],
    },
    approved: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["Open", "Resolved", "Pending", "Overdue"],
      default: "Open",
    },
  },
  { timestamps: true }
);

export const Feedback =
  mongoose.models.Feedback || mongoose.model("Feedback", feedbackSchema);
