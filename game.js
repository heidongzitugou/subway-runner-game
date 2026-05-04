const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const coinsEl = document.getElementById("coins");
const speedEl = document.getElementById("speed");
const bestEl = document.getElementById("best");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayCopy = document.getElementById("overlayCopy");
const kicker = document.getElementById("kicker");
const startBtn = document.getElementById("startBtn");
const shieldPill = document.getElementById("shieldPill");
const magnetPill = document.getElementById("magnetPill");
const comboPill = document.getElementById("comboPill");
const missionEl = document.getElementById("mission");

const lanes = [-1, 0, 1];
const nearScale = 1.36;
const farZ = 1.15;
const bestKey = "subway-runner-best-score";

const state = {
  running: false,
  paused: false,
  over: false,
  score: 0,
  best: loadBestScore(),
  coins: 0,
  combo: 1,
  comboTimer: 0,
  speed: 1,
  distance: 0,
  spawnTimer: 0,
  coinTimer: 0,
  powerTimer: 0,
  lastTime: 0,
  shake: 0,
  flash: 0,
  speedBurst: 0,
  missionComplete: false,
  objects: [],
  particles: [],
  messages: [],
};

const player = {
  lane: 0,
  targetLane: 0,
  x: 0,
  y: 0,
  width: 48,
  height: 88,
  jump: 0,
  jumpVelocity: 0,
  sliding: 0,
  shield: 0,
  magnet: 0,
  stride: 0,
};

const colors = {
  rail: "#b8c1bb",
  gold: "#ffd34e",
  green: "#5be6b7",
  red: "#ef4c4f",
  orange: "#f7833d",
  blue: "#68a7ff",
  pink: "#ff5d8f",
  white: "#fff8dc",
};

const artCatalog = {
  background: { src: "assets/background-night.png" },
  player: { src: "assets/player-runner.png" },
  coin: { src: "assets/coin-glow.png" },
  shield: { src: "assets/power-shield.png" },
  magnet: { src: "assets/power-magnet.png" },
  barrier: { src: "assets/obstacle-barrier.png" },
  gate: { src: "assets/obstacle-gate.png" },
  cone: { src: "assets/obstacle-cone.png" },
  train: { src: "assets/train-front.png" },
};

const artAssets = loadArtAssets(artCatalog);

function loadArtAssets(catalog) {
  const assets = {};

  for (const [key, { src }] of Object.entries(catalog)) {
    const image = new Image();
    assets[key] = {
      image,
      ready: false,
      src,
    };

    image.addEventListener("load", () => {
      assets[key].ready = true;
      if (key === "background") {
        canvas.dataset.hasBackdrop = "true";
      }
      draw();
    });

    image.addEventListener("error", () => {
      assets[key].ready = false;
    });

    image.src = src;
  }

  return assets;
}

function getArtAsset(key) {
  const asset = artAssets[key];
  return asset && asset.ready ? asset.image : null;
}

function loadBestScore() {
  const saved = Number(localStorage.getItem(bestKey));
  return Number.isFinite(saved) ? saved : 0;
}

function saveBestScore(score) {
  if (score > state.best) {
    state.best = score;
    localStorage.setItem(bestKey, String(score));
  }
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  canvas.width = Math.max(1, Math.round(rect.width * dpr));
  canvas.height = Math.max(1, Math.round(rect.height * dpr));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function view() {
  return canvas.getBoundingClientRect();
}

function laneX(lane, depth = 1) {
  const { width } = view();
  return width / 2 + lane * width * (0.07 + depth * 0.17);
}

function groundY() {
  return view().height * 0.82;
}

function resetGame() {
  Object.assign(state, {
    running: true,
    paused: false,
    over: false,
    score: 0,
    coins: 0,
    combo: 1,
    comboTimer: 0,
    speed: 1,
    distance: 0,
    spawnTimer: 0.35,
    coinTimer: 0.25,
    powerTimer: 4.5,
    lastTime: performance.now(),
    shake: 0,
    flash: 0,
    speedBurst: 0,
    missionComplete: false,
    objects: [],
    particles: [],
    messages: [],
  });

  Object.assign(player, {
    lane: 0,
    targetLane: 0,
    jump: 0,
    jumpVelocity: 0,
    sliding: 0,
    shield: 0,
    magnet: 0,
    stride: 0,
  });

  overlay.classList.add("hidden");
  updateHud();
  requestAnimationFrame(loop);
}

function updateHud() {
  const score = Math.floor(state.score);
  scoreEl.textContent = String(score);
  coinsEl.textContent = String(state.coins);
  speedEl.textContent = `${state.speed.toFixed(1)}x`;
  bestEl.textContent = String(Math.max(state.best, score));

  shieldPill.textContent = `护盾 ${Math.ceil(player.shield)}s`;
  magnetPill.textContent = `磁铁 ${Math.ceil(player.magnet)}s`;
  comboPill.textContent = `连击 x${state.combo}`;
  shieldPill.classList.toggle("active", player.shield > 0);
  magnetPill.classList.toggle("active", player.magnet > 0);
  comboPill.classList.toggle("active", state.combo > 1);

  if (state.missionComplete) {
    missionEl.textContent = "奖励已触发：速度提升更快，金币连击分数翻倍。";
  } else {
    missionEl.textContent = `收集 20 枚金币，解锁速度奖励：${Math.min(20, state.coins)}/20`;
  }
}

function addToast(text) {
  state.messages.push({
    text,
    life: 1.55,
    y: view().height * 0.28,
  });
}

function spawnObstacleGroup() {
  const roll = Math.random();
  const baseLane = randomLane();

  if (roll < 0.18 && state.speed > 1.25) {
    const openLane = randomLane();
    for (const lane of lanes) {
      if (lane === openLane) continue;
      state.objects.push(makeObstacle(lane, Math.random() > 0.5 ? "barrier" : "gate"));
    }
    return;
  }

  if (roll < 0.34 && state.distance > 900) {
    state.objects.push(makeObstacle(baseLane, "train"));
    return;
  }

  if (roll < 0.6) {
    state.objects.push(makeObstacle(baseLane, "barrier"));
    return;
  }

  state.objects.push(makeObstacle(baseLane, Math.random() > 0.5 ? "gate" : "cone"));
}

function makeObstacle(lane, type) {
  const sizes = {
    barrier: { width: 74, height: 82 },
    gate: { width: 88, height: 62 },
    cone: { width: 58, height: 66 },
    train: { width: 108, height: 156 },
  };
  return {
    kind: type,
    lane,
    z: farZ,
    width: sizes[type].width,
    height: sizes[type].height,
    hit: false,
  };
}

function spawnCoinLine() {
  const lane = randomLane();
  const arc = Math.random() > 0.58;
  for (let i = 0; i < 7; i += 1) {
    state.objects.push({
      kind: "coin",
      lane: arc && i > 3 ? clampLane(lane + (Math.random() > 0.5 ? 1 : -1)) : lane,
      z: farZ + i * 0.075,
      width: 30,
      height: 30,
      hit: false,
      spin: Math.random() * Math.PI,
      pull: 0,
    });
  }
}

function spawnPowerup() {
  state.objects.push({
    kind: Math.random() > 0.5 ? "shield" : "magnet",
    lane: randomLane(),
    z: farZ,
    width: 38,
    height: 38,
    hit: false,
    spin: 0,
  });
}

function randomLane() {
  return lanes[Math.floor(Math.random() * lanes.length)];
}

function clampLane(lane) {
  return Math.max(-1, Math.min(1, lane));
}

function jump() {
  if (!state.running || state.paused || state.over) return;
  if (player.jump <= 1 && player.sliding <= 0) {
    player.jumpVelocity = 820;
    puff(player.x, player.y, "#eaf1e8", 8);
    addRing(player.x, player.y + 4, colors.white, 0.46);
  }
}

function slide() {
  if (!state.running || state.paused || state.over) return;
  if (player.jump <= 4) {
    player.sliding = 0.68;
    puff(player.x, player.y - 8, colors.blue, 6);
    addDash(player.x, player.y - 24, colors.blue);
  }
}

function moveLane(direction) {
  if (!state.running || state.paused || state.over) return;
  player.targetLane = clampLane(player.targetLane + direction);
  puff(player.x - direction * 20, player.y - 36, colors.green, 4);
}

function togglePause() {
  if (!state.running || state.over) return;
  state.paused = !state.paused;
  if (state.paused) {
    showMessage("已暂停", "按 P 或点击按钮继续奔跑。", "继续");
  } else {
    overlay.classList.add("hidden");
    state.lastTime = performance.now();
    requestAnimationFrame(loop);
  }
}

function handleInput(event) {
  const key = event.key.toLowerCase();
  if (["arrowleft", "arrowright", "arrowup", "arrowdown", " "].includes(event.key)) {
    event.preventDefault();
  }

  if (!state.running || state.over) {
    if (event.key === "Enter" || event.key === " ") resetGame();
    return;
  }

  if (key === "p") {
    togglePause();
    return;
  }

  if (state.paused) return;
  if (event.key === "ArrowLeft" || key === "a") moveLane(-1);
  if (event.key === "ArrowRight" || key === "d") moveLane(1);
  if (event.key === "ArrowUp" || key === "w" || event.key === " ") jump();
  if (event.key === "ArrowDown" || key === "s") slide();
}

let touchStartX = 0;
let touchStartY = 0;

function handleTouchStart(event) {
  const touch = event.changedTouches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
}

function handleTouchEnd(event) {
  if (!state.running || state.paused || state.over) return;
  const touch = event.changedTouches[0];
  const dx = touch.clientX - touchStartX;
  const dy = touch.clientY - touchStartY;
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 28) moveLane(dx > 0 ? 1 : -1);
  if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 28) {
    if (dy < 0) jump();
    else slide();
  }
}

function showMessage(title, copy, button) {
  overlayTitle.textContent = title;
  overlayCopy.textContent = copy;
  startBtn.textContent = button;
  overlay.classList.remove("hidden");
}

function togglePause() {
  if (!state.running || state.over) return;
  state.paused = !state.paused;
  if (state.paused) {
    showMessage("已暂停", "节奏先收住，按 P 或点击按钮继续奔跑。", "继续");
  } else {
    overlay.classList.add("hidden");
    state.lastTime = performance.now();
    requestAnimationFrame(loop);
  }
}

function endGame() {
  const score = Math.floor(state.score);
  state.running = false;
  state.over = true;
  saveBestScore(score);
  updateHud();
  showMessage("撞上障碍", `最终分数 ${score}，金币 ${state.coins}，最高分 ${state.best}。`, "再跑一局");
}

function update(dt) {
  const rect = view();
  const dtScale = Math.min(dt, 0.033);
  const missionBoost = state.missionComplete ? 1.12 : 1;

  state.distance += dtScale * 540 * state.speed;
  state.score += dtScale * 21 * state.speed * state.combo;
  state.speed = Math.min(3.25, 1 + (state.distance / 10500) * missionBoost);
  state.spawnTimer -= dtScale;
  state.coinTimer -= dtScale;
  state.powerTimer -= dtScale;
  state.comboTimer -= dtScale;
  state.shake = Math.max(0, state.shake - dtScale * 16);
  state.flash = Math.max(0, state.flash - dtScale * 3.6);
  state.speedBurst = Math.max(0, state.speedBurst - dtScale * 2.8);

  if (state.comboTimer <= 0) state.combo = 1;
  if (!state.missionComplete && state.coins >= 20) {
    state.missionComplete = true;
    state.score += 400;
    state.flash = 1;
    state.speedBurst = 1;
    addToast("任务完成 +400", colors.gold);
    addRing(player.x, player.y - 44, colors.gold, 0.9);
    addToast("任务完成 +400");
  }

  if (state.spawnTimer <= 0) {
    spawnObstacleGroup();
    state.spawnTimer = Math.max(0.44, 1.05 - state.speed * 0.13 - Math.random() * 0.18);
  }

  if (state.coinTimer <= 0) {
    spawnCoinLine();
    state.coinTimer = 1.0 + Math.random() * 0.9;
  }

  if (state.powerTimer <= 0) {
    spawnPowerup();
    state.powerTimer = 6.5 + Math.random() * 4.5;
  }

  player.lane += (player.targetLane - player.lane) * Math.min(1, dtScale * 13);
  player.jump += player.jumpVelocity * dtScale;
  player.jumpVelocity -= 2380 * dtScale;
  if (player.jump <= 0) {
    player.jump = 0;
    player.jumpVelocity = 0;
  }
  player.sliding = Math.max(0, player.sliding - dtScale);
  player.shield = Math.max(0, player.shield - dtScale);
  player.magnet = Math.max(0, player.magnet - dtScale);
  player.stride += dtScale * state.speed * 9;
  player.x = laneX(player.lane, 1);
  player.y = groundY() - player.jump;

  for (const obj of state.objects) {
    obj.z -= dtScale * (0.54 + state.speed * 0.3);
    if (obj.kind === "coin" || obj.kind === "shield" || obj.kind === "magnet") obj.spin += dtScale * 10;
    if (obj.kind === "coin" && player.magnet > 0) applyMagnet(obj, rect, dtScale);
    if (!obj.hit && checkCollision(obj, rect)) handleCollision(obj);
  }

  state.objects = state.objects.filter((obj) => obj.z > -0.1 && !obj.hit);
  state.particles = state.particles
    .map((p) => ({
      ...p,
      life: p.life - dtScale,
      x: p.x + p.vx * dtScale,
      y: p.y + p.vy * dtScale,
      vy: p.vy + (p.gravity ?? 260) * dtScale,
      rotation: (p.rotation || 0) + (p.spin || 0) * dtScale,
    }))
    .filter((p) => p.life > 0);
  state.messages = state.messages
    .map((message) => ({ ...message, life: message.life - dtScale, y: message.y - 18 * dtScale }))
    .filter((message) => message.life > 0);

  updateHud();
}

function applyMagnet(obj, rect, dt) {
  const pos = objectScreen(obj, rect);
  const dx = player.x - pos.x;
  const dy = player.y - player.height * 0.62 - pos.y;
  if (Math.hypot(dx, dy) < rect.width * 0.26) {
    obj.pull = Math.min(1, obj.pull + dt * 4.2);
    if (obj.pull > 0.72) collectCoin(obj);
  }
}

function handleCollision(obj) {
  if (obj.kind === "coin") {
    collectCoin(obj);
    return;
  }

  if (obj.kind === "shield") {
    obj.hit = true;
    player.shield = 8;
    state.score += 150;
    state.flash = Math.max(state.flash, 0.32);
    addRing(player.x, player.y - 44, colors.blue, 0.68);
    addToast("获得护盾");
    burst(obj, colors.blue);
    return;
  }

  if (obj.kind === "magnet") {
    obj.hit = true;
    player.magnet = 8;
    state.score += 150;
    state.flash = Math.max(state.flash, 0.24);
    addRing(player.x, player.y - 44, colors.green, 0.68);
    addToast("获得磁铁");
    burst(obj, colors.green);
    return;
  }

  if (player.shield > 0) {
    obj.hit = true;
    player.shield = Math.max(0, player.shield - 3.4);
    state.score += 120;
    state.shake = 0.8;
    state.flash = Math.max(state.flash, 0.36);
    addRing(player.x, player.y - player.height * 0.52, colors.blue, 0.75);
    addToast("护盾抵挡");
    burst(obj, colors.blue);
    return;
  }

  state.shake = 1.2;
  endGame();
}

function collectCoin(obj) {
  if (obj.hit) return;
  const pos = objectScreen(obj);
  obj.hit = true;
  state.coins += 1;
  state.combo = Math.min(8, state.combo + 1);
  state.comboTimer = 2.4;
  state.score += 25 * state.combo;
  state.speedBurst = Math.max(state.speedBurst, 0.22);
  addFloatingText(`+${25 * state.combo}`, pos.x, pos.y - pos.h, colors.gold);
  addRing(pos.x, pos.y - pos.h / 2, colors.gold, 0.34);
  burst(obj, colors.gold);
}

function objectScreen(obj, rect = view()) {
  const depth = 1 - obj.z;
  const scale = 0.3 + depth * 1.28;
  let x = laneX(obj.lane, depth);
  let y = rect.height * (0.23 + depth * 0.61);

  if (obj.pull) {
    const targetX = player.x;
    const targetY = player.y - player.height * 0.62;
    x += (targetX - x) * obj.pull;
    y += (targetY - y) * obj.pull;
  }

  return {
    x,
    y,
    scale,
    w: obj.width * scale,
    h: obj.height * scale,
    depth,
  };
}

function checkCollision(obj, rect) {
  const pos = objectScreen(obj, rect);
  if (pos.scale < nearScale || pos.scale > 1.88) return false;

  const playerHeight = player.sliding > 0 ? player.height * 0.52 : player.height;
  const playerTop = player.y - playerHeight;
  const playerBottom = player.y;
  const playerLeft = player.x - player.width / 2;
  const playerRight = player.x + player.width / 2;
  const objLeft = pos.x - pos.w / 2;
  const objRight = pos.x + pos.w / 2;
  const objTop = pos.y - pos.h;
  const objBottom = pos.y;

  const overlaps = playerRight > objLeft && playerLeft < objRight && playerBottom > objTop && playerTop < objBottom;
  if (!overlaps) return false;
  if (obj.kind === "gate") return player.sliding <= 0;
  if (obj.kind === "barrier" || obj.kind === "cone") return player.jump < 62;
  return true;
}

function burst(obj, color = colors.gold) {
  const pos = objectScreen(obj);
  puff(pos.x, pos.y - pos.h / 2, color, 13);
}

function puff(x, y, color, count) {
  for (let i = 0; i < count; i += 1) {
    state.particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 220,
      vy: (Math.random() - 0.85) * 220,
      life: 0.45 + Math.random() * 0.35,
      size: 2 + Math.random() * 4,
      color,
    });
  }
}

function addRing(x, y, color, strength = 0.5) {
  state.particles.push({
    type: "ring",
    x,
    y,
    vx: 0,
    vy: 0,
    gravity: 0,
    life: 0.42 + strength * 0.2,
    maxLife: 0.42 + strength * 0.2,
    size: 24 + strength * 42,
    color,
  });
}

function addDash(x, y, color) {
  for (let i = 0; i < 7; i += 1) {
    state.particles.push({
      type: "dash",
      x: x + (Math.random() - 0.5) * 46,
      y: y + (Math.random() - 0.5) * 18,
      vx: (Math.random() - 0.5) * 70,
      vy: 240 + Math.random() * 110,
      gravity: 0,
      life: 0.22 + Math.random() * 0.16,
      size: 18 + Math.random() * 22,
      color,
    });
  }
}

function addFloatingText(text, x, y, color) {
  state.particles.push({
    type: "text",
    text,
    x,
    y,
    vx: (Math.random() - 0.5) * 24,
    vy: -72,
    gravity: 12,
    life: 0.82,
    maxLife: 0.82,
    size: 18,
    color,
  });
}

function drawBackground(rect) {
  const w = rect.width;
  const h = rect.height;
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#23313b");
  sky.addColorStop(0.42, "#121b21");
  sky.addColorStop(1, "#071014");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  drawBackdropImage(w, h);

  drawCity(w, h);
  drawTunnel(w, h);
  drawTracks(w, h);
  drawStationLights(w, h);
}

function drawBackdropImage(w, h) {
  const image = getArtAsset("background");
  if (!image) return;

  const sway = Math.sin(state.distance * 0.003) * w * 0.015;
  const drift = (state.distance * 0.08) % (w * 0.18);
  const cover = coverImage(image, w, h);

  ctx.save();
  ctx.globalAlpha = 0.34;
  ctx.filter = "saturate(1.08) contrast(1.02)";
  ctx.drawImage(image, cover.x - sway - drift, cover.y, cover.w, cover.h);
  ctx.drawImage(image, cover.x - sway - drift + cover.w, cover.y, cover.w, cover.h);
  ctx.restore();
}

function drawCity(w, h) {
  const baseY = h * 0.29;
  for (let i = 0; i < 15; i += 1) {
    const bw = w * (0.035 + (i % 4) * 0.012);
    const bh = h * (0.11 + ((i * 29) % 80) / 360);
    const x = ((i * 97 + state.distance * 0.02) % (w + bw)) - bw;
    ctx.fillStyle = i % 3 === 0 ? "#1a2c31" : "#18242c";
    ctx.fillRect(x, baseY - bh, bw, bh);

    ctx.fillStyle = "rgba(255, 211, 78, 0.5)";
    for (let y = baseY - bh + 12; y < baseY - 10; y += 18) {
      if ((i + Math.floor(y)) % 3 === 0) ctx.fillRect(x + bw * 0.24, y, 4, 6);
      if ((i + Math.floor(y)) % 4 === 0) ctx.fillRect(x + bw * 0.62, y, 4, 6);
    }
  }
}

function drawTunnel(w, h) {
  const center = w / 2;
  const top = h * 0.25;
  const bottom = h * 0.96;
  ctx.fillStyle = "rgba(4, 8, 11, 0.55)";
  ctx.beginPath();
  ctx.moveTo(center - w * 0.17, top);
  ctx.lineTo(center + w * 0.17, top);
  ctx.lineTo(w * 1.02, bottom);
  ctx.lineTo(-w * 0.02, bottom);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(125, 158, 147, 0.16)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 10; i += 1) {
    const t = ((state.distance / 380 + i) % 10) / 10;
    const y = top + t * (bottom - top);
    const spread = w * (0.18 + t * 0.95);
    ctx.beginPath();
    ctx.moveTo(center - spread / 2, y);
    ctx.lineTo(center + spread / 2, y);
    ctx.stroke();
  }
}

function drawTracks(w, h) {
  const center = w / 2;
  const railTop = h * 0.28;
  const railBottom = h * 0.96;

  const ballast = ctx.createLinearGradient(0, railTop, 0, railBottom);
  ballast.addColorStop(0, "#263037");
  ballast.addColorStop(1, "#15191d");
  ctx.fillStyle = ballast;
  ctx.beginPath();
  ctx.moveTo(center - w * 0.13, railTop);
  ctx.lineTo(center + w * 0.13, railTop);
  ctx.lineTo(w * 0.98, railBottom);
  ctx.lineTo(w * 0.02, railBottom);
  ctx.closePath();
  ctx.fill();

  for (const lane of lanes) {
    const leftTop = center + lane * w * 0.044 - w * 0.017;
    const rightTop = center + lane * w * 0.044 + w * 0.017;
    const leftBottom = center + lane * w * 0.24 - w * 0.056;
    const rightBottom = center + lane * w * 0.24 + w * 0.056;

    ctx.strokeStyle = "rgba(236, 244, 232, 0.44)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(leftTop, railTop);
    ctx.lineTo(leftBottom, railBottom);
    ctx.moveTo(rightTop, railTop);
    ctx.lineTo(rightBottom, railBottom);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(255, 211, 78, 0.28)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 16; i += 1) {
    const t = ((state.distance / 230 + i) % 16) / 16;
    const y = railTop + t * (railBottom - railTop);
    const spread = w * (0.14 + t * 0.8);
    ctx.beginPath();
    ctx.moveTo(center - spread / 2, y);
    ctx.lineTo(center + spread / 2, y);
    ctx.stroke();
  }
}

function drawStationLights(w, h) {
  const y = h * 0.22;
  for (let i = 0; i < 7; i += 1) {
    const t = ((state.distance / 520 + i) % 7) / 7;
    const x = w * t;
    const glow = ctx.createRadialGradient(x, y, 0, x, y, w * 0.09);
    glow.addColorStop(0, "rgba(255, 236, 151, 0.22)");
    glow.addColorStop(1, "rgba(255, 236, 151, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(x - w * 0.1, y - h * 0.08, w * 0.2, h * 0.16);
    ctx.fillStyle = "#fff1a3";
    ctx.fillRect(x - 18, y - 2, 36, 4);
  }
}

function drawSpeedLines(rect) {
  const intensity = Math.max(0, (state.speed - 1.15) / 2.1) + state.speedBurst * 0.45;
  if (intensity <= 0.02) return;

  const w = rect.width;
  const h = rect.height;
  const centerX = w / 2;
  const centerY = h * 0.33;
  ctx.save();
  ctx.globalAlpha = Math.min(0.55, intensity);
  ctx.lineWidth = 2;
  ctx.lineCap = "round";

  for (let i = 0; i < 18; i += 1) {
    const side = i % 2 === 0 ? -1 : 1;
    const offset = ((i * 73 + state.distance * 0.38) % h) / h;
    const y = h * (0.28 + offset * 0.66);
    const edgeX = side < 0 ? w * (0.05 + (i % 5) * 0.035) : w * (0.95 - (i % 5) * 0.035);
    ctx.strokeStyle = i % 3 === 0 ? "rgba(255, 211, 78, 0.62)" : "rgba(117, 183, 255, 0.48)";
    ctx.beginPath();
    ctx.moveTo(centerX + (edgeX - centerX) * 0.38, centerY + (y - centerY) * 0.38);
    ctx.lineTo(edgeX, y + intensity * 22);
    ctx.stroke();
  }

  ctx.restore();
}

function drawObjects(rect) {
  const sorted = [...state.objects].sort((a, b) => b.z - a.z);
  for (const obj of sorted) {
    const pos = objectScreen(obj, rect);
    if (pos.scale <= 0.16) continue;
    if (obj.kind === "coin" && obj.pull > 0) drawMagnetBeam(pos, obj.pull);
    ctx.save();
    ctx.translate(pos.x, pos.y);

    if (obj.kind === "coin") drawCoin(obj, pos);
    if (obj.kind === "shield" || obj.kind === "magnet") drawPowerup(obj, pos);
    if (obj.kind === "gate") drawObstacleSprite("gate", pos, drawGate);
    if (obj.kind === "barrier") drawObstacleSprite("barrier", pos, drawBarrier);
    if (obj.kind === "cone") drawObstacleSprite("cone", pos, drawCone);
    if (obj.kind === "train") drawObstacleSprite("train", pos, drawTrain);

    ctx.restore();
  }
}

function drawMagnetBeam(pos, pull) {
  ctx.save();
  ctx.globalAlpha = Math.min(0.55, pull);
  ctx.strokeStyle = "rgba(91, 230, 183, 0.72)";
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 10]);
  ctx.lineDashOffset = -state.distance * 0.08;
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y - pos.h / 2);
  ctx.quadraticCurveTo((pos.x + player.x) / 2, pos.y - 80, player.x, player.y - player.height * 0.62);
  ctx.stroke();
  ctx.restore();
}

function drawCoin(obj, pos) {
  const glow = ctx.createRadialGradient(0, -pos.h / 2, 0, 0, -pos.h / 2, pos.w * 0.95);
  glow.addColorStop(0, "rgba(255, 232, 120, 0.48)");
  glow.addColorStop(1, "rgba(255, 232, 120, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(-pos.w, -pos.h * 1.45, pos.w * 2, pos.h * 1.9);

  const sprite = getArtAsset("coin");
  if (sprite) {
    ctx.save();
    ctx.translate(0, -pos.h / 2);
    ctx.rotate(Math.sin(obj.spin) * 0.14);
    ctx.globalAlpha = 0.96;
    drawSprite(sprite, -pos.w * 0.68, -pos.h * 0.68, pos.w * 1.36, pos.h * 1.36);
    ctx.restore();
    return;
  }

  const shine = Math.max(0.18, Math.abs(Math.cos(obj.spin)));
  ctx.fillStyle = colors.gold;
  ctx.strokeStyle = "#fff5b9";
  ctx.lineWidth = Math.max(2, pos.scale * 2);
  ctx.beginPath();
  ctx.ellipse(0, -pos.h / 2, Math.max(4, (pos.w / 2) * shine), pos.h / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "rgba(92, 63, 8, 0.38)";
  ctx.fillRect(-2 * pos.scale, -pos.h * 0.82, 4 * pos.scale, pos.h * 0.62);
}

function drawPowerup(obj, pos) {
  const sprite = getArtAsset(obj.kind);
  const color = obj.kind === "shield" ? colors.blue : colors.green;
  const aura = ctx.createRadialGradient(0, -pos.h / 2, 0, 0, -pos.h / 2, pos.w * 1.2);
  aura.addColorStop(0, `${hexToRgb(color, 0.44)}`);
  aura.addColorStop(1, `${hexToRgb(color, 0)}`);
  ctx.fillStyle = aura;
  ctx.fillRect(-pos.w * 1.2, -pos.h * 1.6, pos.w * 2.4, pos.h * 2.1);

  if (sprite) {
    ctx.save();
    ctx.translate(0, -pos.h / 2);
    ctx.rotate(obj.spin * 0.18);
    drawSprite(sprite, -pos.w * 0.8, -pos.h * 0.8, pos.w * 1.6, pos.h * 1.6);
    ctx.restore();
    return;
  }

  ctx.rotate(obj.spin * 0.18);
  ctx.fillStyle = color;
  ctx.strokeStyle = "#effff9";
  ctx.lineWidth = Math.max(2, 2 * pos.scale);
  ctx.beginPath();
  for (let i = 0; i < 6; i += 1) {
    const angle = -Math.PI / 2 + (Math.PI * 2 * i) / 6;
    const r = i % 2 ? pos.w * 0.38 : pos.w * 0.52;
    const x = Math.cos(angle) * r;
    const y = -pos.h / 2 + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#0b151a";
  ctx.font = `${Math.max(12, pos.scale * 18)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(obj.kind === "shield" ? "S" : "M", 0, -pos.h / 2);
}

function drawGate(pos) {
  ctx.fillStyle = colors.red;
  roundRect(-pos.w / 2, -pos.h, pos.w, 18 * pos.scale, 4);
  ctx.fill();
  ctx.fillStyle = "#8d222b";
  roundRect(-pos.w / 2, -pos.h + 18 * pos.scale, 14 * pos.scale, pos.h, 3);
  roundRect(pos.w / 2 - 14 * pos.scale, -pos.h + 18 * pos.scale, 14 * pos.scale, pos.h, 3);
  ctx.fill();
}

function drawBarrier(pos) {
  ctx.fillStyle = colors.orange;
  roundRect(-pos.w / 2, -pos.h, pos.w, pos.h, 6);
  ctx.fill();
  ctx.fillStyle = "rgba(24, 18, 11, 0.38)";
  for (let i = 0; i < 4; i += 1) {
    ctx.fillRect(-pos.w / 2 + i * pos.w / 4, -pos.h, 8 * pos.scale, pos.h);
  }
  ctx.strokeStyle = "#fff2b8";
  ctx.lineWidth = 3 * pos.scale;
  ctx.beginPath();
  ctx.moveTo(-pos.w / 2 + 10 * pos.scale, -pos.h * 0.72);
  ctx.lineTo(pos.w / 2 - 10 * pos.scale, -pos.h * 0.28);
  ctx.stroke();
}

function drawCone(pos) {
  ctx.fillStyle = "#ff8b2e";
  ctx.beginPath();
  ctx.moveTo(0, -pos.h);
  ctx.lineTo(pos.w / 2, 0);
  ctx.lineTo(-pos.w / 2, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#fff2c7";
  ctx.fillRect(-pos.w * 0.3, -pos.h * 0.48, pos.w * 0.6, 8 * pos.scale);
}

function drawTrain(pos) {
  const body = ctx.createLinearGradient(0, -pos.h, 0, 0);
  body.addColorStop(0, "#e8efe7");
  body.addColorStop(0.48, "#8eb0a6");
  body.addColorStop(1, "#36454b");
  ctx.fillStyle = body;
  roundRect(-pos.w / 2, -pos.h, pos.w, pos.h, 8 * pos.scale);
  ctx.fill();

  ctx.fillStyle = "#162027";
  roundRect(-pos.w * 0.36, -pos.h * 0.82, pos.w * 0.72, pos.h * 0.3, 5 * pos.scale);
  ctx.fill();
  ctx.fillStyle = colors.red;
  ctx.fillRect(-pos.w / 2, -pos.h * 0.36, pos.w, 8 * pos.scale);
  ctx.fillStyle = "#fff4b0";
  ctx.beginPath();
  ctx.arc(-pos.w * 0.25, -pos.h * 0.16, 8 * pos.scale, 0, Math.PI * 2);
  ctx.arc(pos.w * 0.25, -pos.h * 0.16, 8 * pos.scale, 0, Math.PI * 2);
  ctx.fill();
}

function drawPlayer() {
  const h = player.sliding > 0 ? player.height * 0.52 : player.height;
  const lean = (player.targetLane - player.lane) * 0.22;
  const legSwing = Math.sin(player.stride) * 8;
  const sprite = getArtAsset("player");

  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.rotate(lean);
  ctx.fillStyle = "rgba(0, 0, 0, 0.36)";
  ctx.beginPath();
  ctx.ellipse(0, 8, 36, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  if (player.shield > 0) {
    const pulse = 1 + Math.sin(performance.now() * 0.012) * 0.08;
    ctx.strokeStyle = "rgba(104, 167, 255, 0.82)";
    ctx.lineWidth = 4;
    ctx.shadowBlur = 24;
    ctx.shadowColor = "rgba(104, 167, 255, 0.8)";
    ctx.beginPath();
    ctx.ellipse(0, -h * 0.48, 44 * pulse, h * 0.68 * pulse, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  if (sprite) {
    const bob = player.sliding > 0 ? 0 : Math.abs(Math.sin(player.stride)) * 4;
    ctx.save();
    ctx.translate(0, -h * 0.58 - bob);
    if (player.sliding > 0) {
      ctx.rotate(-Math.PI / 2.8);
      drawSprite(sprite, -h * 0.58, -player.width * 0.9, h * 1.16, player.width * 1.8);
    } else {
      drawSprite(sprite, -player.width * 0.85, -h * 0.76, player.width * 1.7, h * 1.7);
    }
    ctx.restore();
    ctx.restore();
    return;
  }

  ctx.strokeStyle = "#1c2930";
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  if (player.sliding <= 0) {
    ctx.beginPath();
    ctx.moveTo(-12, -8);
    ctx.lineTo(-18, 24 + legSwing);
    ctx.moveTo(12, -8);
    ctx.lineTo(18, 24 - legSwing);
    ctx.stroke();
  }

  const suit = ctx.createLinearGradient(0, -h, 0, 0);
  suit.addColorStop(0, "#68e0bd");
  suit.addColorStop(1, "#188f82");
  ctx.fillStyle = suit;
  roundRect(-player.width / 2, -h, player.width, h, 8);
  ctx.fill();

  ctx.strokeStyle = colors.gold;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-18, -h + 24);
  ctx.lineTo(-33, -h + 47);
  ctx.moveTo(18, -h + 24);
  ctx.lineTo(33, -h + 47);
  ctx.stroke();

  ctx.fillStyle = "#f8ead6";
  ctx.beginPath();
  ctx.arc(0, -h - 18, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#152029";
  ctx.fillRect(-11, -h - 24, 22, 6);
  ctx.fillStyle = "#ff5b58";
  ctx.fillRect(-15, -h - 42, 30, 9);
  ctx.restore();
}

function drawParticles() {
  for (const p of state.particles) {
    const alpha = Math.max(0, Math.min(1, p.maxLife ? p.life / p.maxLife : p.life * 2));
    ctx.globalAlpha = alpha;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation || 0);

    if (p.type === "ring") {
      const progress = 1 - alpha;
      ctx.strokeStyle = p.color;
      ctx.lineWidth = Math.max(2, 5 * alpha);
      ctx.beginPath();
      ctx.arc(0, 0, p.size * (0.45 + progress), 0, Math.PI * 2);
      ctx.stroke();
    } else if (p.type === "dash") {
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, p.size);
      ctx.stroke();
    } else if (p.type === "text") {
      ctx.fillStyle = p.color;
      ctx.font = `900 ${p.size}px Microsoft YaHei, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowBlur = 12;
      ctx.shadowColor = p.color;
      ctx.fillText(p.text, 0, 0);
    } else {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

function drawMessages() {
  const rect = view();
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "800 24px Microsoft YaHei, sans-serif";
  for (const message of state.messages) {
    const alpha = Math.min(1, message.life);
    const lift = (1 - alpha) * 8;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "rgba(5, 15, 18, 0.68)";
    roundRect(rect.width / 2 - 132, message.y - 24 - lift, 264, 48, 8);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 211, 78, 0.28)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = message.color || "#fff8c8";
    ctx.shadowBlur = 16;
    ctx.shadowColor = message.color || colors.gold;
    ctx.fillText(message.text, rect.width / 2, message.y - lift);
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}

function drawObstacleSprite(key, pos, fallback) {
  const sprite = getArtAsset(key);
  if (!sprite) {
    fallback(pos);
    return;
  }

  const padding = key === "train" ? 0.06 : 0.14;
  drawSprite(
    sprite,
    -pos.w * (0.5 + padding),
    -pos.h * (1 + padding),
    pos.w * (1 + padding * 2),
    pos.h * (1 + padding * 2),
  );
}

function drawSprite(image, x, y, w, h) {
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(image, x, y, w, h);
}

function coverImage(image, w, h) {
  const scale = Math.max(w / image.width, h / image.height);
  return {
    x: (w - image.width * scale) / 2,
    y: (h - image.height * scale) / 2,
    w: image.width * scale,
    h: image.height * scale,
  };
}

function drawScreenEffects(rect) {
  const w = rect.width;
  const h = rect.height;
  const speedAlpha = Math.min(0.22, Math.max(0, state.speed - 1.2) * 0.08 + state.speedBurst * 0.12);

  ctx.save();
  if (speedAlpha > 0) {
    const vignette = ctx.createRadialGradient(w / 2, h * 0.47, w * 0.08, w / 2, h * 0.47, w * 0.62);
    vignette.addColorStop(0, "rgba(255, 255, 255, 0)");
    vignette.addColorStop(0.7, "rgba(255, 211, 78, 0)");
    vignette.addColorStop(1, `rgba(255, 211, 78, ${speedAlpha})`);
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);
  }

  if (state.flash > 0) {
    ctx.globalAlpha = Math.min(0.45, state.flash * 0.45);
    ctx.fillStyle = "#fff4b8";
    ctx.fillRect(0, 0, w, h);
  }
  ctx.restore();
}

function hexToRgb(hex, alpha = 1) {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function roundRect(x, y, w, h, r) {
  const radius = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function draw() {
  const rect = view();
  const offsetX = state.shake > 0 ? (Math.random() - 0.5) * state.shake * 10 : 0;
  const offsetY = state.shake > 0 ? (Math.random() - 0.5) * state.shake * 6 : 0;
  ctx.save();
  ctx.translate(offsetX, offsetY);
  drawBackground(rect);
  drawSpeedLines(rect);
  drawObjects(rect);
  drawPlayer();
  drawParticles();
  drawMessages();
  ctx.restore();
  drawScreenEffects(rect);
}

function loop(now) {
  if (!state.running || state.paused) return;
  const dt = (now - state.lastTime) / 1000;
  state.lastTime = now;
  update(dt);
  draw();
  if (state.running) requestAnimationFrame(loop);
}

function bindControl(id, action) {
  const button = document.getElementById(id);
  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    action();
  });
}

function updateHud() {
  const score = Math.floor(state.score);
  scoreEl.textContent = String(score);
  coinsEl.textContent = String(state.coins);
  speedEl.textContent = `${state.speed.toFixed(1)}x`;
  bestEl.textContent = String(Math.max(state.best, score));

  shieldPill.textContent = `护盾 ${Math.ceil(player.shield)}s`;
  magnetPill.textContent = `磁铁 ${Math.ceil(player.magnet)}s`;
  comboPill.textContent = `连击 x${state.combo}`;
  shieldPill.classList.toggle("active", player.shield > 0);
  magnetPill.classList.toggle("active", player.magnet > 0);
  comboPill.classList.toggle("active", state.combo > 1);

  if (state.missionComplete) {
    missionEl.textContent = "奖励已触发：速度提升更快，金币连击分数翻倍。";
  } else {
    missionEl.textContent = `收集 20 枚金币，解锁速度奖励：${Math.min(20, state.coins)}/20`;
  }
}

function addToast(text, color = colors.white) {
  const normalized = {
    "浠诲姟瀹屾垚 +400": "任务完成 +400",
    "鑾峰緱鎶ょ浘": "获得护盾",
    "鑾峰緱纾侀搧": "获得磁铁",
    "鎶ょ浘鎶垫尅": "护盾抵挡",
  }[text] || text;

  if (state.messages.some((message) => message.text === normalized && message.life > 1.1)) return;
  state.messages.push({
    text: normalized,
    color,
    life: 1.55,
    y: view().height * 0.28,
  });
}

function showMessage(title, copy, button) {
  overlayTitle.textContent = title;
  overlayCopy.textContent = copy;
  startBtn.textContent = button;
  overlay.classList.remove("hidden");
}

function endGame() {
  const score = Math.floor(state.score);
  state.running = false;
  state.over = true;
  state.flash = 0.55;
  saveBestScore(score);
  updateHud();
  showMessage("撞上障碍", `最终分数 ${score}，金币 ${state.coins}，最高分 ${state.best}。`, "再跑一局");
}

window.addEventListener("resize", () => {
  resizeCanvas();
  player.x = laneX(player.lane, 1);
  player.y = groundY() - player.jump;
  draw();
});
document.addEventListener("keydown", handleInput);
canvas.addEventListener("touchstart", handleTouchStart, { passive: true });
canvas.addEventListener("touchend", handleTouchEnd, { passive: true });
bindControl("leftBtn", () => moveLane(-1));
bindControl("rightBtn", () => moveLane(1));
bindControl("jumpBtn", jump);
bindControl("slideBtn", slide);

startBtn.addEventListener("click", () => {
  if (state.paused) {
    state.paused = false;
    overlay.classList.add("hidden");
    state.lastTime = performance.now();
    requestAnimationFrame(loop);
    return;
  }
  resetGame();
});

resizeCanvas();
kicker.textContent = "Endless Runner";
bestEl.textContent = String(state.best);
player.x = laneX(0, 1);
player.y = groundY();
draw();
