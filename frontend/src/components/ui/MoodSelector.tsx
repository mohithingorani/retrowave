'use client'

import { type Mood, MOODS } from '@/types'

interface MoodSelectorProps {
  selected?: Mood
  onSelect: (mood: Mood | undefined) => void
}

export default function MoodSelector({ selected, onSelect }: MoodSelectorProps) {
  return (
    <div className="flex items-center justify-center flex-wrap gap-1 p-1 rounded-lg mx-auto max-w-full" style={{ background: '#1A1A1A' }}>
      {MOODS.map((mood) => {
        const isActive = selected === mood.id
        return (
          <button
            key={mood.id}
            onClick={() => onSelect(isActive ? undefined : mood.id)}
            className="px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 font-typewriter tracking-wider"
            style={{
              background: isActive ? '#2A2A2A' : 'transparent',
              color: isActive ? '#F5F5F5' : '#737373',
            }}
          >
            {mood.label}
          </button>
        )
      })}
    </div>
  )
}
