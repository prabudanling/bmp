import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://www.berkatmandiripendingin.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "Berkat Mandiri Pendingin | Pusat AC, Kompresor, Refrigerant & Spare Part Terlengkap di Indonesia",
    template: "%s | Berkat Mandiri Pendingin",
  },
  description:
    "PT Berkat Mandiri Pendingin — Distributor HVAC resmi sejak 2010 di Kawasan MM2100 Bekasi. Pusat penjualan AC, kompresor, refrigerant, spare part, chiller, VRV/VRF, dan sistem pendingin gedung terlengkap. Harga kompetitif, garansi resmi, pengiriman ke 34 provinsi Indonesia.",
  keywords: [
    "AC",
    "pendingin udara",
    "kompresor AC",
    "refrigerant",
    "spare part AC",
    "chiller",
    "VRV",
    "VRF",
    "mesin pendingin",
    "HVAC",
    "distributor HVAC Indonesia",
    "distributor AC Bekasi",
    "jual AC murah",
    "spare part pendingin",
    "freon AC",
    "Daikin",
    "Panasonic",
    "Samsung",
    "LG",
    "Gree",
    "Mitsubishi",
    "Copeland",
    "Danfoss",
    "Berkat Mandiri Pendingin",
    "PT Berkat Mandiri Pendingin",
  ],
  authors: [{ name: "PT Berkat Mandiri Pendingin", url: SITE_URL }],
  creator: "PT Digital Bisnis Manajemen",
  publisher: "PT Berkat Mandiri Pendingin",
  category: "business",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    siteName: "Berkat Mandiri Pendingin",
    title: "Berkat Mandiri Pendingin | Distributor HVAC Resmi Sejak 2010",
    description:
      "Pusat penjualan AC, kompresor, refrigerant, spare part, dan sistem pendingin gedung terlengkap di Indonesia. Melayani 5.000+ proyek di 34 provinsi.",
    images: [
      {
        url: "/images/hero/hero-1.png",
        alt: "Sistem pendingin HVAC modern — PT Berkat Mandiri Pendingin",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Berkat Mandiri Pendingin | Distributor HVAC Resmi Sejak 2010",
    description:
      "Pusat penjualan AC, kompresor, refrigerant, spare part, dan sistem pendingin gedung terlengkap di Indonesia.",
    images: ["/images/hero/hero-1.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
