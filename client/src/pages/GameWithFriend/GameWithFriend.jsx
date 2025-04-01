import React, { useEffect, useState, useRef } from 'react'
import socketIO from 'socket.io-client'
import AlertComponent from '../components/AlertComponent'

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
  const [code, setCode] = useState()
  const [selectedElement, setSelectedElement] = useState('')
  const [isChatOpen, setIsChatOpen] = useState(false)

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
    opponentSVG: NumberToSVG[5]
  })
  const [timer, setTimer] = useState(10)

  const [messages, setMessages] = useState([
    {
      userName: 'Admin',
      messageText: 'Hello! How are you?',
      timeHours: new Date().getHours(),
      timeMinutes: new Date().getMinutes()
    }
  ])

  // For Fourth Page game
  const [selected, setSelected] = useState(false)

  const handleSelection = event => {
    const selected = event.currentTarget.id.substring(11)
    const selectedElement = event.target

    console.log(selected)

    // selectedElement.classList.add("computerSelectedOption");
    setSelectedElement(event.currentTarget.id)
    // updating state for useEffect to do some work related to sideEffects
    setSelected(true) // Now ig no one can do anything

    socket.emit('optionSelect', {
      optionSelected: OptionToNumber[selected], // send in number formate
      optionNumber: gameState.gameCounter
    })
  }

  useEffect(() => {
    console.log('timer changed')
  }, [timer])

  useEffect(() => {
    console.log('UseEffect called')
    console.log(socket)

    const yourName = JSON.parse(localStorage.getItem('yourName'))
    if (yourName) {
      setGameState(prevState => ({
        ...prevState,
        yourName
      }))
    } else {
      setGameState(prevState => ({
        ...prevState,
        yourName: 'Random Guy'
      }))
    }

    socket.connect()

    // all listeners are here

    socket.on('createNewGame', message => {
      const roomId = message.roomId + '' // IMP - THERE IS DIFFERENCE BETWEEN NUMBER AND STRING
      setCode(prevState => roomId)

      // moveToSecondPage()
    })

    socket.on('timerStarted', message => {
      const totalTimeCounter = message.timer

      setTimer(totalTimeCounter)
      console.log('Timer started')

      moveToThirdPage()
    })

    socket.on('timer', message => {
      const timer = message.timer

      console.log(timer)

      setTimer(prevState => timer)
    })

    socket.on('gameStarted', messages => {
      const totalCounts = messages.totalCounts

      setGameState(prevState => ({
        ...prevState,
        gameCounter: totalCounts
      }))

      moveToFourthPage()
    })

    socket.on('gameOver', message => {
      // const {mySelections, opponentSelections, result} = message

      moveToFifthPage()
    })

    socket.on('optionSelectionResult', message => {
      const { result, opponentSelection, mySelection, optionCount } = message

      console.log(result)

      console.log(message)

      setGameState(prevState => ({
        ...prevState,
        gameCounter: optionCount,
        opponentSVG: NumberToSVG[opponentSelection]
      }))

      socket.on('opponentSelectedOption', () => {
        console.log('opponent selected something')

        // set check mark
        setGameState(prevState => ({
          ...prevState,
          opponentSVG: NumberToSVG[4] // 4 is for checkmark
        }))
      })

      setMessages(prevState => [
        ...prevState,
        {
          userName: 'System Generated',
          messageText:
            'I selected ' +
            mySelection +
            ' and opponent Selected ' +
            opponentSelection,
          timeHours: new Date().getHours(),
          timeMinutes: new Date().getMinutes()
        }
      ])
      setMessages(prevState => [
        ...prevState,
        {
          userName: 'System Generated',
          messageText: 'WON!!',
          timeHours: new Date().getHours(),
          timeMinutes: new Date().getMinutes()
        }
      ])

      setTimeout(() => {
        setSelectedElement('')
        setSelected(false)
      }, 1000)
    })

    socket.on('receiveMessage', message => {
      console.log('message recieved', message)
      setMessages(prevState => [...prevState, message])
    })

    socket.on('error', message => {
      if (message.type === 'userLeft') {
        setMessages(prevState => [
          ...prevState,
          {
            userName: 'System Generated',
            messageText: message.message,
            timeHours: new Date().getHours(),
            timeMinutes: new Date().getMinutes()
          }
        ])
      }
    })

    return () => {
      console.log('cleanup function')
    }
  }, [])

  const createNewGame = () => {
    console.log('create new game', gameState)
    socket.emit('createNewGame', {
      yourName: gameState.yourName
    })
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

  const joinGame = () => {
    console.log('join new game')

    if (!code) return

    socket.emit('joinGame', {
      roomId: code,
      yourName: gameState.yourName
    })

    moveToSecondPage()
  }

  const handleCodeChange = event => {
    console.log(event.target.value)
    setCode(prevState => event.target.value)
  }

  const sendMessageHandler = event => {
    event.preventDefault()
    socket.emit('sendMessage', {
      messageText: gameState.messageText
    })

    const message = {
      userName: gameState.yourName,
      messageText: gameState.messageText,
      timeHours: new Date().getHours(),
      timeMinutes: new Date().getMinutes()
    }

    setMessages(prevState => [...prevState, message])

    setGameState(prevState => ({
      ...prevState,
      messageText: ''
    }))
  }

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-100'>
      <img
        className='bgGameWithFriend absolute z-[-1] object-cover w-full h-full'
        src={BgImage}
        alt='vs'
      />

      {pages.firstPage && (
        <div className='absolute bottom-10 w-11/12 md:w-2/5 px-4 py-6 bg-opacity-80 bg-gray-900 rounded-lg'>
          <button
            className='FriendCreateNewGame FriendButton w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xl font-semibold shadow-lg hover:bg-blue-600 transition-colors'
            onClick={createNewGame}
          >
            CREATE NEW GAME
          </button>

          <div className='inputCodeForGame my-8'>
            <input
              className='w-full px-4 py-2 text-center text-white bg-transparent border-2 border-blue-500 rounded-md text-4xl tracking-widest focus:outline-none'
              placeholder='Enter 6 Digit Code Here'
              value={code}
              onChange={handleCodeChange}
            />
          </div>

          <button
            className='FriendJoinGame FriendButton w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xl font-semibold shadow-lg hover:bg-blue-600 transition-colors'
            onClick={joinGame}
          >
            JOIN A GAME
          </button>
        </div>
      )}

      {pages.secondPage && (
        <div className='SecondPageWrapper p-10'>
          <div className='friendShareCodeHeader text-center'>
            <p className='text-lg text-white'>
              SHARE THIS CODE WITH YOUR FRIEND TO JOIN GAME
            </p>
            <h1 className='text-5xl font-bold text-white mt-4'>{code}</h1>
          </div>

          <div className='WaitingForConnection flex flex-col items-center mt-16'>
            <p className='text-4xl text-gray-300'>
              Waiting For An Opponent Connection...
            </p>
            <AlertComponent
              className='alertComponent mt-8'
              type={'spokes'}
              color={'blueviolet'}
            />
          </div>

          <button
            className='mt-6 text-lg text-white bg-indigo-600 hover:bg-indigo-700 rounded-full px-6 py-3 transition-all'
            onClick={moveToThirdPage}
          >
            demo
          </button>
        </div>
      )}

      {pages.thirdPage && (
        <div className='FriendThirdPageConnection flex flex-col items-center justify-center h-full'>
          <h3 className='text-4xl text-green-400'>
            Establishing Secure Connection....
          </h3>
          <h2 className='text-6xl text-yellow-400 mt-6 tracking-widest'>
            LET'S START GAME IN
          </h2>
          <h1 className='text-5xl text-gray-300 mt-8'>{timer} SECONDS</h1>
        </div>
      )}

      {pages.fourthPage && (
        <div className='FriendFourthScreenWrapper h-full overflow-y-scroll'>
          <div className='computerCounter absolute top-1 w-full text-center text-4xl text-yellow-400'>
            <h1>{gameState.gameCounter}</h1>
          </div>

          <div className='computerWrapperDiv1 flex'>
            <div className='computerGameFirstPhase flex flex-col justify-between w-2/5 p-6'>
              <h1 className='text-3xl text-center font-bold mb-6'>
                SELECT ONE
              </h1>
              <div className='computerGameOptions grid grid-cols-1 gap-4'>
                <Card
                  elementName='ComputerImgstone'
                  elementImage={Stone}
                  selectedElement={selectedElement}
                  selected={selected}
                  handleSelection={handleSelection}
                />
                <Card
                  elementName='ComputerImgpaper'
                  elementImage={Paper}
                  selectedElement={selectedElement}
                  selected={selected}
                  handleSelection={handleSelection}
                />
                <Card
                  elementName='ComputerImgscissors'
                  elementImage={Scissors}
                  selectedElement={selectedElement}
                  selected={selected}
                  handleSelection={handleSelection}
                />
              </div>
            </div>

            <div className='friendChatting relative flex flex-col w-1/3 p-4 bg-opacity-70 bg-blue-700 rounded-lg'>
              <button
                className='bg-indigo-500 text-white p-2 rounded-full'
                onClick={() => setIsChatOpen(!isChatOpen)}
              >
                {isChatOpen ? 'Hide Chat' : 'Open Chat'}
              </button>
              {isChatOpen && (
                <div className='messageBoxWrapper overflow-y-auto flex-1'>
                  {messages.map(Message => (
                    <div
                      className='messageItem bg-blue-600 p-4 rounded-lg mb-4'
                      key={Message.timeHours + Message.timeMinutes}
                    >
                      <p className='messageSenderName text-pink-300'>
                        {Message.userName}
                      </p>
                      <div className='messageAndTime flex justify-between'>
                        <p className='messageText text-white'>
                          {Message.messageText}
                        </p>
                        <p className='messageTime text-gray-300'>
                          {Message.timeHours}:{Message.timeMinutes}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className='computerGameSecondPhase flex flex-col justify-between w-2/5 p-6'>
              <h1 className='text-3xl text-center font-bold mb-6'>OPPONENT</h1>
              <div className='computerGameOptionOpponent'>
                <div className='computerOpponentSelectedDiv flex justify-center'>
                  <img
                    className='computerOptionImg w-32 h-32 object-contain'
                    src={gameState.opponentSVG}
                    alt='Opponent'
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {pages.fifthPage && (
        <div className='FinalResultPage flex flex-col items-center justify-center py-10'>
          <h1 className='text-5xl text-white font-bold mb-6'>Game Over</h1>
          <h2 className='text-3xl text-gray-300 mb-4'>Results:</h2>
          <p className='text-xl text-white mb-2'>
            <strong>{gameState.yourName}</strong>: {gameState.gameCounter}{' '}
            points
          </p>
          <p className='text-xl text-white mb-6'>
            <strong>{gameState.opponentName || 'Opponent'}</strong>:{' '}
            {10 - gameState.gameCounter} points
          </p>
          <h3 className='text-2xl font-semibold text-green-500'>
            {gameState.gameCounter > 5
              ? `${gameState.yourName} Wins!`
              : `${gameState.opponentName || 'Opponent'} Wins!`}
          </h3>
        </div>
      )}
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
