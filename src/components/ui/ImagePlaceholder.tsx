// src/components/ui/ImagePlaceholder.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

export type MediaRatio =
  | "16/9"
  | "4/3"
  | "1/1"
  | "21/9"
  | "3/4"
  | "4/5"
  | "3/2"
  | "16/10";

interface Props {
  /** مسیر عکس داخل public، مثلاً /images/gallery/ai-panel.jpg */
  src: string;
  alt: string;
  /** اختیاری: ویدیوی کوتاه بی‌صدا و لوپ (mp4/webm). اگر نبود یا لود نشد، عکس نمایش داده می‌شود. */
  video?: string;
  ratio?: MediaRatio;
  tone?: "blue" | "teal" | "yellow";
  className?: string;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  unoptimized?: boolean;
}

const TONE_GRADIENTS = {
  blue: "linear-gradient(135deg, #1b3570 0%, #023d5b 100%)",
  teal: "linear-gradient(135deg, #005a42 0%, #012b20 100%)",
  yellow: "linear-gradient(135deg, #8a6200 0%, #3d2c00 100%)",
};

const TONE_ACCENTS = {
  blue: "#385dae",
  teal: "#00956e",
  yellow: "#ffb81d",
};

/**
 * کامپوننت با کیفیت بالا و بهینه‌سازی‌شده برای مدیا (تصویر، ویدیو و قاب معمارانه)
 * - بارگذاری فول‌رزولوشن با Next.js Image با کیفیت بالا (Quality 95)
 * - رفع کشیدگی و اعوجاج عمودی (حذف استرچ غیرطبیعی ۱۱۸٪)
 * - بدون افت کیفیت روی نمایشگرهای رتینا (Retina/4K Ready)
 * - حذف لایه‌های تیره و تاری تا شفافیت و کنتراست واقعی عکس‌ها حفظ شود
 */
export const ImagePlaceholder: React.FC<Props> = ({
  src,
  alt,
  video,
  ratio = "16/9",
  tone = "blue",
  className = "",
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 1600px",
  priority = false,
  quality = 95,
  unoptimized = false,
}) => {
  const [loaded, setLoaded] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const showVideo = !!video && !videoFailed;
  const gradient = TONE_GRADIENTS[tone];
  const accent = TONE_ACCENTS[tone];

  // مدیریت پخش ویدیو با IntersectionObserver و بررسی reduced-motion
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl || !showVideo) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      videoEl.pause();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoEl.play().catch(() => {});
          } else {
            videoEl.pause();
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(videoEl);
    return () => observer.disconnect();
  }, [showVideo]);

  // بررسی وضعیت خطای اولیه ویدیو
  useEffect(() => {
    const v = videoRef.current;
    if (v && (v.error || v.networkState === HTMLMediaElement.NETWORK_NO_SOURCE)) {
      setVideoFailed(true);
    }
  }, [showVideo]);

  const showMedia = (!showVideo && !imgFailed) || (showVideo && !videoFailed);

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden select-none ${className}`}
      style={{
        aspectRatio: ratio.replace("/", " / "),
        background: loaded ? "transparent" : gradient,
      }}
    >
      {/* شیمر متحرک فقط تا زمان بارگذاری اولیه تصویر */}
      {!loaded && !imgFailed && <div className="media-shimmer" aria-hidden="true" />}

      {/* ۱. پخش ویدیو در صورت معتبر بودن منبع ویدیو */}
      {showVideo ? (
        <video
          ref={videoRef}
          src={video}
          poster={imgFailed ? undefined : src}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onLoadedData={() => setLoaded(true)}
          onError={() => setVideoFailed(true)}
          data-parallax
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      ) : !imgFailed ? (
        /* ۲. تصویر فول‌رزولوشن کریستالی با Next.js Image */
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          quality={quality}
          unoptimized={unoptimized}
          onLoad={() => setLoaded(true)}
          onError={() => setImgFailed(true)}
          className={`object-cover h-full w-full transition-opacity duration-500 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      ) : null}

      {/* ۳. قاب معمارانه جایگزین برندی اینوتکس فقط در صورت عدم وجود کامل فایل */}
      {(!showMedia || imgFailed) && (
        <div className="absolute inset-0 flex flex-col justify-between p-4" aria-hidden="true">
          {/* لایه پس‌زمینه وکتوری مهندسی‌شده با خطوط ایزومتریک ۳۰° و ۶۰° برندبوک */}
          <svg
            viewBox="0 0 240 150"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 h-full w-full opacity-60"
            fill="none"
          >
            <g stroke="#ffffff" strokeOpacity="0.1" strokeWidth="0.5">
              <line x1="0" y1="20" x2="240" y2="140" />
              <line x1="0" y1="70" x2="240" y2="190" />
              <line x1="240" y1="10" x2="0" y2="130" />
              <line x1="240" y1="60" x2="0" y2="180" />
            </g>

            <g stroke="#ffffff" strokeOpacity="0.32" strokeWidth="0.8">
              <polygon points="160,8 196,8 214,39 196,70 160,70 142,39" />
              <polygon points="96,52 144,52 168,94 144,136 96,136 72,94" />
            </g>

            <polygon
              points="96,52 144,52 168,94 144,136 96,136 72,94"
              fill="#ffffff"
              fillOpacity="0.05"
            />

            <path
              fillRule="evenodd"
              fill="#ffffff"
              fillOpacity="0.85"
              d="M120 68 L138 78.5 V99.5 L120 110 L102 99.5 V78.5 Z M120 80.5 L129 85.8 V96.2 L120 101.5 L111 96.2 V85.8 Z"
            />

            <g stroke="#ffffff" strokeOpacity="0.45" strokeWidth="0.7">
              <polygon points="28,90 40,90 46,100 40,110 28,110 22,100" />
              <polygon points="40,72 52,72 58,82 52,92 40,92 34,82" />
              <polygon points="40,108 52,108 58,118 52,128 40,128 34,118" />
            </g>
          </svg>

          {/* نوار بالایی: برچسب آرشیو نمایشگاهی و مشخصات هندسی */}
          <div className="relative z-10 flex items-center justify-between text-[10px] text-white/70">
            <div className="flex items-center gap-1.5 font-mono">
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: accent }}
              />
              <span className="font-semibold tracking-wider">INOTEX ARCHIVE</span>
            </div>
            <span className="font-mono text-[9px] opacity-60">RATIO {ratio}</span>
          </div>

          {/* نوار پایینی: مختصات جغرافیایی پارک فناوری پردیس */}
          <div className="relative z-10 flex items-end justify-between text-[9px] font-mono text-white/60">
            <span>PARDIS TECH PARK · 35.748°N 51.815°E</span>
            {process.env.NODE_ENV === "development" && (
              <span
                dir="ltr"
                className="rounded bg-black/60 px-2 py-0.5 text-[9px] text-white/90 backdrop-blur-xs font-mono"
              >
                {imgFailed ? `missing: ${src}` : ""}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
