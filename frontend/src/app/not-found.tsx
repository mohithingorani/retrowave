import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="text-center max-w-md space-y-6">
        {/* Static bars visual */}
        <div className="flex items-center justify-center gap-[3px] h-16 mb-4">
          {Array.from({ length: 24 }, (_, i) => (
            <div
              key={i}
              className="w-1 rounded-full"
              style={{
                height: `${20 + Math.sin(i * 1.5) * 25 + Math.random() * 15}%`,
                background: i % 3 === 0 ? '#EA580C' : i % 3 === 1 ? '#D97706' : '#404040',
                opacity: 0.6 + Math.random() * 0.4,
              }}
            />
          ))}
        </div>

        <h1 className="text-3xl font-semibold tracking-tight text-[#F5F5F5]">
          Station Not Found
        </h1>
        <p className="text-sm text-[#737373] font-typewriter tracking-wide leading-relaxed">
          This frequency doesn&apos;t seem to exist. The signal cuts in and out — just static and distant hum.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-all duration-200 hover:bg-[#D97706]/90 active:scale-[0.97]"
            style={{ background: '#D97706' }}
          >
            Return to the dial
          </Link>
        </div>
      </div>
    </div>
  )
}
