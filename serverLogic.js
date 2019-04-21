const {io} = require('./serverInit.js');
const {REFRESH_RATE, TAKEOFF_PACE, DIVING_PACE, STARTING_X, STARTING_Y, PLAYER_IMG_WIDTH, PLAYER_IMG_HEIGHT, CANVAS_WIDTH, CANVAS_HEIGHT} = require('./constants.js');

const players = {};

io.on('connection', (socket) => {
    socket.on('new player', () => {
        players[socket.id] = {
            x: STARTING_X,
            y: STARTING_Y
        };
    });
    socket.on('movement', (data) => {
        let player = players[socket.id];
        if (player) {
            if (data.up && player.y > 0) {
                player.y -= TAKEOFF_PACE;
            } else if (player.y < CANVAS_HEIGHT - PLAYER_IMG_HEIGHT) {
                player.y += DIVING_PACE;
            }
            //console.log(`*up* x: ${player.x}/${CANVAS_WIDTH} y: ${player.y}/${CANVAS_HEIGHT}`);
        } 
    });
});

// send the players state 60 times a second to the client
setInterval(() => {
    io.sockets.emit('state', players);
}, 1000 / REFRESH_RATE);

setInterval(() => {
    io.sockets.emit('pipe', players);
}, 1000);