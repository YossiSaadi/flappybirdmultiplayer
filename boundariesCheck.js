const {PIPE_TOP_WIDTH, PIPE_TOP_HEIGHT, PIPE_SPACE, CANVAS_HEIGHT, GROUND_TOP_HEIGHT, IMG_HEIGHT} = require('./constants');

const checkBirdInThePipesXBoundary = (playerX, pipeX) => {
    return (playerX > pipeX && playerX < (pipeX + PIPE_TOP_WIDTH));
}

const checkBirdInThePipesYBoundary = (playerY, pipeHeight) => {
    return (checkBirdInTheTopPipeYBoundary(playerY, pipeHeight) || checkBirdInTheBottomPipeYBoundary(playerY, pipeHeight));
}

const checkBirdInTheTopPipeYBoundary = (playerY, pipeHeight) => {
    return playerY < (pipeHeight + PIPE_TOP_HEIGHT);
}

const checkBirdInTheBottomPipeYBoundary = (playerY, pipeHeight) => {
    return playerY > (pipeHeight + PIPE_SPACE);
}

const checkBirdInTheGroundYBoundary = (playerY) => {
    return playerY >= (CANVAS_HEIGHT - GROUND_TOP_HEIGHT - IMG_HEIGHT);
}

module.exports = {
    checkBirdInThePipesXBoundary,
    checkBirdInThePipesYBoundary,
    checkBirdInTheGroundYBoundary
}