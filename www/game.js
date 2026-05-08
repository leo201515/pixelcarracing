const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameState = 'start';
let score = 0;
let highScore = localStorage.getItem('pixelCarHighScore') || 0;
let gameSpeed = 3;
let speedIncrement = 0.001;

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

let playerCar = {
    x: CANVAS_WIDTH / 2 - 15,
    y: CANVAS_HEIGHT - 80,
    width: 30,
    height: 50,
    color: '#ff0000',
    speed: 5,
    isMovingLeft: false,
    isMovingRight: false
};

let enemyCars = [];
let enemySpawnRate = 100;
let enemySpawnCounter = 0;

let roadLines = [];
for (let i = 0; i < 10; i++) {
    roadLines.push({ y: i * 60 });
}

const carOptions = [
    { color: '#ff0000', name: 'Red Rocket' },
    { color: '#00ff00', name: 'Green Machine' },
    { color: '#0000ff', name: 'Blue Blaze' },
    { color: '#ffff00', name: 'Yellow Yam' }
];
let selectedCarIndex = 0;

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touchX = e.touches[0].clientX;
    handleTouch(touchX);
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touchX = e.touches[0].clientX;
    handleTouch(touchX);
});

canvas.addEventListener('touchend', () => {
    playerCar.isMovingLeft = false;
    playerCar.isMovingRight = false;
});

function handleTouch(touchX) {
    const rect = canvas.getBoundingClientRect();
    const relativeX = touchX - rect.left;
    const canvasRelativeX = (relativeX / rect.width) * CANVAS_WIDTH;
    
    playerCar.isMovingLeft = canvasRelativeX < CANVAS_WIDTH / 2;
    playerCar.isMovingRight = canvasRelativeX >= CANVAS_WIDTH / 2;
}

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    const canvasRelativeX = (relativeX / rect.width) * CANVAS_WIDTH;
    
    playerCar.isMovingLeft = canvasRelativeX < CANVAS_WIDTH / 2;
    playerCar.isMovingRight = canvasRelativeX >= CANVAS_WIDTH / 2;
});

canvas.addEventListener('mouseup', () => {
    playerCar.isMovingLeft = false;
    playerCar.isMovingRight = false;
});

function showStartScreen() {
    document.getElementById('startScreen').style.display = 'flex';
    document.getElementById('selectScreen').style.display = 'none';
    document.getElementById('gameOverScreen').style.display = 'none';
    gameState = 'start';
}

function showSelectScreen() {
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('selectScreen').style.display = 'flex';
    document.getElementById('gameOverScreen').style.display = 'none';
    gameState = 'select';
    renderCarOptions();
}

function showHighScores() {
    alert(`High Score: ${highScore}`);
}

function renderCarOptions() {
    const container = document.getElementById('carOptions');
    container.innerHTML = '';
    carOptions.forEach((car, index) => {
        const option = document.createElement('div');
        option.className = `car-option ${index === selectedCarIndex ? 'selected' : ''}`;
        option.onclick = () => {
            selectedCarIndex = index;
            playerCar.color = carOptions[index].color;
            renderCarOptions();
        };
        const preview = document.createElement('div');
        preview.className = 'car-preview';
        preview.style.backgroundColor = car.color;
        option.appendChild(preview);
        option.appendChild(document.createTextNode(car.name));
        container.appendChild(option);
    });
}

function startGame() {
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('selectScreen').style.display = 'none';
    document.getElementById('gameOverScreen').style.display = 'none';
    gameState = 'playing';
    
    score = 0;
    gameSpeed = 3;
    enemyCars = [];
    enemySpawnCounter = 0;
    playerCar.x = CANVAS_WIDTH / 2 - 15;
    playerCar.isMovingLeft = false;
    playerCar.isMovingRight = false;
    
    gameLoop();
}

function gameOver() {
    gameState = 'over';
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('pixelCarHighScore', highScore);
    }
    document.getElementById('finalScore').textContent = `Score: ${score}`;
    document.getElementById('highScore').textContent = `High Score: ${highScore}`;
    document.getElementById('gameOverScreen').style.display = 'flex';
}

function spawnEnemyCar() {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const x = Math.random() * (CANVAS_WIDTH - 40) + 20;
    enemyCars.push({
        x: x,
        y: -50,
        width: 30,
        height: 50,
        color: color,
        speed: gameSpeed + Math.random() * 2
    });
}

function update() {
    if (gameState !== 'playing') return;
    
    score += Math.floor(gameSpeed);
    gameSpeed += speedIncrement;
    
    if (playerCar.isMovingLeft && playerCar.x > 20) {
        playerCar.x -= playerCar.speed;
    }
    if (playerCar.isMovingRight && playerCar.x < CANVAS_WIDTH - 20 - playerCar.width) {
        playerCar.x += playerCar.speed;
    }
    
    enemySpawnCounter++;
    if (enemySpawnCounter > enemySpawnRate / gameSpeed) {
        spawnEnemyCar();
        enemySpawnCounter = 0;
    }
    
    for (let i = enemyCars.length - 1; i >= 0; i--) {
        const enemy = enemyCars[i];
        enemy.y += enemy.speed;
        
        if (enemy.y > CANVAS_HEIGHT) {
            enemyCars.splice(i, 1);
        }
        
        if (checkCollision(playerCar, enemy)) {
            gameOver();
            return;
        }
    }
    
    roadLines.forEach(line => {
        line.y += gameSpeed;
        if (line.y > CANVAS_HEIGHT) {
            line.y = -60;
        }
    });
}

function checkCollision(car1, car2) {
    return car1.x < car2.x + car2.width &&
           car1.x + car1.width > car2.x &&
           car1.y < car2.y + car2.height &&
           car1.y + car1.height > car2.y;
}

function draw() {
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    ctx.fillStyle = '#555';
    ctx.fillRect(20, 0, CANVAS_WIDTH - 40, CANVAS_HEIGHT);
    
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.setLineDash([20, 20]);
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, 0);
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);
    
    roadLines.forEach(line => {
        ctx.fillStyle = '#fff';
        ctx.fillRect(CANVAS_WIDTH / 2 - 2, line.y, 4, 30);
    });
    
    drawCar(playerCar);
    
    enemyCars.forEach(enemy => drawCar(enemy));
    
    ctx.fillStyle = '#fff';
    ctx.font = '20px monospace';
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`Speed: ${gameSpeed.toFixed(1)}`, 10, 60);
}

function drawCar(car) {
    ctx.fillStyle = car.color;
    ctx.fillRect(car.x, car.y, car.width, car.height);
    
    ctx.fillStyle = '#000';
    ctx.fillRect(car.x + 5, car.y + 5, car.width - 10, 15);
    
    ctx.fillStyle = '#000';
    ctx.fillRect(car.x - 3, car.y + 5, 3, 10);
    ctx.fillRect(car.x + car.width, car.y + 5, 3, 10);
    ctx.fillRect(car.x - 3, car.y + car.height - 15, 3, 10);
    ctx.fillRect(car.x + car.width, car.y + car.height - 15, 3, 10);
}

function gameLoop() {
    if (gameState !== 'playing') return;
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

showStartScreen();
