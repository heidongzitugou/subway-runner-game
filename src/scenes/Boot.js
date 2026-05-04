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
      fontSize: '20px', color: '#fff', fontFamily: 'Arial, sans-serif', fontStyle: '900',
    }).setOrigin(0.5);

    const barBg = this.add.rectangle(w / 2, h / 2, 324, 28, 0xffffff, 0.3);
    const bar = this.add.rectangle(w / 2 - 160, h / 2, 0, 22, 0xffd34e).setOrigin(0, 0.5);

    const tasks = [
      () => this.gen('player', 140, 200, this.drawPlayer),
      () => this.gen('coin', 64, 64, this.drawCoin),
      () => this.gen('shield', 60, 68, this.drawShield),
      () => this.gen('magnet', 64, 64, this.drawMagnet),
      () => this.gen('barrier', 80, 100, this.drawBarrier),
      () => this.gen('gate', 90, 70, this.drawGate),
      () => this.gen('cone', 60, 76, this.drawCone),
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

  drawPlayer(g, w, h) {
    // Shadow
    g.fillStyle(0x000000, 0.1);
    g.fillEllipse(w / 2, h - 6, 50, 10);
    // Shoes
    g.fillStyle(0x2d3436);
    g.fillRoundedRect(30, h - 30, 28, 18, 6);
    g.fillRoundedRect(w - 58, h - 28, 28, 16, 6);
    // Legs
    g.fillStyle(0x34495e);
    g.fillRect(36, h - 50, 18, 24);
    g.fillRect(w - 54, h - 48, 18, 22);
    // Body (hoodie)
    g.fillStyle(0x45b7d1);
    g.fillRoundedRect(24, 50, w - 48, 70, 10);
    // Hoodie stripe
    g.fillStyle(0x3498db);
    g.fillRect(w / 2 - 4, 50, 8, 70);
    // Backpack
    g.fillStyle(0xff6b6b);
    g.fillRoundedRect(14, 56, 18, 40, 6);
    g.fillStyle(0xff4757);
    g.fillRoundedRect(16, 60, 14, 12, 3);
    // Arms
    g.fillStyle(0x45b7d1);
    g.fillRoundedRect(0, 56, 20, 38, 8);
    g.fillRoundedRect(w - 20, 54, 22, 38, 8);
    // Hands
    g.fillStyle(0xffdbac);
    g.fillCircle(14, 94, 7);
    g.fillCircle(w - 14, 92, 7);
    // Head
    g.fillStyle(0xffdbac);
    g.fillCircle(w / 2, 32, 26);
    // Hair
    g.fillStyle(0x2d3436);
    g.fillRoundedRect(w / 2 - 22, 8, 44, 18, 8);
    // Eyes
    g.fillStyle(0x2d3436);
    g.fillCircle(w / 2 - 8, 30, 4);
    g.fillCircle(w / 2 + 8, 30, 4);
    // Eye shine
    g.fillStyle(0xffffff, 0.8);
    g.fillCircle(w / 2 - 6, 28, 1.5);
    g.fillCircle(w / 2 + 10, 28, 1.5);
    // Mouth (smile)
    g.lineStyle(2, 0x2d3436);
    g.beginPath();
    g.arc(w / 2, 34, 6, 0.15, Math.PI - 0.15);
    g.strokePath();
  }

  drawCoin(g) {
    // Outer glow
    g.fillStyle(0xffd34e, 0.2);
    g.fillCircle(32, 32, 30);
    // Coin body
    g.fillStyle(0xffd34e);
    g.fillCircle(32, 32, 24);
    // Inner highlight
    g.fillStyle(0xffeb3b);
    g.fillCircle(30, 30, 18);
    // Border
    g.lineStyle(3, 0xf39c12);
    g.strokeCircle(32, 32, 24);
    // Dollar symbol
    g.fillStyle(0xe67e22);
    g.fillRect(29, 18, 6, 28);
    g.fillRect(23, 22, 18, 4);
    g.fillRect(23, 38, 18, 4);
    // Shine
    g.fillStyle(0xffffff, 0.3);
    g.fillEllipse(22, 22, 10, 6);
  }

  drawShield(g) {
    // Glow
    g.fillStyle(0x45b7d1, 0.15);
    g.fillCircle(30, 32, 28);
    // Shield shape
    g.fillStyle(0x45b7d1);
    g.beginPath();
    g.moveTo(30, 4);
    g.lineTo(54, 14);
    g.lineTo(54, 36);
    g.lineTo(30, 62);
    g.lineTo(6, 36);
    g.lineTo(6, 14);
    g.closePath();
    g.fillPath();
    // Border
    g.lineStyle(3, 0x74d4e8);
    g.beginPath();
    g.moveTo(30, 4);
    g.lineTo(54, 14);
    g.lineTo(54, 36);
    g.lineTo(30, 62);
    g.lineTo(6, 36);
    g.lineTo(6, 14);
    g.closePath();
    g.strokePath();
    // Shield emblem
    g.fillStyle(0xffffff, 0.4);
    g.fillRect(22, 22, 16, 20);
    g.fillStyle(0xffffff, 0.7);
    g.fillRect(26, 26, 8, 12);
  }

  drawMagnet(g) {
    // Glow
    g.fillStyle(0xff6b6b, 0.15);
    g.fillCircle(32, 32, 28);
    // Body
    g.fillStyle(0xff6b6b);
    g.fillRoundedRect(18, 4, 28, 18, 6);
    g.fillRoundedRect(4, 20, 18, 36, 6);
    g.fillRoundedRect(42, 20, 18, 36, 6);
    // Inner poles
    g.fillStyle(0xff4757);
    g.fillRoundedRect(8, 24, 10, 28, 4);
    g.fillRoundedRect(46, 24, 10, 28, 4);
    // Label N/S
    g.fillStyle(0xffffff, 0.5);
    g.fillRect(12, 32, 4, 8);
    g.fillRect(48, 32, 4, 8);
  }

  drawBarrier(g, w, h) {
    // Shadow
    g.fillStyle(0x000000, 0.15);
    g.fillEllipse(w / 2, h - 4, w - 4, 8);
    // Body
    g.fillStyle(0xff6b6b);
    g.fillRoundedRect(6, 8, w - 12, h - 14, 8);
    // Border
    g.lineStyle(3, 0xff4757, 0.8);
    g.strokeRoundedRect(6, 8, w - 12, h - 14, 8);
    // Warning stripes
    g.lineStyle(4, 0xffffff, 0.25);
    for (let i = 0; i < 5; i++) {
      const yy = 16 + i * 16;
      g.beginPath();
      g.moveTo(12, yy);
      g.lineTo(w - 12, yy + 10);
      g.strokePath();
    }
    // Top highlight
    g.fillStyle(0xffffff, 0.15);
    g.fillRoundedRect(10, 12, w - 20, 12, 4);
  }

  drawGate(g, w, h) {
    // Posts
    g.fillStyle(0xfeca57);
    g.fillRoundedRect(2, 2, 14, h - 4, 4);
    g.fillRoundedRect(w - 16, 2, 14, h - 4, 4);
    // Top bar
    g.fillStyle(0xff6b6b);
    g.fillRect(10, 2, w - 20, 16);
    // Warning stripes
    g.fillStyle(0xfeca57);
    g.fillRect(16, 4, w - 32, 6);
    g.fillStyle(0xff6b6b);
    g.fillRect(16, 10, w - 32, 6);
  }

  drawCone(g) {
    // Shadow
    g.fillStyle(0x000000, 0.12);
    g.fillEllipse(30, 70, 48, 8);
    // Cone body
    g.fillStyle(0xfeca57);
    g.beginPath();
    g.moveTo(30, 4);
    g.lineTo(54, 68);
    g.lineTo(6, 68);
    g.closePath();
    g.fillPath();
    // Border
    g.lineStyle(2, 0xff6b6b, 0.5);
    g.beginPath();
    g.moveTo(30, 4);
    g.lineTo(54, 68);
    g.lineTo(6, 68);
    g.closePath();
    g.strokePath();
    // White stripes
    g.fillStyle(0xffffff, 0.6);
    g.fillRect(16, 18, 28, 6);
    g.fillRect(12, 32, 36, 6);
    g.fillRect(8, 46, 44, 6);
    // Base
    g.fillStyle(0xff6b6b);
    g.fillRoundedRect(4, 60, 52, 12, 4);
  }

  drawTrain(g, w, h) {
    // Shadow
    g.fillStyle(0x000000, 0.15);
    g.fillEllipse(w / 2, h - 4, w - 10, 10);
    // Body
    g.fillStyle(0x4ecdc4);
    g.fillRoundedRect(6, 20, w - 12, h - 26, 10);
    // Border
    g.lineStyle(3, 0x45b7d1, 0.6);
    g.strokeRoundedRect(6, 20, w - 12, h - 26, 10);
    // Roof
    g.fillStyle(0x45b7d1);
    g.fillRoundedRect(4, 18, w - 8, 18, 6);
    // Windshield
    g.fillStyle(0x87ceeb);
    g.fillRoundedRect(28, 40, w - 56, 28, 6);
    // Windshield frame
    g.lineStyle(2, 0x45b7d1, 0.4);
    g.strokeRoundedRect(28, 40, w - 56, 28, 6);
    // Reflection
    g.fillStyle(0xffffff, 0.15);
    g.fillRoundedRect(34, 44, 44, 18, 4);
    // Red stripe
    g.fillStyle(0xff6b6b);
    g.fillRect(6, 90, w - 12, 8);
    // Headlights
    g.fillStyle(0xffeb3b);
    g.fillCircle(28, 48, 10);
    g.fillCircle(w - 28, 48, 10);
    g.fillStyle(0xffeb3b, 0.3);
    g.fillCircle(28, 48, 16);
    g.fillCircle(w - 28, 48, 16);
    // Wheels
    g.fillStyle(0x2d3436);
    g.fillCircle(28, h - 12, 12);
    g.fillCircle(w - 28, h - 12, 12);
    // Wheel detail
    g.fillStyle(0x636e72);
    g.fillCircle(28, h - 12, 6);
    g.fillCircle(w - 28, h - 12, 6);
  }
}
