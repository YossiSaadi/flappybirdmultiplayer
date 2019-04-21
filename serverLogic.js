const {io} = require('./serverInit.js');
const {STARTING_X, STARTING_Y, CANVAS_WIDTH, CANVAS_HEIGHT} = require('./constants.js');

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
            if (data.left && player.x > 0) {
                player.x -= 5;
                console.log("left", player.x + "/" + CANVAS_WIDTH, player.y + "/" + CANVAS_HEIGHT);
            }
            if (data.right && player.x < CANVAS_WIDTH) {
                player.x += 5;
                console.log("right", player.x + "/" + CANVAS_WIDTH, player.y + "/" + CANVAS_HEIGHT);
            }
            if (data.down && player.y < CANVAS_HEIGHT) {
                player.y += 5;
                console.log("down", player.x + "/" + CANVAS_WIDTH, player.y + "/" + CANVAS_HEIGHT);
            }
            if (data.up && player.y > 0) {
                player.y -= 5;
                console.log("up", player.x + "/" + CANVAS_WIDTH, player.y + "/" + CANVAS_HEIGHT);
            }
        }
    });
});

// send the players state 60 times a second to the client
setInterval(() => {
    io.sockets.emit('state', players);
}, 1000 / 60);