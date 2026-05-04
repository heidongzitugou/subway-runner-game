import * as Phaser from 'phaser';
import { CONFIG } from '../utils/constants.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create() {
    const w = CONFIG.WIDTH, h = CONFIG.HEIGHT;

    this.add.rectangle(w / 2, h / 2, w, h, 0x4ecdc4);
    const loadText = this.add.text(w / 2, h / 2 - 40, '加载中…', {
      fontSize: '20px', color: '#fff', fontFamily: 'Arial, sans-serif',
      fontStyle: '900',
    }).setOrigin(0.5);

    const barBg = this.add.rectangle(w / 2, h / 2, 324, 28, 0xffffff, 0.3);
    const bar = this.add.rectangle(w / 2 - 160, h / 2, 0, 22, 0xffd34e).setOrigin(0, 0.5);

    const tasks = [
      () => this.gen('background', 960, 640, this.drawBg),
      () => this.gen('player', 120, 180, this.drawPlayer),
      () => this.gen('coin', 60, 60, this.drawCoin),
      () => this.gen('shield', 64, 64, this.drawShield),
      () => this.gen('magnet', 64, 64, this.drawMagnet),
      () => this.gen('barrier', 80, 100, this.drawBarrier),
      () => this.gen('gate', 80, 66, this.drawGate),
      () => this.gen('cone', 60, 72, this.drawCone),
      () => this.gen('train', 160, 200, this.drawTrain),
    ];

    let i = 0;
    const next = () => {
      if (i >= tasks.length) {
        loadText.destroy(); barBg.destroy(); bar.destroy();
        this.scene.start('Menu');
        return;
      }
      tasks[i]();
      i++;
      bar.width = (i / tasks.length) * 320;
      this.time.delayedCall(30, next);
    };
    next();
  }

  gen(key, w, h, drawFn) {
    const g = this.add.graphics();
    drawFn.call(this, g, w, h);
    g.generateTexture(key, w, h);
    g.destroy();
  }

  // ── Background texture ──
  drawBg(g) {
    // Sky gradient
    g.fillGradientStyle(0x4ecdc4, 0x4ecdc4, 0x87ceeb, 0x87ceeb);
    g.fillRect(0, 0, 960, 350);
    g.fillGradientStyle(0x87ceeb, 0x87ceeb, 0xfff8dc, 0xfff8dc);
    g.fillRect(0, 350, 960, 100);
    // Sun
    g.fillStyle(0xffeb3b, 0.4);
    g.fillCircle(820, 80, 50);
    g.fillStyle(0xffeb3b);
    g.fillCircle(820, 80, 30);
    // Clouds
    g.fillStyle(0xffffff, 0.7);
    g.fillEllipse(200, 100, 120, 40);
    g.fillEllipse(260, 90, 80, 35);
    g.fillEllipse(500, 130, 100, 35);
    g.fillEllipse(560, 125, 70, 30);
  }

  // ── Player ──
  drawPlayer(g, w, h) {
    // Body (bright blue hoodie)
    g.fillStyle(0x45b7d1);
    g.fillRoundedRect(18, 35, 44, 50, 8);
    // Head (slightly bigger = Q版)
    g.fillStyle(0xffdbac);
    g.fillCircle(40, 22, 20);
    // Hair
    g.fillStyle(0x2d3436);
    g.fillRoundedRect(22, 4, 36, 14, 6);
    // Eyes
    g.fillStyle(0x2d3436);
    g.fillCircle(33, 20, 3);
    g.fillCircle(47, 20, 3);
    // Smile
    g.lineStyle(2, 0x2d3436);
    g.beginPath(); g.arc(40, 26, 6, 0.2, Math.PI - 0.2); g.strokePath();
    // Legs
    g.fillStyle(0x2d3436);
    g.fillRect(24, 82, 12, 26);
    g.fillRect(44, 84, 12, 24);
    // Shoes
    g.fillStyle(0xff6b6b);
    g.fillRoundedRect(22, 104, 16, 10, 4);
    g.fillRoundedRect(42, 104, 16, 10, 4);
    // Backpack
    g.fillStyle(0xff6b6b);
    g.fillRoundedRect(10, 42, 12, 30, 4);
  }

  // ── Coin ──
  drawCoin(g) {
    g.fillStyle(0xffd34e);
    g.fillCircle(20, 20, 17);
    g.fillStyle(0xffeb3b);
    g.fillCircle(20, 20, 12);
    g.lineStyle(2, 0xf39c12);
    g.strokeCircle(20, 20, 17);
    // Dollar sign
    g.fillStyle(0xf39c12);
    g.fillRect(18, 12, 4, 16);
    g.fillRect(14, 14, 12, 3);
    g.fillRect(14, 23, 12, 3);
  }

  // ── Shield ──
  drawShield(g) {
    g.fillStyle(0x45b7d1);
    g.beginPath();
    g.moveTo(24, 2); g.lineTo(44, 10);
    g.lineTo(44, 26); g.lineTo(24, 44);
    g.lineTo(4, 26); g.lineTo(4, 10);
    g.closePath(); g.fillPath();
    g.fillStyle(0x74d4e8);
    g.fillRect(18, 14, 12, 14);
  }

  // ── Magnet ──
  drawMagnet(g) {
    g.fillStyle(0xff6b6b);
    g.fillRoundedRect(16, 6, 20, 14, 4);
    g.fillRoundedRect(6, 18, 12, 28, 4);
    g.fillRoundedRect(34, 18, 12, 28, 4);
    g.fillStyle(0xff4757);
    g.fillRoundedRect(8, 20, 8, 24, 3);
    g.fillRoundedRect(36, 20, 8, 24, 3);
  }

  // ── Barrier ──
  drawBarrier(g, w, h) {
    g.fillStyle(0xff6b6b);
    g.fillRoundedRect(4, 6, w - 8, h - 10, 6);
    g.lineStyle(3, 0xff4757);
    g.strokeRoundedRect(4, 6, w - 8, h - 10, 6);
    // Stripes
    g.lineStyle(4, 0xffffff, 0.25);
    for (let i = 0; i < 5; i++) {
      const yy = 14 + i * 14;
      g.beginPath(); g.moveTo(10, yy); g.lineTo(w - 10, yy + 8); g.strokePath();
    }
  }

  // ── Gate ──
  drawGate(g, w, h) {
    g.fillStyle(0xfeca57);
    g.fillRect(2, 2, w - 4, 10);
    g.fillRect(2, 2, 10, h - 4);
    g.fillRect(w - 12, 2, 10, h - 4);
    // Warning stripes
    g.fillStyle(0xff6b6b);
    g.fillRect(14, 4, w - 28, 6);
  }

  // ── Cone ──
  drawCone(g) {
    g.fillStyle(0xfeca57);
    g.beginPath();
    g.moveTo(22, 2); g.lineTo(42, 54); g.lineTo(2, 54);
    g.closePath(); g.fillPath();
    g.lineStyle(3, 0xff6b6b, 0.5);
    g.beginPath(); g.moveTo(22, 2); g.lineTo(42, 54); g.strokePath();
    g.beginPath(); g.moveTo(22, 2); g.lineTo(2, 54); g.strokePath();
    // Stripes
    g.fillStyle(0xffffff, 0.6);
    g.fillRect(12, 18, 20, 5);
    g.fillRect(8, 30, 28, 5);
    g.fillRect(4, 42, 36, 5);
  }

  // ── Train ──
  drawTrain(g, w, h) {
    // Body
    g.fillStyle(0x4ecdc4);
    g.fillRoundedRect(4, 18, w - 8, h - 22, 8);
    // Roof
    g.fillStyle(0x45b7d1);
    g.fillRect(4, 18, w - 8, 14);
    // Windows
    g.fillStyle(0x87ceeb);
    g.fillRoundedRect(20, 36, w - 40, 24, 4);
    // Window shine
    g.fillStyle(0xffffff, 0.2);
    g.fillRect(24, 40, 30, 16);
    // Stripe
    g.fillStyle(0xff6b6b);
    g.fillRect(4, 80, w - 8, 6);
    // Headlights
    g.fillStyle(0xffeb3b);
    g.fillCircle(20, 42, 8);
    g.fillCircle(w - 20, 42, 8);
    // Wheels
    g.fillStyle(0x2d3436);
    g.fillCircle(20, h - 10, 8);
    g.fillCircle(w - 20, h - 10, 8);
  }
}
