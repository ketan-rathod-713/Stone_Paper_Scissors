import './App.css';
import GameWithComputer from './pages/GameWithComputer';
import GameWithFriend from './pages/GameWithFriend';
import GameWithComputerSetting from './pages/GameWithComputerSetting';
import Home from './pages/Home';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { useEffect, useState } from 'react';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home/>,
  },
  {
    path:"/gameWithComputer",
    element: <GameWithComputer/>
  },
  {
    path:"/gameWithComputer/setting",
    element: <GameWithComputerSetting/>
  },
  {
    path:"/gameWithFriend",
    element: <GameWithFriend/>
  },
]);

// const url = "http://streaming.tdiradio.com:8000/house.mp3";
const url = "https://stonepaperscissorsgameserver.onrender.com/api/homeAudio";

function App() {
  const [playing, toggle] = useAudio(url);
  
  useEffect(()=>{
    console.log("music started");
    if(!playing)
    toggle()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <div className="App">
    {/* <audio autoPlay loop>
      <source src="http://localhost/api/homeAudio" type="audio/mp3"/>
    </audio> */}
    <div className='audioDiv'>
      <button onClick={toggle}>{playing ? "Pause" : "Play"}</button>
    </div>
      <RouterProvider router={router} />
    </div>
  );
}

export default App;


const useAudio = url => {
  const [audio] = useState(new Audio(url));
  const [playing, setPlaying] = useState(false);

  const toggle = () => setPlaying(!playing);

  useEffect(() => {
      playing ? audio.play() : audio.pause();

      return ()=>{
        audio.pause()
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [playing]
  );

  useEffect(() => {
    audio.addEventListener('ended', () => setPlaying(false));
    return () => {
      audio.removeEventListener('ended', () => setPlaying(false));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [playing, toggle];
};
