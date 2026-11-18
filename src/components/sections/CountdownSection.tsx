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
      <div className="lg:w-[52%]">
        <p className="tag label mb-6">05 — Register</p>
        <h2 className="display fa text-[clamp(2.2rem,6vw,5.8rem)]">
          جای شما در
          <br />
          اینوتکس خالی است.
        </h2>

        {left ? (
          <div className="mt-12 grid grid-cols-4 gap-3" dir="rtl">
            {UNITS.map((u) => (
              <div key={u.key} className="border-t border-[color:var(--line)] pt-3">
                <div className="display text-[clamp(2rem,5vw,4.2rem)] tabular-nums">
                  {left[u.key].toLocaleString("fa-IR", { minimumIntegerDigits: 2, useGrouping: false })}
                </div>
                <div className="fa text-sm text-[color:var(--muted)]">{u.label}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="fa mt-10 text-lg text-[color:var(--muted)]">تاریخ دوره‌ی بعد به‌زودی اعلام می‌شود. پیش‌ثبت‌نام کنید تا اولین نفر مطلع شوید.</p>
        )}

        {sent ? (
          <div className="mt-12">
            <h3 className="fa text-2xl font-bold">درخواست شما ثبت شد.</h3>
            <p className="fa mt-3 max-w-sm leading-8 text-[color:var(--muted)]">
              کارشناسان دبیرخانه برای ارائه پکیج غرفه‌داری و شرایط حضور با شما تماس می‌گیرند.
            </p>
            <button onClick={() => setSent(false)} className="fa mt-4 text-sm underline underline-offset-4">
              ثبت درخواست جدید
            </button>
          </div>
        ) : (
          <form
            className="mt-12 max-w-md"
            onSubmit={submit}
            noValidate
          >
            <div className="flex flex-wrap gap-2">
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
                  className={`fa cursor-pointer rounded-full border px-4 py-2 text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffb81d] ${
                    role === r.id
                      ? "border-[#ffb81d] bg-[#ffb81d] text-[#0a1a2b] shadow-md"
                      : "border-[color:var(--line)] text-white/90 hover:border-white/50 hover:bg-white/5"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <input
              className="field mt-8"
              dir="ltr"
              required
              name="contact"
              type="text"
              inputMode="email"
              autoComplete="email"
              value={contact}
              onChange={(e) => { setContact(e.target.value); if (error) setError(""); }}
              aria-invalid={!!error}
              placeholder="ایمیل یا شماره تماس"
              aria-label="ایمیل یا شماره تماس"
            />

            {error && <p role="alert" className="fa mt-3 text-sm text-[#ffb81d]">{error}</p>}

            <button type="submit" disabled={busy} className="pill pill-solid mt-10 disabled:opacity-60">
              {busy ? "در حال ارسال…" : "ارسال درخواست و دریافت کاتالوگ غرفه‌ها"}
              <span aria-hidden>←</span>
            </button>
          </form>
        )}
      </div>
    </section>
  );
};