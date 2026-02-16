"use client";

import {
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  FileText,
} from "lucide-react";
import type { ScorecardData } from "@/types/scorecard";

function ScoreRing({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 80
      ? "text-green-500"
      : score >= 60
      ? "text-yellow-500"
      : "text-red-500";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="h-32 w-32 -rotate-90">
        <circle
          cx="64"
          cy="64"
          r={radius}
          strokeWidth="8"
          fill="none"
          className="stroke-gray-200"
        />
        <circle
          cx="64"
          cy="64"
          r={radius}
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`${color} stroke-current transition-all duration-1000`}
        />
      </svg>
      <span className="absolute text-3xl font-bold text-gray-900">
        {score}
      </span>
    </div>
  );
}

function SectionBar({
  label,
  score,
  feedback,
}: {
  label: string;
  score: number;
  feedback: string;
}) {
  const color =
    score >= 80 ? "bg-green-500" : score >= 60 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-gray-700 capitalize">{label}</span>
        <span className="text-gray-500">{score}/100</span>
      </div>
      <div className="h-2 rounded-full bg-gray-200">
        <div
          className={`h-2 rounded-full ${color} transition-all duration-700`}
          style={{ width: `${score}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-gray-500">{feedback}</p>
    </div>
  );
}

export default function ScorecardDisplay({ data }: { data: ScorecardData }) {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Overall Score */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Overall Resume Score
        </h2>
        <ScoreRing score={data.overallScore} />
        <p className="mt-4 text-sm text-gray-500">
          {data.overallScore >= 80
            ? "Strong resume for consulting applications."
            : data.overallScore >= 60
            ? "Good foundation, but key improvements needed."
            : "Significant improvements recommended before applying."}
        </p>
      </div>

      {/* Section Scores */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          Section Breakdown
        </h3>
        {Object.entries(data.sectionScores).map(([key, val]) => (
          <SectionBar key={key} label={key} score={val.score} feedback={val.feedback} />
        ))}
      </div>

      {/* Strengths & Improvements */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Top Strengths
          </h3>
          <ul className="space-y-3">
            {data.strengths.map((s, i) => (
              <li key={i}>
                <p className="font-medium text-gray-900 text-sm">{s.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.detail}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Areas for Improvement
          </h3>
          <ul className="space-y-3">
            {data.improvements.map((s, i) => (
              <li key={i}>
                <p className="font-medium text-gray-900 text-sm">{s.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Format Feedback */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          Format & Structure
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {Object.entries(data.formatFeedback).map(([key, val]) => (
            <div key={key} className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide capitalize">
                {key.replace(/([A-Z])/g, " $1")}
              </p>
              <p className="text-sm text-gray-700 mt-1">{val}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
