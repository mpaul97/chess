const cors = require('cors')
const path = require('path')
const http = require('http')
const express = require('express')
const app = express()
app.use(cors())
const server = http.createServer(app)
const port = process.env.PORT || 3000
const socketio = require("socket.io")
const { callbackify } = require('util')
const io = new socketio.Server(server, {
    cors: {
        origins: ["*"]
    }
})

const roomsList = new Map()

let totalUsers = 0

app.get('/', (req, res) => { 
    res.sendFile(__dirname + '/index.html');
})


io.on('connection', (socket) => {
    totalUsers++
    console.log('A user connected')

    socket.emit('roomsList', Array.from(roomsList, ([room, value]) => ({room: room, playerOne: value.playerOne, playerTwo: value.playerTwo})))
    socket.emit('totalUsers', totalUsers)
    socket.on('getRooms', (callback) => {
        return callback(Array.from(roomsList))
    })
    socket.on('newRoom', ({username}, callback) => {
        let room = { 
            playerOne: {username: username, color: "white"}, 
            playerTwo: null
        }

        roomsList.set(`room${roomsList.size}`, room)
        socket.join(room.room)
        console.log("New room: " + room.room + " was created")

        return callback({message: `User: ${username} is joining room: ${room.room}`, roomObject: [room]})
    })

    socket.on('joinRoom', (data, callback) => {
        socket.join(data.room)
        console.log(`${data.username} is joining room: ${data.room}`)
        // console.log(io.sockets.adapter.rooms.get(data.room))
        
        oldRoomData = roomsList.get(data.room)
        newRoomData = {playerOne: {username: oldRoomData.username, color: oldRoomData.color}, playerTwo: {username: data.username, color: "Black"}}
        console.log(roomsList.set(data.room, newRoomData))

        io.to(data.room).emit('roomsList', Array.from(roomsList, ([room, value]) => ({room: room, playerOne: value.playerOne, playerTwo: value.playerTwo})))
        
        return callback({message: `Joining room!`})
    })

    socket.on('disconnect', () => {
        totalUsers--
        console.log('A user disconnected')
    })
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})