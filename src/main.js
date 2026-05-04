import * as Phaser from 'phaser';
import { BootScene } from './scenes/Boot.js';
import { MenuScene } from './scenes/Menu.js';
import { GameScene } from './scenes/Game.js';
import { GameOverScene } from './scenes/GameOver.js';

const config = {
  type: Phaser.AUTO,
  width: 960,
  height: 640,
  parent: 'game-container',
  backgroundColor: '#071014',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: [BootScene, MenuScene, GameScene, GameOverScene],
  input: {
    activePointers: 3,
  },
};

const game = new Phaser.Game(config);
