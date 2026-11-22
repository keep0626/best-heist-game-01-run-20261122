// guards.js — patrol guards with vision cones. A guard walks its waypoint
// loop, pauses at each stop, and faces where it walks. Its cone is a
// sector: the thief is spotted only inside the range, inside the angle,
// and with a clear line of sight (no wall, case or plant between).

import { GUARD_SPEED, GUARD_RADIUS, GUARD_CONE_RANGE, GUARD_CONE_HALF_ANGLE } from './config.js';

export function segmentHitsRect(x1, y1, x2, y2, r) {
  // Slab test: does the segment cross the rect (with a small margin)?
  const minX = Math.min(x1, x2), maxX = Math.max(x1, x2);
  const minY = Math.min(y1, y2), maxY = Math.max(y1, y2);
  if (maxX < r.x || minX > r.x + r.w || maxY < r.y || minY > r.y + r.h) return false;
  const dx = x2 - x1, dy = y2 - y1;
  let tmin = 0, tmax = 1;
  if (dx !== 0) {
    let t1 = (r.x - x1) / dx, t2 = (r.x + r.w - x1) / dx;
    if (t1 > t2) [t1, t2] = [t2, t1];
    tmin = Math.max(tmin, t1); tmax = Math.min(tmax, t2);
    if (tmin > tmax) return false;
  } else if (x1 < r.x || x1 > r.x + r.w) return false;
  if (dy !== 0) {
    let t1 = (r.y - y1) / dy, t2 = (r.y + r.h - y1) / dy;
    if (t1 > t2) [t1, t2] = [t2, t1];
    tmin = Math.max(tmin, t1); tmax = Math.min(tmax, t2);
    if (tmin > tmax) return false;
  } else if (y1 < r.y || y1 > r.y + r.h) return false;
  return true;
}

export function lineOfSightBlocked(x1, y1, x2, y2, blockers) {
  for (const b of blockers) {
    if (b.r !== undefined) {
      // Circle blocker (a plant): segment-to-centre distance.
      const dx = x2 - x1, dy = y2 - y1;
      const len2 = dx * dx + dy * dy;
      let t = len2 === 0 ? 0 : ((b.x - x1) * dx + (b.y - y1) * dy) / len2;
      t = Math.max(0, Math.min(1, t));
      const cx = x1 + dx * t, cy = y1 + dy * t;
      if (Math.hypot(b.x - cx, b.y - cy) < b.r) return true;
    } else if (segmentHitsRect(x1, y1, x2, y2, b)) {
      return true;
    }
  }
  return false;
}

export class Guard {
  constructor(def) {
    this.name = def.name;
    this.waypoints = def.waypoints;
    this.pause = def.pause || 1;
    this.wpIndex = 0;
    this.x = def.waypoints[0].x;
    this.y = def.waypoints[0].y;
    this.facing = 0;
    this.waiting = 0;
    this.alerted = false; // currently sees the thief
    this.suspicion = 0; // 0..1, grows while the thief is in the cone
  }

  update(dt) {
    if (this.waiting > 0) {
      this.waiting -= dt;
      if (this.waiting <= 0) this.wpIndex = (this.wpIndex + 1) % this.waypoints.length;
      return;
    }
    const target = this.waypoints[this.wpIndex];
    const dx = target.x - this.x, dy = target.y - this.y;
    const d = Math.hypot(dx, dy);
    if (d < 4) { this.waiting = this.pause; return; }
    const step = Math.min(d, GUARD_SPEED * dt);
    this.x += (dx / d) * step;
    this.y += (dy / d) * step;
    this.facing = Math.atan2(dy, dx);
  }

  // True when the thief stands inside this guard's cone with clear sight.
  canSee(px, py, blockers, inSmoke) {
    if (inSmoke) return false;
    const dx = px - this.x, dy = py - this.y;
    const d = Math.hypot(dx, dy);
    if (d > GUARD_CONE_RANGE || d < 1) return d < 1;
    let diff = Math.atan2(dy, dx) - this.facing;
    while (diff > Math.PI) diff -= 2 * Math.PI;
    while (diff < -Math.PI) diff += 2 * Math.PI;
    if (Math.abs(diff) > GUARD_CONE_HALF_ANGLE) return false;
    return !lineOfSightBlocked(this.x, this.y, px, py, blockers);
  }

  touchDistance(px, py) { return Math.hypot(px - this.x, py - this.y); }
  get radius() { return GUARD_RADIUS; }
}
