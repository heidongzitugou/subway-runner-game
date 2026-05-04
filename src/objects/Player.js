import * as Phaser from 'phaser';
import { GROUND_Y } from '../utils/constants.js';

export class Player {
  constructor(scene) {
    this.scene = scene;
    this.lane = 0;       // current lane (-1, 0, 1)
    this.targetLane = 0; // moving toward this lane
    this.jump = 0;
    this.jumpVelocity = 0;
    this.sliding = 0;
    this.shield = 0;
    this.magnet = 0;
    this.stride = 0;
    this.alive = true;
    this.wasJumping = false;
    this.onLand = null;

    this.width = 42;
    this.height = 80;

    this.x = scene.scale.width / 2;
    this.y = GROUND_Y;

    // Mobile input flags (one-shot, consumed each frame)
    this.mobileDir = 0; // -1 left, 1 right, 0 none
    this.mobileJump = false;
    this.mobileSlide = false;

    // Sprite
    this.sprite = scene.add.image(this.x, this.y, 'player');
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setScale(0.38);

    // Shield visual
    this.shieldViz = scene.add.ellipse(0, 0, 72, 92, 0x68a7ff, 0.12);
    this.shieldViz.setStrokeStyle(2, 0x68a7ff, 0.4);
    this.shieldViz.setVisible(false);

    // ── Keyboard events (one press = one lane switch) ──
    const kb = scene.input.keyboard;
    kb.on('keydown-A', () => this.moveLeft());
    kb.on('keydown-LEFT', () => this.moveLeft());
    kb.on('keydown-D', () => this.moveRight());
    kb.on('keydown-RIGHT', () => this.moveRight());
    kb.on('keydown-W', () => this.doJump());
    kb.on('keydown-UP', () => this.doJump());
    kb.on('keydown-SPACE', () => this.doJump());
    kb.on('keydown-S', () => this.doSlide());
    kb.on('keydown-DOWN', () => this.doSlide());
  }

  moveLeft() {
    if (this.alive) this.targetLane = Math.max(-1, this.targetLane - 1);
  }

  moveRight() {
    if (this.alive) this.targetLane = Math.min(1, this.targetLane + 1);
  }

  doJump() {
    if (this.alive && this.jump <= 1 && this.sliding <= 0) {
      this.jumpVelocity = 820;
    }
  }

  doSlide() {
    if (this.alive && this.jump <= 4) {
      this.sliding = 0.68;
    }
  }

  update(dt) {
    if (!this.alive) return;

    // Smooth lane movement
    this.lane += (this.targetLane - this.lane) * Math.min(1, dt * 14);

    // Mobile direction (one-shot per frame)
    if (this.mobileDir !== 0) {
      this.targetLane = Math.max(-1, Math.min(1, this.targetLane + this.mobileDir));
      this.mobileDir = 0;
    }
    if (this.mobileJump) { this.doJump(); this.mobileJump = false; }
    if (this.mobileSlide) { this.doSlide(); this.mobileSlide = false; }

    // Jump physics
    this.jump += this.jumpVelocity * dt;
    this.jumpVelocity -= 2380 * dt;
    if (this.jump <= 0) {
      if (this.wasJumping && this.onLand) this.onLand();
      // Landing squash
      if (this.wasJumping && !this._squashing) {
        this._squashing = true;
        this.scene.tweens.add({
          targets: this.sprite,
          scaleX: 0.42, scaleY: 0.32,
          duration: 60,
          yoyo: true,
          ease: 'Bounce.easeOut',
          onComplete: () => { this._squashing = false; },
        });
      }
      this.jump = 0;
      this.jumpVelocity = 0;
      this.wasJumping = false;
    } else {
      this.wasJumping = true;
    }

    this.sliding = Math.max(0, this.sliding - dt);
    this.shield = Math.max(0, this.shield - dt);
    this.magnet = Math.max(0, this.magnet - dt);
    this.stride += dt * 9 * (this.scene.speed || 1);

    // Position
    this.x = this.scene.scale.width / 2 + this.lane * 220;
    this.y = GROUND_Y - this.jump;

    // Sprite
    this.sprite.setPosition(this.x, this.y);
    this.sprite.setScale(0.38);
    this.sprite.setRotation((this.targetLane - this.lane) * 0.12);
    this.sprite.setFlipX(this.targetLane > this.lane);

    // Shield visual
    const visH = this.getVisualHeight();
    this.shieldViz.setPosition(this.x, this.y - visH * 0.48);
    this.shieldViz.setVisible(this.shield > 0);
    if (this.shield > 0) {
      this.shieldViz.setAlpha(0.2 + Math.sin(this.scene.time.now * 0.008) * 0.15);
    }
  }

  getVisualHeight() {
    return this.sliding > 0 ? this.height * 0.52 : this.height;
  }
}
