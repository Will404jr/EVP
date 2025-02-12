import { NextRequest, NextResponse } from "next/server";
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
      if (feedback.likes.includes(session.username)) {
        feedback.likes = feedback.likes.filter(
          (username: string) => username !== session.username
        );
      } else {
        feedback.likes.push(session.username);
        feedback.dislikes = feedback.dislikes.filter(
          (username: string) => username !== session.username
        );
      }
    } else if (data.action === "dislike") {
      if (feedback.dislikes.includes(session.username)) {
        feedback.dislikes = feedback.dislikes.filter(
          (username: string) => username !== session.username
        );
      } else {
        feedback.dislikes.push(session.username);
        feedback.likes = feedback.likes.filter(
          (username: string) => username !== session.username
        );
      }
    } else if (data.action === "comment") {
      feedback.comments.push({
        username: session.username,
        comment: data.comment,
        createdAt: new Date(),
      });
    } else if (data.action === "approve" && session.personnelType === "Admin") {
      feedback.approved = true;
    } else if (data.action === "assign" && session.personnelType === "Admin") {
      feedback.assignedTo = data.assignedTo;
      feedback.status = "Pending";
    } else {
      // Handle other updates
      Object.assign(feedback, data);
    }

    await feedback.save();
    return NextResponse.json(feedback);
  } catch (error) {
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

    if (session.personnelType !== "Admin") {
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
    return NextResponse.json(
      { error: "Failed to delete feedback" },
      { status: 500 }
    );
  }
}
