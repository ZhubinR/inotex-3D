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
      className="relative flex min-h-[100svh] flex-col justify-end px-5 pb-8 pt-24 sm:px-10 lg:h-[100svh] lg:min-h-0 lg:justify-center lg:pb-8 lg:pt-16"
    >
      {/* 📷 استیکرهای کات‌اوت (PNG/WebP شفاف) — فقط دسکتاپ */}
      <Sticker
        src="/images/hero/sticker-1.png"
        alt="نشان هندسی شش‌ضلعی رویداد اینوتکس"
        rotate={-8}
        depth={30}
        delay={2.0}
        className="absolute left-[6%] top-[15%] hidden w-[clamp(100px,11vw,190px)] lg:block"
      />
      <Sticker
        src="/images/hero/sticker-2.png"
        alt="المان فناوری و شتاب‌دهی اکوسیستم اینوتکس"
        rotate={7}
        depth={20}
        delay={2.2}
        className="absolute bottom-[9%] left-[36%] hidden w-[clamp(90px,9vw,160px)] lg:block"
      />
      <Sticker
        src="/images/hero/sticker-3.png"
        alt="نماد شبکه و هم‌افزایی کارآفرینی"
        rotate={11}
        depth={36}
        delay={2.4}
        className="absolute left-[38%] top-[20%] hidden w-[clamp(80px,8vw,140px)] lg:block"
      />

      <div className="lg:w-[52%]">
        {/* نشان رویداد با طراحی ژورنالی */}
        <div className="hero-fade mb-4 inline-flex items-center gap-2.5 rounded-full border border-[color:var(--line)] bg-[color:var(--card-bg)] px-3.5 py-1 backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-[color:var(--teal)] animate-pulse" aria-hidden="true" />
          <span className="label text-xs font-bold tracking-widest text-[color:var(--fg)]" dir="ltr">
            INOTEX 2026
          </span>
          <span className="h-3 w-px bg-[color:var(--line)]" />
          <span className="fa text-xs font-medium text-[color:var(--muted)]">
            پارک فناوری پردیس، تهران
          </span>
        </div>

        <h1 className="display fa text-[clamp(2.1rem,4.1vw,4.2rem)] font-extrabold leading-[1.18] tracking-tight">
          {LINES.map((l, i) => (
            <span key={l} className="line-mask">
              <span
                className={`hero-line block ${
                  i === 2
                    ? "text-[color:var(--blue)] drop-shadow-xs"
                    : "text-[color:var(--fg)]"
                }`}
              >
                {l}
              </span>
            </span>
          ))}
        </h1>

        {/* شعار انگلیسی رسمی برند (برندبوک پوستر ۲۰۲۱) */}
        <p className="label hero-fade mt-3.5 text-right text-xs font-bold !text-[color:var(--teal)] sm:text-sm" dir="ltr">
          Innovation Ecosystem <span className="text-[color:var(--yellow)]">·</span> Under One Roof
        </p>

        <p className="hero-fade fa fa-body mt-3 max-w-lg text-sm text-[color:var(--muted)] sm:text-base sm:leading-7">
          استارتاپ‌ها، سرمایه‌گذاران، شرکت‌های دانش‌بنیان و صنایع بزرگ؛ چهار روز در کنار هم برای خلق هم‌افزایی، پیوند ایده به بازار و انعقاد قراردادهای راهبردی.
        </p>

        {/* خلاصه کلیدی رویداد */}
        <div className="hero-fade mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 border-t border-[color:var(--line)]/50 pt-3 text-xs text-[color:var(--muted)]">
          <span className="fa font-bold text-[color:var(--fg)]">۴ روز رویداد حضوری</span>
          <span className="text-[color:var(--line)]">•</span>
          <span className="fa font-bold text-[color:var(--fg)]">۶ بخش تخصصی</span>
          <span className="text-[color:var(--line)]">•</span>
          <span className="fa font-bold text-[color:var(--teal)]">بزرگ‌ترین گردهمایی نوآوری کشور</span>
        </div>

        {/* دکمه‌های فراخوان (CTA) */}
        <div className="hero-fade mt-6 flex flex-wrap items-center gap-3.5">
          <a href="#register" className="pill pill-solid">
            پیش‌ثبت‌نام غرفه و حضور
            <span aria-hidden="true">←</span>
          </a>
          <a href="#pillars" className="pill">
            کاوش بخش‌های رویداد
          </a>
        </div>
      </div>

      {/* راهنمای تعامل: نشان سه‌بعدی با درگ ماوس می‌چرخد (فقط دسکتاپ) — طراحی به‌صورت بج شیشه‌ای شکیل */}
      <div
        className="label hero-fade absolute bottom-8 left-[29%] hidden -translate-x-1/2 items-center gap-2.5 rounded-full border border-[color:var(--line)] bg-[color:var(--bg)]/85 px-4 py-1.5 backdrop-blur-md shadow-sm transition-transform hover:scale-105 lg:flex"
        dir="ltr"
        aria-hidden="true"
      >
        <span className="drag-hint-arrows text-[color:var(--accent)]">←</span>
        <span className="font-bold text-[color:var(--fg)]">Drag to rotate 3D</span>
        <span className="drag-hint-arrows text-[color:var(--accent)]">→</span>
      </div>

      <div className="label hero-fade absolute bottom-8 start-5 hidden items-center gap-3 sm:start-10 lg:flex" dir="ltr">
        <span>Scroll</span>
        <span className="h-10 w-px bg-[color:var(--line)]" />
      </div>
    </section>
  );
};