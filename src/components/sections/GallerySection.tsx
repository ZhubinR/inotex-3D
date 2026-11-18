"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ImagePlaceholder, MediaRatio } from "../ui/ImagePlaceholder";

interface GalleryItem {
  src: string;
  title: string;
  category: string;
  sub: string;
  ratio: MediaRatio;
  tone: "blue" | "teal" | "yellow";
  span: string;
  offset?: string;
  sizes: string;
  video?: string;
}

const ITEMS: GalleryItem[] = [
  {
    src: "/images/gallery/exhibition-hall.jpg",
    title: "سالن‌های نمایشگاهی و غرفه‌های نوآوری",
    category: "نمایشگاه و پاویون‌ها",
    sub: "غرفه‌های شرکت‌های دانش‌بنیان، شتاب‌دهنده‌ها و صنایع پیشرو در محوطه مسقف و فضاهای باز پردیس",
    ratio: "16/10",
    tone: "blue",
    span: "lg:col-span-8",
    sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 1920px",
  },
  {
    src: "/images/gallery/ai-panel.jpg",
    title: "پنل‌های تخصصی هوش مصنوعی و اقتصاد دیجیتال",
    category: "استیج گفتگو",
    sub: "گفتگوی چهره‌های شاخص علمی و رهبران فناوری پیرامون مرزهای نوین تکنولوژی و آینده بازارها",
    ratio: "4/3",
    tone: "yellow",
    span: "lg:col-span-4",
    offset: "lg:mt-28",
    sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 45vw, 1200px",
  },
  {
    src: "/images/gallery/pitch-stage.jpg",
    title: "ارائه‌های نفس‌گیر اینوتکس پیچ",
    category: "نبرد استارتاپ‌ها",
    sub: "رقابت نهایی برترین تیم‌های نوپای کشور مقابل داوران سخت‌گیر و صندوق‌های سرمایه‌گذاری جسورانه",
    ratio: "4/3",
    tone: "teal",
    span: "lg:col-span-5",
    sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 1200px",
  },
  {
    src: "/images/gallery/international-delegates.jpg",
    title: "مذاکرات هیئت‌های تجاری بین‌المللی",
    category: "دیپلماسی فناوری",
    sub: "دیدارها و رایزنی‌های B2B جهت صادرات محصولات فناورانه، جذب سرمایه خارجی و توسعه بازارهای منطقه‌ای",
    ratio: "4/3",
    tone: "blue",
    span: "lg:col-span-4 lg:col-start-9",
    offset: "lg:mt-20",
    sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 45vw, 1200px",
  },
  {
    src: "/images/gallery/inonight-atmosphere.jpg",
    title: "شب‌های اینونایت زیر آسمان پارک فناوری پردیس",
    category: "شبکه‌سازی شبانه",
    sub: "نشست شبانه کارآفرینان در فضای باز با برنامه‌های تعاملی، گفتگوی آزاد و تبادل بی‌واسطه تجارب شکست و پیروزی",
    ratio: "16/9",
    tone: "yellow",
    span: "lg:col-span-12",
    sizes: "(max-width: 768px) 100vw, 1920px",
  },
  {
    src: "/images/gallery/workshops.jpg",
    title: "کارگاه‌ها و مسترکلاس‌های فنی و محصولی",
    category: "انتقال دانش فنی",
    sub: "آموزش‌های عمیق و کاربردی در زمینه مقیاس‌پذیری نرم‌افزار، استراتژی محصول و هدایت تیم‌های چابک",
    ratio: "4/3",
    tone: "teal",
    span: "lg:col-span-5 lg:col-start-2",
    sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 1200px",
  },
];

const TONE_BADGES = {
  blue: "bg-[color:var(--blue)]/12 text-[color:var(--blue)] border-[color:var(--blue)]/25",
  teal: "bg-[color:var(--teal)]/12 text-[color:var(--teal)] border-[color:var(--teal)]/25",
  yellow: "bg-[color:var(--yellow)]/18 text-[#9b6800] dark:text-[color:var(--yellow)] border-[color:var(--yellow)]/30",
};

export const GallerySection: React.FC = () => {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = rootRef.current;
    if (!root) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const ctx = gsap.context(() => {
      root.querySelectorAll<HTMLElement>(".g-item").forEach((item) => {
        // انیمیشن ورود روان کارت ژورنالی
        gsap.from(item, {
          opacity: 0,
          y: 32,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: item,
            start: "top 88%",
            once: true,
          },
        });

        // پارالکس ظریف مدیا در داخل قاب هنگام اسکرول
        const media = item.querySelector("[data-parallax]");
        if (media) {
          gsap.fromTo(
            media,
            { yPercent: -5 },
            {
              yPercent: 5,
              ease: "none",
              scrollTrigger: {
                trigger: item,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.5,
              },
            }
          );
        }
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="experience"
      ref={rootRef}
      data-chapter
      data-theme="light"
      className="px-5 py-32 sm:px-10"
    >
      {/* سرتیتر ژورنالی بخش گالری */}
      <div className="max-w-3xl">
        <p className="tag label mb-6">04 — Exhibition Experience</p>
        <h2 className="display fa text-[clamp(2.4rem,5.5vw,5rem)] font-extrabold tracking-tight">
          چهار روز شور، انرژی و <span className="text-[color:var(--teal)]">هم‌افزایی</span>.
        </h2>
        <p className="fa fa-body mt-4 text-base leading-8 text-[color:var(--muted)] sm:text-lg">
          روایت مستند و بصری از سالن‌های فناوری، استیج‌های گفتگو، نبردهای استارتاپی و نشست‌های تجاری در قلب پارک فناوری پردیس.
        </p>
      </div>

      {/* گرید ۱۲ ستونه عکاسی ژورنالی با چیدمان نامتقارن و تنوع در نسبت ابعاد */}
      <div className="mt-20 grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-12">
        {ITEMS.map((it, idx) => (
          <figure
            key={it.src}
            className={`g-item group ${it.span} ${it.offset ?? ""}`}
          >
            {/* قاب عکس ژورنالی شیشه‌ای با افکت‌های نوری و هاور دقیق */}
            <div className="editorial-card relative overflow-hidden rounded-2xl p-2 shadow-sm transition-all duration-500 group-hover:border-[color:var(--accent)] group-hover:shadow-xl">
              <div className="relative overflow-hidden rounded-xl">
                <ImagePlaceholder
                  src={it.src}
                  alt={it.title}
                  tone={it.tone}
                  ratio={it.ratio}
                  sizes={it.sizes}
                  priority
                  quality={95}
                  className="transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>
            </div>

            {/* زیرنویس و کپشن ژورنالی دقیق با تایپوگرافی خوانا */}
            <figcaption className="mt-4 flex flex-col gap-2 px-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="label text-[10px] !text-[color:var(--muted)] font-mono">
                  SCENE 0{idx + 1}
                </span>
                <span className="h-1 w-1 rounded-full bg-[color:var(--line)]" />
                <span
                  className={`rounded-md border px-2 py-0.5 text-[10px] font-bold fa ${
                    TONE_BADGES[it.tone]
                  }`}
                >
                  {it.category}
                </span>
              </div>

              <h3 className="fa text-base font-bold text-[color:var(--fg)] transition-colors group-hover:text-[color:var(--accent)] sm:text-lg">
                {it.title}
              </h3>

              <p className="fa fa-body text-xs leading-6 text-[color:var(--muted)] sm:text-sm">
                {it.sub}
              </p>
            </figcaption>
          </figure>
        ))}
      </div>

      {/* نوار مارکی متحرک برند اینوتکس */}
      <div className="-mx-5 mt-32 overflow-hidden sm:-mx-10" aria-hidden="true">
        <div className="marquee">
          {[0, 1].map((k) => (
            <span key={k} className="marquee-text pe-12">
              STAGE · CAPITAL CAFÉ · PITCH · REVERSE PITCH · INONIGHT · JOB STATION ·&nbsp;
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};
