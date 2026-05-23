import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getUserCredits, deductCredit } from "@/lib/auth";
import { generateWithFallback } from "@/lib/ai-service";
import { saveGeneration } from "@/lib/generations";

export async function POST(req: NextRequest) {
  try {
    const { prompt, width, height } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Extract auth token from cookie
    const authToken = req.cookies.get("auth_token")?.value;

    if (!authToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Verify JWT and get email
    let email: string;
    try {
      const JWT_SECRET = process.env.JWT_SECRET || "myai-secret-key-change-in-production";
      const decoded = jwt.verify(authToken, JWT_SECRET) as { email: string };
      email = decoded.email;
    } catch {
      return NextResponse.json({ error: "Invalid authentication token" }, { status: 401 });
    }

    // Check user credits
    const credits = await getUserCredits(email);
    if (credits < 1) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
    }

    // Generate image with fallback (Lepton -> Replicate)
    const { result } = await generateWithFallback(prompt, width || 1024, height || 1024);

    // Save generation
    await saveGeneration(email, { url: result.url, prompt });

    // Deduct credit
    await deductCredit(email);

    return NextResponse.json({
      url: result.url,
      id: result.id,
      remainingCredits: credits - 1,
    });
  } catch (err) {
    console.error("Generate error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const authToken = req.cookies.get("auth_token")?.value;

  if (!authToken) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const JWT_SECRET = process.env.JWT_SECRET || "myai-secret-key-change-in-production";
    const decoded = jwt.verify(authToken, JWT_SECRET) as { email: string };

    const credits = await getUserCredits(decoded.email);

    return NextResponse.json({ credits });
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}