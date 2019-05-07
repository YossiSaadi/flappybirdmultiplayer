const socket = io();

const IMG_WIDTH = 50;
const IMG_HEIGHT = 50;

const REFRESH_RATE = 60;

const UP_KEY = 32;

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 600;

const GROUND_TOP_HEIGHT = 20;
const GROUND_BOTTOM_HEIGHT = 150;

const PIPE_TOP_WIDTH = 90;
const PIPE_TOP_HEIGHT = 35;

const PIPE_SPACE = 200;
const PIPE_BODY_WIDTH = 60;

const ONE_SECOND_MS = 1000;

const START_TITLE = document.getElementById('start');
const END_TITLE = document.getElementById('end');
const STATUS_TITLE = document.getElementById('status');
const WAIT_TITLE = document.getElementById('waiting');
const REMAINING_TITLE = document.getElementById('remaining');

const CANVAS = document.getElementById('canvas');
const context = CANVAS.getContext('2d');

const bigPipeImg = document.getElementById('bigPipeImg');
const endPipeImg = document.getElementById('endPipeImg');
const groundImg = document.getElementById('groundImg');

let name;
let moveUp = false;
let numOfPlayersInGame; 
let numOfPlayersToPlayWith;

const setCanvasProps = () => {
    CANVAS.width = CANVAS_WIDTH;
    CANVAS.height = CANVAS_HEIGHT;
}

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

socket.on('total players from server', (numTotalPlayers) => {
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
        context.fillText(player.name + " " + player.points, player.x + IMG_WIDTH, player.y + IMG_HEIGHT);
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

socket.on('end', (isWinner, player) => {
    context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    END_TITLE.classList.remove('hide');
    STATUS_TITLE.classList.remove('hide');

    let status;
    if (isWinner) {
        status = `You WON! ${player.name}: ${player.points}`;
    } else {
        status = `You LOST! ${player.name}: ${player.points}`;
    }
    STATUS_TITLE.innerText = status;
    socket.disconnect();
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
    numOfPlayersToPlayWith = parseInt(prompt('How many players (including you) would be playing?'));
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
    if (!STATUS_TITLE.classList.contains('hide')) {
        STATUS_TITLE.classList.add('hide');
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

setCanvasProps();
init();