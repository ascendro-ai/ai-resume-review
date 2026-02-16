"use client";

import { useState, useEffect, useRef } from "react";
import {
  Send,
  Check,
  Edit3,
  ArrowRight,
  Loader2,
  CheckCircle,
} from "lucide-react";

interface Bullet {
  id: string;
  sectionTitle: string;
  originalText: string;
  userExplanation: string | null;
  revisedText: string | null;
  status: string;
  order: number;
}

interface ReworkSession {
  id: string;
  status: string;
  currentBulletIndex: number;
  totalBullets: number;
  bullets: Bullet[];
}

interface Message {
  role: "assistant" | "user";
  content: string;
}

export default function ReworkChat({
  session: reworkSession,
}: {
  session: ReworkSession;
}) {
  const [bullets, setBullets] = useState<Bullet[]>(reworkSession.bullets);
  const [currentIndex, setCurrentIndex] = useState(() => {
    const firstPending = reworkSession.bullets.findIndex(
      (b) => b.status !== "accepted"
    );
    return firstPending === -1 ? 0 : firstPending;
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [revisedBullet, setRevisedBullet] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [completed, setCompleted] = useState(
    reworkSession.status === "completed"
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentBullet = bullets[currentIndex];
  const acceptedCount = bullets.filter((b) => b.status === "accepted").length;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Ask Claude about the current bullet when it changes
  useEffect(() => {
    if (currentBullet && currentBullet.status === "pending") {
      askAboutBullet();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  async function askAboutBullet() {
    setLoading(true);
    setRevisedBullet(null);
    // reset state

    try {
      const res = await fetch("/api/rework/bullet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bulletId: currentBullet.id,
          action: "ask",
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.question },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendExplanation() {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch("/api/rework/bullet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bulletId: currentBullet.id,
          action: "rewrite",
          userExplanation: userMessage,
        }),
      });
      const data = await res.json();
      setRevisedBullet(data.revisedBullet);

      setEditText(data.revisedBullet);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Here's your revised bullet:\n\n**"${data.revisedBullet}"**\n\n${data.explanation}`,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept() {
    setLoading(true);
    const textToAccept = editing ? editText : revisedBullet;

    try {
      const res = await fetch("/api/rework/bullet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bulletId: currentBullet.id,
          action: "accept",
          userExplanation: textToAccept,
        }),
      });
      const data = await res.json();

      setBullets((prev) =>
        prev.map((b) =>
          b.id === currentBullet.id
            ? { ...b, status: "accepted", revisedText: textToAccept }
            : b
        )
      );

      if (data.sessionCompleted) {
        setCompleted(true);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "All bullets have been reworked! Your polished resume is ready to download from your dashboard.",
          },
        ]);
      } else {
        // Move to next bullet
        const nextIndex = bullets.findIndex(
          (b, i) => i > currentIndex && b.status !== "accepted"
        );
        if (nextIndex !== -1) {
          setCurrentIndex(nextIndex);
          setRevisedBullet(null);
          // reset state
          setEditing(false);
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error accepting bullet. Try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  if (completed) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Resume Rework Complete!
        </h2>
        <p className="text-gray-600 mb-6">
          All {bullets.length} bullet points have been polished. Head to your
          dashboard to download the final PDF.
        </p>
        <a
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700"
        >
          Go to Dashboard
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>
            Bullet {currentIndex + 1} of {bullets.length}
          </span>
          <span>{acceptedCount} completed</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 bg-blue-600 rounded-full transition-all duration-500"
            style={{
              width: `${(acceptedCount / bullets.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Current Bullet Context */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <p className="text-xs font-medium text-amber-700 uppercase tracking-wide mb-1">
          {currentBullet?.sectionTitle} — Current Bullet
        </p>
        <p className="text-gray-800 italic">
          &ldquo;{currentBullet?.originalText}&rdquo;
        </p>
      </div>

      {/* Chat Messages */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-4 py-2">
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Revised Bullet Actions */}
        {revisedBullet && !completed && (
          <div className="border-t border-gray-200 bg-green-50 p-4">
            {editing ? (
              <div>
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleAccept}
                    disabled={loading}
                    className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white font-medium hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                  >
                    <Check className="h-4 w-4" />
                    Accept Edit
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleAccept}
                  disabled={loading}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white font-medium hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                >
                  <Check className="h-4 w-4" />
                  Accept
                </button>
                <button
                  onClick={() => {
                    setEditing(true);
                    setEditText(revisedBullet);
                  }}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-1"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit
                </button>
              </div>
            )}
          </div>
        )}

        {/* Input */}
        {!revisedBullet && !completed && (
          <div className="border-t border-gray-200 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendExplanation();
                  }
                }}
                placeholder="Tell me what you actually did..."
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
              <button
                onClick={handleSendExplanation}
                disabled={loading || !input.trim()}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
