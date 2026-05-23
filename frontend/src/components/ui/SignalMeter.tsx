'use client'

import { motion } from 'framer-motion'

interface SignalMeterProps {
  strength?: number
  isActive?: boolean
}

const BAR_DURATIONS = [0.8, 0.9, 1.0, 1.1, 0.85, 0.95, 1.05, 1.15, 0.82, 0.92, 1.02, 1.12]

export default function SignalMeter({ strength = 75, isActive = true }: SignalMeterProps) {
  const bars = 12

  return (
    <div className="flex items-end gap-[2px] h-6">
      {Array.from({ length: bars }, (_, i) => {
        const threshold = ((i + 1) / bars) * 100
        const isLit = strength >= threshold
        return (
          <motion.div
            key={i}
            className="w-1.5 rounded-t-sm"
            animate={
              isActive
                ? {
                    height: isLit ? ['60%', '100%', '60%'] : ['20%', '40%', '20%'],
                    opacity: isLit ? [0.6, 1, 0.6] : [0.2, 0.4, 0.2],
                  }
                : {
                    height: '20%',
                    opacity: 0.15,
                  }
            }
            transition={{
              duration: BAR_DURATIONS[i],
              repeat: Infinity,
              delay: i * 0.06,
              ease: 'easeInOut',
            }}
            style={{
              background: isLit
                ? i > bars * 0.7
                  ? '#0891B2'
                  : i > bars * 0.4
                    ? '#D97706'
                    : '#EA580C'
                : '#404040',
            }}
          />
        )
      })}
    </div>
  )
}
