'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { Track } from '@/types'
import { useAudio, useTapeHiss } from '@/hooks/useAudio'

interface CassettePlayerProps {
  title?: string
  tracks?: Track[]
  year?: number
  coverUrl?: string
  isPlaying?: boolean
  onPlay?: () => void
  onPause?: () => void
  onTrackChange?: (index: number) => void
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const SIZE_MAP = {
  sm: { w: 500, h: 270 },
  md: { w: 650, h: 345 },
  lg: { w: 860, h: 450 },
  xl: { w: 1100, h: 575 },
}

const FREQ_LABELS = ['88', '92', '96', '98', '102', '106', '108']

export default function CassettePlayer({
  title = 'Untitled Mixtape',
  tracks = [],
  year,
  coverUrl,
  isPlaying: externalPlaying,
  onPlay,
  onPause,
  onTrackChange,
  className = '',
  size = 'lg',
}: CassettePlayerProps) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [internalPlaying, setInternalPlaying] = useState(false)
  const [fakeProgress, setFakeProgress] = useState(0)
  const [fakeTime, setFakeTime] = useState(0)

  const currentTrack = tracks[currentTrackIndex]
  const hasRealAudio = !!currentTrack?.audioUrl

  const audio = useAudio(hasRealAudio ? currentTrack.audioUrl : undefined)
  const tapeHiss = useTapeHiss()

  const playing = externalPlaying ?? (hasRealAudio ? audio.isPlaying : internalPlaying)
  const dims = SIZE_MAP[size] || SIZE_MAP.lg

  // Auto-advance to next track when current one ends
  const wasPlayingRef = useRef(false)
  useEffect(() => {
    if (hasRealAudio) {
      if (wasPlayingRef.current && !audio.isPlaying && audio.duration > 0 && Math.abs(audio.currentTime - audio.duration) < 0.5) {
        handleNext()
      }
      wasPlayingRef.current = audio.isPlaying
    }
  }, [audio.isPlaying, audio.currentTime, audio.duration, hasRealAudio])

  // Auto-play new track when switching tracks while playing
  const prevTrackIdRef = useRef('')
  useEffect(() => {
    const trackId = currentTrack?.id || ''
    if (prevTrackIdRef.current && prevTrackIdRef.current !== trackId && playing && hasRealAudio) {
      const t = setTimeout(() => audio.play(), 100)
      return () => clearTimeout(t)
    }
    prevTrackIdRef.current = trackId
  }, [currentTrackIndex])

  // Tape hiss follows playback
  useEffect(() => {
    if (playing && hasRealAudio) {
      tapeHiss.start()
    } else {
      tapeHiss.stop()
    }
    return () => tapeHiss.stop()
  }, [playing, hasRealAudio])

  // Real audio progress
  const realProgress = audio.duration > 0 ? (audio.currentTime / audio.duration) * 100 : 0

  // Fake progress for demo mode (hero, radio page with fake tracks)
  useEffect(() => {
    if (playing && !hasRealAudio) {
      const interval = setInterval(() => {
        setFakeProgress((p) => (p >= 100 ? 0 : p + 0.35))
        setFakeTime((t) => t + 0.2)
      }, 200)
      return () => clearInterval(interval)
    }
  }, [playing, hasRealAudio])

  useEffect(() => {
    if (!playing && !hasRealAudio) {
      setFakeProgress(0)
      setFakeTime(0)
    }
  }, [playing, hasRealAudio, currentTrackIndex])

  const progress = hasRealAudio ? realProgress : fakeProgress
  const time = hasRealAudio ? audio.currentTime : fakeTime

  const handlePlayPause = useCallback(() => {
    const wasPlaying = playing
    if (hasRealAudio) {
      if (audio.isPlaying) {
        audio.pause()
      } else {
        audio.play()
      }
    } else {
      setInternalPlaying(!playing)
    }
    if (wasPlaying) { onPause?.() } else { onPlay?.() }
  }, [playing, hasRealAudio, audio, onPlay, onPause])

  const changeTrack = useCallback((newIndex: number) => {
    setCurrentTrackIndex(newIndex)
    setFakeProgress(0)
    setFakeTime(0)
    onTrackChange?.(newIndex)
  }, [onTrackChange])

  const handlePrev = useCallback(() => {
    changeTrack(currentTrackIndex > 0 ? currentTrackIndex - 1 : tracks.length - 1)
  }, [currentTrackIndex, tracks.length, changeTrack])

  const handleNext = useCallback(() => {
    changeTrack(currentTrackIndex < tracks.length - 1 ? currentTrackIndex + 1 : 0)
  }, [currentTrackIndex, tracks.length, changeTrack])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === ' ' || e.key === 'Space') {
        e.preventDefault()
        handlePlayPause()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handlePrev()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        handleNext()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handlePlayPause, handlePrev, handleNext])

  const needlePos = hasRealAudio ? `${realProgress}%` : `${fakeProgress}%`
  const mins = Math.floor(time / 60)
  const secs = Math.floor(time % 60)
  const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`
  const durationStr = hasRealAudio && audio.duration > 0
    ? `${Math.floor(audio.duration / 60)}:${Math.floor(audio.duration % 60).toString().padStart(2, '0')}`
    : '4:02'

  return (
    <div className={className} style={{ width: '100%', maxWidth: `min(${dims.w}px, calc(100vw - 2rem))` }}>
      <div
        className="rounded-xl overflow-hidden relative"
        style={{
          aspectRatio: `${dims.w} / ${dims.h}`,
          width: '100%',
          boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
          background: 'linear-gradient(180deg, #1E1E1E 0%, #181818 15%, #141414 50%, #111111 85%, #0D0D0D 100%)',
        }}
      >
        {/* ─── TOP BAR ─── */}
        <div
          className="flex items-center justify-between px-4"
          style={{
            height: '26px',
            background: 'linear-gradient(180deg, #0A0A0A 0%, #0D0D0D 100%)',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
          }}
        >
          <span className="text-[#D97706] font-mono font-medium" style={{ fontSize: '9px', letterSpacing: '0.05em' }}>
            RETROWAVE
          </span>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#0891B2] animate-pulse" style={{ opacity: 0.7 }} />
          </div>
        </div>

        {/* ─── BODY ─── */}
        <div className="flex" style={{ height: 'calc(100% - 46px)' }}>
          {/* SPEAKER GRILLE */}
          <div className="p-1.5" style={{ width: '26%' }}>
            <div
              className="h-full rounded-md overflow-hidden relative"
              style={{
                background: 'linear-gradient(180deg, #060606 0%, #0A0A0A 100%)',
                boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5)',
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `
                    repeating-linear-gradient(90deg, transparent 0px, transparent 4px, rgba(255,255,255,0.025) 4px, rgba(255,255,255,0.025) 5px),
                    repeating-linear-gradient(0deg, transparent 0px, transparent 4px, rgba(255,255,255,0.025) 4px, rgba(255,255,255,0.025) 5px)
                  `,
                }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 40%)',
                }}
              />
            </div>
          </div>

          {/* TUNER PANEL */}
          <div className="p-1.5" style={{ width: '52%' }}>
            <div
              className="h-full rounded-md overflow-hidden flex flex-col px-3 py-2"
              style={{
                background: 'linear-gradient(180deg, #13131A 0%, #111116 50%, #0E0E12 100%)',
                boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.3)',
              }}
            >
              {/* Frequency dial */}
              <div className="relative h-8 shrink-0">
                <div className="flex items-end justify-between px-1 h-full">
                  {FREQ_LABELS.map((freq) => (
                    <div key={freq} className="flex flex-col items-center gap-0.5">
                      <span
                        className="font-mono"
                        style={{
                          fontSize: '6px',
                          color: freq === '98' ? '#D97706' : '#404040',
                        }}
                      >
                        {freq}
                      </span>
                      <div
                        className="w-px"
                        style={{
                          height: '6px',
                          background: freq === '98' ? '#D97706' : 'rgba(255,255,255,0.06)',
                        }}
                      />
                    </div>
                  ))}
                </div>
                <span className="absolute right-0 bottom-0 font-mono text-[#404040]" style={{ fontSize: '6px' }}>MHz</span>

                {/* Needle */}
                <div
                  className="absolute bottom-0 w-0.5 h-full"
                  style={{
                    left: needlePos,
                    background: '#D97706',
                    transform: 'translateX(-50%)',
                    transition: hasRealAudio ? 'none' : 'left 0.2s linear',
                  }}
                >
                  <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#D97706]" />
                </div>
                <div
                  className="absolute bottom-0"
                  style={{
                    left: `calc(${needlePos} - 12px)`,
                    width: '24px',
                    height: '100%',
                    background: 'radial-gradient(ellipse at center, rgba(217,119,6,0.08) 0%, transparent 70%)',
                    pointerEvents: 'none',
                  }}
                />
              </div>

              {/* LCD */}
              <div className="flex-1 min-h-0 mt-1.5 rounded bg-[rgba(8,8,12,0.9)] px-2 py-1 flex flex-col justify-between">
                <div>
                  <span className="font-mono text-[#404040]" style={{ fontSize: '6px' }}>NOW PLAYING</span>
                  <div className="overflow-hidden whitespace-nowrap">
                    <span
                      className="font-semibold text-[#F5F5F5]"
                      style={{
                        fontSize: 'clamp(9px, 1.5vw, 13px)',
                        display: 'inline-block',
                        animation: playing ? 'marquee 8s linear infinite' : 'none',
                      }}
                    >
                      {currentTrack?.title || title}
                    </span>
                  </div>
                  {currentTrack && (
                    <span className="text-[#737373] block truncate" style={{ fontSize: '9px' }}>
                      {currentTrack.artist}
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div className="mt-auto">
                  <div className="h-1 rounded-full bg-[rgba(255,255,255,0.03)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#D97706]"
                      style={{ width: `${Math.min(progress, 100)}%`, transition: hasRealAudio ? 'width 0.25s linear' : 'none' }}
                    />
                  </div>
                  <div className="flex justify-between font-mono text-[#404040]" style={{ fontSize: '7px' }}>
                    <span>{timeStr}</span>
                    <span>{durationStr}</span>
                  </div>
                </div>

                {/* Transport controls */}
                <div className="flex items-center justify-center gap-1 mt-1">
                  <button
                    onClick={handlePrev}
                    className="flex items-center justify-center rounded"
                    style={{
                      width: '22px', height: '20px',
                      background: 'linear-gradient(180deg, #1A1A1A 0%, #111111 100%)',
                      border: '0.5px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="#737373">
                      <polygon points="16,18 8,12 16,6" />
                      <rect x="6" y="6" width="2" height="12" rx="0.5" />
                    </svg>
                  </button>
                  <button
                    onClick={handlePlayPause}
                    className="flex items-center justify-center rounded text-white"
                    style={{
                      width: '22px', height: '20px',
                      background: playing
                        ? 'linear-gradient(180deg, #EA580C 0%, #C0480A 100%)'
                        : 'linear-gradient(180deg, #D97706 0%, #B86300 100%)',
                    }}
                  >
                    {playing ? (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                        <rect x="7" y="5" width="3.5" height="14" rx="0.5" />
                        <rect x="13.5" y="5" width="3.5" height="14" rx="0.5" />
                      </svg>
                    ) : (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                        <polygon points="9,6 18,12 9,18" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex items-center justify-center rounded"
                    style={{
                      width: '22px', height: '20px',
                      background: 'linear-gradient(180deg, #1A1A1A 0%, #111111 100%)',
                      border: '0.5px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="#737373">
                      <polygon points="8,6 16,12 8,18" />
                      <rect x="16" y="6" width="2" height="12" rx="0.5" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* CONTROLS PANEL */}
          <div className="p-1.5" style={{ width: '22%' }}>
            <div
              className="h-full rounded-md flex flex-col items-center justify-center gap-1 px-1"
              style={{
                background: 'linear-gradient(180deg, #151515 0%, #0E0E0E 100%)',
                boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.2)',
              }}
            >
              {/* ON AIR */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div
                    className="w-6 h-6 rounded-full absolute -inset-1"
                    style={{
                      background: playing
                        ? 'radial-gradient(circle, rgba(217,119,6,0.4) 0%, transparent 70%)'
                        : 'radial-gradient(circle, rgba(64,64,64,0.3) 0%, transparent 70%)',
                      animation: playing ? 'pulse-glow 2s ease-in-out infinite' : 'none',
                    }}
                  />
                  <div
                    className="w-2.5 h-2.5 rounded-full relative z-10"
                    style={{
                      background: playing ? '#D97706' : '#404040',
                      boxShadow: playing ? '0 0 6px rgba(217,119,6,0.6)' : 'none',
                      animation: playing ? 'pulse-glow 2s ease-in-out infinite' : 'none',
                    }}
                  />
                </div>
                <span
                  className="font-mono text-center mt-0.5"
                  style={{ fontSize: '6px', color: playing ? '#D97706' : '#404040' }}
                >
                  ON AIR
                </span>
              </div>

              {/* SIGNAL METER */}
              <div className="flex flex-col items-center">
                <div className="flex items-end gap-px" style={{ height: '14px' }}>
                  {Array.from({ length: 7 }, (_, i) => {
                    const isLit = playing && Math.sin(time * 2 + i * 0.7) > 0.1 + i * 0.1
                    return (
                      <div
                        key={i}
                        className="w-1 rounded-t"
                        style={{
                          height: isLit ? `${50 + Math.sin(time * 3 + i) * 30 + 20}%` : '20%',
                          background: isLit
                            ? i > 4 ? '#0891B2' : i > 2 ? '#D97706' : '#EA580C'
                            : '#1A1A1A',
                          transition: 'height 0.15s, background 0.15s',
                        }}
                      />
                    )
                  })}
                </div>
                <span className="font-mono text-[#404040] mt-0.5" style={{ fontSize: '5px' }}>SIGNAL</span>
              </div>

              {/* VOLUME KNOB */}
              <div className="flex flex-col items-center mt-0.5">
                <div className="relative" style={{ width: '28px', height: '28px' }}>
                  <div
                    className="w-full h-full rounded-full"
                    style={{
                      background: 'radial-gradient(circle at 35% 35%, #3A3A3A 0%, #2A2A2A 50%, #111111 100%)',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    }}
                  >
                    <div
                      className="rounded-full absolute"
                      style={{
                        width: '50%', height: '50%',
                        top: '25%', left: '25%',
                        background: '#1A1A1A',
                      }}
                    />
                    <div
                      className="absolute rounded-full"
                      style={{
                        width: '2px', height: '35%',
                        top: '15%', left: '50%',
                        transform: 'translateX(-50%) rotate(45deg)',
                        background: '#D97706',
                        transformOrigin: 'bottom center',
                      }}
                    />
                  </div>
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: 'conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.03) 10deg, transparent 20deg, rgba(255,255,255,0.03) 30deg, transparent 40deg, rgba(255,255,255,0.03) 50deg, transparent 60deg, rgba(255,255,255,0.03) 70deg, transparent 80deg, rgba(255,255,255,0.03) 90deg, transparent 100deg, rgba(255,255,255,0.03) 110deg, transparent 120deg, rgba(255,255,255,0.03) 130deg, transparent 140deg, rgba(255,255,255,0.03) 150deg, transparent 160deg, rgba(255,255,255,0.03) 170deg, transparent 180deg, rgba(255,255,255,0.03) 190deg, transparent 200deg, rgba(255,255,255,0.03) 210deg, transparent 220deg, rgba(255,255,255,0.03) 230deg, transparent 240deg, rgba(255,255,255,0.03) 250deg, transparent 260deg, rgba(255,255,255,0.03) 270deg, transparent 280deg, rgba(255,255,255,0.03) 290deg, transparent 300deg, rgba(255,255,255,0.03) 310deg, transparent 320deg, rgba(255,255,255,0.03) 330deg, transparent 340deg, rgba(255,255,255,0.03) 350deg, transparent 360deg)',
                    }}
                  />
                </div>
                <span className="font-mono text-[#404040] mt-0.5" style={{ fontSize: '5px' }}>VOL</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── BOTTOM BAR ─── */}
        <div
          className="flex items-center justify-center"
          style={{
            height: '20px',
            background: '#0A0A0A',
            borderTop: '0.5px solid rgba(255,255,255,0.03)',
          }}
        >
          {currentTrack && (
            <span className="font-mono text-[#2A2A2A]" style={{ fontSize: '7px' }}>
              SIDE {currentTrack.side}
            </span>
          )}
        </div>

        {/* ─── AMBIENT GLOW OVERLAY ─── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 20%, rgba(217,119,6,0.02) 0%, transparent 50%)',
          }}
        />
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          25% { transform: translateX(calc(-50% - 15px)); }
          50% { transform: translateX(calc(-50% - 15px)); }
          75% { transform: translateX(0); }
          100% { transform: translateX(0); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
