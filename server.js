const express = require('express');
const app = express();
const https = require('https');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const httpsServer = https.createServer({
    key: fs.readFileSync("key.pem"),
    cert: fs.readFileSync("cert.pem"),
}, app)
const io = require('socket.io')(httpsServer)
const { ExpressPeerServer } = require('peer');

const peerServer = ExpressPeerServer(httpsServer, {
    debug: true
});

app.set('view engine', 'ejs');
app.use(express.static('./public'))
app.use('/peerjs', peerServer)

app.get('/', (req, res) => {
    res.redirect(`/${uuidv4()}`)
});

app.get('/:room', (req, res) => {
    res.render('room', {
        roomId: req.param.room
    });
});

io.on('connection', (socket) => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);

        socket.to(roomId).emit('user-connected', userId);
    });
})

httpsServer.listen(3030);