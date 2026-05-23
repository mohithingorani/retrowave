import { FastifyPluginAsync } from 'fastify'

const DEEZER_BASE = 'https://api.deezer.com'

interface DeezerTrack {
  id: number
  title: string
  duration: number
  artist: { id: number; name: string }
  album: {
    id: number
    title: string
    cover: string
    cover_small: string
    cover_medium: string
    cover_big: string
  }
  preview: string
}

interface DeezerSearchResult {
  data: DeezerTrack[]
  total: number
}

export const deezerRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/deezer/search', async (request, reply) => {
    const query = request.query as {
      q?: string
      limit?: string
      index?: string
    }

    if (!query.q) {
      reply.code(400)
      return { error: 'Query parameter "q" is required' }
    }

    const params = new URLSearchParams({
      q: query.q,
      limit: query.limit || '15',
      index: query.index || '0',
    })

    const url = `${DEEZER_BASE}/search?${params}`
    const res = await fetch(url)

    if (!res.ok) {
      reply.code(res.status)
      return { error: 'Deezer API error' }
    }

    const data = (await res.json()) as DeezerSearchResult
    return {
      total: data.total || 0,
      tracks: (data.data || []).map((t) => ({
        id: String(t.id),
        title: t.title,
        artist: t.artist.name,
        artistId: String(t.artist.id),
        album: t.album.title,
        albumImage: t.album.cover_medium,
        duration: t.duration,
        audioUrl: t.preview,
        image: t.album.cover,
      })),
    }
  })

  fastify.get('/deezer/track/:id', async (request, reply) => {
    const { id } = request.params as { id: string }

    const url = `${DEEZER_BASE}/track/${id}`
    const res = await fetch(url)

    if (!res.ok) {
      reply.code(res.status)
      return { error: 'Deezer API error' }
    }

    const t = (await res.json()) as DeezerTrack
    return {
      id: String(t.id),
      title: t.title,
      artist: t.artist.name,
      artistId: String(t.artist.id),
      album: t.album.title,
      albumImage: t.album.cover_medium,
      duration: t.duration,
      audioUrl: t.preview,
      image: t.album.cover,
    }
  })

  fastify.get('/deezer/artist/:id/top', async (request, reply) => {
    const { id } = request.params as { id: string }
    const limit = (request.query as { limit?: string }).limit || '5'

    const url = `${DEEZER_BASE}/artist/${id}/top?limit=${limit}`
    const res = await fetch(url)

    if (!res.ok) {
      reply.code(res.status)
      return { error: 'Deezer API error' }
    }

    const data = (await res.json()) as DeezerSearchResult
    return {
      tracks: (data.data || []).map((t) => ({
        id: String(t.id),
        title: t.title,
        artist: t.artist.name,
        album: t.album.title,
        albumImage: t.album.cover_medium,
        duration: t.duration,
        audioUrl: t.preview,
      })),
    }
  })
}
