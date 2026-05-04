import { LANES, SPAWN } from '../utils/constants.js';

export class Spawner {
  constructor(scene) {
    this.scene = scene;
    this.obstacleTimer = 0.6;
    this.coinTimer = 0.5;
    this.powerTimer = 4.0;
  }

  update(dt, speed, objects) {
    this.obstacleTimer -= dt;
    this.coinTimer -= dt;
    this.powerTimer -= dt;

    if (this.obstacleTimer <= 0) {
      this.spawnObstacleGroup(objects);
      this.obstacleTimer = Math.max(SPAWN.OBSTACLE_INTERVAL_MIN,
        SPAWN.OBSTACLE_INTERVAL_MAX - speed * 0.06 - Math.random() * 0.15);
    }

    if (this.coinTimer <= 0) {
      this.spawnCoinLine(objects);
      this.coinTimer = SPAWN.COIN_INTERVAL + Math.random() * 0.9;
    }

    if (this.powerTimer <= 0) {
      this.spawnPowerup(objects);
      this.powerTimer = SPAWN.POWERUP_INTERVAL + Math.random() * 4.5;
    }
  }

  spawnObstacleGroup(objects) {
    const baseLane = LANES[Math.floor(Math.random() * LANES.length)];
    const roll = Math.random();
    const dist = this.scene.distance || 0;
    const speed = this.scene.speed || 1;

    if (roll < 0.18 && speed > 1.25) {
      // Block two lanes (must dodge to the open one)
      const openLane = LANES[Math.floor(Math.random() * LANES.length)];
      for (const lane of LANES) {
        if (lane === openLane) continue;
        objects.push(this.makeObstacle(lane, Math.random() > 0.5 ? 'barrier' : 'gate'));
      }
      return;
    }

    if (roll < 0.34 && dist > 900) {
      // Train
      objects.push(this.makeObstacle(baseLane, 'train'));
      return;
    }

    if (roll < 0.6) {
      objects.push(this.makeObstacle(baseLane, 'barrier'));
      return;
    }

    objects.push(this.makeObstacle(baseLane, Math.random() > 0.5 ? 'gate' : 'cone'));
  }

  makeObstacle(lane, type) {
    const sizes = {
      barrier: { w: 74, h: 82 },
      gate: { w: 88, h: 62 },
      cone: { w: 58, h: 66 },
      train: { w: 108, h: 156 },
    };
    const s = sizes[type];
    return {
      kind: 'obstacle',
      type,
      lane,
      z: 1.5,
      width: s.w,
      height: s.h,
      hit: false,
    };
  }

  spawnCoinLine(objects) {
    const lane = LANES[Math.floor(Math.random() * LANES.length)];
    const arc = Math.random() > 0.45; // more arcs
    const count = arc ? 9 : 6;
    for (let i = 0; i < count; i += 1) {
      let l = lane;
      if (arc) {
        // Arc: start on lane, curve to adjacent lane
        const progress = i / (count - 1);
        const offset = Math.sin(progress * Math.PI) * 1.5;
        l = this.clampLane(lane + (Math.random() > 0.5 ? offset : -offset));
      }
      objects.push({
        kind: 'coin',
        lane: Math.round(l * 10) / 10,
        z: 1.5 + i * 0.055,
        width: 30,
        height: 30,
        hit: false,
        spin: Math.random() * Math.PI * 2,
        pull: 0,
      });
    }
  }

  spawnPowerup(objects) {
    objects.push({
      kind: Math.random() > 0.5 ? 'shield' : 'magnet',
      lane: LANES[Math.floor(Math.random() * LANES.length)],
      z: 1.5,
      width: 38,
      height: 38,
      hit: false,
      spin: 0,
    });
  }

  clampLane(lane) {
    return Math.max(-1, Math.min(1, lane));
  }
}
