import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { getSession } from "@/lib/session";
import { Feedback } from "@/lib/models/feedback";

interface RouteParams {
  params: { id: string };
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await context.params;
  try {
    await dbConnect();
    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return NextResponse.json(
        { error: "Feedback not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(feedback);
  } catch (error) {
    console.error("Failed to fetch feedback:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await context.params;
  try {
    await dbConnect();
    const session = await getSession();
    const data = await request.json();

    if (!session.isLoggedIn) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return NextResponse.json(
        { error: "Feedback not found" },
        { status: 404 }
      );
    }

    if (data.action === "like") {
      if (feedback.likes.includes(session.id)) {
        feedback.likes = feedback.likes.filter(
          (userId: string) => userId !== session.id
        );
      } else {
        feedback.likes.push(session.id);
        feedback.dislikes = feedback.dislikes.filter(
          (userId: string) => userId !== session.id
        );
      }
    } else if (data.action === "dislike") {
      if (feedback.dislikes.includes(session.id)) {
        feedback.dislikes = feedback.dislikes.filter(
          (userId: string) => userId !== session.id
        );
      } else {
        feedback.dislikes.push(session.id);
        feedback.likes = feedback.likes.filter(
          (userId: string) => userId !== session.id
        );
      }
    } else if (data.action === "comment") {
      feedback.comments.push({
        userId: session.id, // Use user ID instead of username
        comment: data.comment,
        createdAt: new Date(),
      });
    } else if (data.action === "approve" && session.personnelType === "Md") {
      feedback.approved = true;
    } else if (data.action === "assign" && session.personnelType === "Md") {
      feedback.assignedTo = data.assignedTo;
      feedback.status = "Pending";
    } else if (
      data.action === "resolve" &&
      feedback.assignedTo === session.id
    ) {
      feedback.status = "Resolved";
    } else {
      // Handle other updates
      Object.assign(feedback, data);
    }

    await feedback.save();
    return NextResponse.json(feedback);
  } catch (error) {
    console.error("Failed to update feedback:", error);
    return NextResponse.json(
      { error: "Failed to update feedback" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await context.params;
  try {
    await dbConnect();
    const session = await getSession();

    if (session.personnelType !== "Md") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const feedback = await Feedback.findByIdAndDelete(id);
    if (!feedback) {
      return NextResponse.json(
        { error: "Feedback not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ message: "Feedback deleted successfully" });
  } catch (error) {
    console.error("Failed to delete feedback:", error);
    return NextResponse.json(
      { error: "Failed to delete feedback" },
      { status: 500 }
    );
  }
}
