'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { NoSSR } from '@/components/ui/no-ssr';
import {
  Menu,
  ShoppingCart,
  Phone,
  Snowflake,
  Search,
  Instagram,
  Facebook,
  Linkedin,
  X,
} from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';

const navItems = [
  { label: 'Beranda', href: '#beranda' },
  { label: 'Kategori', href: '#kategori' },
  { label: 'Produk', href: '#produk' },
  { label: 'Keunggulan', href: '#keunggulan' },
  { label: 'Testimoni', href: '#testimoni' },
  { label: 'Kontak', href: '#kontak' },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const totalItems = useCartStore((s) => s.getTotalItems());
  const openCart = useCartStore((s) => s.openCart);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      {/* Top bar */}
      <div className="bg-teal-900 text-white text-xs py-1.5">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="tel:081220030092" className="flex items-center gap-1 hover:text-teal-200 transition-colors">
              <Phone className="h-3 w-3" />
              081220030092
            </a>
            <span className="hidden sm:flex items-center gap-1">
              WhatsApp: +62 813-5000-3423
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-2">
              <motion.a
                href="#"
                whileHover={{ scale: 1.15, y: -1 }}
                className="hover:text-teal-200 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-3 w-3" />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.15, y: -1 }}
                className="hover:text-teal-200 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-3 w-3" />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.15, y: -1 }}
                className="hover:text-teal-200 transition-colors"
                aria-label="Linkedin"
              >
                <Linkedin className="h-3 w-3" />
              </motion.a>
            </div>
            <span className="text-teal-200">Pengiriman Seluruh Indonesia</span>
          </div>
        </div>
      </div>
      {/* Main header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-500 ease-out ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-lg shadow-gray-900/[0.06]'
            : 'bg-white shadow-sm'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button
              onClick={() => scrollToSection('#beranda')}
              className="flex items-center gap-2 group"
            >
              <motion.div
                className="w-10 h-10 rounded-lg bg-gradient-teal flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-300"
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  className="text-white"
                  whileHover={{ rotate: [0, -120, 240, 360] }}
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                >
                  <Snowflake className="h-6 w-6" />
                </motion.div>
              </motion.div>
              <div className="hidden sm:block">
                <div className="font-bold text-sm leading-tight text-teal-800">
                  BERKAT MANDIRI
                </div>
                <div className="text-[10px] font-medium text-teal-600 tracking-wider uppercase">
                  Pendingin
                </div>
              </div>
            </button>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => scrollToSection(item.href)}
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-teal-700 rounded-lg hover:bg-teal-50 transition-all duration-200"
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  variant="default"
                  size="sm"
                  className="hidden sm:flex bg-gradient-teal hover:opacity-90 shadow-md text-white"
                  onClick={() => scrollToSection('#kontak')}
                >
                  <Phone className="h-4 w-4 mr-1.5" />
                  Hubungi Kami
                </Button>
              </motion.div>

              {/* Search - Desktop: expandable input, Mobile: scroll to #produk */}
              <div className="flex items-center">
                <motion.div
                  className="hidden md:flex items-center"
                  animate={{
                    width: searchExpanded ? 200 : 36,
                  }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <div className="relative w-full">
                    {searchExpanded && (
                      <motion.input
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: '100%' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        type="text"
                        placeholder="Cari produk..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="absolute right-8 top-1/2 -translate-y-1/2 h-8 w-full text-sm rounded-lg border border-gray-200 bg-gray-50 px-3 pr-2 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                        autoFocus
                      />
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative z-10 h-9 w-9"
                      onClick={() => setSearchExpanded(!searchExpanded)}
                      aria-label="Cari"
                    >
                      {searchExpanded ? (
                        <X className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Search className="h-4 w-4 text-gray-600" />
                      )}
                    </Button>
                  </div>
                </motion.div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden h-9 w-9"
                  onClick={() => scrollToSection('#produk')}
                  aria-label="Cari produk"
                >
                  <Search className="h-4 w-4 text-gray-600" />
                </Button>
              </div>

              <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
                <Button
                  variant="outline"
                  size="icon"
                  className="relative"
                  onClick={openCart}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {totalItems > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    >
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-teal-600 text-white text-[10px] border-2 border-white">
                        {totalItems}
                      </Badge>
                    </motion.div>
                  )}
                </Button>
              </motion.div>

              {/* Mobile menu - wrapped in NoSSR to prevent hydration mismatch */}
              <NoSSR fallback={
                <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
                  <Menu className="h-5 w-5" />
                </Button>
              }>
                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                  <SheetTrigger asChild className="lg:hidden">
                    <Button variant="ghost" size="icon">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-72 p-0">
                    <div className="p-4 border-b bg-teal-900 text-white">
                      <div className="flex items-center gap-2">
                        <Snowflake className="h-6 w-6" />
                        <div>
                          <div className="font-bold text-sm">BERKAT MANDIRI</div>
                          <div className="text-[10px] text-teal-200 tracking-wider">
                            PENDINGIN
                          </div>
                        </div>
                      </div>
                    </div>
                    <nav className="p-2">
                      {navItems.map((item, i) => (
                        <motion.button
                          key={item.href}
                          onClick={() => scrollToSection(item.href)}
                          className="w-full text-left px-4 py-3 text-sm font-medium text-gray-800 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05, duration: 0.25 }}
                        >
                          {item.label}
                        </motion.button>
                      ))}
                      <motion.div
                        className="mt-3 px-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: navItems.length * 0.05, duration: 0.25 }}
                      >
                        <Button
                          className="w-full bg-gradient-teal hover:opacity-90 text-white"
                          onClick={() => {
                            setMobileOpen(false);
                            scrollToSection('#kontak');
                          }}
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          Hubungi Kami
                        </Button>
                      </motion.div>
                    </nav>
                  </SheetContent>
                </Sheet>
              </NoSSR>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
