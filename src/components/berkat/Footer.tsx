'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Snowflake, Phone, Mail, MapPin, ArrowUp, Instagram, Facebook, Linkedin, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const quickLinks = [
  { label: 'Beranda', href: '#beranda' },
  { label: 'Kategori Produk', href: '#kategori' },
  { label: 'Katalog Produk', href: '#produk' },
  { label: 'Keunggulan', href: '#keunggulan' },
  { label: 'Testimoni', href: '#testimoni' },
  { label: 'Hubungi Kami', href: '#kontak' },
];

const categories = [
  'AC Split',
  'Kompresor',
  'Refrigerant',
  'Spare Part AC',
  'Chiller & VRV/VRF',
  'Mesin Pendingin',
];

const layananLinks = [
  'Instalasi AC',
  'Service AC',
  'Isi Freon',
  'Bongkar Pasang AC',
  'Cuci AC',
  'Konsultasi Proyek',
];

const brands = [
  'Daikin', 'Panasonic', 'Samsung', 'LG', 'Gree',
  'Mitsubishi', 'Toshiba', 'Fujitsu', 'Copeland', 'Danfoss',
];

const footerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export function Footer() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer ref={ref} className="bg-gray-900 text-gray-300">
      {/* CTA Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-teal"
      >
        <div className="container mx-auto px-4 py-10 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Butuh Solusi Pendingin untuk Proyek Anda?
          </h2>
          <p className="text-teal-100 max-w-2xl mx-auto mb-5 text-lg">
            Tim ahli kami siap membantu Anda memilih produk yang tepat dengan
            penawaran harga terbaik. Konsultasi gratis!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                className="bg-white text-teal-800 hover:bg-gray-100 shadow-lg h-12 px-8 font-bold"
                onClick={() => scrollTo('#kontak')}
              >
                <motion.span
                  animate={{ opacity: [1, 0.7, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  Hubungi Kami Sekarang
                </motion.span>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <a
                href="https://wa.me/6281350003423"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/40 text-white hover:bg-white/15 h-12 px-8 font-semibold"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  +62 813-5000-3423
                </Button>
              </a>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Main Footer */}
      <motion.div
        variants={footerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className="container mx-auto px-4 py-12"
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <motion.div variants={itemVariants} className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-teal flex items-center justify-center">
                <Snowflake className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-sm text-white leading-tight">
                  BERKAT MANDIRI
                </div>
                <div className="text-[9px] text-teal-300 tracking-wider uppercase">
                  Pendingin
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Pusat penjualan AC, kompresor, refrigerant, spare part, dan
              sistem pendingin gedung terlengkap di Indonesia.
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-gray-400">
                <svg className="h-3.5 w-3.5 text-teal-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                <span>Encep Sihabudin</span>
              </div>
              <a href="tel:02122682617" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                <Phone className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                <span>(021) 2268-2617</span>
              </a>
              <a href="mailto:berkatmandiripendingin@gmail.com" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                <Mail className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                <span>berkatmandiripendingin@gmail.com</span>
              </a>
            </div>
            {/* Social Media Links */}
            <div className="flex items-center gap-2 mt-4">
              <motion.a
                href="#"
                whileHover={{ scale: 1.2, y: -2 }}
                whileTap={{ scale: 0.9 }}
                className="w-8 h-8 rounded-full bg-gray-800 hover:bg-teal-600 flex items-center justify-center text-gray-400 hover:text-white transition-all"
                aria-label="Instagram"
              >
                <Instagram className="h-3.5 w-3.5" />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.2, y: -2 }}
                whileTap={{ scale: 0.9 }}
                className="w-8 h-8 rounded-full bg-gray-800 hover:bg-teal-600 flex items-center justify-center text-gray-400 hover:text-white transition-all"
                aria-label="Facebook"
              >
                <Facebook className="h-3.5 w-3.5" />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.2, y: -2 }}
                whileTap={{ scale: 0.9 }}
                className="w-8 h-8 rounded-full bg-gray-800 hover:bg-teal-600 flex items-center justify-center text-gray-400 hover:text-white transition-all"
                aria-label="Linkedin"
              >
                <Linkedin className="h-3.5 w-3.5" />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.2, y: -2 }}
                whileTap={{ scale: 0.9 }}
                className="w-8 h-8 rounded-full bg-gray-800 hover:bg-teal-600 flex items-center justify-center text-gray-400 hover:text-white transition-all"
                aria-label="Youtube"
              >
                <Youtube className="h-3.5 w-3.5" />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.2, y: -2 }}
                whileTap={{ scale: 0.9 }}
                className="w-8 h-8 rounded-full bg-gray-800 hover:bg-teal-600 flex items-center justify-center text-gray-400 hover:text-white transition-all"
                aria-label="X / Twitter"
              >
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </motion.a>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h4 className="font-semibold text-white text-sm mb-4">Layanan</h4>
            <ul className="space-y-2.5">
              {layananLinks.map((item) => (
                <li key={item}>
                  <button
                    onClick={() => scrollTo('#kontak')}
                    className="text-sm text-gray-400 hover:text-teal-300 transition-colors"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Navigasi */}
          <motion.div variants={itemVariants}>
            <h4 className="font-semibold text-white text-sm mb-4">Navigasi</h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <button
                    onClick={() => scrollTo(link.href)}
                    className="text-sm text-gray-400 hover:text-teal-300 transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Categories */}
          <motion.div variants={itemVariants}>
            <h4 className="font-semibold text-white text-sm mb-4">Kategori</h4>
            <ul className="space-y-2.5">
              {categories.map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => scrollTo('#produk')}
                    className="text-sm text-gray-400 hover:text-teal-300 transition-colors"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Brands */}
          <motion.div variants={itemVariants}>
            <h4 className="font-semibold text-white text-sm mb-4">Brand Tersedia</h4>
            <div className="flex flex-wrap gap-1.5">
              {brands.map((b) => (
                <span
                  key={b}
                  className="text-[11px] bg-gray-800 text-gray-300 px-2 py-0.5 rounded hover:bg-gray-700 hover:text-white transition-colors cursor-default"
                >
                  {b}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      <Separator className="bg-gray-800" />

      {/* Bottom Bar */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Berkat Mandiri Pendingin. Hak Cipta Dilindungi.</p>
          <div className="flex items-center gap-4">
            <p>Developed by PT Digital Bisnis Manajemen (DIGIMAN)</p>
            <motion.button
              onClick={scrollToTop}
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.9 }}
              className="w-8 h-8 rounded-full bg-gray-800 hover:bg-teal-600 flex items-center justify-center text-gray-400 hover:text-white transition-all"
              aria-label="Kembali ke atas"
            >
              <ArrowUp className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </footer>
  );
}