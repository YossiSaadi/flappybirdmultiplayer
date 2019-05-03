const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');

const app = express();
const server = http.Server(app);
const io = socketIo(server);

app.set('port', 5000);
app.use('/', express.static(__dirname + '/'));

app.get('/', (request, respone) => {
    respone.sendFile(path.join(__dirname, 'index.html'));
});

server.listen(5000, () => {
    console.log('Starting the server on port 5000');
});

module.exports = {
    io
}