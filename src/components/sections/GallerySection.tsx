"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ImagePlaceholder } from "../ui/ImagePlaceholder";

type Item = {
  src: string;
  title: string;
  sub: string;
  ratio: "16/9" | "4/3" | "1/1" | "21/9" | "3/4";
  tone: "blue" | "teal" | "yellow";
  span: string; // کلاس ستون در گرید ۱۲ستونه
  offset?: string;
  video?: string;
};

const ITEMS: Item[] = [
  { src: "/images/gallery/exhibition-hall.jpg", title: "سالن‌های نمایشگاهی", sub: "غرفه‌های شرکت‌های دانش‌بنیان در محوطه مسقف پردیس", ratio: "16/9", tone: "blue", span: "lg:col-span-8", video: "/videos/exhibition-hall.mp4" },
  { src: "/images/gallery/ai-panel.jpg", title: "پنل‌های هوش مصنوعی و اقتصاد دیجیتال", sub: "گفتگو با چهره‌های شاخص فناوری", ratio: "4/3", tone: "yellow", span: "lg:col-span-4", offset: "lg:mt-32" },
  { src: "/images/gallery/pitch-stage.jpg", title: "ارائه‌های اینوتکس پیچ", sub: "استارتاپ‌ها در حضور داوران و صندوق‌ها", ratio: "4/3", tone: "teal", span: "lg:col-span-5" },
  { src: "/images/gallery/international-delegates.jpg", title: "هیئت‌های بین‌المللی", sub: "مذاکرات صادرات فناوری و جذب سرمایه", ratio: "1/1", tone: "blue", span: "lg:col-span-4 lg:col-start-9", offset: "lg:mt-24" },
  { src: "/images/gallery/inonight-atmosphere.jpg", title: "شب‌های اینونایت", sub: "شبکه‌سازی، موسیقی زنده و تبادل ایده", ratio: "21/9", tone: "yellow", span: "lg:col-span-12", video: "/videos/inonight.mp4" },
  { src: "/images/gallery/workshops.jpg", title: "کارگاه‌ها و مسترکلاس‌ها", sub: "آموزش مهندسی، مقیاس‌پذیری و رهبری محصول", ratio: "1/1", tone: "teal", span: "lg:col-span-5 lg:col-start-2" },
];

export const GallerySection: React.FC = () => {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = rootRef.current;
    if (!root) return;
    const ctx = gsap.context(() => {
      root.querySelectorAll<HTMLElement>(".g-item").forEach((item) => {
        // ورود روان با شفافیت و حرکت عمودی نرم
        gsap.from(item, {
          opacity: 0,
          y: 36,
          duration: 0.95,
          ease: "power3.out",
          scrollTrigger: { trigger: item, start: "top 88%", once: true },
        });
        // پارالکس تصویر داخل قاب
        const img = item.querySelector("[data-parallax]");
        if (img) {
          gsap.fromTo(
            img,
            { yPercent: -5 },
            { yPercent: 5, ease: "none", scrollTrigger: { trigger: item, start: "top bottom", end: "bottom top", scrub: true } }
          );
        }
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="experience" ref={rootRef} data-chapter data-theme="light" className="px-5 py-32 sm:px-10">
      <p className="tag label mb-6">04 — Experience</p>
      <h2 className="display fa max-w-3xl text-[clamp(2rem,5vw,4.8rem)]">
        چهار روز شور، انرژی و هم‌افزایی.
      </h2>

      <div className="mt-20 grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-12">
        {ITEMS.map((it) => (
          <figure key={it.src} className={`g-item group ${it.span} ${it.offset ?? ""}`}>
            <div className="g-frame overflow-hidden rounded-xl border border-[color:var(--line)]/60 shadow-sm transition-all duration-300 group-hover:border-[color:var(--accent)] group-hover:shadow-md">
              <ImagePlaceholder
                src={it.src}
                video={it.video}
                alt={it.title}
                tone={it.tone}
                ratio={it.ratio}
                className="transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </div>
            <figcaption className="mt-4 flex flex-col gap-1.5">
              <span className="fa text-lg font-bold text-[color:var(--fg)]">{it.title}</span>
              <span className="fa fa-body text-sm leading-6 text-[color:var(--muted)]">{it.sub}</span>
            </figcaption>
          </figure>
        ))}
      </div>

      {/* مارکی توخالی: بافت و حرکت بین گالری و ثبت‌نام */}
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