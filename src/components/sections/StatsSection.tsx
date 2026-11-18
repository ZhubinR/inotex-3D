// src/components/sections/StatsSection.tsx
"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const STATS = [
  { value: 100000, suffix: "+", label: "بازدیدکننده حضوری و مجازی", sub: "از همه استان‌ها و شرکت‌کنندگان بین‌المللی" },
  { value: 450, suffix: "+", label: "استارتاپ و شرکت دانش‌بنیان", sub: "عرضه آخرین دستاوردهای فناوری" },
  { value: 150, suffix: "+", label: "سرمایه‌گذار و شتاب‌دهنده", sub: "صندوق‌های VC، فرشته‌ها و شرکت‌های بزرگ" },
  { value: 25, suffix: "+", label: "کشور مشارکت‌کننده", sub: "هیئت‌های تجاری، غرفه‌داران و سخنرانان" },
];

export const StatsSection: React.FC = () => {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = rootRef.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      root.querySelectorAll<HTMLElement>(".stat").forEach((el) => {
        const target = Number(el.dataset.value);
        const suffix = el.dataset.suffix ?? "";
        const num = el.querySelector<HTMLElement>(".stat-num")!;
        const obj = { v: reduce ? target : 0 };
        const render = () => {
          num.textContent = Math.round(obj.v).toLocaleString("fa-IR") + suffix;
        };
        render();
        gsap.to(obj, {
          v: target,
          duration: 2.2,
          ease: "power3.out",
          onUpdate: render,
          scrollTrigger: { trigger: el, start: "top 80%", once: true },
        });
        gsap.from(el, {
          opacity: 0,
          y: 32,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="stats"
      ref={rootRef}
      data-chapter
      data-theme="blue"
      className="flex min-h-[100svh] flex-col justify-center px-5 py-16 sm:px-10 lg:h-[100svh]"
    >
      <p className="tag label mb-6 self-start">03 — Impact & Scale</p>
      <h2 className="display fa text-[clamp(2.4rem,5vw,4.4rem)] font-extrabold lg:w-[54%]">
        هر دوره، <span className="text-[color:var(--yellow)]">یک پله بالاتر</span>.
      </h2>
      <p className="fa mt-4 max-w-lg text-base text-white/85 sm:text-lg">
        مقیاسی فراتر از یک نمایشگاه معمولی؛ نبض نوآوری، حجم ارتباطات و اثرگذاری پایدار در اقتصاد دانش‌بنیان.
      </p>

      {/* نمایشگاه داده‌های ژورنالی با خطوط معماری دقیق به جای کارت‌های معمولی داشبورد */}
      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:w-[54%]">
        {STATS.map((s, idx) => (
          <div
            key={s.label}
            className="stat group relative border-t border-white/20 pt-6 transition-all duration-300 hover:border-[color:var(--yellow)]"
            data-value={s.value}
            data-suffix={s.suffix}
          >
            {/* شناسه عددی ردیف */}
            <span className="label !text-white/40 block mb-2 font-mono">
              METRIC 0{idx + 1}
            </span>

            {/* رقم بزرگ با پیشوند/پسوند زرد رنگ */}
            <div className="flex items-baseline gap-1">
              <span className="stat-num display fa text-[clamp(2.6rem,4.8vw,4.2rem)] font-extrabold text-white tabular-nums tracking-tight">
                {s.value.toLocaleString("fa-IR")}{s.suffix}
              </span>
            </div>

            <h3 className="fa mt-3 text-lg font-bold text-white transition-colors group-hover:text-[color:var(--yellow)]">
              {s.label}
            </h3>
            <p className="fa fa-body mt-2 text-xs leading-6 text-white/80 sm:text-sm">
              {s.sub}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};