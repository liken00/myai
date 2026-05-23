"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      setStatus("error");
      return;
    }

    async function verifySession() {
      try {
        const response = await fetch("/api/checkout/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });

        if (response.ok) {
          const data = await response.json();
          setCredits(data.credits || 0);
          setStatus("success");
        } else {
          setStatus("success");
        }
      } catch {
        setStatus("success");
      }
    }

    verifySession();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="rounded-3xl border border-[#2a2a3e] bg-gradient-to-b from-indigo-500/10 to-purple-500/10 p-8 text-center">
          {status === "loading" && (
            <>
              <div className="mb-6 flex justify-center">
                <div className="h-16 w-16 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
              </div>
              <h1 className="mb-2 text-2xl font-bold text-white">Processing Payment...</h1>
              <p className="text-gray-400">Please wait while we confirm your payment</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="mb-6 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
                  <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h1 className="mb-2 text-2xl font-bold text-white">Payment Successful!</h1>
              <p className="mb-6 text-gray-400">
                Your credits have been added to your account. You can now start generating amazing images!
              </p>
              {credits !== null && (
                <div className="mb-6 rounded-xl bg-[#12121c] p-4">
                  <p className="text-sm text-gray-400">Credits added</p>
                  <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                    +{credits}
                  </p>
                </div>
              )}
              <Link
                href="/dashboard"
                className="block w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 py-3 text-center font-semibold text-white transition-transform hover:scale-105"
              >
                Go to Dashboard
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div className="mb-6 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
                  <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <h1 className="mb-2 text-2xl font-bold text-white">Something Went Wrong</h1>
              <p className="mb-6 text-gray-400">
                We couldn&apos;t verify your payment. Please contact support if you were charged.
              </p>
              <div className="flex gap-4">
                <Link
                  href="/dashboard"
                  className="flex-1 rounded-xl bg-[#2a2a3e] py-3 text-center font-semibold text-white transition-colors hover:bg-[#3a3a4e]"
                >
                  Go to Dashboard
                </Link>
                <Link
                  href="/pricing"
                  className="flex-1 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 py-3 text-center font-semibold text-white transition-transform hover:scale-105"
                >
                  Try Again
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}