const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");
const restartButton = document.getElementById("restartButton");

const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;

let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
let score = 0;
let gameOver = false;

const COLORS = [
    null,
    "#5DF2FF",
    "#FF5AC3",
    "#A855F7",
    "#FFD166",
    "#00F5A0",
    "#FF7B54",
    "#7CFFCB"
];

const TETROMINOS = [
    [[1, 1, 1, 1]],
    [
        [2, 0, 0],
        [2, 2, 2]
    ],
    [
        [0, 0, 3],
        [3, 3, 3]
    ],
    [
        [4, 4],
        [4, 4]
    ],
    [
        [0, 5, 5],
        [5, 5, 0]
    ],
    [
        [0, 6, 0],
        [6, 6, 6]
    ],
    [
        [7, 7, 0],
        [0, 7, 7]
    ]
];

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

document.addEventListener("keydown", () => {
    if (audioCtx.state === "suspended") {
        audioCtx.resume();
    }
}, { once: true });

function beep(freq, duration) {
    const oscillator = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    oscillator.type = "square";
    oscillator.frequency.value = freq;

    oscillator.connect(gain);
    gain.connect(audioCtx.destination);

    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
}

function createTetromino() {
    const type = Math.floor(Math.random() * TETROMINOS.length);

    return {
        shape: TETROMINOS[type],
        x: Math.floor(COLS / 2) - 1,
        y: 0
    };
}

let current = createTetromino();
let nextDrop = Date.now();

function drawBlock(x, y, color) {
    const px = x * BLOCK_SIZE;
    const py = y * BLOCK_SIZE;

    ctx.fillStyle = color;
    ctx.fillRect(px, py, BLOCK_SIZE, BLOCK_SIZE);

    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.fillRect(px, py, BLOCK_SIZE, 3);
    ctx.fillRect(px, py, 3, BLOCK_SIZE);

    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(px, py + BLOCK_SIZE - 3, BLOCK_SIZE, 3);
    ctx.fillRect(px + BLOCK_SIZE - 3, py, 3, BLOCK_SIZE);

    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.strokeRect(px, py, BLOCK_SIZE, BLOCK_SIZE);

    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.fillRect(px + 8, py + 8, BLOCK_SIZE - 16, BLOCK_SIZE - 16);
    ctx.shadowBlur = 0;
}

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (board[r][c]) {
                drawBlock(c, r, COLORS[board[r][c]]);
            }
        }
    }

    for (let r = 0; r < current.shape.length; r++) {
        for (let c = 0; c < current.shape[r].length; c++) {
            if (current.shape[r][c]) {
                drawBlock(
                    current.x + c,
                    current.y + r,
                    COLORS[current.shape[r][c]]
                );
            }
        }
    }
}

function collision(xOffset, yOffset, shape) {
    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
            if (shape[r][c]) {
                const newX = current.x + c + xOffset;
                const newY = current.y + r + yOffset;

                if (
                    newX < 0 ||
                    newX >= COLS ||
                    newY >= ROWS ||
                    (newY >= 0 && board[newY][newX])
                ) {
                    return true;
                }
            }
        }
    }

    return false;
}

function merge() {
    for (let r = 0; r < current.shape.length; r++) {
        for (let c = 0; c < current.shape[r].length; c++) {
            if (current.shape[r][c]) {
                board[current.y + r][current.x + c] = current.shape[r][c];
            }
        }
    }
}

function clearLines() {
    let lines = 0;

    for (let r = ROWS - 1; r >= 0; r--) {
        if (board[r].every(cell => cell !== 0)) {
            board.splice(r, 1);
            board.unshift(Array(COLS).fill(0));
            lines++;
            r++;
        }
    }

    if (lines > 0) {
        score += lines * 100;
        scoreElement.textContent = score;
        beep(220, 0.15);
    }
}

function rotate(shape) {
    const rows = shape.length;
    const cols = shape[0].length;

    const rotated = Array.from({ length: cols }, () => Array(rows).fill(0));

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            rotated[c][rows - 1 - r] = shape[r][c];
        }
    }

    return rotated;
}

document.addEventListener("keydown", event => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key)) {
        event.preventDefault();
    }

    if (gameOver) return;

    if (event.key === "ArrowLeft" && !collision(-1, 0, current.shape)) {
        current.x--;
    }

    if (event.key === "ArrowRight" && !collision(1, 0, current.shape)) {
        current.x++;
    }

    if (event.key === "ArrowDown" && !collision(0, 1, current.shape)) {
        current.y++;
    }

    if (event.key === "ArrowUp") {
        const rotated = rotate(current.shape);

        if (!collision(0, 0, rotated)) {
            current.shape = rotated;
            beep(600, 0.05);
        }
    }
});

function drawGameOver() {
    ctx.fillStyle = "rgba(4,8,18,0.88)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.font = "22px 'Press Start 2P'";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);

    ctx.font = "12px 'Press Start 2P'";
    ctx.fillStyle = "#5DF2FF";
    ctx.fillText("PRESS RESTART", canvas.width / 2, canvas.height / 2 + 40);

    restartButton.style.display = "block";
}

restartButton.addEventListener("click", () => {
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    score = 0;
    scoreElement.textContent = score;
    current = createTetromino();
    gameOver = false;
    restartButton.style.display = "none";
    beep(700, 0.08);
});

function update() {
    if (gameOver) {
        drawGameOver();
        requestAnimationFrame(update);
        return;
    }

    const now = Date.now();

    if (now - nextDrop > 500) {
        if (!collision(0, 1, current.shape)) {
            current.y++;
        } else {
            merge();
            beep(320, 0.04);
            clearLines();
            current = createTetromino();

            if (collision(0, 0, current.shape)) {
                gameOver = true;
                beep(120, 0.4);
            }
        }

        nextDrop = now;
    }

    drawBoard();
    requestAnimationFrame(update);
}

update();