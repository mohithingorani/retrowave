'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import type { Mixtape } from '@/types'

interface MixtapeCardProps {
  mixtape: Mixtape
  index?: number
}

export default function MixtapeCard({ mixtape, index = 0 }: MixtapeCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: index * 0.07, ease: 'easeOut' }}
    >
      <Link href={`/mixtape/${mixtape.id}`} className="block group">
        <div
          className="relative rounded-xl overflow-hidden transition-all duration-400 group-hover:-translate-y-1"
          style={{
            background: '#111111',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 2px 16px rgba(0,0,0,0.3)',
          }}
        >
          {/* Album art */}
          <div className="relative aspect-square overflow-hidden bg-[#1A1A1A]">
            {mixtape.coverUrl && (
              <>
                {!imgLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex gap-2">
                      <div className="w-6 h-6 rounded-full border border-[rgba(217,119,6,0.15)]" />
                      <div className="w-6 h-6 rounded-full border border-[rgba(217,119,6,0.15)]" />
                    </div>
                  </div>
                )}
                <img
                  src={mixtape.coverUrl}
                  alt={mixtape.title}
                  className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => setImgLoaded(true)}
                />
              </>
            )}

            {/* Play overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-3 right-3">
                <div className="w-10 h-10 rounded-lg bg-[#D97706] flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                    <polygon points="8,5 19,12 8,19" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="absolute top-2 left-2 flex gap-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-typewriter bg-black/70 text-[#A3A3A3] tracking-wider uppercase">
                {mixtape.mood}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-typewriter bg-black/70 text-[#A3A3A3] tracking-wider uppercase">
                {mixtape.year}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="p-3.5 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium text-sm text-[#F5F5F5] truncate group-hover:text-[#D97706] transition-colors duration-300 leading-snug">
                {mixtape.title}
              </h3>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#737373]">
              <span className="font-typewriter text-[10px] tracking-wider">@{mixtape.author?.username ?? 'anonymous'}</span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-[rgba(255,255,255,0.04)]">
              <div className="flex items-center gap-3 text-[10px] font-mono text-[#404040]">
                <span>{mixtape.tracks.length} tracks</span>
                <span className="flex items-center gap-1">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  {mixtape.likesCount}
                </span>
              </div>
              <div className="flex gap-1">
                <div className="w-5 h-5 rounded-full bg-[#D97706]/20 flex items-center justify-center">
                  <span className="text-[8px] font-typewriter text-[#D97706] uppercase">
                    {mixtape.mood.slice(0, 2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
