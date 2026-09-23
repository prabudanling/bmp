import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { db } from "@/lib/db";
import { buildJsonLd, getMetaForRoute } from "@/lib/seo";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_METADATA: Metadata = {
  title: "Kompresor & Sparepart AC Glodok | Berkat Mandiri Pendingin",
  description:
    "Toko kompresor & sparepart AC original di New Harco Glodok, Jakarta Barat. 1000+ item ready stok: kompresor rotary/scroll, kapasitor, motor fan, freon. Kirim seluruh Indonesia.",
  keywords: [
    "toko sparepart AC glodok",
    "jual kompresor AC glodok",
    "kompresor AC jakarta barat",
    "sparepart AC original glodok",
    "toko kompresor pendingin glodok",
    "kapasitor AC original",
    "motor fan AC jakarta",
    "freon AC murah glodok",
    "sparepart AC harco glodok",
    "jual kompresor AC jakarta",
    "kompresor AC",
    "sparepart AC",
    "Berkat Mandiri Pendingin",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Kompresor & Sparepart AC Glodok | Berkat Mandiri Pendingin",
    description:
      "Toko spesialis kompresor & sparepart AC original di New Harco Glodok, Jakarta Barat — ready stok 1000+ item, harga bersahabat.",
    siteName: "Berkat Mandiri Pendingin",
    type: "website",
    locale: "id_ID",
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
async function getStoreInfo(): Promise<{
  faviconUrl: string
  storeName: string
  tagline: string
  phone: string
  whatsapp: string
  email: string
  address: string
  hours: string
}> {
  const defaults = {
    faviconUrl: "/favicon.svg",
    storeName: "Berkat Mandiri Pendingin",
    tagline: "Spesialis Kompresor & Sparepart AC",
    phone: "",
    whatsapp: "",
    email: "",
    address: "",
    hours: "Senin - Sabtu: 08.00 - 17.00 WIB",
  };
  try {
    const rows = await db.setting.findMany();
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    const favicon =
      map.faviconUrl?.trim() || map.logoUrl?.trim() || defaults.faviconUrl;
    return {
      ...defaults,
      faviconUrl: favicon,
      storeName: map.storeName?.trim() || defaults.storeName,
      tagline: map.tagline?.trim() || defaults.tagline,
      phone: map.phone?.trim() || "",
      whatsapp: map.whatsapp?.trim() || "",
      email: map.email?.trim() || "",
      address: map.address?.trim() || "",
      hours: map.hours?.trim() || defaults.hours,
    };
  } catch {
    return defaults;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const store = await getStoreInfo();
  const icon = store.faviconUrl;
  const ext = icon.split("?")[0].split(".").pop()?.toLowerCase() ?? "";
  const type = FAVICON_MIME[ext];

  // Meta halaman beranda dari SEO Command Center VVIP (tabel SeoPageMeta)
  const homeMeta = await getMetaForRoute("/").catch(() => null);

  // URL absolut untuk preview WhatsApp/Twitter (set NEXT_PUBLIC_SITE_URL saat deploy)
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const abs = (path: string) => `${siteUrl}${path}`;
  const ogImage = homeMeta?.ogImage?.trim()
    ? abs(homeMeta.ogImage.trim())
    : abs("/uploads/hero.png");

  const title =
    homeMeta?.title?.trim() ||
    `${store.storeName} — Kompresor & Sparepart AC Terlengkap`;
  const description =
    homeMeta?.description?.trim() ||
    "Toko spesialis kompresor & sparepart AC original dan bergaransi. Kirim ke seluruh Indonesia, melayani satuan maupun grosir.";
  const keywords = homeMeta?.keywords?.trim()
    ? homeMeta.keywords.split(",").map((k) => k.trim()).filter(Boolean)
    : BASE_METADATA.keywords;
  const robotsDirectives = homeMeta?.robots?.trim() || "index,follow";

  return {
    ...BASE_METADATA,
    metadataBase: new URL(siteUrl),
    title,
    description,
    keywords,
    robots: robotsDirectives,
    openGraph: {
      ...BASE_METADATA.openGraph,
      title,
      description,
      siteName: store.storeName,
      locale: "id_ID",
      images: [{ url: ogImage, width: 1024, height: 768, alt: store.storeName }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    icons: {
      icon: type ? { url: icon, type } : icon,
      apple: icon,
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#0f766e",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Data terstruktur Schema.org untuk hasil pencarian Google yang kaya
  // (ditingkatkan: areaServed + sameAs sosial media dari pengaturan toko)
  const jsonLd = await buildJsonLd().catch(() => {
    return { "@context": "https://schema.org", "@type": "HardwareStore" };
  });

  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${jakarta.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeProvider>
          {children}
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
