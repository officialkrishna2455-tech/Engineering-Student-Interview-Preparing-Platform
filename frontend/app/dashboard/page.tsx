"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
interface UserData {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  is_pro: boolean;
  streak_days: number;
  last_active_date: string | null;
  readiness_score: number;
  created_at: string;
}

/* ------------------------------------------------------------------ */
/* Circular Score Ring                                                  */
/* ------------------------------------------------------------------ */
function ReadinessRing({ score }: { score: number }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const ringRef = useRef<SVGCircleElement>(null);

  const radius = 80;
  const stroke = 10;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.min(Math.max(score, 0), 100);

  // Determine colour based on score thresholds
  const getColor = (s: number) => {
    if (s >= 60) return { stroke: "#818cf8", text: "text-indigo-400", glow: "rgba(129,140,248,0.35)" };
    if (s >= 30) return { stroke: "#fbbf24", text: "text-amber-400", glow: "rgba(251,191,36,0.35)" };
    return { stroke: "#f87171", text: "text-red-400", glow: "rgba(248,113,113,0.35)" };
  };

  const color = getColor(clampedScore);

  useEffect(() => {
    // Animate number count-up
    const duration = 1200;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setAnimatedScore(Math.round(eased * clampedScore * 10) / 10);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [clampedScore]);

  const offset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="glass-card p-6 flex flex-col items-center justify-center gap-3">
      <span className="stat-label">Readiness Score</span>
      <div className="relative">
        <svg width="200" height="200" viewBox="0 0 200 200" className="drop-shadow-lg">
          {/* Glow filter */}
          <defs>
            <filter id="ring-glow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background track */}
          <circle
            cx="100" cy="100" r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={stroke}
          />
          {/* Score arc */}
          <circle
            ref={ringRef}
            cx="100" cy="100" r={radius}
            fill="none"
            stroke={color.stroke}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 100 100)"
            filter="url(#ring-glow)"
            className="transition-all duration-100"
          />
        </svg>
        {/* Centre label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-extrabold ${color.text}`}>
            {animatedScore.toFixed(1)}%
          </span>
          <span className="text-xs text-surface-300 mt-0.5">overall</span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Quick Actions                                                       */
/* ------------------------------------------------------------------ */
const quickActions = [
  {
    label: "Build Resume",
    href: "/resume",
    emoji: "📄",
    gradient: "from-brand-600/20 to-brand-500/10",
    border: "hover:border-brand-500/40",
  },
  {
    label: "Mock Interview",
    href: "/interview",
    emoji: "🎙️",
    gradient: "from-purple-600/20 to-purple-500/10",
    border: "hover:border-purple-500/40",
  },
  {
    label: "Group Discussion",
    href: "/gd",
    emoji: "💬",
    gradient: "from-pink-600/20 to-pink-500/10",
    border: "hover:border-pink-500/40",
  },
  {
    label: "Practice Aptitude",
    href: "/aptitude",
    emoji: "🧠",
    gradient: "from-emerald-600/20 to-emerald-500/10",
    border: "hover:border-emerald-500/40",
  },
  {
    label: "Company Tracker",
    href: "/companies",
    emoji: "🏢",
    gradient: "from-amber-600/20 to-amber-500/10",
    border: "hover:border-amber-500/40",
  },
  {
    label: "Compare Offers",
    href: "/offers",
    emoji: "⚖️",
    gradient: "from-cyan-600/20 to-cyan-500/10",
    border: "hover:border-cyan-500/40",
  },
];

function QuickActions() {
  return (
    <div className="glass-card p-6">
      <span className="stat-label mb-4 block">Quick Actions</span>
      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action, idx) => (
          <Link
            key={action.href}
            href={action.href}
            className={`group flex flex-col items-center gap-2 rounded-xl border border-white/8 bg-gradient-to-br ${action.gradient} p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${action.border} ${quickActions.length % 2 !== 0 && idx === quickActions.length - 1 ? "col-span-2" : ""}`}
          >
            <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
              {action.emoji}
            </span>
            <span className="text-xs font-semibold text-surface-200 group-hover:text-white transition-colors">
              {action.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Streak Calendar Strip                                               */
/* ------------------------------------------------------------------ */
function StreakStrip({ streakDays }: { streakDays: number }) {
  const today = new Date();
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const activeDaysThisWeek = Math.min(streakDays, 7);

  // Build last 7 days (most recent on the right)
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const isActive = i >= 7 - activeDaysThisWeek;
    return { day: dayLabels[d.getDay()], date: d.getDate(), isActive };
  });

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="stat-label">Weekly Streak</span>
        <div className="flex items-center gap-1.5">
          <span className="text-lg">🔥</span>
          <span className="text-sm font-bold text-amber-400">{streakDays} day{streakDays !== 1 ? "s" : ""}</span>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2">
        {days.map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <span className="text-[10px] font-medium text-surface-300">{d.day}</span>
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                d.isActive
                  ? "bg-gradient-to-br from-amber-400 to-orange-500 text-black shadow-lg shadow-amber-500/30"
                  : "bg-white/5 text-surface-300 border border-white/8"
              }`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              {d.date}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Notifications Panel                                                 */
/* ------------------------------------------------------------------ */
interface Notification {
  color: "red" | "yellow" | "green";
  icon: string;
  message: string;
}

const notifications: Notification[] = [
  { color: "red", icon: "🔴", message: "Resume score below 70 — update it" },
  { color: "yellow", icon: "🟡", message: "Amazon drive in 3 days" },
  { color: "green", icon: "🟢", message: "You're on a 3-day streak!" },
];

const notifStyles: Record<string, string> = {
  red: "border-l-red-500 bg-red-500/5",
  yellow: "border-l-amber-400 bg-amber-400/5",
  green: "border-l-emerald-400 bg-emerald-400/5",
};

function NotificationsPanel() {
  return (
    <div className="glass-card p-6">
      <span className="stat-label mb-4 block">Notifications</span>
      <div className="flex flex-col gap-2.5">
        {notifications.map((n, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 rounded-lg border-l-[3px] px-4 py-3 ${notifStyles[n.color]} transition-all duration-300 hover:translate-x-1`}
          >
            <span className="text-base flex-shrink-0">{n.icon}</span>
            <span className="text-sm text-surface-200">{n.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Badges Row                                                          */
/* ------------------------------------------------------------------ */
interface Badge {
  label: string;
  emoji: string;
  earned: boolean;
}

const badges: Badge[] = [
  { label: "Resume Star", emoji: "🌟", earned: false },
  { label: "Interview Ready", emoji: "🎯", earned: false },
  { label: "Streak King", emoji: "🔥", earned: false },
];

function BadgesRow() {
  return (
    <div className="glass-card p-6">
      <span className="stat-label mb-4 block">Achievements</span>
      <div className="flex items-center justify-around gap-3">
        {badges.map((b, i) => (
          <div
            key={i}
            className={`flex flex-col items-center gap-2 rounded-2xl px-5 py-4 transition-all duration-300 ${
              b.earned
                ? "bg-brand-600/15 border border-brand-500/30 shadow-lg shadow-brand-500/20"
                : "bg-white/3 border border-white/6 opacity-45 grayscale"
            }`}
          >
            <span className={`text-3xl ${b.earned ? "animate-pulse-slow" : ""}`}>{b.emoji}</span>
            <span className={`text-xs font-semibold ${b.earned ? "text-brand-300" : "text-surface-300"}`}>
              {b.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main Dashboard Page                                                 */
/* ------------------------------------------------------------------ */
export default function DashboardPage() {
  const { data: session } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      if (!session?.user?.email) {
        setLoading(false);
        return;
      }
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(`${apiUrl}/api/user/${session.user.email}`);
        if (res.ok) {
          setUserData(await res.json());
        } else {
          setError("Could not load user data");
        }
      } catch {
        setError("API server unreachable");
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [session]);

  const displayName = userData?.name || session?.user?.name || "User";
  const avatarUrl = userData?.avatar_url || session?.user?.image || "";

  return (
    <div className="relative min-h-screen pt-24 px-4 pb-16">
      {/* Background accents */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 right-0 h-[500px] w-[500px] rounded-full bg-brand-600/8 blur-3xl" />
        <div className="absolute bottom-0 -left-20 h-[400px] w-[400px] rounded-full bg-purple-600/8 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Welcome header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-2">
            {avatarUrl && (
              <Image
                src={avatarUrl}
                alt={displayName}
                width={56}
                height={56}
                className="rounded-2xl ring-2 ring-brand-500/20"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold sm:text-4xl">
                Welcome back,{" "}
                <span className="text-gradient">{displayName.split(" ")[0]}</span>
              </h1>
              <p className="mt-1 text-surface-300">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          /* Loading skeleton */
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-card p-8 animate-pulse">
                <div className="mb-3 h-3 w-20 rounded bg-white/10" />
                <div className="h-8 w-24 rounded bg-white/10" />
                <div className="mt-4 h-20 w-full rounded-xl bg-white/5" />
              </div>
            ))}
          </div>
        ) : error ? (
          /* Error state */
          <div className="glass-card p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white">{error}</h3>
            <p className="mt-2 text-sm text-surface-300">
              Make sure the FastAPI backend is running on{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">
                localhost:8000
              </code>
            </p>
          </div>
        ) : (
          /* Dashboard content */
          <div className="space-y-8 animate-fade-in">
            {/* ── ROW 1 ── Readiness Ring + Quick Actions + Stats */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* 1. Circular Readiness Score */}
              <ReadinessRing score={userData?.readiness_score ?? 0} />

              {/* 2. Quick Actions 2×2 */}
              <QuickActions />

              {/* Mini-stats column */}
              <div className="flex flex-col gap-6">
                <div className="stat-card group flex-1">
                  <span className="stat-label">Current Streak</span>
                  <div className="flex items-end gap-2">
                    <span className="stat-value">{userData?.streak_days ?? 0}</span>
                    <span className="mb-1 text-sm text-surface-300">days</span>
                  </div>
                  {(userData?.streak_days ?? 0) > 0 && (
                    <span className="text-lg mt-1">
                      {"🔥".repeat(Math.min(userData?.streak_days ?? 0, 5))}
                    </span>
                  )}
                </div>

                <div className="stat-card group flex-1">
                  <span className="stat-label">Account Type</span>
                  <div className="flex items-center gap-2">
                    <span className="stat-value">
                      {userData?.is_pro ? "Pro" : "Free"}
                    </span>
                    {userData?.is_pro && (
                      <span className="rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black">
                        PRO
                      </span>
                    )}
                  </div>
                  {!userData?.is_pro && (
                    <Link href="/pricing" className="mt-2 text-xs font-medium text-brand-400 hover:text-brand-300 transition-colors inline-block">
                      Upgrade to Pro →
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* ── ROW 2 ── Streak Calendar + Notifications */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* 3. Streak Calendar Strip */}
              <StreakStrip streakDays={userData?.streak_days ?? 0} />

              {/* 4. Notifications Panel */}
              <NotificationsPanel />
            </div>

            {/* ── ROW 3 ── Badges */}
            <BadgesRow />

            {/* ── ROW 4 ── Action cards (kept from original) */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="glass-card-hover p-8 flex flex-col items-start">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/15 text-brand-400">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>
                <h3 className="mb-1 text-lg font-semibold text-white">
                  Daily Challenge
                </h3>
                <p className="mb-4 text-sm text-surface-300 flex-1">
                  Complete today&apos;s challenge to extend your streak and boost
                  your readiness score.
                </p>
                <Link href="/aptitude" className="btn-primary text-sm">Start Challenge</Link>
              </div>

              <div className="glass-card-hover p-8 flex flex-col items-start">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                </div>
                <h3 className="mb-1 text-lg font-semibold text-white">
                  Resume Review
                </h3>
                <p className="mb-4 text-sm text-surface-300 flex-1">
                  Upload your resume for AI-powered analysis and actionable
                  improvement suggestions.
                </p>
                <Link href="/resume/scorer" className="btn-ghost text-sm">Upload Resume</Link>
              </div>

              <div className="glass-card-hover p-8 flex flex-col items-start">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                  </svg>
                </div>
                <h3 className="mb-1 text-lg font-semibold text-white">
                  Mock Interview
                </h3>
                <p className="mb-4 text-sm text-surface-300 flex-1">
                  Practice with AI-generated interview questions tailored to
                  your target role.
                </p>
                <Link href="/interview" className="btn-ghost text-sm">Start Practice</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
