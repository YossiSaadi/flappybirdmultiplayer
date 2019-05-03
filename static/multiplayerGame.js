const socket = io();

const UP_KEY = 32;

const REFRESH_RATE = 60;
const ONE_SECOND_MS = 1000;

const IMG_WIDTH = 50;
const IMG_HEIGHT = 50;

const CANVAS_WIDTH = 1000;
const CANVAS_ZERO_WIDTH = 0;
const CANVAS_HEIGHT = 600;
const CANVAS_ZERO_HEIGHT = 0;

const PIPE_SPACE = 200;
const PIPE_BODY_WIDTH = 60;
const PIPE_TOP_WIDTH = 90;
const PIPE_TOP_HEIGHT = 35;

const GROUND_TOP_HEIGHT = 20;
const GROUND_BOTTOM_HEIGHT = 150;

const POINTS = document.getElementById('points');

const START_TITLE = document.getElementById('start');
const END_TITLE = document.getElementById('end');
const WAIT_TITLE = document.getElementById('waiting');
const REMAINING_TITLE = document.getElementById('remaining');
// const RESTART_BUTTON = document.getElementById('restart_button');

const CANVAS = document.getElementById('canvas');

CANVAS.width = CANVAS_WIDTH;
CANVAS.height = CANVAS_HEIGHT;
const context = CANVAS.getContext('2d');

const bigPipeImg = document.getElementById('bigPipeImg');
const endPipeImg = document.getElementById('endPipeImg');
const groundImg = document.getElementById('groundImg');

let name;
let moveUp = false;
let numOfPlayersInGame; 
let numOfPlayersToPlayWith;

const addMoveListeners = () => {
    document.addEventListener('keydown', (event) => {
        if (event.keyCode === UP_KEY) {
            moveUp = true;
        }
    });
    document.addEventListener('keyup', (event) => {
        if (event.keyCode === UP_KEY) {
            moveUp = false;
        }
    });
}

setInterval(() => {
    socket.emit('movement', moveUp);
}, ONE_SECOND_MS / REFRESH_RATE);

socket.on('send num of total players to client', (numTotalPlayers) => {
    numOfPlayersToPlayWith = numTotalPlayers;
});

socket.on('current players', (numCurrentPlayers) => {
    numOfPlayersInGame = numCurrentPlayers;
    updateRemainingPlayers();
});

const updateRemainingPlayers = () => {
    REMAINING_TITLE.innerText = numOfPlayersToPlayWith - numOfPlayersInGame;
    console.log(numOfPlayersToPlayWith, numOfPlayersInGame);
}

socket.on('start', () => {
    socket.emit('new player', name);
    socket.emit('zeroize pipes');
    WAIT_TITLE.classList.add('hide');
    REMAINING_TITLE.classList.add('hide');
    addMoveListeners();
});

socket.on('move game', (players, pipes) => {
    context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    for (const id in players) {
        const player = players[id];
        context.drawImage(getBirdImg(player.serial), player.x, player.y, IMG_WIDTH, IMG_HEIGHT);
        context.font = '15px Lato';
        context.fillText(player.socketName + " " + player.points, player.x + IMG_WIDTH, player.y + IMG_HEIGHT);
    }
    
    pipes.forEach(pipe => {
        // draw top pipe
        context.drawImage(bigPipeImg, pipe.x + (PIPE_TOP_WIDTH - PIPE_BODY_WIDTH) / 2, 0, PIPE_BODY_WIDTH, pipe.height);
        context.drawImage(endPipeImg, pipe.x, pipe.height, PIPE_TOP_WIDTH, PIPE_TOP_HEIGHT);

        // draw bottom pipe based on top pipe
        context.drawImage(endPipeImg, pipe.x, pipe.height + PIPE_SPACE + PIPE_TOP_HEIGHT, PIPE_TOP_WIDTH, PIPE_TOP_HEIGHT);
        context.drawImage(bigPipeImg, pipe.x + (PIPE_TOP_WIDTH - PIPE_BODY_WIDTH) / 2, pipe.height + PIPE_TOP_HEIGHT*2 + PIPE_SPACE, PIPE_BODY_WIDTH, CANVAS_HEIGHT);
    });
    // draw ground
    context.drawImage(groundImg, 0, CANVAS_HEIGHT - GROUND_TOP_HEIGHT, CANVAS_WIDTH, GROUND_BOTTOM_HEIGHT);
});

const getBirdImg = (serial) => {
    if (serial > 4) {
        serial -= 4;
    }
    return document.getElementById(`birdImg${serial}`);
}

socket.on('end', () => {
    END_TITLE.classList.remove('hide');
    context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    socket.disconnect();
    // setTimeout(alert('Game ended!'), ONE_SECOND_MS);
});

const startGame = () => {
    askPlayerName();
    if (numOfPlayersToPlayWith <= 0) {
        askTotalPlayers();
    }
    START_TITLE.classList.add('hide');
    WAIT_TITLE.classList.remove('hide');
    REMAINING_TITLE.classList.remove('hide');
    socket.emit('increase num of players in game');
}

const askPlayerName = () => {
    name = prompt('Please enter your name: ');
}

const askTotalPlayers = () => {
    numOfPlayersToPlayWith = prompt('How many players (including you) would be playing?');
    socket.emit('init total players', numOfPlayersToPlayWith);
}

const initTitlesState = () => {
    if (START_TITLE.classList.contains('hide')) {
        START_TITLE.classList.remove('hide');
    }
    if (!WAIT_TITLE.classList.contains('hide')) {
        START_TITLE.classList.add('hide');
    }
    if (!REMAINING_TITLE.classList.contains('hide')) {
        START_TITLE.classList.add('hide');
    }
    if (!END_TITLE.classList.contains('hide')) {
        START_TITLE.classList.add('hide');
    }
}

const init = () => {
    initTitlesState();
    document.addEventListener('keypress', () => {
        if (!START_TITLE.classList.contains('hide')) {
            document.removeEventListener('keypress', () => {});
            startGame();
        }
    });
}

init();