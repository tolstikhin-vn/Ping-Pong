const canvasLow = document.getElementById('layer1');

const ctxLow = canvasLow.getContext('2d');

const canvasUp = document.getElementById('layer2');

const ctxUp = canvasUp.getContext('2d');

const hitSound = new Audio('sounds/hitSound.mp3');
const userGoalSound = new Audio('sounds/userGoalSound.mp3');
const aiGoalSound = new Audio('sounds/aiGoalSound.mp3');
const wallHitSound = new Audio('sounds/wallHitSound.mp3');

const coordX = 10;
const platformWidth = 15;
const platformHeight = 120;
const defaultScore = 0;
const ballRadius = 12;
const ballSpeed = 8;
const defVelosityX = 5;
const defVelosityY = 5;

const playerOne = {
    x: coordX,
    y: canvasLow.height / 2 - platformHeight / 2,
    width: platformWidth,
    height: platformHeight,
    score: defaultScore,
};

const playerTwo = {
    x: canvasLow.width - (platformWidth + 10),
    y: canvasLow.height / 2 - platformHeight / 2,
    width: platformWidth,
    height: platformHeight,
    score: defaultScore,
};

const ball = {
    x: canvasLow.width / 2,
    y: canvasLow.height / 2,
    radius: ballRadius,
    speed: ballSpeed,
    velocityX: defVelosityX,
    velocityY: defVelosityY,
    color: '#fff'
};

// Отрисовка игрового поля
function drawField() {
    ctxLow.strokeStyle = '#fff';

    // Горизонтальная линия, проходящая через середину поля
    ctxLow.lineWidth = 3;
    ctxLow.moveTo(0, canvasLow.height / 2);
    ctxLow.lineTo(canvasLow.width, canvasLow.height / 2);
    ctxLow.stroke();

    // Вертиклаьная линия "сетка"
    ctxLow.lineWidth = 2;
    ctxLow.moveTo(canvasLow.width / 2, 0);
    ctxLow.lineTo(canvasLow.width / 2, canvasLow.height);
    ctxLow.setLineDash([6, 7])
    ctxLow.stroke();
    ctxLow.setLineDash([]);

    // Надписи на поле "Игрок 1", "Игрок 2"
    ctxLow.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctxLow.font = '100px fantasy';
    ctxLow.fillText('ИГРОК', canvasLow.width / 8, canvasLow.height / 2.5);
    ctxLow.fillText('1', canvasLow.width / 4.4, canvasLow.height - canvasLow.height / 2.5 + 80);
    ctxLow.fillText('ИГРОК', canvasLow.width / 1.6, canvasLow.height / 2.5);
    ctxLow.fillText('2', canvasLow.width / 1.39, (canvasLow.height / 3) * 2.2);
}

// Отрисовка игрового счета
function drawScore(x, y, score) {
    ctxUp.fillStyle = '#fff';
    ctxUp.font = '70px fantasy';
    ctxUp.fillText(score, x, y);
}

// Отрисовка игровых платформ
function drawPlatform(x, y, width, height, color) {
    ctxUp.fillStyle = color;
    ctxUp.fillRect(x, y, width, height);
}

// Отрисовка мяча
function drawBall(x, y, radius, color) {
    ctxUp.beginPath();
    ctxUp.fillStyle = color;
    ctxUp.arc(x, y, radius, 0, Math.PI * 2); // π * 2 радиан = 360 градусов
    ctxUp.closePath();
    ctxUp.strokeStyle = color;
    ctxUp.fill();
}

// Изменение положения платформы при движении мыши
function getMousePos(event) {
    let rect = canvasLow.getBoundingClientRect();
    if (playerOne.y <= 0 && ((event.clientY - rect.top) <= playerOne.height / 2)) {
        playerOne.y = 0;
    } else if (playerOne.y >= canvasLow.height - playerOne.height && ((event.clientY - rect.top) >= canvasLow.height - playerOne.height / 2)) {
        playerOne.y = canvasLow.height - playerOne.height;
    } else playerOne.y = event.clientY - rect.top - playerOne.height / 2;
}

let upArrowPressedByPlayerOne = false;
let downArrowPressedByPlayerOne = false;
let upArrowPressedByPlayerTwo = false;
let downArrowPressedByPlayerTwo = false;

// Включение нажатия клавиш "вниз", "вверх"
function keyDownHandlerForTwo(event) {
    switch (event.keyCode) {
        case 38:
            upArrowPressedByPlayerTwo = true;
        case 40:
            downArrowPressedByPlayerTwo = true;
    }
}

// Отключение клавиш "вниз", "вверх"
function keyUpHandlerForTwo(event) {
    switch (event.keyCode) {
        case 38:
            upArrowPressedByPlayerTwo = false;
        case 40:
            downArrowPressedByPlayerTwo = false;
    }
}

// Включение клавиш "W", "S"
function keyDownHandlerForOne(event) {
    switch (event.keyCode) {
        case 87:
            upArrowPressedByPlayerOne = true;
        case 83:
            downArrowPressedByPlayerOne = true;
    }
}

// Отключение клавиш "W", "S"
function keyUpHandlerForOne(event) {
    switch (event.keyCode) {
        case 87:
            upArrowPressedByPlayerOne = false;
        case 83:
            downArrowPressedByPlayerOne = false;
    }
}

// Возврат игровых объектов в начальные положения
function reset(scored, resetScore) {
    ball.x = canvasLow.width / 2;
    ball.y = canvasLow.height / 2;
    playerOne.y = canvasLow.height / 2 - platformHeight / 2;
    playerTwo.y = canvasLow.height / 2 - platformHeight / 2;
    ball.speed = ballSpeed;
    if (resetScore) {
        playerOne.score = defaultScore;
        playerTwo.score = defaultScore;
    }
    if (scored) {
        ball.velocityX = -defVelosityX;
        ball.velocityY = -defVelosityY;
    } else {
        ball.velocityX = defVelosityX;
        ball.velocityY = defVelosityY;
    }
}

// Проверка столкновения мяча с игроками
function collisionDetect(player, ball) {
    player.top = player.y;
    player.right = player.x + player.width;
    player.bottom = player.y + player.height;
    player.left = player.x;

    ball.top = ball.y - ball.radius;
    ball.right = ball.x + ball.radius;
    ball.bottom = ball.y + ball.radius;
    ball.left = ball.x - ball.radius;

    return ball.left < player.right && ball.top < player.bottom && ball.right > player.left && ball.bottom > player.top;
}

let twoPlayersPlay, resetScore = false, playerOneScored = false;
// Обновление изменений игрового процесса
function update() {
    if (upArrowPressedByPlayerOne && playerOne.y > 0) {
        playerOne.y -= 8;
    } else if (downArrowPressedByPlayerOne && (playerOne.y < canvasLow.height - playerOne.height)) {
        playerOne.y += 8;
    }

    if (upArrowPressedByPlayerTwo && playerTwo.y > 0) {
        playerTwo.y -= 8;
    } else if (downArrowPressedByPlayerTwo && (playerTwo.y < canvasLow.height - playerTwo.height)) {
        playerTwo.y += 8;
    }

    if (ball.y + ball.radius >= canvasLow.height || ball.y - ball.radius <= 0) {
        wallHitSound.play();
        ball.velocityY = -ball.velocityY;
    }

    resetScore = false;

    if (ball.x + ball.radius >= canvasLow.width) {
        playerOneScored = true;
        userGoalSound.play();
        playerOne.score += 1;
        if (playerOne.score == scoreNumber) {
            resetScore = true;
            alert("Выиграл игрок 1!");
        }
        reset(playerOneScored, resetScore);
    }

    if (ball.x - ball.radius <= 0) {
        aiGoalSound.play();
        playerTwo.score += 1;
        if (playerTwo.score == scoreNumber) {
            resetScore = true;
            alert("Выиграл игрок 2!");
        }
        reset(playerOneScored, resetScore);
    }

    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    if (!twoPlayersPlay) {
        playerTwo.y += (ball.y - (playerTwo.y + playerTwo.height / 2)) * 0.13;
    }

    let player = (ball.x < canvasLow.width / 2) ? playerOne : playerTwo;

    if (collisionDetect(player, ball)) {
        hitSound.play();
        let collidePoint = (ball.y - (player.y + player.height / 2));
        collidePoint = collidePoint / (player.height / 2);

        let angleRad = (Math.PI / 4) * collidePoint;

        let direction = (ball.x + ball.radius < canvasLow.width / 2) ? 1 : -1;
        ball.velocityX = direction * ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sin(angleRad);

        ball.speed += 0.4;
    }
}

// Очистка движения и отрисовка всех игровых объектов
function render() {
    ctxUp.clearRect(0, 0, canvasLow.width, canvasLow.height);

    drawScore(canvasLow.width / 4 - 15, canvasLow.height / 6, playerOne.score);

    drawScore(3 * canvasLow.width / 4 - 15, canvasLow.height / 6, playerTwo.score);

    drawPlatform(playerOne.x, playerOne.y, playerOne.width, playerOne.height, playerOneColor);

    drawPlatform(playerTwo.x, playerTwo.y, playerTwo.width, playerTwo.height, playerTwoColor);

    drawBall(ball.x, ball.y, ball.radius, ball.color);
}

// Отрисовка поля
drawField();

// Обработка событий нажатия клавиш клавиатуры для первого игрока
addEventListener('keydown', keyDownHandlerForOne);
addEventListener('keyup', keyUpHandlerForOne);

// Обработка событий нажатия клавиш
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

let myAnim, gamePaused = false;

// Игровой цикл
function loop() {
    if (gamePaused) return;

    update();

    render();
    myAnim = requestAnimationFrame(loop);
}

const twPlrsBttn = document.querySelector('#two-players-button');

const aiBttn = document.querySelector('#ai-button');

const rstrtBttn = document.querySelector('#restart');
rstrtBttn.setAttribute('disabled', true);

const stpStrtBttn = document.querySelector('#stop-start');
stpStrtBttn.setAttribute('disabled', true);

let twPlrsBttnPressed, scoreNumber = 11;

// Получение от пользователя ограничения на количество голов
document.getElementById('num-input').oninput =
    function () {
        scoreNumber = this.value;
    }

let playerOneColor = '#fff', playerTwoColor = '#fff';
// Получение цвета платформы для игрока 1
document.getElementById("color-one").oninput =
    function () {
        console.log(this.value);
        playerOneColor = this.value;
    }

//Поулчение цвета платформы для игрока 2
document.getElementById("color-two").oninput =
    function () {
        console.log(this.value);
        playerTwoColor = this.value;
    }

// Обработка нажатия кнопки "Два игрока"
let pressTwPlrsBttn = twPlrsBttn.onclick = function () {
    twPlrsBttn.setAttribute('disabled', true);
    aiBttn.removeAttribute('disabled');
    rstrtBttn.removeAttribute('disabled');
    stpStrtBttn.removeAttribute('disabled');

    twPlrsBttnPressed = true;
    twoPlayersPlay = true;

    if (myAnim != null) {
        resetScore = true;
        cancelAnimationFrame(myAnim);
        reset(playerOneScored, resetScore);
    }
    movementForPlayers(twoPlayersPlay);
    loop();
}

// Обработка нажатия кнопки "Одиночная игра"
let pressAiBttn = aiBttn.onclick = function () {
    aiBttn.setAttribute('disabled', true);
    twPlrsBttn.removeAttribute('disabled');
    rstrtBttn.removeAttribute('disabled');
    stpStrtBttn.removeAttribute('disabled');

    twPlrsBttnPressed = false;
    twoPlayersPlay = false;

    if (myAnim != null) {
        resetScore = true;
        cancelAnimationFrame(myAnim);
        reset(playerOneScored, resetScore);
    }
    movementForPlayers(twoPlayersPlay);
    loop();
}

// Обработка нажатия кнопки "Рестарт"
rstrtBttn.onclick = function () {
    if (twPlrsBttnPressed) {
        pressTwPlrsBttn();
    } else {
        pressAiBttn();
    }
}

// Обработка нажатия кнопки "Стоп/Старт"
stpStrtBttn.onclick = function () {
    if (this.innerHTML == "Старт") {
        this.innerHTML = "Стоп";
    } else {
        this.innerHTML = "Старт";
    }
    pauseGame();
}

// Остановка игрового процесса паузой
function pauseGame() {
    gamePaused = !gamePaused;
    if (!gamePaused) {
        cancelAnimationFrame(myAnim);
        loop();
    }
}