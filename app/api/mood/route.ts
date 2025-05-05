import { NextResponse } from "next/server";
import { Mood } from "@/lib/models/mood";
import dbConnect from "@/lib/db";

export async function GET(request: Request) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId"); // Changed from username to userId

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const mood = await Mood.findOne({
    userId, // Changed from username to userId
    createdAt: { $gte: today },
  });

  return NextResponse.json({ mood });
}

export async function POST(request: Request) {
  await dbConnect();
  const { mood, userId, department } = await request.json(); // Changed from username to userId

  if (!mood || !userId || !department) {
    return NextResponse.json(
      { error: "Mood, userId and department are required" }, // Changed from username to userId
      { status: 400 }
    );
  }

  const newMood = new Mood({ mood, userId, department }); // Changed from username to userId
  await newMood.save();

  return NextResponse.json({
    message: "Mood saved successfully",
    mood: newMood,
  });
}
