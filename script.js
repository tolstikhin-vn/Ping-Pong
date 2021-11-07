const cnvs = document.getElementById("layer");

const ctx = cnvs.getContext('2d');

const platformWidth = 15;
const platformHeight = 120;

const player = {
    x: 10,
    y: cnvs.height / 2 - platformHeight / 2,
    width: platformWidth,
    height: platformHeight,
    score: 0,
}

const ai = {
    x: cnvs.width - (platformWidth + 10),
    y: cnvs.height / 2 - platformHeight / 2,
    width: platformWidth,
    height: platformHeight,
    score: 0,
}

const ball = {
    x: cnvs.width / 2,
    y: cnvs.height / 2,
    radius: 12,
    speed: 7,
    velocityX: 5,
    velocityY: 5,
}

cnvs.addEventListener("mousemove", getMousePos);

// Отрисовка платформ
function drawPlatform(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

// Отрисовка игрового счета
function drawScore(x, y, score) {
    ctx.fillStyle = '#fff';
    ctx.font = '80px fantasy';
    ctx.fillText(score, x, y);
}

// Отрисовка мяча
function drawBall(x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2); // π * 2 радиан = 360 градусов
    ctx.closePath();
    ctx.fill();
}

// Определение позиции курчора мыши
function getMousePos(evt) {
    let rect = cnvs.getBoundingClientRect();
    player.y = evt.clientY - rect.top - player.height / 2;
}

// Возврат игровых объектов в начальные положения
function reset() {
    ball.x = cnvs.width / 2;
    ball.y = cnvs.height / 2;
    player.y = cnvs.height / 2 - platformHeight / 2;
    ai.y = cnvs.height / 2 - platformHeight / 2;
    ball.velocityX = -ball.velocityX;
    ball.speed = 7;
}

// Проверка столкновения мяча с игроками
function collisionDetect(curPlayer, ball) {
    curPlayer.top = curPlayer.y;
    curPlayer.right = curPlayer.x + curPlayer.width;
    curPlayer.bottom = curPlayer.y + curPlayer.height;
    curPlayer.left = curPlayer.x;

    ball.top = ball.y - ball.radius;
    ball.right = ball.x + ball.radius;
    ball.bottom = ball.y + ball.radius;
    ball.left = ball.x - ball.radius;

    return ball.left < curPlayer.right && ball.top < curPlayer.bottom && ball.right > curPlayer.left && ball.bottom > curPlayer.top;
}

// Изменение игрового процесса
function update() {
    if (ball.x - ball.radius < 0) {
        ai.score++;
        reset();
    } else if (ball.x > cnvs.width) {
        player.score++;
        reset();
    }

    if (ball.y + ball.radius >= cnvs.height || ball.y - ball.radius <= 0) {
        ball.velocityY = -ball.velocityY;
    }

    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    ai.y += ((ball.y - (ai.y + ai.height / 2))) * 0.1;

    let curPlayer = (ball.x < cnvs.width / 2) ? player : ai;

    if (collisionDetect(curPlayer, ball)) {

        let collidePoint = (ball.y - (curPlayer.y + curPlayer.height / 2));

        collidePoint = collidePoint / (curPlayer.height / 2);

        let angleRad = (Math.PI / 4) * collidePoint;

        let direction = (ball.x + ball.radius < cnvs.width / 2) ? 1 : -1;
        ball.velocityX = direction * ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sin(angleRad);

        ball.speed += 0.3;
    }
}

// Очистка движения и отрисовка всех игровых объектов
function render() {
    ctx.clearRect(0, 0, cnvs.width, cnvs.height);

    drawScore(cnvs.width / 4 - 15, cnvs.height / 6, player.score);

    drawScore(3 * cnvs.width / 4 - 15, cnvs.height / 6, ai.score);

    drawPlatform(player.x, player.y, player.width, player.height);

    drawPlatform(ai.x, ai.y, ai.width, ai.height);

    drawBall(ball.x, ball.y, ball.radius);
}

function loop() {
    update();
    render();
    requestAnimationFrame(loop);
}

loop();