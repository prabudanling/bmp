import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { db } from "@/lib/db";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_METADATA: Metadata = {
  title: "Berkat Mandiri Pendingin — Kompresor & Sparepart AC Terlengkap",
  description:
    "Toko spesialis kompresor dan sparepart AC: kompresor rotary & scroll, motor fan, kapasitor, termostat, freon, dan aksesoris AC lainnya. Original, bergaransi, kirim ke seluruh Indonesia.",
  keywords: [
    "kompresor AC",
    "sparepart AC",
    "jual kompresor AC",
    "kapasitor AC",
    "motor fan AC",
    "freon AC",
    "Berkat Mandiri Pendingin",
  ],
  openGraph: {
    title: "Berkat Mandiri Pendingin",
    description:
      "Spesialis kompresor & sparepart AC original dengan harga bersahabat.",
    siteName: "Berkat Mandiri Pendingin",
    type: "website",
  },
};

/** MIME type favicon berdasarkan ekstensi file */
const FAVICON_MIME: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
  ico: "image/x-icon",
};

/**
 * Favicon dinamis — dibaca dari tabel Setting tiap request.
 * Urutan: favicon unggahan admin → logo perusahaan → ikon bawaan /favicon.svg.
 */
async function getFaviconUrl(): Promise<string> {
  try {
    const rows = await db.setting.findMany({
      where: { key: { in: ["faviconUrl", "logoUrl"] } },
    });
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    if (map.faviconUrl?.trim()) return map.faviconUrl.trim();
    if (map.logoUrl?.trim()) return map.logoUrl.trim();
  } catch {
    // DB tidak tersedia → pakai ikon bawaan
  }
  return "/favicon.svg";
}

export async function generateMetadata(): Promise<Metadata> {
  const icon = await getFaviconUrl();
  const ext = icon.split("?")[0].split(".").pop()?.toLowerCase() ?? "";
  const type = FAVICON_MIME[ext];
  return {
    ...BASE_METADATA,
    icons: {
      icon: type ? { url: icon, type } : icon,
      apple: icon,
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#0f766e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${jakarta.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider>
          {children}
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
