export interface User {
  id: string
  username: string
  displayName: string
  avatarUrl?: string
  createdAt: string
}

export interface Track {
  id: string
  title: string
  artist: string
  album?: string
  duration: number
  audioUrl: string
  coverUrl?: string
  side: 'A' | 'B'
  order: number
  mixtapeId: string
}

export interface Mixtape {
  id: string
  title: string
  description: string
  year: number
  mood: Mood
  coverUrl?: string
  authorId: string
  author?: User
  tracks: Track[]
  likesCount: number
  commentsCount: number
  remixCount: number
  isCollaborative: boolean
  collaborators?: User[]
  createdAt: string
  updatedAt: string
}

export type Mood =
  | 'dreamy'
  | 'dark'
  | 'euphoric'
  | 'melancholic'
  | 'nostalgic'
  | 'romantic'
  | 'angsty'
  | 'chill'
  | 'energetic'
  | 'mysterious'

export interface Comment {
  id: string
  content: string
  authorId: string
  author?: User
  mixtapeId: string
  createdAt: string
}

export interface ListeningRoom {
  id: string
  mixtapeId: string
  mixtape?: Mixtape
  listeners: User[]
  currentTrackIndex: number
  isPlaying: boolean
  playbackTimestamp: number
}

export const MOODS: { id: Mood; label: string }[] = [
  { id: 'dreamy', label: 'Dreamy' },
  { id: 'dark', label: 'Dark' },
  { id: 'euphoric', label: 'Euphoric' },
  { id: 'melancholic', label: 'Melancholic' },
  { id: 'nostalgic', label: 'Nostalgic' },
  { id: 'romantic', label: 'Romantic' },
  { id: 'angsty', label: 'Angsty' },
  { id: 'chill', label: 'Chill' },
  { id: 'energetic', label: 'Energetic' },
  { id: 'mysterious', label: 'Mysterious' },
]

export const YEAR_DECADES = [
  { label: 'All', value: undefined },
  { label: '\'80s', value: 1980 },
  { label: '\'90s', value: 1990 },
  { label: '\'00s', value: 2000 },
  { label: '\'10s', value: 2010 },
] as const
