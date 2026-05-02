"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
interface ScoreResult {
  ats_score: number;
  keyword_gaps: string[];
  section_feedback: {
    education?: string;
    projects?: string;
    skills?: string;
    experience?: string;
    [key: string]: string | undefined;
  };
  overall_feedback: string;
}

interface JDMatchResult {
  match_score: number;
  missing_keywords: string[];
  suggestions: string[];
}

type TabKey = "ats" | "jd" | "cover";

/* ------------------------------------------------------------------ */
/* Components                                                          */
/* ------------------------------------------------------------------ */

// Donut Ring Component – reused by ATS Score & JD Matcher
function ScoreRing({ score, label }: { score: number; label?: string }) {
  const radius = 60;
  const stroke = 8;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.min(Math.max(score, 0), 100);

  const getColor = (s: number) => {
    if (s >= 70) return { stroke: "#34d399", text: "text-emerald-400" };
    if (s >= 40) return { stroke: "#fbbf24", text: "text-amber-400" };
    return { stroke: "#f87171", text: "text-red-400" };
  };

  const color = getColor(clampedScore);
  const offset = circumference - (clampedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center relative">
      <svg width="150" height="150" viewBox="0 0 150 150">
        <circle
          cx="75" cy="75" r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={stroke}
        />
        <circle
          cx="75" cy="75" r={radius}
          fill="none"
          stroke={color.stroke}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 75 75)"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-4xl font-extrabold ${color.text}`}>
          {clampedScore}
        </span>
        <span className="text-[10px] text-surface-300 uppercase tracking-widest mt-1">
          {label || "ATS Score"}
        </span>
      </div>
    </div>
  );
}

// Expandable Card for Section Feedback
function ExpandableCard({ title, content }: { title: string, content: string }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!content) return null;

  return (
    <div className="border border-[rgba(255,255,255,0.08)] rounded-xl overflow-hidden bg-[rgba(255,255,255,0.03)] transition-all">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.08)] transition-colors"
      >
        <span className="font-semibold text-white capitalize">{title}</span>
        <span className="text-white/40 transform transition-transform duration-300" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          ▼
        </span>
      </button>
      {isOpen && (
        <div className="p-4 text-white/70 text-sm leading-relaxed border-t border-[rgba(255,255,255,0.08)] bg-[#030303]">
          {content}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tab Button                                                          */
/* ------------------------------------------------------------------ */
function TabButton({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        relative px-5 py-3 text-sm font-semibold rounded-xl transition-all duration-300
        ${active
          ? "bg-gradient-to-r from-brand-500/20 to-brand-600/20 text-brand-400 border border-brand-500/30 shadow-lg shadow-brand-500/10"
          : "text-white/40 hover:text-surface-200 hover:bg-white/5 border border-transparent"
        }
      `}
    >
      <span className="flex items-center gap-2">
        <span className="text-base">{icon}</span>
        {label}
      </span>
      {active && (
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-brand-500 rounded-full" />
      )}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Main Page                                                           */
/* ------------------------------------------------------------------ */
export default function ResumeScorerPage() {
  // ---- shared state ----
  const [activeTab, setActiveTab] = useState<TabKey>("ats");
  const [file, setFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState<string>("");

  // ---- ATS tab ----
  const [atsLoading, setAtsLoading] = useState(false);
  const [atsError, setAtsError] = useState<string | null>(null);
  const [atsResult, setAtsResult] = useState<ScoreResult | null>(null);

  // ---- JD Matcher tab ----
  const [jdText, setJdText] = useState("");
  const [jdLoading, setJdLoading] = useState(false);
  const [jdError, setJdError] = useState<string | null>(null);
  const [jdResult, setJdResult] = useState<JDMatchResult | null>(null);

  // ---- Cover Letter tab ----
  const [clJdText, setClJdText] = useState("");
  const [clLoading, setClLoading] = useState(false);
  const [clError, setClError] = useState<string | null>(null);
  const [coverLetter, setCoverLetter] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  /* ---------------------------------------------------------------- */
  /* File change – extract text client-side for JD / CL tabs          */
  /* ---------------------------------------------------------------- */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setAtsError(null);
      // We'll extract resume text on the backend during ATS scoring
      // and store it for the JD / CL tabs
    }
  };

  /* ---------------------------------------------------------------- */
  /* ATS Score upload                                                   */
  /* ---------------------------------------------------------------- */
  const handleAtsUpload = async () => {
    if (!file) {
      setAtsError("Please select a PDF file first.");
      return;
    }

    setAtsLoading(true);
    setAtsError(null);
    setAtsResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${apiUrl}/api/resume/score`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to score resume");
      }

      const data = await res.json();
      setAtsResult(data);

      // Also extract text client-side so JD / CL tabs can use it
      await extractResumeText(file);
    } catch (err: any) {
      setAtsError(err.message || "An unexpected error occurred.");
    } finally {
      setAtsLoading(false);
    }
  };

  /* ---------------------------------------------------------------- */
  /* Extract text from PDF (uses FileReader + simple approach)         */
  /* ---------------------------------------------------------------- */
  const extractResumeText = async (pdfFile: File) => {
    try {
      // Send to a dedicated text-extraction or reuse the file
      // We'll read as text for a simple fallback, but ideally we
      // just re-send the file to the backend. For now, store the
      // file name and rely on the backend having parsed it.
      // A simpler approach: read the PDF as ArrayBuffer and extract basic text
      const arrayBuffer = await pdfFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      // Simple PDF text extraction – look for text between stream markers
      let text = "";
      const decoder = new TextDecoder("utf-8", { fatal: false });
      const rawText = decoder.decode(uint8Array);
      
      // Extract text objects from PDF (basic approach)
      // This handles most simple PDFs
      const textMatches = rawText.match(/\(([^)]+)\)/g);
      if (textMatches) {
        text = textMatches.map(m => m.slice(1, -1)).join(" ");
      }
      
      // If basic extraction fails, use the raw decoded text as fallback
      if (!text.trim()) {
        // Filter out binary content, keep only printable ASCII + common chars
        text = rawText.replace(/[^\x20-\x7E\n\r\t]/g, " ").replace(/\s+/g, " ").trim();
      }

      if (text.length > 50) {
        setResumeText(text.substring(0, 15000)); // Cap at 15k chars
      }
    } catch {
      // Silent fail – user can still paste manually or re-upload
      console.log("Client-side PDF extraction failed, will use server-side extraction.");
    }
  };

  /* ---------------------------------------------------------------- */
  /* Helper: extract text via backend                                  */
  /* ---------------------------------------------------------------- */
  const getResumeTextForAPI = async (): Promise<string> => {
    // If we already have extracted text, return it
    if (resumeText.trim()) return resumeText;

    // Otherwise try to extract from file
    if (file) {
      // Send file to score endpoint and capture text
      // As a simpler approach, we re-extract client-side
      await extractResumeText(file);
      if (resumeText.trim()) return resumeText;
    }

    return "";
  };

  /* ---------------------------------------------------------------- */
  /* JD Matcher                                                        */
  /* ---------------------------------------------------------------- */
  const handleJDMatch = async () => {
    const text = resumeText || (await getResumeTextForAPI());

    if (!text.trim()) {
      setJdError("Please upload and analyze a resume in the ATS Score tab first.");
      return;
    }
    if (!jdText.trim()) {
      setJdError("Please paste a job description.");
      return;
    }

    setJdLoading(true);
    setJdError(null);
    setJdResult(null);

    try {
      const res = await fetch(`${apiUrl}/api/resume/jd-match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume_text: text,
          job_description: jdText,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to match resume.");
      }

      setJdResult(await res.json());
    } catch (err: any) {
      setJdError(err.message || "An unexpected error occurred.");
    } finally {
      setJdLoading(false);
    }
  };

  /* ---------------------------------------------------------------- */
  /* Cover Letter                                                      */
  /* ---------------------------------------------------------------- */
  const handleCoverLetter = async () => {
    if (!clJdText.trim()) {
      setClError("Please paste a job description.");
      return;
    }

    setClLoading(true);
    setClError(null);
    setCoverLetter("");

    try {
      const res = await fetch(`${apiUrl}/api/resume/cover-letter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_description: clJdText,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to generate cover letter.");
      }

      const data = await res.json();
      setCoverLetter(data.cover_letter);
    } catch (err: any) {
      setClError(err.message || "An unexpected error occurred.");
    } finally {
      setClLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ================================================================ */
  /* RENDER                                                            */
  /* ================================================================ */
  return (
    <div className="min-h-screen pt-24 px-4 pb-16">
      <div className="max-w-5xl mx-auto">
        <Link href="/dashboard" className="text-brand-400 hover:text-brand-300 text-sm font-medium mb-6 inline-flex items-center gap-1">
          ← Back to Dashboard
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">AI Resume Tools</h1>
          <p className="text-surface-300">Score, match, and generate — all powered by AI.</p>
        </div>

        {/* ───────── Tab Bar ───────── */}
        <div className="flex gap-2 mb-8 p-1.5 bg-[rgba(255,255,255,0.05)] backdrop-blur-sm rounded-2xl border border-[rgba(255,255,255,0.08)] w-fit">
          <TabButton icon="📊" label="ATS Score"     active={activeTab === "ats"}   onClick={() => setActiveTab("ats")} />
          <TabButton icon="🎯" label="JD Matcher"    active={activeTab === "jd"}    onClick={() => setActiveTab("jd")} />
          <TabButton icon="✉️" label="Cover Letter"  active={activeTab === "cover"} onClick={() => setActiveTab("cover")} />
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* TAB 1 — ATS Score                                          */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {activeTab === "ats" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Left Column: Upload Section */}
            <div className="lg:col-span-1 glass-card p-6 h-fit space-y-6">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-surface-200">
                  Upload Resume (PDF)
                </label>
                <div className="w-full relative border-2 border-dashed border-[rgba(255,255,255,0.1)] hover:border-indigo-500/50 rounded-xl p-8 flex flex-col items-center justify-center bg-[rgba(255,255,255,0.05)] transition-colors cursor-pointer group">
                  <input 
                    type="file" 
                    accept=".pdf" 
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">📄</span>
                  <span className="text-sm font-medium text-surface-300 text-center">
                    {file ? file.name : "Click or drag PDF here"}
                  </span>
                </div>
              </div>

              <button 
                onClick={handleAtsUpload} 
                disabled={!file || atsLoading}
                className={`w-full btn-primary ${(!file || atsLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {atsLoading ? "Analyzing..." : "Analyze Resume"}
              </button>

              {atsError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {atsError}
                </div>
              )}

              {/* Resume status indicator */}
              {resumeText && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                  <span>✓</span>
                  <span>Resume text extracted — JD Matcher & Cover Letter tabs are ready.</span>
                </div>
              )}
            </div>

            {/* Right Column: Results Section */}
            <div className="lg:col-span-2 space-y-6">
              {!atsResult && !atsLoading && (
                <div className="glass-card p-12 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
                  <div className="w-16 h-16 rounded-full bg-brand-500/10 flex items-center justify-center mb-4">
                    <span className="text-brand-400 text-2xl">✨</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Awaiting Resume</h3>
                  <p className="text-white/40 text-sm max-w-sm">
                    Upload your PDF resume on the left to receive comprehensive ATS analysis, keyword missing analysis, and section-by-section feedback.
                  </p>
                </div>
              )}

              {atsLoading && (
                <div className="glass-card p-12 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
                  <div className="w-12 h-12 border-4 border-surface-700 border-t-brand-500 rounded-full animate-spin mb-6"></div>
                  <h3 className="text-lg font-bold text-white animate-pulse">Running AI Analysis...</h3>
                  <p className="text-white/40 text-sm mt-2">Checking keywords, parsing sections, and grading readability.</p>
                </div>
              )}

              {atsResult && !atsLoading && (
                <div className="animate-fade-in space-y-6">
                  {/* Score & Summary Card */}
                  <div className="glass-card p-6 flex flex-col sm:flex-row gap-6 items-center">
                    <ScoreRing score={atsResult.ats_score} />
                    <div className="flex-1 space-y-3">
                      <h3 className="text-lg font-bold text-white">Overall Verdict</h3>
                      <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] text-white/70 text-sm leading-relaxed">
                        {atsResult.overall_feedback}
                      </div>
                    </div>
                  </div>

                  {/* Keyword Gaps */}
                  {atsResult.keyword_gaps && atsResult.keyword_gaps.length > 0 && (
                    <div className="glass-card p-6">
                      <h3 className="text-lg font-bold text-white mb-4">Missing Keywords</h3>
                      <p className="text-sm text-white/40 mb-4">Adding these keywords contextually could improve your ATS ranking.</p>
                      <div className="flex flex-wrap gap-2">
                        {atsResult.keyword_gaps.map((kw, i) => (
                          <span key={i} className="px-3 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold tracking-wide">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Section Feedback */}
                  {atsResult.section_feedback && Object.keys(atsResult.section_feedback).length > 0 && (
                    <div className="glass-card p-6 space-y-4">
                      <h3 className="text-lg font-bold text-white">Section Feedback</h3>
                      <div className="space-y-3">
                        {Object.entries(atsResult.section_feedback).map(([section, feedback]) => (
                          <ExpandableCard key={section} title={section} content={feedback || ""} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* TAB 2 — JD Matcher                                         */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {activeTab === "jd" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Left: Input */}
            <div className="lg:col-span-1 glass-card p-6 h-fit space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-surface-200">Paste Job Description</label>
                <textarea
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  rows={12}
                  placeholder="Paste the full job description here…"
                  className="w-full rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white placeholder-white/40 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none"
                />
              </div>

              <button
                onClick={handleJDMatch}
                disabled={jdLoading || !resumeText}
                className={`w-full btn-primary ${(jdLoading || !resumeText) ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {jdLoading ? "Matching…" : "Match My Resume"}
              </button>

              {!resumeText && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">
                  ⚠ Upload &amp; analyze a resume in the <strong>ATS Score</strong> tab first.
                </div>
              )}

              {jdError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{jdError}</div>
              )}
            </div>

            {/* Right: Results */}
            <div className="lg:col-span-2 space-y-6">
              {!jdResult && !jdLoading && (
                <div className="glass-card p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
                  <div className="w-16 h-16 rounded-full bg-brand-500/10 flex items-center justify-center mb-4">
                    <span className="text-brand-400 text-2xl">🎯</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">JD Matcher</h3>
                  <p className="text-white/40 text-sm max-w-sm">
                    Paste a job description and click <strong>"Match My Resume"</strong> to see how well your resume aligns with the role.
                  </p>
                </div>
              )}

              {jdLoading && (
                <div className="glass-card p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
                  <div className="w-12 h-12 border-4 border-surface-700 border-t-brand-500 rounded-full animate-spin mb-6" />
                  <h3 className="text-lg font-bold text-white animate-pulse">Comparing resume with JD…</h3>
                  <p className="text-white/40 text-sm mt-2">Identifying keyword gaps and generating suggestions.</p>
                </div>
              )}

              {jdResult && !jdLoading && (
                <div className="animate-fade-in space-y-6">
                  {/* Match Score */}
                  <div className="glass-card p-6 flex flex-col sm:flex-row gap-6 items-center">
                    <ScoreRing score={jdResult.match_score} label="Match" />
                    <div className="flex-1 space-y-2">
                      <h3 className="text-lg font-bold text-white">Resume-JD Alignment</h3>
                      <p className="text-surface-300 text-sm leading-relaxed">
                        {jdResult.match_score >= 70
                          ? "Great match! Your resume aligns well with this job description."
                          : jdResult.match_score >= 40
                          ? "Moderate match. Consider adding the missing keywords and following the suggestions below."
                          : "Low match. Your resume needs significant updates to target this role."
                        }
                      </p>
                    </div>
                  </div>

                  {/* Missing Keywords */}
                  {jdResult.missing_keywords?.length > 0 && (
                    <div className="glass-card p-6">
                      <h3 className="text-lg font-bold text-white mb-3">Missing Keywords</h3>
                      <p className="text-sm text-white/40 mb-4">These terms appear in the JD but are missing from your resume.</p>
                      <div className="flex flex-wrap gap-2">
                        {jdResult.missing_keywords.map((kw, i) => (
                          <span key={i} className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggestions */}
                  {jdResult.suggestions?.length > 0 && (
                    <div className="glass-card p-6">
                      <h3 className="text-lg font-bold text-white mb-4">Suggestions</h3>
                      <ul className="space-y-3">
                        {jdResult.suggestions.map((s, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-surface-200">
                            <span className="mt-0.5 w-6 h-6 rounded-full bg-brand-500/15 flex items-center justify-center text-brand-400 text-xs font-bold shrink-0">
                              {i + 1}
                            </span>
                            <span className="leading-relaxed">{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* TAB 3 — Cover Letter                                       */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {activeTab === "cover" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Left: Input */}
            <div className="lg:col-span-1 glass-card p-6 h-fit space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-surface-200">Paste Job Description</label>
                <textarea
                  value={clJdText}
                  onChange={(e) => setClJdText(e.target.value)}
                  rows={12}
                  placeholder="Paste the full job description here…"
                  className="w-full rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white placeholder-white/40 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none"
                />
              </div>

              <button
                onClick={handleCoverLetter}
                disabled={clLoading}
                className={`w-full btn-primary ${clLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {clLoading ? "Generating…" : "Generate Cover Letter"}
              </button>

              {clError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{clError}</div>
              )}
            </div>

            {/* Right: Output */}
            <div className="lg:col-span-2 space-y-6">
              {!coverLetter && !clLoading && (
                <div className="glass-card p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
                  <div className="w-16 h-16 rounded-full bg-brand-500/10 flex items-center justify-center mb-4">
                    <span className="text-brand-400 text-2xl">✉️</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Cover Letter Generator</h3>
                  <p className="text-white/40 text-sm max-w-sm">
                    Paste a job description and click <strong>"Generate Cover Letter"</strong> to create a tailored, professional cover letter.
                  </p>
                </div>
              )}

              {clLoading && (
                <div className="glass-card p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
                  <div className="w-12 h-12 border-4 border-surface-700 border-t-brand-500 rounded-full animate-spin mb-6" />
                  <h3 className="text-lg font-bold text-white animate-pulse">Writing your cover letter…</h3>
                  <p className="text-white/40 text-sm mt-2">Crafting a personalized, professional letter based on your resume.</p>
                </div>
              )}

              {coverLetter && !clLoading && (
                <div className="animate-fade-in space-y-4">
                  <div className="glass-card p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-white">Your Cover Letter</h3>
                      <button
                        onClick={handleCopy}
                        className={`
                          px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300
                          ${copied
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-brand-500/15 text-brand-400 border border-brand-500/30 hover:bg-brand-500/25"
                          }
                        `}
                      >
                        {copied ? "✓ Copied!" : "📋 Copy to Clipboard"}
                      </button>
                    </div>
                    <textarea
                      readOnly
                      value={coverLetter}
                      rows={20}
                      className="w-full rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] text-white/90 px-5 py-4 text-sm leading-relaxed focus:outline-none resize-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
