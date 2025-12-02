import { type NextRequest, NextResponse } from "next/server";
import { Mood } from "@/lib/models/mood";
import dbConnect from "@/lib/db";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await context.params;
  await dbConnect();
  const mood = await Mood.findById(id);

  if (!mood) {
    return NextResponse.json({ error: "Mood not found" }, { status: 404 });
  }

  return NextResponse.json({ mood });
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await context.params;
  await dbConnect();
  const { mood } = await request.json();

  if (!mood) {
    return NextResponse.json({ error: "Mood is required" }, { status: 400 });
  }

  const updatedMood = await Mood.findByIdAndUpdate(id, { mood }, { new: true });

  if (!updatedMood) {
    return NextResponse.json({ error: "Mood not found" }, { status: 404 });
  }

  return NextResponse.json({
    message: "Mood updated successfully",
    mood: updatedMood,
  });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await context.params;
  await dbConnect();
  const deletedMood = await Mood.findByIdAndDelete(id);

  if (!deletedMood) {
    return NextResponse.json({ error: "Mood not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Mood deleted successfully" });
}
