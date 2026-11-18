"use client";

import React, { useEffect, useRef, useState } from "react";
import { SceneState, subscribeChapter } from "@/lib/SceneState";

/**
 * لایه‌ی ثابت پشت صحنه‌ی سه‌بعدی: پترن برند، گرادیان‌های نرم، الگوی هگزاگون و
 * عکس‌های تمام‌صفحه که فقط در فصل خودشان محو می‌شوند.
 * (چون پشت canvas است، نشان سه‌بعدی همیشه روی عکس دیده می‌شود.)
 */
const PHOTOS = [
  {
    chapter: 3, // آمار
    src: "/images/stats/crowd.jpg",
    base: "#385dae",
    img: { mixBlendMode: "luminosity" as const, opacity: 0.5, filter: "grayscale(1) contrast(1.1)" },
    overlay: "linear-gradient(to left, rgb(56 93 174 / 0.9) 20%, rgb(56 93 174 / 0.2))",
  },
  {
    chapter: 5, // ثبت‌نام
    src: "/images/register/inonight.jpg",
    base: "#023d5b",
    img: { opacity: 0.45 },
    overlay: "linear-gradient(to left, #023d5b 25%, rgb(2 61 91 / 0.35))",
  },
];

/** فصل‌هایی که پترن برند (صفحه‌ی آخر برندبوک) پشتشان دیده می‌شود، با رنگ‌بندی متناسب */
const PATTERN: Record<number, "blue" | "dark"> = { 3: "blue", 5: "dark" };

/**
 * پترن برندبوک (صفحه‌ی ۲۲): زمینه‌ی سرمه‌ای، باند سبز بالا-راست، باند آبی پایین-چپ
 * و چهار خط نازک سفید که لبه‌ی شش‌ضلعی‌های بزرگ‌اند. مختصات همان صفحه‌ی ۱۶۵۴×۱۱۶۹.
 */
const BrandPattern: React.FC<{ variant: "blue" | "dark" | null }> = ({ variant }) => (
  <svg
    className={`brand-pattern ${variant ? "is-on" : ""}`}
    data-variant={variant ?? "dark"}
    viewBox="0 0 1654 1169"
    preserveAspectRatio="xMidYMid slice"
    aria-hidden="true"
  >
    <rect className="bp-base" width="1654" height="1169" />
    <polygon className="bp-a" points="0,0 1654,0 1654,855 1124,35 0,35" />
    <polygon className="bp-b" points="0,310 505,1131 1654,1131 1654,1169 0,1169" />
    <polyline points="290,0 0,505" />
    <polyline points="0,550 355,1169" />
    <polyline points="1357,0 1654,515" />
    <polyline points="1654,545 1295,1169" />
  </svg>
);

export const Backdrop: React.FC = () => {
  const [chapter, setChapter] = useState(SceneState.chapter);
  const [failed, setFailed] = useState<Record<string, boolean>>({});

  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => subscribeChapter(setChapter), []);

  // اگر عکس قبل از hydrate شدن React خطا داده باشد، onError هرگز صدا زده نمی‌شود
  // و لایه‌ی تک‌رنگ عکس پترن برند را می‌پوشاند؛ اینجا خطاهای از قبل رخ‌داده را می‌گیریم.
  useEffect(() => {
    rootRef.current?.querySelectorAll<HTMLImageElement>("img[data-bg]").forEach((img) => {
      if (img.getAttribute("src") && img.complete && img.naturalWidth === 0) {
        const src = img.dataset.bg!;
        setFailed((f) => (f[src] ? f : { ...f, [src]: true }));
      }
    });
  }, []);

  return (
    <div ref={rootRef} className={`backdrop ${PATTERN[chapter] ? "has-pattern" : ""}`} aria-hidden="true">
      <BrandPattern variant={PATTERN[chapter] ?? null} />

      {PHOTOS.map((p) => {
        const active = chapter === p.chapter && !failed[p.src];
        // عکس تمام‌صفحه فقط یک فصل قبل از نمایش بارگذاری می‌شود (قبلاً همه از اول لود می‌شدند)
        const near = chapter >= p.chapter - 1;
        return (
          <div
            key={p.src}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: active ? 1 : 0, background: p.base }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={near ? p.src : undefined}
              data-bg={p.src}
              alt=""
              decoding="async"
              onError={() => setFailed((f) => ({ ...f, [p.src]: true }))}
              className="absolute inset-0 h-full w-full object-cover"
              style={p.img}
            />
            <div className="absolute inset-0" style={{ background: p.overlay }} />
          </div>
        );
      })}

      <div className="hex-bg" />
      <div className="blob blob-1" />
      <div className="blob blob-2" />

      {process.env.NODE_ENV === "development" &&
        PHOTOS.filter((p) => chapter === p.chapter && failed[p.src]).map((p) => (
          <span key={p.src} dir="ltr" className="absolute bottom-3 left-3 rounded bg-black/50 px-2 py-1 font-mono text-[10px] text-white/80">
            missing bg photo: {p.src}
          </span>
        ))}
    </div>
  );
};