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

export const metadata: Metadata = {
  title: "Berkat Mandiri Pendingin | Pusat AC, Kompresor, Refrigerant & Spare Part",
  description:
    "Berkat Mandiri Pendingin - Pusat penjualan AC, kompresor AC, refrigerant, spare part AC, chiller, dan sistem pendingin gedung terlengkap di Indonesia. Harga kompetitif, garansi resmi, pengiriman seluruh Indonesia.",
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
    "Daikin",
    "Panasonic",
    "Samsung",
    "LG",
    "Gree",
    "Mitsubishi",
    "Berkat Mandiri Pendingin",
  ],
  authors: [{ name: "Berkat Mandiri Pendingin" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Berkat Mandiri Pendingin | Pusat AC & Pendingin Terlengkap",
    description:
      "Pusat penjualan AC, kompresor, refrigerant, spare part, dan sistem pendingin gedung terlengkap di Indonesia.",
    type: "website",
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
