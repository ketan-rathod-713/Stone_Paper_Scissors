import React, { useContext, useEffect , useState} from "react";
import "./GameWithComputer.css"
import BgImage from "../backgroundImages/bg2.jpg"
import Stone from "../gameIcons/stones.svg"
import Paper from "../gameIcons/paper.svg"
import Scissors from "../gameIcons/scissors.svg"
import Star from "../gameIcons/star.svg"
import { NumberToOption, stonePaperScissor, OptionToNumber, resultOutputToTextFormate , calculateFinalResultFromSelectionArray} from "../components/Utils"; // reducing code is good practice
import Modal from 'react-modal'

// here selectedA and selectedB are integers
// it can be range from 1, 2, 3 only ( is user doesnt select then 0 == loose by default)
// 1 - stone
// 2 - paper
// 3 - scissors

const customStyles = {
    content: {
      top: "0%",
      left: "0%",
      right: "auto",
      bottom: "auto",
      marginRight: "0px",
    //   transform: "translate(-50%, -50%)",
      backgroundColor: "white",
      width: "100vw",
      height: "100vh",
      backgroundColor: "white"
    },
  };

const NumberToSVG = {
    1: Stone,
    2: Paper,
    3: Scissors
}

const initialCount = 10

const GameWithComputer = (props) => {
    const [initial, setinitial] = useState(true);
    const [yourName, setYourName] = useState("")
    const [selected, setSelected] = useState(false)
    const [counter, setCounter] = useState(initialCount)
    const [isGameOver, setIsGameOver] = useState(false)
    const [modalOpen, setModalOpen] = useState(false);

    // change after each selection
    const [opponentSVGselection, setOpponentSVGselection] = useState()
    // In Numeric Only // use mapping for textual one
    const [selectionResult, setSelectionResult] = useState(0)
    const [yourSelection, setYourSelection] = useState(0)
    const [computerSelection, setComputerSelection] = useState(0)
    const [selectedElement, setSelectedElement] = useState()

    // store the result of each selection // right now only store result
    const [selectionResultArray, setSelectionResultArray] = useState([])
    const [result, setResult] = useState({})
     

    useEffect(()=>{
        if(initial == true){ // for only first time
            const yourName = JSON.parse(localStorage.getItem('yourName'));
            if (yourName) {
            setYourName(yourName)
            }
            return;
        }


        console.log("useEffect called");
        
        const computerSelected = Math.floor(Math.random() * 3) + 1;
        setComputerSelection(computerSelected)
        setOpponentSVGselection(prev => NumberToSVG[computerSelected])

        const result =  stonePaperScissor(yourSelection, computerSelected)
        setSelectionResult(result)
        setSelectionResultArray(prevArray => [...prevArray, result])
        console.log(result);
        console.log(selectionResultArray)
        
        setTimeout(() => {
            setSelected(false)
            if(selectedElement){
                selectedElement.classList.remove("computerSelectedOption")
            }
        }, 7000);

        // for isGameOver
        if(counter <= 0){
            setIsGameOver(true)
            const [finalResult, win, loose, draw] = calculateFinalResultFromSelectionArray(selectionResultArray)
            console.log(finalResult);
            setResult({finalResult, win, loose, draw})
            // setCounter(5)
        }

        return ()=>{

        }
    }, [counter]) 
    // when counter changes run useEffect at that time only, not on selections which are twice

    const handleSelection = (event)=>{
        const selected = (event.currentTarget.id).substring(11)
        const selectedElement = event.target
        selectedElement.classList.add("computerSelectedOption")
        
        // updating state for useEffect to do some work related to sideEffects
        setSelected(true)
        setCounter(prevCount => prevCount - 1)
        setYourSelection(OptionToNumber[selected])
        setSelectedElement(selectedElement)

        // TODO - update answers

       
        // TODO : show timer on right side to see the result of current selection
    }

  return <div className="gameWithComputer">
  {/* JSX1 :  Only Render For First time */}
    {
        initial &&
        <>
        <img className="bgGameWithComputer" src={BgImage} alt="vs image" /> 
        <h1 className="yourName">{yourName}</h1>
        <h1 className="opponentName">Computer</h1>
        <button className="startGameBtn" onClick={()=> setinitial(false)}>Start Game</button>

     
      <button onClick={setModalOpen}>Game Settings</button>
      <Modal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        style={customStyles}
        className={"ModalSetting"}
      >
        <div>Login/Signup</div>

        <button onClick={() => setModalOpen(false)}>Close Modal</button>
      </Modal>
        </>
    }

{/* JSX2 : Render 2nd time after initial and if game is not over */}
{
    !initial && !isGameOver &&
    <div>
        <img className="bgGameWithComputer" src={BgImage} alt="vs image" /> 

        <div className="computerCounter">
            <h1>{counter}</h1>
        </div>
        
    
        {/* Combined div of both */}
        <div className="computerWrapperDiv1">
        {

            <div className="computerGameFirstPhase">
                <div className="computerSelectHeading">
                    <h1>SELECT ONE</h1>
                </div>
                <div className="computerGameOptions">
                    {/* 3 options */}
                    <div className="computerStoneDiv" onClick={!selected ? handleSelection: null} id="ComputerImgstone">
                        <img className="computerOptionImg" src={Stone} alt="" />
                    </div>
                    <div className="computerPaperDiv" onClick={!selected ? handleSelection : null}  id="ComputerImgpaper">
                        <img  className="computerOptionImg" src={Paper} alt="" />
                    </div>
                    <div className="computerScissorsDiv" onClick={!selected ? handleSelection : null} id="ComputerImgscissors">
                        <img  className="computerOptionImg" src={Scissors} alt="" />
                    </div>
                </div>
            </div>
    }


{/* Second Phase */}
        {
            selected && 
        <div className="computerGameSecondPhase">
            <div className="computerOpponentHeading">
                <h1>OPPONENT</h1>
            </div>

            <div className="computerGameOptionOpponent">
                    {/* opponent selected option */}
                    <div className="computerOpponentSelectedDiv">
                        <img className="computerOptionImg" src={opponentSVGselection} alt="" />
                    </div>
            </div>
        </div>
        }
</div>
</div>
}

{/* JSX2 2 -- it also same as above but in different div block */}
{
   !initial && selected && !isGameOver && 
        <div className="computerResult">
            <p>{resultOutputToTextFormate[selectionResult]}</p>
            <p>You selected {NumberToOption[yourSelection]}</p>
            <p>Your Opponent ( Computer ) selected {NumberToOption[computerSelection]}</p>
        </div>
}

{/* JSX 3 : When Game is over show final Output and Menu to redirect */}

{
    isGameOver &&
    <div>
        <img className="bgGameWithComputer" src={BgImage} alt="background image" /> 
        <div className="gameOverDiv">
            <h1>GAME OVER!</h1>
        </div>
        
                    
        <div className="starsResult">
        {
            selectionResultArray.map(element =>
                element === 1 ? 
                <div className="starDiv">
                            <img className="starSVGGreen" src={Star} alt="" />
                </div>
                 : element === 2 
                 ?  <div className="starDiv">
                            <img className="starSVGRed" src={Star} alt="" />
                    </div> 
                :   <div className="starDiv">
                            <img className="starSVGDraw" src={Star} alt="" />
                    </div> 
            
            )
        }
            
    
            
        </div>
        <div className="gameFinalResultDiv">
            <h1>{result.finalResult}</h1>
        </div>

        <div className="information">
            <div className="informationDiv">
            <div className="starDiv">
                                <img className="starSVGGreen" src={Star} alt="" />
            </div> 
            <p>Won</p>
            </div>
            <div className="informationDiv">
            <div className="starDiv">
                                <img className="starSVGRed" src={Star} alt="" />
            </div> 
            <p>Loose</p>
            </div>
            <div className="informationDiv">
            <div className="starDiv">
                                <img className="starSVGDraw" src={Star} alt="" />
            </div> 
            <p>Draw</p>
            </div>
        </div>
    </div>
}
  </div>;
};

export default GameWithComputer;
