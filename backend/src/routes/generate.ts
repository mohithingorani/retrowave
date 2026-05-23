import { FastifyPluginAsync } from 'fastify'
import { PrismaClient } from '@prisma/client'

interface Opts {
  prisma: PrismaClient
}

export const generateRoutes: FastifyPluginAsync<Opts> = async (fastify) => {
  fastify.post('/generate', async (request, reply) => {
    const { mood, year, prompt } = request.body as {
      mood?: string
      year?: number
      prompt?: string
    }

    await new Promise((r) => setTimeout(r, 2000))

    const tracks = Array.from({ length: 8 }, (_, i) => ({
      id: `gen-${Date.now()}-${i}`,
      title: `${prompt || 'Untitled'} - Track ${i + 1}`,
      artist: 'Generated Artist',
      duration: 180 + Math.floor(Math.random() * 120),
      side: i < 4 ? 'A' : 'B',
      order: i + 1,
    }))

    return {
      id: `gen-${Date.now()}`,
      title: prompt || `${mood || 'chill'} mixtape`,
      description: `AI-generated ${mood || 'chill'} mixtape from ${year || 'the archives'}`,
      year: year || new Date().getFullYear(),
      mood: mood || 'chill',
      tracks,
      likesCount: 0,
      commentsCount: 0,
      remixCount: 0,
      isCollaborative: false,
    }
  })
}
