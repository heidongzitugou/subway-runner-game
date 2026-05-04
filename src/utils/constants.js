// ── 游戏常量 ──

export const CONFIG = {
  WIDTH: 960,
  HEIGHT: 640,
  LANE_COUNT: 3,
};

export const LANES = [-1, 0, 1];

export const COLORS = {
  rail: '#b8c1bb',
  gold: '#ffd34e',
  green: '#5be6b7',
  red: '#ef4c4f',
  orange: '#f7833d',
  blue: '#68a7ff',
  pink: '#ff5d8f',
  white: '#fff8dc',
};

export const LANE_X = [CONFIG.WIDTH * 0.22, CONFIG.WIDTH / 2, CONFIG.WIDTH * 0.78];

export const GROUND_Y = CONFIG.HEIGHT * 0.82;

export const SPEED = {
  MIN: 1,
  MAX: 3.25,
  RAMP_DISTANCE: 10500, // distance to reach max speed
};

export const SPAWN = {
  OBSTACLE_INTERVAL_MIN: 0.44,
  OBSTACLE_INTERVAL_MAX: 1.05,
  COIN_INTERVAL: 1.0,
  POWERUP_INTERVAL: 6.5,
};

export const MISSION_COIN_TARGET = 20;

export const BEST_KEY = 'subway-runner-best-score';
