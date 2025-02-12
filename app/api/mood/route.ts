import { NextResponse } from "next/server";
import { Mood } from "@/lib/models/mood";
import dbConnect from "@/lib/db";

export async function GET(request: Request) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json(
      { error: "Username is required" },
      { status: 400 }
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const mood = await Mood.findOne({
    username,
    createdAt: { $gte: today },
  });

  return NextResponse.json({ mood });
}

export async function POST(request: Request) {
  await dbConnect();
  const { mood, username } = await request.json();

  if (!mood || !username) {
    return NextResponse.json(
      { error: "Mood and username are required" },
      { status: 400 }
    );
  }

  const newMood = new Mood({ mood, username });
  await newMood.save();

  return NextResponse.json({
    message: "Mood saved successfully",
    mood: newMood,
  });
}
