import * as Phaser from 'phaser';
import { CONFIG, BEST_KEY, COLORS } from '../utils/constants.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
    const w = CONFIG.WIDTH, h = CONFIG.HEIGHT;

    // Sky background
    this.add.rectangle(w / 2, h / 2, w, h, 0x4ecdc4);
    this.add.rectangle(w / 2, h * 0.65, w, h * 0.7, 0x87ceeb);

    // Clouds
    this.add.ellipse(180, 80, 160, 50, 0xffffff, 0.5);
    this.add.ellipse(250, 70, 100, 40, 0xffffff, 0.5);
    this.add.ellipse(600, 110, 140, 45, 0xffffff, 0.5);
    this.add.ellipse(680, 100, 90, 35, 0xffffff, 0.5);

    // Sun
    this.add.circle(w - 120, 70, 50, 0xffeb3b, 0.2);
    this.add.circle(w - 120, 70, 35, 0xffeb3b, 0.35);
    this.add.circle(w - 120, 70, 22, 0xffeb3b);

    // Ground
    this.add.rectangle(w / 2, h, w, h * 0.35, 0x2ecc71);

    // Track stripes
    const g = this.add.graphics();
    g.lineStyle(4, 0xff8c42, 0.4);
    for (let i = 0; i < 6; i++) {
      const y = h * 0.75 + i * 30;
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(w, y);
      g.strokePath();
    }

    // Title panel
    const panel = this.add.rectangle(w / 2, h * 0.26, 420, 180, 0xffffff, 0.15);
    panel.setStrokeStyle(2, 0xffffff, 0.2);

    // Title
    const title = this.add.text(w / 2, h * 0.20, '地铁疾跑', {
      fontSize: '64px', fontFamily: 'Arial, sans-serif',
      fontStyle: '900', color: '#fff',
      stroke: '#2d3436', strokeThickness: 8,
      shadow: { offsetX: 3, offsetY: 5, color: '#000', blur: 10, fill: true },
    }).setOrigin(0.5).setAlpha(0);

    // Subtitle
    this.add.text(w / 2, h * 0.30, 'SUBWAY RUNNER', {
      fontSize: '16px', fontFamily: 'Arial, sans-serif',
      fontStyle: '900', color: '#ffffff',
    }).setOrigin(0.5).setAlpha(0.7);

    this.tweens.add({ targets: title, alpha: 1, y: h * 0.19, duration: 600, ease: 'Back.easeOut' });

    // Best score
    const best = localStorage.getItem(BEST_KEY);
    if (best && Number(best) > 0) {
      this.add.text(w / 2, h * 0.35, `🏆 最高分 ${best}`, {
        fontSize: '18px', fontFamily: 'Arial, sans-serif',
        fontStyle: '700', color: '#ffeaa7',
        stroke: '#000', strokeThickness: 3,
      }).setOrigin(0.5);
    }

    // Start button
    const btnBg = this.add.rectangle(w / 2, h * 0.50, 220, 56, 0xff6b6b).setInteractive({ useHandCursor: true });
    btnBg.setStrokeStyle(3, 0xff4757);
    // Shadow
    this.add.rectangle(w / 2 + 3, h * 0.50 + 4, 220, 56, 0x000000, 0.2);

    this.add.text(w / 2, h * 0.50, '▶  开始奔跑', {
      fontSize: '24px', fontFamily: 'Arial, sans-serif',
      fontStyle: '900', color: '#fff',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5);

    btnBg.on('pointerover', () => btnBg.setScale(1.05));
    btnBg.on('pointerout', () => btnBg.setScale(1));
    btnBg.on('pointerdown', () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Game'));
    });

    // Controls hint
    const hintY = h * 0.70;
    this.add.rectangle(w / 2, hintY, 300, 120, 0x000000, 0.3);

    const hints = [
      '← → / A D  切换轨道',
      '↑ / W / 空格  跳跃',
      '↓ / S  滑铲',
      'P  暂停',
    ];
    hints.forEach((t, i) => {
      this.add.text(w / 2, hintY - 40 + i * 26, t, {
        fontSize: '13px', fontFamily: 'Microsoft YaHei, Arial, sans-serif',
        color: '#dfe6e9',
      }).setOrigin(0.5);
    });

    this.add.text(w / 2, h * 0.88, '按 Enter / 空格 开始', {
      fontSize: '14px', fontFamily: 'Arial, sans-serif',
      color: '#dfe6e9',
    }).setOrigin(0.5);

    // Keyboard shortcuts
    this.input.keyboard.on('keydown-ENTER', () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Game'));
    });
    this.input.keyboard.on('keydown-SPACE', () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Game'));
    });

    this.cameras.main.fadeIn(400, 0, 0, 0);
  }
}
