import type { Metadata, Viewport } from "next";
import "@fontsource-variable/open-sans"; // فونت انگلیسی برند: Open Sans (برندبوک، صفحه‌ی Typography)
import "@fontsource-variable/vazirmatn"; // جایگزین فارسی تا زمانی که فایل IRANYekan اضافه شود (globals.css)
import "lenis/dist/lenis.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "INOTEX | نمایشگاه بین‌المللی نوآوری و فناوری",
  description:
    "اکوسیستم نوآوری و فناوری زیر یک سقف؛ استارتاپ‌ها، سرمایه‌گذاران، شرکت‌های دانش‌بنیان و صنایع در پارک فناوری پردیس.",
  metadataBase: new URL("https://inotex.com"),
  openGraph: {
    type: "website",
    locale: "fa_IR",
    siteName: "INOTEX",
    title: "INOTEX | نمایشگاه بین‌المللی نوآوری و فناوری",
    description: "اکوسیستم نوآوری و فناوری زیر یک سقف.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }], // فایل را در public/ بگذارید
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#F4F4F1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body data-theme="light">{children}</body>
    </html>
  );
}