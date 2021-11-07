const cnvsLow = document.getElementById('layer1');

const ctxLow = cnvsLow.getContext('2d');

const cnvsUp = document.getElementById('layer2');

const ctxUp = cnvsUp.getContext('2d');

const platformWidth = 15;
const platformHeight = 120;

const player = {
    x: 10,
    y: cnvsLow.height / 2 - platformHeight / 2,
    width: platformWidth,
    height: platformHeight,
    score: 0,
}

const ai = {
    x: cnvsLow.width - (platformWidth + 10),
    y: cnvsLow.height / 2 - platformHeight / 2,
    width: platformWidth,
    height: platformHeight,
    score: 0,
}

const ball = {
    x: cnvsLow.width / 2,
    y: cnvsLow.height / 2,
    radius: 12,
    speed: 7,
    velocityX: 5,
    velocityY: 5,
}

cnvsUp.addEventListener("mousemove", getMousePos);

function drawField() {
    ctxLow.strokeStyle = '#fff';

    // Горизонтальная линия, проходящая через середину поля
    ctxLow.lineWidth = 3;
    ctxLow.moveTo(0, cnvsLow.height / 2);
    ctxLow.lineTo(cnvsLow.width, cnvsLow.height / 2);
    ctxLow.stroke();

    // Вертиклаьная линия "сетка"
    ctxLow.lineWidth = 2;
    ctxLow.moveTo(cnvsLow.width / 2, 0);
    ctxLow.lineTo(cnvsLow.width / 2, cnvsLow.height);
    ctxLow.setLineDash([6, 6])
    ctxLow.stroke();
    ctxLow.setLineDash([]);

    // Надписи на поле "Игрок 1", "Игрок 2"
    ctxLow.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctxLow.font = '100px fantasy';
    ctxLow.fillText('ИГРОК', cnvsLow.width / 8, cnvsLow.height / 2.5);
    ctxLow.fillText('1', cnvsLow.width / 4.4, cnvsLow.height - cnvsLow.height / 2.5 + 80);
    ctxLow.fillText('ИГРОК', cnvsLow.width / 1.6, cnvsLow.height / 2.5);
    ctxLow.fillText('2', cnvsLow.width / 1.39, (cnvsLow.height / 3) * 2.2);
}

// Отрисовка платформ
function drawPlatform(x, y, width, height, color) {
    ctxUp.fillStyle = color;
    ctxUp.fillRect(x, y, width, height);
}

// Отрисовка игрового счета
function drawScore(x, y, score) {
    ctxUp.fillStyle = '#fff';
    ctxUp.font = '80px fantasy';
    ctxUp.fillText(score, x, y);
}

// Отрисовка мяча
function drawBall(x, y, radius, color) {
    ctxUp.fillStyle = color;
    ctxUp.beginPath();
    ctxUp.arc(x, y, radius, 0, Math.PI * 2); // π * 2 радиан = 360 градусов
    ctxUp.closePath();
    ctxUp.fill();
}

// Определение позиции курчора мыши
function getMousePos(evt) {
    let rect = cnvsLow.getBoundingClientRect();
    player.y = evt.clientY - rect.top - player.height / 2;
}

// Возврат игровых объектов в начальные положения
function reset() {
    ball.x = cnvsLow.width / 2;
    ball.y = cnvsLow.height / 2;
    player.y = cnvsLow.height / 2 - platformHeight / 2;
    ai.y = cnvsLow.height / 2 - platformHeight / 2;
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
    } else if (ball.x > cnvsLow.width) {
        player.score++;
        reset();
    }

    if (ball.y + ball.radius >= cnvsLow.height || ball.y - ball.radius <= 0) {
        ball.velocityY = -ball.velocityY;
    }

    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    ai.y += ((ball.y - (ai.y + ai.height / 2))) * 0.1;

    let curPlayer = (ball.x < cnvsLow.width / 2) ? player : ai;

    if (collisionDetect(curPlayer, ball)) {

        let collidePoint = (ball.y - (curPlayer.y + curPlayer.height / 2));

        collidePoint = collidePoint / (curPlayer.height / 2);

        let angleRad = (Math.PI / 4) * collidePoint;

        let direction = (ball.x + ball.radius < cnvsLow.width / 2) ? 1 : -1;
        ball.velocityX = direction * ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sin(angleRad);

        ball.speed += 0.3;
    }
}

// Очистка движения и отрисовка всех игровых объектов
function render() {
    ctxUp.clearRect(0, 0, cnvsLow.width, cnvsLow.height);

    drawScore(cnvsLow.width / 4 - 15, cnvsLow.height / 6, player.score);

    drawScore(3 * cnvsLow.width / 4 - 15, cnvsLow.height / 6, ai.score);

    drawPlatform(player.x, player.y, player.width, player.height);

    drawPlatform(ai.x, ai.y, ai.width, ai.height);

    drawBall(ball.x, ball.y, ball.radius);
}

function loop() {
    update();
    render();
    requestAnimationFrame(loop);
}

drawField();

loop();