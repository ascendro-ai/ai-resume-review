import Link from "next/link";
import {
  FileText,
  Zap,
  MessageSquare,
  Download,
  ArrowRight,
  CheckCircle,
  Star,
} from "lucide-react";

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-white">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">
              <Star className="h-4 w-4" />
              Built for consulting applicants
            </div>
            <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Your resume,{" "}
              <span className="text-blue-600">consulting-ready</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
              Get instant AI-powered feedback on your resume, then rework it
              line-by-line with an expert AI coach. Built specifically for
              MBB, Big 4, and boutique consulting applications.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/scorecard"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-3.5 text-base font-medium text-white shadow-sm hover:bg-blue-700"
              >
                Get Free Scorecard
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-8 py-3.5 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-gray-900">
            How it works
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-gray-600">
            Two ways to improve your resume — start free, upgrade when
            you&apos;re ready.
          </p>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <div className="rounded-xl bg-white p-8 shadow-sm border border-gray-200">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                1. Upload your resume
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Drop your PDF and we&apos;ll extract every section and bullet
                point automatically.
              </p>
            </div>

            <div className="rounded-xl bg-white p-8 shadow-sm border border-gray-200">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                2. Get instant feedback
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Free scorecard with overall score, section breakdown, strengths,
                and specific improvements.
              </p>
            </div>

            <div className="rounded-xl bg-white p-8 shadow-sm border border-gray-200">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <MessageSquare className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                3. Rework line-by-line
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Our AI coach walks through each bullet, asks what you did, and
                rewrites it in consulting format.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Free vs Paid */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Free scorecard vs. full rework
          </h2>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            <div className="rounded-xl border-2 border-gray-200 p-8">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Free
              </p>
              <h3 className="mt-2 text-2xl font-bold text-gray-900">
                Resume Scorecard
              </h3>
              <p className="mt-1 text-3xl font-bold text-gray-900">$0</p>
              <ul className="mt-6 space-y-3">
                {[
                  "Overall score out of 100",
                  "Section-by-section breakdown",
                  "Top 3 strengths identified",
                  "Top 3 improvements to make",
                  "Format & structure check",
                  "3 scorecards per account",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/scorecard"
                className="mt-8 block w-full rounded-lg border-2 border-blue-600 py-3 text-center font-medium text-blue-600 hover:bg-blue-50"
              >
                Try Free Scorecard
              </Link>
            </div>

            <div className="rounded-xl border-2 border-blue-600 p-8 relative">
              <div className="absolute -top-3 left-6 rounded-full bg-blue-600 px-3 py-0.5 text-xs font-medium text-white">
                Most Popular
              </div>
              <p className="text-sm font-medium text-blue-600 uppercase tracking-wide">
                Paid
              </p>
              <h3 className="mt-2 text-2xl font-bold text-gray-900">
                Full Resume Rework
              </h3>
              <p className="mt-1">
                <span className="text-3xl font-bold text-gray-900">$19.99</span>
                <span className="text-gray-500 ml-1">per session</span>
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Everything in Scorecard",
                  "Interactive line-by-line rework",
                  "AI asks YOU to explain each bullet",
                  "Consulting-standard rewrites (Action \u2192 Context \u2192 Impact)",
                  "Accept, edit, or request revision for each",
                  "Download polished PDF in consulting template",
                  "Pause & resume anytime",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-blue-600 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/pricing"
                className="mt-8 block w-full rounded-lg bg-blue-600 py-3 text-center font-medium text-white hover:bg-blue-700"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white">
            Ready to land that consulting offer?
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            Start with a free scorecard. See exactly where your resume stands.
          </p>
          <Link
            href="/scorecard"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3.5 text-base font-medium text-blue-600 shadow-sm hover:bg-gray-100"
          >
            <Download className="h-5 w-5" />
            Upload Your Resume
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-gray-400">
          <p>AI Resume Review. Powered by Claude.</p>
        </div>
      </footer>
    </div>
  );
}
