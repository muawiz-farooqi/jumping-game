const game = document.querySelector("#game");
const cat = document.querySelector("#cat");

let isJumping = false;
let positionY = 0;
let velocityY = 0;

const gravity = 0.5;
const jumpForce = -12;

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
    updateJump();

    requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", (event) => {
    if (event.code === "Space") {
        event.preventDefault();
        jump();
    }
});

game.addEventListener("click", () => {
    jump();
});

gameLoop();

// 2. Move #obstacle from right to left on a loop (setInterval or requestAnimationFrame), resetting it off-screen


// 3. Check overlap between #cat and #obstacle bounding boxes each frame -> game over if they collide mid-floor


// 4. Increment #score while the game runs, save best score

