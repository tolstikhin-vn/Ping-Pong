const cnvsLow = document.getElementById('layer1');

const ctxLow = cnvsLow.getContext('2d');

const cnvsUp = document.getElementById('layer2');

const ctxUp = cnvsUp.getContext('2d');

const platformWidth = 15;
const platformHeight = 120;

const hitSound = new Audio('sounds/hitSound.mp3');
const userGoalSound = new Audio('sounds/userGoalSound.mp3');
const aiGoalSound = new Audio('sounds/aiGoalSound.mp3');
const wallHitSound = new Audio('sounds/wallHitSound.mp3');

const playerOne = {
    x: 10,
    y: cnvsLow.height / 2 - platformHeight / 2,
    width: platformWidth,
    height: platformHeight,
    score: 0,
}

const playerTwo = {
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

function getMousePos(evt) {
    let rect = cnvsLow.getBoundingClientRect();
    if (playerOne.y <= 0 && ((evt.clientY - rect.top) <= playerOne.height / 2)) {
        playerOne.y = 0;
    } else if (playerOne.y >= cnvsLow.height - playerOne.height && ((evt.clientY - rect.top) >= cnvsLow.height - playerOne.height / 2)) {
        playerOne.y = cnvsLow.height - playerOne.height;
    } else {
        playerOne.y = evt.clientY - rect.top - playerOne.height / 2;
    }
}

let upArrowPressedByPlayerOne = false;
let downArrowPressedByPlayerOne = false;
let upArrowPressedByPlayerTwo = false;
let downArrowPressedByPlayerTwo = false;

function keyDownHandlerForTwo(event) {
    switch (event.keyCode) {
        case 38:
            upArrowPressedByPlayerTwo = true;
            break;
        case 40:
            downArrowPressedByPlayerTwo = true;
            break;

    }
}

// Отключение клавиш "вниз", "вверх"
function keyUpHandlerForTwo(event) {
    switch (event.keyCode) {
        case 38:
            upArrowPressedByPlayerTwo = false;
            break;
        case 40:
            downArrowPressedByPlayerTwo = false;
            break;
    }
}

// Включение клавиш "W", "S"
function keyDownHandlerForOne(event) {
    switch (event.keyCode) {
        case 87:
            upArrowPressedByPlayerOne = true;
            break;
        case 83:
            downArrowPressedByPlayerOne = true;
            break;
    }
}

// Отключение клавиш "W", "S"
function keyUpHandlerForOne(event) {
    switch (event.keyCode) {
        case 87:
            upArrowPressedByPlayerOne = false;
            break;
        case 83:
            downArrowPressedByPlayerOne = false;
            break;
    }
}

function drawField() {
    ctxLow.strokeStyle = '#fff';

    // Горизонтальная линия, проходящая через середину поля
    ctxLow.lineWidth = 3;
    ctxLow.moveTo(0, cnvsLow.height / 2);
    ctxLow.lineTo(cnvsLow.width, cnvsLow.height / 2);
    ctxLow.stroke();

    // Вертикальная линия "сетка"
    ctxLow.lineWidth = 2;
    ctxLow.moveTo(cnvsLow.width / 2, 0);
    ctxLow.lineTo(cnvsLow.width / 2, cnvsLow.height);
    ctxLow.setLineDash([10, 8])
    ctxLow.stroke();
    ctxLow.setLineDash([]);

    // Надписи на поле "Игрок 1", "Игрок 2"
    ctxLow.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctxLow.font = '100px fantasy';
    ctxLow.fillText('ИГРОК', cnvsLow.width / 8, cnvsLow.height / 2.5);
    ctxLow.fillText('1', cnvsLow.width / 4.4, cnvsLow.height - cnvsLow.height / 2.5 + 80);
    ctxLow.fillText('ИГРОК', cnvsLow.width / 1.6, cnvsLow.height / 2.5);
    ctxLow.fillText('2', cnvsLow.width / 1.38, (cnvsLow.height / 3) * 2.2);
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

// Определение позиции курсора мыши
function getMousePos(evt) {
    let rect = cnvsLow.getBoundingClientRect();
    if (playerOne.y <= 0 && ((evt.clientY - rect.top) <= playerOne.height / 2)) {
        playerOne.y = 0;
    } else if (playerOne.y >= cnvsLow.height - playerOne.height && ((evt.clientY - rect.top) >= cnvsLow.height - playerOne.height / 2)) {
        playerOne.y = cnvsLow.height - playerOne.height;
    } else playerOne.y = evt.clientY - rect.top - playerOne.height / 2;
}

// Возврат игровых объектов в начальные положения
function reset(scored) {
    ball.x = cnvsLow.width / 2;
    ball.y = cnvsLow.height / 2;
    playerOne.y = cnvsLow.height / 2 - platformHeight / 2;
    playerTwo.y = cnvsLow.height / 2 - platformHeight / 2;
    if (scored) {
        ball.velocityX = -5;
        ball.velocityY = -5;
    } else {
        ball.velocityX = 5;
        ball.velocityY = 5;
    }
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

// Обновление изменений игрового процесса
function update() {
    if (upArrowPressedByPlayerOne && playerOne.y > 0) {
        playerOne.y -= 8;
    } else if (downArrowPressedByPlayerOne && (playerOne.y < cnvsLow.height - playerOne.height)) {
        playerOne.y += 8;
    }

    if (upArrowPressedByPlayerTwo && playerTwo.y > 0) {
        playerTwo.y -= 8;
    } else if (downArrowPressedByPlayerTwo && (playerTwo.y < cnvsLow.height - playerTwo.height)) {
        playerTwo.y += 8;
    }

    let playerScore = false;
    if (ball.x - ball.radius < 0) {
        aiGoalSound.play();
        playerTwo.score++;
        reset(playerScore);
    } else if (ball.x > cnvsLow.width) {
        userGoalSound.play();
        playerOne.score++;
        playerScore = true;
        reset(playerScore);
    }

    if (ball.y + ball.radius >= cnvsLow.height || ball.y - ball.radius <= 0) {
        wallHitSound.play();
        ball.velocityY = -ball.velocityY;
    }

    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    if (!twoPlayersPlay) {
        playerTwo.y += (ball.y - (playerTwo.y + playerTwo.height / 2)) * 0.1;
    }

    let curPlayer = (ball.x < cnvsLow.width / 2) ? playerOne : playerTwo;

    if (collisionDetect(curPlayer, ball)) {
        hitSound.play();
        let collidePoint = (ball.y - (curPlayer.y + curPlayer.height / 2));

        collidePoint = collidePoint / (curPlayer.height / 2);

        let angleRad = (Math.PI / 4) * collidePoint;

        let direction = (ball.x + ball.radius < cnvsLow.width / 2) ? 1 : -1;
        ball.velocityX = direction * ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sin(angleRad);

        ball.speed += 5;
    }
}

// Очистка движения и отрисовка всех игровых объектов
function render() {
    ctxUp.clearRect(0, 0, cnvsLow.width, cnvsLow.height);

    drawScore(cnvsLow.width / 4 - 15, cnvsLow.height / 6, playerOne.score);

    drawScore(3 * cnvsLow.width / 4 - 15, cnvsLow.height / 6, playerTwo.score);

    drawPlatform(playerOne.x, playerOne.y, playerOne.width, playerOne.height);

    drawPlatform(playerTwo.x, playerTwo.y, playerTwo.width, playerTwo.height);

    drawBall(ball.x, ball.y, ball.radius);
}

let myAnim;

// Игровой цикл
function loop() {
    update();
    render();
    myAnim = requestAnimationFrame(loop);
}
// Обработчики событий нажатия клавиш
function movementForPlayers(twoPlayersPlay) {
    if (twoPlayersPlay) {
        addEventListener('keydown', keyDownHandlerForTwo);
        addEventListener('keyup', keyUpHandlerForTwo);

        removeEventListener('mousemove', getMousePos);
    } else {
        addEventListener('mousemove', getMousePos);

        removeEventListener('keydown', keyDownHandlerForTwo);
        removeEventListener('keyup', keyUpHandlerForTwo);
    }
}

let twoPlayersPlay;

const twPlrsBttn = document.querySelector('#two-players-button');
const aiBttn = document.querySelector('#ai-button');

addEventListener('keydown', keyDownHandlerForOne);
addEventListener('keyup', keyUpHandlerForOne);

twPlrsBttn.onclick = function () {
    twPlrsBttn.setAttribute('disabled', true);
    aiBttn.removeAttribute('disabled');
    twoPlayersPlay = true;
    playerOne.score = 0;
    playerTwo.score = 0;
    cancelAnimationFrame(myAnim);
    reset();
    movementForPlayers(twoPlayersPlay);
    loop();
}

// Обработка нажатия кнопки "Одиночная игра"
aiBttn.onclick = function () {
    aiBttn.setAttribute('disabled', true);
    twPlrsBttn.removeAttribute('disabled');
    twoPlayersPlay = false;
    playerOne.score = 0;
    playerTwo.score = 0;
    cancelAnimationFrame(myAnim);
    reset();
    movementForPlayers(twoPlayersPlay);
    loop();
}

drawField();