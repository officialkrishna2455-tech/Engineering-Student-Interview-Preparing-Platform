"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
type Screen = "setup" | "chat" | "report";

type Topic =
  | "AI will replace human jobs"
  | "Social media does more harm than good"
  | "Remote work is the future"
  | "Should coding be taught in schools?";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sender?: string; // "You" | "Riya" | "Arjun" | "Priya"
}

interface GDScores {
  clarity_score: number;
  counter_handling: number;
  leadership: number;
  overall: number;
  feedback: string;
}

/* ------------------------------------------------------------------ */
/* Participant Config                                                   */
/* ------------------------------------------------------------------ */
const participants = [
  {
    name: "You",
    emoji: "👤",
    color: "from-brand-600 to-brand-500",
    border: "border-brand-500/30",
    bg: "bg-brand-500/10",
    text: "text-brand-300",
    ring: "ring-brand-500/30",
    dotColor: "bg-brand-500",
  },
  {
    name: "Riya",
    emoji: "🤖",
    stance: "Pro stance",
    color: "from-purple-600 to-purple-500",
    border: "border-purple-500/30",
    bg: "bg-purple-500/10",
    text: "text-purple-300",
    ring: "ring-purple-500/30",
    dotColor: "bg-purple-500",
  },
  {
    name: "Arjun",
    emoji: "🤖",
    stance: "Against stance",
    color: "from-red-600 to-red-500",
    border: "border-red-500/30",
    bg: "bg-red-500/10",
    text: "text-red-300",
    ring: "ring-red-500/30",
    dotColor: "bg-red-500",
  },
  {
    name: "Priya",
    emoji: "🤖",
    stance: "Neutral stance",
    color: "from-amber-600 to-amber-500",
    border: "border-amber-500/30",
    bg: "bg-amber-500/10",
    text: "text-amber-300",
    ring: "ring-amber-500/30",
    dotColor: "bg-amber-500",
  },
];

function getParticipant(name: string) {
  return participants.find(
    (p) => p.name.toLowerCase() === name.toLowerCase()
  ) || participants[0];
}

/* ------------------------------------------------------------------ */
/* Setup Screen                                                        */
/* ------------------------------------------------------------------ */
function SetupScreen({ onStart }: { onStart: (topic: Topic) => void }) {
  const [selectedTopic, setSelectedTopic] = useState<Topic>(
    "AI will replace human jobs"
  );

  const topics: { label: Topic; emoji: string }[] = [
    { label: "AI will replace human jobs", emoji: "🤖" },
    { label: "Social media does more harm than good", emoji: "📱" },
    { label: "Remote work is the future", emoji: "🏠" },
    { label: "Should coding be taught in schools?", emoji: "💻" },
  ];

  return (
    <div className="animate-fade-in mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-amber-500/20 border border-purple-500/20">
          <span className="text-3xl">💬</span>
        </div>
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          Group <span className="text-gradient">Discussion</span>
        </h1>
        <p className="mt-2 text-surface-300">
          Practice your GD skills with AI-powered participants
        </p>
      </div>

      {/* Card */}
      <div className="glass-card p-8 space-y-8">
        {/* Participants Preview */}
        <div>
          <label className="stat-label mb-4 block">Participants</label>
          <div className="grid grid-cols-4 gap-3">
            {participants.map((p) => (
              <div
                key={p.name}
                className={`flex flex-col items-center gap-2 rounded-xl border ${p.border} ${p.bg} p-4 transition-all duration-300`}
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${p.color} text-xl shadow-lg`}
                >
                  {p.emoji}
                </div>
                <span className={`text-xs font-semibold ${p.text}`}>
                  {p.name}
                </span>
                {"stance" in p && (
                  <span className="text-[10px] text-surface-300">
                    {p.stance}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Topic Selection */}
        <div>
          <label className="stat-label mb-3 block">Choose a Topic</label>
          <div className="grid grid-cols-1 gap-3">
            {topics.map((t) => (
              <button
                key={t.label}
                onClick={() => setSelectedTopic(t.label)}
                className={`group relative flex items-center gap-4 rounded-xl border px-5 py-4 text-sm font-semibold text-left transition-all duration-300 ${
                  selectedTopic === t.label
                    ? "border-purple-500/50 bg-purple-500/15 text-purple-300 shadow-lg shadow-purple-500/10"
                    : "border-white/8 bg-white/3 text-surface-300 hover:border-white/15 hover:bg-white/6 hover:text-white"
                }`}
              >
                <span className="text-xl flex-shrink-0">{t.emoji}</span>
                <span className="relative z-10">{t.label}</span>
                {selectedTopic === t.label && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/10 to-transparent" />
                )}
                {selectedTopic === t.label && (
                  <svg
                    className="ml-auto h-5 w-5 text-purple-400 flex-shrink-0 relative z-10"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m4.5 12.75 6 6 9-13.5"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={() => onStart(selectedTopic)}
          className="btn-primary w-full py-4 text-base group"
        >
          <span className="group-hover:scale-105 transition-transform inline-flex items-center gap-2">
            💬 Join Discussion
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
  topic,
  onReport,
}: {
  topic: Topic;
  onReport: (scores: GDScores) => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userMsgCount, setUserMsgCount] = useState(0);
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const maxRounds = 5;

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Parse AI response into individual participant messages
  const parseResponse = (text: string): ChatMessage[] => {
    const result: ChatMessage[] = [];
    const lines = text.split("\n");
    let currentSender = "";
    let currentContent = "";

    for (const line of lines) {
      const riyaMatch = line.match(/^RIYA:\s*(.*)/i);
      const arjunMatch = line.match(/^ARJUN:\s*(.*)/i);
      const priyaMatch = line.match(/^PRIYA:\s*(.*)/i);

      if (riyaMatch || arjunMatch || priyaMatch) {
        // Save previous if exists
        if (currentSender && currentContent.trim()) {
          result.push({
            role: "assistant",
            content: currentContent.trim(),
            sender: currentSender,
          });
        }

        if (riyaMatch) {
          currentSender = "Riya";
          currentContent = riyaMatch[1];
        } else if (arjunMatch) {
          currentSender = "Arjun";
          currentContent = arjunMatch[1];
        } else if (priyaMatch) {
          currentSender = "Priya";
          currentContent = priyaMatch[1];
        }
      } else {
        currentContent += "\n" + line;
      }
    }

    // Push the last one
    if (currentSender && currentContent.trim()) {
      result.push({
        role: "assistant",
        content: currentContent.trim(),
        sender: currentSender,
      });
    }

    // Fallback: if parsing failed, return the whole thing
    if (result.length === 0) {
      result.push({
        role: "assistant",
        content: text,
        sender: "Riya",
      });
    }

    return result;
  };

  // Send message
  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const newCount = userMsgCount + 1;
    setUserMsgCount(newCount);

    const userMsg: ChatMessage = {
      role: "user",
      content: text,
      sender: "You",
    };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);
    setActiveSpeaker("thinking");

    try {
      // Build API messages (without sender field)
      const apiMessages = updatedMessages.map((m) => ({
        role: m.role,
        content: m.sender && m.sender !== "You"
          ? `${m.sender}: ${m.content}`
          : m.content,
      }));

      const res = await fetch(`${apiUrl}/api/gd/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages.slice(0, -1), // all except the new user msg
          topic,
          user_message: text,
        }),
      });

      if (!res.ok) throw new Error("API error");

      const data = await res.json();
      const parsed = parseResponse(data.reply);

      // Add parsed messages with animation delay
      for (let i = 0; i < parsed.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 600));
        setActiveSpeaker(parsed[i].sender || null);
        setMessages((prev) => [...prev, parsed[i]]);
      }

      setActiveSpeaker(null);

      if (data.is_final && data.scores) {
        setTimeout(() => onReport(data.scores), 1200);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "⚠️ Something went wrong connecting to the server. Please try again.",
          sender: "Riya",
        },
      ]);
      setActiveSpeaker(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="animate-fade-in mx-auto flex h-[calc(100vh-6rem)] max-w-4xl flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400">
            <span className="text-lg">💬</span>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white truncate max-w-[250px]">
              {topic}
            </h2>
            <p className="text-xs text-surface-300">
              Group Discussion in progress
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Round counter */}
          <div className="flex items-center gap-2 rounded-xl border border-purple-500/20 bg-purple-500/10 px-4 py-2">
            <svg
              className="h-4 w-4 text-purple-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182"
              />
            </svg>
            <span className="text-sm font-bold tabular-nums text-purple-400">
              Round {Math.min(userMsgCount, maxRounds)}/{maxRounds}
            </span>
          </div>
        </div>
      </div>

      {/* Participant bubbles */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {participants.map((p) => {
          const isActive =
            activeSpeaker === p.name ||
            (activeSpeaker === "thinking" && p.name !== "You");
          return (
            <div
              key={p.name}
              className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 transition-all duration-500 ${
                isActive
                  ? `${p.border} ${p.bg} shadow-lg`
                  : "border-white/6 bg-white/3"
              }`}
            >
              <div className="relative">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${p.color} text-sm shadow-md`}
                >
                  {p.emoji}
                </div>
                {isActive && (
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ${p.dotColor} border-2 border-surface-950 animate-pulse`}
                  />
                )}
              </div>
              <div className="min-w-0">
                <div className={`text-xs font-semibold ${p.text} truncate`}>
                  {p.name}
                </div>
                {"stance" in p && (
                  <div className="text-[10px] text-surface-300 truncate">
                    {p.stance}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Chat area */}
      <div className="glass-card flex-1 overflow-y-auto p-6 space-y-4 mb-4">
        {/* Welcome message */}
        {messages.length === 0 && !loading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-3">
              <div className="text-4xl">💬</div>
              <h3 className="text-lg font-semibold text-white">
                Start the Discussion
              </h3>
              <p className="text-sm text-surface-300 max-w-md">
                Share your opening thoughts on &ldquo;{topic}&rdquo; to begin.
                The AI participants will respond and debate with you.
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => {
          const participant = getParticipant(msg.sender || "You");
          const isUser = msg.role === "user";

          return (
            <div
              key={i}
              className={`flex ${
                isUser ? "justify-end" : "justify-start"
              } animate-slide-up`}
              style={{ animationDelay: `${(i % 5) * 50}ms` }}
            >
              <div className="flex items-start gap-2.5 max-w-[80%]">
                {/* Avatar (left for AI) */}
                {!isUser && (
                  <div
                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${participant.color} text-xs shadow-md mt-1`}
                  >
                    {participant.emoji}
                  </div>
                )}

                <div>
                  {/* Sender name */}
                  <span
                    className={`text-[11px] font-semibold mb-1 block ${
                      isUser ? "text-right" : ""
                    } ${participant.text}`}
                  >
                    {msg.sender || "You"}
                  </span>
                  <div
                    className={`rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
                      isUser
                        ? "bg-gradient-to-br from-brand-600 to-brand-500 text-white rounded-br-md shadow-lg shadow-brand-500/20"
                        : `bg-white/6 border ${participant.border} text-surface-100 rounded-bl-md`
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </div>

                {/* Avatar (right for user) */}
                {isUser && (
                  <div
                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${participant.color} text-xs shadow-md mt-1`}
                  >
                    {participant.emoji}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-white/6 border border-white/8 px-5 py-4">
              <div className="flex gap-1">
                <span
                  className="h-2 w-2 rounded-full bg-purple-400 animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="h-2 w-2 rounded-full bg-purple-400 animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="h-2 w-2 rounded-full bg-purple-400 animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
              <span className="text-xs text-surface-300 ml-2">
                Participants are responding...
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
            placeholder={
              userMsgCount >= maxRounds
                ? "Discussion complete! Generating your report..."
                : "Share your thoughts..."
            }
            rows={2}
            disabled={userMsgCount >= maxRounds || loading}
            className="flex-1 resize-none rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition-all duration-300 focus:border-indigo-500 focus:bg-[rgba(255,255,255,0.08)] focus:ring-1 focus:ring-indigo-500/30 disabled:opacity-40"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim() || userMsgCount >= maxRounds}
            className="btn-primary px-6 py-3 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:transform-none"
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
            Contribute
          </button>
        </div>
        <p className="mt-2 text-xs text-surface-300/60">
          Press{" "}
          <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-medium text-surface-200">
            Enter
          </kbd>{" "}
          to send,{" "}
          <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-medium text-surface-200">
            Shift+Enter
          </kbd>{" "}
          for new line
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Score Circle Component                                              */
/* ------------------------------------------------------------------ */
function ScoreCircle({
  label,
  score,
  maxScore,
  color,
  delay,
}: {
  label: string;
  score: number;
  maxScore: number;
  color: { stroke: string; text: string; bg: string };
  delay: number;
}) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = 50;
  const stroke = 8;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / maxScore) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      const duration = 1200;
      const start = performance.now();
      const step = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setAnimatedScore(Math.round(eased * score * 10) / 10);
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, delay);
    return () => clearTimeout(timer);
  }, [score, delay]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <svg
          width="130"
          height="130"
          viewBox="0 0 130 130"
          className="drop-shadow-lg"
        >
          <defs>
            <filter id={`glow-${label}`}>
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <circle
            cx="65"
            cy="65"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={stroke}
          />
          <circle
            cx="65"
            cy="65"
            r={radius}
            fill="none"
            stroke={color.stroke}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 65 65)"
            filter={`url(#glow-${label})`}
            className="transition-all duration-100"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-extrabold ${color.text}`}>
            {animatedScore.toFixed(0)}
          </span>
          <span className="text-[10px] text-surface-300">
            / {maxScore}
          </span>
        </div>
      </div>
      <span className="text-xs font-semibold text-surface-200">{label}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Report Screen                                                       */
/* ------------------------------------------------------------------ */
function ReportScreen({ scores }: { scores: GDScores }) {
  const scoreItems = [
    {
      label: "Clarity",
      score: scores.clarity_score,
      color: {
        stroke: "#818cf8",
        text: "text-indigo-400",
        bg: "bg-indigo-500/10",
      },
    },
    {
      label: "Counter Handling",
      score: scores.counter_handling,
      color: {
        stroke: "#a78bfa",
        text: "text-purple-400",
        bg: "bg-purple-500/10",
      },
    },
    {
      label: "Leadership",
      score: scores.leadership,
      color: {
        stroke: "#34d399",
        text: "text-emerald-400",
        bg: "bg-emerald-500/10",
      },
    },
    {
      label: "Overall",
      score: scores.overall,
      color: {
        stroke: "#fbbf24",
        text: "text-amber-400",
        bg: "bg-amber-500/10",
      },
    },
  ];

  const getOverallLabel = (s: number) => {
    if (s >= 8) return { label: "Excellent!", color: "text-emerald-400 bg-emerald-500/10" };
    if (s >= 6) return { label: "Good Performance!", color: "text-indigo-400 bg-indigo-500/10" };
    if (s >= 4) return { label: "Decent Effort", color: "text-amber-400 bg-amber-500/10" };
    return { label: "Keep Practicing!", color: "text-red-400 bg-red-500/10" };
  };

  const badge = getOverallLabel(scores.overall);

  return (
    <div className="animate-fade-in mx-auto max-w-3xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          GD <span className="text-gradient">Report</span>
        </h1>
        <p className="mt-2 text-surface-300">
          Here&apos;s how you performed in the group discussion
        </p>
        <span
          className={`mt-3 inline-block rounded-full px-5 py-2 text-sm font-semibold ${badge.color}`}
        >
          {badge.label}
        </span>
      </div>

      {/* Score Circles */}
      <div className="glass-card p-8 mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {scoreItems.map((item, i) => (
            <ScoreCircle
              key={item.label}
              label={item.label}
              score={item.score}
              maxScore={10}
              color={item.color}
              delay={i * 200}
            />
          ))}
        </div>
      </div>

      {/* Feedback Box */}
      <div className="glass-card p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/15">
            <svg
              className="h-5 w-5 text-purple-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
              />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-purple-400 uppercase tracking-wider">
            Detailed Feedback
          </h3>
        </div>
        <p className="text-sm text-surface-200 leading-relaxed">
          {scores.feedback}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => window.location.reload()}
          className="btn-primary flex-1 py-4 text-base justify-center"
        >
          🔄 Try Another Topic
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
export default function GroupDiscussionPage() {
  const [screen, setScreen] = useState<Screen>("setup");
  const [topic, setTopic] = useState<Topic>("AI will replace human jobs");
  const [scores, setScores] = useState<GDScores | null>(null);

  const handleStart = (selectedTopic: Topic) => {
    setTopic(selectedTopic);
    setScreen("chat");
  };

  const handleReport = (s: GDScores) => {
    setScores(s);
    setScreen("report");
  };

  return (
    <div className="relative min-h-screen pt-24 px-4 pb-16">
      {/* Background accents */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 right-0 h-[500px] w-[500px] rounded-full bg-purple-600/8 blur-3xl" />
        <div className="absolute bottom-0 -left-20 h-[400px] w-[400px] rounded-full bg-amber-600/8 blur-3xl" />
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] rounded-full bg-red-600/5 blur-3xl" />
      </div>

      <div className="relative z-10">
        {screen === "setup" && <SetupScreen onStart={handleStart} />}
        {screen === "chat" && (
          <ChatScreen topic={topic} onReport={handleReport} />
        )}
        {screen === "report" && scores && <ReportScreen scores={scores} />}
      </div>
    </div>
  );
}
