import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route"; // adjust import if your auth file is elsewhere
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    return NextResponse.json({
      email: session.user?.email,
      name: session.user?.name,
    });
  } catch (error) {
    console.error("Error in /api/user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}