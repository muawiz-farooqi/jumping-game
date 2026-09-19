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
let obstacleSpeed = 4.5;
const initialObstacleSpeed = 4.5;
const maxObstacleSpeed = 8;

let isJumping = false;
let positionY = 0;
let velocityY = 0;
let isGameOver = false;

const gravity = 0.9;
const jumpForce = -15;

const minGap = 100;
const maxGap = 350;

const restartDelay = 400;
let gameOverTime = 0;

// Press H in the game to draw them and tweak the numbers until they hug the art.

// cat is 70x66 SVG viewBox
const CAT_VIEWBOX = { width: 70, height: 66 };
const catScale = (cat.offsetWidth || 58) / CAT_VIEWBOX.width;
const catLeft = cat.offsetLeft || 60;
const floorOffset = parseFloat(getComputedStyle(cat).bottom) || 70;

function svgBox(x1, y1, x2, y2) {
    return {
        x: x1 * catScale,
        y: (CAT_VIEWBOX.height - y2) * catScale,
        w: (x2 - x1) * catScale,
        h: (y2 - y1) * catScale,
    };
}

// 2 hitboxes for the cat: body and head
const catHitboxes = [
    svgBox(10, 32, 54, 64), // roomba + body
    svgBox(40, 8, 60, 34), // head (no ears)
];

// Sizes match the obstacle rules in css file
const obstacleTypes = [
    {
        name: "plant", // 34 x 46
        hitboxes: [
            { x: 5, y: 0, w: 24, h: 20 }, // pot
            { x: 10, y: 18, w: 14, h: 27 }, // leaves
        ],
    },
    {
        name: "lamp", // 24 x 72: tall and thin
        hitboxes: [
            { x: 3, y: 0, w: 18, h: 5 }, // base
            { x: 10, y: 0, w: 4, h: 50 }, // pole
            { x: 3, y: 49, w: 18, h: 21 }, // shade
        ],
    },
    {
        name: "box", // 54 x 29: low and wide
        hitboxes: [{ x: 1, y: 0, w: 52, h: 27 }],
    },
    {
        name: "basket", // 42 x 48: chunky
        hitboxes: [
            { x: 3, y: 0, w: 36, h: 31 }, // basket
            { x: 8, y: 30, w: 26, h: 17 }, // clothes
        ],
    },
];

let currentType = obstacleTypes[0];
let showHitboxes = false;

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
    drawHitboxes();

    if (!isGameOver) {
        requestAnimationFrame(gameLoop);
    }
}

// one action per input: jump while playing, restart after game over
function handleInput() {
    if (!isGameOver) {
        jump();
    } else if (performance.now() - gameOverTime >= restartDelay) {
        restartGame();
    }
}

document.addEventListener("keydown", (event) => {
    if (event.code === "Space") {
        event.preventDefault();
        if (event.repeat) return;
        handleInput();
    } else if (event.code === "KeyH") {
        showHitboxes = !showHitboxes;
        drawHitboxes();
    }
});

game.addEventListener("click", handleInput);

function getRandomGap() {
    return Math.random() * (maxGap - minGap) + minGap;
}

// pick a random obstacle type and place it off the right
function spawnObstacle() {
    currentType =
        obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
    obstacle.className = `obstacle obstacle--${currentType.name}`;
    obstacleX = game.clientWidth + getRandomGap();
    obstacle.style.left = `${obstacleX}px`;
}

function updateObstacle() {
    obstacleX -= obstacleSpeed;
    obstacle.style.left = `${obstacleX}px`;

    if (obstacleX < -obstacle.offsetWidth) {
        updateScore();
        spawnObstacle();
    }
}

// turn boxes into game coordinates
function worldBoxes(boxes, left, bottom) {
    return boxes.map((box) => ({
        left: left + box.x,
        right: left + box.x + box.w,
        bottom: bottom + box.y,
        top: bottom + box.y + box.h,
    }));
}

function overlaps(a, b) {
    return (
        a.right > b.left &&
        a.left < b.right &&
        a.top > b.bottom &&
        a.bottom < b.top
    );
}

function getCurrentBoxes() {
    return {
        cat: worldBoxes(catHitboxes, catLeft, -positionY),
        obstacle: worldBoxes(currentType.hitboxes, obstacleX, 0),
    };
}

function checkCollision() {
    const boxes = getCurrentBoxes();

    const hit = boxes.cat.some((catBox) =>
        boxes.obstacle.some((obstacleBox) => overlaps(catBox, obstacleBox)),
    );

    if (hit) {
        gameOver();
    }
}

// debug overlay (toggle with H)
function drawHitboxes() {
    game.querySelectorAll(".hitbox").forEach((el) => el.remove());
    if (!showHitboxes) return;

    const boxes = getCurrentBoxes();
    [...boxes.cat, ...boxes.obstacle].forEach((box) => {
        const el = document.createElement("div");
        el.classList.add("hitbox");
        el.style.left = `${box.left}px`;
        el.style.bottom = `${floorOffset + box.bottom}px`;
        el.style.width = `${box.right - box.left}px`;
        el.style.height = `${box.top - box.bottom}px`;
        game.appendChild(el);
    });
}

function gameOver() {
    isGameOver = true;
    gameOverTime = performance.now();
    cat.classList.add("dead");

    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem("bestScore", bestScore);
    }

    gameOverMessage.textContent = `Game Over! Score: ${score} | Best: ${bestScore}\nPress Space or tap to restart`;
    game.appendChild(gameOverMessage);
}

function restartGame() {
    isGameOver = false;
    isJumping = false;
    positionY = 0;
    velocityY = 0;
    obstacleSpeed = initialObstacleSpeed;

    score = 0;
    scoreDisplay.textContent = score;

    cat.classList.remove("dead");
    cat.style.transform = `translateY(${positionY}px)`;
    spawnObstacle();

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

spawnObstacle();
gameLoop();
