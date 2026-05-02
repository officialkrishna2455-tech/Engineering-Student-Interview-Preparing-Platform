"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState, useEffect, useRef, useCallback } from "react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
type Screen = "setup" | "chat" | "report";
type InterviewType = "Technical" | "HR" | "Mixed";
type CompanyType = "FAANG-style" | "Product Startup" | "Service MNC" | "Banking Tech";
type Duration = 30 | 45 | 60;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface FinalReport {
  overall_score: number;
  strengths: string[];
  weaknesses: string[];
  topics_to_revise: string[];
}

/* ------------------------------------------------------------------ */
/* Setup Screen                                                        */
/* ------------------------------------------------------------------ */
function SetupScreen({
  onStart,
}: {
  onStart: (type: InterviewType, company: CompanyType, dur: Duration) => void;
}) {
  const [interviewType, setInterviewType] = useState<InterviewType>("Technical");
  const [companyType, setCompanyType] = useState<CompanyType>("FAANG-style");
  const [duration, setDuration] = useState<Duration>(30);

  const interviewTypes: InterviewType[] = ["Technical", "HR", "Mixed"];
  const companyTypes: CompanyType[] = [
    "FAANG-style",
    "Product Startup",
    "Service MNC",
    "Banking Tech",
  ];
  const durations: Duration[] = [30, 45, 60];

  return (
    <div className="animate-fade-in mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/20">
          <span className="text-3xl">🎙️</span>
        </div>
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          AI Mock <span className="text-gradient">Interview</span>
        </h1>
        <p className="mt-2 text-surface-300">
          Practice with an AI interviewer tailored to your target company
        </p>
      </div>

      {/* Card */}
      <div className="glass-card p-8 space-y-8">
        {/* Interview Type */}
        <div>
          <label className="stat-label mb-3 block">Interview Type</label>
          <div className="grid grid-cols-3 gap-3">
            {interviewTypes.map((t) => (
              <button
                key={t}
                onClick={() => setInterviewType(t)}
                className={`group relative rounded-xl border px-4 py-3.5 text-sm font-semibold transition-all duration-300 ${
                  interviewType === t
                    ? "border-brand-500/50 bg-brand-500/15 text-brand-300 shadow-lg shadow-brand-500/10"
                    : "border-white/8 bg-white/3 text-surface-300 hover:border-white/15 hover:bg-white/6 hover:text-white"
                }`}
              >
                <span className="relative z-10">{t}</span>
                {interviewType === t && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-brand-500/10 to-transparent" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Company Type */}
        <div>
          <label className="stat-label mb-3 block">Company Type</label>
          <div className="grid grid-cols-2 gap-3">
            {companyTypes.map((c) => {
              const emojis: Record<CompanyType, string> = {
                "FAANG-style": "🏢",
                "Product Startup": "🚀",
                "Service MNC": "🌐",
                "Banking Tech": "🏦",
              };
              return (
                <button
                  key={c}
                  onClick={() => setCompanyType(c)}
                  className={`group relative flex items-center gap-3 rounded-xl border px-4 py-3.5 text-sm font-semibold transition-all duration-300 ${
                    companyType === c
                      ? "border-purple-500/50 bg-purple-500/15 text-purple-300 shadow-lg shadow-purple-500/10"
                      : "border-white/8 bg-white/3 text-surface-300 hover:border-white/15 hover:bg-white/6 hover:text-white"
                  }`}
                >
                  <span className="text-lg">{emojis[c]}</span>
                  <span>{c}</span>
                  {companyType === c && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/10 to-transparent" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="stat-label mb-3 block">Duration</label>
          <div className="grid grid-cols-3 gap-3">
            {durations.map((d) => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className={`rounded-xl border px-4 py-3.5 text-sm font-semibold transition-all duration-300 ${
                  duration === d
                    ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300 shadow-lg shadow-emerald-500/10"
                    : "border-white/8 bg-white/3 text-surface-300 hover:border-white/15 hover:bg-white/6 hover:text-white"
                }`}
              >
                {d} min
              </button>
            ))}
          </div>
        </div>

        {/* Start button */}
        <button
          onClick={() => onStart(interviewType, companyType, duration)}
          className="btn-primary w-full py-4 text-base group"
        >
          <span className="group-hover:scale-105 transition-transform inline-flex items-center gap-2">
            🚀 Start Interview
          </span>
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Chat Screen                                                         */
/* ------------------------------------------------------------------ */
function ChatScreen({
  interviewType,
  companyType,
  duration,
  onReport,
  userEmail,
}: {
  interviewType: InterviewType;
  companyType: CompanyType;
  duration: Duration;
  onReport: (report: FinalReport) => void;
  userEmail: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [started, setStarted] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Timer countdown
  useEffect(() => {
    if (!started) return;
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [started, timeLeft]);

  // Format time
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Timer color
  const timerColor =
    timeLeft > duration * 60 * 0.5
      ? "text-emerald-400"
      : timeLeft > duration * 60 * 0.2
      ? "text-amber-400"
      : "text-red-400";

  const timerBg =
    timeLeft > duration * 60 * 0.5
      ? "bg-emerald-500/10 border-emerald-500/20"
      : timeLeft > duration * 60 * 0.2
      ? "bg-amber-500/10 border-amber-500/20"
      : "bg-red-500/10 border-red-500/20";

  // Call API
  const sendToAPI = useCallback(
    async (msgs: ChatMessage[], isFirst: boolean) => {
      setLoading(true);
      try {
        const res = await fetch(`${apiUrl}/api/interview/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: msgs,
            interview_type: interviewType,
            company_type: companyType,
            is_first_message: isFirst,
          }),
        });

        if (!res.ok) throw new Error("API error");

        const data = await res.json();
        const assistantMsg: ChatMessage = {
          role: "assistant",
          content: data.reply,
        };
        setMessages((prev) => [...prev, assistantMsg]);

        if (data.is_final_report && data.report) {
          // Save session to DB
          try {
            await fetch(`${apiUrl}/api/interview/save-session`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                user_email: userEmail,
                interview_type: interviewType,
                company_type: companyType,
                score: data.report.overall_score,
                strengths: data.report.strengths,
                weaknesses: data.report.weaknesses,
                topics_to_revise: data.report.topics_to_revise,
              }),
            });
          } catch {
            // Don't block on save failure
          }
          setTimeout(() => onReport(data.report), 1500);
        }
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "⚠️ Something went wrong connecting to the server. Please try again.",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [apiUrl, companyType, interviewType, onReport, userEmail]
  );

  // Start interview (ref guard prevents React strict mode double-fire)
  const hasStarted = useRef(false);
  useEffect(() => {
    if (!hasStarted.current) {
      hasStarted.current = true;
      setStarted(true);
      sendToAPI([], true);
    }
  }, [sendToAPI]);

  // Send message
  const handleSend = () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = { role: "user", content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    sendToAPI(updatedMessages, false);
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // End interview early
  const handleEnd = () => {
    onReport({
      overall_score: 0,
      strengths: [],
      weaknesses: ["Interview ended early — no score generated"],
      topics_to_revise: [],
    });
  };

  return (
    <div className="animate-fade-in mx-auto flex h-[calc(100vh-6rem)] max-w-4xl flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400">
            <span className="text-lg">🎙️</span>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">
              {companyType} — {interviewType}
            </h2>
            <p className="text-xs text-surface-300">AI Interview in progress</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Timer */}
          <div
            className={`flex items-center gap-2 rounded-xl border px-4 py-2 ${timerBg}`}
          >
            <svg
              className={`h-4 w-4 ${timerColor}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            <span className={`text-sm font-bold tabular-nums ${timerColor}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
          {/* End button */}
          <button
            onClick={handleEnd}
            className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 transition-all duration-300 hover:bg-red-500/20 hover:border-red-500/50"
          >
            End Interview
          </button>
        </div>
      </div>

      {/* Chat area */}
      <div className="glass-card flex-1 overflow-y-auto p-6 space-y-4 mb-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            } animate-slide-up`}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div
              className={`relative max-w-[80%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-gradient-to-br from-brand-600 to-brand-500 text-white rounded-br-md shadow-lg shadow-brand-500/20"
                  : "bg-white/6 border border-white/8 text-surface-100 rounded-bl-md"
              }`}
            >
              {/* Avatar indicator */}
              <div
                className={`absolute top-3 ${
                  msg.role === "user" ? "-right-2" : "-left-2"
                } h-4 w-4 rounded-full ${
                  msg.role === "user"
                    ? "bg-brand-500"
                    : "bg-gradient-to-br from-purple-500 to-indigo-500"
                }`}
              />
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-white/6 border border-white/8 px-5 py-4">
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-xs text-surface-300 ml-2">
                AI is thinking...
              </span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input area */}
      <div className="glass-card p-4 mb-4">
        <div className="flex items-end gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your answer here..."
            rows={2}
            className="flex-1 resize-none rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition-all duration-300 focus:border-indigo-500 focus:bg-[rgba(255,255,255,0.08)] focus:ring-1 focus:ring-indigo-500/30"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="btn-primary px-6 py-3 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-lg"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
              />
            </svg>
            Send
          </button>
        </div>
        <p className="mt-2 text-xs text-surface-300/60">
          Press <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-medium text-surface-200">Enter</kbd> to send, <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-medium text-surface-200">Shift+Enter</kbd> for new line
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Report Screen                                                       */
/* ------------------------------------------------------------------ */
function ReportScreen({ report }: { report: FinalReport }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const score = report.overall_score;

  // Score animation
  useEffect(() => {
    const duration = 1500;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * score));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [score]);

  // Score ring
  const radius = 90;
  const stroke = 12;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  const getScoreColor = (s: number) => {
    if (s >= 70) return { stroke: "#34d399", text: "text-emerald-400", bg: "bg-emerald-500/10", label: "Excellent!" };
    if (s >= 50) return { stroke: "#fbbf24", text: "text-amber-400", bg: "bg-amber-500/10", label: "Good Effort!" };
    return { stroke: "#f87171", text: "text-red-400", bg: "bg-red-500/10", label: "Keep Practicing!" };
  };

  const color = getScoreColor(score);

  return (
    <div className="animate-fade-in mx-auto max-w-3xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          Interview <span className="text-gradient">Report</span>
        </h1>
        <p className="mt-2 text-surface-300">
          Here&apos;s how you performed in the mock interview
        </p>
      </div>

      {/* Score Circle */}
      <div className="glass-card p-8 mb-6 flex flex-col items-center">
        <div className="relative mb-4">
          <svg
            width="220"
            height="220"
            viewBox="0 0 220 220"
            className="drop-shadow-2xl"
          >
            <defs>
              <filter id="score-glow">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {/* Background */}
            <circle
              cx="110"
              cy="110"
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={stroke}
            />
            {/* Score arc */}
            <circle
              cx="110"
              cy="110"
              r={radius}
              fill="none"
              stroke={color.stroke}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              transform="rotate(-90 110 110)"
              filter="url(#score-glow)"
              className="transition-all duration-100"
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-5xl font-extrabold ${color.text}`}>
              {animatedScore}
            </span>
            <span className="text-sm text-surface-300 mt-1">out of 100</span>
          </div>
        </div>
        <span
          className={`inline-block rounded-full px-4 py-1.5 text-sm font-semibold ${color.bg} ${color.text}`}
        >
          {color.label}
        </span>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid gap-6 sm:grid-cols-2 mb-6">
        {/* Strengths */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15">
              <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">Strengths</h3>
          </div>
          <ul className="space-y-2.5">
            {report.strengths.length > 0 ? (
              report.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  <span className="text-sm text-surface-200">{s}</span>
                </li>
              ))
            ) : (
              <li className="text-sm text-surface-300 italic">No data available</li>
            )}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/15">
              <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider">Weaknesses</h3>
          </div>
          <ul className="space-y-2.5">
            {report.weaknesses.length > 0 ? (
              report.weaknesses.map((w, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                  <span className="text-sm text-surface-200">{w}</span>
                </li>
              ))
            ) : (
              <li className="text-sm text-surface-300 italic">No data available</li>
            )}
          </ul>
        </div>
      </div>

      {/* Topics to Revise */}
      {report.topics_to_revise.length > 0 && (
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/15">
              <svg className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider">
              Topics to Revise
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {report.topics_to_revise.map((topic, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-300 transition-all duration-300 hover:bg-indigo-500/20 hover:border-indigo-500/30"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
                </svg>
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => window.location.reload()}
          className="btn-primary flex-1 py-4 text-base justify-center"
        >
          🔄 Start New Interview
        </button>
        <Link
          href="/dashboard"
          className="btn-ghost flex-1 py-4 text-base justify-center text-center"
        >
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main Page                                                           */
/* ------------------------------------------------------------------ */
export default function InterviewPage() {
  const { data: session } = useSession();
  const [screen, setScreen] = useState<Screen>("setup");
  const [interviewType, setInterviewType] = useState<InterviewType>("Technical");
  const [companyType, setCompanyType] = useState<CompanyType>("FAANG-style");
  const [duration, setDuration] = useState<Duration>(30);
  const [report, setReport] = useState<FinalReport | null>(null);

  const userEmail = session?.user?.email || "guest@example.com";

  // Track interview visit on page load
  useEffect(() => {
    if (!session?.user?.email) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    fetch(`${apiUrl}/api/user/activity`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: session.user.email, action: "interview_visited" }),
    }).catch(() => {});
  }, [session]);

  const handleStart = (type: InterviewType, company: CompanyType, dur: Duration) => {
    setInterviewType(type);
    setCompanyType(company);
    setDuration(dur);
    setScreen("chat");
  };

  const handleReport = (r: FinalReport) => {
    setReport(r);
    setScreen("report");
  };

  return (
    <div className="relative min-h-screen pt-24 px-4 pb-16">
      {/* Background accents */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 right-0 h-[500px] w-[500px] rounded-full bg-purple-600/8 blur-3xl" />
        <div className="absolute bottom-0 -left-20 h-[400px] w-[400px] rounded-full bg-brand-600/8 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] rounded-full bg-indigo-600/5 blur-3xl" />
      </div>

      <div className="relative z-10">
        {screen === "setup" && <SetupScreen onStart={handleStart} />}
        {screen === "chat" && (
          <ChatScreen
            interviewType={interviewType}
            companyType={companyType}
            duration={duration}
            onReport={handleReport}
            userEmail={userEmail}
          />
        )}
        {screen === "report" && report && <ReportScreen report={report} />}
      </div>
    </div>
  );
}
