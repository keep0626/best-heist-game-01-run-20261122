// config.js — every shared constant for The Marlow Gallery Heist.
// One place for sizes, colours, speeds and tuning so the other modules
// never hard-code a magic number twice.

export const GAME_TITLE = 'The Marlow Gallery Heist';

export const CANVAS_W = 1280;
export const CANVAS_H = 720;

// Play floor: the HUD bar sits on top, the room fills the rest.
export const HUD_H = 64;
export const FLOOR = { x: 24, y: HUD_H + 16, w: 1232, h: 616 };

export const PLAYER_SPEED = 175; // px per second, walking
export const PLAYER_SNEAK_SPEED = 105; // px per second, holding Shift
export const PLAYER_RADIUS = 13;

export const GUARD_SPEED = 82;
export const GUARD_RADIUS = 14;
export const GUARD_CONE_RANGE = 205;
export const GUARD_CONE_HALF_ANGLE = 0.62; // radians, ~35.5 degrees each side

export const CAMERA_RANGE = 235;
export const CAMERA_CONE_HALF_ANGLE = 0.48;

export const ALARM_MAX = 100;
export const ALARM_GUARD_RATE = 30; // per second while spotted by a guard
export const ALARM_CAMERA_RATE = 24; // per second while spotted by a camera
export const ALARM_DECAY_RATE = 7; // per second while unseen
export const ALARM_SNEAK_FACTOR = 0.45; // sneaking slows how fast the alarm climbs

export const TOOL_SMOKE_COST = 15;
export const TOOL_JAMMER_COST = 20;
export const SMOKE_DURATION = 5; // seconds a smoke cloud hides the thief
export const JAMMER_DURATION = 6; // seconds cameras stay blind
export const LOCKPICK_SECONDS = 2.5; // hold F beside a locked case to crack it

export const START_CREDITS = 30;
export const COIN_VALUE = 5;
export const SMALL_LOOT_VALUE = 10;

// Palette: midnight gallery — deep teal floor, brass trim, warm loot glow.
export const PALETTE = {
  wall: '#2b3a55',
  wallTop: '#3d5170',
  floorA: '#16222e',
  floorB: '#182833',
  floorLine: '#1f303d',
  cover: '#4a3421',
  coverTop: '#6b4c2f',
  plant: '#1e4d33',
  bench: '#5a4632',
  exit: '#1f8a4c',
  exitGlow: '#39d98a',
  loot: '#ffd34d',
  lootGlow: '#ff9d2e',
  guard: '#c94f4f',
  guardCone: 'rgba(255, 84, 84, 0.20)',
  guardConeHot: 'rgba(255, 60, 60, 0.38)',
  camera: '#e8b23a',
  cameraCone: 'rgba(232, 178, 58, 0.20)',
  cameraConeHot: 'rgba(255, 190, 40, 0.38)',
  player: '#7fd4ff',
  playerDark: '#2f7fb8',
  smoke: 'rgba(200, 210, 220, 0.55)',
  hudBg: '#0d141c',
  hudText: '#e8e2d0',
  hudMuted: '#8fa3b5',
  alarmLow: '#39d98a',
  alarmMid: '#ffb02e',
  alarmHigh: '#ff4d4d',
  safe: '#2fae6e',
  danger: '#ff4d4d',
};
