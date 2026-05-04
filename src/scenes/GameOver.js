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
    const w = CONFIG.WIDTH;
    const h = CONFIG.HEIGHT;

    // Dark overlay
    this.add.rectangle(w / 2, h / 2, w, h, 0x071014, 0.85);

    // Panel
    const panelBg = this.add.rectangle(w / 2, h * 0.42, 420, 300, 0x0a161c, 0.9);
    panelBg.setStrokeStyle(1, 0x2a4440, 0.6);

    // Title
    this.add.text(w / 2, h * 0.24, '撞上障碍', {
      fontSize: '36px', fontFamily: 'Microsoft YaHei, sans-serif',
      fontStyle: '900', color: '#ef4c4f',
      stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5);

    // Score animation
    const scoreText = this.add.text(w / 2, h * 0.36, '0', {
      fontSize: '64px', fontFamily: 'Arial, sans-serif',
      fontStyle: '900', color: '#fff4bd',
      stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5);

    // Stats
    const coinText = this.add.text(w / 2, h * 0.46, `金币 ${this.finalCoins}`, {
      fontSize: '18px', fontFamily: 'Microsoft YaHei, sans-serif',
      color: '#ffd34e',
    }).setOrigin(0.5).setAlpha(0);

    const bestText = this.add.text(w / 2, h * 0.52, `最高分 ${this.finalBest}`, {
      fontSize: '16px', fontFamily: 'Microsoft YaHei, sans-serif',
      color: '#b8c5bd',
    }).setOrigin(0.5).setAlpha(0);

    // Score counter animation
    this.tweens.addCounter({
      from: 0,
      to: this.finalScore,
      duration: 1200,
      ease: 'Power2',
      onUpdate: (tween) => {
        scoreText.setText(String(Math.floor(tween.getValue())));
      },
    });

    this.tweens.add({
      targets: [coinText, bestText],
      alpha: 1,
      duration: 400,
      delay: 800,
    });

    // Retry button
    const btnBg = this.add.rectangle(w / 2, h * 0.64, 200, 50, 0xffd34e, 0.9)
      .setInteractive({ useHandCursor: true });
    btnBg.setStrokeStyle(0, 0xfff5b9, 1);
    btnBg.setAlpha(0);

    this.add.text(w / 2, h * 0.64, '再跑一局', {
      fontSize: '20px', fontFamily: 'Microsoft YaHei, sans-serif',
      fontStyle: '900', color: '#17160d',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: [btnBg, btnBg.getTopLeft()],
      alpha: 1,
      duration: 400,
      delay: 1000,
    });

    btnBg.on('pointerdown', () => {
      this.cameras.main.fadeOut(200, 7, 16, 20);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('Game');
      });
    });

    this.input.keyboard.on('keydown-ENTER', () => {
      this.cameras.main.fadeOut(200, 7, 16, 20);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('Game');
      });
    });

    this.input.keyboard.on('keydown-SPACE', () => {
      this.cameras.main.fadeOut(200, 7, 16, 20);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('Game');
      });
    });

    this.cameras.main.fadeIn(400, 7, 16, 20);
  }
}
