'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import CassettePlayer from '@/components/cassette/CassettePlayer'
import MoodSelector from '@/components/ui/MoodSelector'
import RadioDial from '@/components/ui/RadioDial'
import SignalMeter from '@/components/ui/SignalMeter'
import MixtapeCard from '@/components/ui/MixtapeCard'
import type { Mood, Mixtape } from '@/types'
import { YEAR_DECADES } from '@/types'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
}

export default function Home() {
  const [selectedMood, setSelectedMood] = useState<Mood | undefined>()
  const [selectedDecade, setSelectedDecade] = useState<number | undefined>()
  const [mixtapes, setMixtapes] = useState<Mixtape[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (selectedMood) params.set('mood', selectedMood)
    if (selectedDecade) params.set('decade', String(selectedDecade))

    fetch(`/api/mixtapes?${params}`)
      .then((res) => res.json())
      .then(setMixtapes)
      .catch(() => setMixtapes([]))
      .finally(() => setLoading(false))
  }, [selectedMood, selectedDecade])

  return (
    <div>
      {/* ───── HERO ───── */}
      <section className="relative min-h-screen flex flex-col px-6 pt-28 pb-16 overflow-hidden">
        {/* Cassette Player — the hero, front and center */}
        <div className="flex-1 flex flex-col items-center justify-center gap-8">
          <motion.div
            className="flex justify-center w-full"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <CassettePlayer
              tracks={Array.from({ length: 8 }, (_, i) => ({
                id: `h${i}`, title: `Track ${i + 1}`, artist: 'Various', duration: 200, audioUrl: '',
                side: i < 4 ? 'A' as const : 'B' as const, order: i + 1, mixtapeId: 'hero',
              }))}
              size="lg"
            />
          </motion.div>

          <motion.div
            className="text-center max-w-lg space-y-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
          >
            <h1 className="text-[clamp(1.5rem,3.5vw,2.75rem)] font-semibold leading-[1.1] tracking-tight text-balance text-[#F5F5F5]">
              Turn memories into{' '}
              <span className="text-[#D97706] font-typewriter tracking-wide">mixtapes.</span>
            </h1>
            <Link
              href="/radio"
              className="inline-flex px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-all duration-200 hover:bg-[#D97706]/90 active:scale-[0.97]"
              style={{ background: '#D97706' }}
            >
              Tune in
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ───── TRENDING: THE ROTATION ───── */}
      <section id="trending" className="relative py-28 px-6">
        {/* Section header with radio flair */}
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <motion.div
                  className="w-1.5 h-1.5 rounded-full bg-[#EA580C]"
                  animate={{ opacity: [1, 0.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className="text-[10px] font-typewriter text-[#EA580C] tracking-[0.2em] uppercase">The Rotation</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#F5F5F5]">
                Trending mixtapes
              </h2>
              <p className="mt-1 text-sm text-[#737373] font-typewriter tracking-wide">
                Most popular tapes this week — curated by the community
              </p>
            </div>
            <Link
              href="#"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-typewriter text-[#737373] hover:text-[#F5F5F5] transition-colors duration-200 tracking-wider"
            >
              View all
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </motion.div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {loading && (
              <p className="col-span-full text-center text-sm font-typewriter text-[#404040] py-12 tracking-wide">
                Tuning in...
              </p>
            )}
            {!loading && mixtapes.length === 0 && (
              <p className="col-span-full text-center text-sm font-typewriter text-[#404040] py-12 tracking-wide">
                No mixtapes found. Be the first to create one.
              </p>
            )}
            {mixtapes.map((mixtape, i) => (
              <MixtapeCard key={mixtape.id} mixtape={mixtape} index={i} />
            ))}
          </div>

          <motion.div
            className="mt-8 text-center sm:hidden"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Link href="#" className="text-sm font-typewriter text-[#737373] hover:text-[#F5F5F5] transition-colors duration-200 tracking-wider">
              View all mixtapes &rarr;
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ───── MOOD FILTER ───── */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <motion.div
                className="w-1 h-1 rounded-full bg-[#D97706]"
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-[10px] font-typewriter text-[#D97706] tracking-[0.2em] uppercase">Filter</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#F5F5F5]">
              Browse by mood
            </h2>
            <p className="mt-1 text-sm text-[#737373] font-typewriter tracking-wide">
              What are you feeling today?
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <MoodSelector selected={selectedMood} onSelect={setSelectedMood} />
          </motion.div>
        </div>
      </section>

      {/* ───── DECADE FILTER ───── */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <motion.div
                className="w-1 h-1 rounded-full bg-[#0891B2]"
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              />
              <span className="text-[10px] font-typewriter text-[#0891B2] tracking-[0.2em] uppercase">Era</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#F5F5F5]">
              Browse by decade
            </h2>
            <p className="mt-1 text-sm text-[#737373] font-typewriter tracking-wide">
              Pick a decade and travel back in time
            </p>
          </motion.div>

          <motion.div
            className="flex items-center justify-center flex-wrap gap-1 p-1 rounded-lg mx-auto max-w-full"
            style={{ background: '#1A1A1A' }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            {YEAR_DECADES.map((decade) => {
              const isActive = selectedDecade === decade.value
              return (
                <button
                  key={decade.label}
                  onClick={() => setSelectedDecade(isActive ? undefined : decade.value)}
                  className="px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 font-typewriter tracking-wider"
                  style={{
                    background: isActive ? '#2A2A2A' : 'transparent',
                    color: isActive ? '#F5F5F5' : '#737373',
                  }}
                >
                  {decade.label}
                </button>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* ───── RADIO PLAYER ───── */}
      <section className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-[#D97706]"
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
              <span className="text-[10px] font-typewriter text-[#D97706] tracking-[0.2em] uppercase">Live Broadcast</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#F5F5F5]">
              Live radio
            </h2>
            <p className="mt-1 text-sm text-[#737373] font-typewriter tracking-wide">
              Curated mixtapes, twenty-four seven
            </p>
          </motion.div>

          <motion.div
            className="rounded-xl overflow-hidden"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            style={{
              background: '#111111',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {/* Top: Radio dial */}
            <div className="p-5 border-b border-[rgba(255,255,255,0.04)]">
              <RadioDial frequency="98.7" isScanning />
            </div>

            {/* Main content */}
            <div className="p-6 sm:p-8">
              <div className="grid sm:grid-cols-[1fr_auto] gap-8 items-center">
                <div className="space-y-5">
                  {/* Status row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <motion.div
                        className="w-2 h-2 rounded-full bg-[#D97706]"
                        animate={{ opacity: [1, 0.2, 1] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                      />
                      <span className="text-[10px] font-typewriter text-[#D97706] tracking-[0.15em] uppercase">Live</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <SignalMeter strength={75} isActive />
                      <span className="text-[10px] font-mono text-[#404040]">1,247</span>
                    </div>
                  </div>

                  {/* Track info */}
                  <div>
                    <p className="text-[9px] font-typewriter text-[#737373] tracking-[0.15em] uppercase mb-1">Now Playing</p>
                    <h3 className="text-xl font-semibold text-[#F5F5F5]">songs for the drive home</h3>
                    <p className="text-sm text-[#737373] mt-0.5 font-typewriter tracking-wide">
                      Side A &mdash; Track 1
                    </p>
                  </div>

                  {/* Progress */}
                  <div className="space-y-1">
                    <div className="h-1 rounded-full bg-[rgba(255,255,255,0.03)] overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-[#D97706]"
                        animate={{ width: ['30%', '70%', '45%', '80%', '35%'] }}
                        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] font-mono text-[#404040]">
                      <span>1:24</span>
                      <span>4:02</span>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-2">
                    <button className="w-9 h-9 rounded-lg border border-[rgba(255,255,255,0.06)] flex items-center justify-center text-[#737373] hover:text-[#F5F5F5] hover:border-[rgba(255,255,255,0.12)] transition-all">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="19,20 9,12 19,4" />
                        <rect x="5" y="4" width="2" height="16" rx="0.5" />
                      </svg>
                    </button>
                    <button className="w-10 h-10 rounded-lg bg-[#D97706] flex items-center justify-center transition-all duration-200 hover:bg-[#D97706]/90 active:scale-95">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                        <polygon points="8,5 19,12 8,19" />
                      </svg>
                    </button>
                    <button className="w-9 h-9 rounded-lg border border-[rgba(255,255,255,0.06)] flex items-center justify-center text-[#737373] hover:text-[#F5F5F5] hover:border-[rgba(255,255,255,0.12)] transition-all">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5,4 15,12 5,20" />
                        <rect x="17" y="4" width="2" height="16" rx="0.5" />
                      </svg>
                    </button>
                    <span className="ml-2 text-[10px] font-typewriter text-[#404040] tracking-wider">
                      Up next: Side B
                    </span>
                  </div>
                </div>

                {/* Artwork */}
                <div className="hidden sm:block">
                  <div className="w-40 h-40 rounded-lg overflow-hidden bg-[#1A1A1A] border border-[rgba(255,255,255,0.06)] flex items-center justify-center">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full border border-[rgba(217,119,6,0.15)]" />
                      <div className="w-8 h-8 rounded-full border border-[rgba(217,119,6,0.15)]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ───── CTA ───── */}
      <section className="py-32 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="space-y-6"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-[10px] font-typewriter text-[#737373] tracking-[0.2em] uppercase">Join the broadcast</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#F5F5F5]">
              Find your{' '}
              <span className="text-[#D97706] font-typewriter tracking-wide">frequency.</span>
            </h2>

            <p className="text-base text-[#737373] max-w-md mx-auto leading-relaxed font-typewriter tracking-wide">
              Every mixtape is a story waiting to be heard. Tune in and discover something real.
            </p>

            <div className="pt-2">
              <Link
                href="/radio"
                className="inline-flex px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-all duration-200 hover:bg-[#D97706]/90 active:scale-[0.97]"
                style={{ background: '#D97706' }}
              >
                Tune in to the broadcast
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
