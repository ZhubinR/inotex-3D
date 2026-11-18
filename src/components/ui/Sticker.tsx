"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { SceneState } from "@/lib/SceneState";

interface Props {
  /** بهتر است WebP/PNG با پس‌زمینه‌ی شفاف (کات‌اوت) باشد */
  src: string;
  alt?: string;
  /** کلاس‌های موقعیت‌دهی (absolute + اندازه). برای مخفی شدن روی موبایل: "hidden lg:block" */
  className?: string;
  rotate?: number;
  /** شدت پارالکس ماوس بر حسب px */
  depth?: number;
  delay?: number;
}

/** عکس کات‌اوت شناور با پارالکس ماوس. اگر فایل نباشد، در production چیزی نشان نمی‌دهد. */
export const Sticker: React.FC<Props> = ({ src, alt = "", className = "", rotate = 0, depth = 24, delay = 1.8 }) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const floatRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    const float = floatRef.current;
    if (!wrap || !float || failed) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const bob = gsap.to(float, { y: -14, duration: 3 + Math.random() * 2, ease: "sine.inOut", yoyo: true, repeat: -1 });
    const xTo = gsap.quickTo(wrap, "x", { duration: 0.9, ease: "power3" });
    const yTo = gsap.quickTo(wrap, "y", { duration: 0.9, ease: "power3" });
    const move = () => {
      xTo(SceneState.mouseX * depth);
      yTo(SceneState.mouseY * depth);
    };
    gsap.ticker.add(move);
    return () => {
      bob.kill();
      gsap.ticker.remove(move);
    };
  }, [failed, depth]);

  if (failed) {
    if (process.env.NODE_ENV !== "development") return null;
    return (
      <div
        dir="ltr"
        className={`flex items-center justify-center rounded-xl border border-dashed border-current/40 p-2 text-center font-mono text-[10px] opacity-70 ${className}`}
      >
        sticker: {src}
      </div>
    );
  }

  return (
    <div ref={wrapRef} className={`pointer-events-none ${className}`}>
      <div ref={floatRef}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          onError={() => setFailed(true)}
          className="sticker-img"
          style={{ ["--rot" as string]: `${rotate}deg`, animationDelay: `${delay}s` }}
        />
      </div>
    </div>
  );
};