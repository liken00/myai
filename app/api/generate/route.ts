import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const { prompt, width, height } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const apiKey = process.env.LEPTON_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Image generation service not configured. Please add your Lepton API key." },
        { status: 503 }
      );
    }

    // Lepton AI image generation API
    const response = await fetch("https://api.lepton.ai/v1/images/generate", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "FLUX",
        prompt,
        width: width || 1024,
        height: height || 1024,
        steps: 30,
        seed: Math.floor(Math.random() * 999999),
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Lepton API error:", err);
      return NextResponse.json(
        { error: "Image generation failed. Please try again." },
        { status: 500 }
      );
    }

    const data = await response.json();
    
    // Lepton returns { data: [{ url: "..." }] }
    const imageUrl = data?.data?.[0]?.url;
    
    if (!imageUrl) {
      return NextResponse.json(
        { error: "No image returned. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: imageUrl, id: uuidv4() });
  } catch (err) {
    console.error("Generate error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
