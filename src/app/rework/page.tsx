"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Lock } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import ReworkChat from "@/components/ReworkChat";
import Link from "next/link";

interface ReworkSession {
  id: string;
  status: string;
  currentBulletIndex: number;
  totalBullets: number;
  bullets: Array<{
    id: string;
    sectionTitle: string;
    originalText: string;
    userExplanation: string | null;
    revisedText: string | null;
    status: string;
    order: number;
  }>;
}

function ReworkPageContent() {
  const searchParams = useSearchParams();
  const [reworkSession, setReworkSession] = useState<ReworkSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resumeSessionId = searchParams.get("sessionId");

  useEffect(() => {
    if (resumeSessionId) {
      loadExistingSession(resumeSessionId);
    }
  }, [resumeSessionId]);

  async function loadExistingSession(sessionId: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/rework?sessionId=${sessionId}`);
      if (!res.ok) throw new Error("Failed to load session");
      const data = await res.json();
      setReworkSession(data.reworkSession);
    } catch {
      setError("Could not load rework session.");
    } finally {
      setLoading(false);
    }
  }

  async function startRework(resumeId: string) {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/rework", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (res.status === 403) {
          setError("no_credits");
          return;
        }
        throw new Error(data.error || "Failed to start rework");
      }

      const data = await res.json();
      setReworkSession(data.reworkSession);
    } catch (err) {
      if (error !== "no_credits") {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  }

  if (reworkSession) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
          Resume Rework
        </h1>
        <p className="text-center text-gray-500 mb-8">
          Walk through each bullet with your AI coach
        </p>
        <ReworkChat session={reworkSession} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Full Resume Rework
        </h1>
        <p className="mt-2 text-gray-600">
          Upload your resume for an interactive, line-by-line rewrite with your
          AI consulting coach.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600 font-medium">
            Preparing your rework session...
          </p>
        </div>
      ) : error === "no_credits" ? (
        <div className="text-center py-16">
          <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-900 font-semibold text-lg mb-2">
            No rework credits remaining
          </p>
          <p className="text-gray-500 mb-6">
            Purchase a rework session to get started.
          </p>
          <Link
            href="/pricing"
            className="rounded-lg bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700"
          >
            View Pricing
          </Link>
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-red-600">{error}</p>
        </div>
      ) : (
        <FileUpload
          onUploadComplete={(data) => {
            startRework(data.resumeId);
          }}
        />
      )}
    </div>
  );
}

export default function ReworkPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      }
    >
      <ReworkPageContent />
    </Suspense>
  );
}
