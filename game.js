const canvas = document.getElementById('Gamecanvas');
const ctx = canvas.getContext('2d');
const Picksound = new Audio("pickupCoin (2).wav")
const Oversound = new Audio("hitHurt.wav")

let score = 0;
let isGameOver = false;
let isPaused = false;
let highScore = localStorage.getItem('pixel-chaser-highscore') || 0;
let isStarted = false;

const player = {
    x:375,
    y:225,
    width: 50,
    height:50,
    speed: 8,
    color: '#00f5d4'
};
const coin = {
    x: Math.random() * (canvas.width - 40) + 20,
    y: Math.random() * (canvas.height - 40) + 20,
    radius : 15,
    color: '#ffee32'
}
const enemy = {
    x:600,
    y:100, 
    width: 35,
    height: 35,
    speedX : 7,
    speedY: 7,
    color: '#f72585'
}
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    w: false,
    s: false,
    a: false,
    d: false
};

window.addEventListener('keydown', (e) => {

    if (!isStarted) {
        if (e.key === ' ' || e.key === 'Enter') {
            isStarted = true;
        }
        return;
    }

    if (isGameOver) {
        if(e.key === ' ' || e.key === 'Enter') {
            reset();
        }
        return;
    }

    if(e.key.toLowerCase()==='p'){
        isPaused = !isPaused
        return;
    }
    const key = e.key.length === 1 ? e.key.toLowerCase() :e.key;
    if (keys.hasOwnProperty(key)) {
        keys[key] = true;
    }
});

window.addEventListener('keyup',(e) => {
    const key = e.key.length === 1 ? e.key.toLowerCase() :e.key;
    if (keys.hasOwnProperty(key)) {
        keys[key] = false;
    }
});

function checkCollision(Rect1, Rect2) {
    return Rect1.x < Rect2.x + Rect2.width &&
    Rect1.x + Rect1.width > Rect2.x &&
    Rect1.y < Rect2.y + Rect2. height &&
    Rect1.y + Rect1.height > Rect2.y;
}

function checkCircleCollision(rect, circle) {
    const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(circle.y, rect.y +rect.height));

    const distanceX = circle.x - closestX;
    const distanceY = circle.y - closestY;
    const distanceSquare = (distanceX * distanceX) + (distanceY * distanceY);

    return distanceSquare < (circle.radius * circle.radius);
}

function respawnCoin() {
    coin.x = Math.random() * (canvas.width - coin.radius * 2) + coin.radius;
    coin.y = Math.random() * (canvas.height - coin.radius * 2) + coin.radius;
}

function PickCoin(){
    Picksound.currentTime = 0
    Picksound.play().catch(error => console.log("Audio couldn't be played", error));
    score += 1

    if (score > highScore) {
        highScore = score;
        localStorage.setItem( 'pixel-chaser-highscore' , highScore);
    }
    respawnCoin()
}

function Over() {
    isGameOver = true
    Oversound.currentTime = 0;
    Oversound.play().catch(error => console.log("Audio could'nt be played", error));
    } 
function reset() {
    score = 0;
    isGameOver = false;
    isPaused = false;
    
    player.x = 375;
    player.y = 225;
    enemy.x = 600;
    enemy.y = 100;
    enemy.speedX = 7;
    enemy.speedY = 7;

    respawnCoin();
}
function update() {

    if ( !isStarted ||isGameOver || isPaused) return;
    if (keys.ArrowUp || keys.w) {
        player.y -= player.speed;
    }
    if (keys.ArrowDown || keys.s){
        player.y += player.speed;
    }
    if (keys.ArrowLeft || keys.a) {
        player.x -= player.speed;
    }
    if (keys.ArrowRight || keys.d) {
        player.x += player.speed;
    }

    if (player.x < 0) player.x = 0;
    if (player.y <0) player.y = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;


    enemy.x += enemy.speedX;
    enemy.y += enemy.speedY;

    if (enemy.x < 0 || enemy.x + enemy.width > canvas.width) {
        enemy.speedX *= -1;
    }
    if (enemy.y < 0 || enemy.y + enemy.height > canvas.height) {
        enemy.speedY *= -1;
    }

    if (checkCollision(player,enemy)) {
        Over();
    }

    if(checkCircleCollision(player, coin)){
        PickCoin();
    }
    
}
function draw(){
    ctx.clearRect(0,0, canvas.width, canvas.height);

    // Draw Start Screen

    if (!isStarted) {
        ctx.fillStyle = '#161925';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#00f5d4';
        ctx.font = 'bold 44px sans-serif';
        ctx.fillText('PIXEL CHASER', canvas.width /2 , canvas.height / 2 -40);
        ctx.fillStyle = '#ffffff';
        ctx.font = '22px sans-serif';
        ctx.fillText ('Press SPACEBAR or Enter to Start', canvas.width / 2, canvas.height/ 2 + 20);
        ctx.fillStyle = '#ffee32';
        ctx.font = '16px sans-serif';
        ctx.fillText('Collect coins and Avoid the purple enemy', canvas.width / 2, canvas.height / 2 + 65);
        ctx.textAlign = 'left';
        return;
    }

    // Draw player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
   
    // Draw Coin
    ctx.beginPath();
    ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI *2);
    ctx.fillStyle = coin.color;
    ctx.fill();
    ctx.closePath();
    
    // Draw Enemy
    ctx.fillStyle = enemy.color;
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    
    //Draw scoreboard
    ctx.fillStyle = '#161925';
    ctx.fillRect(10,10,160,65);
    ctx.fillStyle = '#ffffff';
    ctx.font = '18px sans-serif';
    ctx.fillText(`Score: ${score}`, 20, 35);
    ctx.fillStyle = '#ffee32';
    ctx.fillText (`High Score: ${highScore}`, 20, 60);

    //Draw Pause
    if (isPaused){
        ctx.fillStyle= 'rgba(0,0,0,0.5)';
        ctx.fillRect(0,0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.font = '30px sans-serif';
        ctx.fillText('PAUSED' , canvas.width / 2 - 60, canvas.height / 2);
    }

    //  DRAW Game OVER
    if (isGameOver) {
        ctx.fillStyle = '#161925';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.textAlign = 'center';

        ctx.fillStyle= '#f72585';
        ctx.font = 'bold 42px sans-serif';
        ctx.fillText ('GAME OVER', canvas.width/2 , canvas.height/2 -50);

        ctx.fillStyle = '#ffffff';
        ctx.font = '22px sans-serif';
        ctx.fillText(`Final Score: ${score}`, canvas.width/2, canvas.height / 2 );

        ctx.fillStyle = '#ffee32';
        ctx.font = '20px sans-serif';
        ctx.fillText (`High Score: ${highScore}`, canvas.width / 2, canvas.height / 2 +35);

        ctx.fillStyle = '#aaaaaa';
        ctx.font = '18px sans-serif';
        ctx.fillText('Press SPACEBAR or ENTER to Restart', canvas.width/2, canvas.height / 2 +85 );
        ctx.textAlign = 'left';

    }
}
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}
gameLoop();
