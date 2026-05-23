import { FastifyPluginAsync } from 'fastify'
import { PrismaClient } from '@prisma/client'

interface Opts {
  prisma: PrismaClient
}

export const commentRoutes: FastifyPluginAsync<Opts> = async (fastify, opts) => {
  const { prisma } = opts

  fastify.get('/mixtapes/:id/comments', async (request, reply) => {
    const { id } = request.params as { id: string }

    const comments = await prisma.comment.findMany({
      where: { mixtapeId: id },
      include: { author: true },
      orderBy: { createdAt: 'desc' },
    })

    return comments.map((c) => ({
      id: c.id,
      content: c.content,
      authorId: c.authorId,
      author: c.author ? {
        id: c.author.id,
        username: c.author.username,
        displayName: c.author.displayName,
        avatarUrl: c.author.avatarUrl,
        createdAt: c.author.createdAt,
      } : undefined,
      mixtapeId: c.mixtapeId,
      createdAt: c.createdAt,
    }))
  })

  fastify.post('/mixtapes/:id/comments', async (request, reply) => {
    const { id } = request.params as { id: string }
    const { content, authorId } = request.body as { content: string; authorId: string }

    if (!content || !authorId) {
      reply.code(400)
      return { error: 'content and authorId are required' }
    }

    const comment = await prisma.$transaction(async (tx) => {
      const created = await tx.comment.create({
        data: { content, authorId, mixtapeId: id },
        include: { author: true },
      })

      await tx.mixtape.update({
        where: { id },
        data: { commentsCount: { increment: 1 } },
      })

      return created
    })

    reply.code(201)
    return {
      id: comment.id,
      content: comment.content,
      authorId: comment.authorId,
      author: comment.author ? {
        id: comment.author.id,
        username: comment.author.username,
        displayName: comment.author.displayName,
        avatarUrl: comment.author.avatarUrl,
        createdAt: comment.author.createdAt,
      } : undefined,
      mixtapeId: comment.mixtapeId,
      createdAt: comment.createdAt,
    }
  })
}
