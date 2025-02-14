const gun = document.querySelector(".gun");
const fireSound = new Audio("./assets/sound/ak47.mp3");
const scoreElement = document.querySelector(".score");
let gameRunning = true;
let enemyInterval;
let score = 0; // Initialize score
let isFiring = false; // Flag to track if the mouse is being pressed down

document.addEventListener("mousemove", (event) => {
  let y = event.clientY;
  let minY = 5;
  let maxY = window.innerHeight - gun.clientHeight - 15;
  y = Math.max(minY, Math.min(y, maxY));
  gun.style.top = y + "px";
});

document.addEventListener("mousedown", (event) => {
  if (event.button === 0) {
    isFiring = true;
    fireBullet(); // Fire initially
  }
});

document.addEventListener("mouseup", () => {
  isFiring = false;
});

function fireBullet() {
  if (!gameRunning || !isFiring) return;

  const bullet = document.createElement("img");
  bullet.src = "./assets/bullet.png";
  bullet.classList.add("bullet");
  document.querySelector(".game-container").appendChild(bullet); // Bullet inside game-container

  const gunY = gun.offsetTop + gun.clientHeight / 2 - 10;
  bullet.style.top = `${gunY}px`;
  bullet.style.left = "168px";

  const flame = document.createElement("img");
  flame.src = "./assets/blust.png";
  flame.classList.add("flame");
  flame.style.top = `${gunY - 18}px`;
  flame.style.left = "160px";
  document.querySelector(".game-container").appendChild(flame); // Flame inside game-container

  setTimeout(() => {
    flame.style.opacity = 0;
    setTimeout(() => flame.remove(), 200);
  }, 50);

  fireSound.play();

  setTimeout(() => {
    bullet.style.transform = `translateX(${window.innerWidth}px)`;
  }, 10);

  let checkCollision = setInterval(() => {
    document.querySelectorAll(".enemy").forEach((enemy) => {
      if (isColliding(bullet, enemy)) {
        showExplosion(enemy);
        bullet.remove();
        enemy.remove();
        clearInterval(checkCollision);
        increaseScore(); // Increase score on enemy hit
      }
    });
  }, 10);

  setTimeout(() => {
    bullet.remove();
    clearInterval(checkCollision);
  }, 1000);

  if (isFiring) {
    setTimeout(fireBullet, 100); // Delay between shots to simulate automatic fire
  }
}

function spawnEnemy() {
  if (!gameRunning) return;

  // Randomly determine how many enemies to spawn (1 to 4)
  const numberOfEnemies = Math.floor(Math.random() * 4) + 1;

  for (let i = 0; i < numberOfEnemies; i++) {
    const enemy = document.createElement("img");
    const enemyNumber = Math.floor(Math.random() * 6) + 1;
    enemy.src = `./assets/enemy/e${enemyNumber}.png`;
    enemy.classList.add("enemy");
    document.querySelector(".game-container").appendChild(enemy); // Enemy inside game-container

    const enemyY = Math.random() * (window.innerHeight - 100);
    const horizontalOffset = i * 300; // Horizontal spacing between enemies

    enemy.style.top = `${enemyY}px`;
    enemy.style.left = `${window.innerWidth + horizontalOffset}px`; // Add offset for spacing

    setTimeout(() => {
      enemy.style.left = `-${enemy.clientWidth + horizontalOffset}px`;
    }, 10);

    let checkLineCross = setInterval(() => {
      if (
        document.querySelector(".game-container").contains(enemy) &&
        hasCrossedLine(enemy)
      ) {
        gameOver();
        clearInterval(checkLineCross);
      }
    }, 100);

    setTimeout(() => {
      if (document.querySelector(".game-container").contains(enemy)) {
        enemy.remove();
        clearInterval(checkLineCross);
      }
    }, 6000); // Adjust time based on speed
  }
}

function isColliding(bullet, enemy) {
  if (
    !document.querySelector(".game-container").contains(bullet) ||
    !document.querySelector(".game-container").contains(enemy)
  )
    return false;

  const bulletRect = bullet.getBoundingClientRect();
  const enemyRect = enemy.getBoundingClientRect();

  return !(
    bulletRect.top > enemyRect.bottom ||
    bulletRect.bottom < enemyRect.top ||
    bulletRect.left > enemyRect.right ||
    bulletRect.right < enemyRect.left
  );
}

function hasCrossedLine(enemy) {
  if (
    !gameRunning ||
    !document.querySelector(".game-container").contains(enemy)
  )
    return false;
  const enemyRect = enemy.getBoundingClientRect();
  const dangerLineRect = document
    .querySelector(".danger-line")
    .getBoundingClientRect();
  return enemyRect.left <= dangerLineRect.right; // Check if enemy touches the danger line
}

function showExplosion(enemy) {
  if (!document.querySelector(".game-container").contains(enemy)) return;

  const explosion = document.createElement("img");
  explosion.src = "./assets/die.png";
  explosion.classList.add("explosion");
  explosion.style.top = `${enemy.offsetTop}px`;
  explosion.style.left = `${enemy.offsetLeft}px`;
  document.querySelector(".game-container").appendChild(explosion); // Explosion inside game-container

  setTimeout(() => explosion.remove(), 500);
}

function increaseScore() {
  score++; // Increment score by 1
  scoreElement.textContent = `Score: ${score}`; // Update score display
}

function gameOver() {
  if (!gameRunning) return;
  gameRunning = false;
  clearInterval(enemyInterval);
  document.querySelector(".game-over").style.display = "block";
}

function restartGame() {
  document.querySelector(".game-over").style.display = "none";
  score = 0; // Reset score
  scoreElement.textContent = `Score: ${score}`; // Update score display
  gameRunning = true;
  document.querySelectorAll(".enemy").forEach((enemy) => enemy.remove());
  startSpawning();
}

function startSpawning() {
  if (!gameRunning) return;
  clearInterval(enemyInterval);
  enemyInterval = setInterval(spawnEnemy, 2000);
}

startSpawning();
