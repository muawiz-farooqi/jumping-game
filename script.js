const game = document.querySelector("#game");
const cat = document.querySelector("#cat");
const obstacle = document.querySelector("#obstacle");
const scoreDisplay = document.querySelector("#score");

const gameOverMessage = document.createElement("p");
gameOverMessage.textContent = "Game Over! Press Space to restart";
gameOverMessage.classList.add("game-over");

let score = 0;
let bestScore = Number(localStorage.getItem("bestScore")) || 0;

let obstacleX = game.clientWidth;
let obstacleSpeed = 3.5;
const initialObstacleSpeed = 3.5;
const maxObstacleSpeed = 7;

let isJumping = false;
let positionY = 0;
let velocityY = 0;
let isGameOver = false;

const gravity = 0.5;
const jumpForce = -12;

const minGap = 100;
const maxGap = 350;

function jump() {
    if (isJumping) return;

    isJumping = true;
    velocityY = jumpForce;
}

function updateJump() {
    if (!isJumping) return;

    velocityY += gravity;
    positionY += velocityY;

    if (positionY >= 0) {
        positionY = 0;
        velocityY = 0;
        isJumping = false;
    }

    cat.style.transform = `translateY(${positionY}px)`;
}

function gameLoop() {
    if (isGameOver) return;

    updateObstacle();
    updateJump();
    checkCollision();

    if (!isGameOver) {
        requestAnimationFrame(gameLoop);
    }
}

document.addEventListener("keydown", (event) => {
    if (event.code === "Space") {
        event.preventDefault();
        if (isGameOver) {
            restartGame();
        } else {
            jump();
        }
    }
});

game.addEventListener("click", () => {
    if (isGameOver) {
        restartGame();
    } else {
        jump();
    }
});

gameLoop();

function getRandomGap() {
    return Math.random() * (maxGap - minGap) + minGap;
}

function updateObstacle() {
    obstacleX -= obstacleSpeed;
    obstacle.style.left = `${obstacleX}px`;

    if (obstacleX < -obstacle.offsetWidth) {
        updateScore();
        obstacleX = game.clientWidth + getRandomGap();
    }
}

function checkCollision() {
    const catRect = cat.getBoundingClientRect();
    const obstacleRect = obstacle.getBoundingClientRect();

    if (
        catRect.right >= obstacleRect.left &&
        catRect.left <= obstacleRect.right &&
        catRect.bottom >= obstacleRect.top &&
        catRect.top <= obstacleRect.bottom
    ) {
        gameOver();
    }
}

function gameOver() {
    isGameOver = true;
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem("bestScore", bestScore);
    }

    gameOverMessage.textContent =
        `Game Over! Score: ${score} | Best: ${bestScore} | Press Space or tap to restart`;
    game.appendChild(gameOverMessage);
}

function restartGame() {
    isGameOver = false;
    isJumping = false;
    positionY = 0;
    velocityY = 0;
    obstacleSpeed = initialObstacleSpeed;
    obstacleX = game.clientWidth + getRandomGap();
    

    score = 0;
    scoreDisplay.textContent = score;

    cat.style.transform = `translateY(${positionY}px)`;
    obstacle.style.left = `${obstacleX}px`;

    gameOverMessage.remove();

    gameLoop();
}

function updateScore() {
    score += 1;
    scoreDisplay.textContent = score;
    if (score % 5 === 0 && obstacleSpeed < maxObstacleSpeed) {
        obstacleSpeed += 0.5;
    }
}
