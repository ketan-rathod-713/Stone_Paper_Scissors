import './App.css';
import { GlobalProvider } from './globalContext/GlobalContext';
import GameWithComputer from './pages/GameWithComputer';
import GameWithFriend from './pages/GameWithFriend';
import GameWithComputerSetting from './pages/GameWithComputerSetting';
import Home from './pages/Home';
import ReactAudioPlayer from 'react-audio-player';
import GameMusic from "./gameMusic.mp3"
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

const url = "http://streaming.tdiradio.com:8000/house.mp3";

function App() {
  const [playing, toggle] = useAudio(url);
  
  useEffect(()=>{
    console.log("music started");
    if(!playing)
    toggle()
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
    [playing]
  );

  useEffect(() => {
    audio.addEventListener('ended', () => setPlaying(false));
    return () => {
      audio.removeEventListener('ended', () => setPlaying(false));
    };
  }, []);

  return [playing, toggle];
};
