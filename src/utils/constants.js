// ── 游戏常量 ──

export const CONFIG = {
  WIDTH: 960,
  HEIGHT: 640,
  LANE_COUNT: 3,
};

export const LANES = [-1, 0, 1];

export const COLORS = {
  rail: '#ff8c42',
  gold: '#ffd34e',
  green: '#5be6b7',
  red: '#ff4757',
  orange: '#ff8c42',
  blue: '#45b7d1',
  pink: '#ff5d8f',
  white: '#fff8dc',
};

// Subway Surfers-style bright palette
export const PALETTE = {
  SKY_TOP: 0x4ecdc4,
  SKY_MID: 0x87ceeb,
  SKY_BOT: 0xfff8dc,
  BUILDING: [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0xfeca57, 0xa29bfe, 0xfd79a8],
  TRACK: 0xff8c42,
  TRACK_DARK: 0xd4691e,
  RAIL: 0x95a5a6,
  SLEEPER: 0xbdc3c7,
  GRASS: 0x2ecc71,
};

export const LANE_X = [CONFIG.WIDTH * 0.22, CONFIG.WIDTH / 2, CONFIG.WIDTH * 0.78];

export const GROUND_Y = CONFIG.HEIGHT * 0.82;

export const SPEED = {
  MIN: 1,
  MAX: 3.25,
  RAMP_DISTANCE: 18000, // distance to reach max speed (slower ramp)
};

export const SPAWN = {
  OBSTACLE_INTERVAL_MIN: 0.44,
  OBSTACLE_INTERVAL_MAX: 1.05,
  COIN_INTERVAL: 1.0,
  POWERUP_INTERVAL: 6.5,
};

export const MISSION_COIN_TARGET = 20;

export const BEST_KEY = 'subway-runner-best-score';
