const socket = io();

const A_KEY = 65;
const D_KEY = 68;
const S_KEY = 83;
const W_KEY = 87;

const LEFT_KEY = 37;
const RIGHT_KEY = 39;
const DOWN_KEY = 40;
const UP_KEY = 38;

const IMG_WIDTH = 50;
const IMG_HEIGHT = 50;

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

socket.emit('new player');

// get the canvas element from the html and set width and height
const canvas = document.getElementById('canvas');
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// get the context of canvas to make ops on it like drawing
const context = canvas.getContext('2d');

// get the image to draw on the canvas from the 'source' id in the html
const image = document.getElementById('source');

const movement = {
    up: false,
    down: false,
    left: false,
    right: false
}

document.addEventListener('keydown', (event) => {
    switch(event.keyCode) {
        case LEFT_KEY:
            movement.left = true;
            break;
        case RIGHT_KEY:
            movement.right = true;
            break;
        case DOWN_KEY:
            movement.down = true;
            break;
        case UP_KEY:
            movement.up = true;
            break;
    }
});

document.addEventListener('keyup', (event) => {
    switch(event.keyCode) {
        case LEFT_KEY:
            movement.left = false;
            break;
        case RIGHT_KEY:
            movement.right = false;
            break;
        case DOWN_KEY:
            movement.down = false;
            break;
        case UP_KEY:
            movement.up = false;
            break;
    }
});

// send the players movement indicator object 60 times a second to the server
setInterval(() => {
    socket.emit('movement', movement)
}, 1000 / 60);

// every time a 'state' message received from server
socket.on('state', (players) => {
    context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);   // clean the canvas - from (0,0) to (width, height)
    for (const id in players) {
        const player = players[id];
        context.drawImage(image, player.x, player.y, IMG_WIDTH, IMG_HEIGHT);
    }
});