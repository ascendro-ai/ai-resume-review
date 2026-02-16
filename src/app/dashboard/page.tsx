"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  FileText,
  ArrowRight,
  Clock,
  CheckCircle,
  CreditCard,
} from "lucide-react";

interface DashboardData {
  user: {
    scorecardCount: number;
    reworkCredits: number;
  };
  scorecards: Array<{
    id: string;
    overallScore: number;
    createdAt: string;
    resume: { fileName: string };
  }>;
  reworkSessions: Array<{
    id: string;
    status: string;
    currentBulletIndex: number;
    totalBullets: number;
    createdAt: string;
    updatedAt: string;
    resume: { fileName: string };
  }>;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetchDashboard();
    }
  }, [status]);

  async function fetchDashboard() {
    try {
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        const d = await res.json();
        setData(d);
      }
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading" || loading) {
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

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex gap-3">
          <Link
            href="/scorecard"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            New Scorecard
          </Link>
          <Link
            href="/rework"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            New Rework
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-500">Scorecards Used</p>
          <p className="text-2xl font-bold text-gray-900">
            {data?.user.scorecardCount || 0}/3
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-500">Rework Credits</p>
          <p className="text-2xl font-bold text-gray-900">
            {data?.user.reworkCredits || 0}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Need more?</p>
            <p className="text-sm font-medium text-gray-900">Buy credits</p>
          </div>
          <Link href="/pricing">
            <CreditCard className="h-5 w-5 text-blue-600" />
          </Link>
        </div>
      </div>

      {/* Scorecards */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Scorecards
        </h2>
        {!data?.scorecards?.length ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
            <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No scorecards yet.</p>
            <Link
              href="/scorecard"
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Get your first scorecard <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {data.scorecards.map((sc) => (
              <div
                key={sc.id}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-6 py-4"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white ${
                      sc.overallScore >= 80
                        ? "bg-green-500"
                        : sc.overallScore >= 60
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                  >
                    {sc.overallScore}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {sc.resume.fileName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(sc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rework Sessions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Rework Sessions
        </h2>
        {!data?.reworkSessions?.length ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
            <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No rework sessions yet.</p>
            <Link
              href="/rework"
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Start a rework <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {data.reworkSessions.map((rs) => (
              <Link
                key={rs.id}
                href={
                  rs.status === "completed"
                    ? `/rework/result?sessionId=${rs.id}`
                    : `/rework?sessionId=${rs.id}`
                }
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-6 py-4 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {rs.status === "completed" ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Clock className="h-5 w-5 text-yellow-500" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">
                      {rs.resume.fileName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {rs.currentBulletIndex}/{rs.totalBullets} bullets
                      completed &middot;{" "}
                      {new Date(rs.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-medium text-blue-600">
                  {rs.status === "completed" ? "View Result" : "Resume"}{" "}
                  <ArrowRight className="inline h-3 w-3" />
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
