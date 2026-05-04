import Phaser from 'phaser';
import { GROUND_Y } from '../utils/constants.js';

export class Player {
  constructor(scene) {
    this.scene = scene;
    this.lane = 0;
    this.targetLane = 0;
    this.jump = 0;
    this.jumpVelocity = 0;
    this.sliding = 0;
    this.shield = 0;
    this.magnet = 0;
    this.stride = 0;
    this.alive = true;
    this.wasJumping = false; // for landing detection
    this.onLand = null; // callback set by scene

    this.width = 42;
    this.height = 80;

    this.x = scene.scale.width / 2;
    this.y = GROUND_Y;

    // Mobile input flags (set by touch controls)
    this.mobileLeft = false;
    this.mobileRight = false;
    this.mobileJump = false;
    this.mobileSlide = false;

    // Sprite
    this.sprite = scene.add.image(this.x, this.y, 'player');
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setScale(0.18);

    // Shield visual
    this.shieldViz = scene.add.ellipse(0, 0, 72, 92, 0x68a7ff, 0.12);
    this.shieldViz.setStrokeStyle(2, 0x68a7ff, 0.4);
    this.shieldViz.setVisible(false);

    // Keyboard
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.keys = {
      w: scene.input.keyboard.addKey('W'),
      a: scene.input.keyboard.addKey('A'),
      s: scene.input.keyboard.addKey('S'),
      d: scene.input.keyboard.addKey('D'),
      space: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
    };
  }

  update(dt) {
    if (!this.alive) return;

    // Smooth lane movement
    this.lane += (this.targetLane - this.lane) * Math.min(1, dt * 14);

    // Jump physics
    this.jump += this.jumpVelocity * dt;
    this.jumpVelocity -= 2380 * dt;
    if (this.jump <= 0) {
      // Landing detection
      if (this.wasJumping && this.onLand) this.onLand();
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

    // Update sprite
    this.sprite.setPosition(this.x, this.y);
    this.sprite.setScale(0.18);
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

  handleInput() {
    if (!this.alive) return;

    // ── Lane movement ──
    const keyLeft = this.cursors.left.isDown || this.keys.a.isDown;
    const keyRight = this.cursors.right.isDown || this.keys.d.isDown;

    if (keyLeft) {
      this.targetLane = -1;
    } else if (keyRight) {
      this.targetLane = 1;
    } else if (this.mobileLeft) {
      this.targetLane = -1;
    } else if (this.mobileRight) {
      this.targetLane = 1;
    } else {
      this.targetLane = 0;
    }

    // ── Jump ──
    const jumpPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this.keys.w) ||
      Phaser.Input.Keyboard.JustDown(this.keys.space);

    if ((jumpPressed || this.mobileJump) && this.jump <= 1 && this.sliding <= 0) {
      this.jumpVelocity = 820;
    }
    this.mobileJump = false; // one-shot

    // ── Slide ──
    const slidePressed = Phaser.Input.Keyboard.JustDown(this.cursors.down) ||
      Phaser.Input.Keyboard.JustDown(this.keys.s);

    if ((slidePressed || this.mobileSlide) && this.jump <= 4) {
      this.sliding = 0.68;
    }
    this.mobileSlide = false; // one-shot
  }

  getVisualHeight() {
    return this.sliding > 0 ? this.height * 0.52 : this.height;
  }
}
