"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { LogoPlaceholder } from "../ui/LogoPlaceholder";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { subscribeChapter, SceneState } from "@/lib/SceneState";

export const CHAPTER_STAGES = [
  { id: "hero", label: "شروع" },
  { id: "manifesto", label: "درباره اینوتکس" },
  { id: "pillars", label: "بخش‌ها و رویدادها" },
  { id: "stats", label: "آمار و تأثیر" },
  { id: "experience", label: "تجربه نمایشگاه" },
  { id: "register", label: "ثبت‌نام" },
];

export const NAV_LINKS = [
  { id: "hero", label: "شروع" },
  { id: "manifesto", label: "درباره اینوتکس" },
  { id: "pillars", label: "بخش‌ها و رویدادها" },
  { id: "stats", label: "آمار و دستاوردها" },
  { id: "experience", label: "تجربه نمایشگاه" },
  { id: "express", label: "اینوتکس‌اکسپرس ۱۴۰۵", badge: "EXPRESS" },
  { id: "register", label: "پیش‌ثبت‌نام و حضور" },
];

// سازگاری با کدهای پیشین
export const CHAPTERS = CHAPTER_STAGES;

const toFa = (n: number) => n.toLocaleString("fa-IR");

export const Navbar: React.FC<{ ready: boolean }> = ({ ready }) => {
  const [open, setOpen] = useState(false);
  const [chapter, setChapterState] = useState(SceneState.chapter);
  const menuRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => subscribeChapter(setChapterState), []);

  // نوار پیشرفت اسکرول (زرد برند) زیر هدر
  const progressRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const el = progressRef.current;
    if (!el) return;
    const tween = gsap.fromTo(
      el,
      { scaleX: 0 },
      { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } }
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  useEffect(() => {
    if (!ready || !headerRef.current) return;
    gsap.fromTo(headerRef.current, { yPercent: -100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1, ease: "power3.out" });
  }, [ready]);

  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;
    gsap.to(menu, {
      clipPath: open ? "inset(0% 0% 0% 0%)" : "inset(0% 0% 100% 0%)",
      duration: 0.8,
      ease: "power4.inOut",
    });
    if (open) {
      gsap.fromTo(
        menu.querySelectorAll(".menu-item"),
        { yPercent: 110 },
        { yPercent: 0, duration: 0.9, stagger: 0.06, ease: "power4.out", delay: 0.25 }
      );
    }
    // قفل اسکرول: کلاس جدا از لودر (وگرنه این افکت در اولین رندر قفل لودر را برمی‌دارد) + توقف Lenis
    document.documentElement.classList.toggle("menu-open", open);
    if (open) SceneState.lenis?.stop();
    else SceneState.lenis?.start();
    return () => document.documentElement.classList.remove("menu-open");
  }, [open]);

  // بستن منو با Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header
        ref={headerRef}
        style={{ opacity: 0 }}
        className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-[color:var(--line)]/30 bg-[color:var(--bg)]/75 px-5 py-3.5 backdrop-blur-md transition-colors duration-500 sm:px-10"
      >
        {/* لوگو: آبی برند روی زمینه‌ی روشن، سفید روی آبی/سرمه‌ای */}
        <a
          href="#hero"
          aria-label="INOTEX — صفحه اصلی"
          className="flex items-center text-[color:var(--accent)] transition-all duration-300 hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--yellow)]"
        >
          <LogoPlaceholder variant="horizontal" height={26} />
        </a>

        {/* نشانگر زنده بخش فعلی با پالس نوری */}
        <div
          className="label hidden items-center gap-3 rounded-full border border-[color:var(--line)] bg-[color:var(--card-bg)] px-4 py-1.5 backdrop-blur-md md:flex"
          aria-live="polite"
        >
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[color:var(--yellow)] opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[color:var(--yellow)]" />
          </span>
          <span className="font-bold text-[color:var(--fg)] tabular-nums">
            {toFa(chapter + 1).padStart(2, "۰")} / {toFa(CHAPTERS.length).padStart(2, "۰")}
          </span>
          <span className="h-3 w-px bg-[color:var(--line)]" />
          <span className="fa text-xs font-bold text-[color:var(--fg)] normal-case tracking-normal">
            {CHAPTERS[chapter]?.label}
          </span>
        </div>

        {/* دکمه‌های ناوبری سریع در دسکتاپ */}
        <div className="flex items-center gap-3">
          <a
            href="#register"
            className="pill pill-solid hidden !px-4 !py-2 !text-xs sm:inline-flex"
          >
            پیش‌ثبت‌نام
            <span aria-hidden="true">←</span>
          </a>

          <button
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="site-menu"
            className="pill !px-4 !py-2 !text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--yellow)]"
          >
            {open ? "بستن ✕" : "منو"}
          </button>
        </div>

        {/* نوار پیشرفت اسکرول با رنگ زرد برند */}
        <span
          ref={progressRef}
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-[2.5px] origin-right scale-x-0 bg-[color:var(--yellow)] transition-transform duration-75"
        />
      </header>

      {/* Fullscreen menu */}
      <div
        id="site-menu"
        ref={menuRef}
        inert={!open}
        style={{ clipPath: "inset(0% 0% 100% 0%)" }}
        className="fixed inset-0 z-40 flex flex-col justify-between bg-[#012a40] px-6 pb-12 pt-28 text-white sm:px-16"
      >
        <nav className="flex flex-col gap-1 sm:gap-2" aria-label="منوی اصلی وب‌سایت">
          {NAV_LINKS.map((c, i) => (
            <a
              key={c.id}
              href={`#${c.id}`}
              onClick={() => setOpen(false)}
              className="line-mask group"
            >
              <span className="menu-item fa flex items-baseline gap-4 sm:gap-6 text-[clamp(1.5rem,4.2vw,3.6rem)] font-extrabold transition-colors duration-300 hover:text-[#ffb81d]">
                <span className="label !text-white/40 text-xs sm:text-sm font-mono">{toFa(i + 1).padStart(2, "۰")}</span>
                <span>{c.label}</span>
                {"badge" in c && c.badge && (
                  <span className="label rounded-md border border-[color:var(--yellow)]/40 bg-[color:var(--yellow)]/15 px-2 py-0.5 text-[9px] font-bold text-[color:var(--yellow)] font-mono">
                    {c.badge}
                  </span>
                )}
              </span>
            </a>
          ))}
        </nav>

        <div className="flex flex-col justify-between gap-4 border-t border-white/15 pt-6 sm:flex-row sm:items-center">
          <p className="label !text-white/70" dir="ltr">
            info@inotex.com · +98 21 76250250
          </p>
          <p className="fa text-xs text-white/50">
            پارک فناوری پردیس، تهران — رویداد بین‌المللی نوآوری و فناوری
          </p>
        </div>
      </div>
    </>
  );
};