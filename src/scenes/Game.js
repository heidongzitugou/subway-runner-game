import * as Phaser from 'phaser';
import { CONFIG, LANES, COLORS, PALETTE, SPEED, GROUND_Y, BEST_KEY } from '../utils/constants.js';
import { Player } from '../objects/Player.js';
import { Spawner } from '../managers/Spawner.js';
import { HUD } from '../managers/HUD.js';
import { sfx } from '../managers/SoundFX.js';

const B = PALETTE; // shorthand

export class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  create() {
    // ── State ──
    this.score = 0;
    this.coins = 0;
    this.combo = 1;
    this.comboTimer = 0;
    this.speed = 1;
    this.distance = 0;
    this.shake = 0;
    this.flash = 0;
    this.speedBurst = 0;
    this.missionComplete = false;
    this.paused = false;
    this.lastSpeedMilestone = 1;
    this.slowMo = 1;

    const saved = localStorage.getItem(BEST_KEY);
    this.best = (saved && Number.isFinite(Number(saved))) ? Number(saved) : 0;

    this.objects = [];
    this.particles = [];

    // ── Graphics layers (depth order: bg → tracks → objects → player → effects) ──
    this.bgGfx = this.add.graphics();
    this.trackGfx = this.add.graphics();
    this.objGfx = this.add.graphics();

    // ── Player ──
    this.player = new Player(this);
    this.player.onLand = () => this.landingDust();

    // ── Effects layer (above player) ──
    this.effectGfx = this.add.graphics();

    // ── Particle text layer ──
    this.particleGfx = this.add.graphics();

    // ── Spawner ──
    this.spawner = new Spawner(this);

    // ── HUD ──
    this.hud = new HUD(this);

    // ── Touch input ──
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.input.on('pointerdown', (p) => {
      this.touchStartX = p.x;
      this.touchStartY = p.y;
    });
    this.input.on('pointerup', (p) => {
      if (!this.player.alive || this.paused) return;
      const dx = p.x - this.touchStartX;
      const dy = p.y - this.touchStartY;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 28) {
        this.player.mobileDir = dx > 0 ? 1 : -1;
      }
      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 28) {
        if (dy < 0) this.player.mobileJump = true;
        else this.player.mobileSlide = true;
      }
    });

    // ── Pause key ──
    this.pauseKey = this.input.keyboard.addKey('P');

    // ── Mobile buttons ──
    this.createMobileControls();

    // ── Pause overlay ──
    this.createPauseOverlay();

    // Reset keyboard to prevent carry-over from Menu
    this.input.keyboard.resetKeys();

    // Start background music
    sfx.startMusic();

    this.cameras.main.fadeIn(300, 7, 16, 20);
  }

  createMobileControls() {
    const zoneH = 72;
    const zoneY = CONFIG.HEIGHT - zoneH / 2 - 10;
    const items = [
      { x: CONFIG.WIDTH * 0.12, label: '‹', cb: () => { if (!this.paused) this.player.mobileDir = -1; } },
      { x: CONFIG.WIDTH * 0.35, label: '跳', cb: () => { if (!this.paused) this.player.mobileJump = true; } },
      { x: CONFIG.WIDTH * 0.65, label: '滑', cb: () => { if (!this.paused) this.player.mobileSlide = true; } },
      { x: CONFIG.WIDTH * 0.88, label: '›', cb: () => { if (!this.paused) this.player.mobileDir = 1; } },
    ];

    for (const item of items) {
      this.add.rectangle(item.x, zoneY, CONFIG.WIDTH * 0.20, 50, 0x071014, 0.5)
        .setStrokeStyle(1, 0x2a4440, 0.3);
      const txt = this.add.text(item.x, zoneY, item.label, {
        fontSize: '22px', fontFamily: 'Arial, sans-serif',
        fontStyle: '900', color: '#fff8df',
      }).setOrigin(0.5);
      const zone = this.add.zone(item.x, zoneY, CONFIG.WIDTH * 0.20, 50).setInteractive();
      zone.on('pointerdown', item.cb);
    }
  }

  createPauseOverlay() {
    this.overlayBg = this.add.rectangle(CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2, CONFIG.WIDTH, CONFIG.HEIGHT, 0x000000, 0)
      .setDepth(100).setScrollFactor(0);

    this.overlayPanel = this.add.rectangle(CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2, 400, 200, 0x0a161c, 0.92)
      .setDepth(101).setStrokeStyle(1, 0x2a4440, 0.5).setVisible(false);

    this.overlayTitle = this.add.text(CONFIG.WIDTH / 2, CONFIG.HEIGHT * 0.44, '', {
      fontSize: '32px', fontFamily: 'Microsoft YaHei, sans-serif',
      fontStyle: '900', color: '#fff4bd',
      stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(102).setVisible(false);

    this.overlayCopy = this.add.text(CONFIG.WIDTH / 2, CONFIG.HEIGHT * 0.52, '', {
      fontSize: '15px', fontFamily: 'Microsoft YaHei, sans-serif',
      color: '#dde7d5',
    }).setOrigin(0.5).setDepth(102).setVisible(false);

    this.overlayBtn = this.add.rectangle(CONFIG.WIDTH / 2, CONFIG.HEIGHT * 0.62, 160, 44, 0xffd34e, 0.9)
      .setDepth(101).setInteractive({ useHandCursor: true }).setVisible(false);

    this.overlayBtnText = this.add.text(CONFIG.WIDTH / 2, CONFIG.HEIGHT * 0.62, '', {
      fontSize: '18px', fontFamily: 'Microsoft YaHei, sans-serif',
      fontStyle: '900', color: '#17160d',
    }).setOrigin(0.5).setDepth(102).setVisible(false);

    this.overlayBtn.on('pointerdown', () => this.resumeGame());
  }

  // ── Perspective helpers ──
  laneX(lane, depth) {
    return CONFIG.WIDTH / 2 + lane * CONFIG.WIDTH * (0.07 + depth * 0.17);
  }

  objectScreen(obj) {
    const depth = 1 - obj.z;
    const scale = 0.3 + depth * 1.28;
    let x = this.laneX(obj.lane, depth);
    let y = CONFIG.HEIGHT * (0.23 + depth * 0.61);

    if (obj.pull) {
      const tx = this.player.x;
      const ty = this.player.y - this.player.height * 0.62;
      x += (tx - x) * obj.pull;
      y += (ty - y) * obj.pull;
    }

    return { x, y, scale, w: obj.width * scale, h: obj.height * scale, depth };
  }

  // ── Main update ──
  update(time, delta) {
    if (this.paused) return;
    const dt = Math.min(delta / 1000, 0.033);

    // Pause toggle
    if (Phaser.Input.Keyboard.JustDown(this.pauseKey)) {
      this.togglePause();
      return;
    }

    // Slow motion
    if (this.slowMo < 1) {
      this.slowMo = Math.min(1, this.slowMo + dt * 1.5);
    }

    // Slow motion affects everything
    const sDt = dt * this.slowMo;
    this.player.update(sDt);

    // Game state
    const missionBoost = this.missionComplete ? 1.12 : 1;
    this.distance += sDt * 540 * this.speed;
    this.score += sDt * 21 * this.speed * this.combo;
    this.speed = Math.min(SPEED.MAX, 1 + (this.distance / SPEED.RAMP_DISTANCE) * missionBoost);
    this.comboTimer -= sDt;
    if (this.comboTimer <= 0) this.combo = 1;
    this.shake = Math.max(0, this.shake - sDt * 16);
    this.flash = Math.max(0, this.flash - sDt * 3.6);
    this.speedBurst = Math.max(0, this.speedBurst - sDt * 2.8);

    // Speed milestone
    const speedInt = Math.floor(this.speed);
    if (speedInt > this.lastSpeedMilestone && speedInt >= 2) {
      this.lastSpeedMilestone = speedInt;
      sfx.milestone();
      this.addToast(`🚀 速度 ${speedInt}.0x！`);
      this.flash = 1;
    }

    // Mission
    if (!this.missionComplete && this.coins >= 20) {
      this.missionComplete = true;
      this.score += 400;
      this.flash = 1;
      this.speedBurst = 1;
      this.addToast('任务完成 +400');
    }

    // Spawn
    this.spawner.update(dt, this.speed, this.objects);

    // Update objects
    for (const obj of this.objects) {
      obj.z -= dt * (0.35 + this.speed * 0.18);
      if (obj.kind === 'coin' || obj.kind === 'shield' || obj.kind === 'magnet') obj.spin += dt * 10;
      if (obj.kind === 'coin' && this.player.magnet > 0) this.applyMagnet(obj, dt);
      if (!obj.hit && this.checkCollision(obj)) this.handleCollision(obj);
    }
    this.objects = this.objects.filter(o => o.z > -0.1 && !o.hit);

    // Particles
    this.particles = this.particles
      .map(p => ({
        ...p,
        life: p.life - dt,
        x: p.x + p.vx * dt,
        y: p.y + p.vy * dt,
        vy: p.vy + (p.gravity ?? 260) * dt,
        rotation: (p.rotation || 0) + (p.spin || 0) * dt,
      }))
      .filter(p => p.life > 0);

    // HUD
    this.hud.update(this, this.player);

    // ── Render everything ──
    this.drawAll();
  }

  // ── Drawing ──
  drawAll() {
    const w = CONFIG.WIDTH;
    const h = CONFIG.HEIGHT;

    // ── Day sky ──
    this.bgGfx.clear();
    this.bgGfx.fillGradientStyle(B.SKY_TOP, B.SKY_TOP, B.SKY_MID, B.SKY_MID);
    this.bgGfx.fillRect(0, 0, w, h * 0.55);
    this.bgGfx.fillGradientStyle(B.SKY_MID, B.SKY_MID, B.SKY_BOT, B.SKY_BOT);
    this.bgGfx.fillRect(0, h * 0.55, w, h * 0.12);

    // Sun
    this.bgGfx.fillStyle(0xffeb3b, 0.15);
    this.bgGfx.fillCircle(w * 0.85, 50, 55);
    this.bgGfx.fillStyle(0xffeb3b, 0.25);
    this.bgGfx.fillCircle(w * 0.85, 50, 40);
    this.bgGfx.fillStyle(0xffeb3b);
    this.bgGfx.fillCircle(w * 0.85, 50, 24);

    // Clouds (parallax)
    this.bgGfx.fillStyle(0xffffff, 0.6);
    const cx = (this.distance * 0.1) % 700;
    for (let i = 0; i < 3; i++) {
      const bx = ((i * 300 - cx + 960) % 960) - 100;
      const by = 60 + i * 30;
      this.bgGfx.fillEllipse(bx, by, 110, 30);
      this.bgGfx.fillEllipse(bx + 40, by - 8, 70, 25);
      this.bgGfx.fillEllipse(bx + 80, by, 90, 28);
    }

    // ── Parallax buildings (2 layers) ──
    const buildingColors = B.BUILDING;
    this.bgGfx.fillStyle(0x2ecc71);
    this.bgGfx.fillRect(0, h * 0.26, w, h * 0.04);

    // Far layer (slow scroll)
    for (let i = 0; i < 12; i++) {
      const bw = 30 + (i % 3) * 14;
      const bh = 25 + ((i * 31 + 7) % 55);
      const bx = ((i * 85 + this.distance * 0.02) % (w + bw)) - bw;
      const by = h * 0.27 - bh;
      this.bgGfx.fillStyle(buildingColors[(i + 2) % buildingColors.length]);
      this.bgGfx.fillRect(bx, by, bw, bh);
      this.bgGfx.fillStyle(0xffffff, 0.2);
      for (let wy = by + 5; wy < h * 0.27 - 5; wy += 14) {
        this.bgGfx.fillRect(bx + 6, wy, 4, 6);
      }
    }

    // Near layer (fast scroll - more detail)
    for (let i = 0; i < 10; i++) {
      const bw = 40 + (i % 3) * 22;
      const bh = 35 + ((i * 43 + 13) % 72);
      const bx = ((i * 100 + this.distance * 0.08) % (w + bw)) - bw;
      const by = h * 0.27 - bh;
      this.bgGfx.fillStyle(buildingColors[i % buildingColors.length]);
      this.bgGfx.fillRect(bx, by, bw, bh);
      // Windows
      this.bgGfx.fillStyle(0xffffff, 0.35);
      for (let wy = by + 7; wy < h * 0.27 - 8; wy += 14) {
        for (let wx = bx + 7; wx < bx + bw - 7; wx += 12) {
          if ((wx + wy) % 4 !== 0) {
            this.bgGfx.fillStyle(0xffeb3b, 0.45);
            this.bgGfx.fillRect(wx, wy, 5, 6);
            this.bgGfx.fillStyle(0xffffff, 0.35);
          }
        }
      }
    }

    // ── Ground / Grass ──
    this.trackGfx.clear();
    this.trackGfx.fillStyle(B.GRASS);
    this.trackGfx.fillRect(0, h * 0.30, w, h * 0.70);

    // ── Track bed ──
    const center = w / 2;
    const railTop = h * 0.30;
    const railBottom = h * 0.96;

    // Track trapezoid
    this.trackGfx.fillStyle(B.TRACK);
    this.trackGfx.fillTriangle(
      center - w * 0.12, railTop,
      center + w * 0.12, railTop,
      w * 0.82, railBottom
    );
    this.trackGfx.fillTriangle(
      center - w * 0.12, railTop,
      center + w * 0.12, railTop,
      w * 0.18, railBottom
    );

    // Darker track center
    this.trackGfx.fillStyle(B.TRACK_DARK);
    this.trackGfx.fillTriangle(
      center - w * 0.06, railTop,
      center + w * 0.06, railTop,
      w * 0.55, railBottom
    );
    this.trackGfx.fillTriangle(
      center - w * 0.06, railTop,
      center + w * 0.06, railTop,
      w * 0.45, railBottom
    );

    // Rails (thick & bright)
    for (const lane of LANES) {
      const l = center + lane * w * 0.044;
      // Rail shadow
      this.trackGfx.lineStyle(8, 0x000000, 0.2);
      this.trackGfx.beginPath();
      this.trackGfx.moveTo(l - w * 0.017 + 2, railTop + 2);
      this.trackGfx.lineTo(l - w * 0.050 + 2, railBottom + 2);
      this.trackGfx.strokePath();
      this.trackGfx.beginPath();
      this.trackGfx.moveTo(l + w * 0.017 + 2, railTop + 2);
      this.trackGfx.lineTo(l + w * 0.050 + 2, railBottom + 2);
      this.trackGfx.strokePath();
      // Rail main
      this.trackGfx.lineStyle(7, 0x95a5a6);
      this.trackGfx.beginPath();
      this.trackGfx.moveTo(l - w * 0.017, railTop);
      this.trackGfx.lineTo(l - w * 0.050, railBottom);
      this.trackGfx.strokePath();
      this.trackGfx.beginPath();
      this.trackGfx.moveTo(l + w * 0.017, railTop);
      this.trackGfx.lineTo(l + w * 0.050, railBottom);
      this.trackGfx.strokePath();
      // Rail highlight (top edge)
      this.trackGfx.lineStyle(2, 0xd5dbdb, 0.5);
      this.trackGfx.beginPath();
      this.trackGfx.moveTo(l - w * 0.017 - 1, railTop - 1);
      this.trackGfx.lineTo(l - w * 0.050 - 1, railBottom - 1);
      this.trackGfx.strokePath();
      this.trackGfx.beginPath();
      this.trackGfx.moveTo(l + w * 0.017 + 1, railTop - 1);
      this.trackGfx.lineTo(l + w * 0.050 + 1, railBottom - 1);
      this.trackGfx.strokePath();
    }

    // Lane markers (dashed center lines)
    this.trackGfx.lineStyle(3, 0xffffff, 0.18);
    for (let i = 0; i < 30; i++) {
      const t = ((this.distance / 100 + i) % 30) / 30;
      const yy = railTop + t * (railBottom - railTop);
      const spread = w * (0.13 + t * 0.68);
      // Between lane -1 and 0
      this.trackGfx.beginPath();
      this.trackGfx.moveTo(center - spread * 0.42, yy);
      this.trackGfx.lineTo(center - spread * 0.38, yy + 8);
      this.trackGfx.strokePath();
      // Between lane 0 and 1
      this.trackGfx.beginPath();
      this.trackGfx.moveTo(center + spread * 0.38, yy);
      this.trackGfx.lineTo(center + spread * 0.42, yy + 8);
      this.trackGfx.strokePath();
    }

    // Sleepers (cross ties)
    this.trackGfx.lineStyle(6, B.SLEEPER, 0.35);
    for (let i = 0; i < 24; i++) {
      const t = ((this.distance / 160 + i) % 24) / 24;
      const yy = railTop + t * (railBottom - railTop);
      const spread = w * (0.12 + t * 0.65);
      this.trackGfx.beginPath();
      this.trackGfx.moveTo(center - spread / 2, yy);
      this.trackGfx.lineTo(center + spread / 2, yy);
      this.trackGfx.strokePath();
    }

    // --- Objects ---
    this.objGfx.clear();
    const sorted = [...this.objects].sort((a, b) => b.z - a.z);
    for (const obj of sorted) {
      const pos = this.objectScreen(obj);
      if (pos.scale <= 0.16 || obj.hit) continue;

      const g = this.objGfx;
      const border = Math.max(2, pos.scale * 2);

      // Shadow underneath obstacles for depth
      if (obj.kind === 'obstacle') {
        g.fillStyle(0x000000, 0.25);
        g.fillEllipse(pos.x, pos.y + 2, pos.w * 0.8, pos.h * 0.08);
      }

      if (obj.kind === 'coin') {
        const size = Math.max(5, pos.w / 2);
        g.fillStyle(0xffd34e);
        g.fillCircle(pos.x, pos.y - pos.h / 2, size);
        g.lineStyle(border, 0xffffff, 0.7);
        g.strokeCircle(pos.x, pos.y - pos.h / 2, size);
      } else if (obj.kind === 'shield') {
        g.fillStyle(0x45b7d1);
        g.fillCircle(pos.x, pos.y - pos.h / 2, pos.w / 2);
        g.lineStyle(border, 0xffffff, 0.5);
        g.strokeCircle(pos.x, pos.y - pos.h / 2, pos.w / 2);
      } else if (obj.kind === 'magnet') {
        g.fillStyle(0xff6b6b);
        g.fillCircle(pos.x, pos.y - pos.h / 2, pos.w / 2);
        g.lineStyle(border, 0xffffff, 0.5);
        g.strokeCircle(pos.x, pos.y - pos.h / 2, pos.w / 2);
      } else if (obj.type === 'gate') {
        g.fillStyle(0xef4c4f);
        g.fillRect(pos.x - pos.w / 2, pos.y - pos.h, pos.w, pos.h);
        g.lineStyle(border, 0xffffff, 0.6);
        g.strokeRect(pos.x - pos.w / 2, pos.y - pos.h, pos.w, pos.h);
        // Warning stripes
        g.fillStyle(0xfeca57);
        g.fillRect(pos.x - pos.w * 0.3, pos.y - pos.h * 0.15, pos.w * 0.6, pos.h * 0.08);
      } else if (obj.type === 'barrier') {
        g.fillStyle(0xf7833d);
        g.fillRect(pos.x - pos.w / 2, pos.y - pos.h, pos.w, pos.h);
        g.lineStyle(border, 0xffffff, 0.6);
        g.strokeRect(pos.x - pos.w / 2, pos.y - pos.h, pos.w, pos.h);
        // X mark
        g.lineStyle(border, 0xffffff, 0.3);
        g.beginPath(); g.moveTo(pos.x - pos.w * 0.3, pos.y - pos.h * 0.75);
        g.lineTo(pos.x + pos.w * 0.3, pos.y - pos.h * 0.25); g.strokePath();
        g.beginPath(); g.moveTo(pos.x + pos.w * 0.3, pos.y - pos.h * 0.75);
        g.lineTo(pos.x - pos.w * 0.3, pos.y - pos.h * 0.25); g.strokePath();
      } else if (obj.type === 'cone') {
        g.fillStyle(0xff8b2e);
        g.beginPath();
        g.moveTo(pos.x, pos.y - pos.h);
        g.lineTo(pos.x + pos.w / 2, pos.y);
        g.lineTo(pos.x - pos.w / 2, pos.y);
        g.closePath(); g.fillPath();
        g.lineStyle(border, 0xffffff, 0.6);
        g.beginPath();
        g.moveTo(pos.x, pos.y - pos.h);
        g.lineTo(pos.x + pos.w / 2, pos.y);
        g.lineTo(pos.x - pos.w / 2, pos.y);
        g.closePath(); g.strokePath();
        // Stripe
        g.fillStyle(0xffffff, 0.5);
        g.fillRect(pos.x - pos.w * 0.2, pos.y - pos.h * 0.55, pos.w * 0.4, pos.h * 0.07);
      } else if (obj.type === 'train') {
        g.fillStyle(0x4ecdc4);
        g.fillRect(pos.x - pos.w / 2, pos.y - pos.h, pos.w, pos.h);
        g.lineStyle(border, 0xffffff, 0.5);
        g.strokeRect(pos.x - pos.w / 2, pos.y - pos.h, pos.w, pos.h);
        g.fillStyle(0x162027);
        g.fillRect(pos.x - pos.w * 0.32, pos.y - pos.h * 0.70, pos.w * 0.64, pos.h * 0.22);
        g.fillStyle(0xffeb3b, 0.6);
        g.fillCircle(pos.x - pos.w * 0.22, pos.y - pos.h * 0.58, pos.w * 0.08);
        g.fillCircle(pos.x + pos.w * 0.22, pos.y - pos.h * 0.58, pos.w * 0.08);
      }
    }

    // --- Particles & Toasts ---
    this.particleGfx.clear();
    const ef = this.particleGfx;
    for (const p of this.particles) {
      // Toast messages
      if (p.toastText) {
        const alpha = Math.min(1, p.life * 2);
        const lift = (1 - alpha) * 10;
        ef.fillStyle(0x000000, 0.5);
        ef.fillRoundedRect(CONFIG.WIDTH / 2 - 130, p.y - 18 - lift, 260, 36, 8);
        // We'll draw toast text with Phaser text instead
        continue;
      }
      // Regular particles
      const alpha = Math.max(0, Math.min(1, p.life * 2));
      ef.fillStyle(p.colorInt || 0xffd34e, alpha);
      ef.fillCircle(p.x, p.y, p.size || 3);
    }

    // Toast text
    const toast = this.particles.find(p => p.toastText && p.life > 0);
    if (toast) {
      if (!this.toastText) {
        this.toastText = this.add.text(CONFIG.WIDTH / 2, 0, '', {
          fontSize: '20px', fontFamily: 'Microsoft YaHei, sans-serif',
          fontStyle: '900', color: '#fff8c8',
          stroke: '#000', strokeThickness: 3,
        }).setOrigin(0.5).setDepth(90);
      }
      const alpha = Math.min(1, toast.life * 2);
      const lift = (1 - alpha) * 10;
      this.toastText.setText(toast.toastText);
      this.toastText.setAlpha(alpha);
      this.toastText.setPosition(CONFIG.WIDTH / 2, toast.y - lift);
    } else if (this.toastText) {
      this.toastText.setAlpha(0);
    }

    // --- Screen effects ---
    this.effectGfx.clear();

    // Speed lines
    const speedI = Math.max(0, (this.speed - 1.15) / 2.1) + this.speedBurst * 0.45;
    if (speedI > 0.02) {
      for (let i = 0; i < 14; i++) {
        const side = i % 2 === 0 ? -1 : 1;
        const off = ((i * 73 + this.distance * 0.38) % h) / h;
        const y = h * (0.28 + off * 0.66);
        const ex = side < 0 ? w * 0.08 : w * 0.92;
        this.effectGfx.lineStyle(2, i % 3 === 0 ? 0xffd34e : 0x75b7ff, Math.min(0.45, speedI));
        this.effectGfx.beginPath();
        this.effectGfx.moveTo(center + (ex - center) * 0.3, y);
        this.effectGfx.lineTo(ex, y + speedI * 20);
        this.effectGfx.strokePath();
      }
    }

    // Flash
    if (this.flash > 0) {
      this.effectGfx.fillStyle(0xfff4b8, Math.min(0.35, this.flash * 0.35));
      this.effectGfx.fillRect(0, 0, w, h);
    }

    // Combo screen glow
    if (this.combo > 1) {
      const ci = (this.combo - 1) / 7;
      const cg = this.effectGfx;
      // Top & bottom hot edge
      cg.fillStyle(0xffd34e, ci * 0.08);
      cg.fillRect(0, 0, w, 10 + ci * 8);
      cg.fillRect(0, h - 10 - ci * 8, w, 10 + ci * 8);
      // Side cool edge
      cg.fillStyle(0x45b7d1, ci * 0.05);
      cg.fillRect(0, 0, 8 + ci * 4, h);
      cg.fillRect(w - 8 - ci * 4, 0, 8 + ci * 4, h);
    }

    // Shake
    if (this.shake > 0) {
      this.cameras.main.setScroll(
        (Math.random() - 0.5) * this.shake * 8,
        (Math.random() - 0.5) * this.shake * 5
      );
    } else {
      this.cameras.main.setScroll(0, 0);
    }
  }

  // ── Collision ──
  checkCollision(obj) {
    const pos = this.objectScreen(obj);
    if (pos.scale < 1.3 || pos.scale > 1.88) return false;

    const ph = this.player.getVisualHeight();
    const pT = this.player.y - ph;
    const pB = this.player.y;
    const pL = this.player.x - this.player.width / 2;
    const pR = this.player.x + this.player.width / 2;
    const oL = pos.x - pos.w / 2;
    const oR = pos.x + pos.w / 2;
    const oT = pos.y - pos.h;
    const oB = pos.y;

    if (!(pR > oL && pL < oR && pB > oT && pT < oB)) return false;
    if (obj.type === 'gate') return this.player.sliding <= 0;
    if (obj.type === 'barrier' || obj.type === 'cone') return this.player.jump < 62;
    return true;
  }

  handleCollision(obj) {
    if (obj.kind === 'coin') {
      if (obj.hit) return;
      obj.hit = true;
      this.coins += 1;
      this.combo = Math.min(8, this.combo + 1);
      this.comboTimer = 2.4;
      this.score += 25 * this.combo;
      this.speedBurst = Math.max(this.speedBurst, 0.22);
      sfx.coin();
      this.burstEffect(obj);
      const pos = this.objectScreen(obj);
      this.addFloatingScore(pos.x, pos.y - pos.h, 25 * this.combo);
      return;
    }
    if (obj.kind === 'shield') {
      sfx.powerup();
      obj.hit = true;
      this.player.shield = 8;
      this.score += 150;
      this.flash = Math.max(this.flash, 0.32);
      this.addToast('获得护盾');
      return;
    }
    if (obj.kind === 'magnet') {
      sfx.powerup();
      obj.hit = true;
      this.player.magnet = 8;
      this.score += 150;
      this.flash = Math.max(this.flash, 0.24);
      this.addToast('获得磁铁');
      return;
    }
    // Obstacle + shield
    if (this.player.shield > 0) {
      sfx.hit();
      obj.hit = true;
      this.player.shield = Math.max(0, this.player.shield - 3.4);
      this.score += 120;
      this.shake = 0.8;
      this.flash = Math.max(this.flash, 0.36);
      this.addToast('护盾抵挡');
      return;
    }
    // Game over
    sfx.gameOver();
    this.shake = 1.2;
    this.endGame();
  }

  applyMagnet(obj, dt) {
    const pos = this.objectScreen(obj);
    const dx = this.player.x - pos.x;
    const dy = (this.player.y - this.player.height * 0.62) - pos.y;
    if (Math.hypot(dx, dy) < CONFIG.WIDTH * 0.26) {
      obj.pull = Math.min(1, obj.pull + dt * 4.2);
      if (obj.pull > 0.72) {
        obj.hit = true;
        this.coins += 1;
        this.combo = Math.min(8, this.combo + 1);
        this.comboTimer = 2.4;
        this.score += 25 * this.combo;
        this.speedBurst = Math.max(this.speedBurst, 0.22);
      }
    }
  }

  burstEffect(obj) {
    const pos = this.objectScreen(obj);
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x: pos.x, y: pos.y - pos.h / 2,
        vx: (Math.random() - 0.5) * 160,
        vy: (Math.random() - 0.7) * 160,
        life: 0.3 + Math.random() * 0.25,
        size: 2 + Math.random() * 3,
        colorInt: 0xffd34e,
        gravity: 140,
        rotation: 0, spin: 0,
      });
    }
  }

  landingDust() {
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x: this.player.x + (Math.random() - 0.5) * 20,
        y: this.player.y,
        vx: (Math.random() - 0.5) * 90,
        vy: -(30 + Math.random() * 60),
        life: 0.3 + Math.random() * 0.2,
        size: 1.5 + Math.random() * 2.5,
        colorInt: 0xb8c1bb,
        gravity: 60,
        rotation: 0, spin: 0,
      });
    }
  }

  addFloatingScore(x, y, amount) {
    const txt = this.add.text(x, y, `+${amount}`, {
      fontSize: '26px', fontFamily: 'Arial, sans-serif',
      fontStyle: '900', color: '#ffd34e',
      stroke: '#000', strokeThickness: 5,
      shadow: { offsetX: 1, offsetY: 2, color: '#000', blur: 4, fill: true },
    }).setOrigin(0.5).setDepth(60);

    this.tweens.add({
      targets: txt,
      y: y - 70,
      alpha: 0,
      scale: 1.4,
      duration: 700,
      ease: 'Power2',
      onComplete: () => txt.destroy(),
    });
  }

  addToast(text) {
    this.particles.push({
      toastText: text,
      life: 1.5,
      y: CONFIG.HEIGHT * 0.28,
    });
  }

  endGame() {
    const score = Math.floor(this.score);
    this.player.alive = false;
    this.flash = 0.55;

    if (score > this.best) {
      this.best = score;
      localStorage.setItem(BEST_KEY, String(score));
    }

    sfx.stopMusic();
    this.cameras.main.shake(200, 0.012);
    this.slowMo = 0.2;

    this.time.delayedCall(700, () => {
      this.slowMo = 1;
      this.cameras.main.fadeOut(300, 7, 16, 20);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('GameOver', { score, coins: this.coins, best: this.best });
      });
    });
  }

  togglePause() {
    this.paused = !this.paused;
    if (this.paused) {
      this.overlayBg.setAlpha(0.6).setFillStyle(0x000000, 0.6);
      this.overlayPanel.setVisible(true);
      this.overlayTitle.setText('已暂停').setVisible(true);
      this.overlayCopy.setText('按 P 或点击按钮继续').setVisible(true);
      this.overlayBtn.setVisible(true);
      this.overlayBtnText.setText('继续').setVisible(true);
    } else {
      this.resumeGame();
    }
  }

  resumeGame() {
    this.paused = false;
    this.overlayBg.setAlpha(0);
    this.overlayPanel.setVisible(false);
    this.overlayTitle.setVisible(false);
    this.overlayCopy.setVisible(false);
    this.overlayBtn.setVisible(false);
    this.overlayBtnText.setVisible(false);
  }
}
