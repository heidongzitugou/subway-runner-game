import * as Phaser from 'phaser';
import { CONFIG } from '../utils/constants.js';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOver');
  }

  init(data) {
    this.finalScore = data.score || 0;
    this.finalCoins = data.coins || 0;
    this.finalBest = data.best || 0;
  }

  create() {
    const w = CONFIG.WIDTH, h = CONFIG.HEIGHT;

    // Bright sky
    this.add.rectangle(w / 2, h / 2, w, h, 0x4ecdc4);
    this.add.rectangle(w / 2, h * 0.65, w, h * 0.7, 0x87ceeb);
    this.add.rectangle(w / 2, h, w, h * 0.30, 0x2ecc71);

    // Overlay
    this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.55);

    // Panel
    const panel = this.add.rectangle(w / 2, h * 0.42, 400, 300, 0xffffff, 0.12);
    panel.setStrokeStyle(2, 0xffd34e, 0.3);

    // Title
    this.add.text(w / 2, h * 0.22, '游戏结束', {
      fontSize: '36px', fontFamily: 'Arial, sans-serif',
      fontStyle: '900', color: '#ff6b6b',
      stroke: '#000', strokeThickness: 5,
    }).setOrigin(0.5);

    // Score with animation
    const scoreText = this.add.text(w / 2, h * 0.34, '0', {
      fontSize: '64px', fontFamily: 'Arial, sans-serif',
      fontStyle: '900', color: '#fff',
      stroke: '#000', strokeThickness: 6,
      shadow: { offsetX: 2, offsetY: 4, color: '#000', blur: 8, fill: true },
    }).setOrigin(0.5);

    // Coins
    this.add.text(w / 2, h * 0.44, `💰 ${this.finalCoins}`, {
      fontSize: '22px', fontFamily: 'Arial, sans-serif',
      fontStyle: '900', color: '#ffd34e',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setAlpha(0);

    // Best
    this.add.text(w / 2, h * 0.50, `🏆 最高 ${this.finalBest}`, {
      fontSize: '18px', fontFamily: 'Arial, sans-serif',
      fontStyle: '700', color: '#ffeaa7',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setAlpha(0);

    // Score counter
    this.tweens.addCounter({
      from: 0, to: this.finalScore,
      duration: 1500, ease: 'Power2',
      onUpdate: (t) => scoreText.setText(String(Math.floor(t.getValue()))),
    });

    // Fade in stats
    this.tweens.add({
      targets: this.children.list.slice(-2),
      alpha: 1, duration: 500, delay: 1000,
    });

    // Retry button
    const btnBg = this.add.rectangle(w / 2, h * 0.64, 220, 54, 0xff6b6b);
    btnBg.setStrokeStyle(3, 0xff4757);
    btnBg.setInteractive({ useHandCursor: true });
    btnBg.setAlpha(0);
    this.add.rectangle(w / 2 + 3, h * 0.64 + 4, 220, 54, 0x000000, 0.15).setAlpha(0);

    const btnText = this.add.text(w / 2, h * 0.64, '▶  再来一局', {
      fontSize: '22px', fontFamily: 'Arial, sans-serif',
      fontStyle: '900', color: '#fff',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({ targets: [btnBg, btnText, btnText.getTopLeft()], alpha: 1, duration: 400, delay: 1200 });

    btnBg.on('pointerdown', () => {
      this.cameras.main.fadeOut(200, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Game'));
    });

    this.input.keyboard.on('keydown-ENTER', () => {
      this.cameras.main.fadeOut(200, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Game'));
    });
    this.input.keyboard.on('keydown-SPACE', () => {
      this.cameras.main.fadeOut(200, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Game'));
    });

    this.cameras.main.fadeIn(400, 0, 0, 0);
  }
}
