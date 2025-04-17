import React, { useEffect, useState, useRef } from 'react'
import socketIO from 'socket.io-client'
import AlertComponent from '../components/AlertComponent'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// ALL ASSETS
import BgImage from '../../backgroundImages/bg2.jpg'
import Stone from '../../gameIcons/stones.svg'
import Paper from '../../gameIcons/paper.svg'
import Scissors from '../../gameIcons/scissors.svg'
import { NumberToSVG, OptionToNumber } from '../components/Utils' // reducing code is good practice

import Card from '../components/Card'

// Websocket Server Location
let serverLocation = 'https://stonepaperscissorsgameserver.onrender.com/'
if (window.location.href.includes('localhost')) {
  serverLocation = 'http://localhost:4000'
}

// Create Socket Connection
const socket = socketIO(process.env.SERVER_LOCATION || serverLocation, {
  autoConnect: true
})

// GameWithFriend Component
const GameWithFriend = () => {
  const [code, setCode] = useState('')
  const [selectedElement, setSelectedElement] = useState('')
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [countdown, setCountdown] = useState(5)
  const [error, setError] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [roomSettings, setRoomSettings] = useState({
    totalRounds: 10
  })

  // Pages
  const [pages, setPages] = useState({
    firstPage: true,
    secondPage: false,
    thirdPage: false,
    fourthPage: false,
    fifthPage: false
  })

  const [gameState, setGameState] = useState({
    yourName: '',
    opponentName: '',
    messageText: '',
    gameCounter: 10,
    yourScore: 0,
    opponentScore: 0,
    currentRound: 0
  })

  const [messages, setMessages] = useState([
    {
      userName: 'System',
      messageText: 'Welcome to the game!',
      timeHours: new Date().getHours(),
      timeMinutes: new Date().getMinutes()
    }
  ])

  const [selected, setSelected] = useState(false)

  useEffect(() => {
    const yourName = JSON.parse(localStorage.getItem('yourName')) || 'Player'
    setGameState(prev => ({ ...prev, yourName }))

    socket.on('createNewGame', ({ roomId, settings }) => {
      setCode(roomId)
      setRoomSettings(settings)
      moveToSecondPage()
    })

    socket.on('error', ({ message }) => {
      setError(message)
      setTimeout(() => setError(''), 3000)
    })

    socket.on('gameReady', ({ players, settings }) => {
      const opponentName = players.find(name => name !== gameState.yourName)
      setGameState(prev => ({ ...prev, opponentName }))
      setRoomSettings(settings)
      moveToThirdPage()
    })

    socket.on('countdown', ({ countdown }) => {
      setCountdown(countdown)
    })

    socket.on('gameStarted', ({ totalRounds }) => {
      setGameState(prev => ({ ...prev, gameCounter: totalRounds }))
      moveToFourthPage()
    })

    socket.on('opponentSelected', () => {
      toast.info(`${gameState.opponentName} has made their selection!`)
    })

    socket.on(
      'roundResult',
      ({
        yourSelection,
        opponentSelection,
        result,
        yourScore,
        opponentScore,
        currentRound,
        yourName,
        opponentName
      }) => {
        setGameState(prev => ({
          ...prev,
          yourScore,
          opponentScore,
          currentRound,
          yourName,
          opponentName
        }))

        // Show result in toast
        let resultMessage = ''
        if (result === 1) {
          resultMessage = `Round ${currentRound}: You won! You chose ${
            NumberToSVG[yourSelection].split('/').pop().split('.')[0]
          } and ${opponentName} chose ${
            NumberToSVG[opponentSelection].split('/').pop().split('.')[0]
          }`
        } else if (result === -1) {
          resultMessage = `Round ${currentRound}: You lost! You chose ${
            NumberToSVG[yourSelection].split('/').pop().split('.')[0]
          } and ${opponentName} chose ${
            NumberToSVG[opponentSelection].split('/').pop().split('.')[0]
          }`
        } else {
          resultMessage = `Round ${currentRound}: It's a draw! Both chose ${
            NumberToSVG[yourSelection].split('/').pop().split('.')[0]
          }`
        }
        toast.info(resultMessage)

        // Reset selection after a delay
        setTimeout(() => {
          setSelectedElement('')
          setSelected(false)
        }, 1000)
      }
    )

    socket.on('gameOver', ({ player1, player2, winner }) => {
      // Determine if the current player is player1 or player2
      const isPlayer1 = player1.name === gameState.yourName

      // Set scores based on player position
      setGameState(prev => ({
        ...prev,
        yourScore: isPlayer1 ? player1.score : player2.score,
        opponentScore: isPlayer1 ? player2.score : player1.score
      }))

      // Show game over message in toast
      let gameOverMessage = ''
      if (winner === 'draw') {
        gameOverMessage = 'Game Over: The match ended in a draw!'
      } else {
        if (isPlayer1) {
          gameOverMessage =
            winner === player1.name
              ? 'Game Over: You won the game!'
              : `Game Over: ${player2.name} won the game!`
        } else {
          gameOverMessage =
            winner === player2.name
              ? 'Game Over: You won the game!'
              : `Game Over: ${player1.name} won the game!`
        }
      }
      toast.success(gameOverMessage)

      moveToFifthPage()
    })

    socket.on('receiveMessage', message => {
      toast.info(`${message.userName}: ${message.messageText}`)
    })

    socket.on('opponentLeft', () => {
      toast.error('Your opponent has left the game')
      setTimeout(() => window.location.reload(), 3000)
    })

    return () => {
      socket.off('createNewGame')
      socket.off('error')
      socket.off('gameReady')
      socket.off('countdown')
      socket.off('gameStarted')
      socket.off('opponentSelected')
      socket.off('roundResult')
      socket.off('gameOver')
      socket.off('receiveMessage')
      socket.off('opponentLeft')
    }
  }, [])

  const createNewGame = () => {
    socket.emit('createNewGame', {
      yourName: gameState.yourName,
      settings: roomSettings
    })
  }

  const joinGame = () => {
    if (!code) {
      setError('Please enter a room code')
      return
    }
    socket.emit('joinGame', { roomId: code, yourName: gameState.yourName })
  }

  const handleSelection = selectedOption => {
    if (selected) return
    setSelectedElement(selectedOption)
    setSelected(true)
    socket.emit('optionSelect', {
      optionSelected: OptionToNumber[selectedOption],
      roomId: code
    })
  }

  const sendMessage = e => {
    e.preventDefault()
    if (!gameState.messageText.trim()) return
    socket.emit('sendMessage', {
      message: gameState.messageText,
      roomId: code
    })
    setGameState(prev => ({ ...prev, messageText: '' }))
  }

  const moveToSecondPage = () => {
    setPages({
      firstPage: false,
      secondPage: true,
      thirdPage: false,
      fourthPage: false,
      fifthPage: false
    })
  }

  const moveToThirdPage = () => {
    setPages({
      firstPage: false,
      secondPage: false,
      thirdPage: true,
      fourthPage: false,
      fifthPage: false
    })
  }

  const moveToFourthPage = () => {
    setPages({
      firstPage: false,
      secondPage: false,
      thirdPage: false,
      fourthPage: true,
      fifthPage: false
    })
  }

  const moveToFifthPage = () => {
    setPages({
      firstPage: false,
      secondPage: false,
      thirdPage: false,
      fourthPage: false,
      fifthPage: true
    })
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100'>
      <img
        className='absolute inset-0 w-full h-full object-cover opacity-20'
        src={BgImage}
        alt='background'
      />

      {error && (
        <div className='fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50'>
          {error}
        </div>
      )}

      {pages.firstPage && (
        <div className='relative min-h-screen flex items-center justify-center p-4'>
          <div className='max-w-md w-full p-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl'>
            <h1 className='text-3xl font-bold text-center text-gray-800 mb-8'>
              Play with Friend
            </h1>

            {/* Settings Toggle Button */}
            <div className='mb-6 flex justify-center'>
              <button
                className='bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors'
                onClick={() => setShowSettings(!showSettings)}
              >
                {showSettings ? 'Hide Settings' : 'Show Settings'}
              </button>
            </div>

            {/* Settings Panel */}
            {showSettings && (
              <div className='mb-6 p-4 bg-gray-50 rounded-xl'>
                <h2 className='text-lg font-semibold text-gray-700 mb-4'>
                  Room Settings
                </h2>

                <div className='space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Number of Rounds
                    </label>
                    <input
                      type='number'
                      min='1'
                      max='20'
                      value={roomSettings.totalRounds}
                      onChange={e =>
                        setRoomSettings(prev => ({
                          ...prev,
                          totalRounds: Math.min(
                            20,
                            Math.max(1, parseInt(e.target.value) || 1)
                          )
                        }))
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                    <p className='text-xs text-gray-500 mt-1'>
                      Min: 1, Max: 20
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className='flex flex-col gap-6'>
              <button
                className='w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold 
                          hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200
                          shadow-lg hover:shadow-xl'
                onClick={createNewGame}
              >
                Create New Game
              </button>

              <div className='relative'>
                <input
                  className='w-full px-4 py-3 text-center text-gray-800 bg-white/80 border-2 border-blue-500 rounded-xl 
                            text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                            placeholder-gray-400'
                  placeholder='Enter 6 Digit Code'
                  value={code}
                  onChange={e => setCode(e.target.value)}
                />
              </div>

              <button
                className='w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold 
                          hover:from-purple-600 hover:to-pink-700 transform hover:scale-105 transition-all duration-200
                          shadow-lg hover:shadow-xl'
                onClick={joinGame}
              >
                Join Game
              </button>
            </div>
          </div>
        </div>
      )}

      {pages.secondPage && (
        <div className='relative min-h-screen flex flex-col items-center justify-center p-4'>
          <div className='max-w-md w-full p-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl text-center'>
            <h2 className='text-xl text-gray-600 mb-2'>
              Share this code with your friend
            </h2>
            <h1 className='text-5xl font-bold text-gray-800 mb-8 tracking-widest'>
              {code}
            </h1>

            <div className='mb-6 p-4 bg-gray-50 rounded-xl'>
              <h3 className='text-lg font-semibold text-gray-700 mb-2'>
                Game Settings
              </h3>
              <p className='text-gray-600'>
                Total Rounds: {roomSettings.totalRounds}
              </p>
            </div>

            <div className='flex flex-col items-center gap-4'>
              <p className='text-lg text-gray-600'>Waiting for opponent...</p>
              <AlertComponent
                className='mt-4'
                type='spokes'
                color='blueviolet'
              />
            </div>
          </div>
        </div>
      )}

      {pages.thirdPage && (
        <div className='relative min-h-screen flex flex-col items-center justify-center p-4'>
          <div className='max-w-md w-full p-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl text-center'>
            <h3 className='text-2xl text-green-600 mb-4'>
              Establishing Connection...
            </h3>
            <h2 className='text-3xl text-indigo-600 mb-6'>Game Starting In</h2>
            <h1 className='text-6xl font-bold text-gray-800'>{countdown}</h1>
          </div>
        </div>
      )}

      {pages.fourthPage && (
        <div className='min-h-screen p-4'>
          <div className='max-w-6xl mx-auto'>
            <div className='text-center mb-8'>
              <h1 className='text-4xl font-bold text-gray-800'>
                Round {gameState.currentRound + 1}
              </h1>
              <div className='flex justify-center gap-8 mt-4'>
                <div className='bg-green-50 p-4 rounded-xl'>
                  <p className='text-sm text-gray-600'>{gameState.yourName}</p>
                  <p className='text-2xl font-bold text-green-600'>
                    {gameState.yourScore}
                  </p>
                </div>
                <div className='bg-red-50 p-4 rounded-xl'>
                  <p className='text-sm text-gray-600'>
                    {gameState.opponentName}
                  </p>
                  <p className='text-2xl font-bold text-red-600'>
                    {gameState.opponentScore}
                  </p>
                </div>
              </div>
            </div>

            <div className='grid md:grid-cols-2 gap-6'>
              <div className='bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl'>
                <h2 className='text-2xl font-bold text-center text-gray-800 mb-6'>
                  Your Move
                </h2>
                <div className='grid gap-4'>
                  <Card
                    elementName='stone'
                    elementImage={Stone}
                    selectedElement={selectedElement}
                    selected={selected}
                    handleSelection={handleSelection}
                  />
                  <Card
                    elementName='paper'
                    elementImage={Paper}
                    selectedElement={selectedElement}
                    selected={selected}
                    handleSelection={handleSelection}
                  />
                  <Card
                    elementName='scissors'
                    elementImage={Scissors}
                    selectedElement={selectedElement}
                    selected={selected}
                    handleSelection={handleSelection}
                  />
                </div>
              </div>

              <div className='bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl'>
                <div className='flex flex-col h-full'>
                  <h2 className='text-2xl font-bold text-center text-gray-800 mb-6'>
                    Chat
                  </h2>
                  <form onSubmit={sendMessage} className='mt-4'>
                    <div className='flex gap-2'>
                      <input
                        type='text'
                        value={gameState.messageText}
                        onChange={e =>
                          setGameState(prev => ({
                            ...prev,
                            messageText: e.target.value
                          }))
                        }
                        className='flex-1 px-4 py-2 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-blue-500'
                        placeholder='Type a message...'
                      />
                      <button
                        type='submit'
                        className='bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition-colors'
                      >
                        Send
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {pages.fifthPage && (
        <div className='relative min-h-screen flex items-center justify-center p-4'>
          <div className='max-w-md w-full p-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl text-center'>
            <h1 className='text-4xl font-bold text-gray-800 mb-6'>Game Over</h1>

            <div className='grid grid-cols-2 gap-4 mb-8'>
              <div className='bg-green-50 p-4 rounded-xl'>
                <p className='text-sm text-gray-600'>{gameState.yourName}</p>
                <p className='text-2xl font-bold text-green-600'>
                  {gameState.yourScore}
                </p>
              </div>
              <div className='bg-red-50 p-4 rounded-xl'>
                <p className='text-sm text-gray-600'>
                  {gameState.opponentName}
                </p>
                <p className='text-2xl font-bold text-red-600'>
                  {gameState.opponentScore}
                </p>
              </div>
            </div>

            <h2 className='text-2xl font-semibold text-indigo-600 mb-8'>
              {gameState.yourScore > gameState.opponentScore
                ? 'You Win!'
                : gameState.opponentScore > gameState.yourScore
                ? `${gameState.opponentName} Wins!`
                : "It's a Draw!"}
            </h2>

            <button
              className='w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold
                        hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200
                        shadow-lg hover:shadow-xl'
              onClick={() => window.location.reload()}
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  )
}

export default GameWithFriend

// if new item added then move focus there
function Item ({ children }) {
  const ref = useRef()

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [])

  return (
    <div className='Item' ref={ref}>
      {children}
    </div>
  )
}
