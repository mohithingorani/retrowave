import { FastifyPluginAsync } from 'fastify'
import { PrismaClient } from '@prisma/client'

interface Opts {
  prisma: PrismaClient
}

export const likeRoutes: FastifyPluginAsync<Opts> = async (fastify, opts) => {
  const { prisma } = opts

  fastify.post('/mixtapes/:id/likes', async (request, reply) => {
    const { id } = request.params as { id: string }
    const { userId } = request.body as { userId: string }

    if (!userId) {
      reply.code(400)
      return { error: 'userId is required' }
    }

    const existing = await prisma.like.findUnique({
      where: { userId_mixtapeId: { userId, mixtapeId: id } },
    })

    if (existing) {
      reply.code(409)
      return { error: 'Already liked' }
    }

    await prisma.$transaction(async (tx) => {
      await tx.like.create({ data: { userId, mixtapeId: id } })
      await tx.mixtape.update({
        where: { id },
        data: { likesCount: { increment: 1 } },
      })
    })

    const mixtape = await prisma.mixtape.findUnique({ where: { id } })
    return { likesCount: mixtape?.likesCount ?? 0 }
  })

  fastify.delete('/mixtapes/:id/likes', async (request, reply) => {
    const { id } = request.params as { id: string }
    const { userId } = request.body as { userId: string }

    if (!userId) {
      reply.code(400)
      return { error: 'userId is required' }
    }

    const existing = await prisma.like.findUnique({
      where: { userId_mixtapeId: { userId, mixtapeId: id } },
    })

    if (!existing) {
      reply.code(404)
      return { error: 'Like not found' }
    }

    await prisma.$transaction(async (tx) => {
      await tx.like.delete({ where: { id: existing.id } })
      await tx.mixtape.update({
        where: { id },
        data: { likesCount: { decrement: 1 } },
      })
    })

    const mixtape = await prisma.mixtape.findUnique({ where: { id } })
    return { likesCount: mixtape?.likesCount ?? 0 }
  })
}
