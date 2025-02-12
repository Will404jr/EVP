import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Feedback } from "@/lib/models/feedback";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    await dbConnect();
    const feedback = await Feedback.find({}).sort({ createdAt: -1 });
    return NextResponse.json(feedback);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const session = await getSession();
    const data = await req.json();

    // Only set submittedBy if not anonymous and user is logged in
    if (!data.anonymous && session.username) {
      data.submittedBy = session.username;
    } else {
      data.submittedBy = null; // Ensure it's null for anonymous submissions
    }

    // Remove the anonymous field as it's not part of our schema
    const { anonymous, ...feedbackData } = data;

    const feedback = await Feedback.create({
      ...feedbackData,
      status: "Open", // Set initial status
    });

    return NextResponse.json(feedback);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create feedback" },
      { status: 500 }
    );
  }
}
