import { NextResponse } from "next/server";
import { Mood } from "@/lib/models/mood";
import dbConnect from "@/lib/db";

export async function GET() {
  try {
    await dbConnect();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const mood = await Mood.find({ createdAt: { $gte: today } }).sort({
      createdAt: -1,
    });
    return NextResponse.json(mood);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch moods" },
      { status: 500 }
    );
  }
}
