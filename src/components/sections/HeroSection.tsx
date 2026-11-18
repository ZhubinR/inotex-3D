"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { Sticker } from "../ui/Sticker";

const LINES = ["اکوسیستم نوآوری", "و فناوری", "زیر یک سقف"];

export const HeroSection: React.FC<{ ready: boolean }> = ({ ready }) => {
  const rootRef = useRef<HTMLElement>(null);

  // حالت اولیه (لودر روی صفحه است، پس پرش دیده نمی‌شود)
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.set(root.querySelectorAll(".hero-line"), { yPercent: 115 });
    gsap.set(root.querySelectorAll(".hero-fade"), { opacity: 0, y: 24 });
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!ready || !root) return;
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    tl.to(root.querySelectorAll(".hero-line"), { yPercent: 0, duration: 1.4, stagger: 0.12 })
      .to(root.querySelectorAll(".hero-fade"), { opacity: 1, y: 0, duration: 1, stagger: 0.1 }, "-=0.9");
    return () => {
      tl.kill();
    };
  }, [ready]);

  return (
    <section
      id="hero"
      ref={rootRef}
      data-chapter
      data-theme="light"
      className="relative flex min-h-[100svh] flex-col justify-end px-5 pb-10 pt-32 sm:px-10 lg:justify-center"
    >
      {/* 📷 استیکرهای کات‌اوت (PNG/WebP شفاف) — فقط دسکتاپ */}
      <Sticker src="/images/hero/sticker-1.png" rotate={-8} depth={30} delay={2.0} className="absolute left-[6%] top-[15%] hidden w-[clamp(100px,11vw,190px)] lg:block" />
      <Sticker src="/images/hero/sticker-2.png" rotate={7} depth={20} delay={2.2} className="absolute bottom-[9%] left-[36%] hidden w-[clamp(90px,9vw,160px)] lg:block" />
      <Sticker src="/images/hero/sticker-3.png" rotate={11} depth={36} delay={2.4} className="absolute left-[38%] top-[20%] hidden w-[clamp(80px,8vw,140px)] lg:block" />

      <div className="lg:w-[52%]">
        <p className="tag label hero-fade mb-6" dir="ltr">
          INOTEX 2026 <span className="hidden sm:inline">— Pardis Technology Park,</span> Tehran
        </p>

        <h1 className="display fa text-[clamp(2.6rem,6.4vw,6.6rem)]">
          {LINES.map((l, i) => (
            <span key={l} className="line-mask">
              <span className={`hero-line block ${i === 2 ? "text-[color:var(--blue)]" : ""}`}>{l}</span>
            </span>
          ))}
        </h1>

        {/* شعار انگلیسی برند (پوستر ۲۰۲۱): Open Sans با فاصله‌ی زیاد */}
        <p className="label hero-fade mt-6 text-right !text-[color:var(--teal)] font-bold" dir="ltr">
          Innovation Ecosystem <span className="text-[color:var(--yellow)]">·</span> Under One Roof
        </p>

        <p className="hero-fade fa fa-body mt-6 max-w-md text-base text-[color:var(--muted)] sm:text-lg sm:leading-8">
          استارتاپ‌ها، سرمایه‌گذاران، شرکت‌های دانش‌بنیان و صنایع؛ چهار روز کنار هم، برای اینکه ایده به قرارداد تبدیل شود.
        </p>

        <div className="hero-fade mt-10 flex flex-wrap items-center gap-4">
          <a href="#register" className="pill pill-solid cursor-pointer">
            پیش‌ثبت‌نام غرفه و حضور
            <span aria-hidden>←</span>
          </a>
          <a href="#pillars" className="pill cursor-pointer">
            کاوش بخش‌ها
          </a>
        </div>
      </div>

      {/* راهنمای تعامل: نشان سه‌بعدی با درگ ماوس می‌چرخد (فقط دسکتاپ) — طراحی به‌صورت بج شیشه‌ای شکیل */}
      <div
        className="label hero-fade absolute bottom-10 left-[29%] hidden -translate-x-1/2 items-center gap-2.5 rounded-full border border-[color:var(--line)] bg-[color:var(--bg)]/85 px-4 py-2 backdrop-blur-md shadow-sm transition-transform hover:scale-105 lg:flex"
        dir="ltr"
        aria-hidden="true"
      >
        <span className="drag-hint-arrows text-[color:var(--accent)]">←</span>
        <span className="font-bold text-[color:var(--fg)]">Drag to rotate 3D</span>
        <span className="drag-hint-arrows text-[color:var(--accent)]">→</span>
      </div>

      <div className="label hero-fade absolute bottom-10 start-5 hidden items-center gap-3 sm:start-10 lg:flex" dir="ltr">
        <span>Scroll</span>
        <span className="h-10 w-px bg-[color:var(--line)]" />
      </div>
    </section>
  );
};