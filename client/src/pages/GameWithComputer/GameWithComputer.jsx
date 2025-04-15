import React, { useEffect, useState } from 'react'
import BgImage from '../../backgroundImages/bg2.jpg'
import Stone from '../../gameIcons/stones.svg'
import Paper from '../../gameIcons/paper.svg'
import Scissors from '../../gameIcons/scissors.svg'
import { useNavigate } from 'react-router-dom'
import {
  NumberToOption,
  stonePaperScissor,
  OptionToNumber,
  resultOutputToTextFormate,
  calculateFinalResultFromSelectionArray
} from '../components/Utils'
import Modal from 'react-modal'
import Card from '../components/Card'

const NumberToSVG = {
  1: Stone,
  2: Paper,
  3: Scissors
}

const initialCount = 10

const GameWithComputer = () => {
  const [initial, setInitial] = useState(true)
  const [yourName, setYourName] = useState('')
  const [counter, setCounter] = useState(initialCount)
  const [isGameOver, setIsGameOver] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  const [yourSelection, setYourSelection] = useState(0)
  const [computerSelection, setComputerSelection] = useState(0)
  const [selectionResult, setSelectionResult] = useState(0)
  const [selectionResultArray, setSelectionResultArray] = useState([])
  const [result, setResult] = useState({})

  const navigate = useNavigate()

  const [step, setStep] = useState('select')

  useEffect(() => {
    const yourName = JSON.parse(localStorage.getItem('yourName'))
    if (yourName) setYourName(yourName)
  }, [])

  const handleSelection = selectedOption => {
    const computerSelected = Math.floor(Math.random() * 3) + 1
    setYourSelection(OptionToNumber[selectedOption])
    setComputerSelection(computerSelected)

    const result = stonePaperScissor(
      OptionToNumber[selectedOption],
      computerSelected
    )
    setSelectionResult(result)
    setSelectionResultArray(prevArray => [...prevArray, result])

    setStep('result')

    setTimeout(() => {
      setCounter(prevCount => prevCount - 1)
      if (counter - 1 <= 0) {
        setIsGameOver(true)
        const [finalResult, win, loose, draw] =
          calculateFinalResultFromSelectionArray(selectionResultArray)
        setResult({ finalResult, win, loose, draw })
        setStep('gameOver')
      } else {
        setStep('select')
      }
    }, 3000)
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100'>
      {initial && (
        <div className='relative min-h-screen flex items-center justify-center p-4'>
          <img
            className='absolute inset-0 w-full h-full object-cover opacity-20'
            src={BgImage}
            alt='background'
          />
          <div className='relative max-w-md w-full p-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl'>
            <h1 className='text-4xl font-bold text-center text-gray-800 mb-2'>
              {yourName}
            </h1>
            <h2 className='text-xl text-center text-gray-600 mb-6'>
              vs Computer
            </h2>
            <div className='flex flex-col gap-4'>
              <button
                className='w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold 
                          hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200
                          shadow-lg hover:shadow-xl'
                onClick={() => setInitial(false)}
              >
                Start Game
              </button>
              <button
                className='w-full text-blue-600 hover:text-blue-700 font-medium'
                onClick={() => setModalOpen(true)}
              >
                Game Settings
              </button>
            </div>
          </div>
          <Modal
            isOpen={modalOpen}
            onRequestClose={() => setModalOpen(false)}
            className='fixed inset-0 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm'
            overlayClassName='fixed inset-0'
          >
            <div className='bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl'>
              <h2 className='text-2xl font-bold text-gray-800 mb-4'>
                Game Settings
              </h2>
              <button
                className='w-full bg-red-500 text-white px-6 py-3 rounded-xl font-semibold
                          hover:bg-red-600 transform hover:scale-105 transition-all duration-200'
                onClick={() => setModalOpen(false)}
              >
                Close Settings
              </button>
            </div>
          </Modal>
        </div>
      )}

      {!initial && step === 'select' && (
        <div className='min-h-screen flex flex-col items-center justify-center p-4'>
          <div className='text-center mb-8'>
            <h1 className='text-3xl md:text-4xl font-bold text-gray-800 mb-2'>
              Choose your move!
            </h1>
            <p className='text-gray-600'>Rounds remaining: {counter}</p>
          </div>
          <div className='grid grid-cols-3 gap-4 md:gap-8 max-w-2xl w-full'>
            <Card
              elementName='Stone'
              elementImage={Stone}
              handleSelection={() => handleSelection('stone')}
            />
            <Card
              elementName='Paper'
              elementImage={Paper}
              handleSelection={() => handleSelection('paper')}
            />
            <Card
              elementName='Scissors'
              elementImage={Scissors}
              handleSelection={() => handleSelection('scissors')}
            />
          </div>
        </div>
      )}

      {step === 'result' && (
        <div className='min-h-screen flex flex-col items-center justify-center p-4'>
          <div className='text-center mb-8'>
            <h1 className='text-2xl md:text-3xl font-bold text-gray-800 mb-4'>
              Opponent's Selection
            </h1>
            <div className='animate-bounce'>
              <Card
                elementName='Opponent'
                elementImage={NumberToSVG[computerSelection]}
                selected={true}
              />
            </div>
            <h2 className='text-2xl md:text-3xl font-semibold mt-6 text-gray-700'>
              {resultOutputToTextFormate[selectionResult]}
            </h2>
          </div>
        </div>
      )}

      {step === 'gameOver' && (
        <div className='min-h-screen flex flex-col items-center justify-center p-4'>
          <div className='max-w-md w-full bg-white rounded-2xl p-8 shadow-xl text-center'>
            <h1 className='text-4xl md:text-5xl font-bold text-gray-800 mb-4'>
              Game Over
            </h1>
            <h2 className='text-2xl md:text-3xl font-semibold mb-6 text-blue-600'>
              {result.finalResult}
            </h2>
            <div className='grid grid-cols-3 gap-4 mb-8'>
              <div className='bg-green-100 p-4 rounded-xl'>
                <p className='text-sm text-gray-600'>Wins</p>
                <p className='text-2xl font-bold text-green-600'>
                  {result.win}
                </p>
              </div>
              <div className='bg-red-100 p-4 rounded-xl'>
                <p className='text-sm text-gray-600'>Losses</p>
                <p className='text-2xl font-bold text-red-600'>
                  {result.loose}
                </p>
              </div>
              <div className='bg-yellow-100 p-4 rounded-xl'>
                <p className='text-sm text-gray-600'>Draws</p>
                <p className='text-2xl font-bold text-yellow-600'>
                  {result.draw}
                </p>
              </div>
            </div>
            <button
              className='w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold
                        hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200
                        shadow-lg hover:shadow-xl'
              onClick={() => navigate('/')}
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default GameWithComputer
