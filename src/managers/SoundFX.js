/**
 * 程序化音效生成器（Web Audio API）
 * 无需任何外部音频文件
 */
export class SoundFX {
  constructor() {
    this.ctx = null;
    this.musicGain = null;
    this.musicPlaying = false;
    this.enabled = true;
  }

  _ensure() {
    if (!this.ctx) {
      const C = window.AudioContext || window.webkitAudioContext;
      this.ctx = new C();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.5;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  _osc(type, freq, dur, vol = 0.3) {
    this._ensure();
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, this.ctx.currentTime);
    g.gain.setValueAtTime(vol, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
    o.connect(g);
    g.connect(this.masterGain);
    o.start();
    o.stop(this.ctx.currentTime + dur);
  }

  coin() {
    this._ensure();
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(880, t);
    o.frequency.exponentialRampToValueAtTime(1760, t + 0.08);
    g.gain.setValueAtTime(0.25, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    o.connect(g);
    g.connect(this.masterGain);
    o.start(t);
    o.stop(t + 0.12);
  }

  jump() {
    this._osc('sine', 300, 0.15, 0.15);
    setTimeout(() => {
      this._osc('sine', 500, 0.1, 0.1);
    }, 50);
  }

  slide() {
    this._ensure();
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    const n = this.ctx.createBiquadFilter();
    const g = this.ctx.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(600, t);
    o.frequency.exponentialRampToValueAtTime(100, t + 0.12);
    n.type = 'lowpass';
    n.frequency.setValueAtTime(2000, t);
    n.frequency.exponentialRampToValueAtTime(300, t + 0.12);
    g.gain.setValueAtTime(0.12, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    o.connect(n);
    n.connect(g);
    g.connect(this.masterGain);
    o.start(t);
    o.stop(t + 0.12);
  }

  hit() {
    this._ensure();
    const t = this.ctx.currentTime;
    // Low thud
    const o1 = this.ctx.createOscillator();
    const g1 = this.ctx.createGain();
    o1.type = 'sine';
    o1.frequency.setValueAtTime(150, t);
    o1.frequency.exponentialRampToValueAtTime(40, t + 0.2);
    g1.gain.setValueAtTime(0.4, t);
    g1.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    o1.connect(g1);
    g1.connect(this.masterGain);
    o1.start(t);
    o1.stop(t + 0.2);
    // Noise burst
    const o2 = this.ctx.createOscillator();
    const g2 = this.ctx.createGain();
    o2.type = 'sawtooth';
    o2.frequency.setValueAtTime(80, t);
    g2.gain.setValueAtTime(0.15, t);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    o2.connect(g2);
    g2.connect(this.masterGain);
    o2.start(t);
    o2.stop(t + 0.15);
  }

  powerup() {
    this._ensure();
    const t = this.ctx.currentTime;
    [523, 659, 784].forEach((f, i) => {
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(f, t + i * 0.07);
      g.gain.setValueAtTime(0.2, t + i * 0.07);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.07 + 0.1);
      o.connect(g);
      g.connect(this.masterGain);
      o.start(t + i * 0.07);
      o.stop(t + i * 0.07 + 0.1);
    });
  }

  gameOver() {
    this._ensure();
    const t = this.ctx.currentTime;
    [400, 350, 300, 200].forEach((f, i) => {
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = 'triangle';
      o.frequency.setValueAtTime(f, t + i * 0.15);
      g.gain.setValueAtTime(0.25, t + i * 0.15);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.15 + 0.2);
      o.connect(g);
      g.connect(this.masterGain);
      o.start(t + i * 0.15);
      o.stop(t + i * 0.15 + 0.2);
    });
  }

  milestone() {
    this._ensure();
    const t = this.ctx.currentTime;
    [523, 659, 784, 1047].forEach((f, i) => {
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(f, t + i * 0.1);
      g.gain.setValueAtTime(0.2, t + i * 0.1);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.15);
      o.connect(g);
      g.connect(this.masterGain);
      o.start(t + i * 0.1);
      o.stop(t + i * 0.1 + 0.15);
    });
  }

  startMusic() {
    if (this.musicPlaying) return;
    this._ensure();
    this.musicPlaying = true;
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = 0.06;
    this.musicGain.connect(this.masterGain);

    // Simple chiptune beat loop
    const bpm = 140;
    const beat = 60 / bpm;
    const loopLen = beat * 16;
    const t0 = this.ctx.currentTime;

    const schedule = () => {
      if (!this.musicPlaying) return;
      const now = this.ctx.currentTime;
      const loopPos = ((now - t0) % loopLen + loopLen) % loopLen;

      // Bass on beats 0, 4, 8, 12
      for (let b = 0; b < 16; b += 4) {
        const t = now - loopPos + b * beat;
        if (t < now) continue;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = 'triangle';
        o.frequency.setValueAtTime(110 + (b % 8 === 0 ? 0 : 5), t);
        g.gain.setValueAtTime(0.15, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + beat * 1.5);
        o.connect(g);
        g.connect(this.musicGain);
        o.start(t);
        o.stop(t + beat * 1.5);
      }

      // Hi-hat on 8th notes
      for (let b = 0; b < 32; b++) {
        const t = now - loopPos + b * beat * 0.5;
        if (t < now) continue;
        const o = this.ctx.createOscillator();
        const n = this.ctx.createBiquadFilter();
        const g = this.ctx.createGain();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(4000, t);
        n.type = 'highpass';
        n.frequency.setValueAtTime(5000, t);
        g.gain.setValueAtTime(0.04, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
        o.connect(n);
        n.connect(g);
        g.connect(this.musicGain);
        o.start(t);
        o.stop(t + 0.04);
      }

      this.musicTimer = setTimeout(schedule, beat * 2000);
    };

    schedule();
  }

  stopMusic() {
    this.musicPlaying = false;
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
    if (this.musicGain) {
      this.musicGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
      setTimeout(() => {
        if (this.musicGain) {
          this.musicGain.disconnect();
          this.musicGain = null;
        }
      }, 300);
    }
  }
}

// Singleton
export const sfx = new SoundFX();
