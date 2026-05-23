"use client";

import { useState } from "react";
import Link from "next/link";

const STYLES = ["Realistic", "Anime", "3D Render", "Abstract", "Photographic", "Oil Painting"];
const ASPECTS = [
  { label: "1:1", value: "square", icon: "◻️" },
  { label: "16:9", value: "landscape", icon: "▬" },
  { label: "9:16", value: "portrait", icon: "▮" },
];
const RESOLUTIONS: Record<string, [number, number]> = {
  square: [1024, 1024],
  landscape: [1344, 768],
  portrait: [768, 1344],
};

interface GenerateClientProps {
  email: string;
  initialCredits: number;
}

export default function GenerateClient({ email, initialCredits }: GenerateClientProps) {
  const [credits, setCredits] = useState(initialCredits);
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("Realistic");
  const [aspect, setAspect] = useState("square");
  const [generating, setGenerating] = useState(false);
  const [images, setImages] = useState<{ url: string; prompt: string }[]>([]);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    if (credits <= 0) {
      setError("No credits remaining. Please purchase more credits.");
      return;
    }

    setGenerating(true);
    setError("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `${style} style: ${prompt}`,
          width: RESOLUTIONS[aspect][0],
          height: RESOLUTIONS[aspect][1],
        }),
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setGenerating(false);
        return;
      }

      // Deduct credit via API
      const deductRes = await fetch("/api/deduct-credit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: data.url,
          prompt: `${style} style: ${prompt}`,
        }),
      });

      const deductData = await deductRes.json();
      if (deductData.success) {
        setCredits(deductData.credits);
        setImages((prev) => [{ url: data.url, prompt }, ...prev].slice(0, 12));
      } else {
        setError(deductData.error || "Failed to deduct credit");
      }
    } catch {
      setError("Generation failed. Please try again.");
    }
    setGenerating(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-8 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-white">AI Image Generator</h1>
          <p className="text-gray-400">Create stunning images with FLUX technology</p>
        </div>

        {/* Credits Warning */}
        {credits <= 0 && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center">
            <p className="text-red-400">You have no credits remaining.</p>
            <Link href="/pricing" className="mt-2 inline-block text-indigo-400 hover:text-indigo-300">
              Purchase credits →
            </Link>
          </div>
        )}

        {/* Prompt Input */}
        <div className="mb-6">
          <textarea
            className="w-full rounded-xl border border-[#2a2a3e] bg-[#12121c] p-4 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none resize-none"
            rows={4}
            placeholder="Describe the image you want to create... e.g. A beautiful sunset over mountains with a lake reflection"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={generating || credits <= 0}
          />
          {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
        </div>

        {/* Style & Aspect */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Style</label>
            <div className="flex flex-wrap gap-2">
              {STYLES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    style === s
                      ? "bg-indigo-500 text-white"
                      : "bg-[#1a1a2e] text-gray-300 hover:bg-[#2a2a3e]"
                  }`}
                  disabled={generating || credits <= 0}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Aspect Ratio</label>
            <div className="flex gap-2">
              {ASPECTS.map((a) => (
                <button
                  key={a.value}
                  onClick={() => setAspect(a.value)}
                  className={`flex-1 rounded-lg py-3 text-sm font-medium transition-colors ${
                    aspect === a.value
                      ? "bg-indigo-500 text-white"
                      : "bg-[#1a1a2e] text-gray-300 hover:bg-[#2a2a3e]"
                  }`}
                  disabled={generating || credits <= 0}
                >
                  {a.icon} {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="mb-10 text-center">
          <button
            onClick={handleGenerate}
            disabled={generating || !prompt.trim() || credits <= 0}
            className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-10 py-4 text-lg font-semibold text-white transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-indigo-500/25"
          >
            {generating ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating...
              </span>
            ) : (
              `✨ Generate Image (${credits} credits)`
            )}
          </button>
          <p className="mt-2 text-sm text-gray-500">Uses 1 credit per generation</p>
        </div>

        {/* Gallery */}
        {images.length > 0 && (
          <div>
            <h2 className="mb-4 text-xl font-semibold text-white">Your Creations</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((img, i) => (
                <div key={i} className="group relative aspect-square overflow-hidden rounded-xl bg-[#1a1a2e]">
                  <img src={img.url} alt={img.prompt} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <a
                      href={img.url}
                      download={`myai-${i + 1}.png`}
                      className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-200"
                    >
                      Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {images.length === 0 && !generating && credits > 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 text-6xl opacity-30">🎨</div>
            <p className="text-gray-500">Your generated images will appear here</p>
            <Link href="/pricing" className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm">
              Need more credits?
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}