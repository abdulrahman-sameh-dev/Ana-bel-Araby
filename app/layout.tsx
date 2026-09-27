import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CRITICAL_FONT_FILES } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "اللغة العربية — هويتها، تطورها، تاريخها، وتأثيرها",
  description:
    "عرض تفاعلي عن اللغة العربية: هويتها، طرق تطويرها في زمن التكنولوجيا، معلومات مفاجئة عنها، وتاريخها وأثرها.",
  applicationName: "أنا بالعربي",
  authors: [{ name: "فريق ٣ — أنا بالعربي" }],
  openGraph: {
    title: "اللغة العربية — هويتها، تطورها، تاريخها، وتأثيرها",
    description: "عرض تفاعلي — فريق ٣ · أنا بالعربي",
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
