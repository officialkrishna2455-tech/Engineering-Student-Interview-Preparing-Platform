"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
type WorkMode = "WFH" | "Hybrid" | "Office";

interface Offer {
  id: string;
  company: string;
  role: string;
  ctc: number;
  location: string;
  bond: number;
  work_mode: WorkMode;
  growth_rating: number;
}

interface Analysis {
  best_for_money: string;
  best_for_growth: string;
  best_for_balance: string;
  summary: string;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
const LS_KEY = "offer-comparison-data";

function loadOffers(): Offer[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveOffers(offers: Offer[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(offers));
  } catch {
    /* ignore */
  }
}

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/* ------------------------------------------------------------------ */
/* Star Rating Input                                                   */
/* ------------------------------------------------------------------ */
function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform duration-200 hover:scale-125 focus:outline-none"
        >
          <svg
            className={`h-6 w-6 transition-colors duration-200 ${
              star <= (hover || value)
                ? "text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.4)]"
                : "text-white/15"
            }`}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Star Display (readonly)                                             */
/* ------------------------------------------------------------------ */
function StarDisplay({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`h-4 w-4 ${
            star <= value
              ? "text-amber-400"
              : "text-white/10"
          }`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Add / Edit Offer Modal                                              */
/* ------------------------------------------------------------------ */
function OfferForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Offer;
  onSave: (offer: Offer) => void;
  onCancel: () => void;
}) {
  const [company, setCompany] = useState(initial?.company ?? "");
  const [role, setRole] = useState(initial?.role ?? "");
  const [ctc, setCtc] = useState(initial?.ctc?.toString() ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [bond, setBond] = useState(initial?.bond?.toString() ?? "0");
  const [workMode, setWorkMode] = useState<WorkMode>(initial?.work_mode ?? "Office");
  const [growth, setGrowth] = useState(initial?.growth_rating ?? 3);

  const workModes: WorkMode[] = ["WFH", "Hybrid", "Office"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !role.trim() || !ctc.trim() || !location.trim()) return;

    onSave({
      id: initial?.id ?? uid(),
      company: company.trim(),
      role: role.trim(),
      ctc: parseFloat(ctc),
      location: location.trim(),
      bond: parseFloat(bond) || 0,
      work_mode: workMode,
      growth_rating: growth,
    });
  };

  const inputClass =
    "w-full rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition-all duration-300 focus:border-indigo-500 focus:bg-[rgba(255,255,255,0.08)] focus:ring-1 focus:ring-indigo-500/30";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="glass-card relative z-10 w-full max-w-lg p-8 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
            {initial ? "Edit Offer" : "Add New Offer"}
          </h2>
          <button
            onClick={onCancel}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-surface-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Company & Role */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="stat-label mb-1.5 block">Company Name</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Google"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="stat-label mb-1.5 block">Role</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. SDE-1"
                className={inputClass}
                required
              />
            </div>
          </div>

          {/* CTC & Location */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="stat-label mb-1.5 block">CTC (LPA)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={ctc}
                onChange={(e) => setCtc(e.target.value)}
                placeholder="e.g. 12.5"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="stat-label mb-1.5 block">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Bangalore"
                className={inputClass}
                required
              />
            </div>
          </div>

          {/* Bond & Work Mode */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="stat-label mb-1.5 block">Bond (years)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="5"
                value={bond}
                onChange={(e) => setBond(e.target.value)}
                placeholder="0"
                className={inputClass}
              />
            </div>
            <div>
              <label className="stat-label mb-1.5 block">Work Mode</label>
              <div className="flex gap-2">
                {workModes.map((wm) => (
                  <button
                    key={wm}
                    type="button"
                    onClick={() => setWorkMode(wm)}
                    className={`flex-1 rounded-lg border px-3 py-2.5 text-xs font-semibold transition-all duration-300 ${
                      workMode === wm
                        ? "border-brand-500/50 bg-brand-500/15 text-brand-300"
                        : "border-white/8 bg-white/3 text-surface-300 hover:border-white/15 hover:text-white"
                    }`}
                  >
                    {wm}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Growth Rating */}
          <div>
            <label className="stat-label mb-2 block">Growth Rating</label>
            <StarRating value={growth} onChange={setGrowth} />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1 py-3">
              {initial ? "Update Offer" : "Add Offer"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="btn-ghost flex-1 py-3"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Work Mode Badge                                                     */
/* ------------------------------------------------------------------ */
function WorkModeBadge({ mode }: { mode: WorkMode }) {
  const styles: Record<WorkMode, { bg: string; text: string; border: string; icon: string }> = {
    WFH: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      border: "border-emerald-500/20",
      icon: "🏠",
    },
    Hybrid: {
      bg: "bg-amber-500/10",
      text: "text-amber-400",
      border: "border-amber-500/20",
      icon: "🔄",
    },
    Office: {
      bg: "bg-blue-500/10",
      text: "text-blue-400",
      border: "border-blue-500/20",
      icon: "🏢",
    },
  };
  const s = styles[mode];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${s.bg} ${s.text} ${s.border}`}
    >
      <span className="text-[10px]">{s.icon}</span>
      {mode}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Comparison Table                                                    */
/* ------------------------------------------------------------------ */
function ComparisonTable({
  offers,
  onDelete,
  onEdit,
}: {
  offers: Offer[];
  onDelete: (id: string) => void;
  onEdit: (offer: Offer) => void;
}) {
  if (offers.length === 0) return null;

  const ctcValues = offers.map((o) => o.ctc);
  const maxCtc = Math.max(...ctcValues);
  const minCtc = Math.min(...ctcValues);
  const hasMultiple = offers.length > 1;

  const rows: {
    label: string;
    icon: string;
    render: (o: Offer) => React.ReactNode;
  }[] = [
    {
      label: "Company",
      icon: "🏢",
      render: (o) => (
        <span className="text-sm font-bold text-white">{o.company}</span>
      ),
    },
    {
      label: "Role",
      icon: "💼",
      render: (o) => (
        <span className="text-sm text-surface-200">{o.role}</span>
      ),
    },
    {
      label: "CTC",
      icon: "💰",
      render: (o) => {
        const isBest = hasMultiple && o.ctc === maxCtc;
        const isWorst = hasMultiple && o.ctc === minCtc && maxCtc !== minCtc;
        return (
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-bold ${
                isBest
                  ? "text-emerald-400"
                  : isWorst
                  ? "text-red-400"
                  : "text-white"
              }`}
            >
              ₹{o.ctc} LPA
            </span>
            {isBest && (
              <span className="rounded-full bg-emerald-500/15 border border-emerald-500/25 px-2 py-0.5 text-[9px] font-bold text-emerald-400 uppercase tracking-wider">
                Best
              </span>
            )}
            {isWorst && (
              <span className="rounded-full bg-red-500/15 border border-red-500/25 px-2 py-0.5 text-[9px] font-bold text-red-400 uppercase tracking-wider">
                Lowest
              </span>
            )}
          </div>
        );
      },
    },
    {
      label: "Location",
      icon: "📍",
      render: (o) => (
        <span className="text-sm text-surface-200">{o.location}</span>
      ),
    },
    {
      label: "Bond",
      icon: "⚠️",
      render: (o) => {
        const hasBond = o.bond > 1;
        return (
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-semibold ${
                hasBond ? "text-red-400" : "text-emerald-400"
              }`}
            >
              {o.bond === 0 ? "None" : `${o.bond} yr${o.bond > 1 ? "s" : ""}`}
            </span>
            {hasBond && (
              <span className="rounded-full bg-red-500/15 border border-red-500/25 px-2 py-0.5 text-[9px] font-bold text-red-400 uppercase tracking-wider flex items-center gap-1">
                <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
                Warning
              </span>
            )}
          </div>
        );
      },
    },
    {
      label: "Work Mode",
      icon: "🔧",
      render: (o) => <WorkModeBadge mode={o.work_mode} />,
    },
    {
      label: "Growth",
      icon: "📈",
      render: (o) => <StarDisplay value={o.growth_rating} />,
    },
  ];

  return (
    <div className="glass-card overflow-hidden mb-8">
      {/* Table header */}
      <div className="border-b border-white/6 bg-white/3 px-6 py-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <svg className="h-4 w-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
          </svg>
          Comparison Table
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/6">
              <th className="px-6 py-3 text-left text-[10px] font-semibold text-surface-300 uppercase tracking-wider w-32">
                Attribute
              </th>
              {offers.map((o) => (
                <th
                  key={o.id}
                  className="px-4 py-3 text-left text-[10px] font-semibold text-surface-300 uppercase tracking-wider min-w-[160px]"
                >
                  <div className="flex items-center justify-between">
                    <span>{o.company}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEdit(o)}
                        className="rounded p-1 text-surface-300 transition-colors hover:bg-white/10 hover:text-white"
                        title="Edit"
                      >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onDelete(o.id)}
                        className="rounded p-1 text-surface-300 transition-colors hover:bg-red-500/10 hover:text-red-400"
                        title="Delete"
                      >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr
                key={row.label}
                className={`border-b border-white/4 transition-colors hover:bg-white/3 ${
                  ri % 2 === 0 ? "bg-white/[0.01]" : ""
                }`}
              >
                <td className="px-6 py-3.5 text-xs font-medium text-surface-300">
                  <span className="flex items-center gap-2">
                    <span className="text-sm">{row.icon}</span>
                    {row.label}
                  </span>
                </td>
                {offers.map((o) => (
                  <td key={o.id} className="px-4 py-3.5">
                    {row.render(o)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* AI Analysis Cards                                                   */
/* ------------------------------------------------------------------ */
function AnalysisCards({ analysis }: { analysis: Analysis }) {
  const cards = [
    {
      label: "Best for Money",
      icon: "💰",
      value: analysis.best_for_money,
      gradient: "from-emerald-600 to-emerald-500",
      border: "border-emerald-500/30",
      bg: "bg-emerald-500/10",
      text: "text-emerald-300",
      iconBg: "bg-emerald-500/20",
    },
    {
      label: "Best for Growth",
      icon: "📈",
      value: analysis.best_for_growth,
      gradient: "from-brand-600 to-brand-500",
      border: "border-brand-500/30",
      bg: "bg-brand-500/10",
      text: "text-brand-300",
      iconBg: "bg-brand-500/20",
    },
    {
      label: "Best for Balance",
      icon: "⚖️",
      value: analysis.best_for_balance,
      gradient: "from-purple-600 to-purple-500",
      border: "border-purple-500/30",
      bg: "bg-purple-500/10",
      text: "text-purple-300",
      iconBg: "bg-purple-500/20",
    },
  ];

  return (
    <div className="space-y-6 mb-8 animate-fade-in">
      {/* Section header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500/20 to-purple-500/20 border border-brand-500/20">
          <span className="text-lg">✨</span>
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">AI Analysis</h3>
          <p className="text-xs text-surface-300">Powered by AI career advisor</p>
        </div>
      </div>

      {/* Cards */}
      <div className="grid gap-5 sm:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`glass-card group relative overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}
          >
            {/* Glow stripe top */}
            <div
              className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient}`}
            />

            <div className="flex items-center gap-2.5 mb-4">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.iconBg}`}
              >
                <span className="text-lg">{card.icon}</span>
              </div>
              <span
                className={`text-xs font-semibold uppercase tracking-wider ${card.text}`}
              >
                {card.label}
              </span>
            </div>
            <p className="text-sm text-surface-200 leading-relaxed">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15">
            <svg className="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
            </svg>
          </div>
          <h4 className="text-sm font-semibold text-amber-400 uppercase tracking-wider">
            Overall Recommendation
          </h4>
        </div>
        <p className="text-sm text-surface-200 leading-relaxed">
          {analysis.summary}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Empty State                                                         */
/* ------------------------------------------------------------------ */
function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="glass-card p-12 text-center mb-8">
      <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500/15 to-purple-500/15 border border-brand-500/15">
        <span className="text-4xl">⚖️</span>
      </div>
      <h3 className="text-xl font-bold text-white mb-2">
        No Offers Yet
      </h3>
      <p className="text-sm text-surface-300 max-w-md mx-auto mb-6">
        Add your job offers to compare them side-by-side and get AI-powered
        analysis on which one is the best fit for you.
      </p>
      <button onClick={onAdd} className="btn-primary px-8 py-3.5 text-base">
        ➕ Add Your First Offer
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main Page                                                           */
/* ------------------------------------------------------------------ */
export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | undefined>();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [analysing, setAnalysing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Load on mount
  useEffect(() => {
    setOffers(loadOffers());
  }, []);

  // Save handler
  const handleSave = (offer: Offer) => {
    let updated: Offer[];
    const existing = offers.find((o) => o.id === offer.id);
    if (existing) {
      updated = offers.map((o) => (o.id === offer.id ? offer : o));
    } else {
      updated = [...offers, offer];
    }
    setOffers(updated);
    saveOffers(updated);
    setShowForm(false);
    setEditingOffer(undefined);
    setAnalysis(null); // Clear stale analysis
  };

  const handleDelete = (id: string) => {
    const updated = offers.filter((o) => o.id !== id);
    setOffers(updated);
    saveOffers(updated);
    setAnalysis(null);
  };

  const handleEdit = (offer: Offer) => {
    setEditingOffer(offer);
    setShowForm(true);
  };

  const handleAnalyse = async () => {
    if (offers.length < 2) return;

    setAnalysing(true);
    setAnalysisError(null);

    try {
      const res = await fetch(`${apiUrl}/api/offers/analyse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offers: offers.map((o) => ({
            company: o.company,
            role: o.role,
            ctc: o.ctc,
            location: o.location,
            bond: o.bond,
            work_mode: o.work_mode,
            growth_rating: o.growth_rating,
          })),
        }),
      });

      if (!res.ok) throw new Error("API error");

      const data = await res.json();
      setAnalysis(data);
    } catch {
      setAnalysisError("Failed to analyse offers. Make sure the backend is running.");
    } finally {
      setAnalysing(false);
    }
  };

  return (
    <div className="relative min-h-screen pt-24 px-4 pb-16">
      {/* Background accents */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 right-0 h-[500px] w-[500px] rounded-full bg-brand-600/8 blur-3xl" />
        <div className="absolute bottom-0 -left-20 h-[400px] w-[400px] rounded-full bg-purple-600/8 blur-3xl" />
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] rounded-full bg-emerald-600/5 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl animate-fade-in">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500/20 to-emerald-500/20 border border-brand-500/20">
            <span className="text-3xl">⚖️</span>
          </div>
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            Offer <span className="text-gradient">Comparison</span>
          </h1>
          <p className="mt-2 text-surface-300">
            Compare your job offers and let AI help you decide
          </p>
        </div>

        {/* Action bar */}
        {offers.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="glass-card px-4 py-2.5 flex items-center gap-2">
                <svg className="h-4 w-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
                <span className="text-sm font-semibold text-white">
                  {offers.length} offer{offers.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setEditingOffer(undefined);
                  setShowForm(true);
                }}
                className="btn-ghost px-4 py-2.5 text-sm"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add Offer
              </button>

              <button
                onClick={handleAnalyse}
                disabled={offers.length < 2 || analysing}
                className="btn-primary px-5 py-2.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {analysing ? (
                  <>
                    <div className="flex gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-1.5 w-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-1.5 w-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    Analysing...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                    </svg>
                    Analyse with AI
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {offers.length === 0 && (
          <EmptyState
            onAdd={() => {
              setEditingOffer(undefined);
              setShowForm(true);
            }}
          />
        )}

        {/* Analysis error */}
        {analysisError && (
          <div className="glass-card mb-6 border-l-4 border-l-red-500 p-4 flex items-center gap-3 animate-fade-in">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-red-500/15">
              <svg className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
            </div>
            <p className="text-sm text-red-300">{analysisError}</p>
            <button
              onClick={() => setAnalysisError(null)}
              className="ml-auto text-surface-300 hover:text-white transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Comparison table */}
        <ComparisonTable
          offers={offers}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />

        {/* Minimum 2 offers notice */}
        {offers.length === 1 && (
          <div className="glass-card p-5 mb-8 flex items-center gap-3 border-l-4 border-l-amber-500">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-amber-500/15">
              <svg className="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
              </svg>
            </div>
            <p className="text-sm text-amber-300">
              Add at least <span className="font-semibold">2 offers</span> to unlock AI-powered comparison analysis.
            </p>
          </div>
        )}

        {/* AI Analysis */}
        {analysis && <AnalysisCards analysis={analysis} />}

        {/* Back to dashboard */}
        <div className="text-center mt-8">
          <Link href="/dashboard" className="btn-ghost px-6 py-3">
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <OfferForm
          initial={editingOffer}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingOffer(undefined);
          }}
        />
      )}
    </div>
  );
}
