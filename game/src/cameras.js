// cameras.js — wall-mounted security cameras. Each sweeps its cone back
// and forth around a base angle. A jammer blinds every camera at once;
// smoke blinds the one whose view crosses the cloud.

import { CAMERA_RANGE, CAMERA_CONE_HALF_ANGLE } from './config.js';
import { lineOfSightBlocked } from './guards.js';

export class Camera {
  constructor(def) {
    this.x = def.x; this.y = def.y;
    this.baseAngle = def.baseAngle;
    this.sweep = def.sweep;
    this.speed = def.speed;
    this.phase = Math.random() * Math.PI * 2;
    this.angle = def.baseAngle;
    this.seeing = false;
  }

  update(dt, time) {
    this.angle = this.baseAngle + Math.sin(time * this.speed + this.phase) * this.sweep;
  }

  canSee(px, py, blockers, jammed, inSmoke) {
    if (jammed || inSmoke) return false;
    const dx = px - this.x, dy = py - this.y;
    const d = Math.hypot(dx, dy);
    if (d > CAMERA_RANGE) return false;
    let diff = Math.atan2(dy, dx) - this.angle;
    while (diff > Math.PI) diff -= 2 * Math.PI;
    while (diff < -Math.PI) diff += 2 * Math.PI;
    if (Math.abs(diff) > CAMERA_CONE_HALF_ANGLE) return false;
    return !lineOfSightBlocked(this.x, this.y, px, py, blockers);
  }
}
