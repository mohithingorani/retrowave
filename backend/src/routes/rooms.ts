import { FastifyPluginAsync } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { getListeningRoom } from '../redis'

interface Opts {
  prisma: PrismaClient
}

export const roomRoutes: FastifyPluginAsync<Opts> = async (fastify) => {
  fastify.get('/rooms/:id', async (request, reply) => {
    const { id } = request.params as { id: string }

    const room = await getListeningRoom(id)
    if (!room) {
      reply.code(404)
      return { error: 'Room not found' }
    }

    return room
  })
}
