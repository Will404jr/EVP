import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  return NextResponse.json(session);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  const body = await req.json();

  await session.save();

  return NextResponse.json(session);
}
