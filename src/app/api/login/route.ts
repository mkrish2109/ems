import { NextRequest, NextResponse } from "next/server";

// const BASE_URL = ;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Forward request to backend API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ message: data.message || "Invalid credentials" }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("API login error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
