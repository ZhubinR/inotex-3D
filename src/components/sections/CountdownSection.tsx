"use client";

import React, { useEffect, useState } from "react";
import { SceneState } from "@/lib/SceneState";

// آدرس API ثبت‌نام (در GitLab Variables یا .env بگذارید: NEXT_PUBLIC_REGISTER_URL)
const REGISTER_URL = process.env.NEXT_PUBLIC_REGISTER_URL;
const CONTACT_RE = /^(?:[^\s@]+@[^\s@]+\.[^\s@]+|(?:\+98|0098|0)?9\d{9}|\+?\d{8,15})$/;

// ⚠️ تاریخ شروع دوره‌ی بعدی را اینجا بگذارید (ISO). مقدار null = هنوز اعلام نشده.
// تاریخ قبلی پروژه (۱۹ می ۲۰۲۶) گذشته است، پس تا اعلام تاریخ جدید، پیام «به‌زودی» نشان داده می‌شود.
const NEXT_EDITION: string | null = null;

const UNITS = [
  { key: "days", label: "روز" },
  { key: "hours", label: "ساعت" },
  { key: "minutes", label: "دقیقه" },
  { key: "seconds", label: "ثانیه" },
] as const;

const ROLES = [
  { id: "startup", label: "استارتاپ" },
  { id: "enterprise", label: "شرکت فناور" },
  { id: "investor", label: "سرمایه‌گذار" },
];

export const CountdownSection: React.FC = () => {
  const [left, setLeft] = useState<Record<string, number> | null>(null);
  const [role, setRole] = useState("startup");
  const [contact, setContact] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = contact.trim().replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
    if (!CONTACT_RE.test(value.replace(/[\s-]/g, ""))) {
      setError("ایمیل یا شماره تماس معتبر وارد کنید.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      if (!REGISTER_URL) throw new Error("NEXT_PUBLIC_REGISTER_URL is not set");
      const res = await fetch(REGISTER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, contact: value }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setSent(true);
    } catch {
      setError("ارسال انجام نشد. دوباره تلاش کنید یا با info@inotex.com تماس بگیرید.");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!NEXT_EDITION) return;
    const target = new Date(NEXT_EDITION).getTime();
    const tick = () => {
      const d = target - Date.now();
      if (d <= 0) return setLeft(null);
      setLeft({
        days: Math.floor(d / 86400000),
        hours: Math.floor((d / 3600000) % 24),
        minutes: Math.floor((d / 60000) % 60),
        seconds: Math.floor((d / 1000) % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <section
      id="register"
      data-chapter
      data-theme="dark"
      className="flex min-h-[100svh] flex-col justify-center px-5 py-32 sm:px-10"
    >
      <div className="lg:w-[54%]">
        <p className="tag label mb-6">05 — Registration & Access</p>
        <h2 className="display fa text-[clamp(2.4rem,6vw,5.6rem)] font-extrabold tracking-tight">
          جای شما در
          <br />
          <span className="text-[color:var(--yellow)]">اینوتکس ۲۰۲۶</span> خالی است.
        </h2>

        {left ? (
          <div className="mt-12 grid grid-cols-4 gap-4" dir="rtl">
            {UNITS.map((u) => (
              <div key={u.key} className="glass-panel rounded-2xl p-4 text-center">
                <div className="display text-[clamp(2rem,5vw,3.8rem)] font-extrabold text-white tabular-nums">
                  {left[u.key].toLocaleString("fa-IR", { minimumIntegerDigits: 2, useGrouping: false })}
                </div>
                <div className="fa mt-1 text-xs font-bold text-white/70">{u.label}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-8 inline-flex items-center gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-3 backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-[color:var(--yellow)] animate-pulse" />
            <p className="fa text-sm font-medium text-white/90">
              تاریخ دوره‌ی بعدی به‌زودی اعلام می‌شود. هم‌اکنون پیش‌ثبت‌نام کنید تا نخستین نفر از شرایط غرفه‌داری مطلع شوید.
            </p>
          </div>
        )}

        {sent ? (
          <div className="glass-panel mt-10 rounded-2xl border border-[color:var(--teal)]/40 p-8 shadow-xl">
            <div className="flex items-center gap-3 text-[color:var(--teal)]">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--teal)]/20 text-xl font-bold">
                ✓
              </span>
              <h3 className="fa text-xl font-bold text-white">درخواست شما با موفقیت ثبت شد</h3>
            </div>
            <p className="fa mt-4 max-w-md leading-8 text-white/80">
              کارشناسان دبیرخانه اینوتکس به زودی برای ارسال کاتالوگ جامع، تخفیف‌های ثبت‌نام زودهنگام و راهنمای انتخاب غرفه با شما تماس می‌گیرند.
            </p>
            <button
              onClick={() => setSent(false)}
              className="pill mt-6 !px-5 !py-2.5 !text-xs font-bold"
            >
              ثبت درخواست دیگر
            </button>
          </div>
        ) : (
          <form
            className="mt-10 max-w-lg"
            onSubmit={submit}
            noValidate
          >
            <label className="fa block text-xs font-bold text-white/70 mb-3">
              نقش یا نوع مشارکت شما در رویداد:
            </label>
            <div className="flex flex-wrap gap-2.5">
              {ROLES.map((r, i) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    setRole(r.id);
                    SceneState.role = i; // رنگ هسته‌ی سه‌بعدی عوض می‌شود
                    SceneState.rolePulse = performance.now();
                  }}
                  aria-pressed={role === r.id}
                  className={`fa cursor-pointer rounded-full border px-5 py-2.5 text-sm font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffb81d] ${
                    role === r.id
                      ? "border-[#ffb81d] bg-[#ffb81d] text-[#0a1a2b] shadow-md shadow-[#ffb81d]/20 scale-102"
                      : "border-white/20 bg-white/5 text-white/90 hover:border-white/50 hover:bg-white/10"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <div className="field-container mt-6">
              <label htmlFor="contact-input" className="fa block text-xs font-bold text-white/70 mb-2">
                ایمیل یا شماره همراه (جهت هماهنگی و ارسال کاتالوگ):
              </label>
              <input
                id="contact-input"
                className={`field ${error ? "field-error" : ""}`}
                dir="ltr"
                required
                name="contact"
                type="text"
                inputMode="email"
                autoComplete="email"
                value={contact}
                onChange={(e) => { setContact(e.target.value); if (error) setError(""); }}
                aria-invalid={!!error}
                placeholder="example@domain.com یا 0912..."
                aria-label="ایمیل یا شماره تماس"
              />
            </div>

            {error && (
              <div role="alert" className="mt-3 flex items-center gap-2 text-xs font-bold text-[#ffb81d]">
                <span>⚠</span>
                <span className="fa">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="pill pill-solid mt-8 w-full sm:w-auto !py-3.5 !px-8 text-sm font-extrabold shadow-lg disabled:opacity-60"
            >
              {busy ? "در حال ارسال و ثبت در دبیرخانه…" : "ارسال درخواست و دریافت کاتالوگ غرفه‌ها"}
              <span aria-hidden="true">←</span>
            </button>
          </form>
        )}
      </div>
    </section>
  );
};