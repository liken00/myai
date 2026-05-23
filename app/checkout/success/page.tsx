"use client";

import { Suspense } from "react";
import CheckoutSuccessContent from "./CheckoutSuccessContent";

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
        <div className="h-16 w-16 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}