"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
interface Tier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  buttonLabel: string;
  buttonStyle: "disabled" | "primary" | "outline";
  popular?: boolean;
}

const tiers: Tier[] = [
  {
    name: "Free",
    price: "₹0",
    period: "/month",
    description: "Get started with basic career tools",
    features: [
      "20 aptitude questions/day",
      "1 AI interview/month",
      "Basic resume builder",
      "Company tracker",
    ],
    buttonLabel: "Current Plan",
    buttonStyle: "disabled",
  },
  {
    name: "Pro",
    price: "₹499",
    period: "/month",
    description: "Unlock your full career potential",
    features: [
      "Unlimited aptitude practice",
      "Unlimited AI interviews",
      "AI Resume Scorer",
      "GD Simulator",
      "Offer Comparison AI",
      "Weakness detector",
    ],
    buttonLabel: "Upgrade to Pro",
    buttonStyle: "primary",
    popular: true,
  },
  {
    name: "Team",
    price: "₹2999",
    period: "/month",
    description: "For colleges & placement cells",
    features: [
      "Everything in Pro",
      "Up to 50 students",
      "Admin dashboard",
      "Bulk resume review",
      "Priority support",
    ],
    buttonLabel: "Contact Sales",
    buttonStyle: "outline",
  },
];

/* ------------------------------------------------------------------ */
/* Feature icon                                                        */
/* ------------------------------------------------------------------ */
function CheckIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-emerald-400"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 12.75l6 6 9-13.5"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Payment Modal                                                       */
/* ------------------------------------------------------------------ */
function PaymentModal({ onClose }: { onClose: () => void }) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  /* Format card number as user types */
  const handleCardChange = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    const formatted = digits.replace(/(.{4})/g, "$1 ").trim();
    setCardNumber(formatted);
  };

  /* Format expiry as MM/YY */
  const handleExpiryChange = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length > 2) {
      setExpiry(digits.slice(0, 2) + "/" + digits.slice(2));
    } else {
      setExpiry(digits);
    }
  };

  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
    }, 2000);
  };

  const isFormValid =
    cardNumber.replace(/\s/g, "").length === 16 &&
    expiry.length === 5 &&
    cvv.length === 3;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center px-4 transition-all duration-300 ${
        mounted ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-md rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#030303]/95 p-8 shadow-2xl shadow-indigo-500/10 backdrop-blur-xl transition-all duration-500 ${
          mounted
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-8 scale-95 opacity-0"
        }`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-surface-300 transition-colors hover:bg-white/10 hover:text-white"
          id="close-payment-modal"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {!success ? (
          <>
            {/* Header */}
            <div className="mb-6">
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-400">
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Upgrade to Pro
              </div>
              <h2 className="text-2xl font-bold text-white">
                Complete your payment
              </h2>
              <p className="mt-1 text-sm text-surface-300">
                Enter your card details below. This is a UI simulation only.
              </p>
            </div>

            {/* Form */}
            <div className="space-y-4">
              {/* Card Number */}
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-surface-300">
                  Card Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => handleCardChange(e.target.value)}
                    placeholder="XXXX XXXX XXXX XXXX"
                    className="w-full rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-4 py-3 pr-12 text-sm text-white placeholder-white/40 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    id="card-number-input"
                  />
                  <svg
                    className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
                    />
                  </svg>
                </div>
              </div>

              {/* Expiry + CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-surface-300">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => handleExpiryChange(e.target.value)}
                    placeholder="MM/YY"
                    className="w-full rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    id="expiry-input"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-surface-300">
                    CVV
                  </label>
                  <input
                    type="password"
                    value={cvv}
                    onChange={(e) =>
                      setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))
                    }
                    placeholder="•••"
                    className="w-full rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    id="cvv-input"
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 py-1">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-xs text-white/40">
                  Secure checkout
                </span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              {/* Summary */}
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-surface-300">
                    Pro Plan — Monthly
                  </span>
                  <span className="text-lg font-bold text-white">₹499</span>
                </div>
              </div>

              {/* Pay Button */}
              <button
                onClick={handlePay}
                disabled={!isFormValid || processing}
                className={`relative w-full overflow-hidden rounded-xl py-3.5 text-sm font-semibold text-white transition-all duration-300 ${
                  isFormValid && !processing
                    ? "bg-gradient-to-r from-indigo-600 to-indigo-500 shadow-lg shadow-indigo-500/25 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/30"
                    : "cursor-not-allowed bg-white/10 text-white/40"
                }`}
                id="pay-button"
              >
                {processing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="h-4 w-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Processing…
                  </span>
                ) : (
                  "Pay ₹499"
                )}
              </button>
            </div>
          </>
        ) : (
          /* ---- Success State ---- */
          <div className="flex flex-col items-center py-6 text-center">
            {/* Animated check circle */}
            <div className="relative mb-6">
              <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500/20" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/30">
                <svg
                  className="h-10 w-10 text-white animate-[fadeIn_0.5s_ease-out_0.3s_both]"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={3}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              </div>
            </div>

            <div className="mb-2 text-4xl animate-[fadeIn_0.5s_ease-out_0.5s_both]">
              🎉
            </div>
            <h3 className="mb-1 text-2xl font-bold text-white animate-[fadeIn_0.5s_ease-out_0.6s_both]">
              You are now Pro!
            </h3>
            <p className="mb-6 text-sm text-surface-300 animate-[fadeIn_0.5s_ease-out_0.7s_both]">
              All Pro features have been unlocked. Start exploring now!
            </p>

            <button
              onClick={onClose}
              className="btn-primary animate-[fadeIn_0.5s_ease-out_0.8s_both]"
              id="close-success-button"
            >
              Let&apos;s Go! 🚀
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Pricing Card                                                        */
/* ------------------------------------------------------------------ */
function PricingCard({
  tier,
  index,
  onUpgrade,
}: {
  tier: Tier;
  index: number;
  onUpgrade: () => void;
}) {
  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-8 transition-all duration-500 ${
        tier.popular
          ? "border-brand-500/40 bg-gradient-to-b from-brand-500/[0.08] to-transparent shadow-xl shadow-brand-500/10 scale-[1.03]"
          : "border-white/10 bg-white/[0.03]"
      } hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-500/5`}
      style={{ animationDelay: `${index * 150}ms` }}
    >
      {/* Most Popular Badge */}
      {tier.popular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-brand-500 to-purple-500 px-4 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-brand-500/30">
            <svg
              className="h-3.5 w-3.5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
            Most Popular
          </span>
        </div>
      )}

      {/* Tier Header */}
      <div className="mb-6">
        <h3
          className={`text-lg font-semibold ${
            tier.popular ? "text-brand-400" : "text-surface-200"
          }`}
        >
          {tier.name}
        </h3>
        <p className="mt-1 text-sm text-surface-300">{tier.description}</p>
      </div>

      {/* Price */}
      <div className="mb-8 flex items-baseline gap-1">
        <span
          className={`text-5xl font-extrabold tracking-tight ${
            tier.popular
              ? "bg-gradient-to-r from-white to-brand-300 bg-clip-text text-transparent"
              : "text-white"
          }`}
        >
          {tier.price}
        </span>
        <span className="text-sm text-surface-300">{tier.period}</span>
      </div>

      {/* Features */}
      <ul className="mb-8 flex-1 space-y-3">
        {tier.features.map((feature) => (
          <li key={feature} className="flex items-center gap-3 text-sm">
            <CheckIcon />
            <span className="text-surface-200">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      {tier.buttonStyle === "disabled" && (
        <button
          disabled
          className="w-full cursor-not-allowed rounded-xl bg-white/5 py-3 text-sm font-semibold text-white/40 transition-all"
          id="current-plan-button"
        >
          {tier.buttonLabel}
        </button>
      )}

      {tier.buttonStyle === "primary" && (
        <button
          onClick={onUpgrade}
          className="w-full rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-500/30"
          id="upgrade-to-pro-button"
        >
          {tier.buttonLabel}
        </button>
      )}

      {tier.buttonStyle === "outline" && (
        <a
          href="mailto:support@careerlaunch.com"
          className="w-full rounded-xl border border-white/15 bg-transparent py-3 text-sm font-semibold text-surface-200 transition-all duration-300 hover:border-white/30 hover:bg-white/5 hover:text-white block text-center"
          id="contact-sales-button"
        >
          {tier.buttonLabel}
        </a>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
export default function PricingPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <section className="relative min-h-screen px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        {/* Background accents */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/[0.07] blur-[120px]" />
          <div className="absolute bottom-0 right-0 h-[400px] w-[600px] translate-x-1/3 rounded-full bg-purple-500/[0.05] blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-6xl">
          {/* Back to Dashboard */}
          <div className="mb-8">
            <Link href="/dashboard" className="text-brand-400 hover:text-brand-300 text-sm font-medium inline-flex items-center gap-1">
              ← Back to Dashboard
            </Link>
          </div>

          {/* Header */}
          <div className="mb-16 text-center animate-fade-in">
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-brand-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-400">
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
                />
              </svg>
              Pricing
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Choose your{" "}
              <span className="text-gradient">plan</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-surface-300">
              Start free and upgrade when you&apos;re ready. No hidden fees, cancel
              anytime.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid gap-8 md:grid-cols-3 animate-slide-up">
            {tiers.map((tier, i) => (
              <PricingCard
                key={tier.name}
                tier={tier}
                index={i}
                onUpgrade={() => setShowModal(true)}
              />
            ))}
          </div>

          {/* Trust bar */}
          <div className="mt-16 text-center animate-fade-in">
            <p className="text-sm text-white/40">
              🔒 Payments are simulated — no real charges will occur.
            </p>
          </div>

          {/* Back to dashboard */}
          <div className="mt-8 text-center animate-fade-in">
            <Link href="/dashboard" className="btn-ghost px-6 py-3">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Payment Modal */}
      {showModal && <PaymentModal onClose={() => setShowModal(false)} />}
    </>
  );
}
