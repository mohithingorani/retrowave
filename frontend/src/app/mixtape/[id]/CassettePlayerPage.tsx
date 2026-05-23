'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import CassettePlayer from '@/components/cassette/CassettePlayer'
import SignalMeter from '@/components/ui/SignalMeter'
import type { Mixtape } from '@/types'

function getUserId(): string {
  if (typeof window === 'undefined') return 'anon'
  let id = localStorage.getItem('retrofm_user_id')
  if (!id) {
    id = 'user_' + Math.random().toString(36).slice(2, 10)
    localStorage.setItem('retrofm_user_id', id)
  }
  return id
}

export default function CassettePlayerPage({ id }: { id: string }) {
  const [mixtape, setMixtape] = useState<Mixtape | null>(null)
  const [comments, setComments] = useState<{ user: string; text: string; time: string }[]>([])
  const [comment, setComment] = useState('')
  const [likesCount, setLikesCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/mixtapes/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setMixtape(data)
        setLikesCount(data.likesCount ?? 0)
      })
      .catch(() => setMixtape(null))
  }, [id])

  useEffect(() => {
    fetch(`/api/mixtapes/${id}/comments`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setComments(
            data.map((c: any) => ({
              user: c.author?.username ?? 'anonymous',
              text: c.content,
              time: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '',
            }))
          )
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const handleSend = () => {
    if (!comment.trim()) return
    const userId = getUserId()
    fetch(`/api/mixtapes/${id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: comment.trim(), authorId: userId }),
    })
      .then((res) => res.json())
      .then((c) => {
        setComments((prev) => [
          ...prev,
          { user: c.author?.username ?? 'guest', text: c.content, time: 'just now' },
        ])
        setComment('')
      })
      .catch(() => {})
  }

  const handleLike = () => {
    const userId = getUserId()
    fetch(`/api/mixtapes/${id}/likes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
      .then((res) => res.json())
      .then((data) => setLikesCount(data.likesCount ?? likesCount + 1))
      .catch(() => {})
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-6 flex items-center justify-center">
        <p className="text-sm font-typewriter text-[#404040] tracking-wide">Loading...</p>
      </div>
    )
  }

  if (!mixtape) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-6 flex items-center justify-center">
        <p className="text-sm font-typewriter text-[#404040] tracking-wide">Mixtape not found.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left: Cassette Player */}
          <motion.div
            className="flex justify-center lg:sticky lg:top-28"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CassettePlayer
              title={mixtape.title}
              tracks={mixtape.tracks}
              year={mixtape.year}
              size="xl"
            />
          </motion.div>

          {/* Right: Details */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <motion.div
                  className="w-1.5 h-1.5 rounded-full bg-[#D97706]"
                  animate={{ opacity: [1, 0.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className="text-[10px] font-typewriter text-[#D97706] tracking-[0.15em] uppercase">Mixtape</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#F5F5F5] mb-2 font-typewriter tracking-wide">
                {mixtape.title}
              </h1>
              <div className="flex items-center gap-3 text-sm text-[#737373] flex-wrap">
                <span className="font-typewriter tracking-wide">by @{mixtape.author?.username}</span>
                <span className="w-px h-3 bg-[rgba(255,255,255,0.06)]" />
                <span className="font-typewriter">{mixtape.year}</span>
                <span className="w-px h-3 bg-[rgba(255,255,255,0.06)]" />
                <span className="text-[10px] font-typewriter text-[#0891B2] tracking-wider uppercase">{mixtape.mood}</span>
              </div>
            </div>

            {/* Signal meter */}
            <div className="flex items-center gap-3 p-3 rounded-lg border border-[rgba(255,255,255,0.06)]">
              <SignalMeter strength={70} isActive />
              <div className="text-[10px] font-typewriter text-[#737373] tracking-wider">
                <span className="text-[#D97706]">Strong</span> signal &middot; {mixtape.tracks.length} tracks
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-[10px] font-typewriter text-[#737373] tracking-[0.15em] uppercase mb-2">Description</h3>
              <p className="text-sm text-[#A3A3A3] leading-relaxed font-typewriter tracking-wide">
                &ldquo;{mixtape.description}&rdquo;
              </p>
            </div>

            {/* Tracklist */}
            <div>
              <h3 className="text-[10px] font-typewriter text-[#737373] tracking-[0.15em] uppercase mb-4">Tracklist</h3>
              <div className="space-y-1">
                {mixtape.tracks.map((track, i) => (
                  <motion.div
                    key={track.id}
                    className="flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-[rgba(255,255,255,0.02)]"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-[#404040] w-6">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <div className="text-sm text-[#F5F5F5] font-typewriter tracking-wide">{track.title}</div>
                        <div className="text-[10px] font-mono text-[#737373]">{track.artist}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-[#404040]">
                      {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button onClick={handleLike} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-typewriter tracking-wider border border-[rgba(255,255,255,0.08)] text-[#737373] hover:text-[#F5F5F5] hover:border-[rgba(255,255,255,0.16)] transition-all">
                &#9829; {likesCount}
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-typewriter tracking-wider border border-[rgba(255,255,255,0.08)] text-[#737373] hover:text-[#F5F5F5] hover:border-[rgba(255,255,255,0.16)] transition-all">
                &#8635; Remix
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-typewriter tracking-wider border border-[rgba(255,255,255,0.08)] text-[#737373] hover:text-[#F5F5F5] hover:border-[rgba(255,255,255,0.16)] transition-all">
                &#8853; Share
              </button>
            </div>

            {/* Comments */}
            <div>
              <h3 className="text-[10px] font-typewriter text-[#737373] tracking-[0.15em] uppercase mb-4">
                Comments ({comments.length})
              </h3>
              <div className="flex gap-3 mb-6">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Leave a comment..."
                  className="flex-1 bg-transparent border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-2 text-sm text-[#F5F5F5] placeholder:text-[#404040] focus:outline-none focus:border-[#D97706]/50 transition-colors font-typewriter tracking-wide"
                />
                <button
                  onClick={handleSend}
                  className="px-4 py-2 rounded-lg text-xs font-typewriter tracking-wider text-white transition-all hover:bg-[#D97706]/90"
                  style={{ background: '#D97706' }}
                >
                  Send
                </button>
              </div>

              {/* Comments */}
              <div className="space-y-3">
                {comments.map((c, i) => (
                  <motion.div
                    key={i}
                    className="p-3 rounded-lg border border-[rgba(255,255,255,0.06)]"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-[#0891B2] font-typewriter tracking-wide">@{c.user}</span>
                      <span className="text-[10px] font-mono text-[#404040]">{c.time}</span>
                    </div>
                    <p className="text-sm text-[#737373] font-typewriter tracking-wide">{c.text}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
