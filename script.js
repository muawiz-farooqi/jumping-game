const game = document.querySelector("#game");
const cat = document.querySelector("#cat");
const obstacle = document.querySelector("#obstacle");

const gameOverMessage = document.createElement("p");
gameOverMessage.textContent = "Game Over! Press Space to restart";
gameOverMessage.classList.add("game-over");

let obstacleX = game.clientWidth;
const obstacleSpeed = 3.5;

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

    requestAnimationFrame(gameLoop);
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
    jump();
});

gameLoop();

function getRandomGap() {
    return Math.random() * (maxGap - minGap) + minGap;
}

function updateObstacle() {
    obstacleX -= obstacleSpeed;
    obstacle.style.left = `${obstacleX}px`;

    if (obstacleX < -obstacle.offsetWidth) {
        obstacleX = game.clientWidth + getRandomGap();
    }
}

// 3. Check overlap between #cat and #obstacle bounding boxes each frame -> game over if they collide mid-floor
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
    game.appendChild(gameOverMessage);
}

function restartGame() {
    isGameOver = false;
    isJumping = false;
    positionY = 0;
    velocityY = 0;
    obstacleX = game.clientWidth + getRandomGap();
    cat.style.transform = `translateY(${positionY}px)`;
    obstacle.style.left = `${obstacleX}px`;
    gameOverMessage.remove();

    gameLoop();
}

// 4. Increment #score while the game runs, save best score

