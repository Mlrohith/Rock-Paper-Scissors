const { Socket } = require('dgram');
const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

const rooms = {};

app.use(express.static(path.join(__dirname,'ClientSide')));

app.get('/',(req,res) => {
    res.sendFile(__dirname+"/ClientSide/index.html");
})

io.on("connection", (socket)=>{
    console.log("user connected");
    socket.on('disconnect', ()=>{
        console.log("user disconnected");
    })
    socket.on('createroom', ()=>{
        var roomid = generateRandomString(10);
        console.log(roomid);
        rooms[roomid]={};
        socket.join(roomid);
        socket.emit("newgame", {roomid: roomid});
    })
    socket.on('joinroom',(data)=>{
        if(rooms[data.roomid]!=null){
            socket.join(data.roomid);
            socket.to(data.roomid).emit("playersconnected");
            socket.emit("playersconnected");
        }
    } )
    socket.on("p1Choice",(data)=>{
        let rpsValue = data.rpsValue;
        rooms[data.roomid].p1Choice = rpsValue;
        socket.to(data.roomid).emit("p1Choice",{rpsValue : data.rpsValue});
        if(rooms[data.roomid].p2Choice != null) {
            declareWinner(data.roomid, data.rpsValue);
        }
    });

    socket.on("p2Choice",(data)=>{
        let rpsValue = data.rpsValue;
        rooms[data.roomid].p2Choice = rpsValue;
        socket.to(data.roomid).emit("p2Choice",{rpsValue : data.rpsValue});
        if(rooms[data.roomid].p1Choice != null) {
            declareWinner(data.roomid, data.rpsValue);
        }
    });
})

const generateRandomString = (myLength) => {
    const chars =
      "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890";
    const randomArray = Array.from(
      { length: myLength },
      (v, k) => chars[Math.floor(Math.random() * chars.length)]
    );
  
    const randomString = randomArray.join("");
    return randomString;
};

function declareWinner(roomUniqueId, rpsValue) {
    let p1Choice = rooms[roomUniqueId].p1Choice;
    let p2Choice = rooms[roomUniqueId].p2Choice;
    let winner = null;
    if (p1Choice === p2Choice) {
        winner = "d";
    } else if (p1Choice == "Paper") {
        if (p2Choice == "Scissor") {
            winner = "p2";
        } else {
            winner = "p1";
        }
    } else if (p1Choice == "Rock") {
        if (p2Choice == "Paper") {
            winner = "p2";
        } else {
            winner = "p1";
        }
    } else if (p1Choice == "Scissor") {
        if (p2Choice == "Rock") {
            winner = "p2";
        } else {
            winner = "p1";
        }
    }
    io.sockets.to(roomUniqueId).emit("result", {
        winner: winner
    });
    rooms[roomUniqueId].p1Choice = null;
    rooms[roomUniqueId].p2Choice = null;
}


server.listen(3000,(req,res)=>{
    console.log("listening to port 3000");  
})