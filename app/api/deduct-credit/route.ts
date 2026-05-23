import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { deductCredit } from "@/lib/auth";
import { saveGeneration } from "@/lib/generations";

const JWT_SECRET = process.env.JWT_SECRET || "myai-secret-key-change-in-production";

export async function POST(req: NextRequest) {
  try {
    // Verify auth token
    const token = req.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    let email: string;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { email: string };
      email = decoded.email;
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Get generation data
    const { url, prompt } = await req.json();
    if (!url) {
      return NextResponse.json({ error: "Missing generation data" }, { status: 400 });
    }

    // Deduct credit
    const newBalance = await deductCredit(email);

    // Save generation record
    await saveGeneration(email, { url, prompt });

    return NextResponse.json({ success: true, credits: newBalance });
  } catch (err: any) {
    if (err.message === "No credits available") {
      return NextResponse.json({ error: "No credits remaining" }, { status: 400 });
    }
    console.error("Deduct credit error:", err);
    return NextResponse.json({ error: "Failed to deduct credit" }, { status: 500 });
  }
}