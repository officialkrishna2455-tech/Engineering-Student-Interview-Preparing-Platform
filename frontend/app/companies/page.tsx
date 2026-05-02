"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
type Difficulty = "Easy" | "Medium" | "Hard";

interface Company {
  id: string;
  name: string;
  logo: string;
  difficulty: Difficulty;
  category: string;
  topics: string[];
  past_questions: string[];
  rounds: string[];
}

interface ChecklistState {
  [companyId: string]: boolean[];
}

/* ------------------------------------------------------------------ */
/* Static Company Data                                                 */
/* ------------------------------------------------------------------ */
const CHECKLIST_ITEMS = [
  "Studied DSA?",
  "Practised SQL?",
  "Done 2 mock interviews?",
  "Resume updated?",
];

const companies: Company[] = [
  {
    id: "tcs",
    name: "TCS",
    logo: "🏢",
    difficulty: "Easy",
    category: "Service MNC",
    topics: [
      "Aptitude & Reasoning",
      "Basic DSA",
      "DBMS",
      "OS Fundamentals",
      "Networking Basics",
      "OOPs Concepts",
    ],
    past_questions: [
      "What is the difference between process and thread?",
      "Explain normalization in DBMS with examples.",
      "Write a program to reverse a linked list.",
      "What are ACID properties in a database?",
    ],
    rounds: ["Online Test (Aptitude + Coding)", "Technical Interview", "Managerial Interview", "HR Interview"],
  },
  {
    id: "infosys",
    name: "Infosys",
    logo: "🌐",
    difficulty: "Easy",
    category: "Service MNC",
    topics: [
      "Aptitude & Logical Reasoning",
      "Basic Programming",
      "DBMS",
      "Computer Networks",
      "OOPs",
      "Puzzles",
    ],
    past_questions: [
      "Explain the OOP principles with real-world examples.",
      "What is the difference between TCP and UDP?",
      "Write a function to check if a string is a palindrome.",
      "Describe the different types of joins in SQL.",
    ],
    rounds: ["Online Assessment (3 sections)", "Technical Interview", "HR Interview"],
  },
  {
    id: "wipro",
    name: "Wipro",
    logo: "🔷",
    difficulty: "Easy",
    category: "Service MNC",
    topics: [
      "Verbal Ability",
      "Quantitative Aptitude",
      "Logical Reasoning",
      "Basic Coding",
      "Essay Writing",
      "Computer Fundamentals",
    ],
    past_questions: [
      "What is polymorphism? Give an example.",
      "Explain the Software Development Life Cycle (SDLC).",
      "Write code to find duplicate elements in an array.",
      "What is cloud computing and its service models?",
    ],
    rounds: ["National Level Test", "Written Communication Test", "Technical Interview", "HR Interview"],
  },
  {
    id: "amazon",
    name: "Amazon",
    logo: "📦",
    difficulty: "Hard",
    category: "FAANG",
    topics: [
      "Arrays & Strings",
      "Trees & Graphs",
      "Dynamic Programming",
      "System Design",
      "Leadership Principles",
      "Behavioral (STAR Method)",
      "Heap & Priority Queue",
    ],
    past_questions: [
      "Design a URL shortener like bit.ly.",
      "Find the longest substring without repeating characters.",
      "Tell me about a time you disagreed with your manager.",
      "Implement an LRU Cache.",
    ],
    rounds: ["Online Assessment (2 Coding + Work Simulation)", "Phone Screen", "Onsite (4-5 rounds: Coding + System Design + Bar Raiser)"],
  },
  {
    id: "google",
    name: "Google",
    logo: "🔍",
    difficulty: "Hard",
    category: "FAANG",
    topics: [
      "Advanced DSA",
      "Graph Algorithms",
      "Dynamic Programming",
      "System Design (L4+)",
      "Concurrency & Multithreading",
      "Googleyness & Leadership",
      "Math & Probability",
    ],
    past_questions: [
      "Design Google Search autocomplete.",
      "Given a stream of integers, find the median at any point.",
      "How would you design YouTube's recommendation system?",
      "Find all paths in a graph between two nodes.",
    ],
    rounds: ["Online Assessment", "Phone Screen (45 min coding)", "Onsite (5 rounds: Coding + System Design + Behavioral)"],
  },
  {
    id: "microsoft",
    name: "Microsoft",
    logo: "🪟",
    difficulty: "Hard",
    category: "FAANG",
    topics: [
      "Data Structures",
      "Algorithms",
      "System Design",
      "Object-Oriented Design",
      "OS & Memory Management",
      "Problem Solving",
      "Behavioral Questions",
    ],
    past_questions: [
      "Design a parking lot system.",
      "Implement a trie and autocomplete feature.",
      "What happens when you type a URL in the browser?",
      "Find the lowest common ancestor of two nodes in a BST.",
    ],
    rounds: ["Online Coding Round", "Group Fly (on-paper coding)", "Technical Interviews (3 rounds)", "AA Round (Hiring Manager)"],
  },
  {
    id: "flipkart",
    name: "Flipkart",
    logo: "🛒",
    difficulty: "Medium",
    category: "Product",
    topics: [
      "DSA (Medium-Hard)",
      "System Design",
      "Machine Coding",
      "LLD (Low-Level Design)",
      "Problem Solving",
      "Scalability Concepts",
    ],
    past_questions: [
      "Design a cart & checkout system for e-commerce.",
      "Implement a rate limiter.",
      "Design a notification service for order tracking.",
      "Solve: merge K sorted linked lists.",
    ],
    rounds: ["Online Coding Test", "Machine Coding Round (90 min)", "Problem Solving (2 rounds)", "System Design + Hiring Manager"],
  },
  {
    id: "zoho",
    name: "Zoho",
    logo: "📊",
    difficulty: "Medium",
    category: "Product",
    topics: [
      "C Programming",
      "Data Structures",
      "Algorithms",
      "Pattern Programs",
      "Matrix Operations",
      "Logical Thinking",
    ],
    past_questions: [
      "Print a spiral matrix of size N×N.",
      "Implement a basic calculator with operator precedence.",
      "Find the shortest path in a weighted graph.",
      "Write a program to simulate a snake and ladder game.",
    ],
    rounds: [
      "Written Round (C Programs & Patterns)",
      "Advanced Coding Round",
      "Technical Interview (2 rounds)",
      "HR Interview",
    ],
  },
  {
    id: "accenture",
    name: "Accenture",
    logo: "⚡",
    difficulty: "Easy",
    category: "Service MNC",
    topics: [
      "Cognitive Ability",
      "English Proficiency",
      "Technical Aptitude",
      "Basic Coding",
      "MS Office Skills",
      "Communication Skills",
    ],
    past_questions: [
      "Explain the difference between stack and queue.",
      "What is Agile methodology?",
      "Write a SQL query to find the second highest salary.",
      "What are microservices and their advantages?",
    ],
    rounds: ["Cognitive & Technical Assessment", "Coding Assessment", "Communication Assessment", "Interview"],
  },
  {
    id: "hcl",
    name: "HCL",
    logo: "💎",
    difficulty: "Easy",
    category: "Service MNC",
    topics: [
      "Quantitative Aptitude",
      "Verbal Ability",
      "Logical Reasoning",
      "Technical MCQs",
      "Basic Programming",
      "Soft Skills",
    ],
    past_questions: [
      "What is the difference between abstraction and encapsulation?",
      "Explain the OSI model layers.",
      "Write a program to check if a number is Armstrong.",
      "What is virtual memory?",
    ],
    rounds: ["Online Test (Aptitude + Technical MCQ + Coding)", "Technical Interview", "HR Interview"],
  },
];

/* ------------------------------------------------------------------ */
/* Difficulty Badge                                                    */
/* ------------------------------------------------------------------ */
const difficultyStyles: Record<Difficulty, { bg: string; text: string; border: string; dot: string }> = {
  Easy: {
    bg: "bg-green-500/20",
    text: "text-green-400",
    border: "border-green-500/30",
    dot: "bg-green-400",
  },
  Medium: {
    bg: "bg-amber-500/20",
    text: "text-amber-400",
    border: "border-amber-500/30",
    dot: "bg-amber-400",
  },
  Hard: {
    bg: "bg-rose-500/20",
    text: "text-rose-400",
    border: "border-rose-500/30",
    dot: "bg-rose-400",
  },
};

function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const s = difficultyStyles[difficulty];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${s.bg} ${s.text} ${s.border}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {difficulty}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Category Badge                                                      */
/* ------------------------------------------------------------------ */
const categoryStyles: Record<string, string> = {
  "Service MNC": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  FAANG: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Product: "bg-pink-500/10 text-pink-400 border-pink-500/20",
};

/* ------------------------------------------------------------------ */
/* Progress Ring (small, for cards)                                     */
/* ------------------------------------------------------------------ */
function MiniProgress({ checked, total }: { checked: number; total: number }) {
  const pct = total === 0 ? 0 : (checked / total) * 100;
  const radius = 16;
  const stroke = 3;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  const color =
    pct === 100 ? "#34d399" : pct >= 50 ? "#fbbf24" : pct > 0 ? "#818cf8" : "rgba(255,255,255,0.15)";

  return (
    <div className="relative flex items-center justify-center">
      <svg width="40" height="40" viewBox="0 0 40 40">
        <circle
          cx="20"
          cy="20"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={stroke}
        />
        <circle
          cx="20"
          cy="20"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 20 20)"
          className="transition-all duration-500"
        />
      </svg>
      <span className="absolute text-[9px] font-bold text-surface-200">
        {checked}/{total}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Company Card                                                        */
/* ------------------------------------------------------------------ */
function CompanyCard({
  company,
  checkedCount,
  totalChecklist,
  onClick,
}: {
  company: Company;
  checkedCount: number;
  totalChecklist: number;
  onClick: () => void;
}) {
  const catStyle = categoryStyles[company.category] || categoryStyles["Service MNC"];

  return (
    <button
      onClick={onClick}
      id={`company-card-${company.id}`}
      className="glass-card-hover group relative flex flex-col p-6 text-left w-full"
    >
      {/* Hover glow effect */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-500/0 to-purple-500/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-hover:from-brand-500/5 group-hover:to-purple-500/5" />

      <div className="relative z-10 flex flex-col h-full">
        {/* Top row: logo + progress */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/8 text-2xl shadow-lg group-hover:scale-105 transition-transform duration-300">
            {company.logo}
          </div>
          <MiniProgress checked={checkedCount} total={totalChecklist} />
        </div>

        {/* Name */}
        <h3 className="text-lg font-bold text-white mb-1.5 group-hover:text-brand-300 transition-colors duration-300">
          {company.name}
        </h3>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <DifficultyBadge difficulty={company.difficulty} />
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${catStyle}`}
          >
            {company.category}
          </span>
        </div>

        {/* Topics preview */}
        <div className="flex flex-wrap gap-1.5 mb-4 flex-1">
          {company.topics.slice(0, 3).map((t) => (
            <span
              key={t}
              className="rounded-md bg-white/5 border border-white/6 px-2 py-0.5 text-[10px] font-medium text-surface-300"
            >
              {t}
            </span>
          ))}
          {company.topics.length > 3 && (
            <span className="rounded-md bg-white/5 border border-white/6 px-2 py-0.5 text-[10px] font-medium text-surface-300">
              +{company.topics.length - 3} more
            </span>
          )}
        </div>

        {/* Rounds count */}
        <div className="flex items-center gap-2 text-xs text-surface-300">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
          </svg>
          <span>{company.rounds.length} interview rounds</span>
        </div>
      </div>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Company Detail View                                                 */
/* ------------------------------------------------------------------ */
function CompanyDetail({
  company,
  checklist,
  onToggle,
  onBack,
}: {
  company: Company;
  checklist: boolean[];
  onToggle: (index: number) => void;
  onBack: () => void;
}) {
  const checkedCount = checklist.filter(Boolean).length;
  const totalItems = CHECKLIST_ITEMS.length;
  const progressPct = (checkedCount / totalItems) * 100;

  const progressColor =
    progressPct === 100
      ? "from-emerald-500 to-emerald-400"
      : progressPct >= 50
      ? "from-amber-500 to-amber-400"
      : "from-brand-600 to-brand-500";

  const progressBg =
    progressPct === 100
      ? "bg-emerald-500/20"
      : progressPct >= 50
      ? "bg-amber-500/20"
      : "bg-brand-500/20";

  return (
    <div className="animate-fade-in mx-auto max-w-4xl">
      {/* Back button */}
      <button
        onClick={onBack}
        className="group mb-6 inline-flex items-center gap-2 rounded-xl border border-white/8 bg-white/5 px-4 py-2.5 text-sm font-medium text-surface-300 transition-all duration-300 hover:border-white/15 hover:bg-white/8 hover:text-white"
      >
        <svg
          className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
        All Companies
      </button>

      {/* Header card */}
      <div className="glass-card p-8 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          {/* Logo */}
          <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-white/5 border border-white/8 text-4xl shadow-xl">
            {company.logo}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                {company.name}
              </h1>
              <DifficultyBadge difficulty={company.difficulty} />
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
                  categoryStyles[company.category] || categoryStyles["Service MNC"]
                }`}
              >
                {company.category}
              </span>
            </div>
            <p className="text-sm text-surface-300">
              {company.rounds.length} interview rounds · {company.topics.length} topics to prepare
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-surface-300 uppercase tracking-wider">
              Preparation Progress
            </span>
            <span className="text-sm font-bold text-white">
              {checkedCount}/{totalItems} completed
            </span>
          </div>
          <div className="relative h-3 w-full rounded-full bg-white/5 overflow-hidden">
            <div
              className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${progressColor} transition-all duration-700 ease-out`}
              style={{ width: `${progressPct}%` }}
            />
            {/* Glow effect */}
            {progressPct > 0 && (
              <div
                className={`absolute inset-y-0 left-0 rounded-full ${progressBg} blur-sm transition-all duration-700`}
                style={{ width: `${progressPct}%` }}
              />
            )}
          </div>
          {progressPct === 100 && (
            <p className="mt-2 text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              All checklist items completed! You&apos;re ready! 🎉
            </p>
          )}
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left column */}
        <div className="space-y-6">
          {/* Topics */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/15">
                <svg className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider">
                Topics to Cover
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {company.topics.map((topic) => (
                <span
                  key={topic}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-3.5 py-2 text-sm font-medium text-indigo-300 transition-all duration-300 hover:bg-indigo-500/20 hover:border-indigo-500/30 hover:-translate-y-0.5"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>

          {/* Interview Rounds */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/15">
                <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-purple-400 uppercase tracking-wider">
                Interview Rounds
              </h3>
            </div>
            <div className="space-y-2.5">
              {company.rounds.map((round, i) => (
                <div
                  key={i}
                  className="group flex items-center gap-3.5 rounded-xl border border-white/6 bg-white/3 px-4 py-3 transition-all duration-300 hover:bg-white/6 hover:border-white/10"
                >
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-purple-500 text-xs font-bold text-white shadow-md">
                    {i + 1}
                  </div>
                  <span className="text-sm text-surface-200 group-hover:text-white transition-colors">
                    {round}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Past Questions */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15">
                <svg className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider">
                Past Interview Questions
              </h3>
            </div>
            <div className="space-y-3">
              {company.past_questions.map((q, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-xl border border-white/6 bg-white/3 px-4 py-3.5 transition-all duration-300 hover:bg-white/6 hover:border-amber-500/15"
                >
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-[10px] font-bold text-amber-400 mt-0.5">
                    Q{i + 1}
                  </span>
                  <p className="text-sm text-surface-200 leading-relaxed">
                    {q}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Personal Checklist */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15">
                <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">
                Personal Checklist
              </h3>
            </div>
            <div className="space-y-2.5">
              {CHECKLIST_ITEMS.map((item, i) => (
                <button
                  key={i}
                  onClick={() => onToggle(i)}
                  className={`group flex w-full items-center gap-3.5 rounded-xl border px-4 py-3.5 text-left transition-all duration-300 ${
                    checklist[i]
                      ? "border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/15"
                      : "border-white/6 bg-white/3 hover:bg-white/6 hover:border-white/10"
                  }`}
                >
                  {/* Custom checkbox */}
                  <div
                    className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 transition-all duration-300 ${
                      checklist[i]
                        ? "border-emerald-400 bg-emerald-500 shadow-md shadow-emerald-500/30"
                        : "border-surface-300/50 group-hover:border-surface-200"
                    }`}
                  >
                    {checklist[i] && (
                      <svg
                        className="h-3 w-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m4.5 12.75 6 6 9-13.5"
                        />
                      </svg>
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium transition-all duration-300 ${
                      checklist[i]
                        ? "text-emerald-300 line-through decoration-emerald-400/50"
                        : "text-surface-200 group-hover:text-white"
                    }`}
                  >
                    {item}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <Link
          href="/interview"
          className="btn-primary flex-1 py-4 text-base justify-center"
        >
          🎙️ Practice Mock Interview
        </Link>
        <button
          onClick={onBack}
          className="btn-ghost flex-1 py-4 text-base justify-center"
        >
          ← Back to Companies
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Search & Filter Bar                                                 */
/* ------------------------------------------------------------------ */
function SearchBar({
  query,
  onQueryChange,
  difficultyFilter,
  onDifficultyChange,
}: {
  query: string;
  onQueryChange: (q: string) => void;
  difficultyFilter: Difficulty | "All";
  onDifficultyChange: (d: Difficulty | "All") => void;
}) {
  const filters: (Difficulty | "All")[] = ["All", "Easy", "Medium", "Hard"];

  return (
    <div className="glass-card p-4 mb-8">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        {/* Search input */}
        <div className="relative flex-1">
          <svg
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
          <input
            id="company-search"
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search companies..."
            className="w-full rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] pl-11 pr-4 py-3 text-sm text-white placeholder-white/40 outline-none transition-all duration-300 focus:border-indigo-500 focus:bg-[rgba(255,255,255,0.08)] focus:ring-1 focus:ring-indigo-500/30"
          />
          {query && (
            <button
              onClick={() => onQueryChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-surface-300 transition-colors hover:text-white"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Difficulty filter pills */}
        <div className="flex items-center gap-2">
          {filters.map((f) => {
            const isActive = difficultyFilter === f;
            let activeStyle = "border-brand-500/50 bg-brand-500/15 text-brand-300";
            if (f === "Easy") activeStyle = "border-emerald-500/50 bg-emerald-500/15 text-emerald-300";
            if (f === "Medium") activeStyle = "border-amber-500/50 bg-amber-500/15 text-amber-300";
            if (f === "Hard") activeStyle = "border-red-500/50 bg-red-500/15 text-red-300";

            return (
              <button
                key={f}
                onClick={() => onDifficultyChange(f)}
                className={`rounded-lg border px-3.5 py-2 text-xs font-semibold transition-all duration-300 ${
                  isActive
                    ? activeStyle
                    : "border-white/8 bg-white/3 text-surface-300 hover:border-white/15 hover:text-white"
                }`}
              >
                {f}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main Page                                                           */
/* ------------------------------------------------------------------ */
export default function CompaniesPage() {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | "All">("All");
  const [checklistState, setChecklistState] = useState<ChecklistState>({});

  // Load checklist state from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("company-checklist");
      if (stored) {
        setChecklistState(JSON.parse(stored));
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Save checklist state to localStorage
  const saveChecklist = useCallback((state: ChecklistState) => {
    setChecklistState(state);
    try {
      localStorage.setItem("company-checklist", JSON.stringify(state));
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Toggle checklist item
  const handleToggle = useCallback(
    (companyId: string, index: number) => {
      const current = checklistState[companyId] || new Array(CHECKLIST_ITEMS.length).fill(false);
      const updated = [...current];
      updated[index] = !updated[index];
      saveChecklist({ ...checklistState, [companyId]: updated });
    },
    [checklistState, saveChecklist]
  );

  // Get checked count for a company
  const getCheckedCount = (companyId: string) => {
    const items = checklistState[companyId];
    if (!items) return 0;
    return items.filter(Boolean).length;
  };

  // Filter companies
  const filtered = companies.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.topics.some((t) =>
        t.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesDifficulty =
      difficultyFilter === "All" || c.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  // If a company is selected, show detail view
  if (selectedCompany) {
    const companyChecklist =
      checklistState[selectedCompany.id] ||
      new Array(CHECKLIST_ITEMS.length).fill(false);

    return (
      <div className="relative min-h-screen pt-24 px-4 pb-16">
        {/* Background accents */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 right-0 h-[500px] w-[500px] rounded-full bg-brand-600/8 blur-3xl" />
          <div className="absolute bottom-0 -left-20 h-[400px] w-[400px] rounded-full bg-purple-600/8 blur-3xl" />
          <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] rounded-full bg-emerald-600/5 blur-3xl" />
        </div>

        <div className="relative z-10">
          <CompanyDetail
            company={selectedCompany}
            checklist={companyChecklist}
            onToggle={(index) => handleToggle(selectedCompany.id, index)}
            onBack={() => setSelectedCompany(null)}
          />
        </div>
      </div>
    );
  }

  // Main listing view
  return (
    <div className="relative min-h-screen pt-24 px-4 pb-16">
      {/* Background accents */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 right-0 h-[500px] w-[500px] rounded-full bg-brand-600/8 blur-3xl" />
        <div className="absolute bottom-0 -left-20 h-[400px] w-[400px] rounded-full bg-purple-600/8 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] rounded-full bg-amber-600/5 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl animate-fade-in">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500/20 to-amber-500/20 border border-brand-500/20">
            <span className="text-3xl">🏢</span>
          </div>
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            Company <span className="text-gradient">Tracker</span>
          </h1>
          <p className="mt-2 text-surface-300">
            Prepare strategically for your dream companies
          </p>
        </div>

        {/* Search & Filters */}
        <SearchBar
          query={searchQuery}
          onQueryChange={setSearchQuery}
          difficultyFilter={difficultyFilter}
          onDifficultyChange={setDifficultyFilter}
        />

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="glass-card px-4 py-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/15 text-brand-400">
              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-bold text-white">{companies.length}</p>
              <p className="text-[10px] font-medium text-surface-300 uppercase tracking-wider">Companies</p>
            </div>
          </div>
          <div className="glass-card px-4 py-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-bold text-white">
                {companies.filter((c) => getCheckedCount(c.id) === CHECKLIST_ITEMS.length).length}
              </p>
              <p className="text-[10px] font-medium text-surface-300 uppercase tracking-wider">Completed</p>
            </div>
          </div>
          <div className="glass-card px-4 py-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">
              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-bold text-white">
                {companies.filter((c) => {
                  const cnt = getCheckedCount(c.id);
                  return cnt > 0 && cnt < CHECKLIST_ITEMS.length;
                }).length}
              </p>
              <p className="text-[10px] font-medium text-surface-300 uppercase tracking-wider">In Progress</p>
            </div>
          </div>
          <div className="glass-card px-4 py-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/15 text-red-400">
              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-bold text-white">
                {companies.filter((c) => getCheckedCount(c.id) === 0).length}
              </p>
              <p className="text-[10px] font-medium text-surface-300 uppercase tracking-wider">Not Started</p>
            </div>
          </div>
        </div>

        {/* Company cards grid */}
        {filtered.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
                checkedCount={getCheckedCount(company.id)}
                totalChecklist={CHECKLIST_ITEMS.length}
                onClick={() => setSelectedCompany(company)}
              />
            ))}
          </div>
        ) : (
          <div className="glass-card p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
              <svg
                className="h-8 w-8 text-surface-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">
              No companies found
            </h3>
            <p className="text-sm text-surface-300">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}

        {/* Back to dashboard */}
        <div className="mt-10 text-center">
          <Link
            href="/dashboard"
            className="btn-ghost px-6 py-3"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
