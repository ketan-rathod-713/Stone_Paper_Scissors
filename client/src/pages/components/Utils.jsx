import Stone from "../../gameIcons/stones.svg";
import Paper from "../../gameIcons/paper.svg";
import Scissors from "../../gameIcons/scissors.svg";
import Star from "../../gameIcons/star.svg";
import CheckMark from "../../gameIcons/checkMark.svg";

export const NumberToSVG = {
    1: Stone,
    2: Paper,
    3: Scissors,
    4: CheckMark,
    5: Star
  }
  
// Game logic for two players
export const stonePaperScissor = (selectedA, selectedB)=>{ // selectedA is user
    if(selectedA === 0 ){
        return 2; // loose
    } else if(selectedA === selectedB){
        return 0; // draw // then assumet let A wins
    } else if((selectedA === 1 && selectedB === 3) || (selectedA === 2 && selectedB === 1) || (selectedA === 3 && selectedB === 2) ){
        return 1;
    }
    return 2; // in all other cases B wins
}


export const OptionToNumber = {
    "stone": 1,
    "paper": 2,
    "scissors": 3
}

export const NumberToOption = {
    1: "stone",
    2: "paper",
    3: "scissors"
}

export const resultOutputToTextFormate = {
    1: "Won!",
    2: "Loose :) ",
    0: "Draw..."
}

export const calculateFinalResultFromSelectionArray = (arr)=>{
    let win = 0;
    let loose = 0;
    let draw = 0;
    let result;
    arr.forEach(element =>{
        if(element === 1) win++
        if(element === 2) loose++
        if(element === 0) draw++
    })

    if(win === loose) 
    result = "Draw.."
    else if(win > loose)
    result = "Win!"
    else result = "Loose:)"

    return [result, win, loose, draw]
}
