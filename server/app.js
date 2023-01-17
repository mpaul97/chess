const cors = require('cors')
const http = require('http')
const express = require('express')
const app = express()
app.use(cors())
const server = http.createServer(app)
const port = process.env.PORT || 3000
const socketio = require("socket.io")
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
        return callback(Array.from(roomsList, ([room, value]) => ({room: room, playerOne: value.playerOne, playerTwo: value.playerTwo})))
    })
    socket.on('newRoom', ({username}, callback) => {
        let room = { 
            playerOne: {username: username, color: "White"}, 
            playerTwo: null
        }
        let key = `room${roomsList.size}`

        roomsList.set(key, room)
        socket.join(key)
        console.log("New room: " + `${key}` + " was created")
        return callback({message: `User: ${username} is joining room: ${key}`, roomObject: [room]})
    })

    socket.on('joinRoom', (data, callback) => {
        console.log(io.of('/').adapter.rooms.get(data.room))
        console.log(io.of('/').adapter.rooms.get(data.room).size)
        if(io.of('/').adapter.rooms.get(data.room).size === 2) {
            return callback({status: 'ERROR', message: `Room ${data.room} is full!`}) 
        }
        socket.join(data.room)
        console.log(`${data.username} is joining room: ${data.room}`)
        
        oldRoomData = roomsList.get(data.room)
        newRoomData = {playerOne: {username: oldRoomData.playerOne.username, color: oldRoomData.playerOne.color}, playerTwo: {username: data.username, color: "Black"}}
        roomsList.set(data.room, newRoomData)

        io.to(data.room).emit('roomsList', Array.from(roomsList, ([room, value]) => ({room: room, playerOne: value.playerOne, playerTwo: value.playerTwo})))

        if(io.of('/').adapter.rooms.get(data.room).size === 2) {
            io.to(data.room).emit('displayBoard')
        }
        // return callback({status: 'OK', message: `User ${data.username} is joining room ${data.room}`})
    })

    socket.on('disconnect', () => {
        totalUsers--
        console.log('A user disconnected')
    })
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})