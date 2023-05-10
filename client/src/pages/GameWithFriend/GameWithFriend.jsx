import React, { useEffect, useState, useRef } from "react";
import socketIO from "socket.io-client";
import AlertComponent from "../components/AlertComponent";

// ALL ASSETS
import BgImage from "../../backgroundImages/bg2.jpg";
import Stone from "../../gameIcons/stones.svg";
import Paper from "../../gameIcons/paper.svg";
import Scissors from "../../gameIcons/scissors.svg";
import { NumberToSVG, OptionToNumber } from "../components/Utils"; // reducing code is good practice
import "./GameWithFriend.css";


// const serverLocation = "http://localhost:4000";
  const serverLocation = 'https://stonepaperscissorsgameserver.onrender.com/';
const socket = socketIO(process.env.SERVER_LOCATION || serverLocation, {
  autoConnect: true,
});


const GameWithFriend = () => {
  const [code, setCode] = useState();

  // Pages
  const [pages, setPages] = useState({
    firstPage: true,
    secondPage: false,
    thirdPage: false,
    fourthPage: false,
    fifthPage: false,
  });

  const [gameState, setGameState] = useState({
    yourName: "",
    opponentName: "",
    messageText: "",
    gameCounter: 10,
    opponentSVG: NumberToSVG[5],
  });
  const [timer, setTimer] = useState(10);

  const [messages, setMessages] = useState([
    {
      userName: "Ketan Rathod",
      messageText: "hello Good morning",
      timeHours: new Date().getHours(),
      timeMinutes: new Date().getMinutes(),
    },
  ]);

  // For Fourth Page game
  const [selected, setSelected] = useState(false);

  const handleSelection = (event) => {
    const selected = event.currentTarget.id.substring(11);
    const selectedElement = event.target;

    console.log(selected);

    selectedElement.classList.add("computerSelectedOption");

    // updating state for useEffect to do some work related to sideEffects
    setSelected(true); // Now ig no one can do anything

    socket.emit("optionSelect", {
      optionSelected: OptionToNumber[selected], // send in number formate
      optionNumber: gameState.gameCounter,
    });
  };

  useEffect(()=>{
    console.log("timer changed");
    
  },[timer])

  useEffect(() => {
    console.log("UseEffect called");
    console.log(socket);

    const yourName = JSON.parse(localStorage.getItem("yourName"));
    if (yourName) {
      setGameState((prevState) => ({
        ...prevState,
        yourName,
      }));
    } else {
      setGameState((prevState) => ({
        ...prevState,
        yourName: "Random Guy",
      }));
    }

    socket.connect();

    // all listeners are here

    socket.on("createNewGame", (message) => {
      const roomId = message.roomId + ""; // IMP - THERE IS DIFFERENCE BETWEEN NUMBER AND STRING
      setCode((prevState) => roomId);

      // moveToSecondPage()
    });

    socket.on("timerStarted", (message) => {
      const totalTimeCounter = message.timer;

      setTimer(totalTimeCounter);
      console.log("Timer started");

      moveToThirdPage();
    });

    socket.on("timer", (message) => {
      const timer = message.timer;

      console.log(timer);

      setTimer((prevState) => timer);
    });

    socket.on("gameStarted", (messages) => {
      const totalCounts = messages.totalCounts;

      setGameState((prevState) => ({
        ...prevState,
        gameCounter: totalCounts,
      }));

      moveToFourthPage();
    });

    socket.on("gameOver", (message) => {
      // const {mySelections, opponentSelections, result} = message

      moveToFifthPage();
    });

    socket.on("optionSelectionResult", (message) => {
      const { result, opponentSelection, mySelection, optionCount } = message;

      console.log(result);

      console.log(message);

      setGameState((prevState) => ({
        ...prevState,
        gameCounter: optionCount,
        opponentSVG: NumberToSVG[opponentSelection],
      }));

      socket.on("opponentSelectedOption", () => {
        console.log("opponent selected something");

        setGameState((prevState) => ({
          ...prevState,
          opponentSVG: NumberToSVG[4], // 4 is for checkmark
        }));
      });

      setMessages((prevState) => [
        ...prevState,
        {
          userName: "System Generated",
          messageText:
            "I selected " +
            mySelection +
            " and opponent Selected " +
            opponentSelection,
          timeHours: new Date().getHours(),
          timeMinutes: new Date().getMinutes(),
        },
      ]);
      setMessages((prevState) => [
        ...prevState,
        {
          userName: "System Generated",
          messageText: "WON!!",
          timeHours: new Date().getHours(),
          timeMinutes: new Date().getMinutes(),
        },
      ]);

      setTimeout(() => {
        setSelected(false);
      }, 1000);
    });

    socket.on("receiveMessage", (message) => {
      console.log("message recieved", message);
      setMessages((prevState) => [...prevState, message]);
    });

    socket.on("error", (message) => {
      if (message.type === "userLeft") {
        setMessages((prevState) => [
          ...prevState,
          {
            userName: "System Generated",
            messageText: message.message,
            timeHours: new Date().getHours(),
            timeMinutes: new Date().getMinutes(),
          },
        ]);
      }
    });

    return () => {
      console.log("cleanup function");
    };
  }, []);

  const createNewGame = () => {
    console.log("create new game");

    socket.emit("createNewGame", {
      yourName: gameState.yourName,
    });

    // moveToSecondPage()
  };

  const moveToSecondPage = () => {
    setPages({
      firstPage: false,
      secondPage: true,
      thirdPage: false,
      fourthPage: false,
      fifthPage: false,
    });
  };
  const moveToThirdPage = () => {
    setPages({
      firstPage: false,
      secondPage: false,
      thirdPage: true,
      fourthPage: false,
      fifthPage: false,
    });
  };

  const moveToFourthPage = () => {
    setPages({
      firstPage: false,
      secondPage: false,
      thirdPage: false,
      fourthPage: true,
      fifthPage: false,
    });
  };
  const moveToFifthPage = () => {
    setPages({
      firstPage: false,
      secondPage: false,
      thirdPage: false,
      fourthPage: false,
      fifthPage: true,
    });
  };

  const joinGame = () => {
    console.log("join new game");

    if (!code) return;

    socket.emit("joinGame", {
      roomId: code,
      yourName: gameState.yourName,
    });

    moveToSecondPage();
  };

  const handleCodeChange = (event) => {
    console.log(event.target.value);

    setCode((prevState) => event.target.value);
  };

  const sendMessageHandler = (event) => {
    event.preventDefault();
    socket.emit("sendMessage", {
      messageText: gameState.messageText,
    });

    const message = {
      userName: gameState.yourName,
      messageText: gameState.messageText,
      timeHours: new Date().getHours(),
      timeMinutes: new Date().getMinutes(),
    };

    setMessages((prevState) => [...prevState, message]);

    setGameState((prevState) => ({
      ...prevState,
      messageText: "",
    }));
  };

  return (
    <div className="gameWithFriendScreen">
      <img className="bgGameWithFriend" src={BgImage} alt="vs" />
      {pages.firstPage && (
        <>

          <div className="FriendSignUpForm">
            <button
              className="FriendCreateNewGame FriendButton"
              onClick={createNewGame}
            >
              CREATE NEW GAME
            </button>
            <div className="inputCodeForGame">
              <input
                className=""
                placeholder="Enter 6 Digit Code Here"
                value={code}
                onChange={handleCodeChange}
              ></input>
            </div>
            <button className="FriendJoinGame FriendButton" onClick={joinGame}>
              JOIN A GAME
            </button>
          </div>
        </>
      )}

      {/* JSX 2 : Second Page waiting for friend */}

      {pages.secondPage && (
        <>
          <div className="SecondPageWrapper">
          <div className="friendShareCodeHeader">
            <p>SHARE THIS CODE WITH YOUR FRIEND TO JOIN GAME</p>
            <h1>{code}</h1>
          </div>
          <div className="WaitingForConnection">
            <p>Waiting For An Opponent Connection...</p>
            <br />
            <br />
            <AlertComponent className="alertComponent" type={"spokes"} color={"blueviolet"} />
          </div>
          <button onClick={moveToThirdPage}>deomo</button>
</div>
          
        </>
      )}

      {/* JSX 3 - THIRD PAGE For Timer */}

      {pages.thirdPage && (
        <>
          <div className="FriendThirdPageConnection">
            <h3>Establishing Secure Connection....</h3>
            <h2>LET'S START GAME IN</h2>
            <h1>{timer} SECONDS</h1>
          </div>

          {/* <button onClick={moveToFourthPage}>demo</button> */}
        </>
      )}

      {/* JSX 4 - Original Game Page */}
      {pages.fourthPage && (
        <>
          <div div="FriendFourthScreenWrapper">
          <div className="computerCounter">
            <h1>{gameState.gameCounter}</h1>
          </div>
          <div className="computerWrapperDiv1">
            <div className="computerGameFirstPhase">
              <div className="computerSelectHeading">
                <h1>SELECT ONE</h1>
              </div>
              <div className="computerGameOptions">
                {/* 3 options */}
                <div
                  className="computerStoneDiv"
                  onClick={!selected ? handleSelection : null}
                  id="ComputerImgstone"
                >
                  <img className="computerOptionImg" src={Stone} alt="" />
                </div>
                <div
                  className="computerPaperDiv"
                  onClick={!selected ? handleSelection : null}
                  id="ComputerImgpaper"
                >
                  <img className="computerOptionImg" src={Paper} alt="" />
                </div>
                <div
                  className="computerScissorsDiv"
                  onClick={!selected ? handleSelection : null}
                  id="ComputerImgscissors"
                >
                  <img className="computerOptionImg" src={Scissors} alt="" />
                </div>
              </div>
            </div>

            <div className="friendChatting">
              <div className="messageBoxWrapper">
                <div className="messagesBox">
                  <div className="messageItem">
                    <p className="messageSenderName">Ketan Rathod</p>
                    <div className="messageAndTime">
                      <p className="messageText">Hello</p>
                      <p className="messageTime">30:12</p>
                    </div>
                  </div>
                  {messages.map((Message) => (
                    <Item>
                      <div className="messageItem">
                        <p className="messageSenderName">{Message.userName}</p>
                        <div className="messageAndTime">
                          <p className="messageText">{Message.messageText}</p>
                          <p className="messageTime">
                            {Message.timeHours}:{Message.timeMinutes}
                          </p>
                        </div>
                      </div>
                    </Item>
                  ))}
                </div>
              </div>

              <form
                action=""
                onSubmit={sendMessageHandler}
                className="friendSendMessageBoxForm"
              >
                <div className="friendSendMessageBox">
                  <input
                    type="text"
                    value={gameState.messageText}
                    onChange={(e) =>
                      setGameState({
                        ...gameState,
                        messageText: e.target.value,
                      })
                    }
                  />
                  <button type="submit">Send</button>
                </div>
              </form>
            </div>

            <div className="computerGameSecondPhase">
              <div className="computerOpponentHeading">
                <h1>OPPONENT</h1>
              </div>

              <div className="computerGameOptionOpponent">
                {/* opponent selected option */}
                <div className="computerOpponentSelectedDiv">
                  <img
                    className="computerOptionImg"
                    src={gameState.opponentSVG}
                    alt=""
                  />
                </div>
              </div>
            </div>
          </div>
          </div>
        </>
      )}

      {pages.fifthPage && (
        <>
          <h1>Final Result page</h1>
        </>
      )}
    </div>
  );
};

export default GameWithFriend;

// if new item added then move focus there
function Item({ children }) {
  const ref = useRef();

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, []);

  return (
    <div className="Item" ref={ref}>
      {children}
    </div>
  );
}
