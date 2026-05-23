'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

const NAV_ITEMS = [
  { label: 'Radio', href: '/radio' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <motion.nav
      className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div
        className={`transition-all duration-300 ${
          scrolled
            ? 'bg-[#0A0A0A]/90 backdrop-blur-lg border-b border-[rgba(255,255,255,0.04)]'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-14">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex items-center gap-1.5">
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-[#D97706]"
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="font-typewriter text-sm tracking-tight text-[#F5F5F5] font-semibold">
                RetroWave
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm text-[#737373] hover:text-[#F5F5F5] transition-colors duration-200 font-typewriter tracking-wide"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/radio"
              className="hidden md:inline-flex px-4 py-1.5 rounded-lg text-sm font-typewriter tracking-wider text-white transition-all duration-200 hover:bg-[#D97706]/90 active:scale-[0.97]"
              style={{ background: '#D97706' }}
            >
              Tune in
            </Link>

            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden flex flex-col items-center justify-center w-8 h-8 rounded-lg border border-[rgba(255,255,255,0.08)] text-[#737373] hover:text-[#F5F5F5] hover:border-[rgba(255,255,255,0.16)] transition-all"
              aria-label="Toggle menu"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              className="md:hidden border-t border-[rgba(255,255,255,0.04)] bg-[#0A0A0A]/95 backdrop-blur-lg"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              <div className="px-6 py-4 space-y-2">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="block text-sm text-[#737373] hover:text-[#F5F5F5] transition-colors duration-200 font-typewriter tracking-wide py-2"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/radio"
                  onClick={() => setMenuOpen(false)}
                  className="block text-sm font-typewriter tracking-wider text-white py-2 px-4 rounded-lg text-center transition-all hover:bg-[#D97706]/90"
                  style={{ background: '#D97706' }}
                >
                  Tune in
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  )
}
