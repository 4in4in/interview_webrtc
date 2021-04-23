const fs = require('fs')
const key = fs.readFileSync('certs/privkey.pem')
const cert = fs.readFileSync('certs/tmp/cert.pem')
const credentials = { key: key, cert: cert }

const host = '0.0.0.0'
const port = 6971

const express = require('express')
const app = express()
const server = require('https').createServer(credentials, app)
const io = require('socket.io')(server)

var ExpressPeerServer = require('peer').ExpressPeerServer;

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.redirect('/room?id=my_room_id')
})

app.get('/room', (req, res) => {
  const roomId = req.query.id;
  res.render('room', { roomId: roomId }) /// сюда можно передавать ID кандидата
})

app.get('/interview_client', (req, res) => {
  res.render('client')
})

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    io.in(roomId).clients((err, clients)=> {
      console.log(clients)
    })
    socket.join(roomId)
    socket.to(roomId).broadcast.emit('user-connected', userId)

    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
      console.log('disconnect')
    })
  })
})

app.use('/', ExpressPeerServer(server, { debug:true }));

server.listen(port, host, () => console.log(`server running at ${host}:${port}`))