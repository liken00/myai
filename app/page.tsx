import Link from "next/link";

const features = [
  {
    title: "FLUX Technology",
    desc: "Powered by state-of-the-art FLUX AI model for stunning image quality",
    icon: "⚡",
  },
  {
    title: "Lightning Fast",
    desc: "Generate images in seconds. No waiting, no queues",
    icon: "🚀",
  },
  {
    title: "Multiple Styles",
    desc: "Realistic, anime, 3D, abstract — choose your style",
    icon: "🎨",
  },
  {
    title: "Always Available",
    desc: "24/7 image generation. Create anytime, anywhere",
    icon: "🌍",
  },
];

const examples = [
  { prompt: "A majestic mountain landscape at sunset, photorealistic", seed: 42 },
  { prompt: "Cute anime girl with blue hair, vibrant colors", seed: 123 },
  { prompt: "Futuristic city with flying cars, cyberpunk style", seed: 456 },
  { prompt: "A beautiful gemstone ring, studio lighting", seed: 789 },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-32 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
            </span>
            Now available for everyone
          </div>
          
          <h1 className="mb-6 text-5xl md:text-7xl font-bold text-white leading-tight">
            Create Stunning
            <br />
            <span className="bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
              AI Images
            </span>
            <br />
            in Seconds
          </h1>
          
          <p className="mx-auto mb-10 max-w-2xl text-xl text-gray-400">
            Transform your ideas into beautiful images with our powerful AI.
            No design skills needed. Just describe what you want.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/generate"
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-4 text-lg font-semibold text-white transition-transform hover:scale-105 shadow-lg shadow-indigo-500/25"
            >
              Start Creating Free
            </Link>
            <Link
              href="/pricing"
              className="rounded-xl border border-gray-700 bg-white/5 px-8 py-4 text-lg font-semibold text-white hover:bg-white/10 transition-colors"
            >
              View Pricing
            </Link>
          </div>
          
          <p className="mt-6 text-sm text-gray-500">
            10 free credits · No credit card required
          </p>
        </div>
      </section>

      {/* Example Gallery */}
      <section className="py-20 px-4 bg-[#0f0f18]">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-white">
            What You Can Create
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {examples.map((ex, i) => (
              <div
                key={i}
                className="group relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 group-hover:opacity-80 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-xs text-gray-300 line-clamp-2">{ex.prompt}</p>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl opacity-50 group-hover:opacity-100 transition-opacity">🎨</span>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-gray-500 text-sm">
            Join thousands of creators using My AI every day
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-white">
            Why Choose My AI
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="rounded-2xl border border-[#2a2a3e] bg-[#12121c] p-6 hover:border-indigo-500/50 transition-colors"
              >
                <div className="mb-4 text-4xl">{f.icon}</div>
                <h3 className="mb-2 text-lg font-semibold text-white">{f.title}</h3>
                <p className="text-gray-400 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <div className="rounded-3xl border border-[#2a2a3e] bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-12">
            <h2 className="mb-4 text-3xl font-bold text-white">
              Ready to Create?
            </h2>
            <p className="mb-8 text-gray-400">
              Start with 10 free credits. No credit card required.
            </p>
            <Link
              href="/register"
              className="inline-block rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-4 text-lg font-semibold text-white transition-transform hover:scale-105"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 border-t border-[#2a2a3e]">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="mb-2 text-4xl font-bold text-white">100K+</div>
              <div className="text-gray-500">Images Created</div>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold text-white">10K+</div>
              <div className="text-gray-500">Happy Users</div>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold text-white">4.9★</div>
              <div className="text-gray-500">User Rating</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
