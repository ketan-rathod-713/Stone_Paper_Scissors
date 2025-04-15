import express from 'express'
import fs from 'fs'
import http from 'http'
import cors from 'cors'
import { Server } from 'socket.io'
import { stonePaperScissor } from './utils/GameLogic.js'

// Configure logging
const log = {
  info: (message, context = {}) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, context)
  },
  debug: (message, context = {}) => {
    console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, context)
  },
  error: (message, error = null, context = {}) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, {
      ...context,
      error: error ? error.message : null,
      stack: error ? error.stack : null
    })
  }
}

const app = express()
const server = http.createServer(app)
const port = process.env.PORT || 4000

// Middleware
app.use(cors())
app.use(express.json())

const clientOrigin = [
  'http://localhost:3000',
  'https://main--funny-torrone-71cf1a.netlify.app'
]

log.info('Server starting with configuration', {
  port,
  clientOrigins: clientOrigin
})

// Socket.io
const io = new Server(server, {
  cors: {
    origin: clientOrigin,
    methods: ['GET', 'POST']
  }
})

// Store active rooms and their data
const rooms = new Map()

// Helper function to clean up empty rooms
const cleanupRoom = roomId => {
  const room = rooms.get(roomId)
  if (room && room.players.size === 0) {
    rooms.delete(roomId)
    log.info(`Room ${roomId} deleted due to being empty`)
  }
}

// Helper function to get opponent socket
const getOpponentSocket = (room, socketId) => {
  for (const [id] of room.players) {
    if (id !== socketId) return id
  }
  return null
}

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the api of stone paper scissors'
  })
})

app.post('/api/v2/users/signup', (req, res) => {
  const payload = req.body
  const playerId = Math.floor(Math.random() * 900000) + 100000
  if (game.checkPlayerExists(playerId) == false) {
    game.addPlayer(playerId, payload.playerName)

    return res
      .json({
        message: 'User created successfully',
        data: { playerId }
      })
      .statusCode(200)
  } else {
    return res
      .json({
        message: 'Internal Server Error! Please try again later'
      })
      .statusCode(500)
  }
})

app.get('/api/v2/users/signin', (req, res) => {
  const payload = req.body
})

// Create room endpoint
// Generate random code and send it back
app.post('/api/v2/rooms', (req, res) => {
  const payload = req.body
  console.log({ payload })
  const roomCode = Math.floor(Math.random() * 900000) + 100000

  res.json({ roomCode })
})

// Request to join rooms
// Check if room exists
// Check if room is full
// Add user to the room ( upgrate connection to the websocket then onwards )
app.get('/api/v2/rooms/:roomCode/join', (req, res) => {
  const roomCode = req.params.roomCode
  const payload = req.body
  console.log({ roomCode, payload })

  res.json({ message: 'Joining room' })
})

app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to this api' })
})

app.get('/api/homeAudio', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'audio/mp3' })
  const exists = fs.existsSync('./public/gameMusic.mp3')
  console.log(exists)
  if (exists) {
    var rstream = fs.createReadStream('./public/gameMusic.mp3')
    rstream.pipe(res)
  } else {
    res.end('it is res 404')
  }
})

io.on('connection', socket => {
  log.info('New client connected', { socketId: socket.id })

  socket.on('createNewGame', ({ yourName, settings }) => {
    try {
      const roomId = Math.floor(100000 + Math.random() * 900000).toString()
      const room = {
        id: roomId,
        players: new Map(),
        gameState: {
          totalRounds: settings?.totalRounds || 10,
          currentRound: 0,
          selections: new Map(),
          scores: new Map()
        },
        settings: {
          totalRounds: settings?.totalRounds || 10
        }
      }
      rooms.set(roomId, room)
      socket.join(roomId)
      room.players.set(socket.id, { name: yourName, score: 0 })

      log.info('New game room created', {
        roomId,
        playerName: yourName,
        socketId: socket.id,
        settings: room.settings
      })

      socket.emit('createNewGame', { roomId, settings: room.settings })
    } catch (error) {
      log.error('Error creating new game', error, { socketId: socket.id })
      socket.emit('error', { message: 'Failed to create game' })
    }
  })

  socket.on('joinGame', ({ roomId, yourName }) => {
    try {
      log.debug('Attempting to join game', { roomId, playerName: yourName })

      const room = rooms.get(roomId)
      if (!room) {
        log.error('Room not found', null, { roomId })
        socket.emit('error', { message: 'Room not found' })
        return
      }

      if (room.players.size >= 2) {
        log.error('Room is full', null, { roomId })
        socket.emit('error', { message: 'Room is full' })
        return
      }

      socket.join(roomId)
      room.players.set(socket.id, { name: yourName, score: 0 })

      log.info('Player joined game', {
        roomId,
        playerName: yourName,
        socketId: socket.id,
        currentPlayers: room.players.size,
        settings: room.settings
      })

      // Notify both players that game can start
      io.to(roomId).emit('gameReady', {
        players: Array.from(room.players.values()).map(p => p.name),
        settings: room.settings
      })

      // Start countdown
      let countdown = 5
      const countdownInterval = setInterval(() => {
        io.to(roomId).emit('countdown', { countdown })
        countdown--
        if (countdown < 0) {
          clearInterval(countdownInterval)
          log.info('Game starting', { roomId })
          io.to(roomId).emit('gameStarted', {
            totalRounds: room.gameState.totalRounds
          })
        }
      }, 1000)
    } catch (error) {
      log.error('Error joining game', error, { roomId, socketId: socket.id })
      socket.emit('error', { message: 'Failed to join game' })
    }
  })

  socket.on('optionSelect', ({ optionSelected, roomId }) => {
    try {
      log.debug('Player selected option', {
        roomId,
        socketId: socket.id,
        optionSelected
      })

      const room = rooms.get(roomId)
      if (!room) {
        log.error('Room not found for option selection', null, { roomId })
        return
      }

      room.gameState.selections.set(socket.id, optionSelected)

      // Notify opponent that player has selected
      const opponentId = getOpponentSocket(room, socket.id)
      if (opponentId) {
        log.debug('Notifying opponent of selection', {
          roomId,
          opponentId,
          selectingPlayer: socket.id
        })
        io.to(opponentId).emit('opponentSelected')
      }

      // If both players have selected, process the round
      if (room.gameState.selections.size === 2) {
        const [player1Id, player2Id] = Array.from(
          room.gameState.selections.keys()
        )
        const player1Selection = room.gameState.selections.get(player1Id)
        const player2Selection = room.gameState.selections.get(player2Id)

        log.debug('Processing round', {
          roomId,
          player1: { id: player1Id, selection: player1Selection },
          player2: { id: player2Id, selection: player2Selection }
        })

        const result1 = stonePaperScissor(player1Selection, player2Selection)
        const result2 = stonePaperScissor(player2Selection, player1Selection)

        // Update scores
        if (result1 === 1) {
          room.players.get(player1Id).score++
        } else if (result2 === 1) {
          room.players.get(player2Id).score++
        }

        const player1 = room.players.get(player1Id)
        const player2 = room.players.get(player2Id)

        log.info('Round completed', {
          roomId,
          round: room.gameState.currentRound + 1,
          results: {
            player1: { name: player1.name, score: player1.score },
            player2: { name: player2.name, score: player2.score }
          }
        })

        // Send results to both players
        io.to(player1Id).emit('roundResult', {
          yourSelection: player1Selection,
          opponentSelection: player2Selection,
          result: result1,
          yourScore: player1.score,
          opponentScore: player2.score,
          currentRound: ++room.gameState.currentRound,
          yourName: player1.name,
          opponentName: player2.name
        })

        io.to(player2Id).emit('roundResult', {
          yourSelection: player2Selection,
          opponentSelection: player1Selection,
          result: result2,
          yourScore: player2.score,
          opponentScore: player1.score,
          currentRound: room.gameState.currentRound,
          yourName: player2.name,
          opponentName: player1.name
        })

        // Clear selections for next round
        room.gameState.selections.clear()

        // Check if game is over
        if (room.gameState.currentRound >= room.gameState.totalRounds) {
          const finalResult = {
            player1: { name: player1.name, score: player1.score },
            player2: { name: player2.name, score: player2.score },
            winner:
              player1.score > player2.score
                ? player1.name
                : player2.score > player1.score
                ? player2.name
                : 'draw'
          }

          log.info('Game over', {
            roomId,
            finalResult
          })

          io.to(roomId).emit('gameOver', finalResult)

          // Clean up room after a delay
          setTimeout(() => {
            io.in(roomId).socketsLeave(roomId)
            rooms.delete(roomId)
            log.info('Room cleaned up after game completion', { roomId })
          }, 5000)
        }
      }
    } catch (error) {
      log.error('Error processing option selection', error, {
        roomId,
        socketId: socket.id
      })
    }
  })

  socket.on('sendMessage', ({ message, roomId }) => {
    try {
      const room = rooms.get(roomId)
      if (!room) {
        log.error('Room not found for message', null, { roomId })
        return
      }

      const player = room.players.get(socket.id)
      if (!player) {
        log.error('Player not found in room', null, {
          roomId,
          socketId: socket.id
        })
        return
      }

      log.debug('Message sent', {
        roomId,
        playerName: player.name,
        message
      })

      io.to(roomId).emit('receiveMessage', {
        userName: player.name,
        messageText: message,
        timeHours: new Date().getHours(),
        timeMinutes: new Date().getMinutes()
      })
    } catch (error) {
      log.error('Error sending message', error, { roomId, socketId: socket.id })
    }
  })

  socket.on('disconnect', () => {
    try {
      log.info('Client disconnected', { socketId: socket.id })

      // Find and leave all rooms the socket is in
      const roomsToLeave = Array.from(socket.rooms)
      roomsToLeave.forEach(roomId => {
        if (roomId !== socket.id) {
          const room = rooms.get(roomId)
          if (room) {
            room.players.delete(socket.id)
            cleanupRoom(roomId)

            // Notify remaining player if any
            const remainingPlayers = Array.from(room.players.keys())
            if (remainingPlayers.length > 0) {
              log.info('Notifying remaining player of opponent disconnect', {
                roomId,
                remainingPlayer: remainingPlayers[0]
              })
              io.to(remainingPlayers[0]).emit('opponentLeft')
            }
          }
        }
      })
    } catch (error) {
      log.error('Error handling disconnect', error, { socketId: socket.id })
    }
  })
})

server.listen(port, () => {
  log.info(`Server running on port ${port}`)
})
