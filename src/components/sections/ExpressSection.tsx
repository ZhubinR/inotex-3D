// src/components/sections/ExpressSection.tsx
"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface StatItem {
  key: string;
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  sub?: string;
}

const STATS_HERO: StatItem[] = [
  {
    key: "visitors",
    value: 30000,
    suffix: "+",
    label: "بازدیدکننده",
    sub: "حضور متخصصان، پژوهشگران، سرمایه‌گذاران و علاقه‌مندان به فناوری",
  },
  {
    key: "meetings",
    value: 400,
    suffix: "+",
    label: "جلسه تجاری",
    sub: "مذاکرات رودررو، سرمایه‌گذاری جسورانه و انعقاد تفاهم‌نامه‌های صنعتی",
  },
];

const STATS_PILLARS: StatItem[] = [
  {
    key: "startups",
    value: 100,
    suffix: "+",
    label: "استارتاپ",
    sub: "تیم‌های نوپا و مقیاس‌پذیر با محصول آماده ورود به بازار",
  },
  {
    key: "companies",
    value: 50,
    suffix: "+",
    label: "شرکت فناور و نوآور",
    sub: "صنایع دانش‌بنیان با راهکارهای عملیاتی و تجاری‌شده",
  },
  {
    key: "investors",
    value: 20,
    suffix: "+",
    label: "سرمایه‌گذار",
    sub: "صندوق‌های جسورانه، فرشتگان کسب‌وکار و بازوهای CVC",
  },
  {
    key: "accelerators",
    value: 10,
    suffix: "+",
    label: "شتاب‌دهنده و مرکز نوآوری",
    sub: "مراکز رشد و توانمندسازی اکوسیستم استارتاپی کشور",
  },
  {
    key: "events",
    value: 10,
    suffix: "+",
    label: "رویداد",
    sub: "استیج‌ها، رقابت‌های استارتاپی، جشنواره‌ها و گردهمایی‌های تخصصی",
  },
];

export const ExpressSection: React.FC = () => {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = rootRef.current;
    if (!root) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      // انیمیشن ورود عنوان و عناصر بخش
      gsap.from(".express-anim", {
        opacity: 0,
        y: 30,
        stagger: 0.1,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: root,
          start: "top 78%",
          once: true,
        },
      });

      // انیمیشن شمارش معکوس/صعودی ارقام رسمی
      root.querySelectorAll<HTMLElement>("[data-counter]").forEach((el) => {
        const target = Number(el.dataset.target);
        const suffix = el.dataset.suffix || "";
        const proxy = { val: reduce ? target : 0 };

        const updateText = () => {
          el.textContent = Math.round(proxy.val).toLocaleString("fa-IR") + suffix;
        };

        updateText();

        if (!reduce) {
          gsap.to(proxy, {
            val: target,
            duration: 2.4,
            ease: "power3.out",
            onUpdate: updateText,
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              once: true,
            },
          });
        }
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="express"
      ref={rootRef}
      className="relative overflow-hidden bg-[#023d5b] px-5 py-28 text-white sm:px-10 lg:py-36"
    >
      {/* پترن هندسی وکتوری برندبوک در پس‌زمینه با شفافیت کنترل‌شده */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07] select-none"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 1200 800"
          className="h-full w-full object-cover"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.2"
        >
          <g strokeOpacity="0.4">
            <line x1="0" y1="100" x2="1200" y2="700" />
            <line x1="0" y1="300" x2="1200" y2="900" />
            <line x1="1200" y1="50" x2="0" y2="650" />
            <line x1="1200" y1="250" x2="0" y2="850" />
          </g>
          <polygon
            points="900,150 1020,150 1080,254 1020,358 900,358 840,254"
            strokeOpacity="0.6"
          />
          <polygon
            points="250,450 370,450 430,554 370,658 250,658 190,554"
            strokeOpacity="0.6"
          />
        </svg>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* ۱. سرتیتر شاخص و اعلان مقیاس رویداد اینوتکس‌اکسپرس */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="express-anim inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-[color:var(--yellow)] animate-pulse" />
              <span className="label text-xs font-bold tracking-widest text-white" dir="ltr">
                INOTEX EXPRESS · 2026
              </span>
              <span className="h-3 w-px bg-white/20" />
              <span className="fa text-xs font-medium text-white/80">
                ویژه‌برنامه شتاب‌یافته اکوسیستم
              </span>
            </div>

            <h2 className="express-anim display fa mt-6 text-[clamp(2.8rem,7vw,6.5rem)] font-extrabold tracking-tight leading-[1.08] text-white">
              اینوتکس‌<span className="text-[color:var(--yellow)]">اکسپرس</span>
            </h2>

            <p className="express-anim fa fa-body mt-4 max-w-2xl text-base leading-8 text-white/80 sm:text-lg">
              رویدادی متمرکز بر جلسات بی‌واسطه تجاری، پیوند شتاب‌یافته ایده به سرمایه و معرفی آخرین دستاوردهای فناوری کشور با مقیاسی خیره‌کننده.
            </p>
          </div>

          {/* ۲. کادر تقویم و زمان‌بندی رسمی (۱۱ الی ۱۴ شهریور ۱۴۰۵) */}
          <div className="express-anim flex flex-col gap-3 rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-xl sm:flex-row sm:items-center sm:gap-6">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[color:var(--yellow)]/15 text-[color:var(--yellow)]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div>
                <span className="label text-[10px] !text-white/60 block font-mono" dir="ltr">EVENT DATE</span>
                <span className="fa text-base font-extrabold text-white sm:text-lg">
                  ۱۱ الی ۱۴ شهریور ۱۴۰۵
                </span>
              </div>
            </div>

            <div className="hidden h-10 w-px bg-white/15 sm:block" />

            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[color:var(--teal)]/20 text-[color:var(--teal)]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div>
                <span className="label text-[10px] !text-white/60 block font-mono" dir="ltr">HOURS</span>
                <span className="fa text-base font-extrabold text-white sm:text-lg">
                  ساعت ۱۴ الی ۲۰
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ۳. دو کانون توجه شاخص (Hero Anchors): ۳۰,۰۰۰ بازدیدکننده و ۴۰۰ جلسه تجاری */}
        <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* کانون اول: +۳۰,۰۰۰ بازدیدکننده */}
          <div className="express-anim relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-white/12 to-white/5 p-8 sm:p-10 backdrop-blur-xl lg:col-span-7">
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold text-white/90">
                  <span className="h-2 w-2 rounded-full bg-[color:var(--yellow)]" />
                  <span className="fa">مقیاس بی‌سابقه جامعه نوآوری</span>
                </div>
                <div className="mt-6 flex items-baseline gap-2">
                  <span
                    className="display fa text-[clamp(3.5rem,7.5vw,6rem)] font-extrabold text-white tabular-nums tracking-tight drop-shadow-sm"
                    data-counter
                    data-target={STATS_HERO[0].value}
                    data-suffix={STATS_HERO[0].suffix}
                  >
                    +{STATS_HERO[0].value.toLocaleString("fa-IR")}
                  </span>
                </div>
                <h3 className="fa text-xl font-extrabold text-white sm:text-2xl mt-2">
                  {STATS_HERO[0].label}
                </h3>
                <p className="fa fa-body mt-3 max-w-lg text-sm leading-7 text-white/80 sm:text-base">
                  {STATS_HERO[0].sub}
                </p>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/15 pt-5 text-xs text-white/70">
                <span>• حضور فعالان زیست‌بوم از سراسر ایران</span>
                <span>• گردهمایی هیئت‌های تجاری بین‌المللی</span>
              </div>
            </div>

            {/* نشان نوری انتزاعی در پس‌زمینه کارت */}
            <div
              className="pointer-events-none absolute -bottom-16 -end-16 h-64 w-64 rounded-full bg-[color:var(--yellow)]/10 blur-3xl"
              aria-hidden="true"
            />
          </div>

          {/* کانون دوم (چیدمان ویژه جلسات تجاری): +۴۰۰ جلسه تجاری */}
          <div className="express-anim relative overflow-hidden rounded-3xl border border-[color:var(--teal)]/40 bg-gradient-to-br from-[#00956e]/25 to-white/5 p-8 sm:p-10 backdrop-blur-xl lg:col-span-5">
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--teal)]/40 bg-[color:var(--teal)]/20 px-3 py-1 text-xs font-bold text-[color:var(--teal)]">
                  <span className="h-2 w-2 rounded-full bg-[color:var(--teal)] animate-pulse" />
                  <span className="fa">اتاق مذاکرات اختصاصی B2B</span>
                </div>
                <div className="mt-6 flex items-baseline gap-2">
                  <span
                    className="display fa text-[clamp(3.5rem,7.5vw,6rem)] font-extrabold text-[color:var(--yellow)] tabular-nums tracking-tight drop-shadow-sm"
                    data-counter
                    data-target={STATS_HERO[1].value}
                    data-suffix={STATS_HERO[1].suffix}
                  >
                    +{STATS_HERO[1].value.toLocaleString("fa-IR")}
                  </span>
                </div>
                <h3 className="fa text-xl font-extrabold text-white sm:text-2xl mt-2">
                  {STATS_HERO[1].label}
                </h3>
                <p className="fa fa-body mt-3 text-sm leading-7 text-white/80 sm:text-base">
                  {STATS_HERO[1].sub}
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-2 pt-4">
                <span className="rounded-lg border border-white/15 bg-white/10 px-2.5 py-1 text-xs font-bold text-white/90 fa">
                  کافه سرمایه
                </span>
                <span className="rounded-lg border border-white/15 bg-white/10 px-2.5 py-1 text-xs font-bold text-white/90 fa">
                  ریورس پیچ صنعتی
                </span>
                <span className="rounded-lg border border-white/15 bg-white/10 px-2.5 py-1 text-xs font-bold text-white/90 fa">
                  قراردادهای راهبردی
                </span>
              </div>
            </div>

            {/* نشان نوری انتزاعی فیروزه‌ای */}
            <div
              className="pointer-events-none absolute -bottom-16 -end-16 h-64 w-64 rounded-full bg-[color:var(--teal)]/20 blur-3xl"
              aria-hidden="true"
            />
          </div>
        </div>

        {/* ۴. گرید پنج‌گانه ارکان تکمیلی رویداد */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {STATS_PILLARS.map((s, idx) => (
            <div
              key={s.key}
              className="express-anim group relative flex flex-col justify-between rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-md transition-all duration-300 hover:border-white/35 hover:bg-white/10"
            >
              <div>
                <span className="label !text-white/40 block mb-2 font-mono text-[10px]" dir="ltr">
                  PILLAR 0{idx + 1}
                </span>
                <div className="flex items-baseline gap-1">
                  <span
                    className="display fa text-3xl font-extrabold text-white tabular-nums sm:text-4xl"
                    data-counter
                    data-target={s.value}
                    data-suffix={s.suffix}
                  >
                    +{s.value.toLocaleString("fa-IR")}
                  </span>
                </div>
                <h4 className="fa mt-2 text-sm font-bold text-white transition-colors group-hover:text-[color:var(--yellow)] sm:text-base">
                  {s.label}
                </h4>
              </div>
              <p className="fa fa-body mt-3 text-xs leading-5 text-white/70 line-clamp-2">
                {s.sub}
              </p>
            </div>
          ))}
        </div>

        {/* ۵. نوار فراخوان پیش‌ثبت‌نام اینوتکس‌اکسپرس */}
        <div className="express-anim mt-16 flex flex-col items-center justify-between gap-6 rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-md sm:flex-row sm:p-8">
          <div>
            <h4 className="fa text-lg font-bold text-white sm:text-xl">
              آماده حضور در اینوتکس‌اکسپرس ۱۴۰۵ هستید؟
            </h4>
            <p className="fa text-xs text-white/75 sm:text-sm mt-1">
              پیش‌ثبت‌نام هم‌اکنون برای استارتاپ‌ها، شرکت‌های فناور و سرمایه‌گذاران فعال است.
            </p>
          </div>
          <a
            href="#register"
            className="pill pill-solid shrink-0 !bg-[color:var(--yellow)] !text-[#0a1a2b] font-extrabold hover:brightness-105"
          >
            رزرو غرفه و پیش‌ثبت‌نام
            <span aria-hidden="true">←</span>
          </a>
        </div>
      </div>
    </section>
  );
};
