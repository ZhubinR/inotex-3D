// src/components/sections/ManifestoSection.tsx
"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LogoMark } from "../ui/LogoPlaceholder";

const DESCRIPTION =
  "جایی که استارتاپ‌ها، سرمایه‌گذاران خطرپذیر، شرکت‌های دانش‌بنیان و صنایع بزرگ در یک مسیر به هم می‌رسند؛ گفتگو می‌کنند، شبکه می‌سازند و قراردادهای راهبردی منعقد می‌کنند.";

const PARTNERS = [
  "معاونت علمی، فناوری و اقتصاد دانش‌بنیان ریاست جمهوری",
  "مرکز همکاری‌های تحول و پیشرفت ریاست جمهوری",
  "صندوق نوآوری و شکوفایی",
];

const HexCluster = () => (
  <svg
    width="44"
    height="44"
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polygon points="36,4 50,4 57,16 50,28 36,28 29,16" />
    <polygon points="14,20 28,20 35,32 28,44 14,44 7,32" />
    <polygon points="36,36 50,36 57,48 50,60 36,60 29,48" />
  </svg>
);

const StairsIcon = () => (
  <svg
    width="44"
    height="44"
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M6 56 V44 H20 V32 H34 V18 H48 V8 H58 V56 Z" />
  </svg>
);

export const ManifestoSection: React.FC = () => {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = rootRef.current;
    if (!root) return;
    const ctx = gsap.context(() => {
      gsap.from(".manifesto-anim", {
        opacity: 0,
        y: 28,
        stagger: 0.14,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: root,
          start: "top 72%",
          once: true,
        },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="manifesto"
      ref={rootRef}
      data-chapter
      data-theme="light"
      className="flex min-h-[100svh] flex-col justify-center px-5 py-20 sm:px-10 lg:h-[100svh]"
    >
      <div className="lg:w-[54%]">
        <p className="manifesto-anim tag label mb-6 self-start">01 — About INOTEX</p>

        {/* تیتر خوانا و رسا با کنتراست بالا */}
        <h2 className="manifesto-anim fa text-[clamp(2.1rem,3.8vw,3.6rem)] font-extrabold leading-[1.3] text-[color:var(--fg)]">
          اینوتکس، رویداد پیشروی منطقه برای فعالان{" "}
          <span className="text-[color:var(--blue)]">فناوری</span> و{" "}
          <span className="text-[color:var(--teal)]">نوآوری</span> است.
        </h2>

        {/* پاراگراف روان با ارتفاع خط استاندارد فارسی برای خوانایی حداکثری */}
        <p className="manifesto-anim fa fa-body mt-6 text-base text-[color:var(--muted)] sm:text-lg sm:leading-8">
          {DESCRIPTION}
        </p>

        {/* معادله برند: کارت شیشه‌ای با طراحی دقیق مهندسی */}
        <div
          className="manifesto-anim glass-panel mt-10 flex w-fit flex-wrap items-center gap-x-6 gap-y-4 rounded-2xl border border-[color:var(--line)]/60 px-7 py-5 text-[color:var(--fg)] shadow-sm"
          dir="ltr"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[color:var(--teal)]/10 text-[color:var(--teal)]">
              <HexCluster />
            </span>
            <span className="label text-[11px] font-bold">Technology</span>
          </div>
          <span className="text-2xl font-light text-[color:var(--muted)]">+</span>
          <div className="flex flex-col items-center gap-2">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[color:var(--yellow)]/15 text-[color:var(--yellow)]">
              <StairsIcon />
            </span>
            <span className="label text-[11px] font-bold">Development</span>
          </div>
          <span className="text-2xl font-light text-[color:var(--muted)]">=</span>
          <div className="flex flex-col items-center gap-2">
            <span className="flex h-11 items-center justify-center px-2">
              <LogoMark height={32} className="text-[color:var(--accent)]" />
            </span>
            <span className="label text-[11px] font-bold text-[color:var(--accent)]">INOTEX</span>
          </div>
        </div>

        {/* حامیان راهبردی */}
        <div className="manifesto-anim mt-10 border-t border-[color:var(--line)]/50 pt-6">
          <p className="fa text-xs font-bold text-[color:var(--muted)] mb-3">حامیان و همکاران راهبردی رویداد:</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {PARTNERS.map((p) => (
              <div
                key={p}
                className="editorial-card rounded-xl p-3.5 transition-all"
              >
                <p className="fa text-xs font-semibold leading-5 text-[color:var(--fg)]">
                  {p}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
