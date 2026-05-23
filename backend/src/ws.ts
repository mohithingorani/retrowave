import type { FastifyInstance } from 'fastify'
import type { WebSocket } from 'ws'

interface RoomMember {
  userId: string
  username: string
  ws: WebSocket
}

interface Room {
  mixtapeId: string
  currentTrackIndex: number
  isPlaying: boolean
  playbackTimestamp: number
  members: Map<string, RoomMember>
}

const rooms = new Map<string, Room>()

function broadcast(roomId: string, message: any) {
  const room = rooms.get(roomId)
  if (!room) return
  const data = JSON.stringify(message)
  room.members.forEach((member) => {
    if (member.ws.readyState === member.ws.OPEN) {
      member.ws.send(data)
    }
  })
}

export function registerWSHandler(fastify: FastifyInstance) {
  fastify.get('/ws', { websocket: true }, (socket, req) => {
    let userId = ''
    let currentRoomId = ''

    socket.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString())

        switch (msg.type) {
          case 'join-room': {
            const { roomId, user } = msg.payload
            userId = user.id
            currentRoomId = roomId

            if (!rooms.has(roomId)) {
              rooms.set(roomId, {
                mixtapeId: msg.payload.mixtapeId,
                currentTrackIndex: 0,
                isPlaying: false,
                playbackTimestamp: Date.now(),
                members: new Map(),
              })
            }

            const room = rooms.get(roomId)!
            room.members.set(user.id, { userId: user.id, username: user.username, ws: socket })

            broadcast(roomId, {
              type: 'user-joined',
              payload: { userId: user.id, username: user.username },
            })

            broadcast(roomId, {
              type: 'room-state',
              payload: {
                members: Array.from(room.members.values()).map((m) => ({
                  userId: m.userId,
                  username: m.username,
                })),
                currentTrackIndex: room.currentTrackIndex,
                isPlaying: room.isPlaying,
              },
            })
            break
          }

          case 'leave-room': {
            leaveRoom()
            break
          }

          case 'play': {
            const room = rooms.get(currentRoomId)
            if (room) {
              room.isPlaying = true
              room.playbackTimestamp = Date.now()
              broadcast(currentRoomId, { type: 'play', payload: { timestamp: Date.now() } })
            }
            break
          }

          case 'pause': {
            const room = rooms.get(currentRoomId)
            if (room) {
              room.isPlaying = false
              room.playbackTimestamp = Date.now()
              broadcast(currentRoomId, { type: 'pause', payload: { timestamp: Date.now() } })
            }
            break
          }

          case 'seek': {
            const room = rooms.get(currentRoomId)
            if (room) {
              room.currentTrackIndex = msg.payload.trackIndex
              room.playbackTimestamp = Date.now()
              broadcast(currentRoomId, {
                type: 'seek',
                payload: { trackIndex: msg.payload.trackIndex, timestamp: Date.now() },
              })
            }
            break
          }

          case 'chat-message': {
            broadcast(currentRoomId, {
              type: 'chat-message',
              payload: {
                userId,
                username: msg.payload.username,
                message: msg.payload.message,
                timestamp: Date.now(),
              },
            })
            break
          }
        }
      } catch {
        // ignore malformed messages
      }
    })

    socket.on('close', () => {
      leaveRoom()
    })

    function leaveRoom() {
      if (!currentRoomId) return
      const room = rooms.get(currentRoomId)
      if (room) {
        room.members.delete(userId)
        broadcast(currentRoomId, {
          type: 'user-left',
          payload: { userId },
        })
        if (room.members.size === 0) {
          rooms.delete(currentRoomId)
        }
      }
    }
  })
}
