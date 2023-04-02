// main server

import express from 'express'
import fs from 'fs'
import http from 'http'
import cors from 'cors'
const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 4000
import { Server } from 'socket.io';

const clientOrigin = "http://localhost:3000";

// Socket.io
const io = new Server(server, 
  {
    cors: {
      origin: clientOrigin ,
      methods: ["GET", "POST"],
    }
  });

// Middleware
app.use(cors())
app.use(express.json())

app.get("/api", (req, res)=>{
    res.json({message: "Welcome to this api"})
})

// api to get audio for home page when reloads
app.get("/api/homeAudio", (req, res)=>{
    res.writeHead(200, {"Content-Type": "audio/mp3"});
    const exists = fs.existsSync(__dirname + "/public/gameMusic.mp3")
    console.log(exists);
    if(exists){
        var rstream = fs.createReadStream(__dirname + "/public/gameMusic.mp3")
        rstream.pipe(res)
    }
    else {
        res.end("it is res 404")
    }
    
})

// Room Information For Default Namespace
io.of("/").adapter.on("create-room", (room) => {
    console.log(`room ${room} was created`);
  });
  
  
  io.of("/").adapter.on("join-room", (room, id) => {
    console.log(`socket ${id} has joined room ${room}`);
    const roomSize = io.sockets.adapter.rooms.get(room).size
    console.log(`size of room currently is ${roomSize}`);
    
  });

const allRooms = {}
const allActiveUsers = []

// var clients = io.sockets.clients();
// // var clients = io.sockets.clients('room'); // all users from room `room`
// console.log(clients);


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

    socket.on("createNewGame", ()=>{
        // creating new code for game
    })

    


    // do it automatically, so that no need of create new game
    socket.on("joinGame", async (message)=>{ // join existing code room or join any room with given code if it is empty

        // WHAT if already in any room or other some info
        const prevRoomId = socket.gameState.roomId 
        if(prevRoomId){
            // here there can be two or 1 player so check it and do it
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

        const sizeOfRoom = io.sockets.adapter.rooms.get(message.roomId).size
        console.log("Now the total size of room is " + sizeOfRoom)

        let Room = io.sockets.adapter.rooms.get(message.roomId); // room object
        

        if(sizeOfRoom === 1){
            Room.users = [{socketId: socket.id, userName: socket.gameState.yourName}]
            console.log("CURRENT ROOM");
            console.log(Room);
            allRooms[socket.gameState.roomId] = {}
            allRooms[socket.gameState.roomId][socket.id] = {...allRooms[socket.gameState.roomId][socket.id] ,
                userName: socket.gameState.yourName
              }
              console.log("ALL ROOMS");
              console.log(allRooms);
              
        }
        
        if(sizeOfRoom === 2){
            Room.users = [...Room.users, {socketId: socket.id, userName: socket.gameState.yourName}]
            console.log("CURRENT ROOM");
            console.log(Room);

            allRooms[socket.gameState.roomId][socket.id] = {...allRooms[socket.gameState.roomId][socket.id] ,
                userName: socket.gameState.yourName
              }
              console.log("ALL ROOMS");  
              console.log(allRooms);
            // socket.emit("gameTimer")

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

    socket.emit("startTimer", ()=>{ // start timer of 10 sec before actual game starts. need to send to both players in room

    })

    socket.emit("gameStarted", ()=>{
        // tell client that game is started and then let server asks response from both the clients
    })

    socket.emit("selectOneOption")

    socket.on("selectedOneOption" , ()=>{
        // take this selected option and see if other user has done the same 
    })


    // MESSAGING FUNCTIONALITY
    // send message in room
    socket.on("sendMessage", (message)=>{
        console.log(message);
        const messageText = message.messageText
        const currentHours = new Date().getHours();
        const currentMinutes = new Date().getMinutes();
        
         // to all clients in room1 except the sender
        socket.to(socket.gameState.roomId).emit("receiveMessage", {
            userName: socket.gameState.yourName,
            messageText : messageText ,
            timeHours : currentHours,
            timeMinutes: currentMinutes
        });
    })

    socket.emit("receiveMessage", {
        // let client recieve the messages on time
    })

    socket.on("disconnecting", ()=>{
        const roomId = socket.gameState.roomId

        if(!roomId) return
        const roomSize = io.sockets.adapter.rooms.get(roomId).size
        if(roomSize == 1){
            delete allRooms[roomId]
        } 
        else if(roomSize == 2){
            delete allRooms[roomId][socket.id]
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
    console.log("server started ")
})