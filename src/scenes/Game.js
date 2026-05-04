import Phaser from 'phaser';
import { CONFIG, LANES, COLORS, SPEED, GROUND_Y, BEST_KEY } from '../utils/constants.js';
import { Player } from '../objects/Player.js';
import { Spawner } from '../managers/Spawner.js';
import { HUD } from '../managers/HUD.js';

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
        if (dx > 0) this.player.mobileRight = true;
        else this.player.mobileLeft = true;
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

    this.cameras.main.fadeIn(300, 7, 16, 20);
  }

  createMobileControls() {
    const zoneH = 72;
    const zoneY = CONFIG.HEIGHT - zoneH / 2 - 10;
    const items = [
      { x: CONFIG.WIDTH * 0.12, label: '‹', cb: () => { if (!this.paused) this.player.mobileLeft = true; } },
      { x: CONFIG.WIDTH * 0.35, label: '跳', cb: () => { if (!this.paused) this.player.mobileJump = true; } },
      { x: CONFIG.WIDTH * 0.65, label: '滑', cb: () => { if (!this.paused) this.player.mobileSlide = true; } },
      { x: CONFIG.WIDTH * 0.88, label: '›', cb: () => { if (!this.paused) this.player.mobileRight = true; } },
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

    // Player
    this.player.handleInput();
    this.player.update(dt);

    // Game state
    const missionBoost = this.missionComplete ? 1.12 : 1;
    this.distance += dt * 540 * this.speed;
    this.score += dt * 21 * this.speed * this.combo;
    this.speed = Math.min(SPEED.MAX, 1 + (this.distance / SPEED.RAMP_DISTANCE) * missionBoost);
    this.comboTimer -= dt;
    if (this.comboTimer <= 0) this.combo = 1;
    this.shake = Math.max(0, this.shake - dt * 16);
    this.flash = Math.max(0, this.flash - dt * 3.6);
    this.speedBurst = Math.max(0, this.speedBurst - dt * 2.8);

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
      obj.z -= dt * (0.54 + this.speed * 0.3);
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

    // --- Background ---
    this.bgGfx.clear();
    this.bgGfx.fillGradientStyle(0x23313b, 0x23313b, 0x121b21, 0x121b21);
    this.bgGfx.fillRect(0, 0, w, h * 0.45);
    // Tunnel
    this.bgGfx.fillStyle(0x071014, 0.55);
    this.bgGfx.fillRect(0, h * 0.25, w, h * 0.55);
    // City
    this.bgGfx.fillStyle(0x18242c);
    for (let i = 0; i < 14; i++) {
      const bw = w * (0.035 + (i % 4) * 0.012);
      const bh = h * (0.11 + ((i * 29) % 80) / 360);
      const x = ((i * 97 + this.distance * 0.02) % (w + bw)) - bw;
      this.bgGfx.fillRect(x, h * 0.29 - bh, bw, bh);
    }

    // --- Tracks ---
    this.trackGfx.clear();
    const center = w / 2;
    const railTop = h * 0.28;
    const railBottom = h * 0.96;

    this.trackGfx.fillStyle(0x1a262b);
    this.trackGfx.beginPath();
    this.trackGfx.moveTo(center - w * 0.13, railTop);
    this.trackGfx.lineTo(center + w * 0.13, railTop);
    this.trackGfx.lineTo(w * 0.98, railBottom);
    this.trackGfx.lineTo(w * 0.02, railBottom);
    this.trackGfx.closePath();
    this.trackGfx.fillPath();

    // Rails
    for (const lane of LANES) {
      const l = center + lane * w * 0.044;
      this.trackGfx.lineStyle(3, 0xb8c1bb, 0.35);
      this.trackGfx.beginPath();
      this.trackGfx.moveTo(l - w * 0.017, railTop);
      this.trackGfx.lineTo(l - w * 0.056, railBottom);
      this.trackGfx.strokePath();
      this.trackGfx.beginPath();
      this.trackGfx.moveTo(l + w * 0.017, railTop);
      this.trackGfx.lineTo(l + w * 0.056, railBottom);
      this.trackGfx.strokePath();
    }

    // Cross ties
    this.trackGfx.lineStyle(1.5, 0xffd34e, 0.15);
    for (let i = 0; i < 16; i++) {
      const t = ((this.distance / 230 + i) % 16) / 16;
      const y = railTop + t * (railBottom - railTop);
      const spread = w * (0.14 + t * 0.8);
      this.trackGfx.beginPath();
      this.trackGfx.moveTo(center - spread / 2, y);
      this.trackGfx.lineTo(center + spread / 2, y);
      this.trackGfx.strokePath();
    }

    // --- Objects ---
    this.objGfx.clear();
    const sorted = [...this.objects].sort((a, b) => b.z - a.z);
    for (const obj of sorted) {
      const pos = this.objectScreen(obj);
      if (pos.scale <= 0.16 || obj.hit) continue;

      const g = this.objGfx;
      if (obj.kind === 'coin') {
        const size = Math.max(4, pos.w / 2);
        g.fillStyle(0xffd34e);
        g.fillCircle(pos.x, pos.y - pos.h / 2, size);
        g.lineStyle(2, 0xfff5b9);
        g.strokeCircle(pos.x, pos.y - pos.h / 2, size);
      } else if (obj.kind === 'shield') {
        g.fillStyle(0x68a7ff, 0.6);
        g.fillCircle(pos.x, pos.y - pos.h / 2, pos.w / 2);
      } else if (obj.kind === 'magnet') {
        g.fillStyle(0x5be6b7, 0.6);
        g.fillCircle(pos.x, pos.y - pos.h / 2, pos.w / 2);
      } else if (obj.type === 'gate') {
        g.fillStyle(0xef4c4f);
        g.fillRect(pos.x - pos.w / 2, pos.y - pos.h, pos.w, pos.h);
      } else if (obj.type === 'barrier') {
        g.fillStyle(0xf7833d);
        g.fillRect(pos.x - pos.w / 2, pos.y - pos.h, pos.w, pos.h);
      } else if (obj.type === 'cone') {
        g.fillStyle(0xff8b2e);
        g.beginPath();
        g.moveTo(pos.x, pos.y - pos.h);
        g.lineTo(pos.x + pos.w / 2, pos.y);
        g.lineTo(pos.x - pos.w / 2, pos.y);
        g.closePath();
        g.fillPath();
      } else if (obj.type === 'train') {
        g.fillStyle(0x8eb0a6);
        g.fillRect(pos.x - pos.w / 2, pos.y - pos.h, pos.w, pos.h);
        g.fillStyle(0x162027);
        g.fillRect(pos.x - pos.w * 0.28, pos.y - pos.h * 0.72, pos.w * 0.56, pos.h * 0.28);
        g.fillStyle(0xef4c4f);
        g.fillRect(pos.x - pos.w / 2, pos.y - pos.h * 0.38, pos.w, 5);
      }
    }

    // --- Particles & Toasts ---
    const ef = this.effectGfx;
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
      this.burstEffect(obj);
      return;
    }
    if (obj.kind === 'shield') {
      obj.hit = true;
      this.player.shield = 8;
      this.score += 150;
      this.flash = Math.max(this.flash, 0.32);
      this.addToast('获得护盾');
      return;
    }
    if (obj.kind === 'magnet') {
      obj.hit = true;
      this.player.magnet = 8;
      this.score += 150;
      this.flash = Math.max(this.flash, 0.24);
      this.addToast('获得磁铁');
      return;
    }
    // Obstacle + shield
    if (this.player.shield > 0) {
      obj.hit = true;
      this.player.shield = Math.max(0, this.player.shield - 3.4);
      this.score += 120;
      this.shake = 0.8;
      this.flash = Math.max(this.flash, 0.36);
      this.addToast('护盾抵挡');
      return;
    }
    // Game over
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

    this.cameras.main.shake(200, 0.012);

    this.time.delayedCall(700, () => {
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
