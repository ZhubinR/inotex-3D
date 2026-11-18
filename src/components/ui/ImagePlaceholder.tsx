"use client";

import React, { useEffect, useRef, useState } from "react";

type Ratio = "16/9" | "4/3" | "1/1" | "21/9" | "3/4" | "4/5";

interface Props {
  /** مسیر عکس داخل public، مثلاً /images/gallery/ai-panel.jpg */
  src: string;
  alt: string;
  /** اختیاری: ویدیوی کوتاه بی‌صدا و لوپ (mp4/webm). اگر نبود، عکس نمایش داده می‌شود. */
  video?: string;
  ratio?: Ratio;
  tone?: "blue" | "teal" | "yellow";
  className?: string;
}

const TONES = {
  blue: "#385dae",
  teal: "#00956e",
  yellow: "#ffb81d",
};

/**
 * قاب تصویر/ویدیو: اگر فایل وجود داشته باشد نمایش می‌دهد، وگرنه یک پس‌زمینه‌ی برندی با هگزاگون.
 * (فقط در حالت dev نام فایل مورد انتظار دیده می‌شود.)
 */
export const ImagePlaceholder: React.FC<Props> = ({ src, alt, video, ratio = "16/9", tone = "blue", className = "" }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const color = TONES[tone];
  const showVideo = !!video && !videoFailed;

  // اگر فایل قبل از hydrate شدن React خطا داده باشد، onError صدا زده نمی‌شود؛ اینجا دوباره بررسی می‌کنیم
  useEffect(() => {
    const v = videoRef.current;
    if (v && (v.error || v.networkState === HTMLMediaElement.NETWORK_NO_SOURCE)) setVideoFailed(true);
    const im = imgRef.current;
    if (im && im.complete && im.naturalWidth === 0) setImgFailed(true);
  }, [showVideo]);

  return (
    <div
      className={`frame-cut relative overflow-hidden ${className}`}
      style={{ aspectRatio: ratio.replace("/", " / "), background: `linear-gradient(135deg, ${color} 0%, ${tone === "yellow" ? "#c98a00" : "#023d5b"} 100%)` }}
    >
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
          onError={() => setVideoFailed(true)}
          data-parallax
          className="absolute inset-0 h-[115%] w-full object-cover"
        />
      ) : !imgFailed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setImgFailed(true)}
          data-parallax
          className="absolute inset-0 h-[115%] w-full object-cover"
        />
      ) : (
        // جایگزین برندی: دو شش‌ضلعی هم‌پوشان (کاور برندبوک) + مهره‌ی «O» + سه‌شش‌ضلعی «Technology»
        <svg viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" fill="none" aria-hidden="true">
          <g stroke="#fff" strokeOpacity="0.35" strokeWidth="0.5">
            <polygon points="104,2 128,2 140,23 128,44 104,44 92,23" />
            <polygon points="62,34 94,34 110,62 94,90 62,90 46,62" />
          </g>
          <polygon points="62,34 94,34 110,62 94,90 62,90 46,62" fill="#fff" fillOpacity="0.07" />
          <path fillRule="evenodd" fill="#fff" fillOpacity="0.9" d="M78 44 L90 51 V65 L78 72 L66 65 V51 Z M78 52.5 L84 56 V60 L78 63.5 L72 60 V56 Z" />
          <g stroke="#fff" strokeOpacity="0.5" strokeWidth="0.5">
            <polygon points="16,60 24,60 28,67 24,74 16,74 12,67" />
            <polygon points="24,48 32,48 36,55 32,62 24,62 20,55" />
            <polygon points="24,72 32,72 36,79 32,86 24,86 20,79" />
          </g>
        </svg>
      )}

      {process.env.NODE_ENV === "development" && (imgFailed || (video && videoFailed)) && (
        <span className="absolute bottom-3 right-3 rounded bg-black/40 px-2 py-1 font-mono text-[10px] text-white/80" dir="ltr">
          {video && videoFailed ? `${video} | ` : ""}
          {imgFailed ? src : ""}
        </span>
      )}
    </div>
  );
};