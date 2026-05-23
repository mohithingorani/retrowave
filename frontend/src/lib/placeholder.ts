type Pattern = 'geometric' | 'stripes' | 'grid' | 'blocks' | 'rings' | 'cross'

const ARTWORKS: { colors: string[]; pattern: Pattern }[] = [
  { colors: ['#D97706', '#EA580C'], pattern: 'geometric' },
  { colors: ['#0891B2', '#D97706'], pattern: 'stripes' },
  { colors: ['#EA580C', '#0891B2'], pattern: 'grid' },
  { colors: ['#D97706', '#0891B2'], pattern: 'blocks' },
  { colors: ['#EA580C', '#D97706'], pattern: 'rings' },
  { colors: ['#0891B2', '#EA580C'], pattern: 'cross' },
]

function svgPattern(pattern: Pattern, c: string[]): string {
  const w = 400, h = 400
  let inner = ''

  switch (pattern) {
    case 'geometric':
      inner = `
        <rect width="${w}" height="${h}" fill="${c[0]}15"/>
        <polygon points="200,40 360,200 200,360 40,200" fill="none" stroke="${c[0]}30" stroke-width="2"/>
        <polygon points="200,80 320,200 200,320 80,200" fill="none" stroke="${c[1]}20" stroke-width="1"/>
      `
      break
    case 'stripes':
      inner = `
        <rect width="${w}" height="${h}" fill="${c[0]}15"/>
        <line x1="0" y1="0" x2="800" y2="400" stroke="${c[0]}20" stroke-width="6"/>
        <line x1="-100" y1="100" x2="700" y2="500" stroke="${c[1]}12" stroke-width="6"/>
        <rect x="140" y="140" width="120" height="120" fill="none" stroke="${c[0]}25" stroke-width="2" rx="4"/>
      `
      break
    case 'grid':
      inner = `
        <rect width="${w}" height="${h}" fill="${c[0]}15"/>
        <line x1="0" y1="100" x2="400" y2="100" stroke="${c[1]}20" stroke-width="1"/>
        <line x1="0" y1="200" x2="400" y2="200" stroke="${c[1]}20" stroke-width="1"/>
        <line x1="0" y1="300" x2="400" y2="300" stroke="${c[1]}20" stroke-width="1"/>
        <line x1="100" y1="0" x2="100" y2="400" stroke="${c[0]}15" stroke-width="1"/>
        <line x1="200" y1="0" x2="200" y2="400" stroke="${c[0]}15" stroke-width="1"/>
        <line x1="300" y1="0" x2="300" y2="400" stroke="${c[0]}15" stroke-width="1"/>
        <rect x="160" y="160" width="80" height="80" fill="${c[1]}10" rx="2"/>
      `
      break
    case 'blocks':
      inner = `
        <rect width="${w}" height="${h}" fill="${c[0]}15"/>
        <rect x="40" y="40" width="150" height="150" fill="${c[0]}10" rx="4"/>
        <rect x="210" y="40" width="150" height="150" fill="${c[1]}10" rx="4"/>
        <rect x="40" y="210" width="150" height="150" fill="${c[1]}10" rx="4"/>
        <rect x="210" y="210" width="150" height="150" fill="${c[0]}10" rx="4"/>
      `
      break
    case 'rings':
      inner = `
        <rect width="${w}" height="${h}" fill="${c[0]}15"/>
        <circle cx="200" cy="200" r="80" fill="none" stroke="${c[0]}20" stroke-width="1.5"/>
        <circle cx="200" cy="200" r="60" fill="none" stroke="${c[1]}15" stroke-width="1.5"/>
        <circle cx="200" cy="200" r="40" fill="${c[0]}8"/>
        <circle cx="200" cy="200" r="20" fill="${c[1]}8"/>
      `
      break
    case 'cross':
      inner = `
        <rect width="${w}" height="${h}" fill="${c[0]}15"/>
        <line x1="0" y1="0" x2="400" y2="400" stroke="${c[0]}20" stroke-width="3"/>
        <line x1="400" y1="0" x2="0" y2="400" stroke="${c[1]}15" stroke-width="3"/>
        <circle cx="200" cy="200" r="60" fill="none" stroke="${c[0]}20" stroke-width="1"/>
        <circle cx="200" cy="200" r="40" fill="${c[1]}8"/>
      `
      break
  }

  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="#0A0A0A"/>${inner}</svg>`)}`
}

export function getPlaceholderCover(index: number): string {
  const art = ARTWORKS[index % ARTWORKS.length]
  return svgPattern(art.pattern, art.colors)
}
