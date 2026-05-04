import Phaser from 'phaser';
import { CONFIG } from '../utils/constants.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    // Loading bar
    const w = CONFIG.WIDTH;
    const h = CONFIG.HEIGHT;
    const barW = 320;
    const barH = 24;

    const bg = this.add.rectangle(w / 2, h / 2, barW + 4, barH + 4, 0x1a2c31);
    const bar = this.add.rectangle(w / 2 - barW / 2, h / 2, 0, barH, 0x5be6b7);
    bar.setOrigin(0, 0.5);

    const text = this.add.text(w / 2, h / 2 - 40, '加载中…', {
      fontSize: '18px',
      color: '#b8c5bd',
      fontFamily: 'Microsoft YaHei, sans-serif',
    }).setOrigin(0.5);

    this.load.on('progress', (v) => { bar.width = barW * v; });
    this.load.on('complete', () => { bg.destroy(); bar.destroy(); text.destroy(); });

    // Load SVG assets
    this.load.svg('background', 'assets/background-night.svg', { width: 960, height: 640 });
    this.load.svg('player', 'assets/player-runner.svg', { width: 80, height: 120 });
    this.load.svg('coin', 'assets/coin-glow.svg', { width: 40, height: 40 });
    this.load.svg('shield', 'assets/power-shield.svg', { width: 48, height: 48 });
    this.load.svg('magnet', 'assets/power-magnet.svg', { width: 48, height: 48 });
    this.load.svg('barrier', 'assets/obstacle-barrier.svg', { width: 70, height: 70 });
    this.load.svg('gate', 'assets/obstacle-gate.svg', { width: 70, height: 60 });
    this.load.svg('cone', 'assets/obstacle-cone.svg', { width: 50, height: 60 });
    this.load.svg('train', 'assets/train-front.svg', { width: 120, height: 160 });
  }

  create() {
    this.scene.start('Menu');
  }
}
