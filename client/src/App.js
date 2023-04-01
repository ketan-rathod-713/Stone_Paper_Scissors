import './App.css';
import { GlobalProvider } from './globalContext/GlobalContext';
import GameWithComputer from './pages/GameWithComputer';
import GameWithFriend from './pages/GameWithFriend';
import GameWithComputerSetting from './pages/GameWithComputerSetting';
import Home from './pages/Home';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

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

function App() {
  return (
    <div className="App">
    <audio loop autoPlay>
      <source src="http://localhost/api/homeAudio" type="audio/mp3"/>
    </audio>
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
