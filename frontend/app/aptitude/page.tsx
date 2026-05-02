"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState, useEffect, useRef, useCallback } from "react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
type Screen = "topics" | "quiz" | "result";
type TopicId = "quantitative" | "logical" | "verbal" | "data";

interface Question {
  id: string;
  text: string;
  options: string[];
  answer: string;
}

interface TopicMeta {
  id: TopicId;
  name: string;
  icon: string;
  gradient: string;
  border: string;
  text: string;
  bg: string;
  iconBg: string;
}

interface TopicStats {
  totalAttempted: number;
  totalCorrect: number;
}

interface AllStats {
  [topicId: string]: TopicStats;
}

interface UserAnswer {
  questionIndex: number;
  selected: string | null;
  correct: string;
  isCorrect: boolean;
}

/* ------------------------------------------------------------------ */
/* Topic Metadata                                                      */
/* ------------------------------------------------------------------ */
const topics: TopicMeta[] = [
  {
    id: "quantitative",
    name: "Quantitative",
    icon: "🔢",
    gradient: "from-brand-600 to-brand-500",
    border: "border-brand-500/30",
    text: "text-brand-300",
    bg: "bg-brand-500/10",
    iconBg: "bg-brand-500/15",
  },
  {
    id: "logical",
    name: "Logical Reasoning",
    icon: "🧩",
    gradient: "from-purple-600 to-purple-500",
    border: "border-purple-500/30",
    text: "text-purple-300",
    bg: "bg-purple-500/10",
    iconBg: "bg-purple-500/15",
  },
  {
    id: "verbal",
    name: "Verbal Ability",
    icon: "📝",
    gradient: "from-emerald-600 to-emerald-500",
    border: "border-emerald-500/30",
    text: "text-emerald-300",
    bg: "bg-emerald-500/10",
    iconBg: "bg-emerald-500/15",
  },
  {
    id: "data",
    name: "Data Interpretation",
    icon: "📊",
    gradient: "from-amber-600 to-amber-500",
    border: "border-amber-500/30",
    text: "text-amber-300",
    bg: "bg-amber-500/10",
    iconBg: "bg-amber-500/15",
  },
];

/* ------------------------------------------------------------------ */
/* Question Bank                                                       */
/* ------------------------------------------------------------------ */
const questionBank: Record<TopicId, Question[]> = {
  quantitative: [
    {
      id: "q1",
      text: "A train travels 60 km in 1 hour. How long will it take to travel 150 km?",
      options: ["2 h", "2.5 h", "3 h", "1.5 h"],
      answer: "2.5 h",
    },
    {
      id: "q2",
      text: "What is 15% of 200?",
      options: ["25", "30", "35", "40"],
      answer: "30",
    },
    {
      id: "q3",
      text: "If 8 workers finish a job in 6 days, how many days will 12 workers take?",
      options: ["3", "4", "5", "6"],
      answer: "4",
    },
    {
      id: "q4",
      text: "What is the simple interest on ₹5000 at 10% per annum for 2 years?",
      options: ["₹500", "₹750", "₹1000", "₹1250"],
      answer: "₹1000",
    },
    {
      id: "q5",
      text: "Speed of a boat upstream is 10 km/h and downstream is 14 km/h. What is the speed of the current?",
      options: ["2 km/h", "3 km/h", "4 km/h", "5 km/h"],
      answer: "2 km/h",
    },
    {
      id: "q6",
      text: "A shopkeeper offers a 20% discount on an item marked at ₹500. What is the selling price?",
      options: ["₹350", "₹400", "₹425", "₹450"],
      answer: "₹400",
    },
    {
      id: "q7",
      text: "If the ratio of A to B is 3:5 and B to C is 2:3, what is A:C?",
      options: ["2:5", "3:7", "6:15", "1:3"],
      answer: "2:5",
    },
    {
      id: "q8",
      text: "A pipe can fill a tank in 12 hours. Another pipe can empty it in 18 hours. How long to fill the tank with both open?",
      options: ["30 h", "36 h", "24 h", "42 h"],
      answer: "36 h",
    },
    {
      id: "q9",
      text: "The average of 5 numbers is 20. If one number is removed, the average becomes 18. What is the removed number?",
      options: ["24", "26", "28", "30"],
      answer: "28",
    },
    {
      id: "q10",
      text: "A car covers 300 km at 60 km/h and another 200 km at 40 km/h. What is the average speed for the entire journey?",
      options: ["48 km/h", "50 km/h", "52 km/h", "55 km/h"],
      answer: "50 km/h",
    },
  ],
  logical: [
    {
      id: "l1",
      text: "Find the odd one out: 3, 5, 7, 9, 11",
      options: ["3", "5", "9", "11"],
      answer: "9",
    },
    {
      id: "l2",
      text: "If MANGO = 56, then APPLE = ?",
      options: ["50", "55", "60", "65"],
      answer: "50",
    },
    {
      id: "l3",
      text: "What comes next in the series: 2, 4, 8, 16, ?",
      options: ["24", "30", "32", "36"],
      answer: "32",
    },
    {
      id: "l4",
      text: "All cats are dogs. Some dogs are birds. Conclusion: Some cats are birds — is this valid?",
      options: ["True", "False", "Maybe", "Cannot determine"],
      answer: "Cannot determine",
    },
    {
      id: "l5",
      text: "Which letter looks the same in its mirror image?",
      options: ["A", "B", "C", "D"],
      answer: "A",
    },
    {
      id: "l6",
      text: "If 'P' means '+', 'Q' means '−', 'R' means '×', then what is 5 R 3 P 4 Q 2?",
      options: ["15", "17", "19", "21"],
      answer: "17",
    },
    {
      id: "l7",
      text: "In a row of children, Ravi is 7th from the left and 12th from the right. How many children are there?",
      options: ["17", "18", "19", "20"],
      answer: "18",
    },
    {
      id: "l8",
      text: "Find the missing number: 1, 1, 2, 3, 5, 8, ?",
      options: ["11", "12", "13", "14"],
      answer: "13",
    },
    {
      id: "l9",
      text: "If 'ROAD' is coded as 'TQCF', then 'WORK' is coded as?",
      options: ["YQTM", "XPSM", "YRUM", "ZQTM"],
      answer: "YQTM",
    },
    {
      id: "l10",
      text: "A clock shows 3:15. What is the angle between the hour and minute hands?",
      options: ["0°", "7.5°", "15°", "22.5°"],
      answer: "7.5°",
    },
  ],
  verbal: [
    {
      id: "v1",
      text: "Choose the synonym of 'Benevolent':",
      options: ["Cruel", "Kind", "Selfish", "Rude"],
      answer: "Kind",
    },
    {
      id: "v2",
      text: "Choose the antonym of 'Ephemeral':",
      options: ["Fleeting", "Permanent", "Brief", "Temporary"],
      answer: "Permanent",
    },
    {
      id: "v3",
      text: "Fill in the blank: The committee ____ divided in their opinions.",
      options: ["was", "were", "is", "has"],
      answer: "were",
    },
    {
      id: "v4",
      text: "Identify the correct sentence:",
      options: [
        "He don't know nothing.",
        "He doesn't know anything.",
        "He don't know anything.",
        "He doesn't knows anything.",
      ],
      answer: "He doesn't know anything.",
    },
    {
      id: "v5",
      text: "What is the meaning of the idiom 'Break the ice'?",
      options: [
        "To destroy something",
        "To initiate a conversation",
        "To freeze water",
        "To break a promise",
      ],
      answer: "To initiate a conversation",
    },
    {
      id: "v6",
      text: "Choose the correctly spelt word:",
      options: ["Accomodate", "Accommodate", "Acomodate", "Acommodate"],
      answer: "Accommodate",
    },
    {
      id: "v7",
      text: "The phrase 'A Herculean task' means:",
      options: [
        "An easy job",
        "A very difficult task",
        "A Greek festival",
        "A small favour",
      ],
      answer: "A very difficult task",
    },
    {
      id: "v8",
      text: "Choose the word most similar to 'Ubiquitous':",
      options: ["Rare", "Omnipresent", "Absent", "Scarce"],
      answer: "Omnipresent",
    },
    {
      id: "v9",
      text: "'to turn over a new leaf' means:",
      options: [
        "To read a book",
        "To start fresh",
        "To change pages",
        "To plant a tree",
      ],
      answer: "To start fresh",
    },
    {
      id: "v10",
      text: "Select the active voice of: 'The cake was eaten by her.'",
      options: [
        "She eats the cake.",
        "She ate the cake.",
        "She has eaten the cake.",
        "She had eaten the cake.",
      ],
      answer: "She ate the cake.",
    },
  ],
  data: [
    {
      id: "d1",
      text: "In a bar chart, sales in Q1=200, Q2=350, Q3=300, Q4=450. What is the total annual sales?",
      options: ["1200", "1300", "1400", "1100"],
      answer: "1300",
    },
    {
      id: "d2",
      text: "If a pie chart shows 25% for Category A out of total 800, how many items are in Category A?",
      options: ["150", "200", "250", "300"],
      answer: "200",
    },
    {
      id: "d3",
      text: "Revenue in 2022 was ₹50L and in 2023 was ₹65L. What is the percentage growth?",
      options: ["20%", "25%", "30%", "35%"],
      answer: "30%",
    },
    {
      id: "d4",
      text: "In a table: Math=85, Science=90, English=75, Hindi=80. What is the average score?",
      options: ["80", "82", "82.5", "85"],
      answer: "82.5",
    },
    {
      id: "d5",
      text: "If production in 5 years is: 100, 120, 110, 140, 130, what is the average production?",
      options: ["110", "115", "120", "125"],
      answer: "120",
    },
    {
      id: "d6",
      text: "A company's expenses are: Rent 30%, Salaries 45%, Marketing 15%, Others 10%. If total is ₹20L, what is the salary expense?",
      options: ["₹7L", "₹8L", "₹9L", "₹10L"],
      answer: "₹9L",
    },
    {
      id: "d7",
      text: "Population of a city: 2019=5L, 2020=5.5L, 2021=6L, 2022=7L. Which year saw the highest growth?",
      options: ["2019-20", "2020-21", "2021-22", "Same for all"],
      answer: "2021-22",
    },
    {
      id: "d8",
      text: "If exports = ₹400Cr and imports = ₹500Cr, what is the trade deficit?",
      options: ["₹50Cr", "₹100Cr", "₹150Cr", "₹200Cr"],
      answer: "₹100Cr",
    },
    {
      id: "d9",
      text: "In a line graph, temperature on Mon=30°, Tue=28°, Wed=35°, Thu=32°, Fri=29°. What is the range?",
      options: ["5°", "6°", "7°", "8°"],
      answer: "7°",
    },
    {
      id: "d10",
      text: "Profit of 3 branches: A=₹12L, B=₹18L, C=₹15L. What percentage of total profit does Branch B contribute?",
      options: ["35%", "38%", "40%", "42%"],
      answer: "40%",
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
const QUESTIONS_PER_SESSION = 10;
const TIMER_SECONDS = 15 * 60; // 15 minutes
const LS_KEY = "aptitude-stats";

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickQuestions(topicId: TopicId): Question[] {
  const pool = questionBank[topicId];
  const shuffled = shuffleArray(pool);
  // If pool has ≥10, take first 10; otherwise repeat-fill
  const result: Question[] = [];
  while (result.length < QUESTIONS_PER_SESSION) {
    for (const q of shuffled) {
      if (result.length >= QUESTIONS_PER_SESSION) break;
      result.push({ ...q, id: `${q.id}_${result.length}` });
    }
  }
  return result;
}

function loadStats(): AllStats {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStats(stats: AllStats) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(stats));
  } catch {
    // Ignore
  }
}

function getAccuracy(stats: AllStats, topicId: string): number {
  const s = stats[topicId];
  if (!s || s.totalAttempted === 0) return 0;
  return Math.round((s.totalCorrect / s.totalAttempted) * 100);
}

function getAttempted(stats: AllStats, topicId: string): number {
  return stats[topicId]?.totalAttempted ?? 0;
}

/* ------------------------------------------------------------------ */
/* Accuracy Ring                                                       */
/* ------------------------------------------------------------------ */
function AccuracyRing({
  pct,
  size = 56,
  strokeWidth = 4,
  colorClass,
}: {
  pct: number;
  size?: number;
  strokeWidth?: number;
  colorClass: string;
}) {
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  const cx = size / 2;

  const strokeColor =
    colorClass === "text-brand-300"
      ? "#5c7cfa"
      : colorClass === "text-purple-300"
      ? "#a78bfa"
      : colorClass === "text-emerald-300"
      ? "#34d399"
      : "#fbbf24";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${cx} ${cx})`}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-xs font-bold ${colorClass}`}>
          {pct}%
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Topic Card                                                          */
/* ------------------------------------------------------------------ */
function TopicCard({
  topic,
  stats,
  onStart,
}: {
  topic: TopicMeta;
  stats: AllStats;
  onStart: (id: TopicId) => void;
}) {
  const accuracy = getAccuracy(stats, topic.id);
  const attempted = getAttempted(stats, topic.id);
  const questionCount = questionBank[topic.id].length;

  return (
    <div
      className={`glass-card-hover group relative flex flex-col p-6`}
      id={`topic-card-${topic.id}`}
    >
      {/* Hover glow */}
      <div
        className={`pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-hover:${topic.bg}`}
      />

      <div className="relative z-10 flex flex-col h-full">
        {/* Top: icon + accuracy ring */}
        <div className="flex items-start justify-between mb-5">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-2xl ${topic.iconBg} text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}
          >
            {topic.icon}
          </div>
          <AccuracyRing pct={accuracy} colorClass={topic.text} />
        </div>

        {/* Name */}
        <h3
          className={`text-lg font-bold text-white mb-1.5 group-hover:${topic.text} transition-colors duration-300`}
        >
          {topic.name}
        </h3>

        {/* Stats row */}
        <div className="flex items-center gap-4 mb-5 text-xs text-surface-300">
          <span className="flex items-center gap-1.5">
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
              />
            </svg>
            {questionCount} questions
          </span>
          <span className="flex items-center gap-1.5">
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            {attempted} attempted
          </span>
        </div>

        {/* Start button */}
        <button
          onClick={() => onStart(topic.id)}
          className={`mt-auto w-full rounded-xl border ${topic.border} ${topic.bg} py-3 text-sm font-semibold ${topic.text} transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5`}
        >
          Start Practice →
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Topics Screen                                                       */
/* ------------------------------------------------------------------ */
function TopicsScreen({
  stats,
  onStart,
}: {
  stats: AllStats;
  onStart: (topicId: TopicId) => void;
}) {
  const totalAttempted = Object.values(stats).reduce(
    (sum, s) => sum + s.totalAttempted,
    0
  );
  const totalCorrect = Object.values(stats).reduce(
    (sum, s) => sum + s.totalCorrect,
    0
  );
  const overallAccuracy =
    totalAttempted === 0
      ? 0
      : Math.round((totalCorrect / totalAttempted) * 100);

  return (
    <div className="animate-fade-in mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-brand-500/20 border border-emerald-500/20">
          <span className="text-3xl">🧠</span>
        </div>
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          Aptitude <span className="text-gradient">Practice</span>
        </h1>
        <p className="mt-2 text-surface-300">
          Sharpen your skills across key aptitude areas
        </p>
      </div>

      {/* Overall stats strip */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="glass-card px-4 py-3.5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/15">
            <svg
              className="h-4 w-4 text-brand-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          </div>
          <div>
            <p className="text-lg font-bold text-white">{totalAttempted}</p>
            <p className="text-[10px] font-medium text-surface-300 uppercase tracking-wider">
              Total Attempted
            </p>
          </div>
        </div>
        <div className="glass-card px-4 py-3.5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15">
            <svg
              className="h-4 w-4 text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m4.5 12.75 6 6 9-13.5"
              />
            </svg>
          </div>
          <div>
            <p className="text-lg font-bold text-white">{totalCorrect}</p>
            <p className="text-[10px] font-medium text-surface-300 uppercase tracking-wider">
              Correct
            </p>
          </div>
        </div>
        <div className="glass-card px-4 py-3.5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/15">
            <svg
              className="h-4 w-4 text-amber-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
              />
            </svg>
          </div>
          <div>
            <p className="text-lg font-bold text-white">{overallAccuracy}%</p>
            <p className="text-[10px] font-medium text-surface-300 uppercase tracking-wider">
              Overall Accuracy
            </p>
          </div>
        </div>
      </div>

      {/* Topic cards */}
      <div className="grid gap-5 sm:grid-cols-2">
        {topics.map((t) => (
          <TopicCard key={t.id} topic={t} stats={stats} onStart={onStart} />
        ))}
      </div>

      {/* Back to dashboard */}
      <div className="mt-10 text-center">
        <Link href="/dashboard" className="btn-ghost px-6 py-3">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Quiz Screen                                                         */
/* ------------------------------------------------------------------ */
function QuizScreen({
  topicId,
  topicMeta,
  onFinish,
}: {
  topicId: TopicId;
  topicMeta: TopicMeta;
  onFinish: (answers: UserAnswer[], timeTaken: number, questions: Question[]) => void;
}) {
  const [questions] = useState<Question[]>(() => pickQuestions(topicId));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const startTimeRef = useRef(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentQ = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;

  // Timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Auto-submit on time-up
  const handleFinish = useCallback(
    (finalAnswers: UserAnswer[]) => {
      if (timerRef.current) clearInterval(timerRef.current);
      const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);
      onFinish(finalAnswers, timeTaken, questions);
    },
    [onFinish, questions]
  );

  useEffect(() => {
    if (timeLeft <= 0) {
      // Auto-fill remaining unanswered
      const remaining: UserAnswer[] = [];
      for (let i = answers.length; i < questions.length; i++) {
        remaining.push({
          questionIndex: i,
          selected: null,
          correct: questions[i].answer,
          isCorrect: false,
        });
      }
      handleFinish([...answers, ...remaining]);
    }
  }, [timeLeft, answers, questions, handleFinish]);

  // Format timer
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec
      .toString()
      .padStart(2, "0")}`;
  };

  const timerColor =
    timeLeft > TIMER_SECONDS * 0.5
      ? "text-emerald-400"
      : timeLeft > TIMER_SECONDS * 0.2
      ? "text-amber-400"
      : "text-red-400";

  const timerBg =
    timeLeft > TIMER_SECONDS * 0.5
      ? "bg-emerald-500/10 border-emerald-500/20"
      : timeLeft > TIMER_SECONDS * 0.2
      ? "bg-amber-500/10 border-amber-500/20"
      : "bg-red-500/10 border-red-500/20";

  const handleNext = () => {
    const answer: UserAnswer = {
      questionIndex: currentIndex,
      selected,
      correct: currentQ.answer,
      isCorrect: selected === currentQ.answer,
    };
    const updatedAnswers = [...answers, answer];
    setAnswers(updatedAnswers);

    if (isLast) {
      handleFinish(updatedAnswers);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
    }
  };

  // Progress percentage
  const progressPct = ((currentIndex) / questions.length) * 100;

  return (
    <div className="animate-fade-in mx-auto max-w-3xl">
      {/* Quiz header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${topicMeta.iconBg} text-lg`}
          >
            {topicMeta.icon}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">
              {topicMeta.name}
            </h2>
            <p className="text-xs text-surface-300">
              Question {currentIndex + 1} of {questions.length}
            </p>
          </div>
        </div>

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
      </div>

      {/* Progress bar */}
      <div className="relative h-2 w-full rounded-full bg-white/5 mb-8 overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${topicMeta.gradient} transition-all duration-500 ease-out`}
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Question card */}
      <div className="glass-card p-8 mb-6" key={currentQ.id}>
        {/* Question number pill */}
        <div className="flex items-center gap-2.5 mb-5">
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${topicMeta.gradient} text-xs font-bold text-white shadow-lg`}
          >
            {currentIndex + 1}
          </span>
          <div className="flex items-center gap-2">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i < currentIndex
                    ? `w-6 bg-gradient-to-r ${topicMeta.gradient}`
                    : i === currentIndex
                    ? "w-8 bg-white/60"
                    : "w-4 bg-white/10"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Question text */}
        <h3 className="text-lg font-semibold text-white leading-relaxed mb-8">
          {currentQ.text}
        </h3>

        {/* Options */}
        <div className="grid gap-3">
          {currentQ.options.map((opt, i) => {
            const isSelected = selected === opt;
            const letters = ["A", "B", "C", "D"];
            return (
              <button
                key={`${currentQ.id}-opt-${i}`}
                onClick={() => setSelected(opt)}
                className={`group relative flex items-center gap-4 rounded-xl border px-5 py-4 text-left text-sm font-medium transition-all duration-300 ${
                  isSelected
                    ? `${topicMeta.border} ${topicMeta.bg} ${topicMeta.text} shadow-lg`
                    : "border-white/8 bg-white/3 text-surface-200 hover:border-white/15 hover:bg-white/6 hover:text-white"
                }`}
              >
                {/* Letter badge */}
                <span
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-all duration-300 ${
                    isSelected
                      ? `bg-gradient-to-br ${topicMeta.gradient} text-white shadow-md`
                      : "bg-white/5 border border-white/10 text-surface-300 group-hover:text-white"
                  }`}
                >
                  {letters[i]}
                </span>
                <span className="relative z-10">{opt}</span>
                {isSelected && (
                  <svg
                    className={`ml-auto h-5 w-5 flex-shrink-0 ${topicMeta.text}`}
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
                {isSelected && (
                  <div
                    className={`absolute inset-0 rounded-xl bg-gradient-to-br ${topicMeta.bg} opacity-50`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Next / Submit */}
      <button
        onClick={handleNext}
        disabled={!selected}
        className="btn-primary w-full py-4 text-base disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg"
      >
        {isLast ? "Submit Quiz ✓" : "Next Question →"}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Score Circle (result page)                                          */
/* ------------------------------------------------------------------ */
function ScoreCircle({
  score,
  total,
  accentColor,
}: {
  score: number;
  total: number;
  accentColor: string;
}) {
  const [animated, setAnimated] = useState(0);
  const pct = (score / total) * 100;
  const radius = 80;
  const stroke = 10;
  const c = 2 * Math.PI * radius;
  const offset = c - (animated / total) * c;

  useEffect(() => {
    const dur = 1400;
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setAnimated(Math.round(eased * score * 10) / 10);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [score]);

  const labelColor =
    pct >= 70
      ? "text-emerald-400"
      : pct >= 40
      ? "text-amber-400"
      : "text-red-400";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <svg width="200" height="200" viewBox="0 0 200 200">
          <defs>
            <filter id="score-glow-apt">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={stroke}
          />
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke={accentColor}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            transform="rotate(-90 100 100)"
            filter="url(#score-glow-apt)"
            className="transition-all duration-100"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-extrabold ${labelColor}`}>
            {Math.round(animated)}
          </span>
          <span className="text-xs text-white/70 mt-0.5">
            out of {total}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Result Screen                                                       */
/* ------------------------------------------------------------------ */
function ResultScreen({
  topicMeta,
  answers,
  questions,
  timeTaken,
  onTryAgain,
  onBack,
}: {
  topicMeta: TopicMeta;
  answers: UserAnswer[];
  questions: Question[];
  timeTaken: number;
  onTryAgain: () => void;
  onBack: () => void;
}) {
  const correctCount = answers.filter((a) => a.isCorrect).length;
  const total = answers.length;
  const accuracyPct = Math.round((correctCount / total) * 100);
  const mins = Math.floor(timeTaken / 60);
  const secs = timeTaken % 60;

  const accentColor =
    accuracyPct >= 70 ? "#34d399" : accuracyPct >= 40 ? "#fbbf24" : "#f87171";

  const badge =
    accuracyPct >= 80
      ? { label: "Excellent! 🎉", style: "text-emerald-400 bg-emerald-500/10" }
      : accuracyPct >= 60
      ? { label: "Good Job! 👏", style: "text-brand-300 bg-brand-500/10" }
      : accuracyPct >= 40
      ? { label: "Keep Practicing! 💪", style: "text-amber-400 bg-amber-500/10" }
      : { label: "Needs Work 📚", style: "text-red-400 bg-red-500/10" };

  return (
    <div className="animate-fade-in mx-auto max-w-3xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          Quiz <span className="text-gradient">Results</span>
        </h1>
        <p className="mt-2 text-surface-300">{topicMeta.name} Practice</p>
        <span
          className={`mt-3 inline-block rounded-full px-5 py-2 text-sm font-semibold ${badge.style}`}
        >
          {badge.label}
        </span>
      </div>

      {/* Score + Stats */}
      <div className="glass-card p-8 mb-6 flex flex-col items-center">
        <ScoreCircle
          score={correctCount}
          total={total}
          accentColor={accentColor}
        />

        {/* Mini stats */}
        <div className="grid grid-cols-3 gap-6 mt-8 w-full max-w-md">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{accuracyPct}%</p>
            <p className="text-[10px] text-surface-300 uppercase tracking-wider mt-1">
              Accuracy
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {correctCount}/{total}
            </p>
            <p className="text-[10px] text-surface-300 uppercase tracking-wider mt-1">
              Correct
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {mins}:{secs.toString().padStart(2, "0")}
            </p>
            <p className="text-[10px] text-surface-300 uppercase tracking-wider mt-1">
              Time Taken
            </p>
          </div>
        </div>
      </div>

      {/* Question Review */}
      <div className="glass-card p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
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
                d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 0 1 9 9v.375M10.125 2.25A3.375 3.375 0 0 1 13.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 0 1 3.375 3.375M9 15l2.25 2.25L15 12"
              />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-purple-400 uppercase tracking-wider">
            Answer Review
          </h3>
        </div>

        <div className="space-y-3">
          {answers.map((a, i) => {
            const q = questions[i];
            return (
              <div
                key={i}
                className={`rounded-xl border px-5 py-4 transition-all duration-300 ${
                  a.isCorrect
                    ? "border-emerald-500/20 bg-emerald-500/5"
                    : "border-red-500/20 bg-red-500/5"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Status icon */}
                  <div
                    className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${
                      a.isCorrect
                        ? "bg-emerald-500 shadow-md shadow-emerald-500/30"
                        : "bg-red-500 shadow-md shadow-red-500/30"
                    }`}
                  >
                    {a.isCorrect ? (
                      <svg
                        className="h-3.5 w-3.5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m4.5 12.75 6 6 9-13.5"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-3.5 w-3.5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18 18 6M6 6l12 12"
                        />
                      </svg>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/90 font-medium mb-2 leading-relaxed">
                      <span className="text-white/70 mr-1.5">
                        Q{i + 1}.
                      </span>
                      {q.text}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                      {a.selected ? (
                        <span
                          className={
                            a.isCorrect ? "text-emerald-400" : "text-red-400"
                          }
                        >
                          Your answer:{" "}
                          <span className="font-semibold">{a.selected}</span>
                        </span>
                      ) : (
                        <span className="text-red-400 italic">Not answered</span>
                      )}
                      {!a.isCorrect && (
                        <span className="text-emerald-400">
                          Correct:{" "}
                          <span className="font-semibold">{a.correct}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={onTryAgain}
          className="btn-primary flex-1 py-4 text-base justify-center"
        >
          🔄 Try Again
        </button>
        <button
          onClick={onBack}
          className="btn-ghost flex-1 py-4 text-base justify-center"
        >
          ← Back to Topics
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main Page                                                           */
/* ------------------------------------------------------------------ */
export default function AptitudePage() {
  const { data: session } = useSession();
  const [screen, setScreen] = useState<Screen>("topics");
  const [activeTopic, setActiveTopic] = useState<TopicId>("quantitative");
  const [stats, setStats] = useState<AllStats>({});
  const [quizAnswers, setQuizAnswers] = useState<UserAnswer[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [timeTaken, setTimeTaken] = useState(0);
  const [quizKey, setQuizKey] = useState(0); // force re-mount

  // Load stats on mount
  useEffect(() => {
    setStats(loadStats());
  }, []);

  const handleStart = (topicId: TopicId) => {
    setActiveTopic(topicId);
    setQuizKey((k) => k + 1);
    setScreen("quiz");
  };

  const handleFinish = (answers: UserAnswer[], elapsed: number, questions: Question[]) => {
    const correct = answers.filter((a) => a.isCorrect).length;
    setQuizAnswers(answers);
    setQuizQuestions(questions);
    setTimeTaken(elapsed);

    // Calculate accuracy percentage
    const accuracyPct = Math.round((correct / answers.length) * 100);

    // Send aptitude score to backend
    if (session?.user?.email) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      fetch(`${apiUrl}/api/user/activity`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session.user.email,
          action: "aptitude_score",
          value: accuracyPct,
        }),
      }).catch(() => {});
    }

    // Update stats
    const prev = loadStats();
    const existing = prev[activeTopic] || {
      totalAttempted: 0,
      totalCorrect: 0,
    };
    const updated: AllStats = {
      ...prev,
      [activeTopic]: {
        totalAttempted: existing.totalAttempted + answers.length,
        totalCorrect: existing.totalCorrect + correct,
      },
    };
    saveStats(updated);
    setStats(updated);
    setScreen("result");
  };

  const activeTopicMeta = topics.find((t) => t.id === activeTopic)!;

  return (
    <div className="relative min-h-screen pt-24 px-4 pb-16">
      {/* Background accents */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 right-0 h-[500px] w-[500px] rounded-full bg-emerald-600/8 blur-3xl" />
        <div className="absolute bottom-0 -left-20 h-[400px] w-[400px] rounded-full bg-brand-600/8 blur-3xl" />
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] rounded-full bg-purple-600/5 blur-3xl" />
      </div>

      <div className="relative z-10">
        {screen === "topics" && (
          <TopicsScreen stats={stats} onStart={handleStart} />
        )}
        {screen === "quiz" && (
          <QuizScreen
            key={quizKey}
            topicId={activeTopic}
            topicMeta={activeTopicMeta}
            onFinish={handleFinish}
          />
        )}
        {screen === "result" && (
          <ResultScreen
            topicMeta={activeTopicMeta}
            answers={quizAnswers}
            questions={quizQuestions}
            timeTaken={timeTaken}
            onTryAgain={() => handleStart(activeTopic)}
            onBack={() => setScreen("topics")}
          />
        )}
      </div>
    </div>
  );
}
