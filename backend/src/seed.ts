import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const IA_BASE = 'https://archive.org'
const IA_COLLECTION = 'royalty-free-music'

interface IAFile {
  name: string
  source: string
  format: string
  title?: string
  creator?: string
  album?: string
}

const USERNAMES = ['dj_cassette', 'neon_dreamer', 'static_hum', 'vinyl_ghost', 'frequency_jane']

// Genre keywords to group tracks into mixtapes
const MOOD_GENRES: { mood: string; keywords: string[] }[] = [
  { mood: 'chill', keywords: ['chill', 'hop', 'lounge', 'calm', 'warm', 'smooth'] },
  { mood: 'dreamy', keywords: ['ambient', 'dream', 'atmospheric', 'abstract', 'piano'] },
  { mood: 'energetic', keywords: ['rock', 'energetic', 'action', 'adrenaline', 'sport', 'cyberpunk', 'bass'] },
  { mood: 'melancholic', keywords: ['blues', 'sad', 'soul', 'melancholic', 'slow', 'emotional'] },
  { mood: 'nostalgic', keywords: ['retro', 'nostalgic', 'synthwave', 'vaporwave', '80s', 'electronic', 'funk'] },
]

function trackTitle(filename: string): string {
  return filename
    .replace(/\.mp3$/i, '')
    .replace(/\s*\(Royalty Free Music\)\s*/i, '')
    .replace(/\s*\(.*?\)\s*/g, ' ')
    .trim()
}

function guessArtist(title: string): string {
  // Use part of the title as a fake artist name
  const words = title.split(' ')
  if (words.length <= 2) return 'Various Artists'
  return words.slice(0, 2).join(' ')
}

function matchesMood(filename: string, keywords: string[]): boolean {
  const lower = filename.toLowerCase()
  return keywords.some((kw) => lower.includes(kw))
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

async function fetchTracks(): Promise<IAFile[]> {
  const url = `${IA_BASE}/metadata/${IA_COLLECTION}`
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to fetch IA metadata: ${res.status}`)
  }
  const data = (await res.json()) as { files?: IAFile[] }
  return (data.files || []).filter((f: IAFile) => f.name.endsWith('.mp3') && f.source === 'derivative')
}

function audioUrl(filename: string): string {
  return `${IA_BASE}/download/${IA_COLLECTION}/${encodeURIComponent(filename)}`
}

async function seed() {
  console.log('Fetching track list from Internet Archive...')
  const allTracks = await fetchTracks()
  console.log(`Found ${allTracks.length} MP3 tracks\n`)

  // Create users
  const users = await Promise.all(
    USERNAMES.map((username) =>
      prisma.user.upsert({
        where: { username },
        update: {},
        create: {
          username,
          displayName: username.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        },
      })
    )
  )
  console.log(`Created ${users.length} users\n`)

  let totalMixtapes = 0
  let totalTracks = 0

  for (const { mood, keywords } of MOOD_GENRES) {
    const matching = allTracks.filter((t) => matchesMood(t.name, keywords))

    if (matching.length === 0) {
      console.warn(`No tracks for mood "${mood}" (keywords: ${keywords.join(', ')}), skipping\n`)
      continue
    }

    // Pick up to 8 tracks for this mixtape
    const selected = matching.slice(0, 8)
    const author = pick(users)
    const title = genMixtapeTitle(mood)
    const year = 2020 + Math.floor(Math.random() * 6)

    const mixtape = await prisma.mixtape.create({
      data: {
        title,
        description: genDescription(mood),
        year,
        mood,
        authorId: author.id,
        likesCount: Math.floor(Math.random() * 50),
        commentsCount: Math.floor(Math.random() * 10),
        tracks: {
          create: selected.map((t, i) => {
            const displayTitle = trackTitle(t.name)
            return {
              title: displayTitle,
              artist: t.creator || guessArtist(displayTitle),
              album: t.album || 'Internet Archive',
              duration: 180 + Math.floor(Math.random() * 120),
              audioUrl: audioUrl(t.name),
              side: i < 4 ? 'A' : 'B',
              trackOrder: i + 1,
            }
          }),
        },
      },
    })

    totalMixtapes++
    totalTracks += selected.length
    console.log(`  ✓ "${title}" — ${selected.length} tracks (mood: ${mood})`)
  }

  console.log(`\nDone! ${totalMixtapes} mixtapes, ${totalTracks} tracks seeded.`)
}

function genMixtapeTitle(mood: string): string {
  const titles: Record<string, string[]> = {
    chill: ['lazy afternoon signals', 'coffee & static', 'slow waves', 'the twilight frequency'],
    dreamy: ['dreams in neon', 'vapor trails', 'midnight transmissions', 'lucid FM'],
    energetic: ['ignition sequence', 'adrenaline surge', 'the voltage mixtape', 'overdrive'],
    melancholic: ['rainy day signals', 'the loneliest frequency', 'fading stations', 'blue AM'],
    nostalgic: ['rewind cassette', 'the archive tapes', 'old frequencies', 'memory static'],
  }
  return pick(titles[mood] || ['untitled frequency'])
}

function genDescription(mood: string): string {
  const descs: Record<string, string[]> = {
    chill: ['Slow beats and warm static for lazy afternoons.', 'The perfect frequency to unwind to.', 'Let the waves carry you away.'],
    dreamy: ['A collection of hazy, atmospheric tracks for late-night listening.', 'Close your eyes and drift through the neon haze.'],
    energetic: ['High-voltage tracks to get the blood pumping.', 'Crank up the volume and let go.'],
    melancholic: ['For those lonely drives home at 2am.', 'Sad songs for rainy days and quiet nights.'],
    nostalgic: ['Pulled from the archives. Music that feels like a memory.', 'Rewind to a time you barely remember.'],
  }
  return pick(descs[mood] || ['A mixtape crafted for the right mood.'])
}

seed()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('Seed failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
