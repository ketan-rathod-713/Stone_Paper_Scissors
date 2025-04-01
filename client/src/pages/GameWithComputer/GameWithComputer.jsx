import React, { useEffect, useState } from 'react'
import BgImage from '../../backgroundImages/bg2.jpg'
import Stone from '../../gameIcons/stones.svg'
import Paper from '../../gameIcons/paper.svg'
import Scissors from '../../gameIcons/scissors.svg'
import { useNavigate } from 'react-router-dom' // Import useNavigate
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

  const navigate = useNavigate() // Initialize navigate function

  const [step, setStep] = useState('select') // 'select', 'result', 'gameOver'

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
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-100'>
      {initial && (
        <>
          <img
            className='absolute w-full h-full object-cover'
            src={BgImage}
            alt='vs'
          />
          <div className='relative flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-md'>
            <h1 className='text-3xl font-bold mb-4'>{yourName}</h1>
            <h1 className='text-xl text-gray-600 mb-4'>Computer</h1>
            <button
              className='bg-blue-500 text-white px-6 py-2 rounded-lg mb-4 hover:bg-blue-600'
              onClick={() => setInitial(false)}
            >
              Start Game
            </button>
            <button
              className='text-blue-500'
              onClick={() => setModalOpen(true)}
            >
              Game Settings
            </button>
          </div>
          <Modal
            isOpen={modalOpen}
            onRequestClose={() => setModalOpen(false)}
            className='fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50'
          >
            <div className='bg-white p-8 rounded-lg'>
              <h2 className='text-xl font-bold mb-4'>Login/Signup</h2>
              <button
                className='bg-red-500 text-white px-6 py-2 rounded-lg'
                onClick={() => setModalOpen(false)}
              >
                Close Modal
              </button>
            </div>
          </Modal>
        </>
      )}

      {!initial && step === 'select' && (
        <div className='text-center'>
          <h1 className='text-2xl font-bold mb-6'>Choose your move!</h1>
          <div className='flex justify-center gap-8'>
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
        <div className='text-center'>
          <h1 className='text-xl font-bold mb-4'>Opponent's Selection</h1>
          <Card
            elementName='Opponent'
            elementImage={NumberToSVG[computerSelection]}
          />
          <h2 className='text-2xl font-semibold mt-4'>
            {resultOutputToTextFormate[selectionResult]}
          </h2>
        </div>
      )}

      {step === 'gameOver' && (
        <div className='text-center'>
          <h1 className='text-4xl font-bold mb-4'>Game Over</h1>
          <h2 className='text-2xl font-semibold mb-4'>{result.finalResult}</h2>
          <p className='text-lg'>
            Wins: {result.win}, Losses: {result.loose}, Draws: {result.draw}
          </p>

          <button
            className='mt-6 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600'
            onClick={() => navigate('/')}
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  )
}

export default GameWithComputer
