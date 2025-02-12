import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { type User, users } from "@/lib/user"; // Import both User type and users array

export async function POST(req: NextRequest) {
  const session = await getSession();
  const body = await req.json();
  const { username } = body;

  const user = users.find((u) => u.username === username);

  if (user) {
    session.id = user.id;
    session.isLoggedIn = true;
    session.username = user.username;
    session.email = user.email;
    session.personnelType = user.personnelType;
    session.expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours from now

    await session.save();

    return NextResponse.json({
      id: user.id,
      username: user.username,
      email: user.email,
      personnelType: user.personnelType,
    });
  } else {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
}
