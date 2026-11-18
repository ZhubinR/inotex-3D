// src/lib/webglCapabilities.ts
import * as THREE from "three";

export type QualityTier = "high" | "standard" | "mobile";

export interface QualityConfig {
  tier: QualityTier;
  maxDpr: number;
  shadowMapSize: number;
  shadowMapType: THREE.ShadowMapType;
  directionalShadows: boolean;
  shardCount: number;
  shadowUpdateInterval: number; // Idle frame throttle for shadow updates
  antialias: boolean;
  powerPreference: WebGLPowerPreference;
  description: string;
}

/**
 * Multi-factor device capability detection:
 * Evaluates hardware concurrency, touch capabilities, device memory, viewport,
 * and WebGL unmasked GPU renderer string. Does NOT rely solely on User-Agent.
 */
export function detectQualityTier(): QualityConfig {
  if (typeof window === "undefined") {
    return {
      tier: "standard",
      maxDpr: 1.5,
      shadowMapSize: 1024,
      shadowMapType: THREE.PCFShadowMap,
      directionalShadows: true,
      shardCount: 16,
      shadowUpdateInterval: 3,
      antialias: true,
      powerPreference: "default",
      description: "SSR default configuration",
    };
  }

  const isTouchDevice =
    navigator.maxTouchPoints > 1 ||
    window.matchMedia("(pointer: coarse)").matches;
  const isNarrowScreen = window.innerWidth < 900;
  const concurrency = navigator.hardwareConcurrency || 4;
  const memory = (navigator as unknown as { deviceMemory?: number }).deviceMemory || 4;

  let isDedicatedGpu = false;
  let isAppleSilicon = false;

  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    if (gl) {
      const ext = (gl as WebGLRenderingContext).getExtension(
        "WEBGL_debug_renderer_info"
      );
      if (ext) {
        const rendererStr =
          (gl as WebGLRenderingContext).getParameter(
            ext.UNMASKED_RENDERER_WEBGL
          ) || "";
        const lower = rendererStr.toLowerCase();
        if (
          lower.includes("nvidia") ||
          lower.includes("geforce") ||
          lower.includes("radeon") ||
          lower.includes("rtx") ||
          lower.includes("gtx")
        ) {
          isDedicatedGpu = true;
        } else if (lower.includes("apple m") || lower.includes("apple gpu")) {
          isAppleSilicon = true;
        }
      }
      const loseExt = (gl as WebGLRenderingContext).getExtension(
        "WEBGL_lose_context"
      );
      loseExt?.loseContext();
    }
  } catch {
    // Canvas context inspection fallback
  }

  // Tier 1: Mobile Devices / Low-Power Handhelds
  if (isTouchDevice && isNarrowScreen) {
    return {
      tier: "mobile",
      maxDpr: Math.min(window.devicePixelRatio, 1.25),
      shadowMapSize: 512,
      shadowMapType: THREE.PCFShadowMap,
      directionalShadows: false, // Relies on smooth radial ground shadow plane, saving 50%+ fillrate
      shardCount: 10,
      shadowUpdateInterval: 6,
      antialias: false, // Retina displays at 1.25x DPR are dense enough without 4x MSAA GPU overhead
      powerPreference: "low-power",
      description: "Mobile handheld tier (clamped 1.25 DPR, optimized shadow blob)",
    };
  }

  // Tier 3: High-Performance Desktop (Dedicated GPU or Apple Silicon with >=8 cores/memory)
  if (
    !isTouchDevice &&
    (isDedicatedGpu || isAppleSilicon || (concurrency >= 8 && memory >= 8))
  ) {
    return {
      tier: "high",
      maxDpr: Math.min(window.devicePixelRatio, 2.0),
      shadowMapSize: 2048,
      shadowMapType: THREE.PCFSoftShadowMap,
      directionalShadows: true,
      shardCount: 22,
      shadowUpdateInterval: 2,
      antialias: true,
      powerPreference: "high-performance",
      description: "High-performance desktop (2.0 DPR, 2048 PCFSoftShadow, 22 shards)",
    };
  }

  // Tier 2: Standard Desktop / Large Tablet
  return {
    tier: "standard",
    maxDpr: Math.min(window.devicePixelRatio, 1.5),
    shadowMapSize: 1024,
    shadowMapType: THREE.PCFShadowMap,
    directionalShadows: true,
    shardCount: 16,
    shadowUpdateInterval: 4,
    antialias: true,
    powerPreference: "default",
    description: "Standard desktop / tablet tier (1.5 DPR, 1024 PCFShadow, 16 shards)",
  };
}
