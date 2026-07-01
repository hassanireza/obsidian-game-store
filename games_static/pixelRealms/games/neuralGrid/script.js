const CELL_SIZE = window.innerWidth < 768 ? 16 : 28;
const CELL_GAP = window.innerWidth < 768 ? 3 : 4;

let availableWidth = window.innerWidth - 140;
let availableHeight = window.innerHeight - 340;

let cols = Math.floor(availableWidth / (CELL_SIZE + CELL_GAP));
let rows = Math.floor(availableHeight / (CELL_SIZE + CELL_GAP));

cols = Math.max(cols, 12);
rows = Math.max(rows, 12);

let playing = false;
let timer;
let reproductionTime = 80;

let grid = new Array(rows);
let nextGrid = new Array(rows);

function initializeGrids() {
    for (let i = 0; i < rows; i++) {
        grid[i] = new Array(cols);
        nextGrid[i] = new Array(cols);
    }
}

function resetGrids() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            grid[i][j] = 0;
            nextGrid[i][j] = 0;
        }
    }
}

function copyAndResetGrid() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            grid[i][j] = nextGrid[i][j];
            nextGrid[i][j] = 0;
        }
    }
}

function initialize() {

    document.documentElement.style.setProperty(
        "--cell-size",
        CELL_SIZE + "px"
    );

    createTable();
    initializeGrids();
    resetGrids();
    setupControlButtons();

    setTimeout(randomButtonHandler, 300);
}

function createTable() {

    let gridContainer = document.getElementById("gridContainer");

    gridContainer.innerHTML = "";

    let table = document.createElement("table");

    for (let i = 0; i < rows; i++) {

        let tr = document.createElement("tr");

        for (let j = 0; j < cols; j++) {

            let cell = document.createElement("td");

            cell.setAttribute("id", i + "_" + j);

            cell.className = "dead";

            cell.addEventListener("click", cellClickHandler);

            cell.addEventListener("touchstart", cellClickHandler);

            tr.appendChild(cell);
        }

        table.appendChild(tr);
    }

    gridContainer.appendChild(table);
}

function cellClickHandler(e) {

    e.preventDefault();

    let rowcol = this.id.split("_");

    let row = Number(rowcol[0]);

    let col = Number(rowcol[1]);

    if (this.className === "live") {

        this.className = "dead";

        grid[row][col] = 0;

    } else {

        this.className = "live";

        grid[row][col] = 1;
    }
}

function updateView() {

    for (let i = 0; i < rows; i++) {

        for (let j = 0; j < cols; j++) {

            let cell = document.getElementById(i + "_" + j);

            if (grid[i][j] === 0) {

                cell.className = "dead";

            } else {

                cell.className = "live";
            }
        }
    }
}

function setupControlButtons() {

    document.getElementById("start").onclick = startButtonHandler;

    document.getElementById("clear").onclick = clearButtonHandler;

    document.getElementById("random").onclick = randomButtonHandler;
}

function randomButtonHandler() {

    playing = false;

    clearTimeout(timer);

    document.getElementById("start").innerHTML = "<span>Launch</span>";

    const cells = document.querySelectorAll("td");

    cells.forEach(cell => {

        const [row, col] = cell.id.split("_").map(Number);

        const state = Math.random() > 0.55 ? "live" : "dead";

        cell.className = state;

        const value = state === "live" ? 1 : 0;

        grid[row][col] = value;

        nextGrid[row][col] = value;
    });
}

function clearButtonHandler() {

    playing = false;

    clearTimeout(timer);

    document.getElementById("start").innerHTML = "<span>Launch</span>";

    let cells = document.querySelectorAll("td");

    cells.forEach(cell => {

        cell.className = "dead";
    });

    resetGrids();
}

function startButtonHandler() {

    if (playing) {

        playing = false;

        this.innerHTML = "<span>Resume</span>";

        clearTimeout(timer);

    } else {

        playing = true;

        this.innerHTML = "<span>Pause</span>";

        play();
    }
}

function play() {

    computeNextGen();

    if (playing) {

        timer = setTimeout(play, reproductionTime);
    }
}

function computeNextGen() {

    for (let i = 0; i < rows; i++) {

        for (let j = 0; j < cols; j++) {

            applyRules(i, j);
        }
    }

    copyAndResetGrid();

    updateView();
}

function applyRules(row, col) {

    let numNeighbors = countNeighbors(row, col);

    if (grid[row][col] === 1) {

        if (numNeighbors < 2) {

            nextGrid[row][col] = 0;

        } else if (numNeighbors === 2 || numNeighbors === 3) {

            nextGrid[row][col] = 1;

        } else if (numNeighbors > 3) {

            nextGrid[row][col] = 0;
        }

    } else {

        if (numNeighbors === 3) {

            nextGrid[row][col] = 1;
        }
    }
}

function countNeighbors(row, col) {

    let count = 0;

    for (let i = -1; i <= 1; i++) {

        for (let j = -1; j <= 1; j++) {

            if (i === 0 && j === 0) continue;

            let newRow = row + i;

            let newCol = col + j;

            if (
                newRow >= 0 &&
                newRow < rows &&
                newCol >= 0 &&
                newCol < cols
            ) {

                count += grid[newRow][newCol];
            }
        }
    }

    return count;
}

let resizeTimeout;

window.addEventListener("resize", () => {

    clearTimeout(resizeTimeout);

    resizeTimeout = setTimeout(() => {

        location.reload();

    }, 250);
});

window.onload = initialize;