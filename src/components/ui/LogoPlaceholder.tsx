"use client";

import React from "react";

export type LogoVariant = "horizontal" | "vertical" | "symbol" | "badge";

interface Props {
  variant?: LogoVariant;
  className?: string;
  year?: string;
  /** ارتفاع لوگو بر حسب px (نسبت طول به عرض طبق برندبوک ثابت می‌ماند) */
  height?: number;
}

/**
 * لوگوی رسمی INOTEX — وکتور بازسازی‌شده از صفحه‌ی «Logo Identity / New Logo» برندبوک.
 * - O = شش‌ضلعی توخالی (مهره)، زاویه‌ها ۳۰° و ۶۰°
 * - رنگ از currentColor می‌آید؛ طبق برندبوک فقط آبی ۷۴۵۵C، سفید یا مشکی استفاده شود
 * - نسبت‌ها را تغییر ندهید، لوگو را نچرخانید و روی عکس شلوغ نگذارید (برندبوک، «Should not»)
 */
const VIEW_W = 484;
const VIEW_H = 100;

/** شش‌ضلعی O (نوک رو به بالا) با سوراخ شش‌ضلعی */
const O_PATH =
  "M173.2 0L216.5 25V75L173.2 100L129.9 75V25ZM173.2 24.7L195.1 37.35V62.65L173.2 75.3L151.3 62.65V37.35Z";

const LETTERS = [
  "M0 7H21.2V93.3H0Z", // I
  "M32.8 7H62.8L97.6 65V7H118.4V93.3H88.1L53.8 34.8V93.3H32.8Z", // N
  "M228.4 7H303V28H276.6V93.3H254.2V28H228.4Z", // T
  "M314.6 7H385.7L373.5 28H314.6Z", // E (۳ میله با برش ۳۰°)
  "M314.6 39.6H385.7L373.5 60.5H314.6Z",
  "M314.6 72H385.7L373.5 93.3H314.6Z",
  "M398 7H422L440.5 38.4L458.8 7H483L458.6 50L483 93.3H458.8L440.5 61.6L422 93.3H398L422.3 50Z", // X
];

export const LogoMark: React.FC<{ height?: number; className?: string; title?: string }> = ({
  height = 28,
  className = "",
  title = "INOTEX",
}) => (
  <svg
    role="img"
    aria-label={title}
    viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
    height={height}
    width={(height * VIEW_W) / VIEW_H}
    className={className}
    fill="currentColor"
  >
    {LETTERS.map((d) => (
      <path key={d} d={d} />
    ))}
    <path d={O_PATH} fillRule="evenodd" />
  </svg>
);

/** فقط شش‌ضلعی توخالی «O» به‌عنوان نماد */
const Symbol: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="123 0 100 100" fill="currentColor" aria-hidden="true">
    <path d={O_PATH} fillRule="evenodd" />
  </svg>
);

export const LogoPlaceholder: React.FC<Props> = ({ variant = "horizontal", className = "", year = "2026", height }) => {
  if (variant === "symbol") {
    return (
      <span className={className}>
        <Symbol size={height ?? 44} />
      </span>
    );
  }

  if (variant === "badge") {
    return (
      <span className={`inline-flex items-center gap-2 rounded-full border border-current/30 px-3 py-1.5 ${className}`}>
        <Symbol size={18} />
        <span className="label !text-current font-bold">INOTEX {year}</span>
      </span>
    );
  }

  if (variant === "vertical") {
    return (
      <span className={`inline-flex flex-col items-center gap-3 ${className}`}>
        <LogoMark height={height ?? 40} />
        <span className="label !text-current" dir="ltr">
          Innovation &amp; Technology Exhibition
        </span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center ${className}`}>
      <LogoMark height={height ?? 26} />
    </span>
  );
};
