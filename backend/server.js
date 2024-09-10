const express = require('express');
const twilio = require('./ClientTwilio')
const bodyParser = require('body-parser')
const cors = require('cors')
const http = require('http')
const socketIo = require('socket.io')
const jwt = require('./utils/Jwt')
const { getAccessTokenForVoice } = require('./ClientTwilio')

require('dotenv').config()

const app = express()
const server = http.createServer(app)
const io = socketIo(server)

io.use((socket, next) => {
   if(socket.handshake.query && socket.handshake.query.token){
    const { token } = socket.handshake.query  
    try{
        const result = jwt.verifyToken(token)
        if(result.username) return next();
    }catch(error){

    }
    }
})

io.on('connection', (socket) => {
    console.log('Socket connected ', socket.id)
    socket.emit('twilio-token', { token: getAccessTokenForVoice('Icaro') })
    socket.on('disconnect', () => {
        console.log('Socket disconnected')
    })
    socket.on('answer-call', (sid) => {
        console.log('Answering call with sid ', sid)
        twilio.answerCall(sid)
    })
})


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors())

const port = process.env.PORT

app.get('/', (req, res) => {
    res.send("Hello!")
})

app.post('/check-token', (req, res) => {
    const {token} = req.body
    let isValid = false
    
    try{
         isValid = jwt.verifyToken(token)
    }catch(error){
        console.log(error)
    }
    res.send({ isValid })
})

app.post('/login', async (req, res) => {
    console.log('login in ')
    const {to, username, channel} = req.body;
    const data = await twilio.sendVerify(to, channel)
    res.send('data')
})

app.post('/verify', async (req, res) => {
    console.log('verifying code')
    const { to, code, username } = req.body
    const data = await twilio.verifyCode(to, code)
    if(data.status === 'approved'){
        const token = jwt.createJwt(username)
        return res.send({token})
    }
    res.status(401).send('Invalid token')
})

app.post('/call-new', (req, res) => {
    console.log('receive a new call')
    io.emit('call-new', {data: req.body})
    const response = twilio.voiceResponse('Thank you for your call! We will put you on hold until the next attendent is free.')
    res.type('text/xml')
    res.send(response.toString())
})

app.post('/call-status-changed', (req, res) => {
    console.log('Call Status Changes')
    res.send('ok', res.body)
})

app.post('/enqueue', (req, res) => {
    const response = twilio.enqueueCall('Customer Service')
    io.emit('enqueue', {data: req.body})
    res.type('text/xml')
    res.send(response.toString())
})

app.post('/connect-call', (req, res) => {
    const response = twilio.redirectCall('icaro')
    res.type('text/xml')
    res.send(response.toString())
})

server.listen(port, () => {
    console.log(`server running on PORT ${port}`)
})