"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2 } from "lucide-react";

export default function PricingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleCheckout(plan: string) {
    if (!session) {
      router.push("/login");
      return;
    }

    setLoading(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900">Pricing</h1>
        <p className="mt-4 text-lg text-gray-600">
          Start free. Upgrade when you&apos;re ready for a full rework.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Free */}
        <div className="rounded-xl border border-gray-200 bg-white p-8">
          <h3 className="text-lg font-semibold text-gray-900">
            Resume Scorecard
          </h3>
          <p className="mt-2 text-4xl font-bold text-gray-900">$0</p>
          <p className="text-sm text-gray-500">Free forever</p>
          <ul className="mt-6 space-y-3">
            {[
              "Overall resume score",
              "Section breakdown",
              "Strengths & improvements",
              "Format feedback",
              "3 scorecards per account",
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-sm text-gray-600"
              >
                <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <button
            onClick={() => router.push("/scorecard")}
            className="mt-8 w-full rounded-lg border-2 border-gray-300 py-3 font-medium text-gray-700 hover:bg-gray-50"
          >
            Get Scorecard
          </button>
        </div>

        {/* Single Rework */}
        <div className="rounded-xl border-2 border-blue-600 bg-white p-8 relative">
          <div className="absolute -top-3 left-6 rounded-full bg-blue-600 px-3 py-0.5 text-xs font-medium text-white">
            Most Popular
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Single Rework
          </h3>
          <p className="mt-2 text-4xl font-bold text-gray-900">$19.99</p>
          <p className="text-sm text-gray-500">One-time payment</p>
          <ul className="mt-6 space-y-3">
            {[
              "Everything in Free",
              "1 interactive rework session",
              "Line-by-line AI coaching",
              "Consulting-style rewrites",
              "Download polished PDF",
              "Pause & resume anytime",
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-sm text-gray-600"
              >
                <CheckCircle className="h-4 w-4 mt-0.5 text-blue-600 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <button
            onClick={() => handleCheckout("single")}
            disabled={loading === "single"}
            className="mt-8 w-full rounded-lg bg-blue-600 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading === "single" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Buy Now"
            )}
          </button>
        </div>

        {/* 3-Pack */}
        <div className="rounded-xl border border-gray-200 bg-white p-8">
          <h3 className="text-lg font-semibold text-gray-900">3-Pack</h3>
          <p className="mt-2 text-4xl font-bold text-gray-900">$39.99</p>
          <p className="text-sm text-gray-500">
            Save 33% &mdash; $13.33 each
          </p>
          <ul className="mt-6 space-y-3">
            {[
              "Everything in Free",
              "3 interactive rework sessions",
              "Perfect for multiple versions",
              "Use across different resumes",
              "Download polished PDFs",
              "Pause & resume anytime",
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-sm text-gray-600"
              >
                <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <button
            onClick={() => handleCheckout("three_pack")}
            disabled={loading === "three_pack"}
            className="mt-8 w-full rounded-lg border-2 border-blue-600 py-3 font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading === "three_pack" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Buy 3-Pack"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
