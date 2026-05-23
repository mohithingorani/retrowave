'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import CassettePlayer from '@/components/cassette/CassettePlayer'
import SignalMeter from '@/components/ui/SignalMeter'

interface ChatMessage {
  userId: string
  username: string
  message: string
  timestamp: number
}

export default function ListeningRoomPage() {
  const params = useParams()
  const roomId = params.id as string
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [members, setMembers] = useState<{ userId: string; username: string }[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`)

    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'join-room',
        payload: {
          roomId,
          mixtapeId: '1',
          user: { id: 'anon', username: 'guest_' + Math.random().toString(36).slice(2, 6) },
        },
      }))
    }

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data)
      switch (msg.type) {
        case 'room-state':
          setMembers(msg.payload.members)
          setIsPlaying(msg.payload.isPlaying)
          break
        case 'user-joined':
          setMembers((prev) => [...prev, { userId: msg.payload.userId, username: msg.payload.username }])
          break
        case 'user-left':
          setMembers((prev) => prev.filter((m) => m.userId !== msg.payload.userId))
          break
        case 'chat-message':
          setMessages((prev) => [...prev, msg.payload])
          break
        case 'play':
          setIsPlaying(true)
          break
        case 'pause':
          setIsPlaying(false)
          break
      }
    }

    wsRef.current = ws
    return () => ws.close()
  }, [roomId])

  const sendMessage = () => {
    if (!chatInput.trim() || !wsRef.current) return
    wsRef.current.send(JSON.stringify({
      type: 'chat-message',
      payload: { username: 'guest', message: chatInput },
    }))
    setChatInput('')
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Player */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <motion.div
                      className="w-1.5 h-1.5 rounded-full bg-[#D97706]"
                      animate={{ opacity: [1, 0.2, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    />
                    <span className="text-[10px] font-typewriter text-[#D97706] tracking-[0.15em] uppercase">Room</span>
                  </div>
                  <h1 className="text-xl font-semibold tracking-tight text-[#F5F5F5] font-typewriter tracking-wide">
                    Listening Room
                  </h1>
                </div>
                <div className="flex items-center gap-2">
                  <SignalMeter strength={members.length > 0 ? 70 : 20} isActive={members.length > 0} />
                  <span className="text-[10px] font-mono text-[#737373]">{members.length} listening</span>
                </div>
              </div>

              <div className="flex justify-center">
                <CassettePlayer
                  size="xl"
                  isPlaying={isPlaying}
                />
              </div>

              {/* Members */}
              <div className="mt-8">
                <h3 className="text-[10px] font-typewriter text-[#737373] tracking-[0.15em] uppercase mb-3">In Room</h3>
                <div className="flex flex-wrap gap-2">
                  {members.length === 0 && (
                    <p className="text-[10px] font-mono text-[#404040]">Waiting for listeners...</p>
                  )}
                  {members.map((m) => (
                    <div
                      key={m.userId}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-[rgba(255,255,255,0.06)] text-xs font-mono text-[#737373]"
                    >
                      <motion.div
                        className="w-1.5 h-1.5 rounded-full bg-[#D97706]"
                        animate={{ opacity: [1, 0.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                      @{m.username}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: Chat */}
          <motion.div
            className="border border-[rgba(255,255,255,0.08)] rounded-xl overflow-hidden flex flex-col h-[600px]"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.12 }}
          >
            <div className="p-3 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between">
              <span className="text-[10px] font-typewriter text-[#737373] tracking-[0.15em] uppercase">Chat</span>
              <span className="text-[10px] font-mono text-[#404040]">{messages.length} messages</span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.length === 0 && (
                <p className="text-center text-[10px] font-typewriter text-[#404040] pt-8 tracking-wide">
                  No messages yet. Start the conversation.
                </p>
              )}
              {messages.map((msg, i) => (
                <div key={i} className="text-sm">
                  <span className="text-[#0891B2] font-typewriter text-xs tracking-wide">@{msg.username}</span>
                  <span className="text-[#737373] font-typewriter text-xs ml-2 tracking-wide">{msg.message}</span>
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-[rgba(255,255,255,0.06)] flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 bg-transparent border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-2 text-xs font-typewriter text-[#F5F5F5] placeholder:text-[#404040] focus:outline-none focus:border-[#D97706]/50 transition-colors tracking-wide"
              />
              <button
                onClick={sendMessage}
                className="px-3 py-2 rounded-lg text-xs font-typewriter tracking-wider text-white transition-all hover:bg-[#D97706]/90"
                style={{ background: '#D97706' }}
              >
                Send
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
