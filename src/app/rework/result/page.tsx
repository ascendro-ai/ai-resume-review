"use client";

import { Suspense, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { Loader2, Download, ArrowLeft, CheckCircle, Copy } from "lucide-react";
import Link from "next/link";
import { generateResumePDF } from "@/lib/generate-pdf";

interface ReworkResult {
  id: string;
  status: string;
  bullets: Array<{
    sectionTitle: string;
    originalText: string;
    revisedText: string | null;
    status: string;
    order: number;
  }>;
}

function ReworkResultContent() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const [result, setResult] = useState<ReworkResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      fetchResult();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  async function fetchResult() {
    try {
      const res = await fetch(`/api/rework?sessionId=${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setResult(data.reworkSession);
      }
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-500">Session not found.</p>
      </div>
    );
  }

  // Group bullets by section
  const sections = result.bullets.reduce<
    Record<string, typeof result.bullets>
  >((acc, bullet) => {
    if (!acc[bullet.sectionTitle]) acc[bullet.sectionTitle] = [];
    acc[bullet.sectionTitle].push(bullet);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Reworked Resume
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <p className="text-sm text-green-600 font-medium">
              All {result.bullets.length} bullets reworked
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              const text = Object.entries(sections)
                .map(
                  ([section, bullets]) =>
                    `${section}\n${bullets
                      .map((b) => `  - ${b.revisedText || b.originalText}`)
                      .join("\n")}`
                )
                .join("\n\n");
              navigator.clipboard.writeText(text);
              alert("Copied to clipboard!");
            }}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Copy className="h-4 w-4" />
            Copy Text
          </button>
          <button
            onClick={() => {
              const pdf = generateResumePDF(
                result.bullets,
                user?.fullName || undefined
              );
              pdf.save("reworked-resume.pdf");
            }}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </button>
        </div>
      </div>

      {/* Reworked bullets by section */}
      <div className="space-y-8">
        {Object.entries(sections).map(([section, bullets]) => (
          <div
            key={section}
            className="rounded-xl border border-gray-200 bg-white overflow-hidden"
          >
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">{section}</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {bullets
                .sort((a, b) => a.order - b.order)
                .map((bullet, i) => (
                  <div key={i} className="px-6 py-4">
                    <p className="text-xs text-gray-400 mb-1 line-through">
                      {bullet.originalText}
                    </p>
                    <p className="text-sm text-gray-900 font-medium">
                      {bullet.revisedText || bullet.originalText}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ReworkResultPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      }
    >
      <ReworkResultContent />
    </Suspense>
  );
}
