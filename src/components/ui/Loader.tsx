"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { LogoMark } from "./LogoPlaceholder";

/** لودر: لوگوی رسمی با پاک‌شدن پرده از چپ به راست (خوانش لاتین)، شمارنده و بالا رفتن پرده */
export const Loader: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    document.documentElement.classList.add("is-loading");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const counter = { v: 0 };

    const ctx = gsap.context(() => {
      gsap.set(logoRef.current, { clipPath: "inset(0 100% 0 0)" });
      gsap.set(barRef.current, { scaleX: 0 });

      const tl = gsap.timeline({
        onComplete: () => {
          document.documentElement.classList.remove("is-loading");
          onDone();
        },
      });
      tl.to(counter, {
        v: 100,
        duration: reduce ? 0.2 : 1.6,
        ease: "power2.inOut",
        onUpdate: () => {
          if (counterRef.current) counterRef.current.textContent = Math.round(counter.v).toLocaleString("fa-IR");
        },
      })
        .to(logoRef.current, { clipPath: "inset(0 0% 0 0)", duration: reduce ? 0.2 : 1.6, ease: "power2.inOut" }, 0)
        .to(barRef.current, { scaleX: 1, duration: reduce ? 0.2 : 1.6, ease: "power2.inOut" }, 0)
        .to(rootRef.current, { yPercent: -100, duration: reduce ? 0.2 : 0.9, ease: "power4.inOut" }, "+=0.2");
    }, rootRef);

    return () => {
      ctx.revert();
      document.documentElement.classList.remove("is-loading");
    };
  }, [onDone]);

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[150] flex flex-col items-center justify-center gap-8 bg-[#f4f4f1] text-[#385dae]"
    >
      <div ref={logoRef}>
        <LogoMark height={64} className="max-w-[78vw]" />
      </div>
      <span className="relative block h-[2px] w-48 overflow-hidden bg-[#385dae]/15">
        <span ref={barRef} className="absolute inset-0 origin-left bg-[#ffb81d]" />
      </span>
      <span ref={counterRef} className="label !text-[#0a1a2b]">۰</span>
    </div>
  );
};
