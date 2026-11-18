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
      <p className="tag label mb-6 self-start">03 — Impact</p>
      <h2 className="display fa text-[clamp(2rem,4.5vw,4.2rem)] lg:w-[52%]">
        هر دوره، یک پله بالاتر.
      </h2>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:w-[52%]">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="stat rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-md transition-all duration-300 hover:border-white/30 hover:bg-white/[0.14] shadow-sm"
            data-value={s.value}
            data-suffix={s.suffix}
          >
            <div className="stat-num display fa text-[clamp(2.2rem,4.4vw,3.8rem)] text-white font-extrabold">
              {s.value.toLocaleString("fa-IR")}{s.suffix}
            </div>
            <h3 className="fa mt-3 text-base font-bold text-white sm:text-lg">{s.label}</h3>
            <p className="fa fa-body mt-1 text-xs leading-5 text-white/85 sm:text-sm">{s.sub}</p>
          </div>
        ))}
      </div>
    </section>
  );
};