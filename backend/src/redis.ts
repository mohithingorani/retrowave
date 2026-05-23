import Redis from 'ioredis'

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'

let client: Redis | null = null

export function getRedis(): Redis {
  if (!client) {
    client = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    })
  }
  return client
}

export async function cacheMixtapeViews(mixtapeId: string): Promise<number> {
  const r = getRedis()
  const count = await r.incr(`mixtape:views:${mixtapeId}`)
  return count
}

export async function getMixtapeViews(mixtapeId: string): Promise<number> {
  const r = getRedis()
  const count = await r.get(`mixtape:views:${mixtapeId}`)
  return count ? parseInt(count, 10) : 0
}

export async function setListeningRoom(roomId: string, data: any, ttl = 86400): Promise<void> {
  const r = getRedis()
  await r.setex(`room:${roomId}`, ttl, JSON.stringify(data))
}

export async function getListeningRoom(roomId: string): Promise<any | null> {
  const r = getRedis()
  const data = await r.get(`room:${roomId}`)
  return data ? JSON.parse(data) : null
}

export async function addRoomListener(roomId: string, userId: string): Promise<void> {
  const r = getRedis()
  await r.sadd(`room:${roomId}:listeners`, userId)
}

export async function removeRoomListener(roomId: string, userId: string): Promise<void> {
  const r = getRedis()
  await r.srem(`room:${roomId}:listeners`, userId)
}

export async function getRoomListeners(roomId: string): Promise<string[]> {
  const r = getRedis()
  return r.smembers(`room:${roomId}:listeners`)
}
