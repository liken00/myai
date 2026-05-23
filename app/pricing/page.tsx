import Link from "next/link";

const PLANS = [
  {
    name: "Free",
    credits: 10,
    price: 0,
    priceId: null,
    features: [
      "10 free credits",
      "Basic styles",
      "Standard quality",
      "Email support",
    ],
    cta: "Get Started",
    highlight: false,
  },
  {
    name: "Pro",
    credits: 100,
    price: 9.9,
    priceId: "price_pro_100",
    features: [
      "100 credits/month",
      "All styles",
      "HD quality",
      "Priority generation",
      "Commercial use",
      "Email support",
    ],
    cta: "Upgrade to Pro",
    highlight: true,
  },
  {
    name: "Enterprise",
    credits: 500,
    price: 29.9,
    priceId: "price_enterprise_500",
    features: [
      "500 credits/month",
      "All styles",
      "4K quality",
      "Priority generation",
      "Commercial use",
      "API access",
      "24/7 support",
    ],
    cta: "Go Enterprise",
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] py-20 px-4">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="mb-4 text-4xl font-bold text-white">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-400">
            Choose the plan that fits your needs. Upgrade or downgrade anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl p-8 ${
                plan.highlight
                  ? "border-2 border-indigo-500 bg-gradient-to-b from-indigo-500/10 to-transparent"
                  : "border border-[#2a2a3e] bg-[#12121c]"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-indigo-500 px-4 py-1 text-sm font-semibold text-white">
                  Most Popular
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="mb-2 text-xl font-bold text-white">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-white">
                    ${plan.price}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-gray-500">/month</span>
                  )}
                </div>
                <p className="mt-2 text-gray-400">
                  {plan.credits} credits{plan.price > 0 ? "/mo" : ""}
                </p>
              </div>

              <ul className="mb-8 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-gray-300">
                    <svg className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.price === 0 ? "/register" : `/checkout?plan=${plan.priceId}`}
                className={`block w-full rounded-xl py-3 text-center font-semibold transition-colors ${
                  plan.highlight
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90"
                    : "bg-[#2a2a3e] text-white hover:bg-[#3a3a4e]"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-20">
          <h2 className="mb-8 text-center text-2xl font-bold text-white">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                q: "What are credits?",
                a: "Each image generation uses 1 credit. Credits refresh monthly with your subscription.",
              },
              {
                q: "Can I unused credits roll over?",
                a: "Currently credits don't roll over. Get them while they're hot!",
              },
              {
                q: "Can I use images commercially?",
                a: "Pro and Enterprise plans include commercial use rights.",
              },
              {
                q: "How do I get a refund?",
                a: "We offer a 7-day money-back guarantee. Contact support.",
              },
            ].map((faq, i) => (
              <div key={i} className="rounded-xl border border-[#2a2a3e] bg-[#12121c] p-6">
                <h3 className="mb-2 font-semibold text-white">{faq.q}</h3>
                <p className="text-gray-400 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mt-12 text-center">
          <p className="mb-4 text-sm text-gray-500">Secure payment via Stripe</p>
          <div className="flex justify-center gap-4">
            <div className="rounded-lg bg-[#1a1a2e] px-4 py-2 text-white font-medium text-sm">💳 Visa</div>
            <div className="rounded-lg bg-[#1a1a2e] px-4 py-2 text-white font-medium text-sm">💳 Mastercard</div>
            <div className="rounded-lg bg-[#1a1a2e] px-4 py-2 text-white font-medium text-sm">💳 Amex</div>
          </div>
        </div>
      </div>
    </div>
  );
}
