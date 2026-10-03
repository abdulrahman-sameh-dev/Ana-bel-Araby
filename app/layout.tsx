import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CRITICAL_FONT_FILES } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "اللغة العربية — هويتها، تطورها، تاريخها، وتأثيرها",
  description:
    "عرض تفاعلي عن اللغة العربية: هويتها، طرق تطويرها في زمن التكنولوجيا، معلومات مفاجئة عنها، وتاريخها وأثرها.",
  applicationName: "غيث",
  authors: [{ name: "فريق غيث" }],
  /**
   * The team's own emblem, cut from `public/logo.jpeg` and generated as PNGs so
   * the round mark survives being scaled down to 16px. The paths are explicit
   * rather than left to the `app/icon.*` convention because the 32px cut is too
   * coarse for Next's automatic raster, and `public/media/logo/` is where every
   * other derived size lives.
   */
  icons: {
    icon: [
      { url: "/media/logo/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/media/logo/emblem-180.png", sizes: "180x180", type: "image/png" },
      { url: "/media/logo/emblem-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/media/logo/apple-180.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "اللغة العربية — هويتها، تطورها، تاريخها، وتأثيرها",
    description: "عرض تفاعلي — فريق غيث",
    locale: "ar_AR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#2a241d",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        {CRITICAL_FONT_FILES.map((href) => (
          <link
            key={href}
            rel="preload"
            href={href}
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />
        ))}
      </head>
      <body className="min-h-dvh bg-paper text-ink">{children}</body>
    </html>
  );
}
