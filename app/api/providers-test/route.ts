import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const leptonKey = process.env.LEPTON_API_KEY;
  const replicateKey = process.env.REPLICATE_API_KEY;

  // Try Lepton
  if (leptonKey && leptonKey !== "your_lepton_api_key_here") {
    try {
      const response = await fetch("https://api.lepton.ai/v1/images/generate", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${leptonKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "FLUX",
          prompt: "test",
          width: 256,
          height: 256,
          steps: 1,
          seed: 42,
        }),
      });

      if (response.ok) {
        return NextResponse.json({ provider: "lepton", status: "ok" });
      }
    } catch {
      // Lepton failed, try Replicate
    }
  }

  // Try Replicate
  if (replicateKey && replicateKey !== "your_replicate_api_key_here") {
    try {
      const response = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
          Authorization: `Token ${replicateKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          version: "black-forest-labs/flux-schnell:7dfd87f4a1d5a65cff5c84421d567a1602ac8f358f5c80955a0d1d8c9f979c40",
          input: {
            prompt: "test",
            width: 256,
            height: 256,
            num_inference_steps: 1,
            seed: 42,
          },
        }),
      });

      if (response.ok) {
        return NextResponse.json({ provider: "replicate", status: "ok" });
      }
    } catch {
      // Replicate failed
    }
  }

  return NextResponse.json(
    { provider: "none", status: "failed", error: "No working AI provider found" },
    { status: 503 }
  );
}