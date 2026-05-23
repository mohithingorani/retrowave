import { FastifyPluginAsync } from 'fastify'
import { PrismaClient } from '@prisma/client'

interface Opts {
  prisma: PrismaClient
}

function mapTrack(t: any) {
  return {
    id: t.id,
    title: t.title,
    artist: t.artist,
    album: t.album,
    duration: t.duration,
    audioUrl: t.audioUrl || '',
    coverUrl: t.coverUrl,
    side: t.side,
    order: t.trackOrder,
    mixtapeId: t.mixtapeId,
  }
}

function mapMixtape(m: any) {
  return {
    id: m.id,
    title: m.title,
    description: m.description || '',
    year: m.year,
    mood: m.mood,
    coverUrl: m.coverUrl,
    authorId: m.authorId,
    author: m.author ? {
      id: m.author.id,
      username: m.author.username,
      displayName: m.author.displayName,
      avatarUrl: m.author.avatarUrl,
      createdAt: m.author.createdAt,
    } : undefined,
    tracks: m.tracks ? m.tracks.map(mapTrack) : [],
    likesCount: m.likesCount,
    commentsCount: m.commentsCount,
    remixCount: m.remixCount,
    isCollaborative: m.isCollaborative,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
  }
}

export const mixtapeRoutes: FastifyPluginAsync<Opts> = async (fastify, opts) => {
  const { prisma } = opts

  fastify.get('/mixtapes', async (request, reply) => {
    const query = request.query as { mood?: string; decade?: string }

    const where: any = {}
    if (query.mood) {
      where.mood = query.mood
    }
    if (query.decade) {
      const decade = parseInt(query.decade, 10)
      where.year = { gte: decade, lt: decade + 10 }
    }

    const mixtapes = await prisma.mixtape.findMany({
      where,
      include: { author: true, tracks: true },
      orderBy: { likesCount: 'desc' },
    })

    return mixtapes.map(mapMixtape)
  })

  fastify.get('/mixtapes/:id', async (request, reply) => {
    const { id } = request.params as { id: string }

    const mixtape = await prisma.mixtape.findUnique({
      where: { id },
      include: { author: true, tracks: { orderBy: { trackOrder: 'asc' } } },
    })

    if (!mixtape) {
      reply.code(404)
      return { error: 'Mixtape not found' }
    }

    return mapMixtape(mixtape)
  })
}
