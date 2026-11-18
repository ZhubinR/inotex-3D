"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { SceneState } from "@/lib/SceneState";

export const Cursor: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const el = ref.current;
    if (!el) return;

    const xTo = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3" });

    const move = (e: PointerEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      const hot = (e.target as HTMLElement | null)?.closest("a, button, input, [data-cursor]");
      el.classList.toggle("is-active", !!hot || SceneState.canvasHover);
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);

  return <div ref={ref} className="cursor-ring" aria-hidden="true" />;
};