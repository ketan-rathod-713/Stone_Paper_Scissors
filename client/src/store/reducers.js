const initialState = {
    roomId: "",
    userName: "Ketan",
    opponentName: "Aman",
    timer : 10,
    selectionCountDown: 5,
    mySelection: 1,
    opponentSelection: 1,
    gameStarted: false,
    gameOver: false,
}

// different actions
// 1. createdRoomId or entered roomId ( EDIT_ROOM_ID)
// 2. edit username and opponent name
// 3. 

const gameReducer = (state = initialState, action) => {

}