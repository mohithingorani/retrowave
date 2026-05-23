export default function Footer() {
  return (
    <footer className="relative z-10 mt-32 py-10 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="font-typewriter text-sm tracking-tight text-[#F5F5F5]">
            RetroWave
          </span>
          <span className="text-[10px] text-[#404040] font-typewriter tracking-wide">
            Turn memories into mixtapes.
          </span>
          <span className="hidden sm:inline text-[10px] text-[#404040]">&copy; {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  )
}
