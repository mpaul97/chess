const cors = require('cors')
const path = require('path')
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
const userData = new Map()
const roomsList = new Set()

let totalUsers = 0

app.get('/', (req, res) => { 
    res.sendFile(__dirname + '/index.html');
})


io.on('connection', (socket) => {
    totalUsers++
    console.log('A user connected')

    socket.on('message', (msg) => {
        console.log(msg)
    })

    socket.on('disconnect', () => {
        totalUsers--
        console.log('A user disconnected')
    })
})


server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})