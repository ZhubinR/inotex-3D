"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { SceneState } from "@/lib/SceneState";

interface Props {
  /** مسیر فایل کات‌اوت شفاف (PNG یا WebP با کانال آلفا) */
  src: string;
  alt?: string;
  /** کلاس‌های موقعیت‌دهی مطلق و ابعاد */
  className?: string;
  rotate?: number;
  /** شدت تأثیر پارالکس ماوس بر حسب پیکسل */
  depth?: number;
  delay?: number;
}

/**
 * المان بصری کات‌اوت شناور با فیزیک پارالکس ماوس
 * - بهینه‌سازی شده با Next.js Image جهت فشرده‌سازی با حفظ کانال آلفا
 * - رفتار منعطف در صورت عدم وجود فایل در مخزن (پنهان‌سازی خودکار در محیط پروداکشن)
 * - رعایت استاندارد دسترسی‌پذیری کاهش حرکت (prefers-reduced-motion)
 */
export const Sticker: React.FC<Props> = ({
  src,
  alt = "نشان المان رویداد اینوتکس",
  className = "",
  rotate = 0,
  depth = 24,
  delay = 1.8,
}) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const floatRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    const float = floatRef.current;
    if (!wrap || !float || failed) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const bob = gsap.to(float, {
      y: -14,
      duration: 3 + Math.random() * 2,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });

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
    return null;
  }

  return (
    <div ref={wrapRef} className={`pointer-events-none ${className}`}>
      <div ref={floatRef}>
        <Image
          src={src}
          alt={alt}
          width={400}
          height={400}
          priority
          quality={100}
          sizes="(max-width: 1200px) 15vw, 200px"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`sticker-img transition-opacity duration-700 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          style={{ ["--rot" as string]: `${rotate}deg`, animationDelay: `${delay}s` }}
        />
      </div>
    </div>
  );
};
