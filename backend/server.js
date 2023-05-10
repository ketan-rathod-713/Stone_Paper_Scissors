// main server

import express from 'express';
import fs from 'fs';
import http from 'http';
import cors from 'cors';
import nodemailer from "nodemailer";

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 4000
import { Server } from 'socket.io';
import {stonePaperScissor} from './utils/GameLogic.js'

// Middleware
app.use(cors())
app.use(express.json())     

const clientOrigin = ["http://localhost:3000","https://main--funny-torrone-71cf1a.netlify.app"];

// Socket.io
const io = new Server(server, 
  {
    cors: {
      origin: clientOrigin ,
      methods: ["GET", "POST"],
    }
  });

app.get("/", (req, res)=>{
    res.json({
        message: "Welcome to the api of stone paper scissors"
    })
})

app.get("/api", (req, res)=>{
    res.json({message: "Welcome to this api"})
})

app.get("/api/homeAudio", (req, res)=>{
    res.writeHead(200, {"Content-Type": "audio/mp3"});
    const exists = fs.existsSync("./public/gameMusic.mp3")
    console.log(exists);
    if(exists){
        var rstream = fs.createReadStream("./public/gameMusic.mp3")
        rstream.pipe(res)
    }
    else {
        res.end("it is res 404")
    }
    
})

io.of("/").adapter.on("create-room", (room) => { // Room Information For Default Namespace
    console.log(`room ${room} was created`);
});

io.of("/").adapter.on("join-room", (room, id) => {
    console.log(`socket ${id} has joined room ${room}`);
    const roomSize = io.sockets.adapter.rooms.get(room).size
    console.log(`size of room currently is ${roomSize}`);
});

const allRooms = {}

io.on("connection", (socket)=>{
    const gameState = {
        roomId: null,
        yourName: null,
        yourSocketId: socket.id,
        opponentSocketId: null,
        counter: 10, // for number of times to ask for option selection, frontend need not to worry about such things
        mySelection : []
    }
    socket.gameState = gameState
    console.log('a user connected with socket id ' + socket.id);
    
    socket.on("joinGame", async (message)=>{ // join existing code room or join any room with given code if it is empty
        const prevRoomId = socket.gameState.roomId; // if previously joined any room 
        if(prevRoomId){
            const roomSize = io.sockets.adapter.rooms.get(prevRoomId).size
            if(roomSize == 1){
                delete allRooms[prevRoomId]
            } 
            else if(roomSize == 2){
                delete allRooms[prevRoomId][socket.id]
            }
        }

        socket.gameState.yourName = message.yourName
        socket.gameState.roomId = message.roomId
        console.log(socket.gameState);
        
        socket.join(message.roomId)

        const sizeOfRoom = io.sockets.adapter.rooms.get(message.roomId).size;
        console.log("Now the total size of room is " + sizeOfRoom);

        let Room = io.sockets.adapter.rooms.get(message.roomId); // room object
        
        if(sizeOfRoom === 1){
            Room.users = [{socketId: socket.id, userName: socket.gameState.yourName}]
            console.log("CURRENT ROOM");
            console.log(Room);
            allRooms[socket.gameState.roomId] = {}
            allRooms[socket.gameState.roomId][socket.id] = {...allRooms[socket.gameState.roomId][socket.id] ,
                userName: socket.gameState.yourName,
                socketId: socket.id,
                selections: []
            }
            console.log("ALL ROOMS");
            console.log(allRooms);
            
        }
        
        if(sizeOfRoom === 2){
            Room.users = [...Room.users, {socketId: socket.id, userName: socket.gameState.yourName}]
            console.log("CURRENT ROOM");
            console.log(Room);

            allRooms[socket.gameState.roomId][socket.id] = {...allRooms[socket.gameState.roomId][socket.id] ,
                userName: socket.gameState.yourName,
                socketId: socket.id,
                selections: []
            }
            allRooms[socket.gameState.roomId]["timer"] = 10
            allRooms[socket.gameState.roomId]["totalOptionCount"] = 5 // THIS VALUE IS CONSTANT // FOR LOGIC
            allRooms[socket.gameState.roomId]["optionCount"] = 5
            allRooms[socket.gameState.roomId]["totalPlayersSelected"] = 0

            const currentRoom = allRooms[socket.gameState.roomId];
            console.log("current Room ",currentRoom);

            const Timer = 10
            let counter = Timer
            socket.in(socket.gameState.roomId).emit("timerStarted", {
                timer: Timer
            })
            socket.emit("timerStarted", {
                timer: Timer
            })

            waitAndDo(Timer)

            function waitAndDo(times) {
                if(times === 0) {
                    socket.in(socket.gameState.roomId).emit("gameStarted", {
                        totalCounts: allRooms[socket.gameState.roomId]["optionCount"]
                    })
                    socket.emit("gameStarted", {
                        totalCounts: allRooms[socket.gameState.roomId]["optionCount"]
                    })
                    console.log("ALL ROOMS")
                    console.log(
                    allRooms
                    );  
                return;
                }
                
                setTimeout(function() {
                    console.log('Doing a request');
                    console.log(socket.gameState.roomId);

                    socket.in(socket.gameState.roomId).emit("timer", {
                    timer: counter
                    })
                    socket.emit("timer", {
                        timer: counter
                    })


                counter = counter - 1
                waitAndDo(times-1);
                }, 300);
            }

            console.log("ALL ROOMS");  
            console.log(allRooms);

            const allSockets =await io.in(message.roomId).fetchSockets()
            console.log("ALL SOCKETS IN GIVEN ROOM");
            console.log(allSockets[0].gameState);
            console.log(allSockets[1].gameState);
        }
        
        if(sizeOfRoom === 2){
            console.log("start game timer");
            
        }
        
        if(sizeOfRoom > 2){
            socket.leave(message.roomId)
            console.log("got out of room ( room is full already )");
        }
    })


    socket.on("optionSelect", (message)=>{
        console.log(message);
        console.log(allRooms[socket.gameState.roomId])
        const {optionSelected, optionNumber} = message
        const currentRoom = allRooms[socket.gameState.roomId]

        allRooms[socket.gameState.roomId][socket.id]["selections"].push(optionSelected)
        allRooms[socket.gameState.roomId]["totalPlayersSelected"]++
        console.log(allRooms[socket.gameState.roomId]);
        
        // match the timer
        const totalPlayersSelected = allRooms[socket.gameState.roomId]["totalPlayersSelected"]

        // KNOW CURRENT PLAYER AND OPPONENT PLAYERS
        const players = Object.keys(currentRoom)

        let currentPlayerIndex;
        let opponentPlayerIndex;

        if(players[0] == socket.id){
            currentPlayerIndex = 0 
            opponentPlayerIndex = 1
        } else {
            currentPlayerIndex = 1
            opponentPlayerIndex = 0
        }

        // FIRST GUY
        if(totalPlayersSelected === 1){ // initally 0
            
        // OPPONENT SELECTED MESSAGE TICK MARK ONLY EVENT ( DON'T SEND DATA)
        socket.to(players[opponentPlayerIndex]).emit("opponentSelectedOption")
            
        } else if(totalPlayersSelected === 2){ // after one player selected
            allRooms[socket.gameState.roomId]["optionCount"]--
            allRooms[socket.gameState.roomId]["totalPlayersSelected"] = 0 // now they can repeat selecting options  
            
            // GAME LOGIC TO FIND SELECTION ANS
            const totalOptionCount = allRooms[socket.gameState.roomId]["totalOptionCount"]
            
            const iterator = totalOptionCount  - allRooms[socket.gameState.roomId]["optionCount"] - 1
            console.log("iterator ", iterator);
            const currentPlayerSelection = allRooms[socket.gameState.roomId][socket.id]["selections"][iterator]
            const opponentPlayerSelection = allRooms[socket.gameState.roomId][players[opponentPlayerIndex]]["selections"][iterator]
            
            const currentPlayerResult = stonePaperScissor(currentPlayerSelection, opponentPlayerSelection)
            const opponentPlayerResult = stonePaperScissor(opponentPlayerSelection, currentPlayerSelection)

            // CURRENT PLAYER
                socket.emit("optionSelectionResult", {
                    result: currentPlayerResult, // either 1, -1 or 0
                    mySelection: currentPlayerSelection,
                    opponentSelection: opponentPlayerSelection,
                    optionCount: allRooms[socket.gameState.roomId]["optionCount"]
                })
                
            // OPPONENT PLAYER
                socket.to(players[opponentPlayerIndex]).emit("optionSelectionResult", {
                    result: opponentPlayerResult, // either 1, -1 or 0
                    mySelection: opponentPlayerSelection ,
                    opponentSelection: currentPlayerSelection,
                    optionCount: allRooms[socket.gameState.roomId]["optionCount"]
                })

                // LOGIC FOR GAME OVER
                if(allRooms[socket.gameState.roomId]["optionCount"] === 0){
                    // GAME OVER // SEND RESULT TO BOTH // if 2nd player selects
                    setTimeout(() => {
                        // CURRENT PLAYER
                        socket.emit("gameOver", {
                            mySelections : allRooms[socket.gameState.roomId][socket.id]["selections"],
                            opponentSelections: [1, 2, 3],
                            result: 1 // you win,
                        })

                        // OPPONENT PLAYER
                        socket.to(players[opponentPlayerIndex]).emit("gameOver", {
                            mySelections : allRooms[socket.gameState.roomId][socket.id]["selections"],
                            opponentSelections: [1, 2, 3],
                            result: 0 // you win,
                        })
                    }, 1000);
                }   
            }
        })

    socket.on("createNewGame", (message)=>{
        const randomRoomCode = 100000 + Math.floor(Math.random() * 900000);
        socket.emit("createNewGame", {
            roomId : randomRoomCode
        })
    })

    socket.on("sendMessage", (message)=>{  // MESSAGING FUNCTIONALITY
        console.log(message);
        const messageText = message.messageText
        const currentHours = new Date().getHours();
        const currentMinutes = new Date().getMinutes();
        
        socket.to(socket.gameState.roomId).emit("receiveMessage", { // send to except sender
            userName: socket.gameState.yourName,
            messageText : messageText ,
            timeHours : currentHours,
            timeMinutes: currentMinutes
        });
    })

    socket.on("disconnecting", ()=>{
        const roomId = socket.gameState.roomId

        if(!roomId) return
        const roomSize = io.sockets.adapter.rooms.get(roomId).size
        if(roomSize == 1){
            delete allRooms[roomId]
        } else if(roomSize == 2){
            delete allRooms[roomId][socket.id]

            socket.to(roomId).emit("error", {
                type: "userLeft",
                message: "An Opponent Left"
            })
        }
    })

    // for disconnecting
    socket.on("disconnect", ()=>{
        console.log("socket disconnected " , socket.id);
        console.log("ALL ROOMS");
        console.log(allRooms);
    })
})


server.listen(port, ()=>{
    console.log("server started on port ", port);
})