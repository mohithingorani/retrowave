'use client'

import { motion } from 'framer-motion'

interface RadioDialProps {
  frequency?: string
  isScanning?: boolean
}

const FREQUENCIES = ['88.0', '92.0', '96.0', '98.7', '102.0', '106.0', '108.0']

export default function RadioDial({ frequency = '98.7', isScanning = false }: RadioDialProps) {
  const freqNum = parseFloat(frequency)
  const position = ((freqNum - 88) / (108 - 88)) * 100

  return (
    <div className="w-full">
      <div className="relative h-14 rounded-lg overflow-hidden bg-[#0A0A0A] border border-[rgba(255,255,255,0.06)]">
        {/* Frequency markings */}
        <div className="absolute inset-0 flex items-end pb-2 px-3">
          {FREQUENCIES.map((freq) => (
            <div key={freq} className="flex-1 flex flex-col items-center gap-1">
              <span
                className={`text-[9px] font-mono transition-colors duration-300 ${
                  freq === frequency ? 'text-[#D97706]' : 'text-[#404040]'
                }`}
              >
                {freq}
              </span>
              <div className={`w-px h-2 ${freq === frequency ? 'bg-[#D97706]' : 'bg-[rgba(255,255,255,0.06)]'}`} />
            </div>
          ))}
        </div>

        {/* Needle */}
        <motion.div
          className="absolute bottom-0 w-0.5 h-full bg-[#D97706] rounded-full"
          animate={{ left: `${position}%` }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          style={{ x: '-50%' }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#D97706] rounded-full" />
        </motion.div>

        {/* Scanning effect */}
        {isScanning && (
          <motion.div
            className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-[rgba(217,119,6,0.06)] to-transparent"
            animate={{ left: ['0%', '100%', '0%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />
        )}
      </div>

      {/* Frequency display */}
      <div className="flex items-center justify-center gap-3 mt-2">
        <span className="text-[10px] font-mono text-[#404040]">FM</span>
        <motion.span
          className="text-lg font-typewriter text-[#F5F5F5] tracking-widest"
          animate={isScanning ? { opacity: [1, 0.3, 1] } : {}}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          {frequency}
        </motion.span>
        <span className="text-[10px] font-mono text-[#404040]">MHz</span>
      </div>
    </div>
  )
}
