import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
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
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Berkat Mandiri Pendingin",
    description:
      "Spesialis kompresor & sparepart AC original dengan harga bersahabat.",
    siteName: "Berkat Mandiri Pendingin",
    type: "website",
  },
};

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
