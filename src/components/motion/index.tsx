'use client'

/**
 * Toolkit animasi premium — dibangun di atas framer-motion.
 * Semua komponen hormati preferensi `prefers-reduced-motion` pengguna
 * (via MotionConfig reducedMotion="user" di SmoothMotion).
 */

import {
  MotionConfig,
  motion,
  useInView,
  type Variants,
} from 'framer-motion'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { Snowflake } from 'lucide-react'

/** Kurva easing "expo-out" yang halus & enak dipandang */
export const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

/* ============================================================
   Wrapper global — pasang sekali di root aplikasi
   ============================================================ */
export function SmoothMotion({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}

/* ============================================================
   Reveal — elemen muncul dengan halus saat di-scroll
   ============================================================ */
type RevealFrom = 'up' | 'down' | 'left' | 'right' | 'zoom' | 'fade'

const REVEAL_INITIAL: Record<RevealFrom, Record<string, number>> = {
  up: { opacity: 0, y: 30 },
  down: { opacity: 0, y: -30 },
  left: { opacity: 0, x: -40 },
  right: { opacity: 0, x: 40 },
  zoom: { opacity: 0, scale: 0.88 },
  fade: { opacity: 0 },
}

export function Reveal({
  children,
  className,
  delay = 0,
  from = 'up',
  once = true,
}: {
  children: ReactNode
  className?: string
  delay?: number
  from?: RevealFrom
  once?: boolean
}) {
  return (
    <motion.div
      className={className}
      initial={REVEAL_INITIAL[from]}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once, amount: 0.2, margin: '0px 0px -48px 0px' }}
      transition={{ duration: 0.65, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

/* ============================================================
   Stagger — anak-anak muncul berurutan satu per satu
   ============================================================ */
export function Stagger({
  children,
  className,
  delay = 0,
  gap = 0.07,
  once = true,
}: {
  children: ReactNode
  className?: string
  delay?: number
  gap?: number
  once?: boolean
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount: 0.12, margin: '0px 0px -48px 0px' }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: gap, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  children,
  className,
  from = 'up',
}: {
  children: ReactNode
  className?: string
  from?: RevealFrom
}) {
  const variants: Variants = {
    hidden: REVEAL_INITIAL[from],
    show: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      transition: { duration: 0.55, ease: EASE },
    },
  }
  return (
    <motion.div className={className} variants={variants}>
      {children}
    </motion.div>
  )
}

/* ============================================================
   Varian siap-pakai untuk entrance hero (langsung jalan, tanpa scroll)
   ============================================================ */
export const heroContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.08 } },
}

export const heroItem: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
}

export const heroItemRight: Variants = {
  hidden: { opacity: 0, x: 48, scale: 0.96 },
  show: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.8, ease: EASE },
  },
}

/* ============================================================
   Counter — angka berhitung naik saat terlihat di layar
   ============================================================ */
export function Counter({
  to,
  duration = 1.6,
  className,
  suffix = '',
  prefix = '',
}: {
  to: number
  duration?: number
  className?: string
  suffix?: string
  prefix?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -40px 0px' })
  const [val, setVal] = useState(0)

  useEffect(() => {
    if (!inView || to <= 0) return
    let raf = 0
    const t0 = performance.now()
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / (duration * 1000))
      const eased = 1 - Math.pow(1 - p, 3) // cubic out
      setVal(Math.round(to * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, to, duration])

  return (
    <span ref={ref} className={className}>
      {prefix}
      {val.toLocaleString('id-ID')}
      {suffix}
    </span>
  )
}

/* ============================================================
   Marquee — baris berjalan tanpa putus (pause saat di-hover)
   ============================================================ */
export function Marquee({
  children,
  duration = 30,
  className,
}: {
  children: ReactNode
  /** detik untuk satu siklus */
  duration?: number
  className?: string
}) {
  return (
    <div
      className={`marquee-mask marquee-hover relative overflow-hidden ${className ?? ''}`}
    >
      <div
        className="animate-marquee flex w-max items-center"
        style={{ '--marquee-dur': `${duration}s` } as CSSProperties}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  )
}

/* ============================================================
   Snowfall — kepingan salju kecil melayang turun (tema "pendingin")
   Deterministik (seeded) agar aman terhadap hydration mismatch.
   ============================================================ */
function seededRandom(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function Snowfall({
  count = 12,
  className,
}: {
  count?: number
  className?: string
}) {
  const flakes = useMemo(() => {
    const rnd = seededRandom(20250101)
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: rnd() * 100,
      dur: 11 + rnd() * 10,
      delay: -rnd() * 14,
      size: 9 + rnd() * 12,
      x: -60 + rnd() * 120,
      o: 0.12 + rnd() * 0.26,
    }))
  }, [count])

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ''}`}
    >
      {flakes.map((f) => (
        <Snowflake
          key={f.id}
          className="snowflake absolute -top-10 text-white"
          style={
            {
              left: `${f.left}%`,
              fontSize: f.size,
              animationDuration: `${f.dur}s`,
              animationDelay: `${f.delay}s`,
              '--snow-x': `${f.x}px`,
              '--snow-o': f.o,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}

/* ============================================================
   Pop — muncul dengan efek memantul kecil (spring)
   ============================================================ */
export function Pop({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 320, damping: 20 }}
    >
      {children}
    </motion.div>
  )
}
