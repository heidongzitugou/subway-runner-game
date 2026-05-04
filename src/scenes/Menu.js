import Phaser from 'phaser';
import { CONFIG, BEST_KEY, COLORS } from '../utils/constants.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
    const w = CONFIG.WIDTH;
    const h = CONFIG.HEIGHT;

    // Background
    if (this.textures.exists('background')) {
      this.add.image(w / 2, h / 2, 'background').setDisplaySize(w, h).setAlpha(0.5);
    } else {
      this.add.rectangle(w / 2, h / 2, w, h, 0x071014);
    }

    // Tunnel scan lines
    const scan = this.add.graphics();
    scan.fillStyle(0x121b21, 0.3);
    for (let i = 0; i < h; i += 4) {
      scan.fillRect(0, i, w, 1);
    }

    // Title
    const title = this.add.text(w / 2, h * 0.22, '地铁疾跑', {
      fontSize: '72px',
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontStyle: '900',
      color: '#fff4bd',
      stroke: '#000',
      strokeThickness: 6,
      shadow: { offsetX: 0, offsetY: 4, color: '#000', blur: 12, fill: true },
    }).setOrigin(0.5).setAlpha(0);

    // Subtitle
    const sub = this.add.text(w / 2, h * 0.32, 'SUBWAY RUNNER', {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      fontStyle: '900',
      color: '#5be6b7',
      letterSpacing: 8,
    }).setOrigin(0.5).setAlpha(0);

    // Entries animation
    this.tweens.add({
      targets: title,
      alpha: 1,
      y: h * 0.20,
      duration: 600,
      ease: 'Back.easeOut',
    });
    this.tweens.add({
      targets: sub,
      alpha: 0.8,
      duration: 800,
      delay: 300,
    });

    // Best score
    const best = localStorage.getItem(BEST_KEY);
    if (best && Number(best) > 0) {
      this.add.text(w / 2, h * 0.40, `最高分 ${best}`, {
        fontSize: '18px',
        fontFamily: 'Microsoft YaHei, sans-serif',
        color: '#ffd34e',
      }).setOrigin(0.5);
    }

    // Start button
    const btnBg = this.add.rectangle(w / 2, h * 0.55, 200, 54, 0xffd34e, 0.9).setInteractive({ useHandCursor: true });
    btnBg.setStrokeStyle(0, 0xfff5b9, 1);
    btnBg.setShadow(0, 6, '#ffd34e', 20, true, true);

    const btnText = this.add.text(w / 2, h * 0.55, '开始奔跑', {
      fontSize: '22px',
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontStyle: '900',
      color: '#17160d',
    }).setOrigin(0.5);

    btnBg.on('pointerover', () => {
      btnBg.setScale(1.04);
      btnText.setScale(1.04);
    });
    btnBg.on('pointerout', () => {
      btnBg.setScale(1);
      btnText.setScale(1);
    });
    btnBg.on('pointerdown', () => {
      this.cameras.main.fadeOut(300, 7, 16, 20);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('Game');
      });
    });

    // Controls hint
    const hintStyle = {
      fontSize: '13px',
      fontFamily: 'Microsoft YaHei, sans-serif',
      color: '#b8c5bd',
    };

    const keys = [
      'A / ← 左移', 'D / → 右移',
      'W / ↑ / 空格 跳跃', 'S / ↓ 滑铲',
      'P 暂停',
    ];

    const hintBg = this.add.rectangle(w / 2, h * 0.76, 280, 130, 0x0a161c, 0.6);
    hintBg.setStrokeStyle(1, 0x2a4440, 0.5);

    keys.forEach((text, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      this.add.text(w / 2 - 130 + col * 140, h * 0.76 - 40 + row * 28, text, hintStyle).setOrigin(0, 0.5);
    });

    // Enter key shortcut
    this.add.text(w / 2, h * 0.90, '按 Enter 开始', {
      fontSize: '14px', fontFamily: 'Microsoft YaHei, sans-serif',
      color: '#5a7a72',
    }).setOrigin(0.5);

    // Keyboard start
    this.input.keyboard.on('keydown-ENTER', () => {
      this.cameras.main.fadeOut(300, 7, 16, 20);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('Game');
      });
    });

    this.input.keyboard.on('keydown-SPACE', () => {
      this.cameras.main.fadeOut(300, 7, 16, 20);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('Game');
      });
    });

    this.cameras.main.fadeIn(400, 7, 16, 20);
  }
}
