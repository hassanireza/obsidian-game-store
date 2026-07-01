const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const levelEl = document.getElementById("level");
const livesEl = document.getElementById("lives");
const statusEl = document.getElementById("status");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayText = document.getElementById("overlayText");
const primaryAction = document.getElementById("primaryAction");
const pauseBtn = document.getElementById("pauseBtn");
const restartBtn = document.getElementById("restartBtn");
const levelList = document.getElementById("levelList");
const gold = "#d4af37";
const ink = "#f7f3e8";
const muted = "rgba(247,243,232,.24)";
const black = "#050505";
const names = ["First Signal", "Narrow Cut", "Soft Static", "Long Turn", "White Heat", "Orbit Room", "Quiet Rush", "Gold Pressure", "Final Trace", "Encore Line"];
const rawLevels = [
  ["111111111111111","100000100000001","101110101011101","100010000010001","111010111010111","100000101000001","101110101011101","100000000000001","101011101110101","100010101010001","111010101010111","100000000000001","101110101011101","100000100000001","111111111111111"],
  ["111111111111111","100000000000001","101111011111101","100001010000001","111101010111101","100001000100001","101111111101101","100000000000001","101101111111101","100001000100001","101110101011111","100000101000001","101111011111101","100000000000001","111111111111111"],
  ["111111111111111","100000100000001","101110101110101","101000000010101","101011111010101","100010001010001","111010101011111","100000000000001","111110101010111","100010001010001","101010111110101","101010000010101","101011101110101","100000100000001","111111111111111"],
  ["111111111111111","100000000000001","101111111111101","100000010000001","111111010111111","100001010100001","101101010101101","100100000001001","101101010101101","100001010100001","111101010111111","100000010000001","101111111111101","100000000000001","111111111111111"],
  ["111111111111111","100000100000001","101110101011101","101010001010101","101010111010101","100000000000001","111011101110111","100010000010001","111011101110111","100000000000001","101010111010101","101010001010101","101110101011101","100000100000001","111111111111111"],
  ["111111111111111","100000000000001","101011111110101","101010000010101","101010111010101","100010101010001","111110101011111","100000000000001","111110101011111","100010101010001","101010111010101","101010000010101","101011111110101","100000000000001","111111111111111"],
  ["111111111111111","100000100000001","111110101011111","100010101010001","101010101010101","101000000000101","101111011111101","100000000000001","101111011111101","101000000000101","101010101010101","100010101010001","111110101011111","100000100000001","111111111111111"],
  ["111111111111111","100000000000001","101111101111101","100000100000001","111110101011111","100010101010001","101010000010101","101011111110101","101010000010101","100010101010001","111110101011111","100000100000001","101111101111101","100000000000001","111111111111111"],
  ["111111111111111","100000100000001","101110101110101","100010101010001","111010101010111","100000101000001","101111101111101","100000000000001","101111101111101","100000101000001","111010101010111","100010101010001","101110101110101","100000100000001","111111111111111"],
  ["111111111111111","100000000000001","101111011111101","101000010000101","101011111110101","100000101000001","111110101011111","100000000000001","111110101011111","100000101000001","101011111110101","101000010000101","101111011111101","100000000000001","111111111111111"]
];
const dirs = { left: { x: -1, y: 0 }, right: { x: 1, y: 0 }, up: { x: 0, y: -1 }, down: { x: 0, y: 1 } };
let state;
let lastTime = 0;
let pulse = 0;
let touchStart = null;

function makeLevel(index) {
  const grid = rawLevels[index].map(row => row.split("").map(Number));
  const pellets = new Set();
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (!grid[y][x] && !(x === 1 && y === 1) && !(x === 13 && y === 13) && !(x === 7 && y === 7)) pellets.add(`${x},${y}`);
    }
  }
  return { grid, pellets };
}

function resetGame() {
  const level = makeLevel(0);
  state = {
    mode: "ready",
    score: 0,
    levelIndex: 0,
    lives: 3,
    grid: level.grid,
    pellets: level.pellets,
    pac: { x: 1, y: 1, px: 1, py: 1, dir: dirs.right, next: dirs.right, progress: 0 },
    ghosts: [],
    message: "",
    completed: new Set(),
    frightened: 0
  };
  spawnGhosts();
  updateHud();
  drawLevels();
  showOverlay("Enter the gold line", "A stripped back arcade chase in ten precise acts. Clear every spark, master every turn, and make the maze sing.", "Start run");
}

function spawnGhosts() {
  const speed = 0.95 + state.levelIndex * 0.055;
  state.ghosts = [
    { x: 13, y: 13, px: 13, py: 13, dir: dirs.left, progress: 0, speed, phase: 0 },
    { x: 13, y: 1, px: 13, py: 1, dir: dirs.down, progress: 0, speed: speed * 0.94, phase: 2 },
    { x: 1, y: 13, px: 1, py: 13, dir: dirs.up, progress: 0, speed: speed * 0.9, phase: 4 }
  ];
  if (state.levelIndex > 4) state.ghosts.push({ x: 7, y: 13, px: 7, py: 13, dir: dirs.up, progress: 0, speed: speed * 0.86, phase: 6 });
}

function updateHud() {
  scoreEl.textContent = state.score;
  levelEl.textContent = state.levelIndex + 1;
  livesEl.textContent = state.lives;
  statusEl.textContent = state.mode === "playing" ? names[state.levelIndex] : state.mode[0].toUpperCase() + state.mode.slice(1);
  drawLevels();
}

function drawLevels() {
  levelList.innerHTML = names.map((name, i) => `<div class="level-card ${i === state.levelIndex ? "active" : ""} ${state.completed.has(i) ? "done" : ""}"><b>${i + 1}</b><span>${name}<small>${i === state.levelIndex ? "Current act" : state.completed.has(i) ? "Cleared" : "Locked in sequence"}</small></span><small>${Math.round((i + 1) * 1.2)}x</small></div>`).join("");
}

function showOverlay(title, text, button) {
  overlayTitle.textContent = title;
  overlayText.textContent = text;
  primaryAction.textContent = button;
  overlay.classList.remove("hidden");
}

function hideOverlay() {
  overlay.classList.add("hidden");
}

function start() {
  if (state.mode === "won" || state.mode === "over") resetGame();
  state.mode = "playing";
  hideOverlay();
  updateHud();
}

function pause() {
  if (state.mode === "playing") {
    state.mode = "paused";
    showOverlay("Hold the line", "The maze is waiting at the exact beat you left it.", "Resume");
  } else if (state.mode === "paused" || state.mode === "ready") {
    start();
  }
  updateHud();
}

function isWall(x, y) {
  return y < 0 || y >= state.grid.length || x < 0 || x >= state.grid[0].length || state.grid[y][x] === 1;
}

function canMove(entity, dir) {
  return !isWall(entity.x + dir.x, entity.y + dir.y);
}

function advancePac(dt) {
  const pac = state.pac;
  const speed = 5.8 + state.levelIndex * 0.13;
  if (pac.progress < 0.16 && canMove(pac, pac.next)) pac.dir = pac.next;
  if (!canMove(pac, pac.dir)) return;
  pac.progress += dt * speed;
  while (pac.progress >= 1) {
    pac.px = pac.x;
    pac.py = pac.y;
    pac.x += pac.dir.x;
    pac.y += pac.dir.y;
    pac.progress -= 1;
    const key = `${pac.x},${pac.y}`;
    if (state.pellets.delete(key)) {
      state.score += 10 + state.levelIndex * 2;
      if ((pac.x === 1 || pac.x === 13) && (pac.y === 1 || pac.y === 13)) state.frightened = 5;
    }
    if (canMove(pac, pac.next)) pac.dir = pac.next;
    if (!canMove(pac, pac.dir)) {
      pac.progress = 0;
      break;
    }
  }
}

function options(entity) {
  return Object.values(dirs).filter(dir => canMove(entity, dir) && !(dir.x === -entity.dir.x && dir.y === -entity.dir.y));
}

function chooseGhostDir(ghost) {
  const available = options(ghost);
  if (!available.length) return { x: -ghost.dir.x, y: -ghost.dir.y };
  const target = state.frightened > 0 ? { x: 14 - state.pac.x, y: 14 - state.pac.y } : state.pac;
  available.sort((a, b) => {
    const da = Math.hypot(ghost.x + a.x - target.x, ghost.y + a.y - target.y) + Math.sin(pulse + ghost.phase) * 0.35;
    const db = Math.hypot(ghost.x + b.x - target.x, ghost.y + b.y - target.y) + Math.cos(pulse + ghost.phase) * 0.35;
    return da - db;
  });
  return available[0];
}

function advanceGhosts(dt) {
  for (const ghost of state.ghosts) {
    ghost.progress += dt * ghost.speed;
    while (ghost.progress >= 1) {
      ghost.px = ghost.x;
      ghost.py = ghost.y;
      ghost.x += ghost.dir.x;
      ghost.y += ghost.dir.y;
      ghost.progress -= 1;
      ghost.dir = chooseGhostDir(ghost);
    }
  }
}

function collisions() {
  for (const ghost of state.ghosts) {
    if (Math.hypot(ghost.x - state.pac.x, ghost.y - state.pac.y) < 0.72) {
      if (state.frightened > 0) {
        ghost.x = 13;
        ghost.y = 13;
        ghost.px = 13;
        ghost.py = 13;
        ghost.progress = 0;
        state.score += 120;
      } else {
        loseLife();
      }
    }
  }
}

function loseLife() {
  state.lives -= 1;
  if (state.lives <= 0) {
    state.mode = "over";
    showOverlay("The line went dark", `Your score was ${state.score}. The maze is built for another attempt.`, "Run it back");
  } else {
    state.mode = "paused";
    state.pac = { x: 1, y: 1, px: 1, py: 1, dir: dirs.right, next: dirs.right, progress: 0 };
    spawnGhosts();
    showOverlay("Clean reset", `${state.lives} lives remain. Take the corner later and own the rhythm.`, "Continue");
  }
  updateHud();
}

function nextLevel() {
  state.completed.add(state.levelIndex);
  if (state.levelIndex === 9) {
    state.mode = "won";
    showOverlay("Ten lines cleared", `Final score ${state.score}. A perfect loop deserves another run.`, "Play again");
    updateHud();
    return;
  }
  state.levelIndex += 1;
  const level = makeLevel(state.levelIndex);
  state.grid = level.grid;
  state.pellets = level.pellets;
  state.pac = { x: 1, y: 1, px: 1, py: 1, dir: dirs.right, next: dirs.right, progress: 0 };
  spawnGhosts();
  state.mode = "paused";
  showOverlay(names[state.levelIndex], "New geometry. Sharper pursuit. Same clean hunger.", "Start level");
  updateHud();
}

function update(dt) {
  if (state.mode !== "playing") return;
  pulse += dt;
  state.frightened = Math.max(0, state.frightened - dt);
  advancePac(dt);
  advanceGhosts(dt);
  collisions();
  if (state.pellets.size === 0) nextLevel();
  updateHud();
}

function cellPoint(entity) {
  return {
    x: entity.x + entity.dir.x * entity.progress,
    y: entity.y + entity.dir.y * entity.progress
  };
}

function draw() {
  const size = canvas.width;
  const rows = state.grid.length;
  const cell = size / rows;
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = black;
  ctx.fillRect(0, 0, size, size);
  ctx.save();
  ctx.translate(cell / 2, cell / 2);
  ctx.strokeStyle = "rgba(247,243,232,.16)";
  ctx.lineWidth = 1;
  for (let i = 0; i < rows; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * cell);
    ctx.lineTo((rows - 1) * cell, i * cell);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(i * cell, 0);
    ctx.lineTo(i * cell, (rows - 1) * cell);
    ctx.stroke();
  }
  ctx.lineWidth = 3;
  ctx.strokeStyle = ink;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < rows; x++) {
      if (!state.grid[y][x]) continue;
      const px = x * cell;
      const py = y * cell;
      ctx.strokeRect(px - cell * 0.46, py - cell * 0.46, cell * 0.92, cell * 0.92);
    }
  }
  for (const key of state.pellets) {
    const [x, y] = key.split(",").map(Number);
    const special = (x === 1 || x === 13) && (y === 1 || y === 13);
    ctx.beginPath();
    ctx.fillStyle = special ? gold : "rgba(247,243,232,.78)";
    ctx.arc(x * cell, y * cell, special ? cell * 0.12 + Math.sin(pulse * 5) * 1.2 : cell * 0.055, 0, Math.PI * 2);
    ctx.fill();
  }
  const p = cellPoint(state.pac);
  const mouth = 0.28 + Math.abs(Math.sin(pulse * 12)) * 0.18;
  const angle = Math.atan2(state.pac.dir.y, state.pac.dir.x);
  ctx.fillStyle = gold;
  ctx.beginPath();
  ctx.moveTo(p.x * cell, p.y * cell);
  ctx.arc(p.x * cell, p.y * cell, cell * 0.34, angle + mouth, angle + Math.PI * 2 - mouth);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = gold;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(p.x * cell, p.y * cell, cell * 0.43 + Math.sin(pulse * 8) * 2, 0, Math.PI * 2);
  ctx.stroke();
  for (const ghost of state.ghosts) {
    const g = cellPoint(ghost);
    const x = g.x * cell;
    const y = g.y * cell;
    ctx.strokeStyle = state.frightened > 0 ? gold : ink;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y - cell * 0.05, cell * 0.28, Math.PI, 0);
    ctx.lineTo(x + cell * 0.28, y + cell * 0.27);
    ctx.lineTo(x + cell * 0.1, y + cell * 0.15);
    ctx.lineTo(x - cell * 0.06, y + cell * 0.27);
    ctx.lineTo(x - cell * 0.28, y + cell * 0.15);
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = state.frightened > 0 ? "rgba(215,167,47,.08)" : "rgba(247,243,232,.035)";
    ctx.fill();
    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.arc(x - cell * 0.1, y - cell * 0.04, 2.2, 0, Math.PI * 2);
    ctx.arc(x + cell * 0.1, y - cell * 0.04, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function loop(time) {
  const dt = Math.min(0.04, (time - lastTime) / 1000 || 0);
  lastTime = time;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

function setDir(name) {
  if (dirs[name]) {
    const next = dirs[name];
    const pac = state.pac;
    if (pac.progress > 0 && next.x === -pac.dir.x && next.y === -pac.dir.y) {
      pac.x += pac.dir.x;
      pac.y += pac.dir.y;
      pac.dir = next;
      pac.next = next;
      pac.progress = 1 - pac.progress;
    } else {
      pac.next = next;
      if (pac.progress < 0.2 && canMove(pac, next)) pac.dir = next;
    }
    if (state.mode === "ready") start();
  }
}

window.addEventListener("keydown", event => {
  const map = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down", a: "left", d: "right", w: "up", s: "down" };
  if (map[event.key]) {
    event.preventDefault();
    setDir(map[event.key]);
  }
  if (event.key === " ") {
    event.preventDefault();
    pause();
  }
});

canvas.addEventListener("pointerdown", event => {
  touchStart = { x: event.clientX, y: event.clientY };
});

canvas.addEventListener("pointerup", event => {
  if (!touchStart) return;
  const dx = event.clientX - touchStart.x;
  const dy = event.clientY - touchStart.y;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 14) {
    start();
  } else if (Math.abs(dx) > Math.abs(dy)) {
    setDir(dx > 0 ? "right" : "left");
  } else {
    setDir(dy > 0 ? "down" : "up");
  }
  touchStart = null;
});

document.querySelectorAll("[data-dir]").forEach(button => {
  const release = () => button.classList.remove("is-pressed");
  button.addEventListener("pointerdown", () => {
    button.classList.add("is-pressed");
    setDir(button.dataset.dir);
  });
  button.addEventListener("pointerup", release);
  button.addEventListener("pointerleave", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("click", () => setDir(button.dataset.dir));
});

primaryAction.addEventListener("click", start);
pauseBtn.addEventListener("click", pause);
restartBtn.addEventListener("click", resetGame);
resetGame();
requestAnimationFrame(loop);
