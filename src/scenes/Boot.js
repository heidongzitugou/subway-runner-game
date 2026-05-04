import * as Phaser from 'phaser';
import { CONFIG, COLORS } from '../utils/constants.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create() {
    const w = CONFIG.WIDTH;
    const h = CONFIG.HEIGHT;

    // ── Loading screen ──
    this.add.rectangle(w / 2, h / 2, w, h, 0x071014);

    const loadText = this.add.text(w / 2, h / 2 - 40, '生成素材中…', {
      fontSize: '18px',
      color: '#b8c5bd',
      fontFamily: 'Microsoft YaHei, sans-serif',
    }).setOrigin(0.5);

    const barBg = this.add.rectangle(w / 2, h / 2, 324, 28, 0x1a2c31);
    const bar = this.add.rectangle(w / 2 - 160, h / 2, 0, 22, 0x5be6b7).setOrigin(0, 0.5);

    // Generate textures programmatically (delayed to show loading bar)
    const tasks = [
      () => this.genBackground(),
      () => this.genPlayer(),
      () => this.genCoin(),
      () => this.genShield(),
      () => this.genMagnet(),
      () => this.genBarrier(),
      () => this.genGate(),
      () => this.genCone(),
      () => this.genTrain(),
    ];

    const barW = 320;
    let i = 0;
    const next = () => {
      if (i >= tasks.length) {
        loadText.destroy();
        barBg.destroy();
        bar.destroy();
        this.scene.start('Menu');
        return;
      }
      tasks[i]();
      i++;
      bar.width = (i / tasks.length) * barW;
      this.time.delayedCall(40, next);
    };
    next();
  }

  // ── Texture generators ──

  genBackground() {
    const g = this.add.graphics();
    const w = 960, h = 640;
    // Sky
    g.fillGradientStyle(0x23313b, 0x23313b, 0x121b21, 0x121b21);
    g.fillRect(0, 0, w, h * 0.45);
    g.fillStyle(0x071014, 0.55);
    g.fillRect(0, h * 0.25, w, h * 0.55);
    // City silhouette
    g.fillStyle(0x18242c);
    for (let i = 0; i < 14; i++) {
      const bw = w * (0.035 + (i % 4) * 0.012);
      const bh = h * (0.11 + ((i * 29) % 80) / 360);
      g.fillRect(i * 68, h * 0.29 - bh, bw, bh);
    }
    g.generateTexture('background', w, h);
    g.destroy();
  }

  genPlayer() {
    const g = this.add.graphics();
    const w = 80, h = 120;
    // Body
    g.fillStyle(0x5be6b7);
    g.fillRoundedRect(20, 40, 40, 50, 6);
    // Head
    g.fillStyle(0x1a2c33);
    g.fillCircle(40, 28, 18);
    // Visor
    g.fillStyle(0xffd34e);
    g.fillRect(24, 24, 32, 6);
    // Legs
    g.fillStyle(0x42c9a0);
    g.fillRect(24, 88, 12, 24);
    g.fillRect(44, 88, 12, 24);
    // Arms
    g.fillStyle(0x42c9a0);
    g.fillRect(12, 50, 10, 30);
    g.fillRect(58, 50, 10, 30);
    g.generateTexture('player', w, h);
    g.destroy();
  }

  genCoin() {
    const g = this.add.graphics();
    const s = 40;
    g.fillStyle(0xffd34e);
    g.fillCircle(s / 2, s / 2, s / 2 - 2);
    g.lineStyle(2, 0xfff5b9);
    g.strokeCircle(s / 2, s / 2, s / 2 - 2);
    g.fillStyle(0x8a6310);
    g.fillRect(s / 2 - 4, s / 2 + 6, 8, 2);
    g.generateTexture('coin', s, s);
    g.destroy();
  }

  genShield() {
    const g = this.add.graphics();
    const s = 48;
    g.fillStyle(0x68a7ff);
    g.beginPath();
    g.moveTo(s / 2, 4);
    g.lineTo(44, 14);
    g.lineTo(44, 30);
    g.lineTo(s / 2, 48);
    g.lineTo(4, 30);
    g.lineTo(4, 14);
    g.closePath();
    g.fillPath();
    g.fillStyle(0xffffff, 0.3);
    g.fillRect(s / 2 - 6, 16, 12, 12);
    g.generateTexture('shield', s, s);
    g.destroy();
  }

  genMagnet() {
    const g = this.add.graphics();
    const s = 48;
    g.fillStyle(0x5be6b7);
    g.fillRoundedRect(14, 4, 20, 14, 4);
    g.fillStyle(0xff3b6f);
    g.fillRoundedRect(4, 18, 10, 26, 4);
    g.fillRoundedRect(34, 18, 10, 26, 4);
    g.generateTexture('magnet', s, s);
    g.destroy();
  }

  genBarrier() {
    const g = this.add.graphics();
    const s = 70;
    g.fillStyle(0xf7833d);
    g.fillRoundedRect(4, 8, s - 8, s - 12, 6);
    g.lineStyle(3, 0xffb07a);
    g.strokeRoundedRect(4, 8, s - 8, s - 12, 6);
    // Warning X
    g.lineStyle(3, 0xffffff, 0.3);
    g.beginPath();
    g.moveTo(22, 24); g.lineTo(48, 56);
    g.moveTo(48, 24); g.lineTo(22, 56);
    g.strokePath();
    g.generateTexture('barrier', s, s);
    g.destroy();
  }

  genGate() {
    const g = this.add.graphics();
    const w = 70, h = 60;
    g.fillStyle(0xef4c4f);
    g.fillRect(2, 2, w - 4, 12);
    g.fillRect(2, 2, 10, h - 4);
    g.fillRect(w - 12, 2, 10, h - 4);
    g.generateTexture('gate', w, h);
    g.destroy();
  }

  genCone() {
    const g = this.add.graphics();
    const s = 50;
    g.fillStyle(0xff8b2e);
    g.beginPath();
    g.moveTo(s / 2, 4);
    g.lineTo(s - 4, s - 8);
    g.lineTo(4, s - 8);
    g.closePath();
    g.fillPath();
    g.fillStyle(0xfff2c7);
    g.fillRect(12, 20, 26, 5);
    g.fillRect(8, 32, 34, 5);
    g.fillRect(4, 44, 42, 5);
    g.generateTexture('cone', s, s);
    g.destroy();
  }

  genTrain() {
    const g = this.add.graphics();
    const w = 100, h = 140;
    // Body
    g.fillStyle(0x8eb0a6);
    g.fillRoundedRect(4, 20, w - 8, h - 24, 6);
    // Roof
    g.fillStyle(0x1f3333);
    g.fillRect(4, 20, w - 8, 16);
    // Windshield
    g.fillStyle(0x162027);
    g.fillRect(24, 38, w - 48, 28);
    // Red stripe
    g.fillStyle(0xef4c4f);
    g.fillRect(4, 88, w - 8, 6);
    // Headlights
    g.fillStyle(0xffd34e);
    g.fillRect(6, 44, 14, 8);
    g.fillRect(w - 20, 44, 14, 8);
    g.generateTexture('train', w, h);
    g.destroy();
  }
}
