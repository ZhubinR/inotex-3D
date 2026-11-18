// src/components/sections/EcosystemSection.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ImagePlaceholder } from "../ui/ImagePlaceholder";
import { SceneState } from "@/lib/SceneState";

const toFa = (n: number) => n.toLocaleString("fa-IR");

const TONE_HEX = {
  blue: "#385dae",
  yellow: "#ffb81d",
  teal: "#00956e",
} as const;

const PILLARS = [
  {
    id: "stage",
    title: "اینوتکس استیج",
    en: "INOTEX Stage",
    tagline: "تریبون ایده‌ها و گفتگوهای مرز فناوری",
    description:
      "بزرگ‌ترین صحنه تبادل نظر با سخنرانان ایران و جهان پیرامون هوش مصنوعی، بیوتکنولوژی، بلاک‌چین و ترندهای کلیدی آینده.",
    stat: "۴۰+ ساعت گفتگوی تخصصی",
    img: "/images/ecosystem-stage.jpg",
    alt: "صحنه اصلی سخنرانی‌ها و پنل‌های تخصصی اینوتکس استیج",
    tone: "blue" as const,
  },
  {
    id: "cafe",
    title: "کافه سرمایه",
    en: "Capital Café",
    tagline: "پیوند استارتاپ‌ها با سرمایه‌گذاران",
    description:
      "فضایی اختصاصی برای جلسات رودررو میان تیم‌های نوپا، سرمایه‌گذاران خطرپذیر و فرشتگان کسب‌وکار.",
    stat: "جلسات B2B روزانه",
    img: "/images/ecosystem-cafe.jpg",
    alt: "فضای جلسات مذاکره رودررو سرمایه‌گذاران و استارتاپ‌ها در کافه سرمایه",
    tone: "yellow" as const,
  },
  {
    id: "pitch",
    title: "اینوتکس پیچ",
    en: "INOTEX Pitch",
    tagline: "نبرد برترین استارتاپ‌های کشور",
    description:
      "رقابت سراسری از تورهای استانی تا فینال در پردیس؛ تیم‌ها طرح خود را مقابل داوران ارائه می‌کنند و جایزه می‌گیرند.",
    stat: "۵۰۰+ تیم متقاضی",
    img: "/images/ecosystem-pitch.jpg",
    alt: "ارائه طرح‌های کسب‌وکار در رقابت اینوتکس پیچ مقابل داوران",
    tone: "teal" as const,
  },
  {
    id: "reverse",
    title: "ریورس پیچ",
    en: "Reverse Pitch",
    tagline: "صنایع نیازهایشان را مطرح می‌کنند",
    description:
      "شرکت‌های بزرگ چالش‌ها و مسائل حل‌نشده‌ی خود را به شرکت‌های دانش‌بنیان و نخبگان ارائه می‌کنند.",
    stat: "+۵۰ تقاضای صنعتی",
    img: "/images/ecosystem-reverse.jpg",
    alt: "نشست ارائه چالش‌ها و تقاضاهای فناوری صنایع بزرگ در ریورس پیچ",
    tone: "blue" as const,
  },
  {
    id: "night",
    title: "اینونایت",
    en: "INONight",
    tagline: "شب‌های شبکه‌سازی زیر آسمان پردیس",
    description:
      "رویداد شبانه با برنامه‌های تعاملی، موسیقی و گفتگوی آزاد؛ جایی برای تجربه‌های شکست و پیروزی کارآفرینان.",
    stat: "شبکه‌سازی تا پاسی از شب",
    img: "/images/ecosystem-inonight.jpg",
    alt: "گردهمایی شبانه و تبادل تجربه کارآفرینان در رویداد اینونایت",
    tone: "yellow" as const,
  },
  {
    id: "talent",
    title: "ایستگاه کار و مشاوران",
    en: "Job Station",
    tagline: "سرمایه انسانی و کلینیک کسب‌وکار",
    description:
      "بستری برای کارجویان متخصص و کارفرمایان دانش‌بنیان، همراه با میزهای مشاوره حقوقی، مالیاتی و توسعه محصول.",
    stat: "+۱۰۰۰ فرصت شغلی",
    img: "/images/ecosystem-jobstation.jpg",
    alt: "بستر مصاحبه‌های استخدامی تخصصی و میزهای مشاوره در ایستگاه کار",
    tone: "teal" as const,
  },
];

export const EcosystemSection: React.FC = () => {
  const rootRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = rootRef.current;
    const header = headerRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      if (header) {
        ScrollTrigger.create({
          trigger: header,
          start: "top 60%",
          end: "bottom 50%",
          onToggle: (self) => {
            if (self.isActive) {
              SceneState.activePillar = -1;
              setActive(-1);
            }
          },
        });
      }

      root.querySelectorAll<HTMLElement>(".pillar-row").forEach((row, i) => {
        ScrollTrigger.create({
          trigger: row,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (self) => {
            if (self.isActive) {
              SceneState.activePillar = i;
              setActive(i);
            }
          },
        });
      });

      ScrollTrigger.create({
        trigger: root,
        start: "top 50%",
        end: "bottom 50%",
        onLeave: () => {
          SceneState.activePillar = -1;
          setActive(-1);
        },
        onLeaveBack: () => {
          SceneState.activePillar = -1;
          setActive(-1);
        },
      });
    }, root);

    return () => {
      ctx.revert();
      SceneState.activePillar = -1;
      SceneState.rowHover = -1;
    };
  }, []);

  return (
    <section
      id="pillars"
      ref={rootRef}
      data-chapter
      data-theme="light"
      className="relative px-5 sm:px-10"
    >
      {/* Full 100svh Ecosystem Header — Displays the Ecosystem Pyramid & Chain Lego Model */}
      <header
        ref={headerRef}
        className="flex min-h-[100svh] flex-col justify-center py-20 lg:h-[100svh] lg:w-[48%]"
      >
        <p className="tag label mb-6 self-start">02 — Ecosystem</p>
        <h2 className="display fa text-[clamp(2.4rem,5.2vw,4.8rem)] font-extrabold tracking-tight">
          زنجیره یکپارچه
          <br />
          <span className="text-[color:var(--blue)]">اکوسیستم نوآوری</span>.
        </h2>
        <p className="fa mt-6 max-w-lg text-base leading-8 text-[color:var(--muted)] sm:text-lg">
          از ایده‌های نوپا تا سرمایه‌گذاری خطرپذیر، تقاضای صنعتی و جذب استعداد؛ شش بخش کلیدی اینوتکس مانند حلقه‌های یک زنجیر به هم متصل‌اند.
        </p>

        {/* دسترسی سریع به ۶ بخش اکوسیستم */}
        <div className="mt-8 flex flex-wrap gap-2 pt-2">
          {PILLARS.map((p) => (
            <a
              key={p.id}
              href={`#${p.id}`}
              className="inline-flex items-center gap-2 rounded-full border border-[color:var(--line)] bg-[color:var(--card-bg)] px-3.5 py-1.5 text-xs font-bold text-[color:var(--fg)] backdrop-blur-md transition-all hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] hover:shadow-xs"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: TONE_HEX[p.tone] }}
                aria-hidden="true"
              />
              <span className="fa">{p.title}</span>
            </a>
          ))}
        </div>
      </header>

      {/* 6 Service Pillars — Each exactly 100svh on desktop so each service model fits its viewport */}
      <div>
        {PILLARS.map((p, i) => (
          <article
            key={p.id}
            id={p.id}
            className={`pillar-row scroll-mt-20 flex min-h-[100svh] flex-col justify-center py-12 transition-all duration-500 lg:h-[100svh] lg:w-[48%] ${
              active === i
                ? "border-s-2 border-[color:var(--accent)] ps-5 opacity-100"
                : "border-s-2 border-transparent ps-5 opacity-70 hover:opacity-95"
            }`}
            onMouseEnter={() => (SceneState.rowHover = i)}
            onMouseLeave={() => (SceneState.rowHover = -1)}
          >
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="inline-block h-3.5 w-3.5 shrink-0"
                style={{
                  background: TONE_HEX[p.tone],
                  clipPath:
                    "polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%)",
                }}
              />
              <span className="label font-bold !text-[color:var(--fg)]">
                {toFa(i + 1).padStart(2, "۰")}
              </span>
              <span className="label font-bold !text-[color:var(--muted)]" dir="ltr">
                {p.en}
              </span>
            </div>

            <h3 className="display fa mt-3 text-[clamp(2rem,4.2vw,3.6rem)] font-extrabold text-[color:var(--fg)]">
              {p.title}
            </h3>
            <p className="fa mt-2 text-base font-bold text-[color:var(--accent)] sm:text-lg">
              {p.tagline}
            </p>
            <p className="fa fa-body mt-3 max-w-lg text-sm leading-7 text-[color:var(--muted)] sm:text-base">
              {p.description}
            </p>

            <div className="mt-5 flex max-w-md items-center justify-between gap-4 border-t border-[color:var(--line)] pt-3.5">
              <span className="inline-flex items-center gap-2 rounded-lg border border-[color:var(--line)] bg-[color:var(--card-bg)] px-3 py-1.5 text-xs font-bold text-[color:var(--fg)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--teal)]" />
                <span className="fa">{p.stat}</span>
              </span>
              <a
                href="#register"
                className="fa text-xs font-bold text-[color:var(--accent)] transition-opacity hover:opacity-75 sm:text-sm"
              >
                اطلاعات حضور و ثبت‌نام ←
              </a>
            </div>

            <div className="group mt-5 max-w-md overflow-hidden rounded-xl border border-[color:var(--line)] bg-[color:var(--card-bg)] shadow-sm transition-all duration-300 hover:border-[color:var(--accent)] hover:shadow-md">
              <ImagePlaceholder
                src={p.img}
                alt={p.alt}
                tone={p.tone}
                priority
                ratio="16/9"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 1200px"
                quality={100}
                className="max-h-[26svh] transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};