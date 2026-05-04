import * as Phaser from 'phaser';
import { CONFIG, MISSION_COIN_TARGET } from '../utils/constants.js';

export class HUD {
  constructor(scene) {
    this.scene = scene;

    // ── Score panel (top center) ──
    const cx = CONFIG.WIDTH / 2;

    this.scoreText = scene.add.text(cx, 16, '0', {
      fontSize: '48px', fontFamily: 'Arial, sans-serif',
      fontStyle: '900', color: '#ffffff',
      stroke: '#000', strokeThickness: 5,
      shadow: { offsetX: 2, offsetY: 3, color: '#000', blur: 6, fill: true },
    }).setOrigin(0.5, 0).setDepth(50);

    // ── Multiplier (below score) ──
    this.multText = scene.add.text(cx, 66, 'x1.0', {
      fontSize: '20px', fontFamily: 'Arial, sans-serif',
      fontStyle: '900', color: '#ffd34e',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5, 0).setDepth(50);

    // ── Coins (top-right) ──
    this.coinIcon = scene.add.text(CONFIG.WIDTH - 16, 16, '●', {
      fontSize: '28px', color: '#ffd34e',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(1, 0).setDepth(50);

    this.coinText = scene.add.text(CONFIG.WIDTH - 16, 44, '0', {
      fontSize: '24px', fontFamily: 'Arial, sans-serif',
      fontStyle: '900', color: '#fff',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(1, 0).setDepth(50);

    // ── Best score (top-left) ──
    this.bestText = scene.add.text(16, 16, '最高 0', {
      fontSize: '16px', fontFamily: 'Arial, sans-serif',
      fontStyle: '700', color: '#ffffff',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0, 0).setDepth(50);

    // ── Mission (bottom, above controls) ──
    this.missionBg = scene.add.rectangle(CONFIG.WIDTH / 2, CONFIG.HEIGHT - 80, 320, 32, 0x000000, 0.5)
      .setDepth(50);
    this.missionBg.setStrokeStyle(1, 0xffd34e, 0.3);

    this.missionText = scene.add.text(CONFIG.WIDTH / 2, CONFIG.HEIGHT - 80, '', {
      fontSize: '14px', fontFamily: 'Microsoft YaHei, Arial, sans-serif',
      fontStyle: '700', color: '#ffd34e',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(51);

    // ── Pill indicators ──
    const pillStyle = {
      fontSize: '13px', fontFamily: 'Arial, sans-serif',
      fontStyle: '900', color: '#fff',
      stroke: '#000', strokeThickness: 2,
    };
    this.shieldPill = scene.add.text(16, 90, '🛡', {
      fontSize: '18px', stroke: '#000', strokeThickness: 2,
    }).setDepth(50).setAlpha(0);

    this.magnetPill = scene.add.text(52, 90, '🧲', {
      fontSize: '18px', stroke: '#000', strokeThickness: 2,
    }).setDepth(50).setAlpha(0);

    this.comboPill = scene.add.text(CONFIG.WIDTH / 2, CONFIG.HEIGHT * 0.40, '', {
      fontSize: '32px', fontFamily: 'Arial, sans-serif',
      fontStyle: '900', color: '#ffd34e',
      stroke: '#000', strokeThickness: 5,
      shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 8, fill: true },
    }).setOrigin(0.5).setDepth(50).setAlpha(0);
  }

  update(state, player) {
    const score = Math.floor(state.score);
    this.scoreText.setText(String(score));
    this.multText.setText(`x${state.speed.toFixed(1)}`);
    this.coinText.setText(String(state.coins));
    this.bestText.setText(`最高 ${state.best}`);

    // Combo display
    if (state.combo > 1) {
      this.comboPill.setText(`连击 x${state.combo}`);
      this.comboPill.setAlpha(0.8 + Math.sin(this.scene.time.now * 0.01) * 0.2);
    } else {
      this.comboPill.setAlpha(0);
    }

    // Pill indicators
    this.shieldPill.setAlpha(player.shield > 0 ? 1 : 0);
    this.magnetPill.setAlpha(player.magnet > 0 ? 1 : 0);

    // Mission
    this.missionText.setText(
      state.missionComplete
        ? '✅ 任务完成！速度提升更快！'
        : `🎯 收集金币 ${Math.min(MISSION_COIN_TARGET, state.coins)}/${MISSION_COIN_TARGET}`
    );
  }
}
