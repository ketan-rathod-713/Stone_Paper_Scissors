import './App.css'
import GameWithComputer from './pages/GameWithComputer/GameWithComputer'
import GameWithFriend from './pages/GameWithFriend/GameWithFriend'
import GameWithComputerSetting from './pages/components/GameWithComputerSetting'
import Home from './pages/Home/Home'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect, useState } from 'react'

function App () {
  const url = 'https://stonepaperscissorsgameserver.onrender.com/api/homeAudio'
  const [playing, toggle] = useAudio(url)

  useEffect(() => {
    console.log('music started')
    if (!playing) toggle()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Router>
      <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100'>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/game-with-computer' element={<GameWithComputer />} />
          <Route path='/game-with-friend' element={<GameWithFriend />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App

const useAudio = url => {
  const [audio] = useState(new Audio(url))
  const [playing, setPlaying] = useState(false)

  const toggle = () => setPlaying(!playing)

  useEffect(
    () => {
      playing ? audio.play() : audio.pause()

      return () => {
        audio.pause()
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [playing]
  )

  useEffect(() => {
    audio.addEventListener('ended', () => setPlaying(false))
    return () => {
      audio.removeEventListener('ended', () => setPlaying(false))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return [playing, toggle]
}
