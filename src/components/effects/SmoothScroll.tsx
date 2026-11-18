"use client";

import React, { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SceneState } from "@/lib/SceneState";

export const SmoothScroll: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // بعد از لود کامل (عکس‌ها/فونت) موقعیت‌ها دوباره محاسبه شود
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return () => window.removeEventListener("load", onLoad);

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      anchors: true, // لینک‌های #section با اسکرول نرم می‌روند
    });

    // لودر هنوز روی صفحه است؟ تا پایانش اسکرول متوقف بماند (page.tsx بعد از لودر start می‌کند)
    if (document.documentElement.classList.contains("is-loading")) lenis.stop();

    SceneState.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const ticker = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);

    return () => {
      window.removeEventListener("load", onLoad);
      gsap.ticker.remove(ticker);
      SceneState.lenis = null;
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
};