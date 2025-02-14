function detectMobileUser() {
  if (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    alert(
      "For get best experience, rotate your device or please use a desktop browser."
    );
  }
}
function showMobileControls() {
  if (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    document.querySelector(".mobile-controls").style.display = "flex";
  }
}

showMobileControls();

detectMobileUser();

const gun = document.querySelector(".gun");
const fireSound = new Audio("./assets/sound/ak47.mp3");
const scoreElement = document.querySelector(".score");
let gameRunning = true;
let enemyInterval;
let score = 0;
let isFiring = false;

// Mobile Control Elements
const upButton = document.querySelector(".up-button");
const downButton = document.querySelector(".down-button");
const fireButton = document.querySelector(".fire-button");

// Mobile Movement Speed
const moveSpeed = 10;
let moveInterval = null;

// Mobile Controls Event Listeners
function moveGun(direction) {
  const currentTop = parseInt(gun.style.top) || 0;
  let newTop = currentTop + (direction === "up" ? -moveSpeed : moveSpeed);

  // Bounds checking
  const minY = 5;
  const maxY = window.innerHeight - gun.clientHeight - 15;
  newTop = Math.max(minY, Math.min(newTop, maxY));

  gun.style.top = `${newTop}px`;
}

// Up Button
upButton.addEventListener("touchstart", (e) => {
  e.preventDefault();
  moveInterval = setInterval(() => moveGun("up"), 16);
});

upButton.addEventListener("touchend", () => {
  clearInterval(moveInterval);
});

// Down Button
downButton.addEventListener("touchstart", (e) => {
  e.preventDefault();
  moveInterval = setInterval(() => moveGun("down"), 16);
});

downButton.addEventListener("touchend", () => {
  clearInterval(moveInterval);
});

// Fire Button
fireButton.addEventListener("touchstart", (e) => {
  e.preventDefault();
  isFiring = true;
  fireBullet();
});

fireButton.addEventListener("touchend", () => {
  isFiring = false;
});

// Keep existing mouse controls for desktop
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
    fireBullet();
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
  document.querySelector(".game-container").appendChild(bullet);

  // Check if the user is on a mobile device
  if (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    bullet.style.width = "10px";
  }
  const gunY = gun.offsetTop + gun.clientHeight / 2 - 10;
  bullet.style.top = `${gunY}px`;
  bullet.style.left = "168px";

  const flame = document.createElement("img");
  flame.src = "./assets/blust.png";
  flame.classList.add("flame");
  flame.style.top = `${gunY - 18}px`;
  flame.style.left = "160px";
  document.querySelector(".game-container").appendChild(flame);

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
        increaseScore();
      }
    });
  }, 10);

  setTimeout(() => {
    bullet.remove();
    clearInterval(checkCollision);
  }, 1000);

  if (isFiring) {
    setTimeout(fireBullet, 100);
  }
}

function spawnEnemy() {
  if (!gameRunning) return;

  const numberOfEnemies = Math.floor(Math.random() * 4) + 1;

  for (let i = 0; i < numberOfEnemies; i++) {
    const enemy = document.createElement("img");
    const enemyNumber = Math.floor(Math.random() * 6) + 1;
    enemy.src = `./assets/enemy/e${enemyNumber}.png`;
    enemy.classList.add("enemy");
    document.querySelector(".game-container").appendChild(enemy);

    const enemyY = Math.random() * (window.innerHeight - 100);
    const horizontalOffset = i * 300;

    enemy.style.top = `${enemyY}px`;
    enemy.style.left = `${window.innerWidth + horizontalOffset}px`;

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
    }, 6000);
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
  return enemyRect.left <= dangerLineRect.right;
}

function showExplosion(enemy) {
  if (!document.querySelector(".game-container").contains(enemy)) return;

  const explosion = document.createElement("img");
  explosion.src = "./assets/die.png";
  explosion.classList.add("explosion");
  explosion.style.top = `${enemy.offsetTop}px`;
  explosion.style.left = `${enemy.offsetLeft}px`;
  document.querySelector(".game-container").appendChild(explosion);

  setTimeout(() => explosion.remove(), 500);
}

function increaseScore() {
  score++;
  scoreElement.textContent = `Score: ${score}`;
}

function gameOver() {
  if (!gameRunning) return;
  gameRunning = false;
  clearInterval(enemyInterval);
  document.querySelector(".game-over").style.display = "block";
}

function restartGame() {
  document.querySelector(".game-over").style.display = "none";
  score = 0;
  scoreElement.textContent = `Score: ${score}`;
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
