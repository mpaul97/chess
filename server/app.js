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

    socket.emit('roomsList', Array.from(roomsList, ([room, value]) => roomFilter(room, value)))
    io.emit('totalUsers', totalUsers)
    
    socket.on('getRooms', (callback) => {
        return callback(Array.from(roomsList, ([room, value]) => roomFilter(room, value)))
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
        newRoomData = {
            turn: oldRoomData.playerOne.username,
            playerOne: {
                username: oldRoomData.playerOne.username, 
                color: oldRoomData.playerOne.color
            },
            playerTwo: {
                username: data.username,
                color: "Black"
            }
        }
        roomsList.set(data.room, newRoomData)

        // Filter this array. If room has 2 players dont emit it.
        io.to(data.room).emit('roomsList', Array.from(roomsList, ([room, value]) => roomFilter(room, value)))

        if(io.of('/').adapter.rooms.get(data.room).size === 2) {
            io.to(data.room).emit('displayBoard', {room: data.room, turn: newRoomData.turn, playerOne: newRoomData.playerOne, playerTwo: newRoomData.playerTwo})
        }

        return callback({status: 'OK', message: `User ${data.username} is joining room ${data.room}`})
    })
    socket.on('makeMove', (data, callback) => {
        roomData = roomsList.get(data.room)
        if(roomData.turn === data.username && roomData.turn === roomData.playerOne.username) {
            roomData.turn = roomData.playerTwo.username
        }
        else {
            roomData.turn = roomData.playerOne.username
        }
        roomsList.set(data.room, roomData)
        io.to(data.room).emit('madeMove', {
            username: data.username, 
            index: data.index, 
            rank: data.rank, 
            file: data.file,
            oldIndex: data.oldIndex, 
            nextTurn: roomData.turn,
            didTake: 
            data.didTake
        })
    })
    socket.on('takePiece', (data, room, username, callback) => {
        allData = {takeablePiece: data, username: username}
        io.to(room).emit('pieceTaken', allData)
    })

    socket.on('disconnect', () => {
        totalUsers--
        io.emit('totalUsers', totalUsers)

        console.log('A user disconnected')
    })

    socket.on('sendMessage', (message) => {
        io.emit('recieveMessage', message)
    })
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})




/* UTILITY FUNCTIONS */
function roomFilter(room, value) {
    if((value.playerOne && !value.playerTwo) || (!value.playerOne && value.playerTwo)) {
        return {
            room: room, 
            playerOne: value.playerOne, 
            playerTwo: value.playerTwo
        }
    } 
    else {
        return 
    }
}