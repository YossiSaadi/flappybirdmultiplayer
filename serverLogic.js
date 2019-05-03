const {io} = require('./serverInit.js');
const {REFRESH_RATE, 
    DIFFICULTY,
    TAKEOFF_PACE, 
    DIVING_PACE, 
    STARTING_X, 
    STARTING_Y, 
    PLAYER_IMG_HEIGHT, 
    CANVAS_WIDTH, 
    CANVAS_HEIGHT, 
    GROUND_HEIGHT,
    ONE_SECOND_MS} = require('./constants.js');

const players = {};
const pipes = [];
let gameStarted = false;
let socketCounter = 0;
let numOfPlayers = 0;
let numOfPlayersInGame = 0;

const {checkBirdInThePipesXBoundary, checkBirdInThePipesYBoundary, checkBirdInTheGroundYBoundary} = require('./boundariesCheck.js');

setInterval(() => {
    io.sockets.emit('current players', numOfPlayersInGame);
    console.log(numOfPlayers, numOfPlayersInGame);
    if (numOfPlayersInGame == numOfPlayers && numOfPlayers > 0 && !gameStarted) {
        gameStarted = true;
        io.sockets.emit('start');
    }
}, ONE_SECOND_MS / 2);

io.on('connection', (socket) => {
    socket.emit('send num of total players to client', numOfPlayers);
    
    socket.on('increase num of players in game', () => {
        ++numOfPlayersInGame;
    });

    socket.on('new player', (name) => {
        players[socket.id] = {
            serial: ++socketCounter,
            socketName: name,
            x: STARTING_X,
            y: STARTING_Y,
            points: 0
        };
    });

    socket.on('zeroize pipes', () => {
        pipes.length = 0;
    });

    socket.on('init total players', (numOfTotalPlayers) => {
        numOfPlayers = numOfTotalPlayers;
    });

    socket.on('movement', (bool) => {
        const player = players[socket.id];
        
        if (player) {
            if (bool && player.y > 0) {
                player.y -= TAKEOFF_PACE;
            } else if (player.y < (CANVAS_HEIGHT - PLAYER_IMG_HEIGHT - GROUND_HEIGHT)) {
                player.y += DIVING_PACE;
            }
            
            pipes.forEach(pipe => {
                if (checkBirdInThePipesXBoundary(player.x, pipe.x) && checkBirdInThePipesYBoundary(player.y, pipe.height)) {
                    socket.emit('end');
                } else if (checkBirdInTheGroundYBoundary(player.y)) {
                    socket.emit('end');
                }
                if (player.x >= pipe.x && player.x <= pipe.x + 5) {
                    player.points++;
                }
            });
        }
        
    });
});

setInterval(() => {
    io.sockets.emit('move game', players, pipes);
    pipes.forEach(pipe => {
        pipe.x -= DIFFICULTY;
    });
}, ONE_SECOND_MS / REFRESH_RATE);

setInterval(() => {
    pipes.push({
        x: CANVAS_WIDTH,
        height: Math.floor(Math.random() * (CANVAS_HEIGHT * 0.75 - 200))
    });
}, ONE_SECOND_MS * DIFFICULTY / 2);
