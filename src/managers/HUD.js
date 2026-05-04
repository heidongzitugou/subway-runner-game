import Phaser from 'phaser';
import { CONFIG, COLORS, MISSION_COIN_TARGET } from '../utils/constants.js';

export class HUD {
  constructor(scene) {
    this.scene = scene;
    const style = {
      fontSize: '22px',
      fontFamily: 'Arial, Microsoft YaHei, sans-serif',
      fontStyle: '900',
      color: '#fff8c2',
      stroke: '#000',
      strokeThickness: 3,
    };
    const labelStyle = {
      fontSize: '12px',
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontStyle: '800',
      color: '#b8c5bd',
    };
    const pillStyle = {
      fontSize: '13px',
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontStyle: '900',
      color: '#eef8ef',
      stroke: '#000',
      strokeThickness: 2,
    };

    // HUD backgrounds
    const x = 14;
    const y = 14;
    const gap = 8;
    const pw = 150;

    this.createPanel(x, y, pw, '分数', 'score', '0');
    this.createPanel(x + pw + gap, y, pw, '金币', 'coins', '0');
    this.createPanel(x + (pw + gap) * 2, y, pw, '倍率', 'speed', '1.0x');
    this.createPanel(x + (pw + gap) * 3, y, pw, '最佳', 'best', '0');

    // Pill indicators
    this.shieldPill = scene.add.text(14, 90, '', pillStyle).setAlpha(0);
    this.magnetPill = scene.add.text(170, 90, '', pillStyle).setAlpha(0);
    this.comboPill = scene.add.text(326, 90, '', pillStyle).setAlpha(0);

    // Mission text
    this.missionText = scene.add.text(CONFIG.WIDTH - 14, CONFIG.HEIGHT - 14, '', {
      fontSize: '13px',
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontStyle: '700',
      color: '#e4eddc',
      stroke: '#000',
      strokeThickness: 2,
    }).setOrigin(1, 1).setAlpha(0.85);
  }

  createPanel(x, y, w, label, key, initial) {
    const scene = this.scene;
    const bg = scene.add.rectangle(x + w / 2, y + 28, w, 52, 0x071014, 0.72);
    bg.setStrokeStyle(1, 0x2a4440, 0.4);
    bg.setOrigin(0.5);

    scene.add.text(x + 11, y + 6, label, {
      fontSize: '12px', fontFamily: 'Microsoft YaHei, sans-serif',
      fontStyle: '800', color: '#b8c5bd',
    });

    this[key] = scene.add.text(x + 11, y + 22, initial, {
      fontSize: '22px', fontFamily: 'Arial, sans-serif',
      fontStyle: '900', color: '#fff8c2',
      stroke: '#000', strokeThickness: 2,
    });
  }

  update(state, player) {
    const score = Math.floor(state.score);
    this.score.setText(String(score));
    this.coins.setText(String(state.coins));
    this.speed.setText(`${state.speed.toFixed(1)}x`);
    this.best.setText(String(Math.max(state.best, score)));

    // Pill indicators
    this.shieldPill.setText(`护盾 ${Math.ceil(player.shield)}s`);
    this.shieldPill.setAlpha(player.shield > 0 ? 1 : 0);

    this.magnetPill.setText(`磁铁 ${Math.ceil(player.magnet)}s`);
    this.magnetPill.setAlpha(player.magnet > 0 ? 1 : 0);

    this.comboPill.setText(`连击 x${state.combo}`);
    this.comboPill.setAlpha(state.combo > 1 ? 1 : 0);

    this.missionText.setText(
      state.missionComplete
        ? '奖励已触发：速度提升更快，金币连击分数翻倍。'
        : `收集 ${MISSION_COIN_TARGET} 枚金币，解锁速度奖励：${Math.min(MISSION_COIN_TARGET, state.coins)}/${MISSION_COIN_TARGET}`
    );
  }
}
