'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import CassettePlayer from '@/components/cassette/CassettePlayer'
import RadioDial from '@/components/ui/RadioDial'
import SignalMeter from '@/components/ui/SignalMeter'
import type { Mixtape } from '@/types'

export default function RadioPage() {
  const [mixtape, setMixtape] = useState<Mixtape | null>(null)
  const [isLive] = useState(true)

  useEffect(() => {
    fetch('/api/mixtapes')
      .then((res) => res.json())
      .then((data) => {
        const tapes = Array.isArray(data) ? data : []
        if (tapes.length > 0) {
          setMixtape(tapes[Math.floor(Math.random() * tapes.length)])
        }
      })
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <motion.div
              className="w-2 h-2 rounded-full bg-[#D97706]"
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
            <span className="text-[10px] font-typewriter text-[#D97706] tracking-[0.2em] uppercase">Live Broadcast</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#F5F5F5] mb-1">
            Live Radio
          </h1>
          <p className="text-sm text-[#737373] font-typewriter tracking-wide">
            Curated mixtapes, twenty-four seven
          </p>
        </motion.div>

        <motion.div
          className="rounded-xl overflow-hidden mb-10"
          style={{
            background: '#111111',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Radio dial */}
          <div className="p-5 border-b border-[rgba(255,255,255,0.04)]">
            <RadioDial frequency="98.7" isScanning={isLive} />
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8">
            {/* Status */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-2 h-2 rounded-full bg-[#D97706]"
                  animate={{ opacity: [1, 0.2, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
                <span className="text-[10px] font-typewriter text-[#D97706] tracking-[0.15em] uppercase">
                  {isLive ? 'Live' : 'Offline'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <SignalMeter strength={80} isActive={isLive} />
                <span className="text-[10px] font-mono text-[#404040]">1,247 listeners</span>
              </div>
            </div>

            {/* Cassette */}
            <div className="flex justify-center mb-6">
              <CassettePlayer
                title={mixtape?.title}
                tracks={mixtape?.tracks}
                size="lg"
              />
            </div>

            {/* Now playing */}
            <div className="text-center">
              <div className="text-[9px] font-typewriter text-[#737373] tracking-[0.15em] uppercase mb-1">Now Playing</div>
              <div className="text-lg font-semibold text-[#F5F5F5] font-typewriter tracking-wide">
                {mixtape?.title ?? 'Tuning in...'}
              </div>
              <div className="text-sm text-[#737373] mt-0.5 font-typewriter tracking-wide">
                {mixtape ? `${mixtape.tracks[0]?.side ?? 'A'} Side &mdash; &ldquo;${mixtape.tracks[0]?.title ?? 'Unknown'}&rdquo;` : ''}
              </div>
              {mixtape && (
                <div className="mt-2 text-[10px] font-mono text-[#404040] italic">
                  &ldquo;{mixtape.description}&rdquo;
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Track history */}
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] font-typewriter text-[#737373] tracking-[0.2em] uppercase">Recently Played</span>
            <div className="flex-1 h-px bg-[rgba(255,255,255,0.04)]" />
          </div>
          {[
            { title: 'Gas Station Coffee', artist: 'Tommy Bell', time: '3 min ago' },
            { title: 'Neon Signs', artist: 'Diane Parks', time: '7 min ago' },
            { title: 'Diner Sign', artist: 'Tommy Bell', time: '12 min ago' },
            { title: 'Transmission Received', artist: 'Static Hum', time: '17 min ago' },
          ].map((track, i) => (
            <motion.div
              key={i}
              className="flex items-center justify-between p-3 rounded-lg"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-[#404040]">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <div className="text-sm text-[#F5F5F5] font-typewriter tracking-wide">{track.title}</div>
                  <div className="text-[10px] font-mono text-[#737373]">{track.artist}</div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-[#404040]">{track.time}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
