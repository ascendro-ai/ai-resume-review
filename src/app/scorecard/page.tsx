"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import ScorecardDisplay from "@/components/ScorecardDisplay";

export default function ScorecardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [scorecard, setScorecard] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  async function generateScorecard(id: string) {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/scorecard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId: id }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate scorecard");
      }

      const data = await res.json();
      setScorecard(data.scorecard);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (scorecard) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
          Your Resume Scorecard
        </h1>
        <ScorecardDisplay data={scorecard as never} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Free Resume Scorecard
        </h1>
        <p className="mt-2 text-gray-600">
          Upload your resume and get instant consulting-focused feedback.
        </p>
      </div>

      {!resumeId ? (
        <FileUpload
          onUploadComplete={(data) => {
            setResumeId(data.resumeId);
            generateScorecard(data.resumeId);
          }}
        />
      ) : loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600 font-medium">
            Analyzing your resume...
          </p>
          <p className="text-sm text-gray-400 mt-1">
            This takes about 10-15 seconds
          </p>
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => generateScorecard(resumeId)}
            className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      ) : null}
    </div>
  );
}
