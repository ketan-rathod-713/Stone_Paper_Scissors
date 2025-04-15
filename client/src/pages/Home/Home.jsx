import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import BgImage from '../../backgroundImages/bg2.jpg'
// import Stone from "../gameIcons/stones.svg";
// import Paper from "../gameIcons/paper.svg";
// import Scissors from "../gameIcons/scissors.svg";
// import gameMusic from "../gameMusic.mp3"

const Home = () => {
  const [yourName, setYourName] = useState('AwesomePlayer')

  useEffect(() => {
    const storedName = JSON.parse(localStorage.getItem('yourName'))
    if (storedName) {
      setYourName(storedName)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('yourName', JSON.stringify(yourName))
  }, [yourName])

  return (
    <div className='min-h-screen relative flex items-center justify-center p-4'>
      <img
        className='absolute inset-0 w-full h-full object-cover opacity-20'
        src={BgImage}
        alt='background'
      />

      <div className='relative max-w-md w-full p-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl'>
        <h1 className='text-3xl font-bold text-center text-gray-800 mb-8'>
          Stone Paper Scissors
        </h1>

        <div className='space-y-6'>
          <div>
            <label
              htmlFor='enterNameInput'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Enter Your Name
            </label>
            <input
              type='text'
              id='enterNameInput'
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='Enter Your Name'
              value={yourName}
              onChange={e => setYourName(e.target.value)}
            />
          </div>

          <div className='space-y-4'>
            <Link
              to='/game-with-computer'
              className='block w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold 
                        hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200
                        shadow-lg hover:shadow-xl text-center'
            >
              Play With Computer
            </Link>

            <Link
              to='/game-with-friend'
              className='block w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold 
                        hover:from-purple-600 hover:to-pink-700 transform hover:scale-105 transition-all duration-200
                        shadow-lg hover:shadow-xl text-center'
            >
              Play With Friend
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
