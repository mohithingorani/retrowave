import Fastify from 'fastify'
import cors from '@fastify/cors'
import websocket from '@fastify/websocket'
import { PrismaClient } from '@prisma/client'
import { mixtapeRoutes } from './routes/mixtapes'
import { commentRoutes } from './routes/comments'
import { likeRoutes } from './routes/likes'
import { generateRoutes } from './routes/generate'
import { roomRoutes } from './routes/rooms'
import { deezerRoutes } from './routes/deezer'
import { registerWSHandler } from './ws'

const prisma = new PrismaClient()
const fastify = Fastify({ logger: true })

async function main() {
  await fastify.register(cors, { origin: true })
  await fastify.register(websocket)

  await fastify.register(mixtapeRoutes, { prefix: '/api', prisma })
  await fastify.register(commentRoutes, { prefix: '/api', prisma })
  await fastify.register(likeRoutes, { prefix: '/api', prisma })
  await fastify.register(generateRoutes, { prefix: '/api', prisma })
  await fastify.register(roomRoutes, { prefix: '/api', prisma })
  await fastify.register(deezerRoutes, { prefix: '/api' })

  registerWSHandler(fastify)

  const port = parseInt(process.env.PORT || '3001', 10)
  await fastify.listen({ port, host: '0.0.0.0' })
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
