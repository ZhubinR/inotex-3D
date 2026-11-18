"use client";

import React from "react";
import { LogoPlaceholder, LogoMark } from "../ui/LogoPlaceholder";

const COLS = [
  {
    title: "رویدادها",
    links: [
      ["اینوتکس‌اکسپرس ۱۴۰۵", "#express"],
      ["اینوتکس استیج", "#stage"],
      ["کافه سرمایه", "#cafe"],
      ["اینوتکس پیچ", "#pitch"],
      ["ریورس پیچ", "#reverse"],
      ["اینونایت", "#night"],
    ],
  },
  {
    title: "اطلاعات حضور",
    links: [
      ["رزرو غرفه و پیش‌ثبت‌نام", "#register"],
      ["تجربه نمایشگاه", "#experience"],
      ["آمار ادوار گذشته", "#stats"],
    ],
  },
];

export const Footer: React.FC = () => (
  <footer data-theme="dark" className="relative overflow-hidden px-5 pb-8 pt-24 sm:px-10 border-t border-[color:var(--line)]/40 bg-[color:var(--navy)] text-white">
    <div className="grid gap-12 pt-4 lg:grid-cols-[1.5fr_1fr_1fr_1.3fr]">
      <div>
        <LogoPlaceholder variant="horizontal" height={28} />
        <p className="fa mt-6 max-w-sm text-sm leading-8 text-white/75">
          نمایشگاه بین‌المللی نوآوری و فناوری (INOTEX)، رویداد پیشروی منطقه برای اتصال استارتاپ‌ها، شرکت‌های دانش‌بنیان، سرمایه‌گذاران و صنایع بزرگ در پارک فناوری پردیس.
        </p>
        <div className="mt-6 flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-[color:var(--teal)] animate-pulse" />
          <span className="fa text-xs font-bold text-white/90">رویداد سالانه نوآوری و فناوری</span>
        </div>
      </div>

      {COLS.map((c) => (
        <div key={c.title}>
          <h4 className="label !text-white/50 mb-5 font-bold tracking-wider">{c.title}</h4>
          <ul className="space-y-3.5">
            {c.links.map(([label, href]) => (
              <li key={label}>
                <a
                  href={href}
                  className="fa text-sm text-white/80 transition-all duration-200 hover:text-[color:var(--yellow)] hover:ps-1 inline-flex items-center gap-1.5"
                >
                  <span className="text-[10px] text-white/40">›</span>
                  <span>{label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div>
        <h4 className="label !text-white/50 mb-5 font-bold tracking-wider">دبیرخانه اجرایی</h4>
        <address className="fa space-y-3.5 text-sm not-italic leading-7 text-white/80">
          <p>تهران، کیلومتر ۲۰ جاده دماوند، پارک فناوری پردیس، مجتمع سراج</p>
          <p dir="ltr" className="text-start">
            <a href="tel:+982176250250" className="hover:text-[color:var(--yellow)] transition-colors">
              +98 (21) 76250250
            </a>
          </p>
          <p dir="ltr" className="text-start">
            <a href="mailto:info@inotex.com" className="hover:text-[color:var(--yellow)] transition-colors">
              info@inotex.com
            </a>
          </p>
        </address>
      </div>
    </div>

    {/* لوگوی رسمی در مقیاس بزرگ به عنوان بافت معماری پس‌زمینه */}
    <div aria-hidden="true" className="mt-20 flex select-none justify-center opacity-[0.06] pointer-events-none">
      <LogoMark height={380} className="h-auto w-full max-w-[1400px]" />
    </div>

    <div className="label mt-10 flex flex-col justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center !text-white/60" dir="ltr">
      <span>© {new Date().getFullYear()} INOTEX. All rights reserved.</span>
      <div className="flex items-center gap-6">
        <a href="https://instagram.com/inotexevent" target="_blank" rel="noreferrer" className="hover:text-[color:var(--yellow)] transition-colors">
          Instagram
        </a>
        <a href="#hero" className="hover:text-[color:var(--yellow)] transition-colors fa text-xs">
          بازگشت به بالا ↑
        </a>
      </div>
    </div>
  </footer>
);