"use client";

import React from "react";
import { LogoPlaceholder, LogoMark } from "../ui/LogoPlaceholder";

const COLS = [
  {
    title: "رویدادها",
    links: [
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
      ["رزرو غرفه", "#register"],
      ["ثبت‌نام بازدیدکنندگان", "#register"],
      ["تجربه نمایشگاه", "#experience"],
      ["آمار ادوار گذشته", "#stats"],
    ],
  },
];

export const Footer: React.FC = () => (
  <footer data-theme="dark" className="relative overflow-hidden px-5 pb-8 pt-24 sm:px-10">
    <div className="grid gap-14 border-t border-[color:var(--line)] pt-12 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
      <div>
        <LogoPlaceholder variant="horizontal" />
        <p className="fa mt-6 max-w-sm text-sm leading-8 text-[color:var(--muted)]">
          نمایشگاه بین‌المللی نوآوری و فناوری، با حمایت معاونت علمی و فناوری ریاست جمهوری در پارک فناوری پردیس.
        </p>
      </div>

      {COLS.map((c) => (
        <div key={c.title}>
          <h4 className="label mb-5">{c.title}</h4>
          <ul className="space-y-3">
            {c.links.map(([label, href]) => (
              <li key={label}>
                <a href={href} className="fa text-sm transition-opacity hover:opacity-60">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div>
        <h4 className="label mb-5">دبیرخانه</h4>
        <address className="fa space-y-3 text-sm not-italic leading-7">
          <p>تهران، کیلومتر ۲۰ جاده دماوند، پارک فناوری پردیس، مجتمع سراج</p>
          <p dir="ltr" className="text-start">+98 (21) 76250250</p>
          <p dir="ltr" className="text-start">info@inotex.com</p>
        </address>
      </div>
    </div>

    {/* لوگوی رسمی در مقیاس بزرگ (به‌جای متن)؛ فقط سفید روی سرمه‌ای، طبق برندبوک */}
    <div aria-hidden="true" className="mt-20 flex select-none justify-center opacity-[0.1]">
      <LogoMark height={400} className="h-auto w-full max-w-[1400px]" />
    </div>

    <div className="label mt-10 flex flex-col justify-between gap-3 sm:flex-row" dir="ltr">
      <span>© {new Date().getFullYear()} INOTEX. All rights reserved.</span>
      <a href="https://instagram.com/inotexevent" target="_blank" rel="noreferrer" className="hover:opacity-60">
        Instagram
      </a>
    </div>
  </footer>
);