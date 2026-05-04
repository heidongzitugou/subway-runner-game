import * as Phaser from 'phaser';
import { CONFIG } from '../utils/constants.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create() {
    const w = CONFIG.WIDTH, h = CONFIG.HEIGHT;

    this.add.rectangle(w / 2, h / 2, w, h, 0x4ecdc4);
    const loadText = this.add.text(w / 2, h / 2 - 40, '绘制素材中…', {
      fontSize: '20px', color: '#fff', fontFamily: 'Arial, sans-serif', fontStyle: '900',
    }).setOrigin(0.5);

    const barBg = this.add.rectangle(w / 2, h / 2, 324, 28, 0xffffff, 0.3);
    const bar = this.add.rectangle(w / 2 - 160, h / 2, 0, 22, 0xffd34e).setOrigin(0, 0.5);

    // Use Canvas2D API for all textures
    const tasks = [
      () => this.tex('player', 160, 240, this.paintPlayer),
      () => this.tex('coin', 64, 64, this.paintCoin),
      () => this.tex('shield', 64, 72, this.paintShield),
      () => this.tex('magnet', 64, 64, this.paintMagnet),
      () => this.tex('barrier', 80, 100, this.paintBarrier),
      () => this.tex('gate', 80, 70, this.paintGate),
      () => this.tex('cone', 64, 80, this.paintCone),
      () => this.tex('train', 160, 200, this.paintTrain),
    ];

    let i = 0;
    const next = () => {
      if (i >= tasks.length) {
        loadText.destroy(); barBg.destroy(); bar.destroy();
        this.scene.start('Menu');
        return;
      }
      tasks[i]();
      i++;
      bar.width = (i / tasks.length) * 320;
      this.time.delayedCall(30, next);
    };
    next();
  }

  /** Create a Phaser texture from a Canvas2D drawing function */
  tex(key, w, h, paintFn) {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    paintFn.call(this, ctx, w, h);
    this.textures.addCanvas(key, canvas);
  }

  // ═══════════════════════════════════
  //  Player — Q版跑酷角色
  // ═══════════════════════════════════
  paintPlayer(ctx, w, h) {
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.beginPath();
    ctx.ellipse(w / 2, h - 6, 30, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Shoes
    ctx.fillStyle = '#2d3436';
    this.rr(ctx, 36, h - 32, 28, 18, 7);
    this.rr(ctx, w - 64, h - 30, 28, 16, 7);

    // Legs (joggers)
    const legGrad = ctx.createLinearGradient(0, h - 50, 0, h - 10);
    legGrad.addColorStop(0, '#4a6fa5');
    legGrad.addColorStop(1, '#2d3436');
    ctx.fillStyle = legGrad;
    this.rr(ctx, 42, h - 52, 18, 26, 4);
    this.rr(ctx, w - 60, h - 50, 18, 24, 4);

    // Arms (swinging)
    ctx.fillStyle = '#ff8a5c';
    this.rr(ctx, 8, 58, 20, 38, 8);
    this.rr(ctx, w - 28, 56, 22, 36, 8);
    // Fists
    ctx.fillStyle = '#ffdbac';
    ctx.beginPath();
    ctx.arc(18, 96, 8, 0, Math.PI * 2);
    ctx.arc(w - 18, 92, 8, 0, Math.PI * 2);
    ctx.fill();

    // Body — hoodie
    const hoodieGrad = ctx.createLinearGradient(0, 50, 0, 120);
    hoodieGrad.addColorStop(0, '#5dade2');
    hoodieGrad.addColorStop(0.5, '#2e86c1');
    hoodieGrad.addColorStop(1, '#1b4f72');
    ctx.fillStyle = hoodieGrad;
    this.rr(ctx, 22, 48, w - 44, 72, 12);

    // Hoodie zipper
    ctx.fillStyle = '#1a5276';
    this.rr(ctx, w / 2 - 3, 48, 6, 72, 3);

    // Backpack
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 4;
    ctx.fillStyle = '#e74c3c';
    this.rr(ctx, 12, 54, 20, 42, 7);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#c0392b';
    this.rr(ctx, 14, 58, 16, 14, 4);
    // Backpack pocket
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    this.rr(ctx, 16, 74, 12, 16, 3);

    // Head
    ctx.shadowColor = 'rgba(0,0,0,0.1)';
    ctx.shadowBlur = 6;
    ctx.fillStyle = '#ffdbac';
    ctx.beginPath();
    ctx.arc(w / 2, 32, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Hair
    ctx.fillStyle = '#2d3436';
    this.rr(ctx, w / 2 - 24, 6, 48, 20, 10);
    // Hair fringe
    ctx.beginPath();
    ctx.moveTo(w / 2 - 22, 16);
    ctx.lineTo(w / 2 - 16, 30);
    ctx.lineTo(w / 2, 26);
    ctx.lineTo(w / 2 + 16, 30);
    ctx.lineTo(w / 2 + 22, 16);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#2d3436';
    ctx.beginPath();
    ctx.arc(w / 2 - 9, 30, 4.5, 0, Math.PI * 2);
    ctx.arc(w / 2 + 9, 30, 4.5, 0, Math.PI * 2);
    ctx.fill();
    // Eye shine
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(w / 2 - 7, 28, 2, 0, Math.PI * 2);
    ctx.arc(w / 2 + 11, 28, 2, 0, Math.PI * 2);
    ctx.fill();

    // Mouth
    ctx.strokeStyle = '#2d3436';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(w / 2, 36, 7, 0.15, Math.PI - 0.15);
    ctx.stroke();

    // Headphones
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(w / 2, 32, 24, -Math.PI * 0.8, Math.PI * 0.8);
    ctx.stroke();
  }

  // ═══════════════════════════════════
  //  Coin — 3D 金币
  // ═══════════════════════════════════
  paintCoin(ctx, w, h) {
    const cx = w / 2, cy = h / 2;

    // Outer glow
    const glow = ctx.createRadialGradient(cx, cy, 10, cx, cy, 30);
    glow.addColorStop(0, 'rgba(255,211,78,0.3)');
    glow.addColorStop(1, 'rgba(255,211,78,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, 30, 0, Math.PI * 2);
    ctx.fill();

    // Coin body
    const coinGrad = ctx.createRadialGradient(cx - 8, cy - 8, 4, cx, cy, 24);
    coinGrad.addColorStop(0, '#ffe066');
    coinGrad.addColorStop(0.4, '#ffd34e');
    coinGrad.addColorStop(0.8, '#f0b830');
    coinGrad.addColorStop(1, '#d4941a');
    ctx.fillStyle = coinGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, Math.PI * 2);
    ctx.fill();

    // Border
    ctx.strokeStyle = '#e6a817';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, Math.PI * 2);
    ctx.stroke();

    // Inner ring
    ctx.strokeStyle = 'rgba(255,245,185,0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 16, 0, Math.PI * 2);
    ctx.stroke();

    // $ symbol
    ctx.fillStyle = '#b87d1a';
    ctx.font = 'bold 28px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', cx + 1, cy + 2);

    // Highlight (shine)
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.ellipse(cx - 8, cy - 8, 10, 5, -0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // ═══════════════════════════════════
  //  Shield
  // ═══════════════════════════════════
  paintShield(ctx, w, h) {
    const cx = w / 2;

    // Outer glow
    const glow = ctx.createRadialGradient(cx, h / 2, 4, cx, h / 2, 30);
    glow.addColorStop(0, 'rgba(69,183,209,0.3)');
    glow.addColorStop(1, 'rgba(69,183,209,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, h / 2, 30, 0, Math.PI * 2);
    ctx.fill();

    // Shield shape
    ctx.shadowColor = 'rgba(69,183,209,0.3)';
    ctx.shadowBlur = 10;
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#5dade2');
    grad.addColorStop(0.6, '#2e86c1');
    grad.addColorStop(1, '#1a5276');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(cx, 4);
    ctx.lineTo(cx + 30, 14);
    ctx.lineTo(cx + 30, 38);
    ctx.quadraticCurveTo(cx + 30, h - 4, cx, h - 4);
    ctx.quadraticCurveTo(cx - 30, h - 4, cx - 30, 38);
    ctx.lineTo(cx - 30, 14);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // Border
    ctx.strokeStyle = 'rgba(116,212,232,0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // S emblem
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('S', cx, h / 2 + 4);
  }

  // ═══════════════════════════════════
  //  Magnet
  // ═══════════════════════════════════
  paintMagnet(ctx, w, h) {
    // Glow
    const glow = ctx.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, 30);
    glow.addColorStop(0, 'rgba(255,107,107,0.3)');
    glow.addColorStop(1, 'rgba(255,107,107,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 30, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.shadowColor = 'rgba(255,107,107,0.3)';
    ctx.shadowBlur = 8;
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#ff6b6b');
    grad.addColorStop(1, '#c0392b');
    ctx.fillStyle = grad;
    this.rr(ctx, 18, 4, 28, 18, 6);
    this.rr(ctx, 4, 20, 18, 36, 6);
    this.rr(ctx, 42, 20, 18, 36, 6);
    ctx.shadowBlur = 0;

    // Poles
    ctx.fillStyle = '#e74c3c';
    this.rr(ctx, 8, 24, 10, 28, 4);
    this.rr(ctx, 46, 24, 10, 28, 4);
    // Pole highlights
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    this.rr(ctx, 10, 26, 6, 12, 3);
    this.rr(ctx, 48, 26, 6, 12, 3);
  }

  // ═══════════════════════════════════
  //  Barrier — 路障
  // ═══════════════════════════════════
  paintBarrier(ctx, w, h) {
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.beginPath();
    ctx.ellipse(w / 2, h - 4, w / 2 - 4, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#ff6b6b');
    grad.addColorStop(0.5, '#e74c3c');
    grad.addColorStop(1, '#c0392b');
    ctx.fillStyle = grad;
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 6;
    this.rr(ctx, 6, 8, w - 12, h - 14, 8);
    ctx.shadowBlur = 0;

    // Border
    ctx.strokeStyle = 'rgba(255,71,87,0.6)';
    ctx.lineWidth = 2.5;
    this.rr(ctx, 6, 8, w - 12, h - 14, 8);
    ctx.stroke();

    // Stripes
    ctx.save();
    ctx.beginPath();
    this.rr(ctx, 6, 8, w - 12, h - 14, 8);
    ctx.clip();
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 4;
    for (let i = 0; i < 6; i++) {
      const yy = 14 + i * 16;
      ctx.beginPath();
      ctx.moveTo(8, yy);
      ctx.lineTo(w - 8, yy + 12);
      ctx.stroke();
    }
    ctx.restore();

    // Top highlight
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    this.rr(ctx, 10, 12, w - 20, 14, 4);
    ctx.fill();
  }

  // ═══════════════════════════════════
  //  Gate — 横杆
  // ═══════════════════════════════════
  paintGate(ctx, w, h) {
    // Posts
    const postGrad = ctx.createLinearGradient(0, 0, 0, h);
    postGrad.addColorStop(0, '#feca57');
    postGrad.addColorStop(1, '#e67e22');
    ctx.fillStyle = postGrad;
    this.rr(ctx, 2, 2, 14, h - 4, 4);
    this.rr(ctx, w - 16, 2, 14, h - 4, 4);

    // Top bar
    const barGrad = ctx.createLinearGradient(0, 0, 0, 16);
    barGrad.addColorStop(0, '#ff6b6b');
    barGrad.addColorStop(1, '#c0392b');
    ctx.fillStyle = barGrad;
    ctx.shadowColor = 'rgba(0,0,0,0.15)';
    ctx.shadowBlur = 4;
    ctx.fillRect(10, 2, w - 20, 16);
    ctx.shadowBlur = 0;

    // Warning stripes
    ctx.fillStyle = '#feca57';
    ctx.fillRect(16, 3, w - 32, 6);
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(16, 9, w - 32, 6);
  }

  // ═══════════════════════════════════
  //  Cone — 锥桶
  // ═══════════════════════════════════
  paintCone(ctx, w, h) {
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.beginPath();
    ctx.ellipse(w / 2, h - 6, 26, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cone body
    const coneGrad = ctx.createLinearGradient(0, 0, 0, h);
    coneGrad.addColorStop(0, '#feca57');
    coneGrad.addColorStop(0.7, '#f39c12');
    coneGrad.addColorStop(1, '#d68910');
    ctx.fillStyle = coneGrad;
    ctx.shadowColor = 'rgba(0,0,0,0.15)';
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.moveTo(w / 2, 4);
    ctx.lineTo(w - 4, h - 12);
    ctx.lineTo(4, h - 12);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // Border
    ctx.strokeStyle = 'rgba(231,76,60,0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Reflective stripes
    for (const [y, w2] of [[18, 26], [32, 34], [46, 42]]) {
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      this.rr(ctx, w / 2 - w2 / 2, y, w2, 6, 3);
      ctx.fill();
    }

    // Base
    ctx.fillStyle = '#e67e22';
    this.rr(ctx, 4, h - 14, w - 8, 10, 4);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    this.rr(ctx, 4, h - 14, w - 8, 10, 4);
    ctx.stroke();
  }

  // ═══════════════════════════════════
  //  Train — 地铁车厢
  // ═══════════════════════════════════
  paintTrain(ctx, w, h) {
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.beginPath();
    ctx.ellipse(w / 2, h - 4, w / 2 - 6, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    const bodyGrad = ctx.createLinearGradient(0, 20, 0, h);
    bodyGrad.addColorStop(0, '#4ecdc4');
    bodyGrad.addColorStop(0.4, '#45b7d1');
    bodyGrad.addColorStop(1, '#2e86c1');
    ctx.fillStyle = bodyGrad;
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 8;
    this.rr(ctx, 6, 22, w - 12, h - 28, 10);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Border
    ctx.strokeStyle = 'rgba(69,183,209,0.5)';
    ctx.lineWidth = 2;
    this.rr(ctx, 6, 22, w - 12, h - 28, 10);
    ctx.stroke();

    // Roof
    ctx.fillStyle = '#3498db';
    this.rr(ctx, 4, 18, w - 8, 18, 8);
    ctx.fill();
    ctx.fillStyle = '#2e86c1';
    this.rr(ctx, 10, 16, w - 20, 6, 3);
    ctx.fill();

    // Windshield
    ctx.fillStyle = '#85c1e9';
    this.rr(ctx, 30, 44, w - 60, 28, 8);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    this.rr(ctx, 36, 48, 50, 20, 6);
    ctx.fill();

    // Red stripe
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(6, 90, w - 12, 8);

    // Headlights
    const hlGlow = ctx.createRadialGradient(28, 52, 2, 28, 52, 16);
    hlGlow.addColorStop(0, 'rgba(255,235,59,0.4)');
    hlGlow.addColorStop(1, 'rgba(255,235,59,0)');
    ctx.fillStyle = hlGlow;
    ctx.beginPath();
    ctx.arc(28, 52, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(w - 28, 52, 16, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffeb3b';
    ctx.beginPath();
    ctx.arc(28, 52, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(w - 28, 52, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(26, 48, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(w - 30, 48, 3, 0, Math.PI * 2);
    ctx.fill();

    // Wheels
    ctx.fillStyle = '#2d3436';
    ctx.beginPath();
    ctx.arc(26, h - 14, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(w - 26, h - 14, 12, 0, Math.PI * 2);
    ctx.fill();
    // Wheel hub
    ctx.fillStyle = '#636e72';
    ctx.beginPath();
    ctx.arc(26, h - 14, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(w - 26, h - 14, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Helper: rounded rect ──
  rr(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }
}
