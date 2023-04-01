// main server

const express = require("express")
const jwt = require("jsonwebtoken")
const fs = require("fs")
const port = process.env.PORT || 80

const app = express();

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



app.listen(port, ()=>{
    console.log("server started ")
})