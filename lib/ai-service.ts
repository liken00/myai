/**
 * AI Service Abstraction Layer
 * Deep dark tech style - supports Lepton AI with Replicate fallback
 */

import { saveGeneration } from "./generations";
import { getUserCredits, deductCredit } from "./auth";

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface ImageGenerationResult {
  url: string;
  id: string;
}

export interface AIImageGenerator {
  generateImage(
    prompt: string,
    width: number,
    height: number
  ): Promise<ImageGenerationResult>;
  name(): string;
}

// ============================================================================
// Lepton AI Provider
// ============================================================================

class LeptonAIProvider implements AIImageGenerator {
  private apiKey: string;
  private endpoint = "https://api.lepton.ai/v1/images/generate";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  name(): string {
    return "lepton";
  }

  async generateImage(
    prompt: string,
    width: number,
    height: number
  ): Promise<ImageGenerationResult> {
    const seed = Math.floor(Math.random() * 999999);

    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "FLUX",
        prompt,
        width,
        height,
        steps: 30,
        seed,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Lepton API error: ${err}`);
    }

    const data = await response.json();
    const imageUrl = data?.data?.[0]?.url;

    if (!imageUrl) {
      throw new Error("No image URL returned from Lepton");
    }

    return { url: imageUrl, id: crypto.randomUUID() };
  }
}

// ============================================================================
// Replicate AI Provider (Fallback)
// ============================================================================

class ReplicateAIProvider implements AIImageGenerator {
  private apiKey: string;
  private endpoint = "https://api.replicate.com/v1/predictions";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  name(): string {
    return "replicate";
  }

  async generateImage(
    prompt: string,
    width: number,
    height: number
  ): Promise<ImageGenerationResult> {
    // Create prediction
    const createResponse = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        Authorization: `Token ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "black-forest-labs/flux-schnell:7dfd87f4a1d5a65cff5c84421d567a1602ac8f358f5c80955a0d1d8c9f979c40",
        input: {
          prompt,
          width,
          height,
          num_inference_steps: 30,
          seed: Math.floor(Math.random() * 999999),
        },
      }),
    });

    if (!createResponse.ok) {
      const err = await createResponse.text();
      throw new Error(`Replicate create error: ${err}`);
    }

    const prediction = await createResponse.json();

    // Poll for result
    const result = await this.pollForResult(prediction.urls.get);

    // Extract output - Replicate returns array of output URLs
    const outputUrl = Array.isArray(result) ? result[0] : result?.output?.[0];

    if (!outputUrl) {
      throw new Error("No image URL returned from Replicate");
    }

    return { url: outputUrl, id: crypto.randomUUID() };
  }

  private async pollForResult(urlsGet: string, maxAttempts = 60): Promise<any> {
    for (let i = 0; i < maxAttempts; i++) {
      await sleep(1000);

      const statusResponse = await fetch(urlsGet, {
        headers: {
          Authorization: `Token ${this.apiKey}`,
        },
      });

      const status = await statusResponse.json();

      if (status.status === "succeeded") {
        return status.output;
      }

      if (status.status === "failed") {
        throw new Error(`Replicate prediction failed: ${status.error}`);
      }
    }

    throw new Error("Replicate prediction timed out");
  }
}

// ============================================================================
// Factory
// ============================================================================

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function createAIProvider(): AIImageGenerator {
  const leptonKey = process.env.LEPTON_API_KEY;

  if (leptonKey && leptonKey !== "your_lepton_api_key_here") {
    return new LeptonAIProvider(leptonKey);
  }

  const replicateKey = process.env.REPLICATE_API_KEY;
  if (replicateKey && replicateKey !== "your_replicate_api_key_here") {
    return new ReplicateAIProvider(replicateKey);
  }

  throw new Error("No AI provider configured. Set LEPTON_API_KEY or REPLICATE_API_KEY");
}

export async function generateWithFallback(
  prompt: string,
  width: number,
  height: number
): Promise<{ result: ImageGenerationResult; provider: string }> {
  // Try Lepton first
  const leptonKey = process.env.LEPTON_API_KEY;
  if (leptonKey && leptonKey !== "your_lepton_api_key_here") {
    try {
      const provider = new LeptonAIProvider(leptonKey);
      const result = await provider.generateImage(prompt, width, height);
      return { result, provider: "lepton" };
    } catch (err) {
      console.error("Lepton failed, falling back to Replicate:", err);
    }
  }

  // Fallback to Replicate
  const replicateKey = process.env.REPLICATE_API_KEY;
  if (replicateKey && replicateKey !== "your_replicate_api_key_here") {
    const provider = new ReplicateAIProvider(replicateKey);
    const result = await provider.generateImage(prompt, width, height);
    return { result, provider: "replicate" };
  }

  throw new Error("No AI provider available");
}

// ============================================================================
// Auth & Credit Helpers
// ============================================================================

export async function verifyAuthAndCredits(authToken: string | undefined): Promise<{
  email: string;
  credits: number;
} | { error: string; status: number }> {
  if (!authToken) {
    return { error: "Authentication required", status: 401 };
  }

  try {
    const jwt = await import("jsonwebtoken");
    const JWT_SECRET = process.env.JWT_SECRET || "myai-secret-key-change-in-production";
    const decoded = jwt.default.verify(authToken, JWT_SECRET) as { email: string };

    const credits = await getUserCredits(decoded.email);
    return { email: decoded.email, credits };
  } catch {
    return { error: "Invalid authentication token", status: 401 };
  }
}

export async function processGeneration(
  email: string,
  prompt: string,
  width: number,
  height: number
): Promise<{
  url: string;
  id: string;
  remainingCredits: number;
} | { error: string; status: number }> {
  // Check credits
  const credits = await getUserCredits(email);
  if (credits < 1) {
    return { error: "Insufficient credits", status: 402 };
  }

  // Generate image
  const { result } = await generateWithFallback(prompt, width, height);

  // Save generation
  await saveGeneration(email, { url: result.url, prompt });

  // Deduct credit
  await deductCredit(email);

  return {
    url: result.url,
    id: result.id,
    remainingCredits: credits - 1,
  };
}