// alarm.js — the alarm meter. Being seen fills it (guards faster than
// cameras, sneaking slows the climb); hiding drains it. At 100 the crew
// is burned and the run ends. The meter also reports its danger band
// for the HUD and the music.

import { ALARM_MAX, ALARM_GUARD_RATE, ALARM_CAMERA_RATE, ALARM_DECAY_RATE, ALARM_SNEAK_FACTOR } from './config.js';

export class Alarm {
  constructor() {
    this.value = 0;
    this.spottedByGuard = false;
    this.spottedByCamera = false;
  }

  update(dt, seenByGuard, seenByCamera, sneaking) {
    this.spottedByGuard = seenByGuard;
    this.spottedByCamera = seenByCamera;
    const sneak = sneaking ? ALARM_SNEAK_FACTOR : 1;
    if (seenByGuard) this.value += ALARM_GUARD_RATE * sneak * dt;
    else if (seenByCamera) this.value += ALARM_CAMERA_RATE * sneak * dt;
    else this.value -= ALARM_DECAY_RATE * dt;
    if (this.value < 0) this.value = 0;
    if (this.value > ALARM_MAX) this.value = ALARM_MAX;
  }

  get tripped() { return this.value >= ALARM_MAX; }

  get band() {
    if (this.value >= 70) return 'high';
    if (this.value >= 35) return 'mid';
    return 'low';
  }

  reset() { this.value = 0; this.spottedByGuard = false; this.spottedByCamera = false; }
}
