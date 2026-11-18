"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { LogoPlaceholder } from "../ui/LogoPlaceholder";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { subscribeChapter, SceneState } from "@/lib/SceneState";

export const CHAPTERS = [
  { id: "hero", label: "شروع" },
  { id: "manifesto", label: "درباره اینوتکس" },
  { id: "pillars", label: "بخش‌ها و رویدادها" },
  { id: "stats", label: "آمار و تأثیر" },
  { id: "experience", label: "تجربه نمایشگاه" },
  { id: "register", label: "ثبت‌نام" },
];

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
        className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-5 py-5 sm:px-10"
      >
        {/* لوگو: آبی برند روی زمینه‌ی روشن، سفید روی آبی/سرمه‌ای (برندبوک، Logo Color) */}
        <a href="#hero" aria-label="INOTEX" className="text-[color:var(--accent)] transition-colors duration-700">
          <LogoPlaceholder variant="horizontal" height={24} />
        </a>

        <div className="label hidden items-center gap-3 md:flex" aria-live="polite">
          <span className="font-bold text-[color:var(--fg)]">
            {toFa(chapter + 1).padStart(2, "۰")} / {toFa(CHAPTERS.length).padStart(2, "۰")}
          </span>
          <span className="h-px w-8 bg-[color:var(--line)]" />
          <span className="fa normal-case tracking-normal">{CHAPTERS[chapter]?.label}</span>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="site-menu"
          className="pill !px-5 !py-2.5 !text-xs"
        >
          {open ? "بستن" : "منو"}
        </button>
        <span
          ref={progressRef}
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-[3px] origin-right scale-x-0 bg-[color:var(--yellow)]"
        />
      </header>

      {/* Fullscreen menu */}
      <div
        id="site-menu"
        ref={menuRef}
        inert={!open}
        style={{ clipPath: "inset(0% 0% 100% 0%)" }}
        className="fixed inset-0 z-40 flex flex-col justify-center bg-[#012a40] px-6 text-white sm:px-16"
      >
        <nav className="flex flex-col gap-1">
          {CHAPTERS.map((c, i) => (
            <a
              key={c.id}
              href={`#${c.id}`}
              onClick={() => setOpen(false)}
              className="line-mask group"
            >
              <span className="menu-item fa flex items-baseline gap-5 text-[clamp(2.2rem,7vw,5.5rem)] font-extrabold transition-colors hover:text-[#ffb81d]">
                <span className="label !text-white/50">{toFa(i + 1).padStart(2, "۰")}</span>
                {c.label}
              </span>
            </a>
          ))}
        </nav>
        <p className="label absolute bottom-8 start-6 sm:start-16" dir="ltr">
          info@inotex.com · +98 21 76250250
        </p>
      </div>
    </>
  );
};