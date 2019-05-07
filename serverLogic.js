const {io} = require('./serverInit.js');
const {IMG_HEIGHT,
    REFRESH_RATE, 
    DIFFICULTY,
    TAKEOFF_PACE, 
    DIVING_PACE, 
    STARTING_X, 
    STARTING_Y, 
    CANVAS_WIDTH, 
    CANVAS_HEIGHT, 
    GROUND_TOP_HEIGHT,
    ONE_SECOND_MS} = require('./constants.js');

let players;
const pipes = [];
let gameStarted;
let socketCounter;
let numOfTotalPlayers;
let numOfCurrentPlayersInGame;

const initGame = () => {
    players = {};
    pipes.length = 0;
    gameStarted = false;
    socketCounter = 0;
    numOfTotalPlayers = 0;
    numOfCurrentPlayersInGame = 0;
}

const checkIsWinner = () => {
    if (numOfCurrentPlayersInGame <= 1) {
        return true;
    }
    return false;
}

initGame();

const {checkBirdInThePipesXBoundary, checkBirdInThePipesYBoundary, checkBirdInTheGroundYBoundary} = require('./boundariesCheck.js');

setInterval(() => {
    io.sockets.emit('current players', numOfCurrentPlayersInGame);
    console.log(numOfTotalPlayers, numOfCurrentPlayersInGame);
    if (numOfCurrentPlayersInGame === numOfTotalPlayers && numOfTotalPlayers > 0 && !gameStarted) {
        gameStarted = true;
        io.sockets.emit('start');
    }
}, ONE_SECOND_MS / 2);

io.on('connection', (socket) => {
    socket.emit('total players from server', numOfTotalPlayers);
    
    socket.on('init total players', (totalPlayers) => {
        numOfTotalPlayers = totalPlayers;
    });

    socket.on('increase num of players in game', () => {
        numOfCurrentPlayersInGame++;
    });

    socket.on('new player', (name) => {
        players[socket.id] = {
            serial: ++socketCounter,
            name: name,
            x: STARTING_X,
            y: STARTING_Y,
            points: 0
        };
    });

    socket.on('zeroize pipes', () => {
        pipes.length = 0;
    });

    socket.on('movement', (bool) => {
        const player = players[socket.id];
        if (player) {
            if (bool && player.y > 0) {
                player.y -= TAKEOFF_PACE;
            } else if (player.y < (CANVAS_HEIGHT - IMG_HEIGHT - GROUND_TOP_HEIGHT)) {
                player.y += DIVING_PACE;
            }
            
            pipes.forEach(pipe => {
                if ( (checkBirdInThePipesXBoundary(player.x, pipe.x) && checkBirdInThePipesYBoundary(player.y, pipe.height)) || checkBirdInTheGroundYBoundary(player.y)) {
                    socket.emit('end', checkIsWinner(), player);
                }
                if (player.x >= pipe.x && player.x <= pipe.x + 5) {
                    player.points++;
                }
            });
        }
    });

    socket.on('disconnect', () => {
        if (socketCounter > 0) {
            socketCounter--;
        }
        if (numOfCurrentPlayersInGame > 0) {
            numOfCurrentPlayersInGame--;
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
