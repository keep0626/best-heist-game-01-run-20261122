// player.js — the thief, Wren. Moves with keys or a mouse click target,
// sneaks on Shift, spends credits on tools, and holds F to pick a locked
// display case. Collision is a circle pushed out of every solid rect.

import { PLAYER_SPEED, PLAYER_SNEAK_SPEED, PLAYER_RADIUS, TOOL_SMOKE_COST, TOOL_JAMMER_COST, SMOKE_DURATION, JAMMER_DURATION, LOCKPICK_SECONDS, FLOOR } from './config.js';

export class Player {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.radius = PLAYER_RADIUS;
    this.facing = -Math.PI / 2;
    this.credits = 30;
    this.smokes = 1;
    this.jammers = 1;
    this.walkTarget = null;
    this.lockpicking = null; // loot item being cracked, or null
    this.lockpickProgress = 0;
    this.stepTimer = 0;
    this.moving = false;
  }

  reset(x, y, credits) {
    this.x = x; this.y = y;
    this.credits = credits;
    this.smokes = 1; this.jammers = 1;
    this.walkTarget = null;
    this.lockpicking = null; this.lockpickProgress = 0;
  }

  // Push the circle out of a solid axis-aligned rect. Returns true on hit.
  collideRect(r) {
    const nx = Math.max(r.x, Math.min(this.x, r.x + r.w));
    const ny = Math.max(r.y, Math.min(this.y, r.y + r.h));
    const dx = this.x - nx, dy = this.y - ny;
    const d2 = dx * dx + dy * dy;
    if (d2 >= this.radius * this.radius) return false;
    if (d2 === 0) { this.y = r.y - this.radius; return true; }
    const d = Math.sqrt(d2);
    this.x = nx + (dx / d) * this.radius;
    this.y = ny + (dy / d) * this.radius;
    return true;
  }

  // Keep inside the room; the exit gap is handled by the game, not here.
  clampToFloor(exit) {
    const inExitGap = exit && this.y > exit.y - 4 && this.y < exit.y + exit.h + 4
      && ((exit.x <= FLOOR.x && this.x < FLOOR.x + 40) || (exit.x + exit.w >= FLOOR.x + FLOOR.w && this.x > FLOOR.x + FLOOR.w - 40)
        || (exit.y <= FLOOR.y && this.y < FLOOR.y + 40) || (exit.y + exit.h >= FLOOR.y + FLOOR.h && this.y > FLOOR.y + FLOOR.h - 40));
    if (!inExitGap) {
      this.x = Math.max(FLOOR.x + this.radius, Math.min(FLOOR.x + FLOOR.w - this.radius, this.x));
      this.y = Math.max(FLOOR.y + this.radius, Math.min(FLOOR.y + FLOOR.h - this.radius, this.y));
    } else {
      // Inside the exit doorway the thief may step out through the gap.
      this.x = Math.max(FLOOR.x - 30, Math.min(FLOOR.x + FLOOR.w + 30, this.x));
      this.y = Math.max(FLOOR.y - 30, Math.min(FLOOR.y + FLOOR.h + 30, this.y));
    }
  }

  update(dt, input, solids, sounds) {
    const kv = input.moveVector();
    let vx = 0, vy = 0;
    if (kv.x !== 0 || kv.y !== 0) {
      const speed = input.sneaking ? PLAYER_SNEAK_SPEED : PLAYER_SPEED;
      vx = kv.x * speed; vy = kv.y * speed;
      this.walkTarget = null;
    } else if (this.walkTarget) {
      const dx = this.walkTarget.x - this.x, dy = this.walkTarget.y - this.y;
      const d = Math.hypot(dx, dy);
      if (d < 6) { this.walkTarget = null; }
      else {
        const speed = input.sneaking ? PLAYER_SNEAK_SPEED : PLAYER_SPEED;
        vx = (dx / d) * speed; vy = (dy / d) * speed;
      }
    }
    this.moving = vx !== 0 || vy !== 0;
    if (this.moving) {
      this.facing = Math.atan2(vy, vx);
      this.stepTimer -= dt;
      if (this.stepTimer <= 0) { sounds.step(); this.stepTimer = input.sneaking ? 0.55 : 0.34; }
    }
    this.x += vx * dt;
    this.y += vy * dt;
    for (const r of solids) this.collideRect(r);
    this.clampToFloor(null);
  }

  trySmoke(state) {
    if (this.smokes <= 0 || this.credits < TOOL_SMOKE_COST) return false;
    this.credits -= TOOL_SMOKE_COST;
    this.smokes -= 1;
    state.smokes.push({ x: this.x, y: this.y, r: 95, t: SMOKE_DURATION });
    return true;
  }

  tryJammer(state) {
    if (this.jammers <= 0 || this.credits < TOOL_JAMMER_COST) return false;
    this.credits -= TOOL_JAMMER_COST;
    this.jammers -= 1;
    state.jammerTime = JAMMER_DURATION;
    return true;
  }

  // Hold F near a locked case: progress the pick, finish it when full.
  pickLock(dt, loot, holdingF) {
    if (!loot || !loot.locked) { this.lockpicking = null; this.lockpickProgress = 0; return false; }
    const d = Math.hypot(loot.x - this.x, loot.y - this.y);
    if (d > 56 || !holdingF || this.moving) {
      this.lockpicking = null; this.lockpickProgress = 0; return false;
    }
    this.lockpicking = loot;
    this.lockpickProgress += dt / LOCKPICK_SECONDS;
    if (this.lockpickProgress >= 1) {
      loot.locked = false;
      this.lockpicking = null; this.lockpickProgress = 0;
      return true; // cracked
    }
    return false;
  }
}
