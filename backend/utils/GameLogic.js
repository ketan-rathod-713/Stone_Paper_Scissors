// Game logic for two players
const stonePaperScissor = (selectedA, selectedB)=>{ // selectedA is user
    if(selectedA === 0 ){
        return 2; // loose
    }
    if(selectedA === selectedB){
        return 0; // draw
    }
    // assume A wins
    if((selectedA === 1 && selectedB === 3) || (selectedA === 2 && selectedB === 1) || (selectedA === 3 && selectedB === 2) ){
        return 1;
    }

    // in all other cases B wins
    return 2;
}

export {stonePaperScissor}