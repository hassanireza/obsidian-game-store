/*
  game.js — Cosmodrome
  A from-scratch canvas game engine. No external engine or library.
  Built on the pure functions in physics.js.
*/
(function () {
  'use strict';

  var P = (typeof window !== 'undefined' && window.Physics) || (typeof Physics !== 'undefined' && Physics);
  if (!P) throw new Error('Cosmodrome: physics.js must be loaded before game.js');

  // ------------------------------------------------------------------------
  // Configuration — every tunable constant for movement, pacing and rules.
  // ------------------------------------------------------------------------
  var CFG = {
    W: 480, H: 720,
    HORIZON_Y: 150,
    PLANE_Y: 660,
    ROAD_HALF_NEAR: 168,
    FOCAL: 300,
    Z_SPAWN: 3000,
    CURVE_AMP: 130,

    MIN_SPEED: 480,
    MAX_SPEED: 2100,
    SPEED_TAU: 24,
    SECTOR_SPEED_BUMP: 45,

    // Steering: direct accel/decel model (see physics.steerVelocity) so
    // input response is immediate, with no exponential lag.
    STEER_ACCEL: 6.2,
    STEER_DECEL: 7.5,
    STEER_MAXSPEED: 2.5,
    CENTRIFUGAL: 0.6,

    CURVE_MIN_HOLD: 2.6,
    CURVE_MAX_HOLD: 5.6,
    CURVE_SMOOTH: 0.55,
    CURVE_STRAIGHT_CHANCE: 0.2,

    COLLIDE_Z: 46,
    PASS_Z: -50,
    DESPAWN_Z: -140,
    POOL_SIZE: 40,
    PARTICLE_POOL: 140,
    BOLT_POOL: 24,

    SPAWN_SLOW: 1.05,
    SPAWN_FAST: 0.36,
    SPAWN_RAMP: 120,

    SECTOR_BASE: 14,
    SECTOR_GROWTH: 5,

    EXTRA_LIFE_SCORE: 4000,
    START_LIVES: 3,
    MAX_LIVES: 6,

    BOOST_WINDOW: 0.42,
    HOP_COOLDOWN: 0.9,
    INVULN_TIME: 1.3,

    IDLE_SPEED: 260,

    BOSS_EVERY: 5,
    BOSS_INTRO_TIME: 2.4,
    BOSS_ENTRY_TIME: 1.6,
    BOSS_Z: 260,
    BOSS_DEFEAT_SCORE: 1200,
    BOSS_BOLT_SPEED: 720,
    BOSS_HIT_RADIUS: 0.34
  };

  // Weapon definitions — auto-fire, selectable via dropdown.
  var WEAPONS = {
    laser: {
      label: 'pulse laser', rate: 0.16, dmg: 1, speed: 1900, spread: 0,
      bolts: 1, color: '#5dd9e8', glow: 'rgba(93,217,232,0.9)', heatPerShot: 0.1, cool: 0.55, kind: 'bolt'
    },
    twin: {
      label: 'twin cannon', rate: 0.22, dmg: 1, speed: 1750, spread: 0,
      bolts: 2, color: '#ff8c3d', glow: 'rgba(255,140,61,0.9)', heatPerShot: 0.16, cool: 0.5, kind: 'bolt'
    },
    spread: {
      label: 'spread blaster', rate: 0.32, dmg: 1, speed: 1500, spread: 0.16,
      bolts: 3, color: '#ffd166', glow: 'rgba(255,209,102,0.9)', heatPerShot: 0.22, cool: 0.45, kind: 'bolt'
    },
    missile: {
      label: 'homing missile', rate: 0.62, dmg: 3, speed: 1100, spread: 0,
      bolts: 1, color: '#ff4d5e', glow: 'rgba(255,77,94,0.95)', heatPerShot: 0.34, cool: 0.4, kind: 'missile'
    }
  };

  var PALETTES = [
    { name: 'indigo void', top: '#05060c', mid: '#161229', bottom: '#03030a', bandDark: '#10101f', bandLight: '#181830', rail: '#5dd9e8', glow: 'rgba(93,217,232,0.3)', nebula: 'rgba(93,120,232,0.10)' },
    { name: 'crimson nebula', top: '#0e0508', mid: '#2a0f1d', bottom: '#05030a', bandDark: '#1e0a15', bandLight: '#2c1020', rail: '#ff8c3d', glow: 'rgba(255,140,61,0.3)', nebula: 'rgba(232,93,120,0.10)' },
    { name: 'emerald drift', top: '#03100a', mid: '#0d2c20', bottom: '#020a06', bandDark: '#082118', bandLight: '#0f3325', rail: '#5dffb0', glow: 'rgba(93,255,176,0.32)', nebula: 'rgba(93,232,160,0.09)' },
    { name: 'amber dust', top: '#120c04', mid: '#2c1f0a', bottom: '#080502', bandDark: '#1f1607', bandLight: '#30210c', rail: '#ffd166', glow: 'rgba(255,209,102,0.3)', nebula: 'rgba(232,180,93,0.09)' },
    { name: 'violet storm', top: '#0c0612', mid: '#28102e', bottom: '#06030a', bandDark: '#1c0a20', bandLight: '#2c1132', rail: '#ff4d5e', glow: 'rgba(255,77,94,0.32)', nebula: 'rgba(180,93,232,0.10)' }
  ];

  // Boss archetypes — each appears every BOSS_EVERY sectors, cycling through
  // this list (so boss #5 repeats archetype #1 at higher hp/difficulty).
  // Each has a distinct movement pattern and firing pattern so fights feel
  // different from each other, not just "same enemy, more health."
  var BOSS_DEFS = [
    {
      key: 'hulk', name: 'Render Hulk', tagline: 'a slow, armored bulk-freighter turned raider',
      baseHp: 26, hpPerCycle: 10, radius: 56, color: '#8a3b2e', accent: '#ff8c3d',
      moveType: 'weave', moveSpeed: 0.55, fireType: 'spreadVolley', fireInterval: 1.9, boltSpeed: 0.85
    },
    {
      key: 'striker', name: 'Vanguard Striker', tagline: 'a fast interceptor that hunts your lane',
      baseHp: 18, hpPerCycle: 8, radius: 38, color: '#5a3a8a', accent: '#b9a6e0',
      moveType: 'dart', moveSpeed: 1.6, fireType: 'aimedSingle', fireInterval: 0.55, boltSpeed: 1.15
    },
    {
      key: 'sentinel', name: 'Twin Sentinel', tagline: 'two linked turret pods guarding a shared core',
      baseHp: 30, hpPerCycle: 12, radius: 50, color: '#2e6a6e', accent: '#5dd9e8',
      moveType: 'hold', moveSpeed: 0.3, fireType: 'alternating', fireInterval: 0.8, boltSpeed: 1
    },
    {
      key: 'swarm', name: 'Swarm Mother', tagline: 'a drone carrier that breeds chaos',
      baseHp: 24, hpPerCycle: 9, radius: 48, color: '#6e2e4a', accent: '#ff4d5e',
      moveType: 'drift', moveSpeed: 0.4, fireType: 'trackingBeam', fireInterval: 2.4, boltSpeed: 0.7
    }
  ];

  // ------------------------------------------------------------------------
  // DOM references
  // ------------------------------------------------------------------------
  var dom = {
    canvas: document.getElementById('game'),
    bgstars: document.getElementById('bgstars'),
    livesHud: document.getElementById('livesHud'),
    scoreValue: document.getElementById('scoreValue'),
    bestValue: document.getElementById('bestValue'),
    sectorLabel: document.getElementById('sectorLabel'),
    sectorFill: document.getElementById('sectorFill'),
    comboTag: document.getElementById('comboTag'),
    toast: document.getElementById('toast'),
    muteBtn: document.getElementById('muteBtn'),
    startBtn: document.getElementById('startBtn'),
    resumeBtn: document.getElementById('resumeBtn'),
    retryBtn: document.getElementById('retryBtn'),
    screenStart: document.getElementById('screen-start'),
    screenPause: document.getElementById('screen-pause'),
    screenGameover: document.getElementById('screen-gameover'),
    finalScore: document.getElementById('finalScore'),
    newBestTag: document.getElementById('newBestTag'),
    scoreListStart: document.getElementById('scoreListStart'),
    scoreListEnd: document.getElementById('scoreListEnd'),
    touchLeft: document.getElementById('touchLeft'),
    touchRight: document.getElementById('touchRight'),
    touchFire: document.getElementById('touchFire'),
    touchWeapon: document.getElementById('touchWeapon'),
    weaponBtnDesktop: document.getElementById('weaponBtnDesktop'),
    weaponNameDesktop: document.getElementById('weaponNameDesktop'),
    weaponSelect: document.getElementById('weaponSelect'),
    weaponHeatFill: document.getElementById('weaponHeatFill'),
    bossHud: document.getElementById('bossHud'),
    bossName: document.getElementById('bossName'),
    bossHpFill: document.getElementById('bossHpFill'),
    screenBossIntro: document.getElementById('screen-bossintro'),
    bossIntroName: document.getElementById('bossIntroName'),
    bossIntroTagline: document.getElementById('bossIntroTagline')
  };

  var ctx = setupCanvas(dom.canvas, CFG.W, CFG.H);
  var bgCtx = dom.bgstars ? setupAmbientCanvas(dom.bgstars) : null;

  function setupCanvas(canvas, logicalW, logicalH) {
    var dpr = Math.min((typeof window !== 'undefined' && window.devicePixelRatio) || 1, 2);
    canvas.width = Math.round(logicalW * dpr);
    canvas.height = Math.round(logicalH * dpr);
    var c = canvas.getContext('2d');
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    return c;
  }

  function setupAmbientCanvas(canvas) {
    var dpr = Math.min((typeof window !== 'undefined' && window.devicePixelRatio) || 1, 2);
    var w = (typeof window !== 'undefined' && window.innerWidth) || 480;
    var h = (typeof window !== 'undefined' && window.innerHeight) || 800;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    var c = canvas.getContext('2d');
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx: c, w: w, h: h };
  }

  function resizeAmbient() {
    if (!dom.bgstars) return;
    bgCtx = setupAmbientCanvas(dom.bgstars);
  }
  if (typeof window !== 'undefined') {
    var resizeTimer = null;
    window.addEventListener('resize', function () {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resizeAmbient, 120);
    });
  }

  // ------------------------------------------------------------------------
  // Persistence
  // ------------------------------------------------------------------------
  var Storage = {
    KEY_BEST: 'cosmodrome_best_v1',
    KEY_SCORES: 'cosmodrome_scores_v1',
    KEY_MUTE: 'cosmodrome_mute_v1',
    KEY_WEAPON: 'cosmodrome_weapon_v1',

    getBest: function () {
      try { return parseInt(localStorage.getItem(this.KEY_BEST), 10) || 0; } catch (e) { return 0; }
    },
    setBest: function (v) {
      try { localStorage.setItem(this.KEY_BEST, String(Math.round(v))); } catch (e) { /* ignore */ }
    },
    getScores: function () {
      try {
        var raw = localStorage.getItem(this.KEY_SCORES);
        var arr = raw ? JSON.parse(raw) : [];
        return Array.isArray(arr) ? arr : [];
      } catch (e) { return []; }
    },
    addScore: function (score) {
      var list = this.getScores();
      list.push(Math.round(score));
      list.sort(function (a, b) { return b - a; });
      list = list.slice(0, 5);
      try { localStorage.setItem(this.KEY_SCORES, JSON.stringify(list)); } catch (e) { /* ignore */ }
      return list;
    },
    getMute: function () {
      try { return localStorage.getItem(this.KEY_MUTE) === '1'; } catch (e) { return false; }
    },
    setMute: function (v) {
      try { localStorage.setItem(this.KEY_MUTE, v ? '1' : '0'); } catch (e) { /* ignore */ }
    },
    getWeapon: function () {
      try {
        var w = localStorage.getItem(this.KEY_WEAPON);
        return WEAPONS[w] ? w : 'laser';
      } catch (e) { return 'laser'; }
    },
    setWeapon: function (w) {
      try { localStorage.setItem(this.KEY_WEAPON, w); } catch (e) { /* ignore */ }
    }
  };

  // ------------------------------------------------------------------------
  // Audio — tiny synthesized chiptune sound effects, no external files.
  // ------------------------------------------------------------------------
  var Audio = (function () {
    var ctxA = null;
    var muted = Storage.getMute();

    function ensure() {
      if (ctxA) return ctxA;
      var AC = (typeof window !== 'undefined') && (window.AudioContext || window.webkitAudioContext);
      if (!AC) return null;
      ctxA = new AC();
      return ctxA;
    }

    function tone(freq, dur, type, vol, glideTo) {
      if (muted) return;
      var ac = ensure();
      if (!ac) return;
      try {
        var osc = ac.createOscillator();
        var gain = ac.createGain();
        osc.type = type || 'square';
        osc.frequency.setValueAtTime(freq, ac.currentTime);
        if (glideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, glideTo), ac.currentTime + dur);
        gain.gain.setValueAtTime(vol || 0.12, ac.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
        osc.connect(gain);
        gain.connect(ac.destination);
        osc.start();
        osc.stop(ac.currentTime + dur + 0.02);
      } catch (e) { /* ignore audio errors */ }
    }

    function noiseBurst(dur, vol) {
      if (muted) return;
      var ac = ensure();
      if (!ac) return;
      try {
        var bufferSize = Math.floor(ac.sampleRate * dur);
        var buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
        var data = buffer.getChannelData(0);
        for (var i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        var src = ac.createBufferSource();
        src.buffer = buffer;
        var gain = ac.createGain();
        gain.gain.setValueAtTime(vol || 0.12, ac.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
        src.connect(gain);
        gain.connect(ac.destination);
        src.start();
      } catch (e) { /* ignore */ }
    }

    return {
      resume: function () { var ac = ensure(); if (ac && ac.state === 'suspended' && ac.resume) ac.resume(); },
      setMuted: function (v) { muted = v; Storage.setMute(v); },
      isMuted: function () { return muted; },
      sfxSkip: function () { tone(880, 0.09, 'triangle', 0.13, 1320); },
      sfxPass: function () { tone(520, 0.04, 'square', 0.05); },
      sfxGraze: function () { tone(180, 0.12, 'sawtooth', 0.1, 90); },
      sfxHit: function () { tone(160, 0.28, 'sawtooth', 0.16, 40); },
      sfxLife: function () {
        tone(523, 0.09, 'square', 0.12);
        setTimeout(function () { tone(659, 0.09, 'square', 0.12); }, 90);
        setTimeout(function () { tone(784, 0.14, 'square', 0.12); }, 180);
      },
      sfxSector: function () {
        tone(392, 0.1, 'triangle', 0.12);
        setTimeout(function () { tone(523, 0.1, 'triangle', 0.12); }, 100);
        setTimeout(function () { tone(659, 0.18, 'triangle', 0.13); }, 200);
      },
      sfxGameOver: function () { tone(220, 0.4, 'sawtooth', 0.15, 60); },
      sfxLaunch: function () { tone(330, 0.12, 'square', 0.1, 660); },
      sfxFireLaser: function () { tone(1100, 0.05, 'square', 0.05, 700); },
      sfxFireCannon: function () { tone(700, 0.06, 'sawtooth', 0.06, 380); },
      sfxFireMissile: function () { tone(220, 0.1, 'sawtooth', 0.09, 140); },
      sfxExplodeSmall: function () { noiseBurst(0.12, 0.1); tone(140, 0.1, 'square', 0.06, 50); },
      sfxExplodeBig: function () { noiseBurst(0.22, 0.16); tone(110, 0.18, 'sawtooth', 0.1, 35); }
    };
  })();

  // ------------------------------------------------------------------------
  // Game state
  // ------------------------------------------------------------------------
  var STATE = { START: 'start', PLAYING: 'playing', BOSSINTRO: 'bossintro', BOSS: 'boss', PAUSED: 'paused', GAMEOVER: 'gameover' };
  var state = STATE.START;

  var player = {
    lane: 0, vel: 0, bank: 0, invuln: 0, boosting: 0, hopCooldown: 0, lives: CFG.START_LIVES,
    weapon: Storage.getWeapon(), heat: 0, fireTimer: 0
  };

  var world = {
    t: 0,
    distance: 0,
    curveCur: 0,
    curveTarget: 0,
    curveTimer: 1.5,
    sector: 0,
    sectorProgress: 0,
    sectorQuota: P.sectorQuota(0, CFG.SECTOR_BASE, CFG.SECTOR_GROWTH),
    spawnTimer: 1.0,
    speedPenalty: 1,
    inputMul: 1,
    score: 0,
    combo: 1,
    comboTimer: 0,
    shake: 0,
    paletteIndex: 0,
    nextLifeScore: CFG.EXTRA_LIFE_SCORE,
    rotAccum: 0,
    bossCycle: 0,
    bossIntroTimer: 0
  };

  var input = { left: false, right: false, thrust: false, brake: false, fireHeld: false };

  // Active boss instance, null when no boss fight is underway.
  var boss = null;

  function makeObstaclePool(n) {
    var arr = [];
    for (var i = 0; i < n; i++) {
      arr.push({
        active: false, type: 'asteroid', z: 0, lane: 0, baseLane: 0, phase: 0,
        resolved: false, scale: 0, screenX: 0, screenY: 0, hp: 1, maxHp: 1,
        flashTimer: 0, destroyed: false
      });
    }
    return arr;
  }
  function makeParticlePool(n) {
    var arr = [];
    for (var i = 0; i < n; i++) {
      arr.push({ active: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 1, color: '#fff', size: 2 });
    }
    return arr;
  }
  function makeBoltPool(n) {
    var arr = [];
    for (var i = 0; i < n; i++) {
      arr.push({ active: false, lane: 0, z: 0, vz: 0, weaponKey: 'laser', target: null, life: 3 });
    }
    return arr;
  }
  // Enemy bolts travel toward the player (z decreasing toward 0), the
  // mirror image of the player's own bolts. Kept in a separate pool so
  // player-fire collision checks never accidentally hit the player and
  // vice versa.
  function makeEnemyBoltPool(n) {
    var arr = [];
    for (var i = 0; i < n; i++) {
      arr.push({ active: false, lane: 0, z: 0, vz: 0, life: 4, kind: 'bolt', color: '#ff4d5e', dmgLife: false });
    }
    return arr;
  }

  var obstacles = makeObstaclePool(CFG.POOL_SIZE);
  var particles = makeParticlePool(CFG.PARTICLE_POOL);
  var bolts = makeBoltPool(CFG.BOLT_POOL);
  var enemyBolts = makeEnemyBoltPool(16);

  // Ambient starfield (in-game corridor) — three depth layers.
  function makeStars(n) {
    var arr = [];
    for (var i = 0; i < n; i++) {
      arr.push({ x: Math.random() * CFG.W, y: CFG.HORIZON_Y - Math.random() * 40, layer: 1 + Math.floor(Math.random() * 3), seed: Math.random() * 10 });
    }
    return arr;
  }
  var stars = makeStars(70);

  // Distant nebula clouds + planet drifting slowly behind the horizon glow.
  function makeNebulae(n) {
    var arr = [];
    for (var i = 0; i < n; i++) {
      arr.push({
        x: Math.random() * CFG.W,
        y: 30 + Math.random() * (CFG.HORIZON_Y - 40),
        r: 60 + Math.random() * 90,
        seed: Math.random() * 10,
        driftX: (Math.random() - 0.5) * 4
      });
    }
    return arr;
  }
  var nebulae = makeNebulae(3);
  var distantPlanet = { x: CFG.W * 0.78, y: 70, r: 46, hue: 0 };

  // ------------------------------------------------------------------------
  // Reset / lifecycle
  // ------------------------------------------------------------------------
  function resetWorld() {
    player.lane = 0; player.vel = 0; player.bank = 0; player.invuln = 0; player.boosting = 0; player.hopCooldown = 0;
    player.lives = CFG.START_LIVES;
    player.heat = 0; player.fireTimer = 0;

    world.t = 0; world.distance = 0;
    world.curveCur = 0; world.curveTarget = 0; world.curveTimer = 1.5;
    world.sector = 0; world.sectorProgress = 0;
    world.sectorQuota = P.sectorQuota(0, CFG.SECTOR_BASE, CFG.SECTOR_GROWTH);
    world.spawnTimer = 1.0;
    world.speedPenalty = 1; world.inputMul = 1;
    world.score = 0; world.combo = 1; world.comboTimer = 0;
    world.shake = 0; world.paletteIndex = 0;
    world.nextLifeScore = CFG.EXTRA_LIFE_SCORE;
    world.rotAccum = 0;
    world.bossCycle = 0;
    world.bossIntroTimer = 0;
    boss = null;

    for (var i = 0; i < obstacles.length; i++) obstacles[i].active = false;
    for (var j = 0; j < particles.length; j++) particles[j].active = false;
    for (var k = 0; k < bolts.length; k++) bolts[k].active = false;
    for (var m = 0; m < enemyBolts.length; m++) enemyBolts[m].active = false;

    syncLivesHud();
    syncScoreHud();
    syncSectorHud();
    syncWeaponHud();
    syncBossHud();
  }

  function startGame() {
    Audio.resume();
    Audio.sfxLaunch();
    resetWorld();
    state = STATE.PLAYING;
    setOverlay(null);
  }

  var statePrePause = STATE.PLAYING;
  function togglePause() {
    if (state === STATE.PLAYING || state === STATE.BOSS || state === STATE.BOSSINTRO) {
      statePrePause = state;
      state = STATE.PAUSED;
      setOverlay('pause');
    } else if (state === STATE.PAUSED) {
      state = statePrePause;
      setOverlay(null);
    }
  }

  function gameOver() {
    state = STATE.GAMEOVER;
    Audio.sfxGameOver();
    var best = Storage.getBest();
    var isNew = world.score > best;
    if (isNew) Storage.setBest(world.score);
    var list = Storage.addScore(world.score);
    dom.finalScore.textContent = Math.round(world.score).toLocaleString();
    dom.newBestTag.classList.toggle('hidden', !isNew);
    renderScoreList(dom.scoreListEnd, list);
    syncScoreHud();
    setOverlay('gameover');
  }

  function setOverlay(which) {
    dom.screenStart.classList.toggle('hidden', which !== 'start' && state !== STATE.START);
    dom.screenPause.classList.toggle('hidden', which !== 'pause');
    dom.screenGameover.classList.toggle('hidden', which !== 'gameover');
    dom.screenBossIntro.classList.toggle('hidden', which !== 'bossintro');
    if (state === STATE.START) dom.screenStart.classList.remove('hidden');
  }

  // ------------------------------------------------------------------------
  // Spawning
  // ------------------------------------------------------------------------
  var HP_BY_TYPE = { asteroid: 2, stone: 1, scout: 2, wreck: 3 };

  function typeWeights(sector) {
    var w = { asteroid: 5, stone: 4, scout: 0, wreck: 0 };
    if (sector >= 1) w.scout = 2;
    if (sector >= 2) w.scout = 3;
    if (sector >= 3) w.wreck = 2;
    if (sector >= 4) { w.asteroid = 4; w.wreck = 3; w.scout = 4; }
    return w;
  }

  function pickType(weights) {
    var total = weights.asteroid + weights.stone + weights.scout + weights.wreck;
    var r = Math.random() * total;
    if ((r -= weights.asteroid) < 0) return 'asteroid';
    if ((r -= weights.stone) < 0) return 'stone';
    if ((r -= weights.scout) < 0) return 'scout';
    return 'wreck';
  }

  function freeObstacleSlot() {
    for (var i = 0; i < obstacles.length; i++) if (!obstacles[i].active) return obstacles[i];
    return null;
  }

  function spawnObstacle() {
    var slot = freeObstacleSlot();
    if (!slot) return;
    var lane = P.pickSpawnLane(Math.random, 0.82);
    var type = pickType(typeWeights(world.sector));
    slot.active = true;
    slot.resolved = false;
    slot.destroyed = false;
    slot.type = type;
    slot.z = CFG.Z_SPAWN;
    slot.lane = lane;
    slot.baseLane = lane;
    slot.phase = Math.random() * Math.PI * 2;
    slot.scale = 0.02;
    slot.maxHp = HP_BY_TYPE[type] || 1;
    slot.hp = slot.maxHp;
    slot.flashTimer = 0;
  }

  // ------------------------------------------------------------------------
  // Particles
  // ------------------------------------------------------------------------
  function freeParticleSlot() {
    for (var i = 0; i < particles.length; i++) if (!particles[i].active) return particles[i];
    return null;
  }
  function burst(x, y, color, count, speed, life) {
    for (var i = 0; i < count; i++) {
      var p = freeParticleSlot();
      if (!p) return;
      var ang = Math.random() * Math.PI * 2;
      var sp = speed * (0.4 + Math.random() * 0.6);
      p.active = true;
      p.x = x; p.y = y;
      p.vx = Math.cos(ang) * sp;
      p.vy = Math.sin(ang) * sp;
      p.life = p.maxLife = life * (0.7 + Math.random() * 0.6);
      p.color = color;
      p.size = 1.5 + Math.random() * 2.2;
    }
  }

  // ------------------------------------------------------------------------
  // Weapons / firing
  // ------------------------------------------------------------------------
  function freeBoltSlot() {
    for (var i = 0; i < bolts.length; i++) if (!bolts[i].active) return bolts[i];
    return null;
  }

  function findMissileTarget() {
    var best = null, bestZ = Infinity;
    for (var i = 0; i < obstacles.length; i++) {
      var o = obstacles[i];
      if (!o.active || o.destroyed || o.type === 'stone') continue;
      if (o.z > 0 && o.z < bestZ) { bestZ = o.z; best = o; }
    }
    return best;
  }

  function fireWeapon() {
    var def = WEAPONS[player.weapon];
    if (!def) return;
    var lanes = [];
    if (def.bolts === 1) lanes = [player.lane];
    else if (def.bolts === 2) lanes = [player.lane - 0.07, player.lane + 0.07];
    else lanes = [player.lane - def.spread, player.lane, player.lane + def.spread];

    for (var i = 0; i < lanes.length; i++) {
      var slot = freeBoltSlot();
      if (!slot) break;
      slot.active = true;
      slot.lane = P.clampLane(lanes[i]);
      slot.z = 4;
      slot.vz = def.speed;
      slot.weaponKey = player.weapon;
      slot.life = 2.2;
      slot.target = (def.kind === 'missile') ? findMissileTarget() : null;
    }

    player.heat = Math.min(1, player.heat + def.heatPerShot);
    if (player.weapon === 'missile') Audio.sfxFireMissile();
    else if (player.weapon === 'laser') Audio.sfxFireLaser();
    else Audio.sfxFireCannon();
  }

  function updateWeapon(dt) {
    var def = WEAPONS[player.weapon];
    if (!def) return;
    player.fireTimer -= dt;
    // Auto-fire: keeps shooting continuously, throttled by rate + heat.
    if (player.fireTimer <= 0 && player.heat < 1) {
      fireWeapon();
      player.fireTimer = def.rate;
    }
    player.heat = Math.max(0, player.heat - def.cool * dt);
  }

  function updateBolts(dt) {
    for (var i = 0; i < bolts.length; i++) {
      var b = bolts[i];
      if (!b.active) continue;
      b.life -= dt;
      var def = WEAPONS[b.weaponKey] || WEAPONS.laser;

      if (def.kind === 'missile' && b.target && b.target.active && !b.target.destroyed) {
        // Home gently toward target lane.
        var diff = b.target.lane - b.lane;
        b.lane = P.clampLane(b.lane + diff * Math.min(1, dt * 4));
      }

      b.z += b.vz * dt;

      var hitSomething = false;
      for (var j = 0; j < obstacles.length; j++) {
        var o = obstacles[j];
        if (!o.active || o.destroyed || o.type === 'stone') continue;
        if (Math.abs(o.z - b.z) > 70) continue;
        var laneDist = Math.abs(o.lane - b.lane);
        if (laneDist < 0.22) {
          damageObstacle(o, def.dmg, b);
          hitSomething = true;
          break;
        }
      }

      if (hitSomething || b.z > CFG.Z_SPAWN * 1.05 || b.life <= 0) {
        b.active = false;
      }
    }
  }

  function damageObstacle(o, dmg, bolt) {
    o.hp -= dmg;
    o.flashTimer = 0.08;
    burst(o.screenX, o.screenY, WEAPONS[bolt.weaponKey].color, 4, 70, 0.25);
    Audio.sfxExplodeSmall();
    if (o.hp <= 0) destroyObstacle(o);
  }

  function destroyObstacle(o) {
    o.destroyed = true;
    o.resolved = true;
    o.active = false;
    var pts = o.type === 'wreck' ? 60 : (o.type === 'scout' ? 45 : 25);
    world.score += pts;
    Audio.sfxExplodeBig();
    burst(o.screenX, o.screenY, '#ffd166', 18, 150, 0.6);
    burst(o.screenX, o.screenY, '#ff8c3d', 10, 100, 0.45);
    toast(o.type === 'scout' ? 'raider destroyed' : 'target destroyed');
  }

  // ------------------------------------------------------------------------
  // Core update
  // ------------------------------------------------------------------------
  function targetInputMul() {
    if (input.thrust) return 1.16;
    if (input.brake) return 0.74;
    return 1;
  }

  function currentSpeed() {
    var base = P.speedAtTime(world.t, CFG.MIN_SPEED, CFG.MAX_SPEED, CFG.SPEED_TAU) + world.sector * CFG.SECTOR_SPEED_BUMP;
    return base * world.inputMul * world.speedPenalty;
  }

  function updateIdle(dt) {
    // Ambient motion behind the start/pause/gameover screens so the void feels alive.
    world.curveTimer -= dt;
    if (world.curveTimer <= 0) {
      world.curveTarget = (Math.random() * 2 - 1) * 0.5;
      world.curveTimer = CFG.CURVE_MIN_HOLD + Math.random() * (CFG.CURVE_MAX_HOLD - CFG.CURVE_MIN_HOLD);
    }
    world.curveCur = P.updateCurveOffset(world.curveCur, world.curveTarget, dt, CFG.CURVE_SMOOTH);
    world.distance += CFG.IDLE_SPEED * dt;
    updateStars(dt, CFG.IDLE_SPEED);
    world.rotAccum += dt * 0.4;
  }

  function update(dt) {
    if (state === STATE.BOSSINTRO) { updateBossIntro(dt); return; }
    if (state === STATE.BOSS) { updateBossFight(dt); return; }
    if (state !== STATE.PLAYING) {
      updateIdle(dt);
      return;
    }

    world.t += dt;
    world.inputMul = P.approach(world.inputMul, targetInputMul(), dt, 3.2);
    world.speedPenalty = P.approach(world.speedPenalty, 1, dt, 1.1);

    var speed = currentSpeed();
    world.distance += speed * dt;
    world.score += speed * dt * 0.035;
    world.rotAccum += dt * (0.4 + speed / CFG.MAX_SPEED);

    // curve generator
    world.curveTimer -= dt;
    if (world.curveTimer <= 0) {
      world.curveTarget = (Math.random() < CFG.CURVE_STRAIGHT_CHANCE) ? 0 : (Math.random() * 2 - 1) * (0.55 + Math.random() * 0.45);
      world.curveTimer = CFG.CURVE_MIN_HOLD + Math.random() * (CFG.CURVE_MAX_HOLD - CFG.CURVE_MIN_HOLD);
    }
    world.curveCur = P.updateCurveOffset(world.curveCur, world.curveTarget, dt, CFG.CURVE_SMOOTH);

    updatePlayer(dt, speed);
    updateWeapon(dt);
    updateBolts(dt);
    updateObstacles(dt, speed);
    updateParticles(dt);
    updateSpawner(dt);
    updateStars(dt, speed);

    if (player.invuln > 0) player.invuln = Math.max(0, player.invuln - dt);
    if (player.boosting > 0) player.boosting = Math.max(0, player.boosting - dt);
    if (player.hopCooldown > 0) player.hopCooldown = Math.max(0, player.hopCooldown - dt);
    world.shake = Math.max(0, world.shake - dt * 38);
    if (world.comboTimer > 0) { world.comboTimer -= dt; if (world.comboTimer <= 0) world.combo = 1; }

    maybeAwardExtraLife();
  }

  function updatePlayer(dt, speed) {
    // Direct accel/decel steering model: input feels immediate, ramps
    // smoothly to max turn speed, and lets go cleanly with no exponential
    // lag (see physics.steerVelocity). Curve drift then nudges the ship
    // sideways like centrifugal force on a bend, on top of player input.
    var dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    player.vel = P.steerVelocity(dir, player.vel, dt, CFG.STEER_ACCEL, CFG.STEER_DECEL, CFG.STEER_MAXSPEED);
    var drift = world.curveCur * CFG.CENTRIFUGAL * (speed / CFG.MAX_SPEED);
    player.lane += (player.vel + drift) * dt;

    if (player.lane > 1) {
      player.lane = 1;
      // Only kill velocity outright if still pressing into the wall — a
      // small reversed "bounce" used to be applied here, but with input
      // still held the next frame's acceleration instantly overpowered
      // the bounce and slammed the ship back into the wall, repeating
      // every frame. That produced the "stuck at the edge" bug. Zeroing
      // (rather than reversing) lets the player escape the instant they
      // ease off or reverse the stick, with no fight against themselves.
      player.vel = dir > 0 ? 0 : player.vel;
      world.speedPenalty = Math.min(world.speedPenalty, 0.92);
    }
    if (player.lane < -1) {
      player.lane = -1;
      player.vel = dir < 0 ? 0 : player.vel;
      world.speedPenalty = Math.min(world.speedPenalty, 0.92);
    }
    player.lane = P.clampLane(player.lane);
    player.bank = P.approach(player.bank, P.clamp(player.vel * 0.3, -1, 1), dt, 10);
  }

  function playerScreenX() {
    return P.laneToX(player.lane, CFG.W / 2, CFG.ROAD_HALF_NEAR, world.curveCur, 1, CFG.CURVE_AMP);
  }

  var VISUAL_RADIUS = { asteroid: 32, stone: 13, scout: 23, wreck: 44 };

  function updateObstacles(dt, speed) {
    for (var i = 0; i < obstacles.length; i++) {
      var o = obstacles[i];
      if (!o.active) continue;
      o.z -= speed * dt;
      if (o.flashTimer > 0) o.flashTimer = Math.max(0, o.flashTimer - dt);

      if (o.type === 'scout') {
        o.lane = P.clampLane(o.baseLane + Math.sin(world.t * 1.5 + o.phase) * 0.34);
      }

      var scale = P.projectScale(Math.max(o.z, 0), CFG.FOCAL);
      o.scale = scale;
      o.screenX = P.laneToX(o.lane, CFG.W / 2, CFG.ROAD_HALF_NEAR, world.curveCur, scale, CFG.CURVE_AMP);
      o.screenY = CFG.HORIZON_Y + scale * (CFG.PLANE_Y - CFG.HORIZON_Y);

      if (!o.resolved && o.z <= CFG.COLLIDE_Z) {
        var px = playerScreenX();
        var obstacleRadius = VISUAL_RADIUS[o.type] * Math.max(scale, 0.2);
        var playerRadius = 15;
        var dist = Math.abs(o.screenX - px);
        var hit = dist < (playerRadius + obstacleRadius) * 0.76;
        if (hit) {
          resolveHit(o);
        } else if (o.z <= CFG.PASS_Z) {
          resolvePass(o);
        }
      }

      if (o.z < CFG.DESPAWN_Z) o.active = false;
    }
  }

  function resolveHit(o) {
    o.resolved = true;
    if (o.type === 'stone') {
      if (player.boosting > 0) skipStone(o); else grazeStone(o);
      return;
    }
    if (player.invuln > 0) {
      // lenient pass-through while shields are still flickering from the last hit
      world.sectorProgress++;
      world.score += 10;
      checkSectorComplete();
      return;
    }
    loseLife(o);
  }

  function resolvePass(o) {
    o.resolved = true;
    world.sectorProgress++;
    world.score += 15;
    Audio.sfxPass();
    checkSectorComplete();
  }

  function skipStone(o) {
    world.combo = Math.min(5, world.combo + 1);
    world.comboTimer = 2.2;
    world.score += 40 * world.combo;
    world.sectorProgress++;
    Audio.sfxSkip();
    showCombo();
    burst(o.screenX, o.screenY, '#5dffb0', 10, 90, 0.5);
    checkSectorComplete();
  }

  function grazeStone(o) {
    world.combo = 1;
    world.speedPenalty = Math.min(world.speedPenalty, 0.88);
    Audio.sfxGraze();
    burst(o.screenX, o.screenY, '#9b9484', 6, 60, 0.4);
  }

  function loseLife(o) {
    player.lives = Math.max(0, player.lives - 1);
    world.combo = 1;
    syncLivesHud();
    burst(o.screenX, o.screenY, '#ff4d5e', 16, 140, 0.6);
    world.shake = 16;
    Audio.sfxHit();
    if (player.lives <= 0) {
      gameOver();
      return;
    }
    player.invuln = CFG.INVULN_TIME;
    world.speedPenalty = 0.55;
    toast('hull breach');
  }

  function checkSectorComplete() {
    syncSectorHud();
    if (world.sectorProgress >= world.sectorQuota) {
      world.sector++;
      world.sectorProgress = 0;
      world.sectorQuota = P.sectorQuota(world.sector, CFG.SECTOR_BASE, CFG.SECTOR_GROWTH);
      world.score += 250;
      world.speedPenalty = Math.min(world.speedPenalty, 0.82);
      world.paletteIndex = world.sector % PALETTES.length;
      Audio.sfxSector();

      if (world.sector > 0 && world.sector % CFG.BOSS_EVERY === 0) {
        toast('sector ' + (world.sector + 1) + ' clear');
        syncSectorHud();
        startBossIntro();
        return;
      }

      toast('sector ' + (world.sector + 1) + ' clear');
      syncSectorHud();
    }
  }

  // --------------------------------------------------------------------
  // Boss fights — triggered every CFG.BOSS_EVERY sectors. Normal obstacle
  // spawning is suspended for the duration; the boss occupies a fixed
  // depth in front of the player and must be destroyed with the player's
  // own weapon before sector progression resumes.
  // --------------------------------------------------------------------
  function startBossIntro() {
    state = STATE.BOSSINTRO;
    var def = BOSS_DEFS[world.bossCycle % BOSS_DEFS.length];
    world.bossIntroTimer = CFG.BOSS_INTRO_TIME;
    dom.bossIntroName.textContent = def.name;
    dom.bossIntroTagline.textContent = def.tagline;
    setOverlay('bossintro');
    Audio.sfxSector();
  }

  function spawnBoss() {
    var def = BOSS_DEFS[world.bossCycle % BOSS_DEFS.length];
    var cycleNum = Math.floor(world.bossCycle / BOSS_DEFS.length);
    var hp = def.baseHp + cycleNum * def.hpPerCycle;
    boss = {
      def: def,
      hp: hp,
      maxHp: hp,
      lane: 0,
      z: CFG.Z_SPAWN * 0.6,
      entryTimer: CFG.BOSS_ENTRY_TIME,
      phase: 0,
      fireTimer: 1.0,
      podLeftHp: Math.ceil(hp * 0.35),
      podRightHp: Math.ceil(hp * 0.35),
      coreOpen: false,
      addsSpawned: 0,
      defeated: false,
      flashTimer: 0,
      screenX: CFG.W / 2,
      screenY: CFG.HORIZON_Y + 40,
      scale: 0.3
    };
    state = STATE.BOSS;
    setOverlay(null);
    syncBossHud();
    dom.bossHud.classList.remove('hidden');
  }

  function syncBossHud() {
    if (!dom.bossHud) return;
    if (!boss) { dom.bossHud.classList.add('hidden'); return; }
    dom.bossHud.classList.remove('hidden');
    dom.bossName.textContent = boss.def.name.toLowerCase();
    var pct = boss.maxHp > 0 ? P.clamp(boss.hp / boss.maxHp, 0, 1) : 0;
    dom.bossHpFill.style.width = (pct * 100).toFixed(1) + '%';
  }

  function damageBoss(dmg, hitX, hitY) {
    if (!boss || boss.defeated) return;
    boss.hp = Math.max(0, boss.hp - dmg);
    boss.flashTimer = 0.08;
    burst(hitX, hitY, '#ffd166', 5, 90, 0.3);
    Audio.sfxExplodeSmall();
    syncBossHud();
    if (boss.hp <= 0) defeatBoss();
  }

  function defeatBoss() {
    boss.defeated = true;
    Audio.sfxExplodeBig();
    burst(boss.screenX, boss.screenY, '#ffd166', 30, 200, 0.9);
    burst(boss.screenX, boss.screenY, '#ff8c3d', 20, 150, 0.7);
    burst(boss.screenX, boss.screenY, '#ff4d5e', 16, 120, 0.6);
    world.score += CFG.BOSS_DEFEAT_SCORE;
    world.bossCycle++;
    world.shake = 26;
    toast(boss.def.name + ' destroyed');
    dom.bossHud.classList.add('hidden');
    boss = null;
    state = STATE.PLAYING;
    world.speedPenalty = Math.min(world.speedPenalty, 0.9);
    syncBossHud();
  }

  function updateBossIntro(dt) {
    updateIdle(dt);
    world.bossIntroTimer -= dt;
    if (world.bossIntroTimer <= 0) spawnBoss();
  }

  // Movement patterns, one per archetype, applied each frame while the
  // boss is alive. Returns the boss's lane for this frame.
  function bossMove(dt) {
    var def = boss.def;
    boss.phase += dt;
    switch (def.moveType) {
      case 'weave':
        boss.lane = Math.sin(boss.phase * def.moveSpeed) * 0.6;
        break;
      case 'dart':
        // Sharp, sudden lane changes rather than a smooth curve — reads
        // as an aggressive, erratic interceptor.
        if (Math.floor(boss.phase * def.moveSpeed) !== Math.floor((boss.phase - dt) * def.moveSpeed)) {
          boss._dartTarget = (Math.random() * 2 - 1) * 0.8;
        }
        boss._dartTarget = boss._dartTarget || 0;
        boss.lane = P.approach(boss.lane, boss._dartTarget, dt, 5);
        break;
      case 'hold':
        boss.lane = Math.sin(boss.phase * def.moveSpeed) * 0.15;
        break;
      case 'drift':
        boss.lane = Math.sin(boss.phase * def.moveSpeed) * 0.45;
        break;
      default:
        boss.lane = 0;
    }
    boss.lane = P.clampLane(boss.lane);
  }

  function freeEnemyBoltSlot() {
    for (var i = 0; i < enemyBolts.length; i++) if (!enemyBolts[i].active) return enemyBolts[i];
    return null;
  }

  function fireEnemyBolt(lane, speedMul, color) {
    var slot = freeEnemyBoltSlot();
    if (!slot) return;
    slot.active = true;
    slot.lane = P.clampLane(lane);
    slot.z = CFG.BOSS_Z;
    slot.vz = -CFG.BOSS_BOLT_SPEED * (speedMul || 1);
    slot.life = 4;
    slot.color = color || boss.def.accent;
  }

  // Firing patterns, one per archetype.
  function bossFire(dt) {
    var def = boss.def;
    boss.fireTimer -= dt;
    if (boss.fireTimer > 0) return;
    boss.fireTimer = def.fireInterval;

    switch (def.fireType) {
      case 'spreadVolley':
        fireEnemyBolt(boss.lane - 0.4, def.boltSpeed);
        fireEnemyBolt(boss.lane, def.boltSpeed);
        fireEnemyBolt(boss.lane + 0.4, def.boltSpeed);
        Audio.sfxFireCannon();
        break;
      case 'aimedSingle': {
        // Leads the player's current lane slightly based on their velocity
        // so it reads as "aiming," not just firing straight down its nose.
        var lead = P.clamp(boss.lane + (player.lane - boss.lane) * 0.7 + player.vel * 0.12, -1, 1);
        fireEnemyBolt(lead, def.boltSpeed);
        Audio.sfxFireLaser();
        break;
      }
      case 'alternating':
        // Twin Sentinel fires from whichever pod is still alive, alternating;
        // if a pod is destroyed, the other compensates by firing both shots.
        var leftAlive = boss.podLeftHp > 0;
        var rightAlive = boss.podRightHp > 0;
        if (leftAlive) fireEnemyBolt(boss.lane - 0.3, def.boltSpeed);
        if (rightAlive) fireEnemyBolt(boss.lane + 0.3, def.boltSpeed);
        if (!leftAlive && !rightAlive) fireEnemyBolt(boss.lane, def.boltSpeed * 1.2);
        Audio.sfxFireCannon();
        break;
      case 'trackingBeam':
        fireEnemyBolt(player.lane, def.boltSpeed, '#ff4d5e');
        if (boss.addsSpawned < 3 + Math.floor(world.bossCycle / BOSS_DEFS.length)) {
          spawnBossAdd();
          boss.addsSpawned++;
        }
        Audio.sfxFireMissile();
        break;
    }
  }

  // Swarm Mother periodically launches small drone adds that behave like
  // fast scout obstacles — reuses the normal obstacle pool/collision path
  // so they interact with the player's weapons exactly like raiders do.
  function spawnBossAdd() {
    var slot = freeObstacleSlot();
    if (!slot) return;
    slot.active = true; slot.resolved = false; slot.destroyed = false;
    slot.type = 'scout';
    slot.z = CFG.BOSS_Z + 200;
    slot.lane = boss.lane + (Math.random() * 2 - 1) * 0.5;
    slot.baseLane = slot.lane;
    slot.phase = Math.random() * Math.PI * 2;
    slot.scale = 0.1;
    slot.maxHp = 1; slot.hp = 1;
    slot.flashTimer = 0;
  }

  function updateEnemyBolts(dt) {
    for (var i = 0; i < enemyBolts.length; i++) {
      var b = enemyBolts[i];
      if (!b.active) continue;
      b.z -= Math.abs(b.vz) * dt; // vz already negative-bound conceptually; we move z toward 0
      b.life -= dt;

      if (b.z <= CFG.COLLIDE_Z) {
        var scale = P.projectScale(Math.max(b.z, 0), CFG.FOCAL);
        var bx = P.laneToX(b.lane, CFG.W / 2, CFG.ROAD_HALF_NEAR, world.curveCur, scale, CFG.CURVE_AMP);
        var px = playerScreenX();
        if (Math.abs(bx - px) < 30 && player.invuln <= 0) {
          loseLifeFromBoss();
        }
        b.active = false;
        continue;
      }
      if (b.life <= 0 || b.z < CFG.DESPAWN_Z) b.active = false;
    }
  }

  function loseLifeFromBoss() {
    player.lives = Math.max(0, player.lives - 1);
    world.combo = 1;
    syncLivesHud();
    burst(playerScreenX(), CFG.PLANE_Y - 28, '#ff4d5e', 16, 140, 0.6);
    world.shake = 16;
    Audio.sfxHit();
    if (player.lives <= 0) { gameOver(); return; }
    player.invuln = CFG.INVULN_TIME;
    toast('shields hit');
  }

  function updateBossFight(dt) {
    world.t += dt;
    world.rotAccum += dt * 0.5;
    updatePlayer(dt, currentSpeed());
    updateWeapon(dt);
    updateStars(dt, CFG.IDLE_SPEED);

    if (boss.entryTimer > 0) {
      boss.entryTimer -= dt;
      boss.z = P.lerp(CFG.Z_SPAWN * 0.6, CFG.BOSS_Z, 1 - Math.max(0, boss.entryTimer) / CFG.BOSS_ENTRY_TIME);
    } else {
      boss.z = CFG.BOSS_Z;
      bossMove(dt);
      bossFire(dt);
    }

    var scale = P.projectScale(Math.max(boss.z, 0), CFG.FOCAL);
    boss.scale = scale;
    boss.screenX = P.laneToX(boss.lane, CFG.W / 2, CFG.ROAD_HALF_NEAR, world.curveCur, scale, CFG.CURVE_AMP);
    boss.screenY = CFG.HORIZON_Y + scale * (CFG.PLANE_Y - CFG.HORIZON_Y);
    if (boss.flashTimer > 0) boss.flashTimer = Math.max(0, boss.flashTimer - dt);

    updatePlayerBoltsVsBoss(dt);
    updateEnemyBolts(dt);
    updateObstacles(dt, CFG.IDLE_SPEED * 0.6);
    updateParticles(dt);

    if (player.invuln > 0) player.invuln = Math.max(0, player.invuln - dt);
    if (player.boosting > 0) player.boosting = Math.max(0, player.boosting - dt);
    if (player.hopCooldown > 0) player.hopCooldown = Math.max(0, player.hopCooldown - dt);
    world.shake = Math.max(0, world.shake - dt * 38);
  }

  // Player bolts vs boss collision — separate from updateBolts() (which
  // targets normal obstacles) so boss hit-detection can account for the
  // boss's larger fixed-depth hitbox and its two-pod/core structure.
  function updatePlayerBoltsVsBoss(dt) {
    for (var i = 0; i < bolts.length; i++) {
      var b = bolts[i];
      if (!b.active) continue;
      b.z += b.vz * dt;
      b.life -= dt;

      if (boss && !boss.defeated && Math.abs(b.z - boss.z) < 70) {
        var laneDist = Math.abs(boss.lane - b.lane);
        if (laneDist < CFG.BOSS_HIT_RADIUS) {
          var def = WEAPONS[b.weaponKey] || WEAPONS.laser;
          applyBossDamage(def.dmg, b.lane, boss.screenX, boss.screenY);
          b.active = false;
          continue;
        }
      }
      if (b.z > CFG.Z_SPAWN * 1.05 || b.life <= 0) b.active = false;
    }
  }

  // Twin Sentinel splits incoming damage between whichever pod the shot's
  // lane is closer to until both pods are down, then damages the shared
  // core directly — giving that fight a distinct "destroy the parts first"
  // structure instead of a flat health pool.
  function applyBossDamage(dmg, hitLane, hx, hy) {
    if (boss.def.key === 'sentinel' && (boss.podLeftHp > 0 || boss.podRightHp > 0)) {
      if (hitLane <= boss.lane && boss.podLeftHp > 0) {
        boss.podLeftHp = Math.max(0, boss.podLeftHp - dmg);
      } else if (boss.podRightHp > 0) {
        boss.podRightHp = Math.max(0, boss.podRightHp - dmg);
      } else if (boss.podLeftHp > 0) {
        boss.podLeftHp = Math.max(0, boss.podLeftHp - dmg);
      }
      damageBoss(dmg, hx, hy);
      return;
    }
    damageBoss(dmg, hx, hy);
  }

  function maybeAwardExtraLife() {
    if (world.score >= world.nextLifeScore && player.lives < CFG.MAX_LIVES) {
      player.lives++;
      world.nextLifeScore += CFG.EXTRA_LIFE_SCORE;
      syncLivesHud();
      Audio.sfxLife();
      toast('extra ship earned');
    }
  }

  function updateSpawner(dt) {
    world.spawnTimer -= dt;
    if (world.spawnTimer <= 0) {
      spawnObstacle();
      var interval = P.spawnInterval(world.t, CFG.SPAWN_SLOW, CFG.SPAWN_FAST, CFG.SPAWN_RAMP);
      interval *= 0.85 + Math.random() * 0.3;
      world.spawnTimer = interval;
    }
  }

  function updateParticles(dt) {
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      if (!p.active) continue;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.92; p.vy *= 0.92;
      p.life -= dt;
      if (p.life <= 0) p.active = false;
    }
  }

  function updateStars(dt, speed) {
    var speedFactor = speed / CFG.MAX_SPEED;
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      s.y += (20 + s.layer * 60) * speedFactor * dt + s.layer * 8 * dt;
      if (s.y > CFG.H + 10) {
        s.y = CFG.HORIZON_Y - Math.random() * 30;
        s.x = Math.random() * CFG.W;
      }
    }
    for (var j = 0; j < nebulae.length; j++) {
      var neb = nebulae[j];
      neb.x += neb.driftX * dt;
      if (neb.x < -neb.r) neb.x = CFG.W + neb.r;
      if (neb.x > CFG.W + neb.r) neb.x = -neb.r;
    }
  }

  // ------------------------------------------------------------------------
  // Rendering
  // ------------------------------------------------------------------------
  function palette() { return PALETTES[world.paletteIndex % PALETTES.length]; }

  function render() {
    var pal = palette();
    ctx.save();
    if (world.shake > 0) {
      ctx.translate((Math.random() - 0.5) * world.shake, (Math.random() - 0.5) * world.shake);
    }
    drawBackground(pal);
    drawNebulae(pal);
    drawStars(pal);
    drawCorridor(pal);
    drawObstacles();
    drawBoss();
    drawBolts();
    drawEnemyBolts();
    drawPlayer();
    drawParticles();
    ctx.restore();
  }

  function drawBackground(pal) {
    var grad = ctx.createLinearGradient(0, 0, 0, CFG.H);
    grad.addColorStop(0, pal.top);
    grad.addColorStop(0.45, pal.mid);
    grad.addColorStop(1, pal.bottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CFG.W, CFG.H);

    // distant planet, soft terminator shading
    var dp = distantPlanet;
    var pg = ctx.createRadialGradient(dp.x - dp.r * 0.3, dp.y - dp.r * 0.3, dp.r * 0.1, dp.x, dp.y, dp.r);
    pg.addColorStop(0, pal.rail);
    pg.addColorStop(0.55, pal.glow.replace(/[\d.]+\)$/, '0.7)'));
    pg.addColorStop(1, 'rgba(5,6,8,0.95)');
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.arc(dp.x, dp.y, dp.r, 0, Math.PI * 2);
    ctx.fillStyle = pg;
    ctx.fill();
    ctx.restore();

    // horizon glow
    var hg = ctx.createRadialGradient(CFG.W / 2, CFG.HORIZON_Y, 10, CFG.W / 2, CFG.HORIZON_Y, 220);
    hg.addColorStop(0, pal.glow);
    hg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = hg;
    ctx.fillRect(0, 0, CFG.W, CFG.H);
  }

  function drawNebulae(pal) {
    for (var i = 0; i < nebulae.length; i++) {
      var n = nebulae[i];
      var g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
      g.addColorStop(0, pal.nebula);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawStars(pal) {
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var tw = 0.5 + 0.5 * Math.sin(world.t * 2 + s.seed);
      ctx.globalAlpha = 0.25 + tw * 0.5;
      ctx.fillStyle = '#e8ecf2';
      var size = s.layer * 0.7;
      ctx.fillRect(s.x, s.y, size, size);
    }
    ctx.globalAlpha = 1;
  }

  // Smooth, continuous road-band shading. Earlier versions advanced the
  // dark/light phase with Math.floor(distance), which recomputes in hard
  // integer jumps and reads as a mechanical "stutter-step" road. Here the
  // phase is a smooth fractional value and the band boundary itself fades
  // across a soft band rather than snapping, so the corridor flows.
  function drawCorridor(pal) {
    var steps = 28;
    var phase = world.distance * 0.012; // fractional, no floor -> no popping
    var cx = CFG.W / 2;
    var railLeft = [];
    var railRight = [];

    for (var i = steps; i >= 1; i--) {
      var s0 = i / steps;
      var s1 = (i - 1) / steps;
      var scale0 = Math.max(0.035, Math.pow(s0, 1.7));
      var scale1 = Math.max(0.035, Math.pow(s1, 1.7));
      var y0 = CFG.HORIZON_Y + scale0 * (CFG.PLANE_Y - CFG.HORIZON_Y);
      var y1 = CFG.HORIZON_Y + scale1 * (CFG.PLANE_Y - CFG.HORIZON_Y);
      var lx0 = P.laneToX(-1, cx, CFG.ROAD_HALF_NEAR, world.curveCur, scale0, CFG.CURVE_AMP);
      var rx0 = P.laneToX(1, cx, CFG.ROAD_HALF_NEAR, world.curveCur, scale0, CFG.CURVE_AMP);
      var lx1 = P.laneToX(-1, cx, CFG.ROAD_HALF_NEAR, world.curveCur, scale1, CFG.CURVE_AMP);
      var rx1 = P.laneToX(1, cx, CFG.ROAD_HALF_NEAR, world.curveCur, scale1, CFG.CURVE_AMP);

      // Smooth triangle wave between dark/light instead of a hard parity flip.
      var wave = 0.5 + 0.5 * Math.sin((i + phase) * Math.PI);
      ctx.fillStyle = mixColor(pal.bandDark, pal.bandLight, wave);
      ctx.beginPath();
      ctx.moveTo(lx0, y0);
      ctx.lineTo(rx0, y0);
      ctx.lineTo(rx1, y1);
      ctx.lineTo(lx1, y1);
      ctx.closePath();
      ctx.fill();

      if (i === steps) { railLeft.push([lx0, y0]); railRight.push([rx0, y0]); }
      railLeft.push([lx1, y1]);
      railRight.push([rx1, y1]);
    }

    drawRail(railLeft, pal.rail);
    drawRail(railRight, pal.rail);
  }

  // Cache hex->rgb parses since palette colors are fixed strings reused every frame.
  var colorCache = {};
  function hexToRgb(hex) {
    if (colorCache[hex]) return colorCache[hex];
    var h = hex.replace('#', '');
    var v = [parseInt(h.substring(0, 2), 16), parseInt(h.substring(2, 4), 16), parseInt(h.substring(4, 6), 16)];
    colorCache[hex] = v;
    return v;
  }
  function mixColor(hexA, hexB, t) {
    var a = hexToRgb(hexA), b = hexToRgb(hexB);
    var r = Math.round(a[0] + (b[0] - a[0]) * t);
    var g = Math.round(a[1] + (b[1] - a[1]) * t);
    var bl = Math.round(a[2] + (b[2] - a[2]) * t);
    return 'rgb(' + r + ',' + g + ',' + bl + ')';
  }

  function drawRail(points, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.shadowColor = color;
    ctx.shadowBlur = 6;
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    for (var i = 0; i < points.length; i++) {
      var pt = points[i];
      if (i === 0) ctx.moveTo(pt[0], pt[1]); else ctx.lineTo(pt[0], pt[1]);
    }
    ctx.stroke();
    ctx.restore();
  }

  function drawObstacles() {
    var active = [];
    for (var i = 0; i < obstacles.length; i++) if (obstacles[i].active) active.push(obstacles[i]);
    active.sort(function (a, b) { return b.z - a.z; });
    for (var k = 0; k < active.length; k++) drawObstacle(active[k]);
  }

  function drawObstacle(o) {
    var x = o.screenX, y = o.screenY, scale = Math.max(o.scale, 0.04);
    ctx.save();
    ctx.translate(x, y);
    if (o.flashTimer > 0) { ctx.filter = 'brightness(2.1)'; }
    if (o.type === 'asteroid') drawAsteroid(scale, o.phase, o);
    else if (o.type === 'wreck') drawWreck(scale, o);
    else if (o.type === 'stone') drawStone(scale, o);
    else drawScout(scale, o);
    ctx.filter = 'none';
    if (o.maxHp > 1 && o.hp < o.maxHp && o.hp > 0) drawHpPip(scale, o);
    ctx.restore();
  }

  function drawHpPip(scale, o) {
    var r = VISUAL_RADIUS[o.type] * scale;
    var w = r * 1.4, h = 3;
    var pct = o.hp / o.maxHp;
    ctx.save();
    ctx.translate(-w / 2, -r - 10);
    ctx.fillStyle = 'rgba(5,6,8,0.6)';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = pct > 0.5 ? '#5dffb0' : '#ff4d5e';
    ctx.fillRect(0, 0, w * pct, h);
    ctx.restore();
  }

  // Detailed asteroid: jagged rock silhouette plus crater shading so it
  // reads as a rock, not a blob — darker crater pits, a lit rim highlight.
  function drawAsteroid(scale, phase, o) {
    var r = VISUAL_RADIUS.asteroid * scale;
    var pts = 9;
    ctx.save();
    ctx.rotate(world.rotAccum * 0.6 + phase);

    var verts = [];
    for (var i = 0; i < pts; i++) {
      var a = (i / pts) * Math.PI * 2;
      var jitter = 0.68 + 0.32 * Math.sin(i * 12.9 + phase * 3.1);
      verts.push([Math.cos(a) * r * jitter, Math.sin(a) * r * jitter]);
    }
    ctx.beginPath();
    for (var v = 0; v < verts.length; v++) {
      if (v === 0) ctx.moveTo(verts[v][0], verts[v][1]); else ctx.lineTo(verts[v][0], verts[v][1]);
    }
    ctx.closePath();
    var rg = ctx.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.1, 0, 0, r * 1.1);
    rg.addColorStop(0, '#7a7488');
    rg.addColorStop(0.55, '#5b5468');
    rg.addColorStop(1, '#332e40');
    ctx.fillStyle = rg;
    ctx.fill();
    ctx.strokeStyle = '#1f1c2a';
    ctx.lineWidth = Math.max(1, 2 * scale);
    ctx.stroke();

    // craters
    var craterSeeds = [[0.18, -0.1, 0.22], [-0.32, 0.18, 0.16], [0.05, 0.35, 0.13]];
    for (var c = 0; c < craterSeeds.length; c++) {
      var cs = craterSeeds[c];
      ctx.beginPath();
      ctx.arc(cs[0] * r, cs[1] * r, cs[2] * r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(20,18,28,0.45)';
      ctx.fill();
    }
    ctx.restore();
  }

  // Wreck: a derelict hull fragment — angular plating, a flickering
  // damaged-light, and a trailing scorch streak instead of a recolored rock.
  function drawWreck(scale, o) {
    var r = VISUAL_RADIUS.wreck * scale;
    ctx.save();
    ctx.rotate(world.rotAccum * 0.35 + o.phase);

    ctx.beginPath();
    ctx.moveTo(-r * 0.9, -r * 0.5);
    ctx.lineTo(r * 0.5, -r * 0.75);
    ctx.lineTo(r * 0.95, 0.1 * r);
    ctx.lineTo(r * 0.25, r * 0.85);
    ctx.lineTo(-r * 0.65, r * 0.6);
    ctx.lineTo(-r * 1.05, -r * 0.05);
    ctx.closePath();
    var wg = ctx.createLinearGradient(-r, -r, r, r);
    wg.addColorStop(0, '#5a3a40');
    wg.addColorStop(0.5, '#3d262c');
    wg.addColorStop(1, '#23151a');
    ctx.fillStyle = wg;
    ctx.fill();
    ctx.strokeStyle = '#160d10';
    ctx.lineWidth = Math.max(1, 2 * scale);
    ctx.stroke();

    // panel seams
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-r * 0.3, -r * 0.6); ctx.lineTo(-r * 0.1, r * 0.7);
    ctx.moveTo(r * 0.15, -r * 0.65); ctx.lineTo(r * 0.35, r * 0.5);
    ctx.stroke();

    // flickering damage light
    var flick = 0.4 + 0.6 * Math.max(0, Math.sin(world.t * 9 + o.phase * 5));
    ctx.beginPath();
    ctx.arc(r * 0.3, -r * 0.1, r * 0.09, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,77,94,' + flick.toFixed(2) + ')';
    ctx.fill();

    ctx.restore();
  }

  // Hop-stone: a glinting ore boulder, not a flat circle — banded mineral
  // texture and a rotating glint so it reads as a distinct hazard/bonus.
  function drawStone(scale, o) {
    var r = VISUAL_RADIUS.stone * scale;
    var jumpable = player.boosting > 0 && o.z > 0 && o.z < 180;
    if (jumpable) {
      ctx.beginPath();
      ctx.arc(0, 0, r + 6 * scale, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffd166';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.8;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    var sg = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
    sg.addColorStop(0, '#c9c0a8');
    sg.addColorStop(0.6, '#9b9484');
    sg.addColorStop(1, '#5e5848');
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = sg;
    ctx.fill();

    // mineral band
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.strokeStyle = 'rgba(93,217,232,0.35)';
    ctx.lineWidth = Math.max(1, r * 0.22);
    ctx.beginPath();
    ctx.moveTo(-r, r * 0.3);
    ctx.lineTo(r, -r * 0.4);
    ctx.stroke();
    ctx.restore();

    // rotating glint
    var ga = world.rotAccum * 1.6 + o.phase;
    ctx.beginPath();
    ctx.arc(Math.cos(ga) * r * 0.4, Math.sin(ga) * r * 0.4, r * 0.16, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fill();
  }

  // Raider scout — a small enemy starfighter silhouette: forward fuselage,
  // swept wings, cockpit canopy, and an animated engine glow, replacing the
  // old plain diamond shape with something readable as a hostile ship.
  function drawScout(scale, o) {
    var r = VISUAL_RADIUS.scout * scale;
    ctx.save();

    // engine glow (drawn first, behind hull)
    var flick = 0.55 + 0.45 * Math.sin(world.t * 26 + o.phase);
    var eg = ctx.createRadialGradient(0, r * 0.8, 0, 0, r * 0.8, r * 0.55);
    eg.addColorStop(0, 'rgba(255,140,61,' + (0.85 * flick).toFixed(2) + ')');
    eg.addColorStop(1, 'rgba(255,140,61,0)');
    ctx.fillStyle = eg;
    ctx.beginPath();
    ctx.arc(0, r * 0.78, r * 0.55, 0, Math.PI * 2);
    ctx.fill();

    // swept wings
    ctx.beginPath();
    ctx.moveTo(-r * 0.18, -r * 0.1);
    ctx.lineTo(-r * 1.05, r * 0.55);
    ctx.lineTo(-r * 0.7, r * 0.7);
    ctx.lineTo(-r * 0.1, r * 0.25);
    ctx.closePath();
    ctx.moveTo(r * 0.18, -r * 0.1);
    ctx.lineTo(r * 1.05, r * 0.55);
    ctx.lineTo(r * 0.7, r * 0.7);
    ctx.lineTo(r * 0.1, r * 0.25);
    ctx.closePath();
    ctx.fillStyle = '#8a3b2e';
    ctx.fill();
    ctx.strokeStyle = '#3d1813';
    ctx.lineWidth = Math.max(1, scale);
    ctx.stroke();

    // fuselage
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(r * 0.42, r * 0.55);
    ctx.lineTo(0, r * 0.3);
    ctx.lineTo(-r * 0.42, r * 0.55);
    ctx.closePath();
    var fg = ctx.createLinearGradient(0, -r, 0, r * 0.5);
    fg.addColorStop(0, '#e2596b');
    fg.addColorStop(1, '#8a2e3a');
    ctx.fillStyle = fg;
    ctx.fill();
    ctx.strokeStyle = '#2a0f14';
    ctx.lineWidth = Math.max(1, scale);
    ctx.stroke();

    // cockpit canopy
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.2, r * 0.16, r * 0.24, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#1a0e10';
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-r * 0.04, -r * 0.26, r * 0.06, r * 0.09, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(93,217,232,0.7)';
    ctx.fill();

    ctx.restore();
  }

  // ------------------------------------------------------------------------
  // Boss rendering — one distinct silhouette per archetype so each fight
  // is visually as different as its movement/fire pattern.
  // ------------------------------------------------------------------------
  function drawBoss() {
    if (!boss) return;
    var scale = Math.max(boss.scale, 0.08);
    var x = boss.screenX, y = boss.screenY;
    ctx.save();
    ctx.translate(x, y);
    if (boss.flashTimer > 0) ctx.filter = 'brightness(2.2)';

    switch (boss.def.key) {
      case 'hulk': drawBossHulk(scale); break;
      case 'striker': drawBossStriker(scale); break;
      case 'sentinel': drawBossSentinel(scale); break;
      case 'swarm': drawBossSwarm(scale); break;
      default: drawBossHulk(scale);
    }
    ctx.filter = 'none';
    ctx.restore();
  }

  // Render Hulk — a boxy, armor-plated freighter hull: wide flat body,
  // riveted plating, two heavy stern thrusters, a single glaring bridge eye.
  function drawBossHulk(scale) {
    var r = boss.def.radius * scale;
    ctx.save();
    ctx.rotate(Math.sin(boss.phase * 0.5) * 0.05);

    // stern thrusters
    var flick = 0.6 + 0.4 * Math.sin(world.t * 14);
    [-r * 0.55, r * 0.55].forEach(function (ex) {
      var fg = ctx.createRadialGradient(ex, r * 0.85, 0, ex, r * 0.85, r * 0.3);
      fg.addColorStop(0, 'rgba(255,140,61,' + (0.8 * flick).toFixed(2) + ')');
      fg.addColorStop(1, 'rgba(255,140,61,0)');
      ctx.fillStyle = fg;
      ctx.beginPath();
      ctx.arc(ex, r * 0.85, r * 0.3, 0, Math.PI * 2);
      ctx.fill();
    });

    // hull body
    ctx.beginPath();
    ctx.moveTo(-r * 0.95, -r * 0.3);
    ctx.lineTo(-r * 0.6, -r * 0.75);
    ctx.lineTo(r * 0.6, -r * 0.75);
    ctx.lineTo(r * 0.95, -r * 0.3);
    ctx.lineTo(r * 0.85, r * 0.7);
    ctx.lineTo(-r * 0.85, r * 0.7);
    ctx.closePath();
    var hg = ctx.createLinearGradient(0, -r, 0, r);
    hg.addColorStop(0, '#a85a45');
    hg.addColorStop(0.55, '#8a3b2e');
    hg.addColorStop(1, '#4f1f17');
    ctx.fillStyle = hg;
    ctx.fill();
    ctx.strokeStyle = '#2a0f0a';
    ctx.lineWidth = Math.max(1.5, 2.4 * scale);
    ctx.stroke();

    // riveted plate seams
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 1;
    for (var i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(i * r * 0.32, -r * 0.6);
      ctx.lineTo(i * r * 0.32, r * 0.55);
      ctx.stroke();
    }

    // bridge eye
    var eyeGlow = 0.6 + 0.4 * Math.sin(world.t * 5);
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.4, r * 0.22, r * 0.1, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#1a0e0a';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, -r * 0.4, r * 0.07, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,77,94,' + eyeGlow.toFixed(2) + ')';
    ctx.fill();

    ctx.restore();
  }

  // Vanguard Striker — a slim, fast arrow-shaped interceptor with raked-back
  // wings and a bright cockpit slit, conveying speed and aggression.
  function drawBossStriker(scale) {
    var r = boss.def.radius * scale;
    ctx.save();
    ctx.rotate(P.clamp(boss.lane * 0.15, -0.3, 0.3));

    var flick = 0.6 + 0.4 * Math.sin(world.t * 20);
    var eg = ctx.createRadialGradient(0, r * 0.85, 0, 0, r * 0.85, r * 0.4);
    eg.addColorStop(0, 'rgba(185,166,224,' + (0.85 * flick).toFixed(2) + ')');
    eg.addColorStop(1, 'rgba(185,166,224,0)');
    ctx.fillStyle = eg;
    ctx.beginPath();
    ctx.arc(0, r * 0.85, r * 0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(r * 0.9, r * 0.45);
    ctx.lineTo(r * 0.3, r * 0.3);
    ctx.lineTo(0, r * 0.6);
    ctx.lineTo(-r * 0.3, r * 0.3);
    ctx.lineTo(-r * 0.9, r * 0.45);
    ctx.closePath();
    var sg = ctx.createLinearGradient(0, -r, 0, r * 0.6);
    sg.addColorStop(0, '#c3aee0');
    sg.addColorStop(0.55, '#5a3a8a');
    sg.addColorStop(1, '#2a1850');
    ctx.fillStyle = sg;
    ctx.fill();
    ctx.strokeStyle = '#160c30';
    ctx.lineWidth = Math.max(1.2, 2 * scale);
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(0, -r * 0.25, r * 0.1, r * 0.32, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(93,217,232,0.85)';
    ctx.fill();

    ctx.restore();
  }

  // Twin Sentinel — a central core flanked by two independent turret pods
  // that visibly darken/spark out as podLeftHp/podRightHp are depleted,
  // so the player can see which pod still needs to be destroyed.
  function drawBossSentinel(scale) {
    var r = boss.def.radius * scale;
    ctx.save();

    // connecting struts
    ctx.strokeStyle = '#1c2128';
    ctx.lineWidth = Math.max(2, 4 * scale);
    ctx.beginPath();
    ctx.moveTo(-r * 0.95, 0); ctx.lineTo(-r * 0.3, 0);
    ctx.moveTo(r * 0.3, 0); ctx.lineTo(r * 0.95, 0);
    ctx.stroke();

    // core
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.42, 0, Math.PI * 2);
    var cg = ctx.createRadialGradient(-r * 0.1, -r * 0.1, 0, 0, 0, r * 0.42);
    cg.addColorStop(0, '#7fd9de');
    cg.addColorStop(1, '#1c4a4e');
    ctx.fillStyle = cg;
    ctx.fill();
    ctx.strokeStyle = '#0c2426';
    ctx.lineWidth = Math.max(1.5, 2 * scale);
    ctx.stroke();
    var coreGlow = 0.5 + 0.5 * Math.sin(world.t * 6);
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.16, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(93,217,232,' + coreGlow.toFixed(2) + ')';
    ctx.fill();

    drawSentinelPod(-r * 0.95, r, boss.podLeftHp > 0);
    drawSentinelPod(r * 0.95, r, boss.podRightHp > 0);

    ctx.restore();
  }

  function drawSentinelPod(cx, r, alive) {
    ctx.save();
    ctx.translate(cx, 0);
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2);
    var pg = ctx.createRadialGradient(-r * 0.08, -r * 0.08, 0, 0, 0, r * 0.3);
    if (alive) {
      pg.addColorStop(0, '#7fd9de'); pg.addColorStop(1, '#1c4a4e');
    } else {
      pg.addColorStop(0, '#555'); pg.addColorStop(1, '#222');
    }
    ctx.fillStyle = pg;
    ctx.fill();
    ctx.strokeStyle = alive ? '#0c2426' : '#000';
    ctx.lineWidth = Math.max(1.2, r * 0.04);
    ctx.stroke();
    if (alive) {
      var g = 0.5 + 0.5 * Math.sin(world.t * 9 + cx);
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.1, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,77,94,' + g.toFixed(2) + ')';
      ctx.fill();
    } else {
      // dead pod sparks
      if (Math.random() < 0.3) burst(boss.screenX + cx, boss.screenY, '#888', 1, 40, 0.3);
    }
    ctx.restore();
  }

  // Swarm Mother — an organic, segmented hive carrier with pulsing pods
  // along its flanks (visually distinct from the angular military hulls).
  function drawBossSwarm(scale) {
    var r = boss.def.radius * scale;
    ctx.save();
    ctx.rotate(Math.sin(boss.phase * 0.3) * 0.08);

    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.95, r * 0.55, 0, 0, Math.PI * 2);
    var bg = ctx.createRadialGradient(-r * 0.2, -r * 0.15, 0, 0, 0, r);
    bg.addColorStop(0, '#b85a7a');
    bg.addColorStop(0.6, '#6e2e4a');
    bg.addColorStop(1, '#33152a');
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.strokeStyle = '#1a0a16';
    ctx.lineWidth = Math.max(1.5, 2 * scale);
    ctx.stroke();

    // segment ridges
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 1;
    for (var i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.ellipse(i * r * 0.3, 0, r * 0.12, r * 0.5, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // pulsing brood pods
    for (var p = -1; p <= 1; p += 2) {
      var pulse = 0.5 + 0.5 * Math.sin(world.t * 4 + p);
      ctx.beginPath();
      ctx.arc(p * r * 0.55, r * 0.35, r * 0.14, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,77,94,' + (0.4 + 0.4 * pulse).toFixed(2) + ')';
      ctx.fill();
    }

    ctx.restore();
  }

  function drawEnemyBolts() {
    for (var i = 0; i < enemyBolts.length; i++) {
      var b = enemyBolts[i];
      if (!b.active) continue;
      var scale = P.projectScale(Math.max(b.z, 0), CFG.FOCAL);
      var x = P.laneToX(b.lane, CFG.W / 2, CFG.ROAD_HALF_NEAR, world.curveCur, scale, CFG.CURVE_AMP);
      var y = CFG.HORIZON_Y + scale * (CFG.PLANE_Y - CFG.HORIZON_Y);
      var len = 16 * Math.max(scale, 0.3);
      var w = 4 * Math.max(scale, 0.35);
      ctx.save();
      ctx.translate(x, y);
      ctx.shadowColor = b.color;
      ctx.shadowBlur = 10 * Math.max(scale, 0.4);
      var grad = ctx.createLinearGradient(0, -len, 0, len * 0.4);
      grad.addColorStop(0, 'rgba(255,255,255,0.95)');
      grad.addColorStop(0.4, b.color);
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(-w / 2, -len * 0.4, w, len + len * 0.4);
      ctx.restore();
    }
  }

  function drawBolts() {
    for (var i = 0; i < bolts.length; i++) {
      var b = bolts[i];
      if (!b.active) continue;
      var def = WEAPONS[b.weaponKey] || WEAPONS.laser;
      var scale = P.projectScale(Math.max(b.z, 0), CFG.FOCAL);
      var x = P.laneToX(b.lane, CFG.W / 2, CFG.ROAD_HALF_NEAR, world.curveCur, scale, CFG.CURVE_AMP);
      var y = CFG.HORIZON_Y + scale * (CFG.PLANE_Y - CFG.HORIZON_Y);
      var len = (def.kind === 'missile' ? 22 : 16) * Math.max(scale, 0.25);
      var w = (def.kind === 'missile' ? 5 : 3) * Math.max(scale, 0.3);

      ctx.save();
      ctx.translate(x, y);
      ctx.shadowColor = def.glow;
      ctx.shadowBlur = 10 * Math.max(scale, 0.4);
      if (def.kind === 'missile') {
        ctx.fillStyle = '#cfd4dc';
        ctx.beginPath();
        ctx.moveTo(0, -len);
        ctx.lineTo(w, len * 0.3);
        ctx.lineTo(0, len * 0.55);
        ctx.lineTo(-w, len * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = def.glow;
        ctx.beginPath();
        ctx.moveTo(-w * 0.6, len * 0.3);
        ctx.lineTo(w * 0.6, len * 0.3);
        ctx.lineTo(0, len * 0.3 + 10 * scale);
        ctx.closePath();
        ctx.fill();
      } else {
        var grad = ctx.createLinearGradient(0, -len, 0, len * 0.4);
        grad.addColorStop(0, 'rgba(255,255,255,0.95)');
        grad.addColorStop(0.4, def.color);
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(-w / 2, -len, w, len + len * 0.4);
      }
      ctx.restore();
    }
  }

  // Player starfighter — an original design in the spirit of a rebel
  // interceptor: slim fuselage, four angled S-foil wings with wingtip
  // cannons, a glass cockpit canopy, and twin engine flares. Replaces the
  // old flat kite/diamond silhouette that read as a mouse cursor.
  function drawPlayer() {
    var x = playerScreenX();
    var y = CFG.PLANE_Y - 28;
    var blinkOff = player.invuln > 0 && Math.floor(player.invuln * 10) % 2 === 0;
    if (blinkOff) return;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(player.bank * 0.28);

    if (player.invuln > 0) {
      ctx.beginPath();
      ctx.arc(0, 2, 30, 0, Math.PI * 2);
      ctx.strokeStyle = '#5dd9e8';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.55 + 0.25 * Math.sin(world.t * 18);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    if (player.boosting > 0) {
      ctx.beginPath();
      ctx.arc(0, 4, 26, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffd166';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.6;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // twin engine flares (drawn behind hull)
    var flameLen = 12 + (input.thrust ? 9 : 0) + Math.sin(world.t * 40) * 2.5;
    [-9, 9].forEach(function (ex) {
      ctx.beginPath();
      ctx.moveTo(ex - 3.4, 15);
      ctx.lineTo(ex, 15 + flameLen);
      ctx.lineTo(ex + 3.4, 15);
      ctx.closePath();
      var fg = ctx.createLinearGradient(0, 15, 0, 15 + flameLen);
      fg.addColorStop(0, 'rgba(93,217,232,0.95)');
      fg.addColorStop(1, 'rgba(93,217,232,0)');
      ctx.fillStyle = fg;
      ctx.fill();
    });

    // lower wing pair (angled down, S-foil style)
    drawWingPair(1, '#3a4252');
    // upper wing pair
    drawWingPair(-1, '#454e60');

    // fuselage
    ctx.beginPath();
    ctx.moveTo(0, -23);
    ctx.lineTo(6, -10);
    ctx.lineTo(7, 13);
    ctx.lineTo(3, 19);
    ctx.lineTo(-3, 19);
    ctx.lineTo(-7, 13);
    ctx.lineTo(-6, -10);
    ctx.closePath();
    var hg = ctx.createLinearGradient(-7, -23, 7, 19);
    hg.addColorStop(0, '#cfd4dc');
    hg.addColorStop(0.5, '#9aa3b4');
    hg.addColorStop(1, '#5c6478');
    ctx.fillStyle = hg;
    ctx.fill();
    ctx.strokeStyle = '#1c2128';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // nose stripe (signal-orange identification band)
    ctx.beginPath();
    ctx.moveTo(0, -23);
    ctx.lineTo(4, -13);
    ctx.lineTo(-4, -13);
    ctx.closePath();
    ctx.fillStyle = '#ff8c3d';
    ctx.fill();

    // cockpit canopy
    ctx.beginPath();
    ctx.ellipse(0, -2, 3.6, 6.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#11151c';
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-0.8, -4.5, 1.6, 2.6, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(93,217,232,0.8)';
    ctx.fill();

    ctx.restore();
  }

  function drawWingPair(vDir, color) {
    [-1, 1].forEach(function (side) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(side * 5, -4);
      ctx.lineTo(side * 26, vDir * 12 - 2);
      ctx.lineTo(side * 29, vDir * 14);
      ctx.lineTo(side * 28, vDir * 17);
      ctx.lineTo(side * 7, vDir * 6 + 6);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#161a22';
      ctx.lineWidth = 1;
      ctx.stroke();

      // wingtip cannon
      ctx.beginPath();
      ctx.rect(side * 27 - 1.4, vDir * 14 - 1.4, 2.8, 6 * vDir);
      ctx.fillStyle = '#1c2128';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(side * 28.4, vDir * (14 + 6), 1.4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,77,94,0.85)';
      ctx.fill();
      ctx.restore();
    });
  }

  function drawParticles() {
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      if (!p.active) continue;
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function renderAmbientBg(ts) {
    if (!bgCtx) return;
    var c = bgCtx.ctx, w = bgCtx.w, h = bgCtx.h;
    c.clearRect(0, 0, w, h);
    c.fillStyle = '#05060c';
    c.fillRect(0, 0, w, h);
    var n = 90;
    for (var i = 0; i < n; i++) {
      var seed = i * 97.13;
      var x = (Math.sin(seed) * 0.5 + 0.5) * w;
      var baseY = (Math.cos(seed * 1.7) * 0.5 + 0.5) * h;
      var drift = (ts * 0.00002 * (1 + (i % 5))) % h;
      var y = (baseY + drift) % h;
      var tw = 0.4 + 0.6 * Math.abs(Math.sin(ts * 0.0006 + seed));
      c.globalAlpha = tw * 0.6;
      c.fillStyle = '#e8ecf2';
      var size = 1 + (i % 3);
      c.fillRect(x, y, size, size);
    }
    c.globalAlpha = 1;
  }

  // ------------------------------------------------------------------------
  // HUD / DOM sync
  // ------------------------------------------------------------------------
  // Small ship-icon glyph matching the in-canvas fighter silhouette (wings +
  // fuselage + canopy dot) so lives read as "ships remaining," not dots.
  var SHIP_SVG = '<svg class="ship-icon" width="18" height="20" viewBox="0 0 18 20" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M9 1 L11.5 9 L9 17 L6.5 9 Z" fill="#e8ecf2" stroke="#1c2128" stroke-width="0.6"/>' +
    '<path d="M9 6 L17 10 L13 11.5 L9 9 Z" fill="#3a4252" stroke="#161a22" stroke-width="0.5"/>' +
    '<path d="M9 6 L1 10 L5 11.5 L9 9 Z" fill="#454e60" stroke="#161a22" stroke-width="0.5"/>' +
    '<circle cx="9" cy="6.5" r="1.3" fill="#5dd9e8"/>' +
    '</svg>';

  function syncLivesHud() {
    var html = '';
    for (var i = 0; i < player.lives; i++) html += SHIP_SVG;
    dom.livesHud.innerHTML = html;
    dom.livesHud.setAttribute('aria-label', player.lives + ' hull point' + (player.lives === 1 ? '' : 's') + ' remaining');
  }

  function syncScoreHud() {
    dom.scoreValue.textContent = Math.round(world.score).toLocaleString();
    dom.bestValue.textContent = Math.max(Storage.getBest(), Math.round(world.score)).toLocaleString();
  }

  function syncSectorHud() {
    dom.sectorLabel.textContent = 'sector ' + (world.sector + 1);
    var pct = world.sectorQuota > 0 ? P.clamp(world.sectorProgress / world.sectorQuota, 0, 1) : 0;
    dom.sectorFill.style.width = (pct * 100).toFixed(1) + '%';
  }

  function syncWeaponHud() {
    var def = WEAPONS[player.weapon];
    if (dom.weaponSelect) dom.weaponSelect.value = player.weapon;
    if (dom.weaponHeatFill) dom.weaponHeatFill.style.width = (player.heat * 100).toFixed(0) + '%';
    if (dom.weaponNameDesktop && def) dom.weaponNameDesktop.textContent = def.label;
    if (dom.touchWeapon && def) dom.touchWeapon.setAttribute('aria-label', 'Switch weapon, current: ' + def.label);
  }

  var toastTimer = null;
  function toast(msg) {
    dom.toast.textContent = msg;
    dom.toast.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { dom.toast.classList.remove('show'); }, 1500);
  }

  var comboTimerHandle = null;
  function showCombo() {
    dom.comboTag.textContent = 'x' + world.combo;
    dom.comboTag.classList.remove('hidden');
    dom.comboTag.classList.add('show');
    if (comboTimerHandle) clearTimeout(comboTimerHandle);
    comboTimerHandle = setTimeout(function () { dom.comboTag.classList.remove('show'); }, 700);
  }

  function renderScoreList(el, list) {
    if (!list || !list.length) {
      el.innerHTML = '<li class="empty">no flights logged yet</li>';
      return;
    }
    var html = '';
    for (var i = 0; i < list.length; i++) {
      html += '<li><span class="rank">' + (i + 1) + '</span><span>' + list[i].toLocaleString() + '</span></li>';
    }
    el.innerHTML = html;
  }

  // ------------------------------------------------------------------------
  // Input
  // ------------------------------------------------------------------------
  // The hop action is a short-window dodge used to clear hop-stones for
  // bonus score (see resolveHit -> skipStone). It is gated by a cooldown
  // so it can't be held/spammed every frame, which is what made the old
  // version feel like an empty, purposeless ring with no real effect.
  function tryHop() {
    if (player.hopCooldown > 0) return;
    player.boosting = CFG.BOOST_WINDOW;
    player.hopCooldown = CFG.HOP_COOLDOWN;
  }

  function setWeapon(key) {
    if (!WEAPONS[key]) return;
    player.weapon = key;
    player.heat = 0;
    player.fireTimer = 0;
    Storage.setWeapon(key);
    syncWeaponHud();
  }

  var WEAPON_ORDER = ['laser', 'twin', 'spread', 'missile'];
  function cycleWeapon() {
    var idx = WEAPON_ORDER.indexOf(player.weapon);
    var next = WEAPON_ORDER[(idx + 1) % WEAPON_ORDER.length];
    setWeapon(next);
    toast(WEAPONS[next].label);
  }

  function bindInput() {
    if (typeof window === 'undefined' || !window.addEventListener) return;

    window.addEventListener('keydown', function (e) {
      switch (e.code) {
        case 'ArrowLeft': case 'KeyA': input.left = true; e.preventDefault(); break;
        case 'ArrowRight': case 'KeyD': input.right = true; e.preventDefault(); break;
        case 'ArrowUp': case 'KeyW': input.thrust = true; e.preventDefault(); break;
        case 'ArrowDown': case 'KeyS': input.brake = true; e.preventDefault(); break;
        case 'Space':
          e.preventDefault();
          if (state === STATE.PLAYING || state === STATE.BOSS) tryHop();
          else if (state === STATE.START) startGame();
          else if (state === STATE.GAMEOVER) startGame();
          break;
        case 'KeyQ':
          e.preventDefault();
          if (state === STATE.PLAYING || state === STATE.BOSS) cycleWeapon();
          break;
        case 'KeyP': case 'Escape':
          if (state === STATE.PLAYING || state === STATE.PAUSED || state === STATE.BOSS || state === STATE.BOSSINTRO) togglePause();
          break;
        case 'Enter':
          if (state === STATE.START) startGame();
          else if (state === STATE.GAMEOVER) startGame();
          else if (state === STATE.PAUSED) togglePause();
          break;
        case 'Digit1': if (state === STATE.PLAYING || state === STATE.BOSS) { setWeapon('laser'); toast(WEAPONS.laser.label); } break;
        case 'Digit2': if (state === STATE.PLAYING || state === STATE.BOSS) { setWeapon('twin'); toast(WEAPONS.twin.label); } break;
        case 'Digit3': if (state === STATE.PLAYING || state === STATE.BOSS) { setWeapon('spread'); toast(WEAPONS.spread.label); } break;
        case 'Digit4': if (state === STATE.PLAYING || state === STATE.BOSS) { setWeapon('missile'); toast(WEAPONS.missile.label); } break;
      }
    });

    window.addEventListener('keyup', function (e) {
      switch (e.code) {
        case 'ArrowLeft': case 'KeyA': input.left = false; break;
        case 'ArrowRight': case 'KeyD': input.right = false; break;
        case 'ArrowUp': case 'KeyW': input.thrust = false; break;
        case 'ArrowDown': case 'KeyS': input.brake = false; break;
      }
    });

    bindHold(dom.touchLeft, function (v) { input.left = v; });
    bindHold(dom.touchRight, function (v) { input.right = v; });
    if (dom.touchFire) {
      dom.touchFire.addEventListener('pointerdown', function (e) { e.preventDefault(); if (state === STATE.PLAYING || state === STATE.BOSS) tryHop(); });
    }
    if (dom.touchWeapon) {
      dom.touchWeapon.addEventListener('pointerdown', function (e) { e.preventDefault(); if (state === STATE.PLAYING || state === STATE.BOSS) cycleWeapon(); });
    }
    if (dom.weaponBtnDesktop) {
      dom.weaponBtnDesktop.addEventListener('click', function () { if (state === STATE.PLAYING || state === STATE.BOSS) cycleWeapon(); });
    }
    if (dom.weaponSelect) {
      dom.weaponSelect.value = player.weapon;
      dom.weaponSelect.addEventListener('change', function () { setWeapon(dom.weaponSelect.value); });
      dom.weaponSelect.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
    }

    if (dom.startBtn) dom.startBtn.addEventListener('click', startGame);
    if (dom.retryBtn) dom.retryBtn.addEventListener('click', startGame);
    if (dom.resumeBtn) dom.resumeBtn.addEventListener('click', togglePause);
    if (dom.muteBtn) {
      dom.muteBtn.addEventListener('click', function () {
        var next = !Audio.isMuted();
        Audio.setMuted(next);
        dom.muteBtn.setAttribute('aria-pressed', String(next));
        dom.muteBtn.textContent = next ? 'SOUND OFF' : 'SOUND ON';
      });
      dom.muteBtn.setAttribute('aria-pressed', String(Audio.isMuted()));
      dom.muteBtn.textContent = Audio.isMuted() ? 'SOUND OFF' : 'SOUND ON';
    }

    if (typeof document !== 'undefined' && document.addEventListener) {
      document.addEventListener('visibilitychange', function () {
        if (document.hidden && state === STATE.PLAYING) togglePause();
      });
    }
  }

  function bindHold(el, setter) {
    if (!el) return;
    var down = function (e) { e.preventDefault(); setter(true); };
    var up = function () { setter(false); };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointerleave', up);
    el.addEventListener('pointercancel', up);
  }

  // ------------------------------------------------------------------------
  // Boot
  // ------------------------------------------------------------------------
  function initHud() {
    dom.bestValue.textContent = Storage.getBest().toLocaleString();
    renderScoreList(dom.scoreListStart, Storage.getScores());
    syncLivesHud();
    syncSectorHud();
    syncWeaponHud();
  }

  var STEP = 1 / 60;
  var acc = 0, lastTime = null, rafHandle = null;

  function loop(ts) {
    if (lastTime === null) lastTime = ts;
    var dt = (ts - lastTime) / 1000;
    lastTime = ts;
    if (dt > 0.05 || dt < 0) dt = 1 / 60;
    acc += dt;
    var iterations = 0;
    while (acc >= STEP && iterations < 8) { update(STEP); acc -= STEP; iterations++; }
    render();
    renderAmbientBg(ts);
    syncScoreHud();
    syncSectorHud();
    syncWeaponHud();
    rafHandle = (typeof window !== 'undefined' ? window.requestAnimationFrame(loop) : null);
  }

  function init() {
    initHud();
    bindInput();
    setOverlay('start');
    if (typeof window !== 'undefined' && window.requestAnimationFrame) {
      rafHandle = window.requestAnimationFrame(loop);
    }
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  // ------------------------------------------------------------------------
  // Test hook — exposes internals for headless verification.
  // ------------------------------------------------------------------------
  var TestHook = {
    CFG: CFG,
    STATE: STATE,
    WEAPONS: WEAPONS,
    BOSS_DEFS: BOSS_DEFS,
    getState: function () { return state; },
    getPlayer: function () { return player; },
    getWorld: function () { return world; },
    getObstacles: function () { return obstacles; },
    getBolts: function () { return bolts; },
    getEnemyBolts: function () { return enemyBolts; },
    getBoss: function () { return boss; },
    getInput: function () { return input; },
    startGame: startGame,
    togglePause: togglePause,
    update: update,
    render: render,
    spawnObstacle: spawnObstacle,
    setWeapon: setWeapon,
    cycleWeapon: cycleWeapon,
    tryHop: tryHop,
    fireWeapon: fireWeapon,
    startBossIntro: startBossIntro,
    spawnBoss: spawnBoss,
    damageBoss: damageBoss,
    forceCollisionTest: function (type) {
      var slot = freeObstacleSlot();
      slot.active = true; slot.resolved = false; slot.destroyed = false; slot.type = type || 'asteroid';
      slot.maxHp = HP_BY_TYPE[type] || 1; slot.hp = slot.maxHp;
      // Placed just past the player's plane (z<0) so scale is exactly 1,
      // matching playerScreenX()'s own frame with zero curve offset -
      // this makes the test deterministic regardless of current curveCur.
      slot.z = -2; slot.lane = player.lane; slot.baseLane = player.lane; slot.phase = 0;
      slot.scale = P.projectScale(Math.max(slot.z, 0), CFG.FOCAL);
      slot.screenX = playerScreenX();
      slot.screenY = CFG.HORIZON_Y + slot.scale * (CFG.PLANE_Y - CFG.HORIZON_Y);
      return slot;
    }
  };
  if (typeof window !== 'undefined') window.Cosmodrome = TestHook;
  if (typeof module !== 'undefined' && module.exports) module.exports = TestHook;
})();
