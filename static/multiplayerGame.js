const socket = io();

const UP_KEY = 32;

const REFRESH_RATE = 60;

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

socket.emit('new player');

// get the canvas element from the html and set width and height
const canvas = document.getElementById('canvas');
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// get the context of canvas to make ops on it like drawing
const context = canvas.getContext('2d');

// get the images to draw on the canvas from the html document
const birdImg = document.getElementById('birdImg');
const bigPipeImg = document.getElementById('bigPipeImg');
const endPipeImg = document.getElementById('endPipeImg');

const movement = {
    up: false
}

document.addEventListener('keydown', (event) => {
    if (event.keyCode === UP_KEY) {
        movement.up = true;
    }
});

document.addEventListener('keyup', (event) => {
    if (event.keyCode === UP_KEY) {
        movement.up = false;
    }
});

// send the players movement indicator object 60 times a second to the server
setInterval(() => {
    socket.emit('movement', movement)
}, 1000 / REFRESH_RATE);

// every time a 'state' message received from server draw the canvas
socket.on('state', (players) => {
    context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);   // clean the canvas - from (0,0) to (width, height)
    for (const id in players) {
        const player = players[id];
        context.drawImage(birdImg, player.x, player.y, IMG_WIDTH, IMG_HEIGHT);
    }
    const pipeBodyEnd = 290;
    context.drawImage(bigPipeImg, 350, CANVAS_ZERO_HEIGHT, PIPE_BODY_WIDTH, pipeBodyEnd);
    context.drawImage(endPipeImg, 335, pipeBodyEnd, PIPE_TOP_WIDTH, PIPE_TOP_HEIGHT);

    const pipeBodyEnd2 = 290 - PIPE_SPACE;
    context.drawImage(bigPipeImg, 350, CANVAS_HEIGHT - pipeBodyEnd2, PIPE_BODY_WIDTH, CANVAS_HEIGHT);
    context.drawImage(endPipeImg, 335, CANVAS_HEIGHT - pipeBodyEnd2, PIPE_TOP_WIDTH, PIPE_TOP_HEIGHT);
});

socket.on('pipe', (players) => {
    // context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
});