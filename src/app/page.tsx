"use client";

import React, { useCallback, useState } from "react";
import { SmoothScroll } from "@/components/effects/SmoothScroll";
import { Cursor } from "@/components/effects/Cursor";
import { Backdrop } from "@/components/effects/Backdrop";
import { Grain } from "@/components/effects/Grain";
import { InotexCanvas } from "@/components/3d/InotexCanvas";
import { Loader } from "@/components/ui/Loader";
import { Navbar } from "@/components/navigation/Navbar";
import { HeroSection } from "@/components/sections/HeroSection";
import { ManifestoSection } from "@/components/sections/ManifestoSection";
import { EcosystemSection } from "@/components/sections/EcosystemSection";
import { StatsSection } from "@/components/sections/StatsSection";
import { GallerySection } from "@/components/sections/GallerySection";
import { CountdownSection } from "@/components/sections/CountdownSection";
import { Footer } from "@/components/layout/Footer";
import { SceneState } from "@/lib/SceneState";

export default function Home() {
  const [ready, setReady] = useState(false);
  const onLoaded = useCallback(() => {
    SceneState.lenis?.start();
    setReady(true);
  }, []);

  return (
    <SmoothScroll>
      <Loader onDone={onLoaded} />
      <Cursor />
      <Grain />
      <Backdrop />
      <InotexCanvas ready={ready} />
      <Navbar ready={ready} />

      {/* ترتیب sectionهای data-chapter باید با KEYS در InotexCanvas یکی باشد */}
      <main className="relative z-10">
        <HeroSection ready={ready} />
        <ManifestoSection />
        <EcosystemSection />
        <StatsSection />
        <GallerySection />
        <CountdownSection />
      </main>
      <Footer />
    </SmoothScroll>
  );
}